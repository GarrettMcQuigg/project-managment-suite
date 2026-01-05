'use client';

import React, { useEffect, useState, useRef } from 'react';
import useSWR, { mutate } from 'swr';
import { swrFetcher, fetcher } from '@/packages/lib/helpers/fetcher';
import type { ProjectWithMetadata } from '@/packages/lib/prisma/types';
import { API_AUTH_PORTAL_GET_BY_ID_ROUTE, API_PROJECT_CHECKPOINT_MESSAGES_SEND_ROUTE } from '@/packages/lib/routes';
import { format } from 'date-fns';
import { MessageCircle, Paperclip, Send, X, File, ImageIcon, Download, Target, ArrowLeft, Sparkles } from 'lucide-react';
import Image from 'next/image';
import ImageLoader from '../../_src/image-loader';
import type { Checkpoint } from '@prisma/client';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { routeWithParam, PROJECT_PORTAL_ROUTE, PROJECT_PORTAL_CHECKPOINT_ROUTE } from '@/packages/lib/routes';
import AttachmentPreviewModal from './attachment-preview-modal';
import AttachmentPreviewModalMobile from './attachment-preview-modal-mobile';
import MessageAttachment from './message-attachment';
import MessageReference from '@/packages/lib/components/message-reference';
import MessageBubble from '@/packages/lib/components/message-bubble';
import MessageBubbleMobile from '@/packages/lib/components/message-bubble-mobile';
import { useSearchParams, useRouter } from 'next/navigation';

interface CheckpointMessage {
  id: string;
  checkpointId?: string;
  text: string;
  sender?: string;
  createdAt: string;
  attachments?: Array<{
    id: string;
    blobUrl: string;
    pathname: string;
    contentType: string;
  }>;
  isAutoReference?: boolean;
  referencedAttachmentId?: string;
  referencedMarkupId?: string;
}

interface CheckpointMessagesProps {
  projectId: string;
  checkpoint: Checkpoint;
  project: ProjectWithMetadata;
  isOwner: boolean;
  ownerName: string;
  currentUserName: string;
}

export default function CheckpointMessages({ projectId, checkpoint, project, isOwner, ownerName, currentUserName }: CheckpointMessagesProps) {
  const endpoint = API_AUTH_PORTAL_GET_BY_ID_ROUTE + projectId;
  const { data } = useSWR(endpoint, swrFetcher);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Callback to refresh messages when a comment is created
  const handleCommentCreated = () => {
    mutate(endpoint);
  };

  const [messages, setMessages] = useState<CheckpointMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<any>(null);
  const [focusedMarkupId, setFocusedMarkupId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textInputRef = useRef<HTMLInputElement | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (data) {
      loadCheckpointMessages(data.content);
    }
  }, [data]);

  // Handle query parameters for auto-opening attachment modal
  useEffect(() => {
    if (!data) return;

    const attachmentId = searchParams.get('attachment');
    const markupId = searchParams.get('markup');

    if (attachmentId) {
      // Find the attachment in the messages
      const allAttachments = data.content.checkpointMessages
        ?.filter((msg: CheckpointMessage) => msg.checkpointId === checkpoint.id)
        .flatMap((msg: CheckpointMessage) => msg.attachments || []);

      const attachment = allAttachments?.find((att: any) => att.id === attachmentId);

      if (attachment) {
        setSelectedAttachment(attachment);
        if (markupId) {
          setFocusedMarkupId(markupId);
        }

        // Clear query params from URL after opening
        const newUrl = routeWithParam(PROJECT_PORTAL_CHECKPOINT_ROUTE, {
          id: projectId,
          portalSlug: project.portalSlug,
          checkpointId: checkpoint.id
        });
        router.replace(newUrl, { scroll: false });
      }
    }
  }, [data, searchParams, checkpoint.id, projectId, project.portalSlug, router]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadCheckpointMessages = (project: any) => {
    const checkpointMessages = project.checkpointMessages?.filter((message: CheckpointMessage) => message.checkpointId === checkpoint.id) || [];

    const sortedMessages = checkpointMessages.sort((a: CheckpointMessage, b: CheckpointMessage) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    setMessages(sortedMessages);

    // Scroll to bottom after messages load
    setTimeout(() => {
      scrollMessagesToBottom();
    }, 100);
  };

  const scrollMessagesToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmitMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const messageText = newMessage.trim();

    if (!messageText && files.length === 0) return;
    if (sendingMessage) return;

    setSendingMessage(true);

    try {
      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('checkpointId', checkpoint.id);
      formData.append('text', messageText || '');

      files.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await fetcher({
        url: API_PROJECT_CHECKPOINT_MESSAGES_SEND_ROUTE,
        formData
      });

      if (response.err) {
        toast.error('Failed to send message');
        return;
      }

      setNewMessage('');
      setFiles([]);

      mutate(endpoint);

      setTimeout(() => {
        scrollMessagesToBottom();
        textInputRef.current?.focus();
      }, 1000);

      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('An error occurred while sending your message');
    } finally {
      setSendingMessage(false);
    }
  };

  const checkpointIndex = project.checkpoints.sort((a, b) => a.order - b.order).findIndex((c) => c.id === checkpoint.id);

  return (
    <>
      <div className="mb-4">
        <Link
          href={routeWithParam(PROJECT_PORTAL_ROUTE, {
            id: projectId,
            portalSlug: project.portalSlug || ''
          })}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all duration-300 hover:gap-3 mb-4 group"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Back to Timeline</span>
        </Link>
      </div>

      {/* Main Content - Chat Focus */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 border border-border rounded-lg shadow-md overflow-hidden flex flex-col">
          <div className="border-b border-border px-4 py-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">Checkpoint Messages</h3>
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      <span>
                        {messages.length} message{messages.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={messageContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 lg:min-h-[550px] lg:max-h-[650px] max-h-[550px]">
            {messages.length > 0 ? (
              messages.map((message) => {
                const isOwnMessage = message.sender === currentUserName;

                // Render auto-reference messages differently
                if (message.isAutoReference && message.referencedAttachmentId) {
                  const checkpointRoute = routeWithParam(PROJECT_PORTAL_CHECKPOINT_ROUTE, {
                    id: projectId,
                    portalSlug: project.portalSlug,
                    checkpointId: checkpoint.id
                  });

                  const href = `${checkpointRoute}?attachment=${message.referencedAttachmentId}${message.referencedMarkupId ? `&markup=${message.referencedMarkupId}` : ''}`;
                  const icon = message.referencedMarkupId ? ('markup' as const) : ('attachment' as const);

                  return (
                    <div key={message.id} className="my-2">
                      <MessageReference text={message.text} timestamp={message.createdAt} href={href} icon={icon} />
                    </div>
                  );
                }

                // Generate avatar data
                const getAvatarData = (name: string) => {
                  const nameParts = name
                    .trim()
                    .split(' ')
                    .filter((part) => part.length > 0);
                  let initials: string;

                  if (nameParts.length === 0) {
                    initials = '?';
                  } else if (nameParts.length === 1) {
                    initials = nameParts[0].slice(0, 2).toUpperCase();
                  } else {
                    initials = nameParts
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase();
                  }

                  // Generate consistent color based on name
                  const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-red-500', 'bg-pink-500', 'bg-orange-500', 'bg-purple-500'];
                  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

                  return {
                    initials,
                    color: isOwnMessage ? 'bg-primary' : colors[colorIndex]
                  };
                };

                const avatarData = getAvatarData(message.sender || '');

                const attachmentNodes =
                  message.attachments && message.attachments.length > 0 ? (
                    <div className="space-y-2">
                      {message.attachments.map((attachment) => (
                        <MessageAttachment key={attachment.id} attachment={attachment} isOwnerMessage={isOwnMessage} onClick={() => setSelectedAttachment(attachment)} />
                      ))}
                    </div>
                  ) : undefined;

                return (
                  <React.Fragment key={message.id}>
                    {/* Mobile View - Show below sm breakpoint */}
                    <div className="sm:hidden">
                      <MessageBubbleMobile
                        author={message.sender || ''}
                        currentUserName={currentUserName}
                        timestamp={message.createdAt}
                        message={message.text || ''}
                        avatarInitials={avatarData.initials}
                        avatarColor={avatarData.color}
                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                        attachments={attachmentNodes}
                      />
                    </div>

                    {/* Desktop View - Show at sm breakpoint and above */}
                    <div className="hidden sm:block">
                      <MessageBubble
                        author={message.sender || ''}
                        currentUserName={currentUserName}
                        timestamp={message.createdAt}
                        message={message.text || ''}
                        avatarInitials={avatarData.initials}
                        avatarColor={avatarData.color}
                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                        attachments={attachmentNodes}
                      />
                    </div>
                  </React.Fragment>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center">
                      <MessageCircle className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-foreground mb-2">No messages yet</p>
                  <p className="text-sm text-muted-foreground">Start the conversation about this checkpoint</p>
                </div>
              </div>
            )}
          </div>

          {files.length > 0 && (
            <div className="border-t border-border px-4 py-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                <ImageIcon className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {files.length} file{files.length > 1 ? 's' : ''} ready to send
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {files.map((file, index) => {
                  const isImage = file.type.startsWith('image/');
                  return (
                    <div
                      key={index}
                      className="relative bg-card/80 backdrop-blur-sm rounded-xl border border-border/30 shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer"
                    >
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-destructive/80 hover:bg-destructive text-destructive-foreground flex items-center justify-center text-sm transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                      {isImage ? (
                        <div className="relative">
                          <Image src={URL.createObjectURL(file) || '/placeholder.svg'} alt={file.name} className="w-20 h-20 object-cover rounded-t-xl" width={80} height={80} />
                          <div className="px-2 py-1 bg-card/90">
                            <span className="text-xs font-medium text-card-foreground truncate block max-w-16">{file.name}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center p-3 w-20">
                          <File className="h-8 w-8 text-muted-foreground mb-1" />
                          <span className="text-xs font-medium text-card-foreground truncate block max-w-16 text-center">{file.name}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="border-t border-border px-3 sm:px-4 py-2 sm:py-3 flex-shrink-0">
            <form onSubmit={handleSubmitMessage} className="flex items-center gap-x-2">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="image/*,.pdf,.doc,.docx,.txt" />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 p-2 text-muted-foreground hover:text-primary hover:bg-muted border border-border rounded-lg transition-colors"
              >
                <Paperclip className="h-5 w-5" />
              </button>

              <input
                type="text"
                ref={textInputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 w-1/2 sm:w-full rounded-lg border border-input focus:border-ring focus:outline-none bg-background text-foreground placeholder-muted-foreground text-sm"
                disabled={sendingMessage}
              />

              <button
                type="submit"
                disabled={sendingMessage || (!newMessage.trim() && files.length === 0)}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sendingMessage ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </form>
          </div>
        </div>

        <div className="xl:col-span-1 space-y-4">
          <div className="border border-border rounded-lg p-5 shadow-md">
            <p className="font-bold text-foreground mb-1 text-lg">{project.name}</p>
            {project.description && <p className="text-muted-foreground text-xs leading-relaxed">{project.description}</p>}
          </div>

          <div className="border border-border rounded-lg p-5 shadow-md">
            <p className="font-bold text-foreground mb-1 text-lg">{checkpoint.name || `Checkpoint ${checkpointIndex + 1}`}</p>
            <p className="text-muted-foreground text-xs leading-relaxed">{checkpoint.description || 'No description'}</p>
          </div>
          <div className="border border-border rounded-lg p-5 shadow-md">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-lg">Checkpoint Info</h3>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-card/80 backdrop-blur-sm rounded-xl border border-border/50">
                <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <p className="font-semibold capitalize text-foreground">{checkpoint.status.toLowerCase().replace('_', ' ')}</p>
                </div>
              </div>
              <div className="p-3 bg-card/80 backdrop-blur-sm rounded-xl border border-border/50">
                <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">Timeline</p>
                <p className="font-semibold text-foreground">
                  {format(new Date(checkpoint.startDate), 'MMM d')} - {format(new Date(checkpoint.endDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="p-3 bg-card/80 backdrop-blur-sm rounded-xl border border-border/50">
                <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">Order</p>
                <p className="font-semibold text-foreground">Checkpoint {checkpointIndex + 1}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setPreviewFile(null)}>
          <div className="relative border border-border rounded-3xl shadow-2xl max-w-5xl max-h-[90vh] w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary rounded-xl shadow-md">
                  {previewFile.type.startsWith('image/') ? <ImageIcon className="h-5 w-5 text-white" /> : <File className="h-5 w-5 text-white" />}
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{previewFile.name}</h3>
                  <p className="text-sm text-muted-foreground">{previewFile.size > 0 ? `${(previewFile.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const url = (previewFile as File & { blobUrl: string }).blobUrl || URL.createObjectURL(previewFile);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = previewFile.name;
                    a.click();
                    if (!(previewFile as File & { blobUrl: string }).blobUrl) {
                      URL.revokeObjectURL(url);
                    }
                  }}
                  className="p-2.5 hover:bg-primary/10 rounded-xl transition-all duration-300 border border-transparent hover:border-primary/30"
                >
                  <Download className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                </button>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-2.5 hover:bg-destructive/10 rounded-xl transition-all duration-300 border border-transparent hover:border-destructive/30"
                >
                  <X className="h-5 w-5 text-muted-foreground hover:text-destructive transition-colors" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(90vh-80px)] overflow-auto">
              {previewFile.type.startsWith('image/') ? (
                <div className="flex items-center justify-center">
                  <Image
                    src={(previewFile as File & { blobUrl: string }).blobUrl || '/placeholder.svg'}
                    alt={previewFile.name}
                    className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
                    width={1200}
                    height={900}
                    loader={ImageLoader}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-indigo-500/20 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <File className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">File Preview</h3>
                  <p className="text-muted-foreground mb-6">This file type cannot be previewed directly. Download to view the content.</p>
                  <button
                    onClick={() => {
                      const url = (previewFile as File & { blobUrl: string }).blobUrl || URL.createObjectURL(previewFile);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = previewFile.name;
                      a.click();
                      if (!(previewFile as File & { blobUrl: string }).blobUrl) {
                        URL.revokeObjectURL(url);
                      }
                    }}
                    className="px-6 py-3 bg-gradient-to-br from-primary via-primary/90 to-indigo-500 text-primary-foreground rounded-xl hover:shadow-md hover:shadow-primary/25 transition-all duration-300 font-semibold"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attachment Preview Modal with Markup Tools */}
      {selectedAttachment &&
        (isMobile ? (
          <AttachmentPreviewModalMobile
            attachment={selectedAttachment}
            projectId={projectId}
            checkpointId={checkpoint.id}
            isOwner={isOwner}
            ownerName={ownerName}
            currentUserName={currentUserName}
            onClose={() => {
              setSelectedAttachment(null);
              setFocusedMarkupId(null);
            }}
            initialFocusedMarkupId={focusedMarkupId}
            onCommentCreated={handleCommentCreated}
          />
        ) : (
          <AttachmentPreviewModal
            attachment={selectedAttachment}
            projectId={projectId}
            checkpointId={checkpoint.id}
            isOwner={isOwner}
            ownerName={ownerName}
            currentUserName={currentUserName}
            onClose={() => {
              setSelectedAttachment(null);
              setFocusedMarkupId(null);
            }}
            initialFocusedMarkupId={focusedMarkupId}
            onCommentCreated={handleCommentCreated}
          />
        ))}
    </>
  );
}

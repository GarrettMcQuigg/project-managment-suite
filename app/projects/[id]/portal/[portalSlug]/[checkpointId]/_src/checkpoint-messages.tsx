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
import { routeWithParam, PROJECT_PORTAL_ROUTE } from '@/packages/lib/routes';
import AttachmentPreviewModal from './attachment-preview-modal';
import MessageAttachment from './message-attachment';

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
}

interface CheckpointMessagesProps {
  projectId: string;
  checkpoint: Checkpoint;
  project: ProjectWithMetadata;
  isOwner: boolean;
}

export default function CheckpointMessages({ projectId, checkpoint, project, isOwner }: CheckpointMessagesProps) {
  const endpoint = API_AUTH_PORTAL_GET_BY_ID_ROUTE + projectId;
  const { data } = useSWR(endpoint, swrFetcher);

  const [messages, setMessages] = useState<CheckpointMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textInputRef = useRef<HTMLInputElement | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (data) {
      loadCheckpointMessages(data.content);
    }
  }, [data]);

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
    <div className="max-h-screen-minus-header">
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

        <div className="relative border border-border rounded-lg p-6 shadow-md overflow-hidden">
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="w-fit h-fit bg-primary rounded-lg p-3 shadow-md shadow-primary/25">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{checkpoint.name || `Checkpoint ${checkpointIndex + 1}`}</h1>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-sm font-medium text-primary">Active Discussion</span>
                  </div>
                </div>
              </div>

              {checkpoint.description && <p className="text-muted-foreground leading-relaxed text-lg">{checkpoint.description}</p>}
            </div>
          </div>
        </div>
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
          <div ref={messageContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length > 0 ? (
              messages.map((message) => {
                return (
                  <div key={message.id} className={`flex ${isOwner ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                    <div className="max-w-[85%]">
                      {!isOwner && <p className="text-xs font-medium text-muted-foreground px-3 mb-1">{message.sender || 'Anonymous'}</p>}

                      <div className={`px-3 py-2 rounded-xl shadow-sm ${isOwner ? 'bg-primary text-white rounded-br-md' : 'bg-muted text-card-foreground rounded-bl-md'}`}>
                        {message.text && message.text.trim() && <p className="text-sm leading-relaxed break-words">{message.text}</p>}

                        {message.attachments && message.attachments.length > 0 && (
                          <div className={`space-y-3 ${message.text ? 'mt-3' : ''}`}>
                            {message.attachments.map((attachment) => (
                              <MessageAttachment
                                key={attachment.id}
                                attachment={attachment}
                                isOwnerMessage={isOwner}
                                onClick={() => setSelectedAttachment(attachment)}
                              />
                            ))}
                          </div>
                        )}

                        <p className={`text-xs mt-1 ${isOwner ? 'text-white/70' : 'text-muted-foreground'}`}>{format(new Date(message.createdAt), 'MMM d, h:mm a')}</p>
                      </div>
                    </div>
                  </div>
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

          <div className="border-t border-border px-4 py-3 flex-shrink-0">
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
                className="flex-1 px-3 py-2 rounded-lg border border-input focus:border-ring focus:outline-none bg-background text-foreground placeholder-muted-foreground text-sm"
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
            <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
              <div className="p-1.5 bg-primary rounded-lg">
                <Target className="h-4 w-4 text-white" />
              </div>
              Checkpoint Info
            </h3>
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

          <div className="border border-border rounded-lg p-5 shadow-md">
            <p className="font-semibold text-foreground mb-1 text-lg">{project.name}</p>
            {project.description && <p className="text-muted-foreground text-xs leading-relaxed">{project.description}</p>}
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
      {selectedAttachment && (
        <AttachmentPreviewModal
          attachment={selectedAttachment}
          projectId={projectId}
          checkpointId={checkpoint.id}
          isOwner={isOwner}
          onClose={() => setSelectedAttachment(null)}
        />
      )}
    </div>
  );
}

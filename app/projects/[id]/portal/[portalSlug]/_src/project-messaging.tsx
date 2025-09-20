'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, ImageIcon, File, MessageSquare, MessageCircleCode, Users, Clapperboard, Play, FileText, Table, X, Download } from 'lucide-react';
import { fetcher, swrFetcher } from '@/packages/lib/helpers/fetcher';
import useSWR, { mutate } from 'swr';
import { toast } from 'react-toastify';
import { API_PROJECT_MESSAGES_LIST_ROUTE, API_PROJECT_MESSAGES_SEND_ROUTE } from '@/packages/lib/routes';
import type { User } from '@prisma/client';
import Image from 'next/image';
import ImageLoader from './image-loader';
import { ProjectWithMetadata } from '@/packages/lib/prisma/types';

interface ProjectMessage {
  id: string;
  projectId: string;
  sender: string;
  text: string;
  attachments: Array<{
    id: string;
    blobUrl: string;
    pathname: string;
    contentType: string;
  }>;
  createdAt: string;
}

export type PortalContext = {
  type: 'user' | 'portal';
  user?: User;
  visitor?: { id: string; name: string; projectId: string; portalSlug: string; createdAt: Date };
};

interface ProjectMessagingProps {
  project: ProjectWithMetadata;
  isOwner?: boolean;
  context: PortalContext;
}

export default function ProjectMessaging({ project, isOwner = false, context }: ProjectMessagingProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const endpoint = API_PROJECT_MESSAGES_LIST_ROUTE + project.id;
  const { data } = useSWR<{ content: ProjectMessage[] }>(endpoint, swrFetcher, {
    refreshInterval: 10000
  });

  const messages = data?.content || [];

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((files) => files.filter((_, index) => index !== indexToRemove));
  };

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.type.startsWith('image/')) {
          URL.revokeObjectURL(URL.createObjectURL(file));
        }
      });
    };
  }, [files]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() && files.length === 0) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('projectId', project.id);
      formData.append('text', message);

      files.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await fetcher({
        url: API_PROJECT_MESSAGES_SEND_ROUTE,
        formData
      });

      if (response.err) {
        toast.error('Failed to send message');
        return;
      }

      setMessage('');
      setFiles([]);
      mutate(endpoint);

      setTimeout(scrollToBottom, 100);

      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('An error occurred while sending your message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentUserName = () => {
    return context.user ? `${context.user.firstname} ${context.user.lastname}` : context.visitor?.name || 'You';
  };

  const isCurrentUserMessage = (sender: string) => {
    return sender === getCurrentUserName();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarGradient = (name: string) => {
    // Current user gets grey background
    if (isCurrentUserMessage(name)) {
      return 'from-slate-100 to-slate-300 text-gray-600';
    }
    // All other users get indigo gradient
    return 'from-indigo-500 to-indigo-600 text-white';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const shouldShowAvatar = (currentIndex: number) => {
    if (currentIndex === messages.length - 1) return true;
    return messages[currentIndex].sender !== messages[currentIndex + 1].sender;
  };

  const shouldShowSender = (currentIndex: number) => {
    if (currentIndex === 0) return true;
    return messages[currentIndex].sender !== messages[currentIndex - 1].sender;
  };

  const uniqueSenders = [...new Set(messages.map((m) => m.sender))];

  // Helper to create a File-like object from message attachment for preview
  const createPreviewFileFromAttachment = (attachment: { blobUrl: string; pathname: string; contentType: string }) => {
    const fileName = attachment.pathname.split('/').pop() || 'Attachment';
    // Create a mock File object for preview
    return {
      name: fileName,
      type: attachment.contentType,
      size: 0, // Size not available for message attachments
      blobUrl: attachment.blobUrl
    };
  };

  return (
    <div className="flex flex-col max-h-[500px] sm:max-h-[700px] lg:max-h-[972px]">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">Messages</h3>
              <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{uniqueSenders.length} participants</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircleCode className="h-4 w-4 text-primary" />
                  <span>{messages.length} messages</span>
                </div>
              </div>
            </div>
          </div>
          {isOwner && <div className="hidden sm:block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">Owner</div>}
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-3 min-h-0 pb-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-card-foreground mb-2">Start the conversation</p>
                <p className="text-muted-foreground">Send your first message to get things rolling!</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isOwn = isCurrentUserMessage(msg.sender);
              const showAvatar = shouldShowAvatar(index);
              const showSender = shouldShowSender(index);

              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[85%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end sm:space-x-2`}>
                    {/* Avatar */}
                    <div className={`hidden sm:flex flex-shrink-0 ${isOwn ? 'ml-2' : 'mr-2'}`}>
                      {showAvatar ? (
                        <div className={`w-8 h-8 rounded-full flex bg-gradient-to-br ${getAvatarGradient(msg.sender)} items-center justify-center text-xs font-bold`}>
                          {getInitials(msg.sender)}
                        </div>
                      ) : (
                        <div className="w-8 h-8"></div>
                      )}
                    </div>

                    {/* Message bubble */}
                    <div className="space-y-1">
                      {!isOwn && showSender && <p className="text-xs font-medium text-muted-foreground px-3">{msg.sender}</p>}

                      <div className={`px-3 py-2 rounded-xl shadow-sm ${isOwn ? 'bg-primary text-white rounded-br-md' : 'bg-muted text-card-foreground rounded-bl-md'}`}>
                        {msg.text && <p className="text-sm leading-relaxed break-words">{msg.text}</p>}

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className={`space-y-3 ${msg.text ? 'mt-3' : ''}`}>
                            {msg.attachments.map((attachment) => {
                              const isImage = attachment.contentType.startsWith('image/');
                              const fileName = attachment.pathname.split('/').pop() || 'Attachment';

                              return isImage ? (
                                <div
                                  key={attachment.id}
                                  className="relative group/image cursor-pointer"
                                  onClick={() => setPreviewFile(createPreviewFileFromAttachment(attachment) as any)}
                                >
                                  <Image
                                    src={attachment.blobUrl || '/placeholder.svg'}
                                    alt={fileName}
                                    width={288}
                                    height={192}
                                    loader={ImageLoader}
                                    className="rounded-xl sm:max-w-72 sm:max-h-48 object-cover transition-transform hover:scale-[1.02] shadow-lg"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 rounded-xl transition-colors"></div>
                                </div>
                              ) : (
                                <div
                                  key={attachment.id}
                                  onClick={() => setPreviewFile(createPreviewFileFromAttachment(attachment) as any)}
                                  className={`inline-flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all hover:scale-[1.02] shadow-sm hover:shadow-md cursor-pointer ${
                                    isOwn
                                      ? 'bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground'
                                      : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border'
                                  }`}
                                >
                                  <File className="h-5 w-5" />
                                  <span className="truncate max-w-40 font-medium">{fileName}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-muted-foreground'}`}>{formatTime(msg.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* File preview */}
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
              const isVideo = file.type.startsWith('video/');
              const isPDF = file.type === 'application/pdf';
              const isCSV = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
              const isExcel =
                file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.type === 'application/vnd.ms-excel' ||
                file.name.toLowerCase().endsWith('.xlsx') ||
                file.name.toLowerCase().endsWith('.xls');
              const previewUrl = isImage || isVideo ? URL.createObjectURL(file) : null;

              const getDocumentThumbnail = () => {
                if (isPDF) {
                  return (
                    <div className="relative w-20 h-20 bg-gradient-to-br from-slate-500 to-slate-600 rounded-t-xl flex flex-col items-center justify-center group/doc">
                      <FileText className="h-6 w-6 text-white mb-1" />
                      <span className="text-xs font-bold text-white">PDF</span>
                      <div className="absolute inset-0 bg-black/30 rounded-t-xl opacity-0 group-hover/doc:opacity-100 transition-opacity duration-200"></div>
                    </div>
                  );
                } else if (isCSV) {
                  return (
                    <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-t-xl flex flex-col items-center justify-center group/doc">
                      <Table className="h-6 w-6 text-white mb-1" />
                      <span className="text-xs font-bold text-white">CSV</span>
                      <div className="absolute inset-0 bg-black/30 rounded-t-xl opacity-0 group-hover/doc:opacity-100 transition-opacity duration-200"></div>
                    </div>
                  );
                } else if (isExcel) {
                  return (
                    <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-t-xl flex flex-col items-center justify-center overflow-hidden group/doc">
                      <div className="relative z-10 flex flex-col items-center">
                        <Table className="h-4 w-4 text-white mb-1" />
                        <span className="text-xs font-bold text-white">XLS</span>
                      </div>
                      <div className="absolute inset-0 bg-black/30 rounded-t-xl opacity-0 group-hover/doc:opacity-100 transition-opacity duration-200"></div>
                    </div>
                  );
                }
                return null;
              };

              return (
                <div
                  key={index}
                  className="relative bg-card/80 backdrop-blur-sm rounded-xl border border-border/30 shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer"
                >
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-destructive/80 hover:bg-destructive text-destructive-foreground flex items-center justify-center text-sm transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>

                  {isImage && previewUrl ? (
                    <div className="relative" onClick={() => setPreviewFile(file)}>
                      <div className="relative group/img">
                        <Image src={previewUrl} alt={file.name} className="w-20 h-20 object-cover rounded-t-xl" width={80} height={80} />
                        <div className="absolute inset-0 bg-black/30 rounded-t-xl opacity-0 group-hover/img:opacity-100 transition-opacity duration-200"></div>
                      </div>
                      <div className="px-2 py-1 bg-card/90">
                        <span className="text-xs font-medium text-card-foreground truncate block max-w-16">{file.name}</span>
                      </div>
                    </div>
                  ) : isVideo ? (
                    <div className="relative w-20" onClick={() => setPreviewFile(file)}>
                      <div className="relative w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-t-xl flex items-center justify-center group/video">
                        <Clapperboard className="h-8 w-8 text-slate-600 dark:text-slate-300" />
                        <div className="absolute inset-0 bg-black/50 rounded-t-xl opacity-0 group-hover/video:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <Play className="h-6 w-6 text-white fill-current" />
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-card/90">
                        <span className="text-xs font-medium text-card-foreground truncate block max-w-16">{file.name}</span>
                      </div>
                    </div>
                  ) : isPDF || isCSV || isExcel ? (
                    <div className="relative w-20" onClick={() => setPreviewFile(file)}>
                      {getDocumentThumbnail()}
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

      {/* Input */}
      <div className="border-t border-border px-4 py-3 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 rounded-lg border border-input focus:border-ring focus:outline-none bg-background text-foreground placeholder-muted-foreground text-sm"
            disabled={isSubmitting}
          />

          <button
            type="submit"
            disabled={isSubmitting || (!message.trim() && files.length === 0)}
            className="flex-shrink-0 p-2 bg-primary hover:bg-primary/90 disabled:bg-muted text-white disabled:text-muted-foreground rounded-lg transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>

      {/* File Preview Dialog */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewFile(null)}>
          <div className="relative bg-card rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {previewFile.type.startsWith('image/') ? (
                    <ImageIcon className="h-5 w-5 text-primary" />
                  ) : previewFile.type.startsWith('video/') ? (
                    <Clapperboard className="h-5 w-5 text-primary" />
                  ) : previewFile.type === 'application/pdf' ? (
                    <FileText className="h-5 w-5 text-primary" />
                  ) : (
                    <File className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{previewFile.name}</h3>
                  <p className="text-sm text-muted-foreground">{previewFile.size > 0 ? `${(previewFile.size / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const url = (previewFile as any).blobUrl || URL.createObjectURL(previewFile);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = previewFile.name;
                    a.click();
                    if (!(previewFile as any).blobUrl) {
                      URL.revokeObjectURL(url);
                    }
                  }}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <Download className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </button>
                <button onClick={() => setPreviewFile(null)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(90vh-80px)] overflow-auto">
              {previewFile.type.startsWith('image/') ? (
                <div className="flex items-center justify-center">
                  <Image
                    src={(previewFile as any).blobUrl || URL.createObjectURL(previewFile)}
                    alt={previewFile.name}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                    width={800}
                    height={600}
                    loader={(previewFile as any).blobUrl ? ImageLoader : undefined}
                  />
                </div>
              ) : previewFile.type.startsWith('video/') ? (
                <div className="flex items-center justify-center">
                  <video src={(previewFile as any).blobUrl || URL.createObjectURL(previewFile)} controls className="max-w-full max-h-[70vh] rounded-lg shadow-lg">
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : previewFile.type === 'application/pdf' ? (
                <div className="w-full h-[70vh] rounded-lg overflow-hidden shadow-lg">
                  <iframe src={(previewFile as any).blobUrl || URL.createObjectURL(previewFile)} className="w-full h-full border-0" title={`PDF Preview: ${previewFile.name}`}>
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">PDF Preview Unavailable</h3>
                      <p className="text-muted-foreground mb-4">Your browser doesn't support PDF preview. Download to view the content.</p>
                      <button
                        onClick={() => {
                          const url = (previewFile as any).blobUrl || URL.createObjectURL(previewFile);
                          window.open(url, '_blank');
                        }}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Open in New Tab
                      </button>
                    </div>
                  </iframe>
                </div>
              ) : previewFile.type === 'text/csv' || previewFile.name.toLowerCase().endsWith('.csv') ? (
                <div className="text-center py-12">
                  <Table className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">CSV File</h3>
                  <p className="text-muted-foreground mb-4">CSV files cannot be previewed directly. Download to view the data.</p>
                  <button
                    onClick={() => {
                      const url = (previewFile as any).blobUrl || URL.createObjectURL(previewFile);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = previewFile.name;
                      a.click();
                      if (!(previewFile as any).blobUrl) {
                        URL.revokeObjectURL(url);
                      }
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Download File
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <File className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">File Preview</h3>
                  <p className="text-muted-foreground mb-4">This file type cannot be previewed directly. Download to view the content.</p>
                  <button
                    onClick={() => {
                      const url = (previewFile as any).blobUrl || URL.createObjectURL(previewFile);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = previewFile.name;
                      a.click();
                      if (!(previewFile as any).blobUrl) {
                        URL.revokeObjectURL(url);
                      }
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

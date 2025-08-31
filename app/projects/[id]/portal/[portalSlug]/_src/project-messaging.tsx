'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, ImageIcon, File, MessageSquare, ChevronDown, Users, Clock, Clapperboard, Play, FileText, Table, X, Download } from 'lucide-react';
import { fetcher, swrFetcher } from '@/packages/lib/helpers/fetcher';
import useSWR, { mutate } from 'swr';
import { toast } from 'react-toastify';
import { API_PROJECT_MESSAGES_LIST_ROUTE, API_PROJECT_MESSAGES_SEND_ROUTE } from '@/packages/lib/routes';
import type { User } from '@prisma/client';
import Image from 'next/image';
import ImageLoader from './image-loader';

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

type Context = {
  type: 'user' | 'portal';
  user?: User;
  visitor?: { id: string; name: string; projectId: string; portalSlug: string; createdAt: Date };
};

interface ProjectMessagingProps {
  projectId: string;
  isOwner?: boolean;
  context: Context;
}

export default function ProjectMessaging({ projectId, isOwner = false, context }: ProjectMessagingProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const endpoint = API_PROJECT_MESSAGES_LIST_ROUTE + projectId;
  const { data, error } = useSWR<{ content: ProjectMessage[] }>(endpoint, swrFetcher, {
    refreshInterval: 10000
  });

  const messages = data?.content || [];
  const isLoading = !data && !error;

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

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
    // Keep isTyping true during API request (it's already true from typing)

    try {
      const formData = new FormData();
      formData.append('projectId', projectId);
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
        setIsTyping(false);
        return;
      }

      setMessage('');
      setFiles([]);
      setIsTyping(false); // Clear typing indicator when message is cleared
      mutate(endpoint);

      setTimeout(scrollToBottom, 100);

      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('An error occurred while sending your message');
    } finally {
      setIsSubmitting(false);
      setIsTyping(false);
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
      return 'from-slate-100 to-slate-300';
    }
    // All other users get indigo gradient
    return 'from-indigo-500 to-indigo-600';
  };

  const getAvatarTextColor = (name: string) => {
    // Current user gets blue text to match message bubble
    if (isCurrentUserMessage(name)) {
      return 'text-blue-600';
    }
    // All other users get white text
    return 'text-white';
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

  return (
    <div className="bg-gradient-to-br from-card to-secondary/5 dark:from-card/80 dark:to-secondary/10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border overflow-hidden relative group">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-2xl animate-float-slow will-change-transform"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-br from-primary/8 to-primary/3 rounded-full blur-xl animate-float-medium will-change-transform"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-gradient-to-br from-primary/6 to-primary/2 rounded-full blur-lg animate-float-fast will-change-transform"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-card to-secondary/10 border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="p-3 bg-gradient-to-r from-primary to-primary/80 rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                <MessageSquare className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-card animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Project Messages</h2>
              <div className="hidden sm:flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{uniqueSenders.length} participants</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{messages.length} messages</span>
                </div>
              </div>
            </div>
          </div>
          {isOwner && (
            <div className="px-4 py-2 hidden sm:block bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-medium rounded-full shadow-lg hover:scale-105 transition-transform duration-300">
              Owner
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto sm:px-6 px-2 py-6 space-y-4 relative z-10 h-[600px]" onScroll={handleScroll}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="text-muted-foreground font-medium">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:scale-105 transition-transform duration-300">
                <MessageSquare className="h-12 w-12 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground mb-2">Start the conversation</p>
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
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                  <div className={`flex sm:max-w-[75%] max-w-[95%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 ${isOwn ? 'ml-2' : 'mr-2'} ${showAvatar ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                      <div
                        className={`w-10 h-10 rounded-full hidden sm:flex bg-gradient-to-br ${getAvatarGradient(msg.sender)} items-center justify-center ${getAvatarTextColor(msg.sender)} text-sm font-bold shadow-lg transition-transform duration-300`}
                      >
                        {getInitials(msg.sender)}
                      </div>
                    </div>

                    {/* Message bubble */}
                    <div className={`space-y-2 ${showAvatar ? '' : isOwn ? 'mr-12' : 'ml-12'}`}>
                      {showSender && !isOwn && <p className="text-xs font-medium text-muted-foreground px-4">{msg.sender}</p>}

                      <div
                        className={`px-4 py-3 rounded-2xl shadow-sm transition-all hover:shadow-lg ${
                          isOwn
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-primary-foreground rounded-br-md'
                            : 'bg-background text-card-foreground rounded-bl-md border border-border/50'
                        }`}
                      >
                        {msg.text && <p className="text-sm leading-relaxed break-words">{msg.text}</p>}

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className={`space-y-3 ${msg.text ? 'mt-3' : ''}`}>
                            {msg.attachments.map((attachment) => {
                              const isImage = attachment.contentType.startsWith('image/');
                              const fileName = attachment.pathname.split('/').pop() || 'Attachment';

                              return isImage ? (
                                <div key={attachment.id} className="relative group/image">
                                  <Image
                                    src={attachment.blobUrl || '/placeholder.svg'}
                                    alt={fileName}
                                    width={288}
                                    height={192}
                                    loader={ImageLoader}
                                    className="rounded-xl max-w-72 max-h-48 object-cover cursor-pointer transition-transform hover:scale-[1.02] shadow-lg"
                                    onClick={() => window.open(attachment.blobUrl, '_blank')}
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 rounded-xl transition-colors"></div>
                                </div>
                              ) : (
                                <a
                                  key={attachment.id}
                                  href={attachment.blobUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all hover:scale-[1.02] shadow-sm hover:shadow-md ${
                                    isOwn
                                      ? 'bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground'
                                      : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border'
                                  }`}
                                >
                                  <File className="h-5 w-5" />
                                  <span className="truncate max-w-40 font-medium">{fileName}</span>
                                </a>
                              );
                            })}
                          </div>
                        )}

                        {/* Timestamp - Always visible */}
                        <p className={`text-xs mt-2 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{formatTime(msg.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-end group">
                <div className="flex sm:max-w-[75%] max-w-[95%] flex-row-reverse items-end space-x-2">
                  {/* Avatar */}
                  <div className="flex-shrink-0 ml-2">
                    <div
                      className={`w-10 h-10 rounded-full hidden sm:flex bg-gradient-to-br ${getAvatarGradient(getCurrentUserName())} items-center justify-center ${getAvatarTextColor(getCurrentUserName())} text-sm font-bold shadow-lg transition-transform duration-300`}
                    >
                      {getInitials(getCurrentUserName())}
                    </div>
                  </div>

                  {/* Message bubble */}
                  <div className="space-y-2">
                    <div className="px-4 py-3 rounded-2xl shadow-sm transition-all hover:shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-primary-foreground rounded-br-md">
                      <div className="flex space-x-1 items-center justify-center mt-1">
                        <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-32 right-8 w-12 h-12 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-20"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* File preview */}
      {files.length > 0 && (
        <div className="relative z-10 px-6 py-4 bg-secondary/30 border-t border-border/50">
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
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/30 rounded-t-xl opacity-0 group-hover/doc:opacity-100 transition-opacity duration-200"></div>
                    </div>
                  );
                } else if (isCSV) {
                  return (
                    <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-t-xl flex flex-col items-center justify-center group/doc">
                      <Table className="h-6 w-6 text-white mb-1" />
                      <span className="text-xs font-bold text-white">CSV</span>
                      {/* Hover overlay */}
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
                      {/* Hover overlay */}
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
                        <img src={previewUrl} alt={file.name} className="w-20 h-20 object-cover rounded-t-xl" />
                        {/* Hover overlay */}
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

                        {/* Hover overlay with play button */}
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
      <div className="relative z-10 bg-gradient-to-r from-card to-secondary/10 border-t border-border/50 px-2 sm:px-6 py-4">
        <form onSubmit={handleSubmit} className="flex items-center">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 p-3 text-muted-foreground hover:text-primary border border-border rounded-xl hover:scale-105 transition-transform duration-200 mr-3"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setIsTyping(e.target.value.trim().length > 0);
              }}
              placeholder="Type your message..."
              className="w-full px-6 py-4 rounded-2xl border border-input focus:border-ring focus:outline-none bg-background text-foreground placeholder-muted-foreground shadow-sm transition-all focus:shadow-md hover:border-border/80"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || (!message.trim() && files.length === 0)}
            className="flex-shrink-0 p-3 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:from-muted disabled:to-muted text-primary-foreground disabled:text-muted-foreground rounded-xl transition-all hover:scale-105 disabled:scale-100 shadow-md disabled:shadow-none ml-3"
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
                  <p className="text-sm text-muted-foreground">{(previewFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const url = URL.createObjectURL(previewFile);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = previewFile.name;
                    a.click();
                    URL.revokeObjectURL(url);
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
                  <img src={URL.createObjectURL(previewFile)} alt={previewFile.name} className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg" />
                </div>
              ) : previewFile.type.startsWith('video/') ? (
                <div className="flex items-center justify-center">
                  <video src={URL.createObjectURL(previewFile)} controls className="max-w-full max-h-[70vh] rounded-lg shadow-lg">
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : previewFile.type === 'application/pdf' ? (
                <div className="w-full h-[70vh] rounded-lg overflow-hidden shadow-lg">
                  <iframe src={URL.createObjectURL(previewFile)} className="w-full h-full border-0" title={`PDF Preview: ${previewFile.name}`}>
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">PDF Preview Unavailable</h3>
                      <p className="text-muted-foreground mb-4">Your browser doesn't support PDF preview. Download to view the content.</p>
                      <button
                        onClick={() => {
                          const url = URL.createObjectURL(previewFile);
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
                      const url = URL.createObjectURL(previewFile);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = previewFile.name;
                      a.click();
                      URL.revokeObjectURL(url);
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
                      const url = URL.createObjectURL(previewFile);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = previewFile.name;
                      a.click();
                      URL.revokeObjectURL(url);
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

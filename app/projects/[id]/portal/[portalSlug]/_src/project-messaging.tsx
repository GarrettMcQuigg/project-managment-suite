'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, ImageIcon, File, MessageSquare, ChevronDown, Users, Clock } from 'lucide-react';
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
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() && files.length === 0) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    setIsTyping(true);

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
    const gradients = [
      'from-violet-500 to-purple-600',
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-teal-600',
      'from-orange-500 to-red-500',
      'from-pink-500 to-rose-500',
      'from-indigo-500 to-blue-600'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
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
            <div className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-medium rounded-full shadow-lg hover:scale-105 transition-transform duration-300">
              Owner
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4 relative z-10 h-[600px]" onScroll={handleScroll}>
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
                  <div className={`flex max-w-[75%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 ${isOwn ? 'ml-2' : 'mr-2'} ${showAvatar ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(msg.sender)} flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-card hover:scale-105 transition-transform duration-300`}
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
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-muted to-muted-foreground/70 flex items-center justify-center text-muted-foreground text-xs font-bold">
                    AI
                  </div>
                  <div className="bg-card px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-border/50">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-card/80 backdrop-blur-sm rounded-xl px-3 py-2 text-sm border border-border/30 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="truncate max-w-32 font-medium text-card-foreground">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((_, i) => i !== index))}
                  className="text-muted-foreground hover:text-destructive w-5 h-5 rounded-full bg-secondary hover:bg-destructive/10 flex items-center justify-center text-xs transition-all hover:scale-110"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="relative z-10 bg-gradient-to-r from-card to-secondary/10 border-t border-border/50 px-6 py-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 p-3 text-muted-foreground hover:text-primary transition-colors hover:bg-secondary rounded-xl hover:scale-105 transition-transform duration-200"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-6 py-4 rounded-2xl border border-input focus:border-ring focus:outline-none bg-background text-foreground placeholder-muted-foreground shadow-sm transition-all focus:shadow-md hover:border-border/80"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || (!message.trim() && files.length === 0)}
            className="flex-shrink-0 p-4 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:from-muted disabled:to-muted text-primary-foreground disabled:text-muted-foreground rounded-2xl transition-all hover:scale-105 disabled:scale-100 shadow-lg disabled:shadow-none"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

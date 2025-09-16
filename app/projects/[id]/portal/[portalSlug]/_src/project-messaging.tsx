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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const endpoint = API_PROJECT_MESSAGES_LIST_ROUTE + project.id;
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

  return (
    <div className="h-full flex flex-col max-h-[972px]">
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
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{messages.length} messages</span>
                </div>
              </div>
            </div>
          </div>
          {isOwner && <div className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">Owner</div>}
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
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
                  <div className={`flex max-w-[85%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 ${isOwn ? 'ml-2' : 'mr-2'}`}>
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
                        <p className="text-sm leading-relaxed break-words">{msg.text}</p>
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

      {/* Input */}
      <div className="border-t border-border px-4 py-3 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <button type="button" className="flex-shrink-0 p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors">
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
            disabled={isSubmitting || !message.trim()}
            className="flex-shrink-0 p-2 bg-primary hover:bg-primary/90 disabled:bg-muted text-white disabled:text-muted-foreground rounded-lg transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

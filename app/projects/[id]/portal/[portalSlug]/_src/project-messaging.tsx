'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image, File, MessageSquare, Sparkles } from 'lucide-react';
import { Card } from '@/packages/lib/components/card';
import { fetcher, swrFetcher } from '@/packages/lib/helpers/fetcher';
import useSWR, { mutate } from 'swr';
import { toast } from 'react-toastify';
import { API_PROJECT_MESSAGES_LIST_ROUTE, API_PROJECT_MESSAGES_SEND_ROUTE } from '@/packages/lib/routes';
import type { User } from '@prisma/client';

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

export default function ProjectMessaging({ projectId, isOwner = false, context }: { projectId: string; isOwner?: boolean; context: Context }) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const endpoint = API_PROJECT_MESSAGES_LIST_ROUTE + projectId;
  const { data, error } = useSWR<{ content: ProjectMessage[] }>(endpoint, swrFetcher, {
    refreshInterval: 10000 // Poll for new messages every 10 seconds
  });

  const messages = data?.content || [];
  const isLoading = !data && !error;

  // Handle scroll position
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Add scroll event listener
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

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message.trim() && files.length === 0) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

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

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-emerald-600 to-teal-500',
      'from-teal-600 to-cyan-500',
      'from-cyan-600 to-blue-500',
      'from-blue-600 to-indigo-500',
      'from-indigo-600 to-purple-500',
      'from-purple-600 to-pink-500'
    ];

    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const isCurrentUserMessage = (sender: string) => {
    if (!context) return false;
    return context.user ? context.user.firstname + ' ' + context.user.lastname === sender : context.visitor ? context.visitor.name === sender : false;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ProjectMessage[]>);

  return (
    <Card className="bg-gradient-to-br from-[#0F1A1C] to-[#162226] p-6 shadow-xl border border-[#1A2729] overflow-hidden rounded-xl">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-20 h-20 bg-[#00b894] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#00b894] rounded-full blur-3xl"></div>
      </div>

      <h2 className="mb-6 text-2xl font-bold text-white flex items-center relative z-10">
        <MessageSquare className="mr-2 h-6 w-6 text-[#00b894]" />
        Project Messages
        {isOwner && (
          <span className="ml-2 text-xs bg-gradient-to-r from-[#00b894] to-[#00a583] text-white px-3 py-1 rounded-full flex items-center">
            <Sparkles className="h-3 w-3 mr-1" />
            Owner View
          </span>
        )}
        <div className="ml-auto text-sm text-gray-400">
          {messages.length} {messages.length === 1 ? 'message' : 'messages'}
        </div>
      </h2>

      <div
        ref={messagesContainerRef}
        className="relative mb-4 h-[800px] overflow-y-auto rounded-xl bg-[#1A2729] p-4 space-y-6 custom-scrollbar"
        style={{
          backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(0, 184, 148, 0.03) 0%, transparent 70%)',
          boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.2)'
        }}
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-pulse flex space-x-2 mb-3">
                <div className="h-3 w-3 bg-[#00b894] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-3 w-3 bg-[#00b894] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="h-3 w-3 bg-[#00b894] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <p className="text-gray-400">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center flex-col">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0F1A1C] to-[#1A2729] flex items-center justify-center mb-6 shadow-lg p-5 animate-pulse">
              <Send className="h-10 w-10 text-[#00b894]" />
            </div>
            <p className="text-gray-400 text-lg mb-2">No messages yet</p>
            <p className="text-gray-500 text-sm">Start the conversation by sending a message below!</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center justify-center my-6">
                <div className="h-px bg-[#2A373A] flex-grow"></div>
                <span className="px-4 text-xs text-gray-500 bg-[#1A2729] rounded-full py-1">{date}</span>
                <div className="h-px bg-[#2A373A] flex-grow"></div>
              </div>

              {dateMessages.map((msg) => {
                const isFromCurrentUser = isCurrentUserMessage(msg.sender);

                return (
                  <div key={msg.id} className={`flex ${!isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`
                        rounded-xl 
                        bg-gradient-to-br from-[#0F1A1C] to-[#131F22]
                        border-l-4 
                        ${isFromCurrentUser ? 'border-[#00b894]' : 'border-[#ffffff]'}
                        p-4 
                        shadow-md
                        w-full
                        md:w-[70%]
                        transition-all
                        hover:shadow-lg
                        hover:translate-y-[-2px]
                        backdrop-blur-sm
                      `}
                    >
                      <div className="flex gap-3 flex-row">
                        <div
                          className={`
                            flex-shrink-0 
                            h-10 
                            w-10 
                            rounded-full 
                            bg-gradient-to-br ${getAvatarColor(msg.sender)} 
                            flex 
                            items-center 
                            justify-center 
                            font-medium 
                            text-lg 
                            text-white
                            shadow-md
                            mr-2
                            ring-2 ring-[#1A2729]
                          `}
                        >
                          {msg.sender.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline mb-2 flex-row justify-between">
                            <h3 className="font-semibold text-white text-base">{msg.sender}</h3>
                            <span className="text-xs text-gray-400 bg-[#0F1A1C]/50 px-2 py-0.5 rounded-full">{formatTimestamp(msg.createdAt)}</span>
                          </div>

                          <p className="text-gray-300 break-words text-left leading-relaxed">{msg.text}</p>

                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2 justify-start">
                              {msg.attachments.map((attachment) => {
                                const isImage = attachment.contentType.startsWith('image/');
                                const fileName = attachment.pathname.split('/').pop() || 'Attachment';

                                return isImage ? (
                                  <a key={attachment.id} href={attachment.blobUrl} target="_blank" rel="noopener noreferrer" className="block relative group">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                                      <span className="text-white text-xs px-2 py-1 bg-black/50 rounded-md backdrop-blur-sm">{fileName}</span>
                                    </div>
                                    <img
                                      src={attachment.blobUrl}
                                      alt={fileName}
                                      className="h-24 w-auto rounded-md object-cover border border-[#2A373A] group-hover:border-[#00b894] transition-all shadow-md group-hover:shadow-lg"
                                      loading="lazy"
                                    />
                                  </a>
                                ) : (
                                  <a
                                    key={attachment.id}
                                    href={attachment.blobUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-md bg-[#0F1A1C] px-3 py-2 text-sm text-[#00b894] hover:bg-[#1F2C2F] transition-all flex items-center gap-2 border border-[#2A373A] hover:border-[#00b894] shadow-sm hover:shadow-md"
                                    download={fileName}
                                  >
                                    <File className="h-4 w-4" />
                                    <span className="truncate max-w-[150px]">{fileName}</span>
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}

        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 bg-[#00b894] text-white rounded-full p-2 shadow-lg hover:bg-[#00a583] transition-all animate-bounce"
            aria-label="Scroll to bottom"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        )}
      </div>

      {files.length > 0 && (
        <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-[#1A2729] to-[#1F2C2F] border border-[#2A373A] shadow-inner">
          <div className="text-sm text-gray-400 mb-2 flex items-center">
            <Image className="h-4 w-4 mr-2 text-[#00b894]" />
            <span className="bg-[#0F1A1C] px-2 py-0.5 rounded-full text-xs">Attachments ({files.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-[#0F1A1C] rounded-md px-3 py-1.5 text-sm text-white border border-[#2A373A] hover:border-[#00b894] transition-all shadow-sm"
              >
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((_, i) => i !== index))}
                  className="text-gray-400 hover:text-white transition-colors bg-[#1A2729] rounded-full h-5 w-5 flex items-center justify-center"
                  aria-label="Remove attachment"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3 relative z-10">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />

        <button
          type="button"
          onClick={handleAttachClick}
          className="flex-shrink-0 rounded-lg bg-gradient-to-br from-[#1A2729] to-[#1F2C2F] p-3 text-gray-400 hover:text-[#00b894] transition-all shadow-md hover:shadow-lg"
          title="Attach files"
        >
          <Paperclip className="h-5 w-5" />
        </button>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-lg bg-gradient-to-r from-[#1A2729] to-[#1F2C2F] px-4 py-3 text-white placeholder-gray-500 outline-none ring-[#00b894] focus:ring-2 transition-all shadow-md"
          disabled={isSubmitting}
        />

        <button
          type="submit"
          className="flex-shrink-0 flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00b894] to-[#00a583] px-4 py-3 font-medium text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          disabled={isSubmitting || (!message.trim() && files.length === 0)}
        >
          <Send className="h-5 w-5" />
          <span className="hidden sm:inline">{isSubmitting ? 'Sending...' : 'Send'}</span>
        </button>
      </form>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Card } from '@/packages/lib/components/card';
import { fetcher, swrFetcher } from '@/packages/lib/helpers/fetcher';
import useSWR, { mutate } from 'swr';
import { toast } from 'react-toastify';
import { API_PROJECT_MESSAGES_LIST_ROUTE, API_PROJECT_MESSAGES_SEND_ROUTE } from '@/packages/lib/routes';

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

export default function ProjectMessaging({ projectId }: { projectId: string }) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const endpoint = API_PROJECT_MESSAGES_LIST_ROUTE + projectId;
  const { data, error } = useSWR<{ content: ProjectMessage[] }>(endpoint, swrFetcher);

  const messages = data?.content || [];
  const isLoading = !data && !error;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message.trim()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetcher({
        url: API_PROJECT_MESSAGES_SEND_ROUTE,
        requestBody: {
          projectId,
          text: message
        }
      });

      if (response.err) {
        toast.error('Failed to send message');
        return;
      }

      setMessage('');
      mutate(endpoint);
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('An error occurred while sending your message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white dark:bg-[#0F1A1C] p-6">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Project Messages</h2>

      <div className="mb-4 h-[400px] space-y-4 overflow-y-auto rounded-lg bg-gray-100 dark:bg-[#1A2729] p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="rounded-lg bg-white dark:bg-[#0F1A1C] p-4">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-[#1C3A33] dark:text-[#00b894]">
                  {msg.sender.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{msg.sender}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(msg.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{msg.text}</p>

              {/* Display attachments if any */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.blobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded bg-gray-100 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 dark:bg-[#1A2729] dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {attachment.pathname.split('/').pop()}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-lg bg-gray-100 dark:bg-[#1A2729] px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none ring-emerald-500 dark:ring-[#00b894] focus:ring-2"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-emerald-500 dark:bg-[#00b894] px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-600 dark:hover:bg-[#00a583] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || !message.trim()}
        >
          <Send className="h-5 w-5" />
          <span>{isSubmitting ? 'Sending...' : 'Send'}</span>
        </button>
      </form>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

interface FakeProjectMessages {
  id: string;
  sender: string;
  content: string;
  createdAt: string;
}

export default function ProjectMessaging({ projectId }: { projectId: string }) {
  console.log('projectId:', projectId);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<FakeProjectMessages[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessages([]);
  };

  return (
    <div className="rounded-xl bg-white dark:bg-[#0F1A1C] p-6 shadow-lg">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Project Messages</h2>

      <div className="mb-4 h-[400px] space-y-4 overflow-y-auto rounded-lg bg-gray-100 dark:bg-[#1A2729] p-4">
        {messages.length === 0 ? (
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
              <p className="text-gray-700 dark:text-gray-300">{msg.content}</p>
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
        />
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-emerald-500 dark:bg-[#00b894] px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-600 dark:hover:bg-[#00a583]"
        >
          <Send className="h-5 w-5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}

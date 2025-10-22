'use client';

import React from 'react';
import Image from 'next/image';
import { File } from 'lucide-react';
import ImageLoader from '../../_src/image-loader';

interface MessageAttachment {
  id: string;
  blobUrl: string;
  pathname: string;
  contentType: string;
}

interface MessageAttachmentProps {
  attachment: MessageAttachment;
  isOwnerMessage: boolean;
  onClick: () => void;
}

export default function MessageAttachment({ attachment, isOwnerMessage, onClick }: MessageAttachmentProps) {
  const isImage = attachment.contentType.startsWith('image/');
  const fileName = attachment.pathname.split('/').pop() || 'Attachment';

  if (isImage) {
    return (
      <div
        className="relative group/image cursor-pointer"
        onClick={onClick}
      >
        <Image
          src={attachment.blobUrl || '/placeholder.svg'}
          alt={fileName}
          width={288}
          height={192}
          loader={ImageLoader}
          className="rounded-xl sm:max-w-48 sm:max-h-36 object-cover transition-transform hover:scale-[1.02] shadow-lg"
        />
        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 rounded-xl transition-colors"></div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all hover:scale-[1.02] shadow-sm hover:shadow-md cursor-pointer ${
        isOwnerMessage
          ? 'bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground'
          : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border'
      }`}
    >
      <File className="h-5 w-5" />
      <span className="truncate max-w-40 font-medium">{fileName}</span>
    </div>
  );
}

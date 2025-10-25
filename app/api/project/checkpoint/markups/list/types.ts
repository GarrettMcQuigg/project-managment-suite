import { AttachmentMarkup, AttachmentMarkupComment, MarkupType } from '@prisma/client';

export type MarkupListResponse = {
  markups: AttachmentMarkup[];
  generalComments: AttachmentMarkupComment[];
};

export type Markup = {
  id: string;
  type: MarkupType;
  createdAt: Date;
  updatedAt: Date;
  comments: AttachmentMarkupComment[];
};

export type GeneralComment = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  text: string;
  userId: string | null;
  visitorName: string | null;
  attachmentId: string;
  markupId: string | null;
  comments?: { text: string }[];
};

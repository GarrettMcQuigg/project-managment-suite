import { ProjectStatus, ProjectType } from '@prisma/client';
import { z } from 'zod';

export const projectFormSchema = z
  .object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().min(1, 'Project description is required'),
    type: z.nativeEnum(ProjectType, {
      required_error: 'Project type is required',
      invalid_type_error: 'Please select a project type'
    }),
    status: z.nativeEnum(ProjectStatus).default(ProjectStatus.PREPARATION),
    startDate: z.date({
      required_error: 'Start date is required'
    }),
    endDate: z
      .date({
        required_error: 'End date is required'
      })
      .min(new Date(), 'End date must be in the future')
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate']
  });

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const projectTypes = {
  Branding: {
    key: ProjectType.BRANDING,
    name: 'Branding',
    description: 'Logo design, brand identity, style guides'
  },
  Photography: {
    key: ProjectType.PHOTOGRAPHY,
    name: 'Photography',
    description: 'Photo shoots, image editing, photo collections'
  },
  Illustration: {
    key: ProjectType.ILLUSTRATION,
    name: 'Illustration',
    description: 'Custom illustrations, art commissions'
  },
  WebDesign: {
    key: ProjectType.WEB_DESIGN,
    name: 'Web Design',
    description: 'Websites, landing pages, digital experiences'
  },
  Video: {
    key: ProjectType.VIDEO,
    name: 'Video',
    description: 'Video production, editing, animation'
  },
  SocialMedia: {
    key: ProjectType.SOCIAL_MEDIA,
    name: 'Social Media',
    description: 'Content creation, campaign management'
  },
  Print: {
    key: ProjectType.PRINT,
    name: 'Print',
    description: 'Physical materials, packaging, editorial'
  },
  Exhibition: {
    key: ProjectType.EXHIBITION,
    name: 'Exhibition',
    description: 'Art shows, installations, gallery work'
  },
  Campaign: {
    key: ProjectType.CAMPAIGN,
    name: 'Campaign',
    description: 'Multi-channel creative campaigns'
  },
  Collaboration: {
    key: ProjectType.COLLABORATION,
    name: 'Collaboration',
    description: 'Joint creative projects'
  }
};

export type ProjectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNext: (data: ProjectFormValues) => void;
  mode?: 'create' | 'edit';
  defaultValues?: ProjectFormValues;
};

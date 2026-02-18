import { z } from 'zod';

export const linkSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  url: z
    .string()
    .min(1, 'URL is required')
    .url('Must be a valid URL (include https://)'),
});

export type LinkFormData = z.infer<typeof linkSchema>;

import { z } from 'zod';

export const AppreciationSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export const GeneratePvDtoSchema = z.object({
  projectType: z.enum(['PFE', 'MEMOIRE', 'THESE']),
  manualFields: z.object({
    resume: z.string().optional(),
    deroulement: z.string().optional(),
    observations: z.string().optional(),
    recommandations: z.string().optional(),
    commentairesDecision: z.string().optional(),
    appreciations: z.array(AppreciationSchema).optional(),
  }),
  theseSpecific: z
    .object({
      mentionThese: z.enum([
        'HONORABLE',
        'TRES_HONORABLE',
        'TRES_HONORABLE_FELICITATIONS',
        'AJOURNEE',
      ]),
    })
    .optional(),
});

export type GeneratePvDto = z.infer<typeof GeneratePvDtoSchema>;

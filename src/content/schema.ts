import { z } from 'zod';

export const MediaSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  credit: z.string().optional(),
  placeholder: z.boolean().optional(),
});

export const FlowStepSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  label: z.string().min(1).max(60),
  kind: z.enum(['fail', 'recover']).optional(),
});

export const FlowSchema = z.object({
  actors: z.array(z.string().min(1)).min(2).max(5),
  steps: z.array(FlowStepSchema).min(2).max(9),
});

export const ProjectFrontSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/, 'id must be kebab-case'),
    name: z.string().min(1),
    status: z.enum(['Live', 'Beta', 'In progress', 'Live (internal)']),
    tier: z.enum(['featured', 'index']),
    order: z.number().int(),
    repo: z.object({ url: z.string().url().nullable(), private: z.boolean() }),
    liveUrl: z.string().url().optional(),
    standfirst: z.string().min(1).max(160),
    problem: z.string().max(140).optional(),
    stack: z.array(z.string().min(1)).min(1),
    figure: MediaSchema.optional(),
    flow: FlowSchema.optional(),
    outcome: z.string().max(200).optional(),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (p.tier === 'featured') {
      for (const key of ['flow', 'problem', 'figure', 'outcome'] as const) {
        if (p[key] === undefined) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: `featured projects need ${key}` });
        }
      }
    }
    if (p.tier === 'index' && p.flow) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['flow'], message: 'index projects must not have a flow' });
    }
    if (p.flow) {
      const actors = p.flow.actors;
      p.flow.steps.forEach((s, i) => {
        for (const end of ['from', 'to'] as const) {
          if (!actors.includes(s[end])) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['flow', 'steps', i, end],
              message: `actor "${s[end]}" is not in flow.actors`,
            });
          }
        }
      });
    }
    if (p.figure && p.figure.src.includes('/placeholders/') && !p.figure.placeholder) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['figure', 'placeholder'],
        message: 'placeholder figures must set placeholder: true',
      });
    }
    if (p.repo.private && p.repo.url !== null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['repo', 'url'], message: 'private repos must have url: null' });
    }
  });

export type Inline =
  | { t: 'text'; v: string }
  | { t: 'strong' | 'em'; c: Inline[] }
  | { t: 'code'; v: string }
  | { t: 'link'; href: string; c: Inline[] };

export type Block = { t: 'p'; c: Inline[] } | { t: 'ul'; items: Inline[][] };

export const ProfileSchema = z
  .object({
    name: z.string(),
    role: z.string(),
    location: z.string(),
    coords: z.string(),
    email: z.string().email(),
    github: z.string().url(),
    linkedin: z.string().url(),
    company: z.string(),
    companyUrl: z.string().url(),
    portrait: MediaSchema,
    cover: z.object({
      kicker: z.string(),
      standfirst: z.string().max(140),
      chips: z.array(z.string()).min(1).max(4),
    }),
    who: z.object({ heading: z.string(), body: z.string(), invonics: z.string() }),
    what: z.object({
      heading: z.string(),
      body: z.string(),
      layers: z.array(z.object({ name: z.string(), items: z.array(z.string()).min(1) })).min(3).max(6),
    }),
    solves: z.object({
      heading: z.string(),
      items: z
        .array(z.object({ condition: z.string().max(90), proof: z.array(z.string()).min(1) }))
        .min(3)
        .max(8),
    }),
    for: z.object({ heading: z.string(), sectors: z.array(z.string()).min(3), tail: z.string() }),
  })
  .strict();

export const SiteSchema = z
  .object({
    issue: z.string(),
    issueDate: z.string(),
    chapters: z.object({ cover: z.string(), profile: z.string(), work: z.string(), contact: z.string() }),
  })
  .strict();

export const LinkSchema = z.object({
  label: z.string(),
  href: z.string().regex(/^(https:\/\/|mailto:)/, 'links must be https: or mailto:'),
  kind: z.enum(['email', 'github', 'linkedin', 'invonics']),
});

export const ContactSchema = z
  .object({
    heading: z.string(),
    email: z.string().email(),
    cvPath: z.string().startsWith('/'),
    bookingUrl: z.string().url().nullable(),
    project: z.object({ subject: z.string(), body: z.string() }),
    links: z.array(LinkSchema).min(1),
    colophon: z.string(),
  })
  .strict();

export const CredentialSchema = z.object({
  title: z.string(),
  issuer: z.string(),
  period: z.string(),
  note: z.string(),
});

export const OffHoursSchema = z
  .object({ heading: z.string(), items: z.array(z.object({ title: z.string(), body: z.string() })).min(1) })
  .strict();

export type Media = z.infer<typeof MediaSchema>;
export type FlowStep = z.infer<typeof FlowStepSchema>;
export type Flow = z.infer<typeof FlowSchema>;
export type ProjectFront = z.infer<typeof ProjectFrontSchema>;
export type Project = ProjectFront & { body: Block[] };
export type Profile = z.infer<typeof ProfileSchema>;
export type Site = z.infer<typeof SiteSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type Credential = z.infer<typeof CredentialSchema>;
export type OffHours = z.infer<typeof OffHoursSchema>;

export type Content = {
  profile: Profile;
  site: Site;
  contact: Contact;
  credentials: Credential[];
  offhours: OffHours;
  projects: Project[];
};

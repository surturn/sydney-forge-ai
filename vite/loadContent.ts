import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';
import type { z, ZodTypeAny } from 'zod';
import {
  ContactSchema,
  CredentialSchema,
  OffHoursSchema,
  ProfileSchema,
  ProjectFrontSchema,
  SiteSchema,
  type Content,
  type Project,
} from '../src/content/schema';
import { toBlocks } from './markdown';

export class ContentError extends Error {}

// Normalise Windows line endings first: this repo checks out with CRLF.
const read = (p: string) => readFileSync(p, 'utf-8').replace(/\r\n?/g, '\n');

function validate<S extends ZodTypeAny>(file: string, schema: S, data: unknown): z.infer<S> {
  const r = schema.safeParse(data);
  if (!r.success) {
    const issues = r.error.issues.map((i) => `  ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n');
    throw new ContentError(`${file}\n${issues}`);
  }
  return r.data;
}

function json<S extends ZodTypeAny>(dir: string, name: string, schema: S, files: string[]): z.infer<S> {
  const p = join(dir, name);
  files.push(p);
  let data: unknown;
  try {
    data = JSON.parse(read(p));
  } catch (e) {
    throw new ContentError(`${p}\n  invalid JSON: ${(e as Error).message}`);
  }
  return validate(p, schema, data);
}

function project(p: string): Project {
  const m = read(p).match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new ContentError(`${p}\n  missing front matter between --- lines`);
  let front: unknown;
  try {
    front = parseYaml(m[1]);
  } catch (e) {
    throw new ContentError(`${p}\n  invalid YAML: ${(e as Error).message}`);
  }
  const data = validate(p, ProjectFrontSchema, front);
  try {
    return { ...data, body: toBlocks(m[2]) };
  } catch (e) {
    throw new ContentError(`${p}\n  body: ${(e as Error).message}`);
  }
}

/** Reads, validates and cross-checks everything under the content directory. */
export function loadContent(dir: string): { content: Content; files: string[] } {
  const files: string[] = [];
  const profile = json(dir, 'profile.json', ProfileSchema, files);
  const site = json(dir, 'site.json', SiteSchema, files);
  const contact = json(dir, 'contact.json', ContactSchema, files);
  const credentials = json(dir, 'credentials.json', CredentialSchema.array().min(1), files);
  const offhours = json(dir, 'offhours.json', OffHoursSchema, files);

  const pdir = join(dir, 'projects');
  const projects = readdirSync(pdir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const p = join(pdir, f);
      files.push(p);
      return project(p);
    })
    .sort((a, b) => a.order - b.order);

  const ids = new Set<string>();
  for (const p of projects) {
    if (ids.has(p.id)) throw new ContentError(`projects/\n  duplicate project id "${p.id}"`);
    ids.add(p.id);
  }

  const profilePath = join(dir, 'profile.json');
  const missing = [
    ...profile.cover.chips.map((id) => ['cover.chips', id] as const),
    ...profile.solves.items.flatMap((it, i) => it.proof.map((id) => [`solves.items.${i}.proof`, id] as const)),
  ].filter(([, id]) => !ids.has(id));
  if (missing.length) {
    throw new ContentError(
      `${profilePath}\n${missing.map(([path, id]) => `  ${path}: no project with id "${id}"`).join('\n')}`,
    );
  }

  return { content: { profile, site, contact, credentials, offhours, projects }, files };
}

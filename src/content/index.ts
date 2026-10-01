import data from 'virtual:content';
import type { Project } from './schema';

export const content = data;
export const projectById = (id: string): Project | undefined => data.projects.find((p) => p.id === id);
export const featuredProjects = data.projects.filter((p) => p.tier === 'featured');
export const indexProjects = data.projects.filter((p) => p.tier === 'index');
export type * from './schema';

import { content, featuredProjects } from '@/content';
import type { ShotModule } from '@/film/useFilm';
import { CoverShot } from './Cover';
import { WhoShot } from './Who';
import { WhatShot } from './What';
import { ContextShot } from './Context';
import { makeProjectShot } from './ProjectStory';
import { ShowcaseShot } from './Showcase';
import { SolvesShot } from './Solves';
import { FiguringShot } from './Figuring';
import { ForShot } from './For';
import { BackCoverShot } from './BackCover';

const stories = featuredProjects.flatMap((p) => (p.story ? [{ ...p, story: p.story }] : []));
const ProjectShots = stories.map((p, i) => makeProjectShot(p, i + 1, stories.length));
const hasConcepts = content.projects.some((p) => p.status === 'Concept' && p.liveUrl && p.figure);

/** Film order: who I am, the work as stories, the concept showcase, how I think, then the invitation. */
export const SHOTS: ShotModule[] = [
  CoverShot,
  WhoShot,
  WhatShot,
  ContextShot,
  ...ProjectShots,
  ...(hasConcepts ? [ShowcaseShot] : []),
  SolvesShot,
  FiguringShot,
  ForShot,
  BackCoverShot,
];

import { featuredProjects } from '@/content';
import type { ShotModule } from '@/film/useFilm';
import { CoverShot } from './Cover';
import { WhoShot } from './Who';
import { WhatShot } from './What';
import { ContextShot } from './Context';
import { makeProjectShot } from './ProjectStory';
import { SolvesShot } from './Solves';
import { FiguringShot } from './Figuring';
import { ForShot } from './For';
import { BackCoverShot } from './BackCover';

const stories = featuredProjects.flatMap((p) => (p.story ? [{ ...p, story: p.story }] : []));
const ProjectShots = stories.map((p, i) => makeProjectShot(p, i + 1, stories.length));

/** Film order: who I am, the work as stories, how I think, then the invitation. */
export const SHOTS: ShotModule[] = [
  CoverShot,
  WhoShot,
  WhatShot,
  ContextShot,
  ...ProjectShots,
  SolvesShot,
  FiguringShot,
  ForShot,
  BackCoverShot,
];

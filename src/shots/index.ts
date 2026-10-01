import type { ShotModule } from '@/film/useFilm';
import { CoverShot } from './Cover';
import { WhoShot } from './Who';
import { WhatShot } from './What';
import { SolvesShot } from './Solves';
import { ForShot } from './For';
import { BackCoverShot } from './BackCover';

/** Film order. Stage B inserts Case files, explainers and the index roll before BackCover. */
export const SHOTS: ShotModule[] = [CoverShot, WhoShot, WhatShot, SolvesShot, ForShot, BackCoverShot];

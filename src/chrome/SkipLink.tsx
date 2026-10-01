import { seekToShot } from '@/film/seek';

export function SkipLink() {
  return (
    <a
      href="#shot-back-cover"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-paper focus:px-4 focus:py-2"
      onClick={(e) => {
        if (seekToShot('back-cover')) e.preventDefault();
      }}
    >
      Skip to contact
    </a>
  );
}

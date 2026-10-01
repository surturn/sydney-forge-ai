import { useLayoutEffect, useRef } from 'react';
import { Stage } from '@/film/Stage';
import { Reel, reelIsActive } from '@/film/Reel';
import { useModeBootstrap } from '@/film/useModeBootstrap';
import { useFilmStore } from '@/film/store';
import { ChapterBar } from '@/chrome/ChapterBar';
import { SkipLink } from '@/chrome/SkipLink';
import { SHOTS } from '@/shots';

const App = () => {
  useModeBootstrap();
  const pageRef = useRef<HTMLDivElement>(null);
  // While the reel covers the screen, everything behind it is unreachable,
  // so Skip intro is genuinely the first stop for keyboard and AT users.
  const reelActive = useFilmStore((s) => reelIsActive(s.mode, s.reelState));

  useLayoutEffect(() => {
    pageRef.current?.toggleAttribute('inert', reelActive);
  }, [reelActive]);

  return (
    <>
      <Reel />
      <div ref={pageRef}>
        <SkipLink />
        <ChapterBar />
        <main>
          <Stage shots={SHOTS} />
        </main>
      </div>
    </>
  );
};

export default App;

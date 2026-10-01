import { Stage } from '@/film/Stage';
import { Reel } from '@/film/Reel';
import { useModeBootstrap } from '@/film/useModeBootstrap';
import { ChapterBar } from '@/chrome/ChapterBar';
import { SkipLink } from '@/chrome/SkipLink';
import { SHOTS } from '@/shots';

const App = () => {
  useModeBootstrap();
  return (
    <>
      <SkipLink />
      <ChapterBar />
      <main>
        <Stage shots={SHOTS} />
      </main>
      <Reel />
    </>
  );
};

export default App;

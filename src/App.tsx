import Scene0TitleCard from '@/scenes/Scene0_TitleCard';
import Scene1Personal from '@/scenes/Scene1_Personal';
import SceneStub from '@/scenes/SceneStub';
import NavDots from '@/components/NavDots';
import ProgressBar from '@/components/ProgressBar';
import { useScrollEngine } from '@/lib/scrollStore';
import { SCENES } from '@/content/content';

const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI'];

const App = () => {
  useScrollEngine();

  return (
    <>
      <ProgressBar />
      <NavDots />
      <main>
        <Scene0TitleCard />
        <Scene1Personal />
        {SCENES.slice(2).map((scene) => (
          <SceneStub
            key={scene.id}
            index={scene.index}
            id={scene.id}
            label={scene.label}
            numeral={NUMERALS[scene.index]}
          />
        ))}
      </main>
    </>
  );
};

export default App;

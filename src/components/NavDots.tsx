import { useSceneStore } from '@/lib/scrollStore';
import { SCENES } from '@/content/content';

/**
 * Scene navigation. Real anchors, so keyboard and screen-reader users get a
 * working table of contents rather than decorative dots. Subscribes only to
 * activeScene — discrete state that changes about six times per full scroll.
 */
export const NavDots = () => {
  const activeScene = useSceneStore((s) => s.activeScene);

  return (
    <nav
      aria-label="Scenes"
      className="fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 md:block"
    >
      <ul className="flex flex-col gap-4">
        {SCENES.map((scene) => {
          const active = scene.index === activeScene;
          return (
            <li key={scene.id}>
              <a
                href={`#${scene.id}`}
                aria-current={active ? 'true' : undefined}
                className="group flex items-center justify-end gap-3"
              >
                <span
                  className={`font-mono text-[0.6rem] uppercase tracking-[0.18em] transition-opacity duration-300 ${
                    active ? 'text-primary opacity-100' : 'text-muted-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                  }`}
                >
                  {scene.label}
                </span>
                <span
                  aria-hidden="true"
                  className={`block h-px transition-all duration-300 ${
                    active ? 'w-7 bg-primary' : 'w-3.5 bg-muted-foreground/50 group-hover:w-5'
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default NavDots;

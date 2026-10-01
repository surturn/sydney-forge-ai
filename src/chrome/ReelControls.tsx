export function ReelControls({ playing, onSkip, onToggle }: { playing: boolean; onSkip: () => void; onToggle: () => void }) {
  return (
    <div data-reel-controls className="fixed bottom-4 right-4 z-[70] flex gap-2" style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <button type="button" className="meta min-h-[44px] bg-paper px-4 text-ink" onClick={onSkip}>
        Skip intro
      </button>
      <button type="button" className="meta min-h-[44px] bg-paper px-4 text-ink" onClick={onToggle}>
        {playing ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}

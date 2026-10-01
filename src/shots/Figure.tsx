import type { Media } from '@/content';

/** An editorial figure with crop marks and a caption; placeholders say so. */
export function Figure({
  media,
  caption,
  priority = false,
  className = '',
  backdrop = false,
}: {
  media: Media;
  caption: string;
  priority?: boolean;
  className?: string;
  /** An offset cobalt plate behind the image, like a print run slightly out of register. */
  backdrop?: boolean;
}) {
  return (
    <figure className={`relative ${className}`}>
      <div className="relative">
        {backdrop && (
          <span
            data-backdrop
            aria-hidden="true"
            className="absolute inset-0 translate-x-3 translate-y-3 bg-cobalt md:translate-x-4 md:translate-y-4"
          />
        )}
        <div data-reel="portrait" className="group relative bg-paper-raised">
          <img
            src={media.src}
            alt={media.alt}
            width={media.width}
            height={media.height}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            {...{ fetchpriority: priority ? 'high' : 'auto' }}
            className="block h-auto w-full grayscale-[20%] transition-[filter] duration-500 group-hover:grayscale-0"
          />
          {/* Crop marks: four L-shaped corners just outside the image. */}
          <span aria-hidden="true" className="pointer-events-none absolute -left-2 -top-2 h-4 w-4 border-l-2 border-t-2 border-ink" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-2 h-4 w-4 border-r-2 border-t-2 border-ink" />
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-2 -left-2 h-4 w-4 border-b-2 border-l-2 border-ink" />
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-2 -right-2 h-4 w-4 border-b-2 border-r-2 border-ink" />
        </div>
      </div>
      <figcaption className={`meta ${backdrop ? 'mt-7' : 'mt-2'}`}>
        {caption}
        {media.placeholder ? ' — placeholder' : ''}
      </figcaption>
    </figure>
  );
}

import type { Media } from '@/content';

/** An editorial figure with crop marks and a caption; placeholders say so. */
export function Figure({
  media,
  caption,
  priority = false,
  className = '',
}: {
  media: Media;
  caption: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={`relative ${className}`}>
      <div data-reel="portrait" className="relative bg-paper-raised">
        <img
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          {...{ fetchpriority: priority ? 'high' : 'auto' }}
          className="block h-auto w-full"
        />
        {/* Crop marks: four L-shaped corners just outside the image. */}
        <span aria-hidden="true" className="pointer-events-none absolute -left-2 -top-2 h-4 w-4 border-l-2 border-t-2 border-ink" />
        <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-2 h-4 w-4 border-r-2 border-t-2 border-ink" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-2 -left-2 h-4 w-4 border-b-2 border-l-2 border-ink" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-2 -right-2 h-4 w-4 border-b-2 border-r-2 border-ink" />
      </div>
      <figcaption className="meta mt-2">
        {caption}
        {media.placeholder ? ' — placeholder' : ''}
      </figcaption>
    </figure>
  );
}

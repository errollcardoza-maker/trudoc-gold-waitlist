/* eslint-disable @next/next/no-img-element -- decorative SVGs at fractional sizes; next/image adds nothing for SVG */
import type { ComponentProps } from 'react';

type Props = Omit<ComponentProps<'img'>, 'width' | 'height'> & {
  src: string;
  w: number;
  h: number;
  /** false = size comes from className (responsive); w/h are then only the intrinsic attributes. */
  sized?: boolean;
};

/** Lazy-loaded by default; pass `loading="eager"` for above-the-fold icons. */
export function Icon({ src, w, h, alt = '', className, style, loading = 'lazy', sized = true, ...rest }: Props) {
  return (
    <img
      {...rest}
      src={src}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      width={Math.round(w)}
      height={Math.round(h)}
      decoding="async"
      loading={loading}
      className={`block ${className ?? ''}`}
      style={sized ? { width: w, height: h, ...style } : style}
    />
  );
}

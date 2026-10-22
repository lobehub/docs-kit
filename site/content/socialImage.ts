import type { MetaDescriptor } from 'react-router';

/**
 * `twitter:image` for the configured social preview image. X falls back to
 * `og:image` only inconsistently, so the image is repeated explicitly; with no
 * image configured, nothing is emitted.
 */
export const twitterImageMeta = (image: string | undefined): MetaDescriptor[] =>
  image ? [{ content: image, name: 'twitter:image' }] : [];

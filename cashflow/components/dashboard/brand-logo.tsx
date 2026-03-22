'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * App logo — fixed height, width follows natural aspect ratio (no stretch/squash).
 * Uses next/image with object-contain; parent should not set both w and h on the image.
 */
const SIZE_CLASS = {
  sm: 'h-7 w-auto max-h-7',
  md: 'h-8 w-auto max-h-8',
  lg: 'h-10 w-auto max-h-10',
  xl: 'h-12 w-auto max-h-12',
} as const;

export type BrandLogoSize = keyof typeof SIZE_CLASS;

export interface BrandLogoProps {
  className?: string;
  size?: BrandLogoSize;
  /** Cap width so wide logos don’t overflow narrow parents (e.g. collapsed sidebar) */
  maxWidthClassName?: string;
  priority?: boolean;
}

/** Intrinsic dimensions for next/image (ratio hint only; display size from CSS) */
const INTRINSIC_W = 320;
const INTRINSIC_H = 96;

export function BrandLogo({
  className,
  size = 'md',
  maxWidthClassName = 'max-w-[9rem]',
  priority = false,
}: BrandLogoProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        className
      )}
    >
      <Image
        src="/logo.png"
        alt="CashFlow"
        width={INTRINSIC_W}
        height={INTRINSIC_H}
        priority={priority}
        sizes="(max-width: 1024px) 120px, 144px"
        className={cn(
          'object-contain object-center',
          SIZE_CLASS[size],
          maxWidthClassName
        )}
      />
    </span>
  );
}

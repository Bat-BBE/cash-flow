'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/translations';
import { useDashboard } from '@/components/providers/dashboard-provider';
import { cn } from '@/lib/utils';
import { mainNavItems, badgeColors } from '@/components/dashboard/nav-config';

function isNavActive(pathname: string, href: string) {
  if (href === '/home') return pathname === '/home' || pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { language } = useDashboard();
  const t = useTranslation(language);

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 w-full md:hidden',
        'isolate overflow-hidden',
        'border-t border-white/[0.07]',
        'bg-brand-bg/[0.97] backdrop-blur-[14px] backdrop-saturate-150',
        'shadow-[0_-6px_30px_-4px_rgba(15,23,42,0.45)]',
        'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-px',
        'before:bg-gradient-to-r before:from-transparent before:via-white/[0.12] before:to-transparent',
        /* Instagram-тай төстэй: дээд/доод амар зай + home indicator */
        'pt-2.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))]',
      )}
      aria-label="Үндсэн цэс"
    >
      <div
        className={cn(
          'mx-auto flex w-full max-w-2xl items-end justify-between',
          'min-h-[2.65rem] gap-1 px-2 py-2 sm:px-3',
        )}
      >
        {mainNavItems.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex min-w-0 flex-1 flex-col items-center justify-end gap-1',
                'outline-none [-webkit-tap-highlight-color:transparent]',
                'transition-transform duration-150 active:scale-[0.97]',
              )}
            >
              <span
                className={cn(
                  'relative flex shrink-0 items-center justify-center transition-all duration-300 ease-out',
                  active
                    ? [
                        '-translate-y-0.5',
                        'h-8 min-h-[32px] w-8 min-w-[32px]',
                        'rounded-[11px]',
                        'bg-gradient-to-b from-violet-500 from-[-5%] via-violet-600 to-indigo-800',
                        'text-white',
                        'shadow-[0_6px_18px_-6px_rgba(124,58,237,0.55),inset_0_1px_0_rgba(255,255,255,0.22)]',
                        'ring-1 ring-white/12',
                        'before:pointer-events-none before:absolute before:inset-x-1 before:top-[3px] before:h-px before:rounded-full before:bg-white/35',
                      ]
                    : [
                        'h-7 w-full max-w-[36px] translate-y-0',
                        'rounded-[10px]',
                        'bg-white/[0.035]',
                        'ring-1 ring-transparent',
                        'group-active:bg-white/[0.06]',
                      ],
                )}
              >
                <span
                  className={cn(
                    'material-symbols-outlined select-none leading-none transition-all duration-300',
                    active ? 'text-[16px]' : 'text-[15px] text-white/42',
                  )}
                  style={
                    active
                      ? { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" }
                      : { fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20" }
                  }
                >
                  {item.icon}
                </span>
              </span>

              <span
                className={cn(
                  'max-w-full truncate px-0.5 text-center text-[8px] font-medium leading-tight tracking-wide transition-colors duration-300 sm:text-[8.5px]',
                  active ? 'font-semibold text-white/88' : 'text-white/32',
                )}
              >
                {t(item.translationKey as any)}
              </span>

              {item.badge && (
                <span
                  className={cn(
                    'absolute -right-0.5 top-0 z-[2] min-w-[12px] rounded border border-white/10 px-[3px] text-center text-[6px] font-black leading-none',
                    badgeColors[item.badge.color ?? 'brand'],
                    item.badge.count == null && 'px-1',
                    active && 'ring-1 ring-brand-bg/80',
                  )}
                >
                  {item.badge.count ?? '·'}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

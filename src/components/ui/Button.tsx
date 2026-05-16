/**
 * Button — non-magnetic baseline button primitive.
 *
 * Use this for everything that's NOT a primary marketing CTA. The hero/CTA
 * surfaces still use <MagneticButton> for the spring-physics pull; this
 * primitive is the lighter-weight option for forms, admin panels, modal
 * actions, and any context where the magnetic effect would be overkill.
 *
 * Server component by default — pass an `onClick` only when you actually
 * need a client island; static link-style buttons render fine on the
 * server via `as="a"`.
 *
 * Variants pulled directly from the dashboard's pill/button styles so the
 * primitive can drop into existing surfaces without redesign:
 *   - primary: lime fill on ink text (the hero CTA tone)
 *   - secondary: bone fill on ink text (forms, modals)
 *   - ghost: transparent with a 1px lime border, lime text
 *
 * No new design decisions live here. If you find yourself wanting a fourth
 * variant, add it to the LOCKED decisions table in CLAUDE.md first.
 */

import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
};

type ButtonAsButton = CommonProps & {
  as?: 'button';
} & Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'className'>;

type ButtonAsAnchor = CommonProps & {
  as: 'a';
} & Omit<ComponentPropsWithoutRef<'a'>, 'children' | 'className'>;

type Props = ButtonAsButton | ButtonAsAnchor;

const BASE =
  'focus-bd inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-base',
  lg: 'h-14 px-8 text-lg',
};

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-[color:var(--bd-lime)] text-[color:var(--bd-ink)] hover:bg-[color:var(--bd-lime-dim,#94c000)]',
  secondary:
    'bg-[color:var(--bd-bone)] text-[color:var(--bd-ink)] hover:bg-[color:var(--bd-bone)]/85',
  ghost:
    'border border-[color:var(--bd-lime)] text-[color:var(--bd-lime)] hover:bg-[color:var(--bd-lime)]/10',
};

function cls(variant: Variant, size: Size, extra: string): string {
  return [BASE, SIZES[size], VARIANTS[variant], extra].filter(Boolean).join(' ');
}

export default function Button(props: Props) {
  const { children, variant = 'primary', size = 'md', className = '' } = props;
  if (props.as === 'a') {
    const { as: _as, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
    void _as;
    void _v;
    void _s;
    void _c;
    void _ch;
    return (
      <a className={cls(variant, size, className)} {...rest}>
        {children}
      </a>
    );
  }
  const { as: _as, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;
  void _as;
  void _v;
  void _s;
  void _c;
  void _ch;
  return (
    <button className={cls(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

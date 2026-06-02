'use client'

import { useCallback } from 'react'
import { MousePointerClick, Link2, Layers } from 'lucide-react'
import { BentoCell } from '@/components/bento-grid'

const SPOTLIGHT_BG =
  'radial-gradient(250px circle at var(--spotlight-x, 50%) var(--spotlight-y, 0%), oklch(0.62 0.22 250 / 0.07), transparent 70%)'

const features = [
  {
    icon: MousePointerClick,
    iconDelay: '',
    title: 'Build in seconds',
    description: 'Drag items into your tier list. No friction, no account needed to start.',
    animDelay: '80ms',
  },
  {
    icon: Link2,
    iconDelay: '0.5s',
    title: 'Share with a link',
    description: 'One URL. Works on any device. No downloads, no installs required.',
    animDelay: '160ms',
  },
  {
    icon: Layers,
    iconDelay: '1s',
    title: 'Any category',
    description: 'Movies, games, albums, food—if it can be ranked, tier-maker handles it.',
    animDelay: '240ms',
  },
] as const

export function BentoFeatureCells() {
  const handleSpotlight = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--spotlight-x', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--spotlight-y', `${e.clientY - rect.top}px`)
  }, [])

  return (
    <>
      {features.map(({ icon: Icon, iconDelay, title, description, animDelay }) => (
        <BentoCell
          key={title}
          colSpan={4}
          className={`flex animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:${animDelay}]`}
        >
          <div
            onMouseMove={handleSpotlight}
            className="relative flex flex-col justify-between p-6"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: SPOTLIGHT_BG }}
            />
            <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-inset ring-primary/10 transition-[ring-color,background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:ring-primary/20">
              <Icon
                size={16}
                strokeWidth={1.5}
                className={`animate-[bento-float_4s_ease-in-out_infinite${iconDelay ? `_${iconDelay}` : ''}]`}
              />
            </div>
            <div className="relative">
              <h3 className="font-heading text-sm font-semibold text-foreground transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-primary">
                {title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        </BentoCell>
      ))}
    </>
  )
}

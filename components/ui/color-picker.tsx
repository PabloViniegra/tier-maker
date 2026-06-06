'use client'

import Color, { type ColorInstance } from 'color'
import { PipetteIcon, CheckIcon } from 'lucide-react'
import { Slider } from '@base-ui/react/slider'
import {
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { parseCssColor } from '@/lib/color/parse-css-color'

type ColorFormat = 'hex' | 'rgb' | 'css' | 'hsl'

type ColorPickerContextValue = {
  hue: number
  saturation: number
  lightness: number
  alpha: number
  mode: ColorFormat
  setHue: (hue: number) => void
  setSaturation: (saturation: number) => void
  setLightness: (lightness: number) => void
  setAlpha: (alpha: number) => void
  setMode: (mode: ColorFormat) => void
}

const ColorPickerContext = createContext<ColorPickerContextValue | undefined>(undefined)

export const useColorPicker = () => {
  const context = useContext(ColorPickerContext)
  if (!context) {
    throw new Error('useColorPicker must be used within a ColorPickerProvider')
  }
  return context
}

export type ColorPickerProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'value' | 'defaultValue'> & {
  value: string
  onChange: (value: string) => void
}

export const ColorPicker = ({ value, onChange, className, ...props }: ColorPickerProps) => {
  const incoming = useMemo(() => {
    try {
      return Color(parseCssColor(value).hex)
    } catch {
      return Color('#000000')
    }
  }, [value])

  const hsl = useMemo(() => {
    const arr = incoming.hsl().array()
    return {
      hue: Number.isNaN(arr[0]) ? 0 : arr[0],
      saturation: Number.isNaN(arr[1]) ? 0 : arr[1],
      lightness: Number.isNaN(arr[2]) ? 0 : arr[2],
    }
  }, [incoming])

  const [hue, setHue] = useState(hsl.hue)
  const [saturation, setSaturation] = useState(hsl.saturation)
  const [lightness, setLightness] = useState(hsl.lightness)
  const [alpha, setAlpha] = useState(incoming.alpha() * 100)
  const [mode, setMode] = useState<ColorFormat>('hex')
  const [lastSyncedValue, setLastSyncedValue] = useState(value)

  if (lastSyncedValue !== value) {
    setLastSyncedValue(value)
    setHue(hsl.hue)
    setSaturation(hsl.saturation)
    setLightness(hsl.lightness)
    setAlpha(incoming.alpha() * 100)
  }

  useEffect(() => {
    const color = Color.hsl(hue, saturation, lightness).alpha(alpha / 100)
    onChange(color.hex())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hue, saturation, lightness, alpha])

  return (
    <ColorPickerContext.Provider
      value={{
        hue,
        saturation,
        lightness,
        alpha,
        mode,
        setHue,
        setSaturation,
        setLightness,
        setAlpha,
        setMode,
      }}
    >
      <div className={cn('flex w-full flex-col gap-3', className)} {...props} />
    </ColorPickerContext.Provider>
  )
}

export type ColorPickerSelectionProps = HTMLAttributes<HTMLDivElement>

export const ColorPickerSelection = memo(({ className, ...props }: ColorPickerSelectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { hue, saturation, lightness, setSaturation, setLightness } = useColorPicker()

  const backgroundGradient = useMemo(
    () =>
      `linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0)),
       linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0)),
       hsl(${hue}, 100%, 50%)`,
    [hue]
  )

  // Derive cursor position from actual saturation/lightness so it always reflects the current color.
  const positionX = saturation / 100
  const topLightness = positionX < 0.01 ? 100 : 50 + 50 * (1 - positionX)
  const positionY = topLightness > 0 ? Math.max(0, Math.min(1, 1 - lightness / topLightness)) : 0

  const updateFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
      setSaturation(x * 100)
      const tl = x < 0.01 ? 100 : 50 + 50 * (1 - x)
      setLightness(tl * (1 - y))
    },
    [setSaturation, setLightness]
  )

  useEffect(() => {
    if (!isDragging) return
    const handleMove = (e: PointerEvent) => updateFromEvent(e.clientX, e.clientY)
    const handleUp = () => setIsDragging(false)
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [isDragging, updateFromEvent])

  return (
    <div
      ref={containerRef}
      role='application'
      aria-label='Color saturation and brightness'
      className={cn('relative aspect-[2/1] w-full touch-none cursor-crosshair rounded-md', className)}
      style={{ background: backgroundGradient }}
      onPointerDown={(e) => {
        e.preventDefault()
        setIsDragging(true)
        updateFromEvent(e.clientX, e.clientY)
      }}
      {...props}
    >
      <div
        className='pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]'
        style={{ left: `${positionX * 100}%`, top: `${positionY * 100}%` }}
      />
    </div>
  )
})
ColorPickerSelection.displayName = 'ColorPickerSelection'

export type ColorPickerHueProps = ComponentProps<typeof Slider.Root>

export const ColorPickerHue = ({ className, ...props }: ColorPickerHueProps) => {
  const { hue, setHue } = useColorPicker()
  return (
    <Slider.Root
      className={cn('relative flex h-4 w-full touch-none select-none', className)}
      max={360}
      step={1}
      value={hue}
      onValueChange={(next) => setHue(next as number)}
      aria-label='Hue'
      {...props}
    >
      <Slider.Control className='flex w-full touch-none items-center py-1'>
        <Slider.Track className='relative h-3 w-full grow overflow-hidden rounded-full bg-[linear-gradient(90deg,#FF0000,#FFFF00,#00FF00,#00FFFF,#0000FF,#FF00FF,#FF0000)]'>
          <Slider.Indicator className='hidden' />
        </Slider.Track>
        <Slider.Thumb
          index={0}
          aria-label='Hue'
          className='block h-4 w-4 rounded-full border-2 border-white bg-white shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
        />
      </Slider.Control>
    </Slider.Root>
  )
}

export type ColorPickerAlphaProps = ComponentProps<typeof Slider.Root>

export const ColorPickerAlpha = ({ className, ...props }: ColorPickerAlphaProps) => {
  const { alpha, setAlpha } = useColorPicker()
  return (
    <Slider.Root
      className={cn('relative flex h-4 w-full touch-none select-none', className)}
      max={100}
      step={1}
      value={alpha}
      onValueChange={(next) => setAlpha(next as number)}
      aria-label='Alpha'
      {...props}
    >
      <Slider.Control className='flex w-full touch-none items-center py-1'>
        <Slider.Track
          className='relative h-3 w-full grow overflow-hidden rounded-full bg-[url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAFklEQVQYV2P8z8DwnwEPYBxVMK6iAABT1QbYBaAipgAAAABJRU5ErkJggg==)] bg-[length:8px_8px] bg-center'
        >
          <div
            className='pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-transparent to-black/70 dark:to-white/70'
            style={{ width: `${alpha}%` }}
          />
          <Slider.Indicator className='hidden' />
        </Slider.Track>
        <Slider.Thumb
          index={0}
          aria-label='Alpha'
          className='block h-4 w-4 rounded-full border-2 border-white bg-white shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
        />
      </Slider.Control>
    </Slider.Root>
  )
}

export type ColorPickerEyeDropperProps = ComponentProps<typeof Button>

export const ColorPickerEyeDropper = ({ className, ...props }: ColorPickerEyeDropperProps) => {
  const { setHue, setSaturation, setLightness, setAlpha } = useColorPicker()

  const handlePick = async () => {
    const EyeDropperCtor = (window as unknown as { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } })
      .EyeDropper
    if (!EyeDropperCtor) return
    try {
      const dropper = new EyeDropperCtor()
      const result = await dropper.open()
      const picked = Color(result.sRGBHex)
      const [h, s, l] = picked.hsl().array()
      setHue(Number.isNaN(h) ? 0 : h)
      setSaturation(Number.isNaN(s) ? 0 : s)
      setLightness(Number.isNaN(l) ? 0 : l)
      setAlpha(100)
    } catch {
      // user cancelled
    }
  }

  return (
    <Button
      type='button'
      variant='outline'
      size='icon-sm'
      onClick={handlePick}
      aria-label='Pick color from screen'
      className={cn('shrink-0 text-muted-foreground', className)}
      {...props}
    >
      <PipetteIcon size={14} />
    </Button>
  )
}

const FORMATS: ColorFormat[] = ['hex', 'rgb', 'css', 'hsl']

export type ColorPickerFormatProps = HTMLAttributes<HTMLDivElement>

export const ColorPickerFormat = ({ className, ...props }: ColorPickerFormatProps) => {
  const { mode, setMode } = useColorPicker()
  return (
    <div
      role='radiogroup'
      aria-label='Color format'
      className={cn('flex h-8 overflow-hidden rounded-md ring-1 ring-inset ring-border', className)}
      {...props}
    >
      {FORMATS.map((format) => {
        const active = mode === format
        return (
          <button
            key={format}
            type='button'
            role='radio'
            aria-checked={active}
            onClick={() => setMode(format)}
            className={cn(
              'flex-1 px-1.5 text-[0.65rem] font-medium uppercase tracking-wider transition-colors',
              active ? 'bg-secondary text-secondary-foreground' : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {format}
          </button>
        )
      })}
    </div>
  )
}

function formatValue(mode: ColorFormat, color: ColorInstance): { primary: string; suffix?: string } {
  if (mode === 'hex') {
    return { primary: color.hex() }
  }
  if (mode === 'rgb') {
    const [r, g, b] = color.rgb().array().map((v: number) => Math.round(v))
    return { primary: `${r}, ${g}, ${b}` }
  }
  if (mode === 'hsl') {
    const [h, s, l] = color.hsl().array().map((v: number) => Math.round(v))
    return { primary: `${h}, ${s}%, ${l}%` }
  }
  const [r, g, b] = color.rgb().array().map((v: number) => Math.round(v))
  const a = color.alpha()
  return { primary: `rgba(${r}, ${g}, ${b}, ${Number.isNaN(a) ? 1 : a})` }
}

export type ColorPickerOutputProps = HTMLAttributes<HTMLDivElement>

export const ColorPickerOutput = ({ className, ...props }: ColorPickerOutputProps) => {
  const { hue, saturation, lightness, alpha, mode } = useColorPicker()
  const color = useMemo(
    () => Color.hsl(hue, saturation, lightness, alpha / 100),
    [hue, saturation, lightness, alpha]
  )
  const { primary, suffix } = useMemo(() => formatValue(mode, color), [mode, color])

  return (
    <div
      className={cn('flex h-8 w-full items-center gap-1.5 rounded-md bg-secondary px-2', className)}
      {...props}
    >
      <div
        aria-hidden
        className='size-5 shrink-0 rounded border border-border'
        style={{ background: color.hex() }}
      />
      <Input
        readOnly
        value={primary}
        aria-label='Selected color value'
        className='h-6 flex-1 border-0 bg-transparent px-1 font-mono text-[0.7rem] uppercase tracking-tight shadow-none focus-visible:ring-0'
      />
      {suffix ? (
        <span className='font-mono text-[0.65rem] text-muted-foreground'>{suffix}</span>
      ) : (
        <CheckIcon size={12} className='shrink-0 text-muted-foreground' aria-hidden />
      )}
    </div>
  )
}

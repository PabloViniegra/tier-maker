'use client'

import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from '@/components/ui/color-picker'

type TierColorPickerProps = {
  value: string
  onChange: (color: string) => void
}

export function TierColorPicker({ value, onChange }: TierColorPickerProps) {
  return (
    <ColorPicker value={value} onChange={onChange}>
      <ColorPickerSelection />
      <div className="flex items-center gap-2">
        <ColorPickerEyeDropper />
        <div className="flex w-full flex-col gap-2">
          <ColorPickerHue />
          <ColorPickerAlpha />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <ColorPickerOutput />
        <ColorPickerFormat />
      </div>
    </ColorPicker>
  )
}

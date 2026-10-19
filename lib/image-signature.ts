import type { AllowedImageType } from '@/lib/validators/tier-list'

export const IMAGE_SIGNATURE_LENGTH = 12

const RIFF = [0x52, 0x49, 0x46, 0x46]
const WEBP = [0x57, 0x45, 0x42, 0x50]

function startsWith(bytes: Uint8Array, signature: number[], offset = 0) {
  return signature.every((value, i) => bytes[offset + i] === value)
}

// The declared MIME type comes from the client, so only the file header
// decides what gets stored.
export function detectImageType(bytes: Uint8Array): AllowedImageType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg'
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    return 'image/png'
  if (
    startsWith(bytes, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
    startsWith(bytes, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
  )
    return 'image/gif'
  if (startsWith(bytes, RIFF) && startsWith(bytes, WEBP, 8)) return 'image/webp'
  return null
}

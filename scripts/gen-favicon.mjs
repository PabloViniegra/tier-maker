import { deflateSync } from 'zlib'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')

// ── CRC32 ────────────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

// ── PNG chunk builder ────────────────────────────────────────────────────────
function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const len = Buffer.allocUnsafe(4)
  len.writeUInt32BE(data.length, 0)
  const crcInput = Buffer.concat([typeBytes, data])
  const crc = Buffer.allocUnsafe(4)
  crc.writeUInt32BE(crc32(crcInput), 0)
  return Buffer.concat([len, typeBytes, data, crc])
}

// ── Build 32×32 RGBA image ───────────────────────────────────────────────────
const W = 32, H = 32
const R = 0x2e, G = 0x62, B = 0xd4  // #2E62D4

const pixels = new Uint8Array(W * H * 4) // all transparent

function fillRect(x, y, w, h, alpha) {
  const a = Math.round(alpha * 255)
  for (let row = y; row < Math.min(y + h, H); row++) {
    for (let col = x; col < Math.min(x + w, W); col++) {
      const i = (row * W + col) * 4
      pixels[i] = R; pixels[i + 1] = G; pixels[i + 2] = B; pixels[i + 3] = a
    }
  }
}

// Bars scaled from 20×20 viewBox → 32×32 (×1.6)
// bar1: y=3, h=5, width=32  (full)
// bar2: y=13, h=5, width=22
// bar3: y=22, h=5, width=13
fillRect(0, 3,  32, 5, 1.0)
fillRect(0, 13, 22, 5, 0.6)
fillRect(0, 22, 13, 5, 0.3)

// ── Build PNG ────────────────────────────────────────────────────────────────
// Raw scanlines: filter byte (0=None) + RGBA row
const scanlines = Buffer.allocUnsafe(H * (1 + W * 4))
for (let row = 0; row < H; row++) {
  const base = row * (1 + W * 4)
  scanlines[base] = 0 // filter None
  for (let col = 0; col < W; col++) {
    const src = (row * W + col) * 4
    const dst = base + 1 + col * 4
    scanlines[dst]     = pixels[src]
    scanlines[dst + 1] = pixels[src + 1]
    scanlines[dst + 2] = pixels[src + 2]
    scanlines[dst + 3] = pixels[src + 3]
  }
}

const ihdrData = Buffer.allocUnsafe(13)
ihdrData.writeUInt32BE(W, 0)
ihdrData.writeUInt32BE(H, 4)
ihdrData[8] = 8   // bit depth
ihdrData[9] = 6   // color type: RGBA
ihdrData[10] = 0  // compression
ihdrData[11] = 0  // filter
ihdrData[12] = 0  // interlace

const compressed = deflateSync(scanlines)

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), // signature
  chunk('IHDR', ihdrData),
  chunk('IDAT', compressed),
  chunk('IEND', Buffer.alloc(0)),
])

// ── Wrap in ICO ───────────────────────────────────────────────────────────────
const icoHeader = Buffer.allocUnsafe(6)
icoHeader.writeUInt16LE(0, 0)  // reserved
icoHeader.writeUInt16LE(1, 2)  // type: ICO
icoHeader.writeUInt16LE(1, 4)  // image count: 1

const dirEntry = Buffer.allocUnsafe(16)
dirEntry[0] = 32         // width  (0 = 256)
dirEntry[1] = 32         // height (0 = 256)
dirEntry[2] = 0          // color count
dirEntry[3] = 0          // reserved
dirEntry.writeUInt16LE(1, 4)            // planes
dirEntry.writeUInt16LE(32, 6)           // bit count
dirEntry.writeUInt32LE(png.length, 8)   // bytes in image
dirEntry.writeUInt32LE(22, 12)          // offset: 6 (header) + 16 (dir entry)

const ico = Buffer.concat([icoHeader, dirEntry, png])
writeFileSync(join(root, 'app', 'favicon.ico'), ico)

console.log(`favicon.ico written (${ico.length} bytes, PNG ${png.length} bytes)`)

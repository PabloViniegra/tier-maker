const DEFAULT_MAX_LENGTH = 64
const SUFFIX_SEPARATOR = '-'

/**
 * Transforms a title into a URL-safe slug.
 * - Lowercase
 * - Replace spaces/underscores with hyphens
 * - Remove non-[a-z0-9-] characters
 * - Collapse consecutive hyphens
 * - Strip leading/trailing hyphens
 * - Truncate to maxLength
 */
export function slugify(title: string, maxLength = DEFAULT_MAX_LENGTH): string {
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    // Remove accents by stripping non-ASCII letters — keep only a-z after normalization
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')

  if (slug.length > maxLength) {
    // Truncate to maxLength, but avoid ending with a dangling hyphen
    slug = slug.slice(0, maxLength).replace(/-+$/, '')
  }

  return slug
}

/**
 * Generates a unique slug from a title, appending a numeric suffix
 * (-2, -3, ...) if the base slug already exists in `existingSlugs`.
 */
export function generateSlug(
  title: string,
  existingSlugs: Set<string>,
  maxLength = DEFAULT_MAX_LENGTH
): string {
  const base = slugify(title, maxLength)

  if (!base) {
    // Fallback when title slugifies to empty string
    return generateSlug('untitled', existingSlugs, maxLength)
  }

  if (!existingSlugs.has(base)) {
    return base
  }

  let counter = 2
  let candidate: string
  do {
    const suffix = `${SUFFIX_SEPARATOR}${counter}`
    // Truncate base if needed to fit suffix within maxLength
    const available = maxLength - suffix.length
    const truncated =
      available >= 1 ? base.slice(0, available) : base.slice(0, maxLength)
    candidate = `${truncated}${suffix}`
    counter++
  } while (existingSlugs.has(candidate) && counter <= 9999)

  return candidate
}

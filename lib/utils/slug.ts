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
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove accents by stripping non-ASCII letters — keep only a-z after normalization
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove any character that isn't a-z, 0-9, or hyphen
    .replace(/[^a-z0-9-]+/g, '-')
    // Collapse consecutive hyphens
    .replace(/-{2,}/g, '-')
    // Strip leading/trailing hyphens
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

  // Try -2, -3, ... until we find an available slug
  let counter = 2
  let candidate: string
  const suffixMax = SUFFIX_SEPARATOR.length + String(counter).length

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

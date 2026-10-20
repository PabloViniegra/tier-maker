import 'server-only'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/lib/cache-tags'

export function revalidateExplore(): void {
  revalidatePath('/explore', 'layout')
  revalidatePath('/dashboard/explore', 'layout')
  // Expire immediately: stale-while-revalidate would serve a list that was just
  // made private or deleted to the next visitor.
  revalidateTag(CACHE_TAGS.publicTierLists, { expire: 0 })
  revalidateTag(CACHE_TAGS.publicCategories, {})
}

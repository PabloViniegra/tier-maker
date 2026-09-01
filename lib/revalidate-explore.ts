import 'server-only'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/lib/cache-tags'

export function revalidateExplore(): void {
  revalidatePath('/explore', 'layout')
  revalidatePath('/dashboard/explore', 'layout')
  revalidateTag(CACHE_TAGS.publicTierLists, {})
  revalidateTag(CACHE_TAGS.publicCategories, {})
}

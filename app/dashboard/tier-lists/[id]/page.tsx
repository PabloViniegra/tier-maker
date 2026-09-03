import { notFound } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getTierListById } from '@/lib/queries/tier-templates'
import { TierListEditor } from './_components/tier-list-editor'

type Props = {
  params: Promise<{ id: string }>
}

export default async function TierListDetailPage({ params }: Props) {
  const [{ id }, session] = await Promise.all([params, getSession()])
  if (!session) notFound()

  const data = await getTierListById(id, session.user.id)
  if (!data) notFound()

  return (
    <TierListEditor
      id={id}
      data={{
        title: data.title,
        description: data.description,
        category: data.category,
        coverImageUrl: data.coverImageUrl,
        sidebarItems: data.sidebarItems,
        rows: data.rows,
      }}
    />
  )
}

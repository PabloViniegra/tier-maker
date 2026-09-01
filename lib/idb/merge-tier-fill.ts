import type {
  TierListDetailSeed,
  EditorTierRow,
  TierItem,
} from '@/lib/stores/tier-editor'
import type { TierFillDraft } from './tier-fill-store'
import { newId } from '@/lib/utils/new-id'

// Policy: server is authoritative for structure (rows, bank catalogue).
// IDB draft is authoritative for item placement.
// Bank = server items not yet placed; IDB bank items survive iff still in server catalogue.

function collectPlacedUrls(rows: TierFillDraft['rows']): Set<string> {
  const placed = new Set<string>()
  for (const row of rows) {
    for (const item of row.items) {
      if (item.url) placed.add(item.url)
    }
  }
  return placed
}

function buildDraftRowMap(
  rows: TierFillDraft['rows']
): Map<string, TierItem[]> {
  return new Map(rows.map((r) => [r.id, r.items]))
}

function applyDraftToRows(
  serverRows: TierListDetailSeed['rows'],
  draftRowMap: Map<string, TierItem[]>,
  serverCatalogue: Set<string>
): EditorTierRow[] {
  return serverRows.map((r) => ({
    id: r.id,
    label: r.label,
    color: r.color,
    items: (draftRowMap.get(r.id) ?? []).filter(
      (i) => i.url && serverCatalogue.has(i.url)
    ),
  }))
}

function survivingDraftBankItems(
  draftBank: TierItem[],
  serverCatalogue: Set<string>
): TierItem[] {
  return draftBank.filter((i) => i.url && serverCatalogue.has(i.url))
}

function newServerBankItems(
  sidebarItems: TierListDetailSeed['sidebarItems'],
  placedUrls: Set<string>,
  alreadyInBank: Set<string>
): TierItem[] {
  return sidebarItems
    .filter((i) => !placedUrls.has(i.url) && !alreadyInBank.has(i.url))
    .map((item) => ({
      id: newId(),
      url: item.url,
      label: item.label,
      status: 'uploaded' as const,
    }))
}

export type MergedTierFill = {
  rows: EditorTierRow[]
  bankItems: TierItem[]
}

export function mergeTierFill(
  seed: TierListDetailSeed,
  draft: TierFillDraft | null
): MergedTierFill {
  if (!draft) {
    return {
      rows: seed.rows.map((r) => ({
        id: r.id,
        label: r.label,
        color: r.color,
        items: [],
      })),
      bankItems: seed.sidebarItems.map((item) => ({
        id: newId(),
        url: item.url,
        label: item.label,
        status: 'uploaded' as const,
      })),
    }
  }

  const serverCatalogue = new Set(seed.sidebarItems.map((i) => i.url))
  const placedUrls = collectPlacedUrls(draft.rows)
  const draftRowMap = buildDraftRowMap(draft.rows)

  const rows = applyDraftToRows(seed.rows, draftRowMap, serverCatalogue)
  const surviving = survivingDraftBankItems(draft.bankItems, serverCatalogue)
  const survivingUrls = new Set(
    surviving.flatMap((i) => (i.url ? [i.url] : []))
  )
  const fresh = newServerBankItems(seed.sidebarItems, placedUrls, survivingUrls)

  return {
    rows,
    bankItems: [...surviving, ...fresh],
  }
}

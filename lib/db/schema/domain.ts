import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'
import { user } from './auth'
import type { ImageItem } from '@/lib/validators/tier-list'

export const tierTemplates = pgTable(
  'tier_templates',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    category: text('category').notNull(),
    creatorId: text('creator_id').references(() => user.id, {
      onDelete: 'cascade',
    }),
    coverImageUrl: text('cover_image_url'),
    sidebarItems: jsonb('sidebar_items').$type<ImageItem[]>().notNull(),
    isPublic: boolean('is_public').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('tier_templates_creator_id_idx').on(t.creatorId),
    index('tier_templates_is_public_created_at_idx').on(
      t.isPublic,
      t.createdAt
    ),
    index('tier_templates_slug_idx').on(t.slug),
  ]
)

export const tierRows = pgTable(
  'tier_rows',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    templateId: uuid('template_id').references(() => tierTemplates.id, {
      onDelete: 'cascade',
    }),
    label: text('label').notNull(),
    color: text('color').notNull(),
    order: integer('order').notNull(),
    items: jsonb('items').$type<ImageItem[]>().default([]).notNull(),
  },
  (t) => [index('tier_rows_template_id_idx').on(t.templateId)]
)

export const userCategoryPresets = pgTable(
  'user_category_presets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.name)]
)

export const tierLikes = pgTable(
  'tier_likes',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    templateId: uuid('template_id')
      .notNull()
      .references(() => tierTemplates.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.templateId] }),
    index('tier_likes_template_id_idx').on(t.templateId),
  ]
)

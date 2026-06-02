import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'
import { user } from './auth'

export const tierTemplates = pgTable('tier_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  creatorId: text('creator_id').references(() => user.id, {
    onDelete: 'cascade',
  }),
  sidebarItems: jsonb('sidebar_items').$type<string[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const tierRows = pgTable('tier_rows', {
  id: uuid('id').defaultRandom().primaryKey(),
  templateId: uuid('template_id').references(() => tierTemplates.id, {
    onDelete: 'cascade',
  }),
  label: text('label').notNull(),
  color: text('color').notNull(),
  order: integer('order').notNull(),
})

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

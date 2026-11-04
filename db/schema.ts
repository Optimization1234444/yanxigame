import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core'
export const backups = pgTable('farm_backups', {
  id: text('id').primaryKey(),
  progress: jsonb('progress').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

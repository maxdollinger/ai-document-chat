import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const assistants = sqliteTable('assistant', {
  assistantId: text('assistant_id').primaryKey().notNull(),
  vectorStoreId: text('vector_store_id').notNull(),
  threadId: text('thread_id').notNull(),
  name: text('name').notNull(),
}); 
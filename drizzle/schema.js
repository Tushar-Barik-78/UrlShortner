import { mysqlTable, serial, timestamp, varchar } from 'drizzle-orm/mysql-core';

export const shortenerTable = mysqlTable('shortenerTable', {
  id: serial().primaryKey().autoincrement(),
  url: varchar({length:255}).notNull(),
  shortCode: varchar({length:20}).unique().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt : timestamp().defaultNow().onUpdateNow().notNull(),
});

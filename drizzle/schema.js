import { int, mysqlTable, serial, timestamp, varchar } from 'drizzle-orm/mysql-core';

export const shortenerTable = mysqlTable('shortenerTable', {
  id: serial().primaryKey().autoincrement(),
  url: varchar({length:255}).notNull(),
  shortCode: varchar({length:20}).unique().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt : timestamp().defaultNow().onUpdateNow().notNull(),
});


export const userTable = mysqlTable('users',{
  id: int().autoincrement().primaryKey(),
  name:varchar({length:255}).notNull(),
  email: varchar({length:255}).unique().notNull(),
  password : varchar({length:255}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
})
import { relations } from 'drizzle-orm';
import { int, mysqlTable, serial, timestamp, varchar } from 'drizzle-orm/mysql-core';

export const shortenerTable = mysqlTable('shortenerTable', {
  id: serial().primaryKey().autoincrement(),
  url: varchar({length:255}).notNull(),
  shortCode: varchar({length:20}).unique().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt : timestamp().defaultNow().onUpdateNow().notNull(),
  userId: int("user_id").notNull().references(()=>userTable.id),
});


export const userTable = mysqlTable('users',{
  id: int().autoincrement().primaryKey(),
  name:varchar({length:255}).notNull(),
  email: varchar({length:255}).unique().notNull(),
  password : varchar({length:255}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
})


// ! Define relation between 2 table
// * An user can have many shortlinks
export const userRelation = relations(userTable, ({many})=>({
  shortLink: many(shortenerTable),
}));

// * an shortlink belongs to one user
export const shortLinksRelation = relations(shortenerTable,({one})=>({
  user:one(userTable,{
    fields: [shortenerTable.userId],
    references: [userTable.id],
  })
}))
import { relations } from 'drizzle-orm';
import { boolean, int, mysqlTable, serial, text, timestamp, varchar } from 'drizzle-orm/mysql-core';

export const shortenerTable = mysqlTable('shortenerTable', {
  id: serial().primaryKey().autoincrement(),
  url: varchar({length:255}).notNull(),
  shortCode: varchar({length:20}).unique().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt : timestamp().defaultNow().onUpdateNow().notNull(),
  userId: int("user_id").notNull().references(()=>userTable.id),
});

// ! session schema
export const sessionsTable = mysqlTable("sessions",{
  id: int().autoincrement().primaryKey(),
  userId:int("uesr_id").notNull().references(()=> userTable.id,{onDelete:"cascade"}),
  valid : boolean().default(true).notNull(),
  userAgent : text("user_agent"),
  ip: varchar({length:255}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
})

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
  session : many(sessionsTable),
}));

// * an shortlink belongs to one user
export const shortLinksRelation = relations(shortenerTable,({one})=>({
  user:one(userTable,{
    fields: [shortenerTable.userId],
    references: [userTable.id],
  })
}))

// * seesion realtion with user table 
// * (1 session --> 1 user)
export const seesionRelation = relations(sessionsTable,({one})=>({
  user:one(userTable,{
    fields:[sessionsTable.userId],
    references:[userTable.id],
  })
}))
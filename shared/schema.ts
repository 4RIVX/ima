import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  filename: text("filename"),
  imageUrl: text("image_url"),
  fileSize: text("file_size"),
  resolution: text("resolution"),
  score: integer("score").notNull(),
  classification: text("classification").notNull(), // 'Likely AI-Generated', 'Possibly AI-Manipulated', 'Likely Authentic'
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Analysis = typeof analyses.$inferSelect;

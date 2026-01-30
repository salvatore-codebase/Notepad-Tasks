import { pgTable, text, serial, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  completed: boolean("completed").notNull().default(false),
  order: integer("order").notNull(),
});

// Singleton table to store the app state (one row only)
export const appState = pgTable("app_state", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("My To-Do List"),
  startTime: timestamp("start_time"),
  status: text("status", { enum: ["planning", "running", "finished"] }).notNull().default("planning"),
  paperColor: text("paper_color").notNull().default("#fefcf5"),
  backgroundColor: text("background_color").notNull().default("#f1f5f9"),
});

// Trophy collection - tracks count of each trophy tier earned
export const trophyCounts = pgTable("trophy_counts", {
  id: serial("id").primaryKey(),
  tier1: integer("tier1").notNull().default(0),
  tier2: integer("tier2").notNull().default(0),
  tier3: integer("tier3").notNull().default(0),
  tier4: integer("tier4").notNull().default(0),
  tier5: integer("tier5").notNull().default(0),
  tier6: integer("tier6").notNull().default(0),
  tier7: integer("tier7").notNull().default(0),
  tier8: integer("tier8").notNull().default(0),
});

export const insertTodoSchema = createInsertSchema(todos).omit({ id: true });
export const insertAppStateSchema = createInsertSchema(appState).omit({ id: true });
export const insertTrophyCountsSchema = createInsertSchema(trophyCounts).omit({ id: true });

export type Todo = typeof todos.$inferSelect;
export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type AppState = typeof appState.$inferSelect;
export type InsertAppState = z.infer<typeof insertAppStateSchema>;
export type TrophyCounts = typeof trophyCounts.$inferSelect;
export type InsertTrophyCounts = z.infer<typeof insertTrophyCountsSchema>;

// API Types
export type UpdateTodoRequest = Partial<InsertTodo>;
export type UpdateAppStateRequest = Partial<InsertAppState>;

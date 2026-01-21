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

export const insertTodoSchema = createInsertSchema(todos).omit({ id: true });
export const insertAppStateSchema = createInsertSchema(appState).omit({ id: true });

export type Todo = typeof todos.$inferSelect;
export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type AppState = typeof appState.$inferSelect;
export type InsertAppState = z.infer<typeof insertAppStateSchema>;

// API Types
export type UpdateTodoRequest = Partial<InsertTodo>;
export type UpdateAppStateRequest = Partial<InsertAppState>;

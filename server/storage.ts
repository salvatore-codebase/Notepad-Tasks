import { db } from "./db";
import { todos, appState, type Todo, type InsertTodo, type AppState, type InsertAppState } from "@shared/schema";
import { eq, asc } from "drizzle-orm";

export interface IStorage {
  // Todos
  getTodos(): Promise<Todo[]>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: number, updates: Partial<InsertTodo>): Promise<Todo | undefined>;
  deleteTodo(id: number): Promise<void>;
  reorderTodos(ids: number[]): Promise<Todo[]>;
  
  // App State
  getAppState(): Promise<AppState>;
  updateAppState(updates: Partial<InsertAppState>): Promise<AppState>;
  resetAppState(): Promise<AppState>;
}

export class DatabaseStorage implements IStorage {
  async getTodos(): Promise<Todo[]> {
    return await db.select().from(todos).orderBy(asc(todos.order));
  }

  async createTodo(todo: InsertTodo): Promise<Todo> {
    const [newTodo] = await db.insert(todos).values(todo).returning();
    return newTodo;
  }

  async updateTodo(id: number, updates: Partial<InsertTodo>): Promise<Todo | undefined> {
    const [updated] = await db.update(todos)
      .set(updates)
      .where(eq(todos.id, id))
      .returning();
    return updated;
  }

  async deleteTodo(id: number): Promise<void> {
    await db.delete(todos).where(eq(todos.id, id));
  }

  async reorderTodos(ids: number[]): Promise<Todo[]> {
    // This is a naive implementation, but sufficient for a small list
    const updates = ids.map((id, index) => 
      db.update(todos).set({ order: index }).where(eq(todos.id, id)).returning()
    );
    await Promise.all(updates);
    return this.getTodos();
  }

  async getAppState(): Promise<AppState> {
    const [state] = await db.select().from(appState).limit(1);
    if (state) return state;

    // Initialize if not exists
    const [newState] = await db.insert(appState).values({
      status: 'planning',
      title: 'My To-Do List'
    }).returning();
    return newState;
  }

  async updateAppState(updates: Partial<InsertAppState>): Promise<AppState> {
    // Ensure state exists first
    await this.getAppState();
    
    // Update the singleton row
    // We don't have a known ID for the singleton, so we'll just update the first row
    // Or we can fetch the ID first.
    const current = await this.getAppState();
    const [updated] = await db.update(appState)
      .set(updates)
      .where(eq(appState.id, current.id))
      .returning();
    return updated;
  }

  async resetAppState(): Promise<AppState> {
    const current = await this.getAppState();
    
    // Reset state to planning, clear start time
    const [resetState] = await db.update(appState)
      .set({
        status: 'planning',
        startTime: null,
      })
      .where(eq(appState.id, current.id))
      .returning();
      
    // Optionally clear completed todos or all todos? 
    // "Reset" usually implies starting fresh. Let's delete all todos for a clean slate, 
    // or maybe just uncheck them. Given "Reset" logic, users might want to clear.
    // However, the user didn't specify "Clear", they asked for a "Start Button".
    // I'll assume "Reset" (which I added) clears everything for a new "day".
    // But to be safe, maybe just uncheck them? No, let's delete them to be a true "Reset".
    await db.delete(todos);

    return resetState;
  }
}

export const storage = new DatabaseStorage();

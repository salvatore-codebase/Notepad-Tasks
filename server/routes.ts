import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // -- Todos --
  app.get(api.todos.list.path, async (req, res) => {
    const todos = await storage.getTodos();
    res.json(todos);
  });

  app.post(api.todos.create.path, async (req, res) => {
    try {
      const input = api.todos.create.input.parse(req.body);
      const todo = await storage.createTodo(input);
      res.status(201).json(todo);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.patch(api.todos.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.todos.update.input.parse(req.body);
      const todo = await storage.updateTodo(id, input);
      if (!todo) return res.status(404).json({ message: "Todo not found" });
      res.json(todo);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.delete(api.todos.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteTodo(id);
    res.status(204).send();
  });

  app.post(api.todos.reorder.path, async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ message: "Invalid IDs" });
    const todos = await storage.reorderTodos(ids);
    res.json(todos);
  });

  // -- App State --
  app.get(api.appState.get.path, async (req, res) => {
    const state = await storage.getAppState();
    res.json(state);
  });

  app.patch(api.appState.update.path, async (req, res) => {
    try {
      const input = api.appState.update.input.parse(req.body);
      const state = await storage.updateAppState(input);
      res.json(state);
    } catch (err) {
      console.error("App state update error:", err);
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.appState.reset.path, async (req, res) => {
    const state = await storage.resetAppState();
    res.json(state);
  });

  // -- Trophies --
  app.get(api.trophies.get.path, async (req, res) => {
    const counts = await storage.getTrophyCounts();
    res.json(counts);
  });

  app.post(api.trophies.increment.path, async (req, res) => {
    try {
      const input = api.trophies.increment.input.parse(req.body);
      const counts = await storage.incrementTrophy(input.tier);
      res.json(counts);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  return httpServer;
}

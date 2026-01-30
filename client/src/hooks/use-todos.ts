import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertTodo, type InsertAppState } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// ==========================================
// TODOS HOOKS
// ==========================================

export function useTodos() {
  return useQuery({
    queryKey: [api.todos.list.path],
    queryFn: async () => {
      const res = await fetch(api.todos.list.path);
      if (!res.ok) throw new Error("Failed to fetch todos");
      return api.todos.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: InsertTodo) => {
      const res = await fetch(api.todos.create.path, {
        method: api.todos.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create todo");
      return api.todos.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.todos.list.path] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertTodo>) => {
      const url = buildUrl(api.todos.update.path, { id });
      const res = await fetch(url, {
        method: api.todos.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update todo");
      return api.todos.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.todos.list.path] });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.todos.delete.path, { id });
      const res = await fetch(url, { method: api.todos.delete.method });
      if (!res.ok) throw new Error("Failed to delete todo");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.todos.list.path] });
    },
  });
}

// ==========================================
// APP STATE HOOKS
// ==========================================

export function useAppState() {
  return useQuery({
    queryKey: [api.appState.get.path],
    queryFn: async () => {
      const res = await fetch(api.appState.get.path);
      if (!res.ok) throw new Error("Failed to fetch app state");
      return api.appState.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateAppState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<InsertAppState>) => {
      const res = await fetch(api.appState.update.path, {
        method: api.appState.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update app state");
      return api.appState.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.appState.get.path] });
    },
  });
}

export function useResetAppState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.appState.reset.path, {
        method: api.appState.reset.method,
      });
      if (!res.ok) throw new Error("Failed to reset app");
      return api.appState.reset.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.appState.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.todos.list.path] });
    },
  });
}

// ==========================================
// TROPHY HOOKS
// ==========================================

export function useTrophyCounts() {
  return useQuery({
    queryKey: [api.trophies.get.path],
    queryFn: async () => {
      const res = await fetch(api.trophies.get.path);
      if (!res.ok) throw new Error("Failed to fetch trophy counts");
      return api.trophies.get.responses[200].parse(await res.json());
    },
  });
}

export function useIncrementTrophy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tier: number) => {
      const res = await fetch(api.trophies.increment.path, {
        method: api.trophies.increment.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      if (!res.ok) throw new Error("Failed to increment trophy");
      return api.trophies.increment.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.trophies.get.path] });
    },
  });
}

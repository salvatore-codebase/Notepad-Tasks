import { z } from 'zod';
import { insertTodoSchema, insertAppStateSchema, todos, appState, trophyCounts } from './schema';

export const errorSchemas = {
  notFound: z.object({ message: z.string() }),
  validation: z.object({ message: z.string() }),
};

export const api = {
  todos: {
    list: {
      method: 'GET' as const,
      path: '/api/todos',
      responses: {
        200: z.array(z.custom<typeof todos.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/todos',
      input: insertTodoSchema,
      responses: {
        201: z.custom<typeof todos.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/todos/:id',
      input: insertTodoSchema.partial(),
      responses: {
        200: z.custom<typeof todos.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/todos/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    reorder: {
      method: 'POST' as const,
      path: '/api/todos/reorder',
      input: z.object({ ids: z.array(z.number()) }),
      responses: {
        200: z.array(z.custom<typeof todos.$inferSelect>()),
      },
    }
  },
  appState: {
    get: {
      method: 'GET' as const,
      path: '/api/app-state',
      responses: {
        200: z.custom<typeof appState.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/app-state',
      input: insertAppStateSchema.partial().extend({
        startTime: z.coerce.date().optional().nullable(),
      }),
      responses: {
        200: z.custom<typeof appState.$inferSelect>(),
      },
    },
    reset: {
      method: 'POST' as const,
      path: '/api/app-state/reset',
      responses: {
        200: z.custom<typeof appState.$inferSelect>(),
      },
    }
  },
  trophies: {
    get: {
      method: 'GET' as const,
      path: '/api/trophies',
      responses: {
        200: z.custom<typeof trophyCounts.$inferSelect>(),
      },
    },
    increment: {
      method: 'POST' as const,
      path: '/api/trophies/increment',
      input: z.object({ tier: z.number().min(1).max(8) }),
      responses: {
        200: z.custom<typeof trophyCounts.$inferSelect>(),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}

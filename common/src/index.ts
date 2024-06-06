import { z } from "zod";

export const UserStatus = z.enum([
  "initial",
  "online",
  "offline",
  "connecting",
  "attempting-join",
  "joined",
  "connection-failed",
  "disconnected",
]);

export const MessageType = z.enum(["SUCCESS", "ERROR"]);

export const ACTIONS = z.enum([
  "join-request",
  "join-accepted",
  "user-joined",
  "user-disconnected",
  "sync-code",
  "code-update",
  "offline",
  "online",
  "typing-start",
  "typing-pause",
  "username-exists",
]);

// Interfaces converted to zod schemas
export const codeSchema = z.object({
  version: z.number(),
  content: z.string(),
});

export type codeType = z.infer<typeof codeSchema>;

export const clientSchema = z.object({
  username: z.string(),
  roomId: z.string(),
  socketId: z.string(),
  status: UserStatus,
  cursorPosition: z.number(),
  typing: z.boolean().optional(),
  code: codeSchema.optional(),
});

export type clientType = z.infer<typeof clientSchema>;

// Events converted to zod schemas
export const ServerToClientEventsSchema = z.object({
  "user-joined": z.function().args(z.object({ user: clientSchema })),
  "join-accepted": z.function().args(z.object({ user: clientSchema, users: z.array(clientSchema) })),
  "user-disconnected": z.function().args(z.object({ user: clientSchema })),
  "sync-code": z.function().args(z.object({ code: codeSchema })),
  "code-update": z.function().args(z.object({ code: codeSchema })),
  "typing-start": z.function().args(z.object({ user: clientSchema })),
  "typing-pause": z.function().args(z.object({ user: clientSchema })),
  "online": z.function().args(z.object({ socketId: z.string() })),
  "offline": z.function().args(z.object({ socketId: z.string() })),
});

export type ServerToClientEvents = z.infer<typeof ServerToClientEventsSchema>;

export const ClientToServerEventsSchema = z.object({
  "join-request": z.function().args(z.object({ roomId: z.string(), username: z.string() })),
  "sync-code": z.function().args(z.object({ code: codeSchema, socketId: z.string() })),
  "code-update": z.function().args(z.object({ code: codeSchema })),
  "typing-start": z.function().args(z.object({ cursorPosition: z.number() })),
  "typing-pause": z.function().args(),
  "online": z.function().args(z.object({ socketId: z.string() })),
  "offline": z.function().args(z.object({ socketId: z.string() })),
});

export type ClientToServerEvents = z.infer<typeof ClientToServerEventsSchema>;

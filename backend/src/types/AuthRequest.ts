import { Request } from "express";

export type AuthRequest = Request & { user_id: string };

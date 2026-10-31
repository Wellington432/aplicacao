import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/AuthRequest";
import { verify } from "jsonwebtoken";

interface PayLoad {
    sub: string;
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    const authToken = req.headers.authorization;

    if (!authToken) {
        return res.status(401).json({ error: "Token não informado." });
    }

    const [scheme, token] = authToken.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ error: "Token mal formatado." });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: "Configuração de segurança ausente no servidor." });

    try {
        const { sub } = verify(token, secret) as PayLoad;
        (req as AuthRequest).user_id = sub;
        return next();
    } catch {
        return res.status(401).json({ error: "Sessão expirada ou inválida." });
    }
}

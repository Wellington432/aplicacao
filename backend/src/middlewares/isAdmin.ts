import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/AuthRequest";
import prismaClient from "../prisma";

export async function isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    const user = await prismaClient.usuario.findUnique({
        where: { id: req.user_id },
        select: { tipo: true }
    });

    if (user?.tipo !== 'ADM') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }

    return next();
}

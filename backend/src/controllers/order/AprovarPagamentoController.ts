import { Response } from "express";
import { AuthRequest } from "../../types/AuthRequest";
import { AprovarPagamentoService } from "../../services/order/AprovarPagamentos";

class AprovarPagamentoController {
    async handle(req: AuthRequest, res: Response) {

        const { id } = req.params as { id: string };

        const aprovarPagamento = new AprovarPagamentoService();

        const compra = await aprovarPagamento.execute({ id, confirmado_por: req.user_id });

        res.json(compra);
    }
}

export { AprovarPagamentoController }

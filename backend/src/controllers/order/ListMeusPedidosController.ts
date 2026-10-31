import { Response } from 'express';
import { AuthRequest } from '../../types/AuthRequest';
import { ListMeusPedidosService } from '../../services/order/ListMeusPedidosService';

class ListMeusPedidosController {
  async handle(req: AuthRequest, res: Response) {
    const service = new ListMeusPedidosService();
    const pedidos = await service.execute({ user_id: req.user_id });
    res.json(pedidos);
  }
}

export { ListMeusPedidosController };

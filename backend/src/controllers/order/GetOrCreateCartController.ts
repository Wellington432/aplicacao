import { Response } from 'express';
import { AuthRequest } from '../../types/AuthRequest';
import { GetOrCreateCartService } from '../../services/order/GetOrCreateCartService';

class GetOrCreateCartController {
  async handle(req: AuthRequest, res: Response) {
    const service = new GetOrCreateCartService();
    const compra = await service.execute({ user_id: req.user_id });
    res.json(compra);
  }
}

export { GetOrCreateCartController };

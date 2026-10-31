import { Response } from "express";
import { AuthRequest } from "../../types/AuthRequest";
import { UpdateOrderService } from "../../services/order/UpdateOrderServices";

class UpdateOrderController {
  async handle(req: AuthRequest, res: Response) {
    const { id, quantidade } = req.body;

    const updateOrderService = new UpdateOrderService();

    const item = await updateOrderService.execute({ id, quantidade, user_id: req.user_id });

    res.json(item);
  }
}

export { UpdateOrderController };

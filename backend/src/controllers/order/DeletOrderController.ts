import { Response } from 'express';
import { AuthRequest } from '../../types/AuthRequest';
import { DeleteOrderServices } from '../../services/order/DeletOrderServices';

export class DeleteOrderController {
    async handle(req: AuthRequest, res: Response) {
        const { id } = req.body;

        const deleteOrderService = new DeleteOrderServices();

        await deleteOrderService.execute({
            id,
            user_id: req.user_id
        });

        res.json({message: "Pedido deletado com sucesso"});

    }
    

}    
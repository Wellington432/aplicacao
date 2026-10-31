import { Response } from "express";
import { AuthRequest } from "../../types/AuthRequest";
import { ListUserByIdService } from "../../services/user/ListUserByIdService";


class ListUserByIdController{

    async handle(req:AuthRequest, res:Response){

        const id = req.user_id;

        const listUserById = new ListUserByIdService();

        const user = await listUserById.execute({id});

        res.json(user);
    }
}

export {ListUserByIdController}
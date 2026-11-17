import { Request, Response } from 'express';
import { CreateCategoryService } from '../../services/category/CreateCategoryService';

class CreateCategoryController {
  async handle(req: Request, res: Response) {
    const { nome, iconKey } = req.body;
    const category = await new CreateCategoryService().execute({ nome, iconKey });
    res.json(category);
  }
}

export { CreateCategoryController };
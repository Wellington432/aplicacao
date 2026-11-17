import { Request, Response } from 'express';
import { UpdateCategoryService } from '../../services/category/UpdateCategoryService';

class UpdateCategoryController {
  async handle(req: Request, res: Response) {
    const { id, nome, iconKey } = req.body;
    const category = await new UpdateCategoryService().execute({ id, nome, iconKey });
    res.json(category);
  }
}

export { UpdateCategoryController };

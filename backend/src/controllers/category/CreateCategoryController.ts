import { Request, Response } from 'express';
import { removeUploadedCategoryIcon, validateCategoryIconFile } from '../../services/category/categoryIconStorage';
import { CreateCategoryService } from '../../services/category/CreateCategoryService';

class CreateCategoryController {
  async handle(req: Request, res: Response) {
    const { nome, iconKey } = req.body;
    let category: Awaited<ReturnType<CreateCategoryService['execute']>>;
    try {
      let iconUrl: string | undefined;
      if (req.file) {
        await validateCategoryIconFile(req.file);
        iconUrl = `${req.protocol}://${req.get('host')}/uploads/category-icons/${req.file.filename}`;
      }

      category = await new CreateCategoryService().execute(
        req.file
          ? { nome, iconKey: null, iconUrl }
          : { nome, iconKey },
      );
    } catch (error) {
      if (req.file) {
        await removeUploadedCategoryIcon(req.file.path).catch((cleanupError) => {
          console.error('[category-icon-cleanup]', cleanupError);
        });
      }
      throw error;
    }
    res.json(category);
  }
}

export { CreateCategoryController };
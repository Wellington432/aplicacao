import { Request, Response } from 'express';
import {
  removeCategoryIcon,
  removeUploadedCategoryIcon,
  validateCategoryIconFile,
} from '../../services/category/categoryIconStorage';
import { UpdateCategoryService } from '../../services/category/UpdateCategoryService';

class UpdateCategoryController {
  async handle(req: Request, res: Response) {
    const { id, nome, iconKey } = req.body;
    const removeIcon = req.body.removeIcon === true || req.body.removeIcon === 'true';
    const service = new UpdateCategoryService();
    let result: Awaited<ReturnType<UpdateCategoryService['execute']>>;
    try {
      let iconUrl: string | undefined;
      if (req.file) {
        await validateCategoryIconFile(req.file);
        iconUrl = `${req.protocol}://${req.get('host')}/uploads/category-icons/${req.file.filename}`;
      }

      result = await service.execute({
        id,
        nome,
        iconKey: req.file ? null : iconKey,
        iconUrl,
        removeIcon,
      });
    } catch (error) {
      if (req.file) {
        await removeUploadedCategoryIcon(req.file.path).catch((cleanupError) => {
          console.error('[category-icon-cleanup]', cleanupError);
        });
      }
      throw error;
    }

    let warning: string | undefined;
    if (result.previousIconUrl && result.previousIconUrl !== result.category.iconUrl) {
      try {
        await removeCategoryIcon(result.previousIconUrl);
      } catch (error) {
        console.error('[category-icon-cleanup]', error);
        warning = 'Categoria salva, mas não foi possível remover o arquivo de ícone anterior.';
      }
    }

    res.json({ ...result.category, ...(warning ? { warning } : {}) });
  }
}

export { UpdateCategoryController };

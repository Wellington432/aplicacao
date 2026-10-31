jest.mock('multer', () => {
  const mockMulter = jest.fn((options) => ({ options, single: jest.fn() })) as jest.Mock & {
    diskStorage: jest.Mock;
  };
  mockMulter.diskStorage = jest.fn((options) => options);
  return { __esModule: true, default: mockMulter };
});
jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
}));

import { uploadComprovante } from '../../../src/middlewares/multerConfig';

describe('uploadComprovante.fileFilter', () => {
  it('deve aceitar MIME de comprovante suportado e rejeitar outros', () => {
    const options = (uploadComprovante as unknown as { options: Record<string, any> }).options;
    const accepted = jest.fn();
    options.fileFilter({}, { mimetype: 'image/webp' }, accepted);
    expect(accepted).toHaveBeenCalledWith(null, true);

    const rejected = jest.fn();
    options.fileFilter({}, { mimetype: 'text/html' }, rejected);
    expect(rejected).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Formato inválido') }),
    );
  });
});

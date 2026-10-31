jest.mock('multer', () => {
  const mockMulter = jest.fn((options) => ({ options, single: jest.fn() })) as jest.Mock & {
    diskStorage: jest.Mock;
  };
  mockMulter.diskStorage = jest.fn((options) => options);
  return { __esModule: true, default: mockMulter };
});

import { upload } from '../../../src/middlewares/upload';

describe('upload.fileFilter', () => {
  it('deve aceitar MIME de imagem permitido e rejeitar outros', () => {
    const options = (upload as unknown as { options: Record<string, any> }).options;
    const accepted = jest.fn();
    options.fileFilter({}, { mimetype: 'image/jpeg' }, accepted);
    expect(accepted).toHaveBeenCalledWith(null, true);

    const rejected = jest.fn();
    options.fileFilter({}, { mimetype: 'text/html' }, rejected);
    expect(rejected).toHaveBeenCalledWith(expect.any(Error));
  });
});

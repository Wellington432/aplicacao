jest.mock('multer', () => {
  const mockMulter = jest.fn((options) => ({ options, single: jest.fn() })) as jest.Mock & {
    diskStorage: jest.Mock;
  };
  mockMulter.diskStorage = jest.fn((options) => options);
  return { __esModule: true, default: mockMulter };
});

import { upload } from '../../../src/middlewares/upload';

describe('upload.storage.filename', () => {
  it('deve gerar UUID e extensão pelo MIME de imagem', () => {
    const options = (upload as unknown as { options: Record<string, any> }).options;
    const callback = jest.fn();

    options.storage.filename({}, { mimetype: 'image/png' }, callback);

    expect(callback).toHaveBeenCalledWith(null, expect.stringMatching(/^[a-f0-9-]{36}\.png$/i));
  });
});

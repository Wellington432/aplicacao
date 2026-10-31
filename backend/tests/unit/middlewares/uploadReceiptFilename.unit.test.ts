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

describe('uploadComprovante.storage.filename', () => {
  it('deve gerar UUID e extensão PDF baseada no MIME', () => {
    const options = (uploadComprovante as unknown as { options: Record<string, any> }).options;
    const callback = jest.fn();

    options.storage.filename({}, { mimetype: 'application/pdf' }, callback);

    expect(callback).toHaveBeenCalledWith(null, expect.stringMatching(/^[a-f0-9-]{36}\.pdf$/i));
  });
});

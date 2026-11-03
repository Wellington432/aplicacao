import { publicUrl } from '../../../src/utils/publicUrl';
import { createRequest } from '../../helpers/httpMocks';

const originalApiUrl = process.env.API_URL;
const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  if (originalApiUrl === undefined) {
    delete process.env.API_URL;
  } else {
    process.env.API_URL = originalApiUrl;
  }

  if (originalNodeEnv === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = originalNodeEnv;
  }
});

describe('publicUrl', () => {
  it('usa API_URL e força HTTPS em produção', () => {
    process.env.API_URL = 'http://api.feiraetec.test///';
    process.env.NODE_ENV = 'production';

    expect(publicUrl(createRequest(), '/uploads/photo.png')).toBe(
      'https://api.feiraetec.test/uploads/photo.png',
    );
  });

  it('mantém HTTP para localhost em produção', () => {
    process.env.API_URL = 'http://localhost:3333/';
    process.env.NODE_ENV = 'production';

    expect(publicUrl(createRequest(), '/uploads/photo.png')).toBe(
      'http://localhost:3333/uploads/photo.png',
    );
  });

  it('usa protocolo e host da requisição quando API_URL não está definido', () => {
    delete process.env.API_URL;
    process.env.NODE_ENV = 'production';

    const req = createRequest({
      protocol: 'http',
      get: jest.fn(() => 'api.feiraetec.test'),
    });

    expect(publicUrl(req, '/uploads/photo.png')).toBe(
      'https://api.feiraetec.test/uploads/photo.png',
    );
  });
});

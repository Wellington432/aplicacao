import { Request } from 'express';

function isLocalhost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export function publicUrl(req: Request, pathname: string): string {
  const configuredBase = process.env.API_URL?.trim().replace(/\/+$/, '');
  const requestHost = req.get('host');
  if (!configuredBase && !requestHost) {
    throw new Error('Não foi possível determinar o host público da API.');
  }

  const base = configuredBase || `${req.protocol}://${requestHost}`;
  const parsedBase = new URL(base);

  if (process.env.NODE_ENV === 'production' && !isLocalhost(parsedBase.hostname)) {
    parsedBase.protocol = 'https:';
  }

  return `${parsedBase.toString().replace(/\/+$/, '')}/${pathname.replace(/^\/+/, '')}`;
}

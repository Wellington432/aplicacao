import { Request, Response } from 'express';
import { AuthRequest } from '../../src/types/AuthRequest';

export function createRequest(overrides: Record<string, unknown> = {}): Request {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    protocol: 'http',
    get: jest.fn(() => 'localhost'),
    ...overrides,
  } as unknown as Request;
}

export function createAuthRequest(overrides: Record<string, unknown> = {}): AuthRequest {
  return createRequest({ user_id: 'user-1', ...overrides }) as AuthRequest;
}

export function createResponse() {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
    end: jest.fn(),
    sendFile: jest.fn(),
    setHeader: jest.fn(),
  };
  Object.values(res).forEach((method) => method.mockReturnValue(res));
  return res as unknown as Response & typeof res;
}

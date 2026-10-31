jest.mock('../../../../src/services/order/SalesReportService', () => ({
  SalesReportService: jest.fn().mockImplementation(() => ({ execute: jest.fn().mockResolvedValue({ periodo_dias: 7 }) })),
}));

import { SalesReportController } from '../../../../src/controllers/order/SalesReportController';
import { SalesReportService } from '../../../../src/services/order/SalesReportService';
import { createRequest, createResponse } from '../../../helpers/httpMocks';

describe('SalesReportController.handle', () => {
  it('deve converter parâmetro de período para número', async () => {
    const res = createResponse();
    await new SalesReportController().handle(createRequest({ query: { dias: '7' } }), res);
    expect((SalesReportService as jest.Mock).mock.results[0].value.execute).toHaveBeenCalledWith({
      dias: 7,
    });
    expect(res.json).toHaveBeenCalledWith({ periodo_dias: 7 });
  });
});

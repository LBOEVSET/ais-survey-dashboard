import { Test } from '@nestjs/testing';
import { DashBoardController } from '../../src/dashboard/dashboard.controller';
import { DashBoardService } from '../../src/dashboard/dashboard.service';
import { DashBoardDto } from "../../src/dashboard/dtos";

describe('DashBoardController', () => {
  let controller: DashBoardController;

  const serviceMock = {
    getUserRating: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [DashBoardController],
      providers: [{ provide: DashBoardService, useValue: serviceMock }],
    }).compile();

    controller = module.get(DashBoardController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    const mock_result = {
      status_code: 200,
      data: [],
      alert: {
        type: "success",
        title: "query data success",
        description: "query data success"
      },
      hasNextPage: false
    }
    it('findAll returns paginated data (page=1, limit=1)', async () => {
      const dto: DashBoardDto = { page: 1, limit: 10, month: 1, service: undefined };

      const result = await controller.findAll(dto.page, dto.limit, dto);

      expect(serviceMock.getUserRating).toHaveBeenCalledWith(dto, dto.page, dto.limit);
      expect(result).toEqual(expect.objectContaining(mock_result));
    });

    it('findAll returns paginated data (page=2, limit=1)', async () => {
      const dto: DashBoardDto = { page: 2, limit: 10, month: 1, service: undefined };

      const result = await controller.findAll(dto.page, dto.limit, dto);

      expect(serviceMock.getUserRating).toHaveBeenCalledWith(dto, dto.page, dto.limit);
      expect(result).toEqual(expect.objectContaining(mock_result));
    });

    it('findAll returns paginated data (page=1, limit=20)', async () => {
      const dto: DashBoardDto = { page: 1, limit: 20, month: 1, service: undefined };

      const result = await controller.findAll(dto.page, dto.limit, dto);

      expect(serviceMock.getUserRating).toHaveBeenCalledWith(dto, dto.page, dto.limit);
      expect(result).toEqual(expect.objectContaining(mock_result));
    });
  });
});

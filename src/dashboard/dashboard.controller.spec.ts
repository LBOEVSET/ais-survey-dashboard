import { Test, TestingModule } from '@nestjs/testing';
import { DashBoardController } from './dashboard.controller';
import { DashBoardService } from './dashboard.service';
import { DashBoardDto } from "./dtos";
import { HttpStatus } from '@nestjs/common';
import { DashBoardResponse } from "./types";

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
      const dto: DashBoardDto = { page: 1, limit: 1, service: undefined };

      const result = await controller.findAll(dto);

      expect(serviceMock.getUserRating).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expect.objectContaining(mock_result));
    });

    it('findAll returns paginated data (page=2, limit=1)', async () => {
      const dto: DashBoardDto = { page: 2, limit: 1, service: undefined };

      const result = await controller.findAll(dto);

      expect(serviceMock.getUserRating).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expect.objectContaining(mock_result));
    });

    it('findAll returns paginated data (page=1, limit=20)', async () => {
      const dto: DashBoardDto = { page: 1, limit: 20, service: undefined };

      const result = await controller.findAll(dto);

      expect(serviceMock.getUserRating).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expect.objectContaining(mock_result));
    });
  });
});

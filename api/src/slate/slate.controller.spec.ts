import { Test, TestingModule } from '@nestjs/testing';
import { SlateController } from './slate.controller';
import { SlateService } from './slate.service';

describe('SlateController', () => {
  let controller: SlateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SlateController],
      providers: [SlateService],
    }).compile();

    controller = module.get<SlateController>(SlateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

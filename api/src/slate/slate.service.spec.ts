import { Test, TestingModule } from '@nestjs/testing';
import { SlateService } from './slate.service';

describe('SlateService', () => {
  let service: SlateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SlateService],
    }).compile();

    service = module.get<SlateService>(SlateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

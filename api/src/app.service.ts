import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getDeploymentStatus(): string {
    return 'im so done, this is like 10th deployment attempt........';
  }
}

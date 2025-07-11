import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getDeploymentStatus(): string {
    return 'Deployed 2nd try...';
  }
}

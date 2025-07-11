import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // allowedHeaders: ['Content-Type', 'Authorization'],
  });

  console.log(
    `Nest API is running on port ${process.env.NEST_API_PORT || 3000}`,
  );
  await app.listen(process.env.NEST_API_PORT || 3000);
}
bootstrap();

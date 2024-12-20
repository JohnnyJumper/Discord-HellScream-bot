import { NestFactory } from '@nestjs/core';
import { RootModule } from 'modules/root.module';

async function bootstrap() {
  const app = await NestFactory.create(RootModule);
  await app.listen(process.env.APP_PORT ?? 6357);
}
bootstrap();

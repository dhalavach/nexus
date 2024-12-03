import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const graphQLServer = app.get('GraphQLServer');
  await graphQLServer.listen(4000);
}
bootstrap();

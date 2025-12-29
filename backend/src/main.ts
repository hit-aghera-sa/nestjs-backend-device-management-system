import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { AppExceptionFilter } from "./core/filters/app-exception.filter";
import { AppDataSource } from "./config/typeorm.config";

import { NestLogger } from "./core/logger/nest-logger";   // ⭐ ADD THIS

async function bootstrap() {

  await AppDataSource.initialize();
  
  const logger = new NestLogger();
  logger.log('Database connection established', 'Bootstrap');

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(logger);

  app.use(cookieParser());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.useGlobalFilters(new AppExceptionFilter());

  const port = process.env.PORT || 4000;

  await app.listen(port);

  logger.log(`Server running on port ${port}`, 'Bootstrap');
}

bootstrap();

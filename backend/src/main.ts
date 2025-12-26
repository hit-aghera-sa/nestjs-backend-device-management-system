import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { AppExceptionFilter } from "./core/filters/app-exception.filter";
import { AppDataSource } from "./config/typeorm.config";

async function bootstrap() {
  // Initialize database connection
  await AppDataSource.initialize();
  console.log('Database connection established');

  const app = await NestFactory.create(AppModule);

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
  
  await app.listen(process.env.PORT || 4000);
}

bootstrap();

import "./tracer";
import "reflect-metadata";
import { env } from "./config/env";
import { AppDataSource } from "./config/data-source";
import { logger } from "./utils/logger";
import app from "./app";

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  logger.info("Database connection established");

  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

bootstrap().catch((err) => {
  logger.fatal(err, "Failed to start server");
  process.exit(1);
});

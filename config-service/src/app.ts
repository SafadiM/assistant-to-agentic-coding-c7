import express from "express";
import healthRoutes from "./routes/health.routes";
import configRoutes from "./routes/config.routes";
import { requestLogger } from "./middleware/request-logger";
import { errorHandler } from "./middleware/error-handler";

const app = express();

app.use(requestLogger);
app.use(express.json());

app.use(healthRoutes);
app.use(configRoutes);

app.use(errorHandler);

export default app;

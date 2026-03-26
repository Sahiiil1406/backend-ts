/// <reference path="./types/express.d.ts" />
import express, { Request, Response, NextFunction } from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";
import { setupSwagger } from "./swagger";
import { env } from "./config/env";
import routes from "./routes";
export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(cookieParser());
app.use(requestLogger);
setupSwagger(app);

app.get("/health", (req, res) => {
  res.send("Running...");
});

app.use("/api", routes);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  errorMiddleware(err, req, res, next);
});

const PORT = env.PORT;
const BASE_URL = env.BASE_BACKEND_URL ?? `http://localhost:${PORT}`;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`📑 Swagger Docs at ${BASE_URL}/api-docs`);
});
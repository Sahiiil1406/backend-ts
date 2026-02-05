import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Swapper API",
      version: "1.0.0",
      description: "Basic swapper API with JWT Bearer Auth",
    },
    servers: [
      { url: "http://localhost:8000", description: "Local development server" },
      {
        url: process.env.BASE_BACKEND_URL,
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./docs/**/*.yaml"],
};
const swaggerSpec = swaggerJsdoc(options);
//console.log("Swagger paths:", swaggerSpec);
export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

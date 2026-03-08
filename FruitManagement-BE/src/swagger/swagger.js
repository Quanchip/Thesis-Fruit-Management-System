import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import express from "express";

// Swagger definition
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Manach API Documentation",
    version: "1.0.0",
    description:
      "API documentation for Manach - Fruit Selling Management System",
  },
  servers: [
    {
      url: "http://localhost:8080",
      description: "Dev Server",
    },
  ],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.js"], // Path to the API docs
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

const swaggerRouter = express.Router();

swaggerRouter.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default swaggerRouter;

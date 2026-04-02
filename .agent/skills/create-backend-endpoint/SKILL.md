---
name: create_backend_endpoint
description: Guidelines and instructions for creating new Express backend routes, controllers, and Swagger documentation in the FruitManagement-BE.
---

# Backend Architecture Guidelines (FruitManagement-BE)

When creating new endpoints or controllers for the backend, you MUST adhere to the following architectural patterns and constraints observed in the project:

## 1. Controller Structure
- **ES Modules**: Use `import`/`export const` rather than CommonJS `require`.
- **Global Model Initialization**: Always initialize Sequelize models at the top of the controller file:
  ```javascript
  import { responseData } from "../config/response.js";
  import initModels from "../models/init-models.js";
  import sequelize from "../models/connect.js";
  import { Op } from "sequelize";

  let model = initModels(sequelize);
  ```
- **Async Functions & Try/Catch**: Every controller action must be an async arrow function wrapped in a `try/catch` block.
- **Direct Database Access**: Standard CRUD operations (using Sequelize queries like `model.table_name.findAll(...)` or `model.table_name.create(...)`) are performed **directly** inside the controller. You do not need an intermediary service file unless handling highly complex logic like WebSocket emissions.

## 2. Standardized Responses
Always return responses using the custom `responseData` helper from `../config/response.js`:
```javascript
export const getExample = async (req, res) => {
  try {
    let data = await model.examples.findAll();
    responseData(res, "Success", data, 200);
  } catch (error) {
    responseData(res, "Error ...", "", 500);
  }
};
```

## 3. Router Structure & Swagger Docs
- **Router Initialization**: Import `express` and initialize via `const exampleRoutes = express.Router()`.
- **Swagger Documentation**: **EVERY single route** MUST have a `/** @swagger ... */` JSDoc block written directly above it. Do not skip documenting tags, parameters, and responses.
- **Export**: `export default exampleRoutes;`

### Example Route File (`src/routes/exampleRoutes.js`):
```javascript
import express from "express";
import { getExample } from "../controllers/exampleController.js";

const exampleRoutes = express.Router();

/**
 * @swagger
 * tags:
 *   name: Example
 *   description: Example operations
 */

/**
 * @swagger
 * /example/all:
 *   get:
 *     summary: Get all examples
 *     tags: [Example]
 *     responses:
 *       200:
 *         description: Examples retrieved successfully
 *       500:
 *         description: Server Error
 */
exampleRoutes.get("/all", getExample);

export default exampleRoutes;
```

## 4. Registering Routes
After creating an `exampleRoutes.js` file, remember to import and map it within `src/routes/rootRoutes.js` using `rootRoutes.use("/example", exampleRoutes);`.

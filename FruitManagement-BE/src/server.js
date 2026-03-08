import express from "express";
import cors from "cors";
import rootRoute from "./routes/rootRoutes.js";
import swaggerRouter from "./swagger/swagger.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static("."));

app.use(swaggerRouter);
app.use(rootRoute);

const host = process.env.HOST || "127.0.0.1";
const preferredPort = Number(process.env.PORT || 8080);
const maxPortRetries = Number(process.env.PORT_RETRIES || 10);

const startServer = (port, retriesLeft) => {
  const server = app.listen(port, host, () => {
    console.log(`Server is running at http://${host}:${port}`);
  });

  server.on("error", (error) => {
    if ((error.code === "EADDRINUSE" || error.code === "EPERM") && retriesLeft > 0) {
      console.warn(
        `Port ${port} is unavailable (${error.code}). Retrying on ${port + 1}...`
      );
      startServer(port + 1, retriesLeft - 1);
      return;
    }

    console.error("Failed to start server:", error.message);
    console.warn("Will retry startup in 2 seconds...");
    setTimeout(() => startServer(preferredPort, maxPortRetries), 2000);
  });
};

startServer(preferredPort, maxPortRetries);
export default app;

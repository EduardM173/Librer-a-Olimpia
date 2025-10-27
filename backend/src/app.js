import express from "express";
import cors from "cors";
import pedidosRoutes from "./routes/pedidos.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/pedidos", pedidosRoutes);

export default app;
    
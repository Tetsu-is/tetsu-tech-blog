import { Hono } from "hono";

const app = new Hono();

app.basePath("/api");

app.get("/", (ctx) => ctx.text("Hello world, this is Hono!!"));
app.get("/hoge", (ctx) => ctx.text("Hoge"));

export default app;
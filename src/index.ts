import { Elysia } from "elysia";
import { usersRoute } from "./routes/users-route";

const app = new Elysia()
  .get("/health", () => {
    return { status: "OK", timestamp: new Date().toISOString() };
  })
  .use(usersRoute)
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
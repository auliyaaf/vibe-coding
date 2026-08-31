import { Elysia, t } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";

const app = new Elysia()
  .get("/health", () => {
    return { status: "OK", timestamp: new Date().toISOString() };
  })
  .get("/users", async () => {
    try {
      const allUsers = await db.select().from(users);
      return allUsers;
    } catch (error) {
      console.error(error);
      return { error: "Failed to fetch users" };
    }
  })
  .post("/users", async ({ body, set }) => {
    try {
      const { name, email } = body;
      await db.insert(users).values({ name, email });
      set.status = 201;
      return { message: "User created successfully" };
    } catch (error) {
      console.error(error);
      set.status = 500;
      return { error: "Failed to create user" };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
    })
  })
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
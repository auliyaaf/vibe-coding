import { Elysia, t } from "elysia";
import { registerUser } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api" }).post(
  "/users",
  async ({ body, set }) => {
    try {
      await registerUser(body);
      set.status = 201;
      return {
        data: "Annyeong Dede!",
      };
    } catch (error: any) {
      if (error?.message === "EMAIL_EXISTS") {
        set.status = 400;
        return {
          email: "email sudah terdaftar",
        };
      }

      console.error("Registration error:", error);
      set.status = 500;
      return {
        error: "Terjadi kesalahan pada server",
      };
    }
  },
  {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String(),
    }),
  },
);

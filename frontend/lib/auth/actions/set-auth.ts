"use server";
import { authenticate } from "@/lib/api/authenticate";
import { cookies } from "next/headers";

export const setAuth = async (username: string, password: string) => {
  try {
    const auth = `${username}:${password}`;

    await authenticate(username, password);

    cookies().set("auth", auth, {
      // 30 minutes
      maxAge: 60 * 30,
    });

    return auth;
  } catch (error) {
    console.log(error);
    return null;
  }
};

"use server";
import { cookies } from "next/headers";

export const getAuth = async () => {
  // this is async, not sure why its not
  const auth = cookies().get("auth");
  return auth?.value;
};

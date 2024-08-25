"use server";
import { signinRoute } from "@/lib/const";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const signOut = async () => {
  cookies().delete("auth");

  return redirect(signinRoute);
};

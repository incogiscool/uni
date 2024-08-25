"use client";
import { signOut } from "@/lib/auth/actions/sign-out";
import { Button } from "../ui/button";

export const SignoutButton = () => {
  return (
    <Button variant={"outline"} onClick={() => signOut()}>
      Sign out
    </Button>
  );
};

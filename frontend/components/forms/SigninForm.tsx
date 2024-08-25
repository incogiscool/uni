"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { authenticate } from "@/lib/api/authenticate";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { appRoute } from "@/lib/const";
import { setAuth } from "@/lib/auth/actions/set-auth";

const formSchema = z.object({
  username: z.string().min(1, "Please enter a username."),
  password: z.string().min(1, "Please enter a password."),
});

export const SigninForm = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      authenticate(data.username, data.password),
    onError: (error) => {
      console.log(error);
      toast.error(error.message);
    },
    onSuccess: async (_, args) => {
      toast.success("Successfully logged in");
      await setAuth(args.username, args.password);
      router.push(appRoute);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => mutate(values))}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Username" {...field} />
              </FormControl>
              {/* <FormDescription>This is your username.</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Password" {...field} />
              </FormControl>
              {/* <FormDescription>This is your password.</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit" disabled={isPending}>
          Submit
        </Button>
      </form>
    </Form>
  );
};

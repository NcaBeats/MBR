"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "../AuthLayout";
import { loginAction } from "@/actions";
import { GoogleSignInButton, PasswordInput } from "@/components/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoginSchema } from "@/schemas";
import {
  Form,
  FormItem,
  FormMessage,
  FormControl,
  FormField,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import z from "zod";

type LogInFormProps = {
  next: string | null;
};

export function LogInForm({ next }: LogInFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const signUpHref = next
    ? `/sign-up?next=${encodeURIComponent(next)}`
    : "/sign-up";
  const form = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    const result = await loginAction(values, next);

    if (!result.success) {
      console.log(result.errors);
    }
  };

  return (
    <AuthLayout>
      <Card className="[--card-spacing:--spacing(8)] w-full max-w-sm ring-0">
        <CardHeader>
          <CardTitle className="text-2xl text-left font-bold">
            Sign In to continue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        placeholder="user@gmail.com"
                        className="border-0"
                      />
                    </FormControl>
                    <FormMessage className="text-left" />
                  </FormItem>
                )}
              />

              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        field={field}
                        placeholder="••••••••"
                        inputClassName="border-0"
                        required={false}
                        show={showPassword}
                        onToggle={() => setShowPassword(!showPassword)}
                      />
                    </FormControl>
                    <FormMessage className="text-left" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className={
                  "bg-[#007AFF] hover:bg-[#1ea4ff] font-semibold text-white py-5"
                }
                size={"lg"}
              >
                Log In
              </Button>

              <div className="flex items-center gap-3 text-xs text-[#8A8A8A]">
                <span className="h-px flex-1 bg-[#28282C]" />
                or
                <span className="h-px flex-1 bg-[#28282C]" />
              </div>

              <GoogleSignInButton text="signin_with" next={next} />

              <p className="text-[#8A8A8A] flex justify-center text-sm items-center-safe gap-2 font-medium">
                {"Don't have an account?"}
                <span>
                  <Link
                    className="text-white hover:text-[#1ea4ff] hover:underline active:underline active:text-[#1ea4ff]"
                    href={signUpHref}
                  >
                    Sign up
                  </Link>
                </span>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

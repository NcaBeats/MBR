"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Asterisk, CalendarIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

import { AuthLayout } from "../AuthLayout";
import { signUpAction } from "@/actions";
import { signUpSchema } from "@/schemas/auth/sign-up.schema";
import { useComunas, useRegions } from "@/hooks/use-location";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";
import { FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { GoogleSignInButton, PasswordInput } from "@/components/auth";
import { cn } from "@/lib/utils";

type SignUpForm = z.infer<typeof signUpSchema>;

type SignUpFormProps = {
  next: string | null;
};

export function SignUpForm({ next }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [regionId, setRegionId] = useState<number | null>(null);
  const logInHref = next
    ? `/log-in?next=${encodeURIComponent(next)}`
    : "/log-in";
  const { regions, loading: regionsLoading } = useRegions();
  const { comunas } = useComunas(regionId);

  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      run: "",
      name: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      birthdate: undefined,
      comunaId: 0,
      direccion: "",
    },
  });

  const onSubmit = async (values: SignUpForm) => {
    setIsLoading(true);

    try {
      const result = await signUpAction(values, next);

      if (!result.success) {
        console.log(result.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRegion = regions.find((region) => region.id === regionId);
  const selectedComuna = comunas.find(
    (comuna) => comuna.id === form.watch("comunaId"),
  );

  return (
    <AuthLayout>
      <Card className="[--card-spacing:--spacing(8)] ring-0 w-full max-w-xl ">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Create an Account
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="mb-6 flex w-full flex-col items-center gap-4">
            <GoogleSignInButton text="signup_with" next={next} />

            <div className="flex w-full items-center gap-3 text-xs text-[#8A8A8A]">
              <span className="h-px flex-1 bg-[#28282C]" />
              or sign up with email
              <span className="h-px flex-1 bg-[#28282C]" />
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              {/* Personal information */}
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>First name</FormLabel>

                        <FormControl>
                          <Input
                            {...field}
                            placeholder="John"
                            className="border-0"
                          />
                        </FormControl>

                        <FormMessage className="text-left" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="lastName"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Last name</FormLabel>

                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Doe"
                            className="border-0"
                          />
                        </FormControl>

                        <FormMessage className="text-left" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    name="run"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>RUN</FormLabel>

                        <FormControl>
                          <Input
                            {...field}
                            placeholder="12.345.678-9"
                            className="border-0"
                          />
                        </FormControl>

                        <FormMessage className="text-left" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="birthdate"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of birth</FormLabel>

                        <Popover>
                          <PopoverTrigger
                            render={
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal border-0 h-10",
                                  !field.value && "text-muted-foreground",
                                )}
                              />
                            }
                          >
                            <CalendarIcon className="mr-2 size-4" />

                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Select date</span>
                            )}
                          </PopoverTrigger>

                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              captionLayout="dropdown"
                              disabled={(date) => date > new Date()}
                            />
                          </PopoverContent>
                        </Popover>

                        <FormMessage className="text-left" />
                      </FormItem>
                    )}
                  />
                </div>
              </FieldGroup>

              {/* Contact */}
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    name="email"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Email</FormLabel>

                        <FormControl>
                          <Input
                            type="email"
                            {...field}
                            placeholder="john@gmail.com"
                            className="border-0"
                          />
                        </FormControl>

                        <FormMessage className="text-left" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="direccion"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Address</FormLabel>

                        <FormControl>
                          <Input
                            {...field}
                            placeholder="123 Main Street"
                            className="border-0"
                          />
                        </FormControl>

                        <FormMessage className="text-left" />
                      </FormItem>
                    )}
                  />
                </div>
              </FieldGroup>

              {/* Location */}
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormItem>
                    <Label>
                      Region
                      <Asterisk
                        className="text-destructive ml-1 size-3.5"
                        aria-hidden="true"
                      />
                    </Label>

                    <Combobox
                      items={regions.map((region) => region.nombre)}
                      value={selectedRegion?.nombre ?? null}
                      onValueChange={(nombre) => {
                        const region = regions.find((r) => r.nombre === nombre);
                        setRegionId(region ? region.id : null);
                        form.setValue("comunaId", 0);
                      }}
                      disabled={regionsLoading}
                    >
                      <ComboboxInput
                        placeholder="Select a region"
                        className="w-full border-0 h-10"
                      />

                      <ComboboxContent>
                        <ComboboxEmpty>No region found.</ComboboxEmpty>

                        <ComboboxList>
                          {(item) => (
                            <ComboboxItem key={item} value={item}>
                              {item}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    <p className="min-h-5 text-sm" aria-hidden="true">
                      {"\u00A0"}
                    </p>
                  </FormItem>

                  <FormField
                    name="comunaId"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="min-w-0">
                        <FormLabel required>Municipality</FormLabel>

                        <Combobox
                          items={comunas.map((comuna) => comuna.nombre)}
                          value={selectedComuna?.nombre ?? null}
                          onValueChange={(nombre) => {
                            const comuna = comunas.find(
                              (c) => c.nombre === nombre,
                            );
                            field.onChange(comuna ? comuna.id : 0);
                          }}
                          disabled={!selectedRegion}
                        >
                          <FormControl>
                            <ComboboxInput
                              placeholder="Select a municipality"
                              className="w-full min-w-0 border-0 h-10 py-1"
                            />
                          </FormControl>

                          <ComboboxContent>
                            <ComboboxEmpty>
                              No municipality found.
                            </ComboboxEmpty>

                            <ComboboxList>
                              {(item) => (
                                <ComboboxItem key={item} value={item}>
                                  {item}
                                </ComboboxItem>
                              )}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>

                        <FormMessage className="text-left" />
                      </FormItem>
                    )}
                  />
                </div>
              </FieldGroup>

              {/* Security */}
              <FieldGroup>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    name="password"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Password</FormLabel>

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

                  <FormField
                    name="confirmPassword"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Confirm password</FormLabel>

                        <FormControl>
                          <PasswordInput
                            field={field}
                            placeholder="••••••••"
                            inputClassName="border-0"
                            required={false}
                            show={showConfirmPassword}
                            onToggle={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          />
                        </FormControl>

                        <FormMessage className="text-left" />
                      </FormItem>
                    )}
                  />
                </div>
              </FieldGroup>

              <Button
                type="submit"
                className="w-full max-w-xs font-semibold self-center py-5"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>

              <p className="text-[#8A8A8A] flex justify-center text-sm items-center-safe gap-2 font-medium">
                {"Have an account?"}
                <span>
                  <Link
                    className="text-white hover:text-[#007AFF] hover:underline active:underline active:text-[#007AFF]"
                    href={logInHref}
                  >
                    Log in
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

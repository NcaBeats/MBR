"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Asterisk, CalendarIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { googleCompleteAction } from "@/actions/google";
import { useComunas, useRegions } from "@/hooks/use-location";
import {
  googleOnboardingSchema,
  type GoogleOnboardingInput,
} from "@/schemas/auth/google-onboarding.schema";
import type { GoogleSuggestedProfile } from "@/types";
import { cn } from "@/lib/utils";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";

type GoogleOnboardingFormProps = {
  suggested: GoogleSuggestedProfile | null;
};

export function GoogleOnboardingForm({ suggested }: GoogleOnboardingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regionId, setRegionId] = useState<number | null>(null);
  const { regions, loading: regionsLoading } = useRegions();
  const { comunas } = useComunas(regionId);

  const form = useForm<GoogleOnboardingInput>({
    resolver: zodResolver(googleOnboardingSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      run: "",
      nickname: suggested?.email?.split("@")[0] ?? "",
      birthdate: undefined,
      comunaId: 0,
      direccion: "",
    },
  });

  const onSubmit = async (values: GoogleOnboardingInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await googleCompleteAction(values);
      if (!result.success) {
        setError(result.error);
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
    <Card className="[--card-spacing:--spacing(8)] ring-0 w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Finish your account
        </CardTitle>
        {suggested?.email && (
          <p className="text-sm text-[#8A8A8A]">
            Signing up as <span className="text-white">{suggested.email}</span>
          </p>
        )}
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  name="nickname"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Nickname</FormLabel>

                      <FormControl>
                        <Input
                          {...field}
                          placeholder="gamer123"
                          className="border-0"
                        />
                      </FormControl>

                      <FormMessage className="text-left" />
                    </FormItem>
                  )}
                />

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
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                          <ComboboxEmpty>No municipality found.</ComboboxEmpty>

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

            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full max-w-xs font-semibold self-center py-5"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-[#8A8A8A] flex justify-center text-sm items-center-safe gap-2 font-medium">
              Wrong Google account?
              <Link
                className="text-white hover:text-[#007AFF] hover:underline active:underline active:text-[#007AFF]"
                href="/sign-up"
              >
                Start over
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

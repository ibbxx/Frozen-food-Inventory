import { zodResolver } from "@hookform/resolvers/zod";
import { Snowflake } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

import { useAuth } from "./AuthProvider";


const loginSchema = z.object({
  email: z.string().email("Masukkan alamat email yang valid."),
  password: z.string().min(1, "Kata sandi tidak boleh kosong."),
});

export function LoginPage() {
  const { authError, loading, session, signIn } = useAuth();
  const location = useLocation();
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const fromPath = location.state?.from?.pathname || "/dashboard";

  if (session) {
    return <Navigate replace to={fromPath} />;
  }

  async function onSubmit(values) {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      await signIn(values);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-center bg-primary px-12 md:flex lg:px-24">
        <div className="flex items-center gap-3 text-primary-foreground mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground text-primary">
            <Snowflake className="h-6 w-6" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Momqill Frozen Food</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl max-w-lg mb-6 leading-tight">
          Kelola stok frozen food dengan lebih rapi.
        </h1>
        <p className="text-lg text-primary-foreground/80 max-w-md">
          Pantau produk, batch, masa kedaluwarsa, dan lokasi penyimpanan dalam satu tempat.
        </p>
      </div>

      <div className="flex w-full flex-col justify-center px-4 md:w-1/2 lg:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 md:hidden flex items-center justify-center gap-3 text-primary">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Snowflake className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Momqill Frozen Food</span>
          </div>

          <Card className="border-0 shadow-none md:border md:shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
            </CardHeader>

            <CardContent>
              <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Alamat Email</label>
                  <Input
                    autoComplete="email"
                    placeholder="admin@momqill.id"
                    {...register("email")}
                    type="email"
                  />
                  {errors.email ? <span className="text-xs text-destructive">{errors.email.message}</span> : null}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Kata Sandi</label>
                  <Input
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...register("password")}
                    type="password"
                  />
                  {errors.password ? <span className="text-xs text-destructive">{errors.password.message}</span> : null}
                </div>

                {submitError || authError ? (
                  <div className="text-sm font-medium text-destructive">{submitError || authError}</div>
                ) : null}

                <Button className="w-full mt-2" disabled={isSubmitting || loading} type="submit">
                  {isSubmitting ? "Sedang masuk..." : "Masuk"}
                </Button>
              </form>
            </CardContent>


          </Card>
        </div>
      </div>
    </div>
  );
}

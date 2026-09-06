import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldAlert } from "lucide-react";
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
    <div className="flex min-h-screen w-full bg-[hsl(var(--background))]">
      {/* Brand Showcase (Desktop Only: md:flex) */}
      <div className="hidden md:flex w-1/2 flex-col justify-between border-r border-border bg-white p-12 lg:p-16">
        <div className="flex items-center gap-3.5">
          <img
            alt="Karunrung Frozen Food Logo"
            className="h-12 w-12 object-contain shrink-0 drop-shadow-xs"
            src="/logo-icon.png"
          />
          <div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground block">
              Karunrung Frozen Food
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Sistem Manajemen Inventori
            </span>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-snug">
            Manajemen stok rantai dingin yang terintegrasi dan presisi.
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Akses inventori produk beku, catat barang masuk dan keluar, serta pantau ketersediaan stok secara real-time.
          </p>
        </div>

        <div className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Karunrung Frozen Food. Hak cipta dilindungi.
        </div>
      </div>

      {/* Authentication Form Card */}
      <div className="flex w-full md:w-1/2 flex-col justify-center items-center px-4 py-8 sm:px-8 lg:px-16">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Header Brand Display */}
          <div className="md:hidden flex items-center justify-center gap-2.5 mb-2">
            <img
              alt="Karunrung Frozen Food Logo"
              className="h-10 w-10 object-contain shrink-0 drop-shadow-xs"
              src="/logo-icon.png"
            />
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              Karunrung Frozen Food
            </span>
          </div>

          <Card className="border border-border/80 bg-white shadow-xs rounded-xl">
            <CardHeader className="space-y-1.5 p-6 pb-4">
              <CardTitle className="font-display text-xl font-bold text-foreground">
                Masuk ke Sistem
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Gunakan kredensial akun Anda untuk mengakses panel inventori.
              </p>
            </CardHeader>

            <CardContent className="p-6 pt-2">
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 block">
                    Alamat Email
                  </label>
                  <Input
                    autoComplete="email"
                    className="h-11 text-sm rounded-lg"
                    placeholder="admin@karunrung.com"
                    {...register("email")}
                    type="email"
                  />
                  {errors.email ? (
                    <span className="text-xs text-destructive block">
                      {errors.email.message}
                    </span>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 block">
                    Kata Sandi
                  </label>
                  <Input
                    autoComplete="current-password"
                    className="h-11 text-sm rounded-lg"
                    placeholder="••••••••"
                    {...register("password")}
                    type="password"
                  />
                  {errors.password ? (
                    <span className="text-xs text-destructive block">
                      {errors.password.message}
                    </span>
                  ) : null}
                </div>

                {submitError || authError ? (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>{submitError || authError}</span>
                  </div>
                ) : null}

                <Button
                  className="w-full h-11 text-sm font-semibold mt-2 rounded-lg"
                  disabled={isSubmitting || loading}
                  type="submit"
                >
                  {isSubmitting ? "Memverifikasi..." : "Masuk"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Lupa kata sandi? Hubungi Administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

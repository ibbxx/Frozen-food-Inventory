declare module "@/shared/ui/badge" {
  import type { ComponentType } from "react";

  export const Badge: ComponentType<any>;
  export const badgeVariants: (...args: any[]) => string;
}

declare module "@/shared/ui/button" {
  import type { ComponentType } from "react";

  export const Button: ComponentType<any>;
  export const buttonVariants: (...args: any[]) => string;
}

declare module "@/shared/ui/card" {
  import type { ComponentType } from "react";

  export const Card: ComponentType<any>;
  export const CardHeader: ComponentType<any>;
  export const CardTitle: ComponentType<any>;
  export const CardDescription: ComponentType<any>;
  export const CardContent: ComponentType<any>;
  export const CardFooter: ComponentType<any>;
}

declare module "@/shared/ui/input" {
  import type { ComponentType } from "react";

  export const Input: ComponentType<any>;
}

declare module "@/shared/ui/modal" {
  import type { ComponentType } from "react";

  export const Modal: ComponentType<any>;
}

declare module "@/features/auth/AuthProvider" {
  export function useAuth(): any;
}

declare module "@/features/auth" {
  export function AuthProvider(props: any): any;
  export function ProtectedRoute(props: any): any;
  export function useAuth(): any;
}

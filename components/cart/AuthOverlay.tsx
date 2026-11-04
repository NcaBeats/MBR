"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";

type Props = Readonly<{
  open: boolean;
  onClose: () => void;
}>;

export const AuthOverlay = ({ open, onClose }: Props) => {
  const pathname = usePathname();
  // Vuelve a la pagina actual (carrito/checkout) despues de autenticarse.
  const next = encodeURIComponent(pathname);

  // AlertDialog ignora el click fuera: se habilita manualmente.
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (
        (e.target as HTMLElement).closest('[data-slot="alert-dialog-overlay"]')
      ) {
        onClose();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, onClose]);

  return (
    <AlertDialog open={open} onOpenChange={(value) => !value && onClose()}>
      <AlertDialogContent size="sm" className="gap-3">
        <AlertDialogHeader>
          <AlertDialogTitle>Sign in to continue</AlertDialogTitle>
          <AlertDialogDescription>
            You need an account to complete your purchase.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="p-3">
          <AlertDialogCancel
            nativeButton={false}
            className={buttonVariants({ variant: "outline" })}
            render={<Link href={`/log-in?next=${next}`} onClick={onClose} />}
          >
            Log in
          </AlertDialogCancel>
          <AlertDialogAction
            nativeButton={false}
            render={<Link href={`/sign-up?next=${next}`} onClick={onClose} />}
          >
            Sign up
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

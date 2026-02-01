"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        // เบาลง + มีเส้นบางแทนเงา
        "relative flex size-7 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10 bg-white",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        // เน้นให้ภาพเนียน ไม่ต้อง effect เยอะ
        "aspect-square size-full object-cover",
        className,
      )}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        // พื้นหลังโปร่ง + ตัวอักษรบาง
        "flex size-full items-center justify-center rounded-full bg-black/5 text-[11px] font-light tracking-wide text-black/70",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };

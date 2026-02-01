"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function DropdownMenu(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Root>,
) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>,
) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

function DropdownMenuTrigger(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>,
) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          [
            // layout
            "z-50 min-w-[11rem] overflow-hidden rounded-xl p-1",
            "max-h-(--radix-dropdown-menu-content-available-height)",
            "origin-(--radix-dropdown-menu-content-transform-origin)",

            // minimal surface
            "bg-white/80 backdrop-blur-xl",
            "border border-black/10",
            "shadow-[0_18px_50px_-30px_rgba(0,0,0,0.45)]",

            // subtle motion
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[state=open]:zoom-in-98 data-[state=closed]:zoom-out-98",
            "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
            "data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1",
          ].join(" "),
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Group>,
) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        [
          // base
          "relative flex items-center gap-2 rounded-lg px-3 py-2",
          "text-[13px] leading-none",
          "text-black/75",
          "outline-none select-none",

          // interactions
          "cursor-default",
          "hover:bg-black/[0.04]",
          "focus-visible:bg-black/[0.06] focus-visible:text-black/90",

          // disabled
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-45",

          // inset
          "data-[inset]:pl-9",

          // icons
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
          "[&_svg:not([class*='text-'])]:text-black/45",

          // destructive
          "data-[variant=destructive]:text-red-600",
          "data-[variant=destructive]:hover:bg-red-500/10",
          "data-[variant=destructive]:focus-visible:bg-red-500/12",
          "data-[variant=destructive]:[&_svg]:text-red-600/80",
        ].join(" "),
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      checked={checked}
      className={cn(
        [
          "relative flex items-center gap-2 rounded-lg py-2 pr-3 pl-9",
          "text-[13px] leading-none text-black/75",
          "cursor-default outline-none select-none",
          "hover:bg-black/[0.04]",
          "focus-visible:bg-black/[0.06] focus-visible:text-black/90",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
        ].join(" "),
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-3 flex size-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4 text-black/70" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>,
) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        [
          "relative flex items-center gap-2 rounded-lg py-2 pr-3 pl-9",
          "text-[13px] leading-none text-black/75",
          "cursor-default outline-none select-none",
          "hover:bg-black/[0.04]",
          "focus-visible:bg-black/[0.06] focus-visible:text-black/90",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
        ].join(" "),
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-3 flex size-4 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current text-black/70" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-3 py-2 text-[11px] font-medium tracking-[0.18em] uppercase text-black/40 data-[inset]:pl-9",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("my-1 h-px bg-black/10 -mx-1", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto text-[11px] tracking-[0.16em] text-black/35",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSub(
  props: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>,
) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        [
          "flex items-center rounded-lg px-3 py-2",
          "text-[13px] leading-none text-black/75",
          "cursor-default outline-none select-none",
          "hover:bg-black/[0.04]",
          "focus-visible:bg-black/[0.06] focus-visible:text-black/90",
          "data-[state=open]:bg-black/[0.06] data-[state=open]:text-black/90",
          "data-[inset]:pl-9",
        ].join(" "),
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4 text-black/45" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        [
          "z-50 min-w-[10rem] overflow-hidden rounded-xl p-1",
          "bg-white/85 backdrop-blur-xl",
          "border border-black/10",
          "shadow-[0_18px_50px_-30px_rgba(0,0,0,0.45)]",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:zoom-in-98 data-[state=closed]:zoom-out-98",
          "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
          "data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1",
        ].join(" "),
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};

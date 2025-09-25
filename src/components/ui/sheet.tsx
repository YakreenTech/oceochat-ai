"use client"
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetPortal = DialogPrimitive.Portal
export const SheetClose = DialogPrimitive.Close

export function SheetOverlay({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn("fixed inset-0 z-50 bg-black/40", className)}
      {...props}
    />
  )
}

export function SheetContent({ className, side = "left", children, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: "left" | "right" | "top" | "bottom" }) {
  const sideClasses = {
    left: "left-0 top-0 h-full w-80 translate-x-[-100%] data-[state=open]:translate-x-0",
    right: "right-0 top-0 h-full w-80 translate-x-[100%] data-[state=open]:translate-x-0",
    top: "left-0 top-0 w-full h-1/2 -translate-y-full data-[state=open]:translate-y-0",
    bottom: "left-0 bottom-0 w-full h-1/2 translate-y-full data-[state=open]:translate-y-0",
  } as const

  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        data-state
        className={cn(
          "fixed z-50 bg-white text-gray-900 dark:bg-[#202123] dark:text-white border border-black/10 dark:border-white/10 p-3",
          "transition-transform duration-200 ease-out",
          sideClasses[side],
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </SheetPortal>
  )
}

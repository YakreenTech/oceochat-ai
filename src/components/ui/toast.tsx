"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success"
}

const variants = {
  default: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100",
  destructive: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-100",
  success: "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-900 dark:text-green-100"
}

export function Toast({ className, variant = "default", children, ...props }: ToastProps) {
  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm",
        "animate-in slide-in-from-top-2 duration-300",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Array<{ id: string; message: string; variant?: ToastProps["variant"] }>>([])

  const toast = React.useCallback((message: string, variant: ToastProps["variant"] = "default") => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, message, variant }])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const ToastContainer = React.useCallback(() => (
    <>
      {toasts.map(({ id, message, variant }) => (
        <Toast key={id} variant={variant}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== id))}
              className="ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </Toast>
      ))}
    </>
  ), [toasts])

  return { toast, ToastContainer }
}

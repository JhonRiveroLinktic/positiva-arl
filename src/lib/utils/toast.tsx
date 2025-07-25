"use client"
import React from "react"

import { toast as sonnerToast } from "sonner"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"
import type { ExternalToast } from "sonner"

export interface ToastOptions {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success" | "warning" | "info"
  duration?: number
}

export function toast(options: ToastOptions | string) {
  if (typeof options === "string") {
    return sonnerToast(options)
  }

  const { title, description, variant = "default", duration } = options

  const getClassName = () => {
    switch (variant) {
      case "success":
        return "!bg-green-500 !border-green-600 !text-white [&_*]:!text-white"
      case "destructive":
        return "!bg-red-500 !border-red-600 !text-white [&_*]:!text-white"
      case "warning":
        return "!bg-yellow-500 !border-yellow-600 !text-white [&_*]:!text-white"
      case "info":
        return "!bg-blue-500 !border-blue-600 !text-white [&_*]:!text-white"
      default:
        return "!bg-white !border-gray-200 !text-gray-900 [&_*]:!text-gray-900"
    }
  }

  const content = (close?: () => void) => (
    <div className="flex items-center gap-3 w-full">
      <div className="flex flex-col flex-1 min-w-0">
        {title && <div className="font-semibold text-base">{title}</div>}
        {description && <div className="text-sm opacity-90 mt-1">{description}</div>}
      </div>
      {close && (
        <button
          onClick={close}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          aria-label="Cerrar"
          tabIndex={0}
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
  
  
  function toastWithClose(toastFn: (message: () => React.ReactNode, data?: ExternalToast | undefined) => string | number, className: string, durationOverride?: number) {
    const toastId = toastFn(() => content(() => sonnerToast.dismiss(toastId)), {
      duration: durationOverride ?? duration ?? 4000,
      className,
    })
    return toastId
  }

  switch (variant) {
    case "success":
      return toastWithClose(sonnerToast.success, getClassName())
    case "destructive":
      return toastWithClose(sonnerToast.error, getClassName())
    case "warning":
      return toastWithClose(sonnerToast.warning, getClassName())
    case "info":
      return toastWithClose(sonnerToast.info, getClassName())
    default:
      return toastWithClose(sonnerToast, getClassName())
  }
}

toast.success = (options: Omit<ToastOptions, "variant"> | string) => {
  if (typeof options === "string") {
    return toast({ title: options, variant: "success", duration: 4000 })
  }
  return toast({ ...options, variant: "success", duration: 4000 })
}

toast.error = (options: Omit<ToastOptions, "variant"> | string) => {
  if (typeof options === "string") {
    return toast({ title: options, variant: "destructive" })
  }
  return toast({ ...options, variant: "destructive" })
}

toast.warning = (options: Omit<ToastOptions, "variant"> | string) => {
  if (typeof options === "string") {
    return toast({ title: options, variant: "warning" })
  }
  return toast({ ...options, variant: "warning" })
}

toast.info = (options: Omit<ToastOptions, "variant"> | string) => {
  if (typeof options === "string") {
    return toast({ title: options, variant: "info", duration: 2000 })
  }
  return toast({ ...options, variant: "info", duration: 2000 })
}

export function useToast() {
  return {
    toast,
    dismiss: (toastId?: string | number) => {
      if (toastId) {
        sonnerToast.dismiss(toastId)
      } else {
        sonnerToast.dismiss()
      }
    },
  }
}
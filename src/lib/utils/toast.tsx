"use client"
import React from "react"

import { toast as sonnerToast } from "sonner"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"

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

  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 !text-white" />
      case "destructive":
        return <XCircle className="h-5 w-5 !text-white" />
      case "warning":
        return <AlertCircle className="h-5 w-5 !text-white" />
      case "info":
        return <Info className="h-5 w-5 !text-white" />
      default:
        return undefined
    }
  }

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

  // Usar una función para renderizar el contenido y recibir el close
  const content = (close?: () => void) => (
    <div className="flex items-start gap-3 w-full">
      {getIcon()}
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold text-sm">{title}</div>}
        {description && <div className="text-sm opacity-90 mt-1">{description}</div>}
      </div>
      <button
        onClick={close}
        className="ml-2 p-1 rounded hover:bg-black/10 transition-colors"
        aria-label="Cerrar"
        tabIndex={0}
        type="button"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )

  // Helper para usar la API de sonner correctamente
  function toastWithClose(toastFn: (message: () => React.ReactNode, data?: any) => string | number, className: string) {
    let toastId: string | number | undefined
    toastId = toastFn(() => content(() => sonnerToast.dismiss(toastId)), {
      duration: duration ?? 4000,
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
    return toast({ title: options, variant: "success" })
  }
  return toast({ ...options, variant: "success" })
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
    return toast({ title: options, variant: "info" })
  }
  return toast({ ...options, variant: "info" })
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
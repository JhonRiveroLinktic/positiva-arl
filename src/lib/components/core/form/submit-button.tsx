"use client"

import type { ReactNode } from "react"
import { Button, type ButtonProps } from "@/lib/components/ui/button"
import { cn } from "@/lib/utils/utils"

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean
  loadingText?: string
  icon?: ReactNode
  loadingIcon?: ReactNode
  children: ReactNode
}

export function LoadingButton({
  isLoading = false,
  loadingText,
  icon,
  loadingIcon,
  disabled,
  className,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button {...props} disabled={disabled || isLoading} className={cn(className)}>
      {isLoading ? (
        <>
          {loadingIcon}
          {loadingText || children}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </Button>
  )
}
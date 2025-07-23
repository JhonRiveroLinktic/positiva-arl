"use client"

import type React from "react"

import { forwardRef } from "react"
import { Input } from "@/lib/components/ui/input"
import { FormControl, FormItem, FormLabel, FormMessage } from "@/lib/components/ui/form"
import { cn } from "@/lib/utils/utils"

interface FormInputProps {
  label: string
  placeholder?: string
  type?: "text" | "email" | "tel" | "password" | "number"
  disabled?: boolean
  className?: string
  error?: boolean
  errorMessage?: string
  required?: boolean
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  name?: string
  id?: string
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      placeholder,
      type = "text",
      disabled = false,
      className,
      error = false,
      errorMessage,
      required = false,
      value,
      onChange,
      onBlur,
      name,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || name || label.toLowerCase().replace(/\s+/g, "-")

    return (
      <FormItem className={className}>
        <FormLabel htmlFor={inputId} className="text-gray-700 font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </FormLabel>
        <FormControl>
          <Input
            {...props}
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "transition-colors",
              error && "border-red-500 focus-visible:ring-red-500",
              disabled && "opacity-50 cursor-not-allowed",
            )}
            aria-invalid={error}
            aria-describedby={error ? `${inputId}-error` : undefined}
          />
        </FormControl>
        {errorMessage && <FormMessage id={`${inputId}-error`}>{errorMessage}</FormMessage>}
      </FormItem>
    )
  },
)

FormInput.displayName = "FormInput"
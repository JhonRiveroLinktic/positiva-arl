"use client"

import type React from "react"

import { forwardRef } from "react"
import { Textarea } from "@/lib/components/ui/textarea"
import { FormControl, FormItem, FormLabel, FormMessage } from "@/lib/components/ui/form"
import { cn } from "@/lib/utils/utils"

interface FormTextareaProps {
  label: string
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: boolean
  errorMessage?: string
  required?: boolean
  rows?: number
  maxLength?: number
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: () => void
  name?: string
  id?: string
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      placeholder,
      disabled = false,
      className,
      error = false,
      errorMessage,
      required = false,
      rows = 4,
      maxLength,
      value,
      onChange,
      onBlur,
      name,
      id,
      ...props
    },
    ref,
  ) => {
    const textareaId = id || name || label.toLowerCase().replace(/\s+/g, "-")

    return (
      <FormItem className={className}>
        <FormLabel htmlFor={textareaId} className="text-[#0A0A0A] font-medium">
          {label}
          {required && <span className="text-red-500">*</span>}
        </FormLabel>
        <FormControl>
          <div className="relative">
            <Textarea
              {...props}
              ref={ref}
              id={textareaId}
              name={name}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              maxLength={maxLength}
              className={cn(
                "resize-none transition-colors",
                error && "border-red-500 focus-visible:ring-red-500",
                disabled && "opacity-50 cursor-not-allowed",
              )}
              aria-invalid={error}
              aria-describedby={error ? `${textareaId}-error` : undefined}
            />
            {maxLength && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {value?.length || 0}/{maxLength}
              </div>
            )}
          </div>
        </FormControl>
        {errorMessage && <FormMessage id={`${textareaId}-error`}>{errorMessage}</FormMessage>}
      </FormItem>
    )
  },
)

FormTextarea.displayName = "FormTextarea"
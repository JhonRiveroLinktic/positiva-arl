"use client"

import { forwardRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/lib/components/ui/select"
import { FormControl, FormItem, FormLabel, FormMessage } from "@/lib/components/ui/form"
import { cn } from "@/lib/utils/utils"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface FormSelectProps {
  label: string
  placeholder?: string
  options: SelectOption[]
  disabled?: boolean
  className?: string
  error?: boolean
  errorMessage?: string
  required?: boolean
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  name?: string
  id?: string
}

export const FormSelect = forwardRef<HTMLButtonElement, FormSelectProps>(
  (
    {
      label,
      placeholder = "Selecciona una opción",
      options,
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
    const selectId = id || name || label.toLowerCase().replace(/\s+/g, "-")

    return (
      <FormItem className={className}>
        <FormLabel htmlFor={selectId} className="text-gray-700 font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </FormLabel>
        <FormControl>
          <Select value={value} onValueChange={onChange} disabled={disabled} name={name} {...props}>
            <SelectTrigger
              ref={ref}
              id={selectId}
              className={cn(
                "transition-colors",
                error && "border-red-500 focus:ring-red-500",
                disabled && "opacity-50 cursor-not-allowed",
              )}
              aria-invalid={error}
              aria-describedby={error ? `${selectId}-error` : undefined}
              onBlur={onBlur}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormControl>
        {errorMessage && <FormMessage id={`${selectId}-error`}>{errorMessage}</FormMessage>}
      </FormItem>
    )
  },
)

FormSelect.displayName = "FormSelect"
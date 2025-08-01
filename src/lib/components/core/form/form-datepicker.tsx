"use client"

import { forwardRef, useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { es } from "date-fns/locale"

import { Button } from "@/lib/components/ui/button"
import { Calendar } from "@/lib/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/lib/components/ui/popover"
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/lib/components/ui/form"

import { cn } from "@/lib/utils/utils"

interface FormDatePickerProps {
  label: string
  value?: Date
  onChange?: (date: Date | undefined) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
  disabled?: boolean
  error?: boolean
  errorMessage?: string
  required?: boolean
  name?: string
  id?: string
  minDate?: Date
  maxDate?: Date
}

export const FormDatePicker = forwardRef<HTMLButtonElement, FormDatePickerProps>(
  (
    {
      label,
      value,
      onChange,
      onBlur,
      placeholder = "Selecciona una fecha",
      className,
      disabled = false,
      error = false,
      errorMessage,
      required = false,
      name,
      id,
      minDate = new Date("1900-01-01"),
      maxDate = new Date(new Date().getFullYear() + 10, 11),
    },
    ref
  ) => {
    const dateId = id || name || label.toLowerCase().replace(/\s+/g, "-")
    const [open, setOpen] = useState(false)

    const handleDateChange = (date: Date | undefined) => {
      onChange?.(date)
      setOpen(false)
    }

    const getInitialMonth = () => {
      if (value) {
        return new Date(value.getFullYear(), value.getMonth(), 1)
      }
      return new Date()
    }

    return (
      <FormItem className={className}>
        <FormLabel htmlFor={dateId} className="text-[#0A0A0A] font-medium">
          {label}
          {required && <span className="text-red-500">*</span>}
        </FormLabel>
        <FormControl>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                ref={ref}
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground",
                  error && "border-red-500 focus-visible:ring-red-500",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                id={dateId}
                name={name}
                aria-invalid={error}
                aria-describedby={error ? `${dateId}-error` : undefined}
                onBlur={onBlur}
                disabled={disabled}
              >
                {value ? format(value, "PPP", { locale: es }) : <span>{placeholder}</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value}
                onSelect={handleDateChange}
                disabled={(date) => date < minDate || date > maxDate}
                captionLayout="dropdown"
                defaultMonth={getInitialMonth()}
              />
            </PopoverContent>
          </Popover>
        </FormControl>
        {errorMessage && (
          <FormMessage id={`${dateId}-error`}>{errorMessage}</FormMessage>
        )}
      </FormItem>
    )
  }
)

FormDatePicker.displayName = "FormDatePicker"
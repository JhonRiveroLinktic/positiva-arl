"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils/utils"
import { Button } from "@/lib/components/ui/button"
import { Calendar } from "@/lib/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/lib/components/ui/popover"
import { Label } from "@/lib/components/ui/label"

interface DatePickerProps {
  label?: string
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  error?: boolean
  errorMessage?: string
  required?: boolean
  minDate?: Date
  maxDate?: Date
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = "Selecciona una fecha",
  disabled = false,
  error = false,
  errorMessage,
  required = false,
  minDate = new Date("1900-01-01"),
  maxDate = new Date(new Date().getFullYear() + 10, 11),
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

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
    <div className="space-y-2">
      {label && (
        <Label className="text-[#0A0A0A] font-medium">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              error && "border-red-500 focus-visible:ring-red-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
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
            locale={es}
          />
        </PopoverContent>
      </Popover>
      {errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  )
}


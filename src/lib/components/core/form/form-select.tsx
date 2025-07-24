"use client"

import { forwardRef, useState } from "react"
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/lib/components/ui/command"
import { FormControl, FormItem, FormLabel, FormMessage } from "@/lib/components/ui/form"
import { cn } from "@/lib/utils/utils"
import { Button } from "@/lib/components/ui/button"

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
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState("")

    const selectedOption = options.find((opt) => opt.value === value)

    return (
      <FormItem className={`${className} w-full`}>
        <FormLabel htmlFor={selectId} className="text-gray-700 font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </FormLabel>
        <FormControl>
          <div className="relative">
            <Button
              type="button"
              ref={ref}
              variant="outline"
              className={cn(
                "w-full justify-between text-left",
                error && "border-red-500 focus:ring-red-500",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-controls={`${selectId}-combobox-list`}
              aria-invalid={error}
              aria-describedby={error ? `${selectId}-error` : undefined}
              onClick={() => setOpen((prev) => !prev)}
              onBlur={onBlur}
              disabled={disabled}
              {...props}
            >
              {selectedOption ? selectedOption.label : <span className="text-muted-foreground">{placeholder}</span>}
            </Button>
            {open && (
              <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Buscar..."
                    value={inputValue}
                    onValueChange={setInputValue}
                    autoFocus
                  />
                  <CommandList id={`${selectId}-combobox-list`}>
                    <CommandEmpty>No hay opciones</CommandEmpty>
                    {options
                      .filter((option) =>
                        option.label.toLowerCase().includes(inputValue.toLowerCase())
                      )
                      .map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          disabled={option.disabled}
                          onSelect={() => {
                            if (!option.disabled) {
                              onChange?.(option.value)
                              setOpen(false)
                              setInputValue("")
                            }
                          }}
                          className={cn(
                            option.value === value && "bg-accent text-accent-foreground",
                            option.disabled && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {option.label}
                        </CommandItem>
                      ))}
                  </CommandList>
                </Command>
              </div>
            )}
          </div>
        </FormControl>
        {errorMessage && <FormMessage id={`${selectId}-error`}>{errorMessage}</FormMessage>}
      </FormItem>
    )
  },
)

FormSelect.displayName = "FormSelect"
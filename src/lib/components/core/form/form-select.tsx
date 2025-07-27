"use client"

import {
  forwardRef,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react"
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/lib/components/ui/command"
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/lib/components/ui/form"
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
  maxInitialOptions?: number
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
      maxInitialOptions = 100,
      ...props
    },
    ref,
  ) => {
    const selectId = id || name || label.toLowerCase().replace(/\s+/g, "-")
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [visible, setVisible] = useState(false)
    const [dropUp, setDropUp] = useState(false)

    const popoverRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)

    const closeDropdown = useCallback(() => {
      setVisible(false)
      setTimeout(() => setOpen(false), 150)
    }, [])

    // Filtrar opciones basado en el input de búsqueda
    const filteredOptions = useMemo(() => {
      if (!inputValue) {
        // Si no hay búsqueda, mostrar solo las primeras opciones limitadas
        return options.slice(0, maxInitialOptions)
      }
      
      // Si hay búsqueda, filtrar en todas las opciones
      return options.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      )
    }, [options, inputValue, maxInitialOptions])

    // Mostrar mensaje si hay más opciones disponibles
    const hasMoreOptions = useMemo(() => {
      if (inputValue) return false // Si está buscando, no mostrar el mensaje
      return options.length > maxInitialOptions
    }, [options.length, maxInitialOptions, inputValue])

    useEffect(() => {
      if (!open) return

      setVisible(true)

      const timeout = setTimeout(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (
            popoverRef.current &&
            !popoverRef.current.contains(event.target as Node) &&
            buttonRef.current &&
            !buttonRef.current.contains(event.target as Node)
          ) {
            closeDropdown()
          }
        }

        document.addEventListener("mousedown", handleClickOutside)

        // Adapt dropdown direction
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect()
          const spaceBelow = window.innerHeight - rect.bottom
          const spaceAbove = rect.top
          const estimatedHeight = 300 // aprox dropdown height

          setDropUp(spaceBelow < estimatedHeight && spaceAbove > estimatedHeight)
        }

        return () => {
          document.removeEventListener("mousedown", handleClickOutside)
        }
      }, 0)

      return () => clearTimeout(timeout)
    }, [open, closeDropdown])

    const selectedOption = options.find((opt) => opt.value === value)

    return (
      <FormItem className={cn("w-full", className)}>
        <FormLabel htmlFor={selectId} className="text-[#0A0A0A] font-medium">
          {label}
          {required && <span className="text-red-500">*</span>}
        </FormLabel>
        <FormControl>
          <div className="relative">
            <Button
              type="button"
              ref={(el) => {
                buttonRef.current = el
                if (typeof ref === "function") ref(el)
                else if (ref) ref.current = el
              }}
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
              onClick={() => {
                if (open) {
                  closeDropdown()
                } else {
                  setOpen(true)
                }
              }}
              onBlur={onBlur}
              disabled={disabled}
              {...props}
            >
              {selectedOption ? (
                selectedOption.label
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </Button>

            {open && (
              <div
                ref={popoverRef}
                className={cn(
                  "absolute z-50 w-full bg-white border rounded-md shadow-lg transition-all duration-150 ease-out",
                  dropUp ? "bottom-full mb-1" : "mt-1",
                  visible
                    ? "opacity-100 translate-y-0"
                    : dropUp
                      ? "opacity-0 translate-y-2"
                      : "opacity-0 -translate-y-2"
                )}
              >
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Buscar..."
                    value={inputValue}
                    onValueChange={setInputValue}
                    autoFocus
                  />
                  <CommandList id={`${selectId}-combobox-list`}>
                    <CommandEmpty>
                      {inputValue ? "No hay opciones" : "Escribe para buscar más opciones"}
                    </CommandEmpty>
                    {filteredOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                        onSelect={() => {
                          if (!option.disabled) {
                            onChange?.(option.value)
                            closeDropdown()
                            setInputValue("")
                          }
                        }}
                        className={cn(
                          option.value === value &&
                            "bg-accent text-accent-foreground",
                          option.disabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {option.label}
                      </CommandItem>
                    ))}
                    {hasMoreOptions && (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground border-t bg-muted/50">
                        Mostrando {maxInitialOptions} de {options.length} opciones. 
                        Escribe para buscar en todas las opciones.
                      </div>
                    )}
                  </CommandList>
                </Command>
              </div>
            )}
          </div>
        </FormControl>
        {errorMessage && (
          <FormMessage id={`${selectId}-error`}>{errorMessage}</FormMessage>
        )}
      </FormItem>
    )
  }
)

FormSelect.displayName = "FormSelect"
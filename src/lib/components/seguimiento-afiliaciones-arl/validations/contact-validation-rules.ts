import { hasDangerousContent, validatePhoneNumber, VALIDATION_PATTERNS } from "@/lib/utils/validations"

export interface ContactFormData {
  nombre: string
  correo: string
  telefono?: string
}

export const contactValidationRules = {
  nombre: {
    required: "El primer nombre es requerido",
    minLength: { value: 2, message: "Mínimo 2 caracteres" },
    maxLength: { value: 50, message: "Máximo 50 caracteres" },
    pattern: {
      value: VALIDATION_PATTERNS.name,
      message: "Solo se permiten letras y espacios",
    },
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },
  correo: {
    required: "El correo electrónico es requerido",
    minLength: { value: 2, message: "Mínimo 2 caracteres" },
    maxLength: { value: 100, message: "Máximo 100 caracteres" },
    pattern: {
      value: VALIDATION_PATTERNS.email,
      message: "Ingrese un correo electrónico válido",
    },
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },
  telefono: {
    pattern: {
      value: /^[\d\s\-\+\(\)]*$/,
      message: "Formato de teléfono inválido",
    },
    validate: (value: string) => {
      if (!value || value.trim() === "") return true
  
      const phoneValidation = validatePhoneNumber(value)
      if (!phoneValidation.isValid) {
        return phoneValidation.message || "Formato de teléfono inválido"
      }
  
      return true
    },
  },
  
} 
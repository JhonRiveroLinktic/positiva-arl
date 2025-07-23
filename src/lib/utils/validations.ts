// Patrones de validación comunes
export const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^\d{10}$/,
  name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  noSpecialChars: /^[a-zA-Z0-9\s\-_.]+$/,
} as const

// Caracteres peligrosos para SQL injection y XSS
const DANGEROUS_PATTERNS = {
  sqlInjection: /('|(--)|(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT|MERGE|SELECT|UPDATE|UNION|USE)\b))/gi,
  xssScript: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  xssEvents: /on\w+\s*=/gi,
  htmlTags: /<[^>]*>/g,
  sqlComments: /(\/\*[\s\S]*?\*\/)|(--[^\r\n]*)/g,
} as const

// Sanitización de input general removiendo caracteres peligrosos y espacios al inicio
export function sanitizeInput(value: string): string {
  if (!value || typeof value !== "string") return ""

  return value
    .trimStart()
    .replace(DANGEROUS_PATTERNS.sqlInjection, "")
    .replace(DANGEROUS_PATTERNS.xssScript, "")
    .replace(DANGEROUS_PATTERNS.xssEvents, "")
    .replace(DANGEROUS_PATTERNS.sqlComments, "")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .substring(0, 1000)
}

// Sanitización de email
export function sanitizeEmail(value: string): string {
  if (!value) return ""
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._+-]/g, "")
    .substring(0, 254)
}

//Sanitización de números de teléfono
export function sanitizePhone(value: string): string {
  if (!value) return ""
  return value.replace(/\D/g, "").substring(0, 15)
}

// Detectar contenido peligroso en un string
export function hasDangerousContent(value: string): boolean {
  if (!value) return false

  return (
    DANGEROUS_PATTERNS.sqlInjection.test(value) ||
    DANGEROUS_PATTERNS.xssScript.test(value) ||
    DANGEROUS_PATTERNS.xssEvents.test(value) ||
    value.includes("javascript:") ||
    value.includes("data:text/html")
  )
}

// Reglas de validación reutilizables para react-hook-form
export const createValidationRules = {
  required: (message = "Este campo es requerido") => ({
    required: message,
  }),

  email: (message = "Ingresa un email válido") => ({
    required: "El email es requerido",
    pattern: {
      value: VALIDATION_PATTERNS.email,
      message,
    },
    validate: (value: string) => {
      const sanitized = sanitizeEmail(value)
      if (hasDangerousContent(value)) {
        return "El email contiene caracteres no permitidos"
      }
      if (sanitized !== value.toLowerCase().trim()) {
        return "El email contiene caracteres inválidos"
      }
      return true
    },
  }),

  phone: (message = "Ingresa un teléfono válido de 10 dígitos") => ({
    required: "El teléfono es requerido",
    validate: (value: string) => {
      const sanitized = sanitizePhone(value)
      if (sanitized.length !== 10) {
        return message
      }
      if (hasDangerousContent(value)) {
        return "El teléfono contiene caracteres no permitidos"
      }
      return true
    },
  }),

  text: (options: { min?: number; max?: number; pattern?: RegExp; message?: string } = {}) => ({
    required: "Este campo es requerido",
    minLength: options.min ? { value: options.min, message: `Mínimo ${options.min} caracteres` } : undefined,
    maxLength: options.max ? { value: options.max, message: `Máximo ${options.max} caracteres` } : undefined,
    pattern: options.pattern ? { value: options.pattern, message: options.message || "Formato inválido" } : undefined,
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      const sanitized = sanitizeInput(value)
      if (sanitized !== value.trim()) {
        return "Este campo contiene caracteres inválidos"
      }
      return true
    },
  }),

  select: (message = "Selecciona una opción") => ({
    required: message,
    validate: (value: string) => {
      if (!value || value === "") {
        return message
      }
      if (hasDangerousContent(value)) {
        return "La selección contiene caracteres no permitidos"
      }
      return true
    },
  }),

  date: (message = "Selecciona una fecha válida") => ({
    required: message,
    validate: (value: string) => {
      if (!value) return message
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return "Fecha inválida"
      }
      return true
    },
  }),
}
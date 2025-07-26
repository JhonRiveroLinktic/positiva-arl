// Patrones de validación comunes
export const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^\d{10}$/,
  name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  alphanumericNoSpaces: /^[a-zA-Z0-9]+$/,
  noSpecialChars: /^[a-zA-Z0-9\s\-_.]+$/,
  address: /^[a-zA-Z0-9\s#\-,.]+$/,
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

/**
 * Calculate verification digit for a Colombian NIT using Module 11 method
 * @param myNit - Tax Identification Number (NIT) without verification digit
 * @returns Calculated verification digit, or null if NIT is invalid
 */
export function calculateNitVerificationDigit(myNit: string | null): number | null {
  if (!myNit) {
    return null
  }

  // Convert to string and clean the NIT
  const cleanNit = myNit.toString().replace(/\s/g, "").replace(/,/g, "").replace(/\./g, "").replace(/-/g, "")

  // Validate if NIT is numeric
  if (!/^\d+$/.test(cleanNit)) {
    return null // Return null if not a valid number
  }

  // Validate NIT length (should be between 7-15 digits)
  if (cleanNit.length < 7 || cleanNit.length > 15) {
    return null // Return null if NIT length is invalid
  }

  // Multipliers according to Module 11 method
  const vpri = [0, 3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71]
  const z = cleanNit.length
  let x = 0

  for (let i = 0; i < z; i++) {
    const y = Number.parseInt(cleanNit[i])
    x += y * vpri[z - i]
  }

  const y = x % 11
  return y > 1 ? 11 - y : y
}

/**
 * Remove verification digit from NIT
 * @param nit - NIT that may include verification digit
 * @returns NIT without verification digit
 */
export function removeNitVerificationDigit(nit: string): string {
  if (!nit) return ""

  // Elimina espacios, comas, puntos y cualquier guion
  let cleanNit = nit.replace(/\s/g, "").replace(/,/g, "").replace(/\./g, "")

  // Si contiene un guion, se asume que lo que está después es el DV y se remueve.
  if (cleanNit.includes("-")) {
    cleanNit = cleanNit.split("-")[0]
  }

  // Asegurarse de que solo queden dígitos.
  return cleanNit.replace(/\D/g, "")
}

/**
 * Validate NIT verification digit
 * @param nit - Complete NIT with verification digit
 * @returns Validation result with corrected flag and error message
 */
export function validateNitVerificationDigit(nit: string): {
  isValid: boolean
  cleanNit: string
  verificationDigit: number | null
  errorMessage?: string
} {
  const cleanNit = removeNitVerificationDigit(nit)

  // Check length first
  if (cleanNit.length < 7 || cleanNit.length > 15) {
    return {
      isValid: false,
      cleanNit,
      verificationDigit: null,
      errorMessage: "El NIT debe tener entre 7 y 15 dígitos",
    }
  }

  const calculatedDigit = calculateNitVerificationDigit(cleanNit)

  return {
    isValid: calculatedDigit !== null,
    cleanNit,
    verificationDigit: calculatedDigit,
    errorMessage: calculatedDigit === null ? "Formato de NIT inválido" : undefined,
  }
}

/**
 * Remove unnecessary whitespace from all fields
 * @param value - String value to clean
 * @returns Cleaned string
 */
export function cleanWhitespace(value: string): string {
  if (!value) return value
  return value.trim().replace(/\s+/g, " ")
}

/**
 * Validate and clean special characters, especially badly encoded tildes
 * @param value - String to validate
 * @returns Cleaned string with proper encoding
 */
export function validateAndCleanSpecialCharacters(value: string): string {
  if (!value) return value

  // Replace common badly encoded characters
  return value
    .replace(/Ã¡/g, "á")
    .replace(/Ã©/g, "é")
    .replace(/Ã­/g, "í")
    .replace(/Ã³/g, "ó")
    .replace(/Ãº/g, "ú")
    .replace(/Ã±/g, "ñ")
    .replace(/Ã¼/g, "ü")
    .replace(/Ã/g, "Á")
    .replace(/Ã‰/g, "É")
    .replace(/Ã/g, "Í")
    .replace(/Ã"/g, "Ó")
    .replace(/Ãš/g, "Ú")
    .replace(/Ã'/g, "Ñ")
}

/**
 * Validate Colombian phone numbers
 * @param phone - Phone number to validate
 * @returns Validation result with error message
 */
export function validatePhoneNumber(phone: string): { isValid: boolean; message?: string } {
  if (!phone) return { isValid: false, message: "El número de teléfono es requerido" }

  // Colombian phone validation: ^(3\d{9}|\d{7})$
  // Celulares: 10 digits starting with 3 (3XXXXXXXXX)
  // Fijos: 7 digits exactly
  const phoneRegex = /^(3\d{9}|\d{7})$/

  if (!phoneRegex.test(phone)) {
    if (phone.length < 7) {
      return { isValid: false, message: "Teléfono muy corto (mínimo 7 dígitos para fijo)" }
    } else if (phone.length > 10) {
      return { isValid: false, message: "Teléfono muy largo (máximo 10 dígitos)" }
    } else if (phone.length === 10 && !phone.startsWith("3")) {
      return { isValid: false, message: "Celulares deben iniciar por 3" }
    } else if (phone.length === 8 || phone.length === 9) {
      return { isValid: false, message: "Use 7 dígitos (fijo) o 10 dígitos (celular)" }
    } else if (phone.startsWith("0")) {
      return { isValid: false, message: "No use ceros iniciales" }
    } else {
      return {
        isValid: false,
        message: "Formato inválido. Use 7 dígitos (fijo) o 10 dígitos iniciando por 3 (celular)",
      }
    }
  }

  return { isValid: true }
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
import {
  sanitizeInput,
  hasDangerousContent,
  validatePhoneNumber,
  validateNitVerificationDigit,
  cleanWhitespace,
  validateAndCleanSpecialCharacters,
  VALIDATION_PATTERNS,
  removeNitVerificationDigit
} from "@/lib/utils/validations"

export const MINIMUM_WAGE = 1423500

export const MIN_DATE_AFILIATION = new Date("1901-01-01")

export const getMaxDateCoverage = (): Date => {
  const max = new Date()
  max.setDate(max.getDate() + 30)
  return max
}

export function validatePersonDocumentType(documentType: string): boolean {
  const naturalPersonTypes = ["CC", "TI", "CE", "CD", "PT", "SC"]
  const nitTypes = ["NI"]

  return !nitTypes.includes(documentType)
}

export function validateAndAssignSalary(salary: string): string {
  if (!salary || salary.trim() === "") {
    return MINIMUM_WAGE.toString()
  }

  const numericSalary = Number.parseFloat(salary.replace(/[,.]/g, ""))
  if (isNaN(numericSalary) || numericSalary < MINIMUM_WAGE) {
    return MINIMUM_WAGE.toString()
  }

  return salary
}

export function validateGender(gender: string): boolean {
  const validGenders = ["M", "F", "T", "N", "O"]
  return validGenders.includes(gender)
}

export function validateEpsCode(epsCode: string): boolean {
  if (!epsCode) return false

  const epsPattern = /^EPS\d{3}$/i

  const isNitFormat = /^\d+(-?\d)?$/.test(epsCode.trim())

  return epsPattern.test(epsCode) || (!isNitFormat && epsCode.length > 0)
}

export const arlValidationRules = {
  // Tipo de documeto persona
  tipoDocPersona: {
    required: "El tipo de documento es requerido",
    validate: (value: string) => {
      if (!validatePersonDocumentType(value)) {
        return "Las personas naturales no pueden tener tipo de documento NIT"
      }
      return true
    },
  },

  // Número de documento persona
  numeDocPersona: {
    required: "El número de documento es requerido",
    validate: (value: string, formValues: any) => {
      if (hasDangerousContent(value)) {
        return "El documento contiene caracteres no permitidos"
      }

      if (formValues.tipoDocPersona === "NI") {
        const nitValidation = validateNitVerificationDigit(value)
        if (!nitValidation.isValid) {
          return nitValidation.errorMessage || "Formato de NIT inválido"
        }
      }

      return true
    },
  },

  // Primer apellido
  apellido1: {
    required: "El primer apellido es requerido",
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
      const sanitized = sanitizeInput(value)
      if (sanitized !== value.trim()) {
        return "Este campo contiene caracteres inválidos"
      }
      return true
    },
  },

  // Segundo apellido (opcional)
  apellido2: {
    maxLength: { value: 50, message: "Máximo 50 caracteres" },
    pattern: {
      value: VALIDATION_PATTERNS.name,
      message: "Solo se permiten letras y espacios",
    },
    validate: (value: string) => {
      if (!value) return true // Campo opcional
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  // Primer nombre
  nombre1: {
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

  // Segundo nombre (opcional)
  nombre2: {
    maxLength: { value: 50, message: "Máximo 50 caracteres" },
    pattern: {
      value: VALIDATION_PATTERNS.name,
      message: "Solo se permiten letras y espacios",
    },
    validate: (value: string) => {
      if (!value) return true // Campo opcional
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  // Fecha de nacimiento
  fechaNacimiento: {
    required: "La fecha de nacimiento es requerida",
    validate: (value: string) => {
      if (!value) return "La fecha de nacimiento es requerida"
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return "Fecha inválida"
      }

      // Validar que no sea fecha futura
      const today = new Date()
      if (date > today) {
        return "La fecha de nacimiento no puede ser futura"
      }

      // Validar edad mínima (14 años)
      const minDate = new Date()
      minDate.setFullYear(today.getFullYear() - 14)
      if (date > minDate) {
        return "La edad mínima es 14 años"
      }

      return true
    },
  },

  // Sexo
  sexo: {
    required: "El sexo es requerido",
  },



  // Dirección
  direccion: {
    required: "La dirección es requerida",
    minLength: { value: 5, message: "Mínimo 5 caracteres" },
    maxLength: { value: 200, message: "Máximo 200 caracteres" },
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "La dirección contiene caracteres no permitidos"
      }
      return true
    },
  },

  // Teléfono
  telefono: {
    required: "El número de teléfono es requerido",
    validate: (value: string) => {
      const phoneValidation = validatePhoneNumber(value)
      if (!phoneValidation.isValid) {
        return phoneValidation.message || "Formato de teléfono inválido"
      }
      return true
    },
  },

  // EPS
  codigoEPS: {
    required: "La EPS es requerida",
  },

  // AFP
  codigoAFP: {
    required: "La AFP es requerida",
  },

  // Fecha inicio cobertura
  fechaInicioCobertura: {
    required: "La fecha de inicio de cobertura es requerida",
    validate: (value: string) => {
      if (!value) return "La fecha de inicio de cobertura es requerida"
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return "Fecha inválida"
      }

      // No puede ser más de 30 días en el futuro
      const maxDate = new Date()
      maxDate.setDate(maxDate.getDate() + 30)
      if (date > maxDate) {
        return "La fecha no puede ser más de 30 días en el futuro"
      }

      return true
    },
  },

  // Ocupación
  codigoOcupacion: {
    required: "La ocupación es requerida",
  },

  // Salario
  salario: {
    required: "El salario es requerido",
    validate: (value: string) => {
      if (!value) return "El salario es requerido"

      if (!/^[0-9]+$/.test(value)) {
        return "El salario debe ser un número entero sin puntos, comas, espacios ni símbolos"
      }

      return true
    },
  },

  // Actividad económica
  codigoActividadEconomica: {
    required: "La actividad económica es requerida",
  },

  // Tipo documento empleador
  tipoDocEmp: {
    required: "El tipo de documento empleador es requerido",
  },

  // Número documento empleador
  numeDocEmp: {
    required: "El número de documento empleador es requerido",
    validate: (value: string, formValues: any) => {
      if (hasDangerousContent(value)) {
        return "El documento contiene caracteres no permitidos"
      }

      if (formValues.tipoDocEmp === "NI") {
        if (!/^\d+$/.test(value)) { 
            return "El NIT debe contener solo dígitos numéricos (sin guiones o caracteres especiales).";
        }
        const cleanNit = value.replace(/\D/g, "");

        if (!cleanNit || cleanNit.length === 0) {
            return "El NIT no puede estar vacío.";
        }
        if (cleanNit.length < 7 || cleanNit.length > 15) {
            return "El NIT debe tener entre 7 y 15 dígitos (sin dígito de verificación ni guiones).";
        }
      } else {
        if (!VALIDATION_PATTERNS.alphanumericNoSpaces.test(value)) {
          return "El número de documento del empleador debe contener solo letras y números, sin caracteres especiales ni espacios.";
        }
        if (value.length < 5 || value.length > 20) {
          return "El número de documento del empleador debe tener entre 5 y 20 caracteres.";
        }
      }
      return true
    },
  },

  // Modo de trabajo
  modoTrabajo: {
    required: "El modo de trabajo es requerido",
  },

  // Código DANE departamento residencia
  codigoDaneDepartamentoResidencia: {
    required: "El departamento de residencia es requerido",
  },

  // Código DANE municipio residencia
  codigoDaneMunicipioResidencia: {
    required: "El municipio de residencia es requerido",
  },

  // Código departamento donde labora
  codigoDepartamentoDondeLabora: {
    required: "El departamento donde labora es requerido",
  },

  // Código ciudad donde labora
  codigoCiudadDondeLabora: {
    required: "La ciudad donde labora es requerida",
  },

  // Código sub empresa (opcional)
  codigoSubEmpresa: {
    maxLength: { value: 50, message: "Máximo 50 caracteres" },
    validate: (value: string) => {
      if (!value) return true // Campo opcional
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },
}

// Función helper para sanitizar datos antes del envío
export const sanitizeFormData = (data: any) => {
  const sanitizedData = { ...data }
  for (const key in sanitizedData) {
    if (typeof sanitizedData[key] === "string") {
      sanitizedData[key] = cleanWhitespace(sanitizedData[key])
      if (key === "direccion") {
        sanitizedData[key] = validateAndCleanSpecialCharacters(
          sanitizedData[key]
        )
      }
      if (key === "numeDocEmp" && sanitizedData.tipoDocEmp === "NI") {
        sanitizedData[key] = removeNitVerificationDigit(sanitizedData[key]);
      }
    }
  }
  return sanitizedData
}
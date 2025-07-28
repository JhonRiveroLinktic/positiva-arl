import {
  hasDangerousContent,
  validateNitVerificationDigit,
  cleanWhitespace,
  VALIDATION_PATTERNS,
  removeNitVerificationDigit
} from "@/lib/utils/validations"

export function validatePersonDocumentType(documentType: string): boolean {
  const naturalPersonTypes = ["CC", "TI", "CE", "CD", "PT", "SC"]
  const nitTypes = ["NI"]

  return !nitTypes.includes(documentType)
}

export function validateEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}

export const FechaCambiosValidationRules = {
  tipoDocEmp: {
    required: "El tipo de documento empleador es requerido",
  },

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

  tipoDocPersona: {
    required: "El tipo de documento es requerido",
    validate: (value: string) => {
      if (!validatePersonDocumentType(value)) {
        return "Las personas naturales no pueden tener tipo de documento NIT"
      }
      return true
    },
  },

  numeDocPersona: {
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

  fechaInicioContrato: {
    required: "La fecha de inicio de contrato es requerida",
    validate: (value: Date) => {
      if (!value) {
        return "La fecha de inicio de contrato es requerida"
      }
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (value >= today) {
        return "La fecha de inicio de contrato debe ser anterior a hoy"
      }
      
      const minDate = new Date("1901-01-01")
      if (value < minDate) {
        return "La fecha de inicio de contrato debe ser posterior a 1901"
      }
      
      return true
    },
  },

  fechaFinContrato: {
    required: "La fecha de fin de contrato es requerida",
    validate: (value: Date) => {
      if (!value) {
        return "La fecha de fin de contrato es requerida"
      }
      
      const minDate = new Date("1901-01-01")
      if (value < minDate) {
        return "La fecha de fin de contrato debe ser posterior a 1901"
      }
      
      return true
    },
  },

  correoNotificacion: {
    required: "El correo de notificación es requerido",
    validate: (value: string) => {
      if (!validateEmail(value)) {
        return "El formato del correo electrónico no es válido"
      }
      if (hasDangerousContent(value)) {
        return "El correo contiene caracteres no permitidos"
      }
      return true
    },
  },
}

export const sanitizeFormData = (data: any) => {
  const sanitizedData = { ...data }
  for (const key in sanitizedData) {
    if (typeof sanitizedData[key] === "string") {
      sanitizedData[key] = cleanWhitespace(sanitizedData[key])
      if (key === "numeDocEmp" && sanitizedData.tipoDocEmp === "NI") {
        sanitizedData[key] = removeNitVerificationDigit(sanitizedData[key]);
      }
    }
  }
  return sanitizedData
} 
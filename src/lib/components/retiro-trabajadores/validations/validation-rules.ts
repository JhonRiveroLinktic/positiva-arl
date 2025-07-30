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

export const RetiroTrabajadoresValidationRules = {
  tipoDocEmpleador: {
    required: "El tipo de documento empleador es requerido",
  },

  documentoEmpleador: {
    required: "El número de documento empleador es requerido",
    validate: (value: string, formValues: any) => {
      if (hasDangerousContent(value)) {
        return "El documento contiene caracteres no permitidos"
      }

      if (formValues.tipoDocEmpleador === "NI") {
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
        if (value.length < 5 || value.length > 50) {
          return "El número de documento del empleador debe tener entre 5 y 50 caracteres.";
        }
      }
      return true
    },
  },

  nombreRazonSocialContratante: {
    required: "El nombre o razón social es requerido",
    minLength: { value: 3, message: "Debe tener al menos 3 caracteres" },
    maxLength: { value: 200, message: "Máximo 200 caracteres" },
    pattern: {
      value: /^[A-ZÁÉÍÓÚÜÑ0-9\s\-.,()]+$/i,
      message: "Solo se permiten letras, números y algunos símbolos como - , . ( )"
    },
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El nombre contiene caracteres no permitidos"
      }
      return true
    }
  },

  tipoDocTrabajador: {
    required: "El tipo de documento es requerido",
    validate: (value: string) => {
      if (!validatePersonDocumentType(value)) {
        return "Las personas naturales no pueden tener tipo de documento NIT"
      }
      return true
    },
  },

  documentoTrabajador: {
    required: "El número de documento trabajador es requerido",
    validate: (value: string, formValues: any) => {
      if (hasDangerousContent(value)) {
        return "El documento contiene caracteres no permitidos"
      }

      if (formValues.tipoDocTrabajador === "NI") {
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
          return "El número de documento del trabajador debe contener solo letras y números, sin caracteres especiales ni espacios.";
        }
        if (value.length < 5 || value.length > 50) {
          return "El número de documento del trabajador debe tener entre 5 y 50 caracteres.";
        }
      }
      return true
    },
  },

  tipoVinculacion: {
    required: "El tipo de vinculación es requerido",
  },

  fechaRetiroTrabajador: {
    required: "La fecha de retiro del trabajador es requerida",
    validate: (value: string) => {
      if (!value) return "La fecha de inicio de cobertura es requerida"
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return "Fecha inválida"
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
      if (key === "documentoEmpleador" && sanitizedData.tipoDocEmpleador === "NI") {
        sanitizedData[key] = removeNitVerificationDigit(sanitizedData[key]);
      }
    }
  }
  return sanitizedData
} 
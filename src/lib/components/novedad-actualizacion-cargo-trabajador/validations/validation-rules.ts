import {
    hasDangerousContent,
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

export const novedadActualizacionCargoTrabajadorValidationRules = {
    tipo_doc_empleador: {
        required: "El tipo de documento del empleador es requerido",
    },
    
    documento_empleador: {
        required: "El número de documento del empleador es requerido",
        validate: (value: string, formValues: any) => {
          if (hasDangerousContent(value)) {
            return "El documento contiene caracteres no permitidos"
          }
    
          if (formValues.tipo_doc_empleador === "NI") {
            const nitValidation = validateNitVerificationDigit(value)
            if (!nitValidation.isValid) {
              return nitValidation.errorMessage || "Formato de NIT inválido"
            }
          } else {
            if (!VALIDATION_PATTERNS.alphanumericNoSpaces.test(value)) {
              return "Solo se permiten letras y números, sin espacios ni caracteres especiales"
            }
            if (value.length < 5 || value.length > 20) {
              return "Debe tener entre 5 y 20 caracteres"
            }
          }
    
          return true
        }
    },
    
    razon_social: {
        required: "La razón social es requerida",
        minLength: { value: 3, message: "Debe tener al menos 3 caracteres" },
        maxLength: { value: 200, message: "Máximo 200 caracteres" },
        pattern: {
          value: /^[A-ZÁÉÍÓÚÜÑ0-9\s\-.,()]+$/i,
          message: "Solo se permiten letras, números y algunos símbolos como - , . ( )"
        },
        validate: (value: string) => {
          if (hasDangerousContent(value)) {
            return "La razón social contiene caracteres no permitidos"
          }
          return true
        }
    },
    
    codigo_subempresa: {
        required: "El código de subempresa es requerido",
    },
    
    tipo_doc_trabajador: {
        required: "El tipo de documento del trabajador es requerido",
    },
    
    documento_trabajador: {
        required: "El número de documento del trabajador es requerido",
        validate: (value: string, formValues: any) => {
          if (hasDangerousContent(value)) {
            return "El documento contiene caracteres no permitidos"
          }
    
          if (formValues.tipo_doc_trabajador === "NI") {
            const nitValidation = validateNitVerificationDigit(value)
            if (!nitValidation.isValid) {
              return nitValidation.errorMessage || "Formato de NIT inválido"
            }
          } else {
            if (!VALIDATION_PATTERNS.alphanumericNoSpaces.test(value)) {
              return "Solo se permiten letras y números, sin espacios ni símbolos"
            }
            if (value.length < 5 || value.length > 20) {
              return "Debe tener entre 5 y 20 caracteres"
            }
          }
    
          return true
        }
    },
    
    tipo_vinculacion: {
        required: "El tipo de vinculación es requerido",
        validate: (value: string) => {
          if (value !== 'I' && value !== 'D') {
            return "Debe seleccionar un tipo de vinculación válido"
          }
          return true
        }
    },
    
    cargo_nuevo: {
        required: "El nuevo cargo es requerido",
        minLength: { value: 2, message: "Debe tener al menos 2 caracteres" },
        maxLength: { value: 10, message: "Máximo 10 caracteres" },
        pattern: {
          value: /^[A-Z0-9]+$/i,
          message: "Solo se permiten letras y números"
        },
        validate: (value: string) => {
          if (hasDangerousContent(value)) {
            return "El cargo contiene caracteres no permitidos"
          }
          return true
        }
    },
}

export const sanitizeFormData = (data: any) => {
    const sanitized: any = {}
    
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === "string") {
            sanitized[key] = cleanWhitespace(value)
        } else {
            sanitized[key] = value
        }
    }
    
    return sanitized
} 
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
  
export const cambioActividadEconomicaIndependienteConContratoValidationRules = {
    tipo_doc_contratante: {
        required: "El tipo de documento del contratante es requerido",
    },
    
    nume_doc_contratante: {
        required: "El número de documento del contratante es requerido",
        validate: (value: string, formValues: any) => {
          if (hasDangerousContent(value)) {
            return "El documento contiene caracteres no permitidos"
          }
    
          if (formValues.tipo_doc_contratante === "NI") {
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
    
    tipo_doc_trabajador: {
        required: "El tipo de documento del trabajador es requerido",
    },
    
    nume_doc_trabajador: {
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
    
    nueva_actividad_economica: {
        required: "La actividad económica es obligatoria",
        maxLength: { value: 200, message: "Máximo 200 caracteres" },
        pattern: {
          value: /^[A-ZÁÉÍÓÚÜÑ0-9\s\-.,]+$/i,
          message: "Solo se permiten letras, números y símbolos como - , ."
        },
        validate: (value: string) => {
          if (!value) return true
          if (hasDangerousContent(value)) {
            return "El campo contiene caracteres no permitidos"
          }
          return true
        }
    },
  }
  
  export const sanitizeFormData = (data: any) => {
    const sanitized: any = {}
  
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        let cleanedString = cleanWhitespace(value)
        
        if (key === "direccionResidencia") {
          cleanedString = validateAndCleanSpecialCharacters(cleanedString)
        }
  
        if (key === "numeDocTrabajador" && data.tipoDocTrabajador === "NI") {
          cleanedString = removeNitVerificationDigit(cleanedString)
        }
        if (key === "numeDocContratante" && data.tipoDocContratante === "NI") {
          cleanedString = removeNitVerificationDigit(cleanedString)
        }
        
        sanitized[key] = cleanedString
      } else if (typeof value === "number") {
        sanitized[key] = value
      } else {
        sanitized[key] = value
      }
    }
  
    return sanitized
}
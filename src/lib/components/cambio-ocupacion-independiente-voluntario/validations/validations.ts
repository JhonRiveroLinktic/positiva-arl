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
  
export const cambioOcupacionIndependienteVoluntarioValidationRules = {
  tipo_novedad: {
      required: "El tipo de novedad es requerido",
  },

  tipo_doc_trabajador: {
      required: "El tipo de documento del trabajador es requerido",
  },

  documento_trabajador: {
      required: "El número de documento del trabajador es requerido",
      validate: (value: string) => {
          if (hasDangerousContent(value)) {
              return "El documento contiene caracteres no permitidos";
          }
          if (!VALIDATION_PATTERNS.alphanumericNoSpaces.test(value)) {
              return "Solo se permiten letras y números, sin espacios ni símbolos";
          }
          if (value.length < 5 || value.length > 20) {
              return "Debe tener entre 5 y 20 caracteres";
          }
          return true;
      },
  },

  nueva_ocupacion: {
      required: "La ocupación es obligatoria",
      minLength: { value: 1, message: "Debe seleccionar una ocupación" },
      validate: (value: string) => {
          if (hasDangerousContent(value)) {
              return "El campo contiene caracteres no permitidos";
          }
          return true;
      },
  },

  correo_electronico_notificacion: {
      required: "El correo de notificación es requerido",
      pattern: {
          value: VALIDATION_PATTERNS.email,
          message: "Debe ingresar un correo electrónico válido",
      },
      validate: (value: string) => {
          if (hasDangerousContent(value)) {
              return "El correo contiene caracteres no permitidos";
          }
          return true;
      },
  },
};
  
export const sanitizeCambioOcupacionFormData = (data: any) => {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
          const cleanedString = cleanWhitespace(value);
          sanitized[key] = cleanedString;
      } else if (typeof value === "number") {
          sanitized[key] = value;
      } else {
          sanitized[key] = value;
      }
  }
  return sanitized;
};
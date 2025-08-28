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

export function convertSalaryToNumber(value: string | number): number {
  // Si ya es un número, devolverlo directamente
  if (typeof value === 'number') {
    return value
  }
  
  // Si es string, procesarlo
  if (typeof value === 'string') {
    const cleanSalary = value.replace(/[^\d.]/g, "")
    const numericSalary = parseFloat(cleanSalary)
    
    if (isNaN(numericSalary)) {
      throw new Error("El valor debe ser un número válido")
    }
    
    return numericSalary
  }
  
  throw new Error("El valor debe ser un string o número válido")
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

export const IndependienteConContratoValidationRules = {
  tipoDocTrabajador: {
    required: "El tipo de documento del independiente es requerido",
  },

  numeDocTrabajador: {
    required: "El número de documento del independiente es requerido",
    validate: (value: string, formValues: any) => {
      if (hasDangerousContent(value)) {
        return "El documento contiene caracteres no permitidos"
      }

      if (formValues.tipoDocTrabajador === "NI") {
        const nitValidation = validateNitVerificationDigit(value)
        if (!nitValidation.isValid) {
          return nitValidation.errorMessage || "Formato de NIT inválido"
        }
      } else {
        if (!VALIDATION_PATTERNS.alphanumericNoSpaces.test(value)) {
          return "El número de documento debe contener solo letras y números."
        }
        if (value.length < 5 || value.length > 20) {
          return "El número de documento debe tener entre 5 y 20 caracteres."
        }
      }
      return true
    },
  },

  apellido1Trabajador: {
    required: "El primer apellido es requerido",
    minLength: { value: 2, message: "Mínimo 2 caracteres" },
    maxLength: { value: 100, message: "Máximo 100 caracteres" },
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

  apellido2Trabajador: {
    maxLength: { value: 100, message: "Máximo 100 caracteres" },
    pattern: {
      value: VALIDATION_PATTERNS.name,
      message: "Solo se permiten letras y espacios",
    },
    validate: (value: string) => {
      if (!value) return true
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  nombre1Trabajador: {
    required: "El primer nombre es requerido",
    minLength: { value: 2, message: "Mínimo 2 caracteres" },
    maxLength: { value: 100, message: "Máximo 100 caracteres" },
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

  nombre2Trabajador: {
    maxLength: { value: 100, message: "Máximo 100 caracteres" },
    pattern: {
      value: VALIDATION_PATTERNS.name,
      message: "Solo se permiten letras y espacios",
    },
    validate: (value: string) => {
      if (!value) return true
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  fechaNacimientoTrabajador: {
    required: "La fecha de nacimiento del independiente es requerida",
    validate: (value: string) => {
      if (!value) return "La fecha de nacimiento del independiente es requerida";

      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const minAgeDate = new Date();
      minAgeDate.setFullYear(today.getFullYear() - 14);
      minAgeDate.setHours(0, 0, 0, 0);

      if (date > today) {
        return "La fecha de nacimiento no puede ser futura";
      }
      if (date < MIN_DATE_AFILIATION) {
        return `La fecha de nacimiento no puede ser anterior a ${MIN_DATE_AFILIATION.getFullYear()}`;
      }
      if (date > minAgeDate) {
        return "La edad mínima es 14 años";
      }
      return true;
    },
  },


  sexoTrabajador: {
    required: "El sexo del independiente es requerido",
  },

  emailTrabajador: {
    required: "El correo electrónico del independiente es requerido",
    pattern: {
      value: VALIDATION_PATTERNS.email,
      message: "Ingrese un correo electrónico válido",
    },
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El correo contiene caracteres no permitidos"
      }
      return true
    },
  },

  codigoDaneDptoResidencia: {
    required: "El código DANE del departamento es requerido",
  },

  codigoDaneMuniResidencia: {
    required: "El código DANE del municipio es requerido",
  },

  direccionResidencia: {
    required: "La dirección es requerida",
    pattern: {
      value: /^[A-ZÁÉÍÓÚÜÑ0-9\s#\-.,/]+$/i,
      message:
        "La dirección contiene caracteres inválidos. Solo se permiten letras, números y símbolos como # - , . /"
    },
    minLength: { value: 5, message: "Mínimo 5 caracteres" },
    maxLength: { value: 200, message: "Máximo 200 caracteres" },
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "La dirección contiene caracteres no permitidos"
      }
      return true
    },
  },

  telefonoTrabajador: {
    required: "El teléfono del independiente es requerido",
    validate: (value: string) => {
      if (!value) return true
      const phoneValidation = validatePhoneNumber(value)
      if (!phoneValidation.isValid) {
        return phoneValidation.message || "Ingrese un número de teléfono válido"
      }
      if (hasDangerousContent(value)) {
        return "El teléfono del independiente contiene caracteres no permitidos"
      }
      return true
    },
  },

  cargoOcupacion: {
    required: "El cargo/ocupación es requerido",
  },

  codigoEPS: {
    required: "El código EPS del independiente es requerido",
  },

  codigoAFP: {
    required: "El código AFP es requerido",
  },

  tipoContrato: {
    required: "El tipo de contrato es requerido",
  },

  naturalezaContrato: {
    required: "La naturaleza del contrato es requerida",
  },

  suministraTransporte: {
    required: "Debe especificar si suministra transporte",
  },

  fechaInicioContrato: {
    required: "La fecha de inicio del contrato es requerida",
    validate: (value: string) => {
      if (!value) return "La fecha de inicio del contrato es requerida";

      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }

      if (date < MIN_DATE_AFILIATION) {
        return `La fecha de inicio no puede ser anterior a ${MIN_DATE_AFILIATION.getFullYear()}`;
      }
      return true;
    },
  },

  fechaFinContrato: {
    required: "La fecha de terminación del contrato es requerida",
    validate: (value: string, formValues: any) => {
      if (!value) return "La fecha de terminación del contrato es requerida";

      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }

      if (date < MIN_DATE_AFILIATION) {
        return `La fecha de terminación no puede ser anterior a ${MIN_DATE_AFILIATION.getFullYear()}`;
      }

      if (formValues.fechaInicioContrato) {
        const startDate = new Date(formValues.fechaInicioContrato);
        if (isNaN(startDate.getTime())) {
          return "La fecha de inicio del contrato no es válida para la comparación.";
        }
        if (date <= startDate) {
          return "La fecha de terminación debe ser posterior a la fecha de inicio del contrato";
        }
      }
      return true;
    },
  },

  valorTotalContrato: {
    required: "El valor total del contrato es requerido",
    validate: (value: string) => {
      if (!value) return "El valor total del contrato es requerido"

      if (!/^[0-9]+$/.test(value)) {
        return "El valor total del contrato debe ser un número entero sin puntos, comas, espacios ni símbolos"
      }

      const numericValue = parseInt(value)
      if (numericValue < MINIMUM_WAGE) {
        return `El valor total del contrato debe ser al menos ${MINIMUM_WAGE.toLocaleString()}`
      }

      return true
    },
  },

  codigoActividadEjecutar: {
    required: "El código de actividad es requerido",
  },

  departamentoLabor: {
    required: "El código del departamento donde labora es requerido",
  },

  ciudadLabor: {
    required: "El código de la ciudad donde labora es requerido",
  },

  fechaInicioCobertura: {
    required: "La fecha de inicio de cobertura es requerida",
    validate: (value: string) => {
              if (!value) return "La fecha de inicio de cobertura es requerida";

      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }

      if (date < MIN_DATE_AFILIATION) {
        return `La fecha de cobertura no puede ser anterior a ${MIN_DATE_AFILIATION.getFullYear()}`;
      }
      if (date > getMaxDateCoverage()) {
        return "La fecha de cobertura no puede ser más de 30 días en el futuro";
      }
      return true;
    },
  },

  esAfiliacionTaxista: {
    required: "Debe especificar si es afiliación de taxista",
  },

  tipoDocContratante: {
    required: "El tipo de documento del contratante es requerido",
  },

  numeDocContratante: {
    required: "El número de documento del contratante es requerido",
    validate: (value: string, formValues: any) => {
      if (hasDangerousContent(value)) {
        return "El documento contiene caracteres no permitidos"
      }

      if (formValues.tipoDocContratante === "N") {
        const nitValidation = validateNitVerificationDigit(value)
        if (!nitValidation.isValid) {
          return nitValidation.errorMessage || "Formato de NIT inválido"
        }
      } else {
        if (!VALIDATION_PATTERNS.alphanumericNoSpaces.test(value)) {
          return "El número de documento del contratante debe contener solo letras y números, sin caracteres especiales ni espacios.";
        }
        if (value.length < 5 || value.length > 20) {
          return "El número de documento del contratante debe tener entre 5 y 20 caracteres.";
        }
      }
      return true
    },
  },

  actividadCentroTrabajoContratante: {
    required: "La actividad del centro de trabajo es requerida",
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
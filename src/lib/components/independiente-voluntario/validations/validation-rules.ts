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

export const IndependienteVoluntarioValidationRules = {
  // DATOS DEL TRABAJADOR
  tipoDocTrabajador: {
    required: "El tipo de documento del trabajador es requerido",
  },

  numeDocTrabajador: {
    required: "El número de documento es requerido",
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
    required: "La fecha de nacimiento es requerida",
    validate: (value: string) => {
      if (!value) return "La fecha de nacimiento es requerida";

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
    required: "El sexo del trabajador es requerido",
  },

  emailTrabajador: {
    required: "El correo electrónico es requerido",
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
    validate: (value: string) => {
      if (!value) return true
      const phoneValidation = validatePhoneNumber(value)
      if (!phoneValidation.isValid) {
        return phoneValidation.message || "Ingrese un número de teléfono válido"
      }
      if (hasDangerousContent(value)) {
        return "El teléfono contiene caracteres no permitidos"
      }
      return true
    },
  },

  // DATOS LABORALES
  codigoEPS: {
    required: "El código EPS es requerido",
  },

  codigoAFP: {
    required: "El código AFP es requerido",
  },

  ingresoBaseCotizacion: {
    required: "El ingreso base de cotización es requerido",
    validate: (value: string) => {
      if (!value) return "El ingreso base de cotización es requerido"

      if (!/^[0-9]+$/.test(value)) {
        return "El ingreso debe ser un número entero sin puntos, comas, espacios ni símbolos"
      }

      const numValue = parseInt(value, 10)
      if (numValue < MINIMUM_WAGE) {
        return `El ingreso base de cotización no puede ser menor al salario mínimo ($${MINIMUM_WAGE.toLocaleString()})`
      }

      return true
    },
  },

  codigoOcupacion: {
    required: "El código de ocupación es requerido",
  },

  codigoDaneDptoSitioTrabajo: {
    required: "El código DANE del departamento donde trabaja es requerido",
  },

  codigoDaneMuniSitioTrabajo: {
    required: "El código DANE del municipio donde trabaja es requerido",
  },

  fechaCobertura: {
    required: "La fecha de cobertura es requerida",
    validate: (value: string) => {
      if (!value) return "La fecha de cobertura es requerida";

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

  // DATOS DEL CÓNYUGE/RESPONSABLE (OPCIONALES)
  tipoDocConyugeResponsable: {
    validate: (value: string, formValues: any) => {
      // Si se proporciona algún dato del cónyuge, el tipo de documento se vuelve requerido
      const hasConyugeData = formValues.numeDocConyugeResponsable || 
                           formValues.nombre1ConyugeResponsable || 
                           formValues.apellido1ConyugeResponsable

      if (hasConyugeData && !value) {
        return "El tipo de documento del cónyuge/responsable es requerido cuando se proporcionan otros datos"
      }
      return true
    },
  },

  numeDocConyugeResponsable: {
    validate: (value: string, formValues: any) => {
      // Si no hay valor, no validar
      if (!value) return true

      if (hasDangerousContent(value)) {
        return "El documento contiene caracteres no permitidos"
      }

      if (formValues.tipoDocConyugeResponsable === "NI") {
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

  nombre1ConyugeResponsable: {
    validate: (value: string, formValues: any) => {
      // Si no hay valor, no validar
      if (!value) return true

      if (value.length < 2) {
        return "Mínimo 2 caracteres"
      }
      if (value.length > 100) {
        return "Máximo 100 caracteres"
      }
      if (!VALIDATION_PATTERNS.name.test(value)) {
        return "Solo se permiten letras y espacios"
      }
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  nombre2ConyugeResponsable: {
    validate: (value: string) => {
      if (!value) return true
      
      if (value.length > 100) {
        return "Máximo 100 caracteres"
      }
      if (!VALIDATION_PATTERNS.name.test(value)) {
        return "Solo se permiten letras y espacios"
      }
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  apellido1ConyugeResponsable: {
    validate: (value: string, formValues: any) => {
      // Si se proporciona nombre, apellido se vuelve requerido
      const hasNombre = formValues.nombre1ConyugeResponsable

      if (hasNombre && !value) {
        return "El primer apellido es requerido cuando se proporciona el nombre"
      }

      if (!value) return true

      if (value.length < 2) {
        return "Mínimo 2 caracteres"
      }
      if (value.length > 100) {
        return "Máximo 100 caracteres"
      }
      if (!VALIDATION_PATTERNS.name.test(value)) {
        return "Solo se permiten letras y espacios"
      }
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  apellido2ConyugeResponsable: {
    validate: (value: string) => {
      if (!value) return true
      
      if (value.length > 100) {
        return "Máximo 100 caracteres"
      }
      if (!VALIDATION_PATTERNS.name.test(value)) {
        return "Solo se permiten letras y espacios"
      }
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  dptoResidenciaConyugeResponsable: {
    validate: (value: string, formValues: any) => {
      // Si se proporciona municipio, departamento se vuelve requerido
      if (formValues.muniResidenciaConyugeResponsable && !value) {
        return "El departamento es requerido cuando se proporciona el municipio"
      }
      return true
    },
  },

  muniResidenciaConyugeResponsable: {
    validate: (value: string, formValues: any) => {
      // Si se proporciona dirección, municipio se vuelve requerido
      if (formValues.direccionResidenciaConyugeResponsable && !value) {
        return "El municipio es requerido cuando se proporciona la dirección"
      }
      return true
    },
  },

  direccionResidenciaConyugeResponsable: {
    validate: (value: string) => {
      if (!value) return true

      if (value.length < 5) {
        return "Mínimo 5 caracteres"
      }
      if (value.length > 200) {
        return "Máximo 200 caracteres"
      }
      if (!/^[A-ZÁÉÍÓÚÜÑ0-9\s#\-.,/]+$/i.test(value)) {
        return "La dirección contiene caracteres inválidos. Solo se permiten letras, números y símbolos como # - , . /"
      }
      if (hasDangerousContent(value)) {
        return "La dirección contiene caracteres no permitidos"
      }
      return true
    },
  },

  telefonoConyugeResponsable: {
    validate: (value: string) => {
      if (!value) return true
      
      const phoneValidation = validatePhoneNumber(value)
      if (!phoneValidation.isValid) {
        return phoneValidation.message || "Ingrese un número de teléfono válido"
      }
      if (hasDangerousContent(value)) {
        return "El teléfono contiene caracteres no permitidos"
      }
      return true
    },
  },
}

export const sanitizeFormData = (data: any) => {
  const sanitized: any = {}

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      let cleanedString = cleanWhitespace(value)
      
      if (key === "direccionResidencia" || key === "direccionResidenciaConyugeResponsable") {
        cleanedString = validateAndCleanSpecialCharacters(cleanedString)
      }

      if (key === "numeDocTrabajador" && data.tipoDocTrabajador === "NI") {
        cleanedString = removeNitVerificationDigit(cleanedString)
      }
      if (key === "numeDocConyugeResponsable" && data.tipoDocConyugeResponsable === "NI") {
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
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

export function validateLegalDocumentType(documentType: string): boolean {
  const legalEntityTypes = ["N", "NI"]
  return legalEntityTypes.includes(documentType)
}

export function validateNaturalPersonDocumentType(documentType: string): boolean {
  const naturalPersonTypes = ["C", "D", "E", "R", "T", "U", "L", "CC", "CD", "CE", "PT", "SC", "RC"]
  return naturalPersonTypes.includes(documentType)
}

export function validateGender(gender: string): boolean {
  const validGenders = ["M", "F", "T", "N", "O"]
  return validGenders.includes(gender)
}

export function validateZone(zone: string): boolean {
  const validZones = ["U", "R"]
  return validZones.includes(zone)
}

export function validateNature(nature: string): boolean {
  const validNatures = ["1", "2", "3"]
  return validNatures.includes(nature)
}

export function validateOrigin(origin: string): boolean {
  const validOrigins = ["1", "2"]
  return validOrigins.includes(origin)
}

export function validateSuministroTransporte(value: string): boolean {
  const validValues = ["S", "N"]
  return validValues.includes(value)
}

// Validaciones para EmpleadorDatos
export const EmpleadorDatosValidationRules = {
  tipoDocEmpleador: {
    required: "El tipo de documento del empleador es requerido",
    validate: (value: string) => {
      if (!validateLegalDocumentType(value)) {
        return "El tipo de documento debe ser válido para personas jurídicas"
      }
      return true
    },
  },

  documentoEmpleador: {
    required: "El número de documento del empleador es requerido",
    validate: (value: string, formValues: any) => {
      if (hasDangerousContent(value)) {
        return "El documento contiene caracteres no permitidos"
      }

      if (["N", "NI"].includes(formValues.tipoDocEmpleador)) {
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

  digitoVerificacionEmpleador: {
    validate: (value: string | undefined) => {
      if (!value) return true
      if (!/^[0-9]$/.test(value)) {
        return "El dígito de verificación debe ser un número del 0 al 9"
      }
      return true
    },
  },

  razonSocialEmpleador: {
    required: "La razón social del empleador es requerida",
    minLength: { value: 2, message: "Mínimo 2 caracteres" },
    maxLength: { value: 200, message: "Máximo 200 caracteres" },
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  departamentoEmpleador: {
    required: "El departamento del empleador es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  municipioEmpleador: {
    required: "El municipio del empleador es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  direccionEmpleador: {
    required: "La dirección del empleador es requerida",
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

  zona: {
    validate: (value: string) => {
      if (!value) return true
      if (!validateZone(value)) {
        return "La zona debe ser U (urbano) o R (rural)"
      }
      return true
    },
  },

  actEconomicaPrincipalEmpleador: {
    required: "La actividad económica principal es requerida",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  telefonoEmpleador: {
    required: "El teléfono del empleador es requerido	",
    validate: (value: string | undefined) => {
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

  fax: {
    validate: (value: string | undefined) => {
      if (!value) return true
      const phoneValidation = validatePhoneNumber(value)
      if (!phoneValidation.isValid) {
        return phoneValidation.message || "Ingrese un número de fax válido"
      }
      if (hasDangerousContent(value)) {
        return "El fax contiene caracteres no permitidos"
      }
      return true
    },
  },

  correoElectronico: {
    required: "El correo electrónico del empleador es requerido",
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

  suministroDeTransporte: {
    required: "El suministro de transporte es requerido",
    validate: (value: string | undefined) => {
      if (!value) return true
      if (!validateSuministroTransporte(value)) {
        return "El valor debe ser Sí o No"
      }
      return true
    },
  },

  naturaleza: {
    required: "La naturaleza es requerida",
    validate: (value: string | undefined) => {
      if (!value) return true
      if (!validateNature(value)) {
        return "La naturaleza debe ser 1, 2 o 3"
      }
      return true
    },
  },

  fechaRadicacion: {
    required: "La fecha de radicación es requerida",
    validate: (value: string) => {
      if (!value) return "La fecha de radicación es requerida";

      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date > today) {
        return "La fecha de radicación no puede ser futura";
      }
      if (date < MIN_DATE_AFILIATION) {
        return `La fecha de radicación no puede ser anterior a ${MIN_DATE_AFILIATION.getFullYear()}`;
      }
      return true;
    },
  },

  origen: {
    required: "El origen es requerido",
    validate: (value: string | undefined) => {
      if (!value) return true
      if (!validateOrigin(value)) {
        return "El origen debe ser 1 o 2"
      }
      return true
    },
  },

  fechaCobertura: {
    required: "La fecha de cobertura es requerida",
    validate: (value: string | undefined) => {
      if (!value) return true

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

  codigoArl: {
    validate: (value: string | undefined) => {
      if (!value) return true
      if (hasDangerousContent(value)) {
        return "El código ARL contiene caracteres no permitidos"
      }
      return true
    },
  },

  // tipoDocArlAnterior: {
  //   validate: (value: string | undefined) => {
  //     if (!value) return true
  //     if (!validateLegalDocumentType(value)) {
  //       return "El tipo de documento debe ser válido para personas jurídicas"
  //     }
  //     return true
  //   },
  // },

  nitArlAnterior: {
    validate: (value: string | undefined, formValues: any) => {
      if (!value) return true
      
      if (hasDangerousContent(value)) {
        return "El NIT contiene caracteres no permitidos"
      }

      if (formValues.tipoDocArlAnterior && ["N", "NI"].includes(formValues.tipoDocArlAnterior)) {
        const nitValidation = validateNitVerificationDigit(value)
        if (!nitValidation.isValid) {
          return nitValidation.errorMessage || "Formato de NIT inválido"
        }
      }
      return true
    },
  },

  fechaNotificacionTraslado: {
    validate: (value: string | undefined) => {
      if (!value) return true

      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date > today) {
        return "La fecha de notificación no puede ser futura";
      }
      if (date < MIN_DATE_AFILIATION) {
        return `La fecha de notificación no puede ser anterior a ${MIN_DATE_AFILIATION.getFullYear()}`;
      }
      return true;
    },
  },

  tipoDocRepresentanteLegal: {
    required: "El tipo de documento del representante legal es requerido",
    validate: (value: string) => {
      if (!validateNaturalPersonDocumentType(value)) {
        return "El tipo de documento debe ser válido para personas naturales"
      }
      return true
    },
  },

  numeDocRepresentanteLegal: {
    required: "El número de documento del representante legal es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El documento contiene caracteres no permitidos"
      }

      if (!VALIDATION_PATTERNS.alphanumericNoSpaces.test(value)) {
        return "El número de documento debe contener solo letras y números."
      }
      if (value.length < 5 || value.length > 20) {
        return "El número de documento debe tener entre 5 y 20 caracteres."
      }
      return true
    },
  },

  nombreRepresentanteLegal: {
    required: "El nombre del representante legal es requerido",
    minLength: { value: 2, message: "Mínimo 2 caracteres" },
    maxLength: { value: 200, message: "Máximo 200 caracteres" },
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },
}

// Validaciones para RepresentanteLegal
export const RepresentanteLegalValidationRules = {
  tipoDoc: {
    required: "El tipo de documento del representante legal es requerido",
    validate: (value: string) => {
      if (!validateNaturalPersonDocumentType(value)) {
        return "El tipo de documento debe ser válido para personas naturales"
      }
      return true
    },
  },

  documento: {
    required: "El número de documento del representante legal es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El documento contiene caracteres no permitidos"
      }

      if (!VALIDATION_PATTERNS.alphanumericNoSpaces.test(value)) {
        return "El número de documento debe contener solo letras y números."
      }
      if (value.length < 5 || value.length > 20) {
        return "El número de documento debe tener entre 5 y 20 caracteres."
      }
      return true
    },
  },

  primerApellido: {
    required: "El primer apellido del representante legal es requerido",
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

  segundoApellido: {
    maxLength: { value: 100, message: "Máximo 100 caracteres" },
    pattern: {
      value: VALIDATION_PATTERNS.name,
      message: "Solo se permiten letras y espacios",
    },
    validate: (value: string | undefined) => {
      if (!value) return true
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  primerNombre: {
    required: "El primer nombre del representante legal es requerido",
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

  segundoNombre: {
    maxLength: { value: 100, message: "Máximo 100 caracteres" },
    pattern: {
      value: VALIDATION_PATTERNS.name,
      message: "Solo se permiten letras y espacios",
    },
    validate: (value: string | undefined) => {
      if (!value) return true
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  fechaNacimiento: {
    required: "La fecha de nacimiento del representante legal es requerida",
    validate: (value: string) => {
      if (!value) return "La fecha de nacimiento es requerida";

      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const minAgeDate = new Date();
      minAgeDate.setFullYear(today.getFullYear() - 18);
      minAgeDate.setHours(0, 0, 0, 0);

      if (date > today) {
        return "La fecha de nacimiento no puede ser futura";
      }
      if (date < MIN_DATE_AFILIATION) {
        return `La fecha de nacimiento no puede ser anterior a ${MIN_DATE_AFILIATION.getFullYear()}`;
      }
      if (date > minAgeDate) {
        return "La edad mínima para representante legal es 18 años";
      }
      return true;
    },
  },

  sexo: {
    required: "El sexo del representante legal es requerido",
    validate: (value: string) => {
      if (!validateGender(value)) {
        return "El sexo debe ser M, F, T, N u O"
      }
      return true
    },
  },

  pais: {
    validate: (value: string | undefined) => {
      if (!value) return true
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  departamento: {
    required: "El departamento del representante legal es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  municipio: {
    required: "El municipio del representante legal es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  zona: {
    required: "La zona es requerida",
    validate: (value: string | undefined) => {
      if (!value) return true
      if (!validateZone(value)) {
        return "La zona debe ser urbana o rural"
      }
      return true
    },
  },

  fax: {
    validate: (value: string | undefined) => {
      if (!value) return true
      const phoneValidation = validatePhoneNumber(value)
      if (!phoneValidation.isValid) {
        return phoneValidation.message || "Ingrese un número de fax válido"
      }
      if (hasDangerousContent(value)) {
        return "El fax contiene caracteres no permitidos"
      }
      return true
    },
  },

  telefono: {
    validate: (value: string | undefined) => {
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

  direccion: {
    required: "La dirección del representante legal es requerida",
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

  correoElectronico: {
    required: "El correo electrónico del representante legal es requerido",
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

  nitAfp: {
    validate: (value: string | undefined) => {
      if (!value) return true
      
      if (hasDangerousContent(value)) {
        return "El NIT AFP contiene caracteres no permitidos"
      }

      const nitValidation = validateNitVerificationDigit(value)
      if (!nitValidation.isValid) {
        return nitValidation.errorMessage || "Formato de NIT AFP inválido"
      }
      return true
    },
  },

  nitEps: {
    validate: (value: string | undefined) => {
      if (!value) return true
      
      if (hasDangerousContent(value)) {
        return "El NIT EPS contiene caracteres no permitidos"
      }

      const nitValidation = validateNitVerificationDigit(value)
      if (!nitValidation.isValid) {
        return nitValidation.errorMessage || "Formato de NIT EPS inválido"
      }
      return true
    },
  },
}

// Validaciones para Sede
export const SedeValidationRules = {
  tipoDocEmpleador: {
    required: "El tipo de documento del empleador es requerido",
    validate: (value: string) => {
      if (!validateLegalDocumentType(value)) {
        return "El tipo de documento debe ser válido para personas jurídicas"
      }
      return true
    },
  },

  documentoEmpleador: {
    required: "El número de documento del empleador es requerido",
    validate: (value: string, formValues: any) => {
      if (hasDangerousContent(value)) {
        return "El documento contiene caracteres no permitidos"
      }

      if (["N", "NI"].includes(formValues.tipoDocEmpleador)) {
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

  subempresa: {
    validate: (value: string | undefined) => {
      if (!value) return true
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  departamento: {
    required: "El departamento de la sede es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  municipio: {
    required: "El municipio de la sede es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  actividadEconomica: {
    required: "La actividad económica de la sede es requerida",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  fechaRadicacion: {
    required: "La fecha de radicación de la sede es requerida",
    validate: (value: string) => {
      if (!value) return "La fecha de radicación es requerida";

      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date > today) {
        return "La fecha de radicación no puede ser futura";
      }
      if (date < MIN_DATE_AFILIATION) {
        return `La fecha de radicación no puede ser anterior a ${MIN_DATE_AFILIATION.getFullYear()}`;
      }
      return true;
    },
  },

  nombreSede: {
    required: "El nombre de la sede es requerido",
    minLength: { value: 2, message: "Mínimo 2 caracteres" },
    maxLength: { value: 200, message: "Máximo 200 caracteres" },
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  direccion: {
    required: "La dirección de la sede es requerida",
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

  zona: {
    required: "La zona de la sede es requerida",
    validate: (value: string) => {
      if (!value) return true
      if (!validateZone(value)) {
        return "La zona debe ser U (urbano) o R (rural)"
      }
      return true
    },
  },

  telefono: {
    validate: (value: string | undefined) => {
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

  correoElectronico: {
    validate: (value: string | undefined) => {
      if (!value) return true
      if (!VALIDATION_PATTERNS.email.test(value)) {
        return "Ingrese un correo electrónico válido"
      }
      if (hasDangerousContent(value)) {
        return "El correo contiene caracteres no permitidos"
      }
      return true
    },
  },

  tipoDocResponsable: {
    validate: (value: string | undefined) => {
      if (!value) return true
      if (!validateNaturalPersonDocumentType(value)) {
        return "El tipo de documento debe ser válido para personas naturales"
      }
      return true
    },
  },

  documentoResponsable: {
    validate: (value: string | undefined) => {
      if (!value) return true
      if (hasDangerousContent(value)) {
        return "El documento contiene caracteres no permitidos"
      }
      if (!VALIDATION_PATTERNS.alphanumericNoSpaces.test(value)) {
        return "El número de documento debe contener solo letras y números."
      }
      if (value.length < 5 || value.length > 20) {
        return "El número de documento debe tener entre 5 y 20 caracteres."
      }
      return true
    },
  },

  sedeMision: {
    maxLength: { value: 200, message: "Máximo 200 caracteres" },
    validate: (value: string | undefined) => {
      if (!value) return true
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  tipoDocSedeMision: {
    validate: (value: string | undefined) => {
      if (!value) return true
      if (!validateNaturalPersonDocumentType(value)) {
        return "El tipo de documento debe ser válido para personas naturales"
      }
      return true
    },
  },

  documentoSedeMision: {
    validate: (value: string | undefined) => {
      if (!value) return true
      if (hasDangerousContent(value)) {
        return "El documento contiene caracteres no permitidos"
      }
      if (!VALIDATION_PATTERNS.alphanumericNoSpaces.test(value)) {
        return "El número de documento debe contener solo letras y números."
      }
      if (value.length < 5 || value.length > 20) {
        return "El número de documento debe tener entre 5 y 20 caracteres."
      }
      return true
    },
  },
}

// Validaciones para CentroTrabajo
export const CentroTrabajoValidationRules = {
  tipoDocEmpleador: {
    required: "El tipo de documento del empleador es requerido",
    validate: (value: string) => {
      if (!validateLegalDocumentType(value)) {
        return "El tipo de documento debe ser válido para personas jurídicas"
      }
      return true
    },
  },

  documentoEmpleador: {
    required: "El número de documento del empleador es requerido",
    validate: (value: string, formValues: any) => {
      if (hasDangerousContent(value)) {
        return "El documento contiene caracteres no permitidos"
      }

      if (["N", "NI"].includes(formValues.tipoDocEmpleador)) {
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

  subempresa: {
    maxLength: { value: 200, message: "Máximo 200 caracteres" },
    validate: (value: string | undefined) => {
      if (!value) return true
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  idSubempresa: {
    maxLength: { value: 20, message: "Máximo 20 caracteres" },
    validate: (value: string | undefined) => {
      if (!value) return true
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  actividadEconomica: {
    required: "La actividad económica del centro de trabajo es requerida",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "Este campo contiene caracteres no permitidos"
      }
      return true
    },
  },

  idSede: {
    required: "El ID de la sede es requerido",
  },
}

// Función de sanitización para todas las entidades
export const sanitizeFormData = (data: any) => {
  const sanitized: any = {}

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      let cleanedString = cleanWhitespace(value)
      
      if (key === "direccion" || key === "direccionEmpleador") {
        cleanedString = validateAndCleanSpecialCharacters(cleanedString)
      }

      if (key === "documentoEmpleador" && ["N", "NI"].includes(data.tipoDocEmpleador)) {
        cleanedString = removeNitVerificationDigit(cleanedString)
      }
      if (key === "nitArlAnterior" && data.tipoDocArlAnterior && ["N", "NI"].includes(data.tipoDocArlAnterior)) {
        cleanedString = removeNitVerificationDigit(cleanedString)
      }
      if (key === "nitAfp") {
        cleanedString = removeNitVerificationDigit(cleanedString)
      }
      if (key === "nitEps") {
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
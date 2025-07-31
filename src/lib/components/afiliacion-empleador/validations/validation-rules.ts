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
    const naturalPersonTypes = ["CC", "TI", "CE", "CD", "PT", "SC"]
    return naturalPersonTypes.includes(documentType)
  }
  
  export function validateGender(gender: string): boolean {
    const validGenders = ["M", "F", "T", "N", "O"]
    return validGenders.includes(gender)
  }
  
  export function validateZone(zone: string): boolean {
    const validZones = ["URBANO", "RURAL"]
    return validZones.includes(zone)
  }
  
  export function validateNature(nature: string): boolean {
    const validNatures = ["JURIDICA", "PRIVADA"]
    return validNatures.includes(nature)
  }
  
  export function validateOrigin(origin: string): boolean {
    const validOrigins = ["NUEVA", "TRASLADO"]
    return validOrigins.includes(origin)
  }
  
  export const AfiliacionEmpleadorValidationRules = {
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
      validate: (value: string, formValues: any) => {
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
      maxLength: { value: 100, message: "Máximo 100 caracteres" },
      validate: (value: string) => {
        if (hasDangerousContent(value)) {
          return "Este campo contiene caracteres no permitidos"
        }
        return true
      },
    },
  
    municipioEmpleador: {
      required: "El municipio del empleador es requerido",
      maxLength: { value: 100, message: "Máximo 100 caracteres" },
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
  
    zonaEmpleador: {
      validate: (value: string) => {
        if (!value) return true
        if (!validateZone(value)) {
          return "La zona debe ser URBANO o RURAL"
        }
        return true
      },
    },
  
    actEconomicaPrincipalEmpleador: {
      required: "La actividad económica principal es requerida",
      maxLength: { value: 10, message: "Máximo 10 caracteres" },
      validate: (value: string) => {
        if (hasDangerousContent(value)) {
          return "Este campo contiene caracteres no permitidos"
        }
        return true
      },
    },
  
    telefonoEmpleador: {
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
  
    faxEmpleador: {
      validate: (value: string) => {
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
  
    correoElectronicoEmpleador: {
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
      validate: (value: string) => {
        if (!value) return true
        if (!["true", "false", "1", "0", "SI", "NO"].includes(value.toUpperCase())) {
          return "Valor inválido para suministro de transporte"
        }
        return true
      },
    },
  
    naturaleza: {
      validate: (value: string) => {
        if (!value) return true
        if (!validateNature(value)) {
          return "La naturaleza debe ser JURIDICA o PRIVADA"
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
      validate: (value: string) => {
        if (!value) return true
        if (!validateOrigin(value)) {
          return "El origen debe ser NUEVA o TRASLADO"
        }
        return true
      },
    },
  
    fechaCobertura: {
      validate: (value: string) => {
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
      validate: (value: string) => {
        if (!value) return true
        if (hasDangerousContent(value)) {
          return "El código ARL contiene caracteres no permitidos"
        }
        return true
      },
    },
  
    tipoDocArlAnterior: {
      validate: (value: string) => {
        if (!value) return true
        if (!validateLegalDocumentType(value)) {
          return "El tipo de documento debe ser válido para personas jurídicas"
        }
        return true
      },
    },
  
    nitArlAnterior: {
      validate: (value: string, formValues: any) => {
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
      validate: (value: string) => {
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
      validate: (value: string, formValues: any) => {
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
  
    primerNombreRepresentanteLegal: {
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
  
    segundoNombreRepresentanteLegal: {
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
  
    primerApellidoRepresentanteLegal: {
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
  
    segundoApellidoRepresentanteLegal: {
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
  
    fechaNacimientoRepresentanteLegal: {
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
  
    sexoRepresentanteLegal: {
      required: "El sexo del representante legal es requerido",
      validate: (value: string) => {
        if (!validateGender(value)) {
          return "El sexo debe ser M, F, T, N u O"
        }
        return true
      },
    },
  
    paisRepresentanteLegal: {
      validate: (value: string) => {
        if (!value) return true
        if (hasDangerousContent(value)) {
          return "Este campo contiene caracteres no permitidos"
        }
        return true
      },
    },
  
    departamentoRepresentanteLegal: {
      required: "El departamento del representante legal es requerido",
      maxLength: { value: 100, message: "Máximo 100 caracteres" },
      validate: (value: string) => {
        if (hasDangerousContent(value)) {
          return "Este campo contiene caracteres no permitidos"
        }
        return true
      },
    },
  
    municipioRepresentanteLegal: {
      required: "El municipio del representante legal es requerido",
      maxLength: { value: 100, message: "Máximo 100 caracteres" },
      validate: (value: string) => {
        if (hasDangerousContent(value)) {
          return "Este campo contiene caracteres no permitidos"
        }
        return true
      },
    },
  
    direccionRepresentanteLegal: {
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
  
    telefonoRepresentanteLegal: {
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
  
    correoElectronicoRepresentanteLegal: {
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
  
    nitAfpRepresentanteLegal: {
      validate: (value: string) => {
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
  
    nitEpsRepresentanteLegal: {
      validate: (value: string) => {
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
  
  export const sanitizeFormData = (data: any) => {
    const sanitized: any = {}
  
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        let cleanedString = cleanWhitespace(value)
        
        if (key === "direccionEmpleador" || key === "direccionRepresentanteLegal") {
          cleanedString = validateAndCleanSpecialCharacters(cleanedString)
        }
  
        if (key === "documentoEmpleador" && ["N", "NI"].includes(data.tipoDocEmpleador)) {
          cleanedString = removeNitVerificationDigit(cleanedString)
        }
        if (key === "nitArlAnterior" && data.tipoDocArlAnterior && ["N", "NI"].includes(data.tipoDocArlAnterior)) {
          cleanedString = removeNitVerificationDigit(cleanedString)
        }
        if (key === "nitAfpRepresentanteLegal") {
          cleanedString = removeNitVerificationDigit(cleanedString)
        }
        if (key === "nitEpsRepresentanteLegal") {
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
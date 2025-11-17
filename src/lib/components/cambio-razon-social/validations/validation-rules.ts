import type { RegisterOptions } from "react-hook-form"

/**
 * Reglas de validación para búsqueda de registro
 */
export const busquedaRegistroValidationRules = {
  tipoDocumento: {
    required: "El tipo de documento es obligatorio",
  } as RegisterOptions,

  numeroDocumento: {
    required: "El número de documento es obligatorio",
    minLength: {
      value: 3,
      message: "El número de documento debe tener al menos 3 caracteres",
    },
    maxLength: {
      value: 20,
      message: "El número de documento no puede tener más de 20 caracteres",
    },
    pattern: {
      value: /^[a-zA-Z0-9]+$/,
      message: "El número de documento solo puede contener letras y números",
    },
  } as RegisterOptions,
}

/**
 * Reglas de validación para cambio de razón social
 */
export const cambioRazonSocialValidationRules = {
  ticketId: {
    required: "El ticket asociado es obligatorio",
    minLength: {
      value: 3,
      message: "El ticket debe tener al menos 3 caracteres",
    },
    maxLength: {
      value: 50,
      message: "El ticket no puede superar los 50 caracteres",
    },
    pattern: {
      value: /^[a-zA-Z0-9\-_.]+$/,
      message: "El ticket solo puede contener letras, números, guiones, puntos o guion bajo",
    },
  } as RegisterOptions,

  modificarRazonSocial: {
    validate: (value: boolean, formValues: any) => {
      if (!value && !formValues.modificarNit && !formValues.modificarNaturaleza) {
        return "Debes seleccionar al menos un campo para modificar (Razón Social, NIT o Naturaleza)"
      }
      return true
    },
  } as RegisterOptions,

  modificarNit: {
    validate: (value: boolean, formValues: any) => {
      if (!value && !formValues.modificarRazonSocial && !formValues.modificarNaturaleza) {
        return "Debes seleccionar al menos un campo para modificar (Razón Social, NIT o Naturaleza)"
      }
      return true
    },
  } as RegisterOptions,

  modificarNaturaleza: {
    validate: (value: boolean, formValues: any) => {
      if (!value && !formValues.modificarRazonSocial && !formValues.modificarNit) {
        return "Debes seleccionar al menos un campo para modificar (Razón Social, NIT o Naturaleza)"
      }
      return true
    },
  } as RegisterOptions,

  nuevaRazonSocial: {
    validate: (value: string, formValues: any) => {
      if (formValues.modificarRazonSocial) {
        if (!value || value.trim() === "") {
          return "La razón social es obligatoria cuando está marcada para modificar"
        }
        if (value.trim().length < 3) {
          return "La razón social debe tener al menos 3 caracteres"
        }
        if (value.trim().length > 200) {
          return "La razón social no puede superar los 200 caracteres"
        }
      }
      return true
    },
  } as RegisterOptions,

  nuevoNit: {
    validate: (value: string, formValues: any) => {
      if (formValues.modificarNit) {
        if (!value || value.trim() === "") {
          return "El NIT es obligatorio cuando está marcado para modificar"
        }
        if (!/^\d+$/.test(value.trim())) {
          return "El NIT solo puede contener números"
        }
        if (value.trim().length < 5) {
          return "El NIT debe tener al menos 5 dígitos"
        }
        if (value.trim().length > 20) {
          return "El NIT no puede superar los 20 dígitos"
        }
      }
      return true
    },
  } as RegisterOptions,

  nuevoDv: {
    validate: (value: string, formValues: any) => {
      if (formValues.modificarNit) {
        if (!value || value.trim() === "") {
          return "El dígito de verificación (DV) es obligatorio cuando se modifica el NIT"
        }
        if (!/^\d+$/.test(value.trim())) {
          return "El dígito de verificación solo puede contener números"
        }
        if (value.trim().length !== 1) {
          return "El dígito de verificación debe tener exactamente 1 dígito"
        }
      }
      return true
    },
  } as RegisterOptions,

  nuevaNaturaleza: {
    validate: (value: string, formValues: any) => {
      if (formValues.modificarNaturaleza) {
        if (!value || value === "") {
          return "La naturaleza es obligatoria cuando está marcada para modificar"
        }
        if (value !== "N" && value !== "J") {
          return "La naturaleza debe ser Natural (N) o Jurídica (J)"
        }
      }
      return true
    },
  } as RegisterOptions,
}


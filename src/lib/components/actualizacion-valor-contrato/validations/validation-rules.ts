import type { RegisterOptions } from "react-hook-form"

/**
 * Reglas de validación para búsqueda de afiliado
 */
export const busquedaAfiliadoValidationRules = {
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
 * Reglas de validación para actualización de valor de contrato
 */
export const actualizacionValorContratoValidationRules = {
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

  valorContrato: {
    required: "El valor del contrato es obligatorio",
    validate: (value: string) => {
      if (!value || value.trim() === "") {
        return "El valor del contrato es obligatorio"
      }

      if (!/^\d+(\.\d{1,2})?$/.test(value)) {
        return "El valor del contrato debe ser numérico y puede incluir hasta dos decimales"
      }

      const numericValue = parseFloat(value)
      if (Number.isNaN(numericValue) || numericValue <= 0) {
        return "El valor del contrato debe ser mayor a 0"
      }

      return true
    },
  } as RegisterOptions,

  fechaInicio: {
    required: "La fecha de inicio es obligatoria",
  } as RegisterOptions,

  fechaFin: {
    required: "La fecha de fin es obligatoria",
    validate: (value: string, formValues: any) => {
      if (!value) return "La fecha de fin es obligatoria"
      
      const fechaInicio = new Date(formValues.fechaInicio)
      const fechaFin = new Date(value)
      
      if (fechaFin <= fechaInicio) {
        return "La fecha de fin debe ser posterior a la fecha de inicio"
      }
      
      return true
    },
  } as RegisterOptions,
}


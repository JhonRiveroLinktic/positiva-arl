import type { RegisterOptions } from "react-hook-form"

const MINIMUM_WAGE = 1423500

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
  valorContrato: {
    required: "El valor del contrato es obligatorio",
    validate: (value: string) => {
      if (!value || value.trim() === "") {
        return "El valor del contrato es obligatorio"
      }
      
      if (!/^[0-9]+$/.test(value)) {
        return "El valor del contrato debe ser un número entero sin puntos, comas, espacios ni símbolos"
      }
      
      const numericValue = parseInt(value)
      if (numericValue < MINIMUM_WAGE) {
        return `El valor del contrato debe ser igual o superior al salario mínimo ($${MINIMUM_WAGE.toLocaleString('es-CO')})`
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

export { MINIMUM_WAGE }


import { hasDangerousContent } from "@/lib/utils/validations"

export const notificacionDesplazamientoTrabajadorValidationRules = {
  tipo_documento_trabajador: {
    required: "El tipo de documento del trabajador es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El tipo de documento contiene caracteres no permitidos"
      }
      return true
    }
  },
  documento_trabajador: {
    required: "El número de documento del trabajador es requerido",
    minLength: { value: 5, message: "Debe tener al menos 5 caracteres" },
    maxLength: { value: 20, message: "Máximo 20 caracteres" },
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El documento contiene caracteres no permitidos"
      }
      return true
    }
  },
  tipo_documento_empleador: {
    required: "El tipo de documento del empleador es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El tipo de documento contiene caracteres no permitidos"
      }
      return true
    }
  },
  documento_empleador: {
    required: "El número de documento del empleador es requerido",
    minLength: { value: 5, message: "Debe tener al menos 5 caracteres" },
    maxLength: { value: 20, message: "Máximo 20 caracteres" },
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El documento contiene caracteres no permitidos"
      }
      return true
    }
  },
  codigo_subempresa: {
    validate: (value: string) => {
      if (value && hasDangerousContent(value)) {
        return "El código de subempresa contiene caracteres no permitidos"
      }
      return true
    }
  },
  tipo_vinculacion: {
    required: "El tipo de vinculación es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El tipo de vinculación contiene caracteres no permitidos"
      }
      return true
    }
  },
  fecha_inicio_desplazamiento: {
    required: "La fecha de inicio del desplazamiento es requerida",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "La fecha de inicio contiene caracteres no permitidos"
      }
      return true
    }
  },
  fecha_fin_desplazamiento: {
    required: "La fecha de fin del desplazamiento es requerida",
    validate: (value: string, formData?: any) => {
      if (hasDangerousContent(value)) {
        return "La fecha de fin contiene caracteres no permitidos"
      }
      
      if (value && formData?.fecha_inicio_desplazamiento) {
        const fechaInicio = new Date(formData.fecha_inicio_desplazamiento)
        const fechaFin = new Date(value)
        
        if (fechaFin < fechaInicio) {
          return "La fecha de fin del desplazamiento no puede ser menor a la fecha de inicio"
        }
      }
      
      return true
    }
  },
  codigo_departamento: {
    required: "El código del departamento es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El código del departamento contiene caracteres no permitidos"
      }
      return true
    }
  },
  codigo_municipio: {
    required: "El código del municipio es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El código del municipio contiene caracteres no permitidos"
      }
      return true
    }
  },
  motivo_desplazamiento: {
    required: "El motivo del desplazamiento es requerido",
    minLength: { value: 10, message: "Debe tener al menos 10 caracteres" },
    maxLength: { value: 200, message: "Máximo 200 caracteres" },
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El motivo del desplazamiento contiene caracteres no permitidos"
      }
      return true
    }
  }
}

export function sanitizeFormData(formData: any) {
  const sanitized: any = {}

  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === "string") {
      sanitized[key] = value.trim()
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
} 
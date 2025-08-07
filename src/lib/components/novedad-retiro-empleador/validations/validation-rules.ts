import { hasDangerousContent } from "@/lib/utils/validations"

export const novedadRetiroEmpleadorValidationRules = {
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
  nombres_y_apellidos_y_o_razon_social: {
    required: "Los nombres y apellidos o razón social es requerido",
    minLength: { value: 3, message: "Debe tener al menos 3 caracteres" },
    maxLength: { value: 200, message: "Máximo 200 caracteres" },
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El nombre contiene caracteres no permitidos"
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
  departamento: {
    required: "El departamento es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El departamento contiene caracteres no permitidos"
      }
      return true
    }
  },
  municipio: {
    required: "El municipio es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El municipio contiene caracteres no permitidos"
      }
      return true
    }
  },
  fecha_retiro_empleador: {
    required: "La fecha de retiro del empleador es requerida",
    validate: (value: string) => {
      if (!value) return true
      const fecha = new Date(value)
      if (isNaN(fecha.getTime())) {
        return "Formato de fecha inválido"
      }
      return true
    }
  },
  causal_retiro_empleador: {
    required: "La causal de retiro del empleador es requerida",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "La causal contiene caracteres no permitidos"
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
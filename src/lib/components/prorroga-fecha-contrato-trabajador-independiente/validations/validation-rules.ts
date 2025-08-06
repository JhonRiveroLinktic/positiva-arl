import { hasDangerousContent } from "@/lib/utils/validations"

export const prorrogaFechaContratoTrabajadorIndependienteValidationRules = {
  tipo_doc_contratante: {
    required: "El tipo de documento del contratante es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El tipo de documento contiene caracteres no permitidos"
      }
      return true
    }
  },
  documento_contratante: {
    required: "El número de documento del contratante es requerido",
    minLength: { value: 5, message: "Debe tener al menos 5 caracteres" },
    maxLength: { value: 20, message: "Máximo 20 caracteres" },
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El documento contiene caracteres no permitidos"
      }
      return true
    }
  },
  razon_social: {
    required: "La razón social es requerida",
    minLength: { value: 3, message: "Debe tener al menos 3 caracteres" },
    maxLength: { value: 255, message: "Máximo 255 caracteres" },
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "La razón social contiene caracteres no permitidos"
      }
      return true
    }
  },
  codigo_subempresa: {
    maxLength: { value: 50, message: "Máximo 50 caracteres" },
    validate: (value: string) => {
      if (value && hasDangerousContent(value)) {
        return "El código de subempresa contiene caracteres no permitidos"
      }
      return true
    }
  },
  tipo_doc_trabajador: {
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
  fecha_inicio_contrato_original: {
    required: "La fecha de inicio del contrato original es requerida",
    validate: (value: string) => {
      if (!value) return true
      const fecha = new Date(value)
      if (isNaN(fecha.getTime())) {
        return "Formato de fecha inválido"
      }
      return true
    }
  },
  fecha_fin_contrato_anterior: {
    required: "La fecha de fin del contrato anterior es requerida",
    validate: (value: string) => {
      if (!value) return true
      const fecha = new Date(value)
      if (isNaN(fecha.getTime())) {
        return "Formato de fecha inválido"
      }
      return true
    }
  },
  fecha_fin_contrato_nueva: {
    required: "La nueva fecha de fin del contrato es requerida",
    validate: (value: string) => {
      if (!value) return true
      const fecha = new Date(value)
      if (isNaN(fecha.getTime())) {
        return "Formato de fecha inválido"
      }
      return true
    }
  },
  valor_contrato_prorroga: {
    maxLength: { value: 15, message: "Máximo 15 caracteres" },
    pattern: {
      value: /^[0-9.,]+$/,
      message: "Solo se permiten números, puntos y comas"
    },
    validate: (value: string) => {
      if (value && hasDangerousContent(value)) {
        return "El valor del contrato contiene caracteres no permitidos"
      }
      return true
    }
  },
  correo_electronico: {
    required: "El correo electrónico es requerido",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Formato de correo electrónico inválido"
    },
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El correo electrónico contiene caracteres no permitidos"
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
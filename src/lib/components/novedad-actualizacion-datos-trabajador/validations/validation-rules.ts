import { hasDangerousContent, validatePhoneNumber } from "@/lib/utils/validations"

export const novedadActualizacionDatosTrabajadorValidationRules = {
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
  codigo_eps: {
    required: "El código EPS es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El código EPS contiene caracteres no permitidos"
      }
      return true
    }
  },
  codigo_afp: {
    required: "El código AFP es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El código AFP contiene caracteres no permitidos"
      }
      return true
    }
  },
  correo_electronico_trabajador: {
    required: "El correo electrónico del trabajador es requerido",
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
  },
  fecha_de_nacimiento: {
    required: "La fecha de nacimiento es requerida",
    validate: (value: string) => {
      if (!value) return true
      const fecha = new Date(value)
      if (isNaN(fecha.getTime())) {
        return "Formato de fecha inválido"
      }
      return true
    }
  },
  direccion_de_residencia: {
    required: "La dirección de residencia es requerida",
    minLength: { value: 5, message: "Debe tener al menos 5 caracteres" },
    maxLength: { value: 500, message: "Máximo 500 caracteres" },
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "La dirección contiene caracteres no permitidos"
      }
      return true
    }
  },
  telefono_de_residencia: {
    validate: (value: string) => {
      const phoneValidation = validatePhoneNumber(value)
      if (!phoneValidation.isValid) {
        return phoneValidation.message || "Formato de teléfono inválido"
      }
      return true
    },
  },
  departamento_de_residencia: {
    required: "El departamento de residencia es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El departamento contiene caracteres no permitidos"
      }
      return true
    }
  },
  municipio_de_residencia: {
    required: "El municipio de residencia es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El municipio contiene caracteres no permitidos"
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
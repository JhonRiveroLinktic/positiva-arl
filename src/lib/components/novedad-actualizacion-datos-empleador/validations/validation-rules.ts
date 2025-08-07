import { hasDangerousContent, validatePhoneNumber } from "@/lib/utils/validations"

export const novedadActualizacionDatosEmpleadorValidationRules = {
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
  correo_electronico: {
    required: "El correo electrónico es requerido",
    validate: (value: string) => {
      if (value && hasDangerousContent(value)) {
        return "El correo electrónico contiene caracteres no permitidos"
      }
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "El formato del correo electrónico no es válido"
      }
      return true
    }
  },
  direccion: {
    required: "La dirección es requerida",
    validate: (value: string) => {
      if (value && hasDangerousContent(value)) {
        return "La dirección contiene caracteres no permitidos"
      }
      return true
    }
  },
  telefono: {
    required: "El número de teléfono es requerido",
    validate: (value: string) => {
      const phoneValidation = validatePhoneNumber(value)
      if (!phoneValidation.isValid) {
        return phoneValidation.message || "Formato de teléfono inválido"
      }
      return true
    },
  },
  departamento: {
    required: "El departamento es requerido",
    validate: (value: string) => {
      if (value && hasDangerousContent(value)) {
        return "El departamento contiene caracteres no permitidos"
      }
      return true
    }
  },
  municipio: {
    required: "El municipio es requerido",
    validate: (value: string) => {
      if (value && hasDangerousContent(value)) {
        return "El municipio contiene caracteres no permitidos"
      }
      return true
    }
  },
  representante_legal: {
    required: "El representante legal es requerido",
    validate: (value: string) => {
      if (value && hasDangerousContent(value)) {
        return "El representante legal contiene caracteres no permitidos"
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
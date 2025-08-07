import { hasDangerousContent, validatePhoneNumber } from "@/lib/utils/validations"

export const novedadSedeEmpleadorValidationRules = {
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
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "Los nombres y apellidos o razón social contiene caracteres no permitidos"
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
  nombre_sede: {
    required: "El nombre de la sede es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El nombre de la sede contiene caracteres no permitidos"
      }
      return true
    }
  },
  codigo_dane_departamento_sede: {
    required: "El código DANE del departamento de la sede es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El código DANE del departamento contiene caracteres no permitidos"
      }
      return true
    }
  },
  codigo_dane_municipio_sede: {
    required: "El código DANE del municipio de la sede es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El código DANE del municipio contiene caracteres no permitidos"
      }
      return true
    }
  },
  direccion_sede: {
    required: "La dirección de la sede es requerida",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "La dirección contiene caracteres no permitidos"
      }
      return true
    }
  },
  telefono_sede: {
    required: "El número de teléfono de la sede es requerido",
    validate: (value: string) => {
      const phoneValidation = validatePhoneNumber(value)
      if (!phoneValidation.isValid) {
        return phoneValidation.message || "Formato de teléfono inválido"
      }
      return true
    },
  },
  correo_electronico_sede: {
    required: "El correo electrónico de la sede es requerido",
    validate: (value: string) => {
      if (value && hasDangerousContent(value)) {
        return "El correo electrónico contiene caracteres no permitidos"
      }
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "El formato del correo electrónico no es válido"
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
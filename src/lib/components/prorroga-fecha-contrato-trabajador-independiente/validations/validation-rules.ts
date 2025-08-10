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

  cambio_fechas_o_prorroga: {
    required: "El campo es requerido",
    validate: (value: string) => {
      if (hasDangerousContent(value)) {
        return "El cambio de fecha o prorroga contiene caracteres no permitidos"
      }
      if (!["1", "2"].includes(value)) {
        return "El valor debe ser 1 (Cambio de fechas) o 2 (Prórroga)"
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

  fecha_fin_contrato_nueva: {
    required: "La nueva fecha de fin del contrato es requerida",
    validate: (value: string, formData?: any) => {
      if (!value) return true
      const fecha = new Date(value)
      if (isNaN(fecha.getTime())) {
        return "Formato de fecha inválido"
      }
      
      if (formData?.fecha_inicio_contrato_original) {
        const fechaInicio = new Date(formData.fecha_inicio_contrato_original)
        if (fechaInicio && !isNaN(fechaInicio.getTime()) && fecha < fechaInicio) {
          return "La fecha de fin del contrato no puede ser anterior a la fecha de inicio"
        }
      }
      
      return true
    }
  },

  valor_contrato_prorroga: {
    validate: (value: string | null, formData?: any) => {
      if (formData?.cambio_fechas_o_prorroga === "2") {
        if (!value || value.trim() === "" || value === "0") {
          return "El valor del contrato es requerido cuando se selecciona Prórroga"
        }
        
        if (hasDangerousContent(value)) {
          return "El valor del contrato contiene caracteres no permitidos"
        }
        
        const cleanValue = value
          .trim()
          .replace(/\s+/g, '')
          .replace(/,(\d{2})$/, '.$1')
          .replace(/[^\d.]/g, '');
        
        const numValue = parseFloat(cleanValue);
        if (isNaN(numValue) || numValue <= 0) {
          return "El valor del contrato debe ser un número válido mayor a 0"
        }
        
        if (cleanValue.length > 15) {
          return "El valor del contrato es demasiado largo (máximo 15 dígitos)"
        }
      } else {
        if (value && value.trim() !== "") {
          if (hasDangerousContent(value)) {
            return "El valor del contrato contiene caracteres no permitidos"
          }
          
          const cleanValue = value
            .trim()
            .replace(/\s+/g, '')
            .replace(/,(\d{2})$/, '.$1')
            .replace(/[^\d.]/g, '');
          
          const numValue = parseFloat(cleanValue);
          if (isNaN(numValue)) {
            return "El valor del contrato debe ser un número válido"
          }
        }
      }
      
      return true
    }
  },
}

export function sanitizeFormData(formData: any) {
  const sanitized: any = {}
  
  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === "string") {
      if (key === 'valor_contrato_prorroga') {
        const trimmedValue = value.trim();
        if (trimmedValue === "" || trimmedValue === "0") {
          sanitized[key] = null;
        } else {
          const cleanValue = trimmedValue
            .replace(/\s+/g, '')
            .replace(/,(\d{2})$/, '.$1')
            .replace(/[^\d.]/g, '');
          
          const numValue = parseFloat(cleanValue);
          sanitized[key] = isNaN(numValue) ? null : numValue.toString();
        }
      } else {
        sanitized[key] = value.trim()
      }
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}
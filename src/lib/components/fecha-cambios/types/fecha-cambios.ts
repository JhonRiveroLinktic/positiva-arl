export interface Registro {
  id: string
  tipoDocEmp: string
  numeDocEmp: string
  tipoDocPersona: string
  numeDocPersona: string
  fechaInicioContrato: Date
  fechaFinContrato: Date
  correoNotificacion: string
  metodoSubida?: string
}

export interface FechaCambios {
  id?: string
  tipo_doc_emp: string
  nume_doc_emp: string
  tipo_doc_persona: string
  nume_doc_persona: string
  fecha_inicio_contrato: string
  fecha_fin_contrato: string
  correo_notificacion: string
  metodo_subida?: string
  created_at?: string
  updated_at?: string
}

export interface FechaCambiosFormData {
  tipoDocEmp: string
  numeDocEmp: string
  tipoDocPersona: string
  numeDocPersona: string
  fechaInicioContrato: Date
  fechaFinContrato: Date
  correoNotificacion: string
}

export function trimRegistroFields(registro: Partial<Registro>): Partial<Registro> {
  const trimmed: Partial<Registro> = {}

  for (const [key, value] of Object.entries(registro)) {
    if (typeof value === "string") {
      (trimmed as any)[key] = value.trim()
    } else if (value instanceof Date) {
      (trimmed as any)[key] = value
    } else {
      (trimmed as any)[key] = value
    }
  }

  return trimmed
}

export function convertToSupabaseFormat(formData: Partial<Registro>): FechaCambios {
  const trimmedData = trimRegistroFields(formData)

  return {
    tipo_doc_emp: trimmedData.tipoDocEmp || "",
    nume_doc_emp: trimmedData.numeDocEmp || "",
    tipo_doc_persona: trimmedData.tipoDocPersona || "",
    nume_doc_persona: trimmedData.numeDocPersona || "",
    fecha_inicio_contrato: trimmedData.fechaInicioContrato ? trimmedData.fechaInicioContrato.toISOString().split('T')[0] : "",
    fecha_fin_contrato: trimmedData.fechaFinContrato ? trimmedData.fechaFinContrato.toISOString().split('T')[0] : "",
    correo_notificacion: trimmedData.correoNotificacion || "",
    metodo_subida: trimmedData.metodoSubida || undefined,
  }
} 
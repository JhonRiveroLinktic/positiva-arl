export interface Registro {
  id: string
  tipoDocEmp: string
  numeDocEmp: string
  tipoDocPersona: string
  numeDocPersona: string
  modoTrabajo: string
  codigoActividadEconomica: string
  correoNotificacion: string
  metodoSubida?: string
}

export interface CambioRiesgoRegistroARL {
  id?: string
  tipo_doc_emp: string
  nume_doc_emp: string
  tipo_doc_persona: string
  nume_doc_persona: string
  modo_trabajo: string
  codigo_actividad_economica: string
  correo_notificacion: string
  metodo_subida?: string
  created_at?: string
  updated_at?: string
}

export interface CambioRiesgoFormData {
  tipoDocEmp: string
  numeDocEmp: string
  tipoDocPersona: string
  numeDocPersona: string
  modoTrabajo: string
  codigoActividadEconomica: string
  correoNotificacion: string
}

export function trimRegistroFields(registro: Partial<Registro>): Partial<Registro> {
  const trimmed: Partial<Registro> = {}

  for (const [key, value] of Object.entries(registro)) {
    if (typeof value === "string") {
      trimmed[key as keyof Registro] = value.trim()
    } else {
      trimmed[key as keyof Registro] = value
    }
  }

  return trimmed
}

export function convertToSupabaseFormat(formData: Partial<Registro>): CambioRiesgoRegistroARL {
  const trimmedData = trimRegistroFields(formData)

  return {
    tipo_doc_emp: trimmedData.tipoDocEmp || "",
    nume_doc_emp: trimmedData.numeDocEmp || "",
    tipo_doc_persona: trimmedData.tipoDocPersona || "",
    nume_doc_persona: trimmedData.numeDocPersona || "",
    modo_trabajo: trimmedData.modoTrabajo || "",
    codigo_actividad_economica: trimmedData.codigoActividadEconomica || "",
    correo_notificacion: trimmedData.correoNotificacion || "",
    metodo_subida: trimmedData.metodoSubida || undefined,
  }
} 
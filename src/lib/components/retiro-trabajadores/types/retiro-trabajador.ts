export interface Registro {
  id: string
  tipoDocEmpleador: string
  documentoEmpleador: string
  tipoDocTrabajador: string
  documentoTrabajador: string
  tipoVinculacion: string
  fechaRetiroTrabajador: Date
  correoNotificacion: string
  metodoSubida?: string
}

export interface RetiroTrabajadores {
  id?: string
  tipo_doc_empleador: string
  documento_empleador: string
  tipo_doc_trabajador: string
  documento_trabajador: string
  tipo_vinculacion: string
  fecha_retiro_trabajador: string
  metodo_subida?: string
  fecha_creacion?: string
  fecha_actualizacion?: string
  correo_notificacion: string
}

export interface RetiroTrabajadoresFormData {
  tipoDocEmpleador: string
  documentoEmpleador: string
  tipoDocTrabajador: string
  documentoTrabajador: string
  tipoVinculacion: string
  fechaRetiroTrabajador: Date
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

export function convertToSupabaseFormat(formData: Partial<Registro>): RetiroTrabajadores {
  const trimmedData = trimRegistroFields(formData)

  return {
    tipo_doc_empleador: trimmedData.tipoDocEmpleador || "",
    documento_empleador: trimmedData.documentoEmpleador || "",
    tipo_doc_trabajador: trimmedData.tipoDocTrabajador || "",
    documento_trabajador: trimmedData.documentoTrabajador || "",
    tipo_vinculacion: trimmedData.tipoVinculacion || "",
    fecha_retiro_trabajador: trimmedData.fechaRetiroTrabajador ? trimmedData.fechaRetiroTrabajador.toISOString().split('T')[0] : "",
    metodo_subida: trimmedData.metodoSubida || undefined,
    correo_notificacion: trimmedData.correoNotificacion || "",
  }
} 
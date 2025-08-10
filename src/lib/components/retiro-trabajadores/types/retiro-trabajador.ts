export interface Registro {
  id: string
  tipoDocEmpleador: string
  documentoEmpleador: string
  codigoSubempresa?: string
  tipoDocTrabajador: string
  documentoTrabajador: string
  tipoVinculacion: string
  fechaRetiroTrabajador: string
  metodoSubida?: string
}

export interface RetiroTrabajadores {
  id?: string
  tipo_doc_empleador: string
  documento_empleador: string
  codigo_subempresa?: string
  tipo_doc_trabajador: string
  documento_trabajador: string
  tipo_vinculacion: string
  fecha_retiro_trabajador: string
  metodo_subida?: string
}

export interface RetiroTrabajadoresFormData {
  tipoDocEmpleador: string
  documentoEmpleador: string
  codigoSubempresa?: string
  tipoDocTrabajador: string
  documentoTrabajador: string
  tipoVinculacion: string
  fechaRetiroTrabajador: string
  metodoSubida?: string
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

export function convertToSupabaseFormat(formData: Partial<Registro>): RetiroTrabajadores {
  const trimmedData = trimRegistroFields(formData)

  return {
    tipo_doc_empleador: trimmedData.tipoDocEmpleador || "",
    documento_empleador: trimmedData.documentoEmpleador || "",
    codigo_subempresa: trimmedData.codigoSubempresa || "",
    tipo_doc_trabajador: trimmedData.tipoDocTrabajador || "",
    documento_trabajador: trimmedData.documentoTrabajador || "",
    tipo_vinculacion: trimmedData.tipoVinculacion || "",
    fecha_retiro_trabajador: trimmedData.fechaRetiroTrabajador || "",
    metodo_subida: trimmedData.metodoSubida || undefined,
  }
}
export interface Registro {
    id: string
    tipo_doc_contratante: string
    documento_contratante: string
    razon_social: string
    codigo_subempresa: string
    tipo_doc_trabajador: string
    documento_trabajador: string
    fecha_inicio_contrato_original: string
    fecha_fin_contrato_anterior: string
    fecha_fin_contrato_nueva: string
    valor_contrato_prorroga: string
    correo_electronico: string
    metodo_subida?: string
    registro_id?: string
}
  
export interface ProrrogaFechaContratoTrabajadorIndependiente {
    id?: string
    tipo_doc_contratante: string
    documento_contratante: string
    razon_social: string
    codigo_subempresa: string
    tipo_doc_trabajador: string
    documento_trabajador: string
    fecha_inicio_contrato_original: string
    fecha_fin_contrato_anterior: string
    fecha_fin_contrato_nueva: string
    valor_contrato_prorroga: string
    correo_electronico: string
    metodo_subida?: string
    registro_id?: string
}
  
export interface ProrrogaFechaContratoTrabajadorIndependienteFormData {
    tipo_doc_contratante: string
    documento_contratante: string
    razon_social: string
    codigo_subempresa: string
    tipo_doc_trabajador: string
    documento_trabajador: string
    fecha_inicio_contrato_original: string
    fecha_fin_contrato_anterior: string
    fecha_fin_contrato_nueva: string
    valor_contrato_prorroga: string
    correo_electronico: string
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
  
export function convertToSupabaseFormat(formData: Partial<Registro>): ProrrogaFechaContratoTrabajadorIndependiente {
    const trimmedData = trimRegistroFields(formData)

    return {
        tipo_doc_contratante: trimmedData.tipo_doc_contratante || "",
        documento_contratante: trimmedData.documento_contratante || "",
        razon_social: trimmedData.razon_social || "",
        codigo_subempresa: trimmedData.codigo_subempresa || "",
        tipo_doc_trabajador: trimmedData.tipo_doc_trabajador || "",
        documento_trabajador: trimmedData.documento_trabajador || "",
        fecha_inicio_contrato_original: trimmedData.fecha_inicio_contrato_original || "",
        fecha_fin_contrato_anterior: trimmedData.fecha_fin_contrato_anterior || "",
        fecha_fin_contrato_nueva: trimmedData.fecha_fin_contrato_nueva || "",
        valor_contrato_prorroga: trimmedData.valor_contrato_prorroga || "",
        correo_electronico: trimmedData.correo_electronico || "",
        metodo_subida: trimmedData.metodo_subida || undefined,
        registro_id: trimmedData.registro_id || undefined,
    }
} 
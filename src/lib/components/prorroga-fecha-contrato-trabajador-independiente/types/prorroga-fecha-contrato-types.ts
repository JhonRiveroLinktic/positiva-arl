export interface Registro {
    id: string
    tipo_doc_contratante: string
    documento_contratante: string
    codigo_subempresa: string
    tipo_doc_trabajador: string
    documento_trabajador: string
    cambio_fechas_o_prorroga: string
    fecha_inicio_contrato_original: string
    fecha_fin_contrato_nueva: string
    valor_contrato_prorroga: string | null
    metodo_subida?: string
  }
  
  export interface ProrrogaFechaContratoTrabajadorIndependiente {
    id?: string
    tipo_doc_contratante: string
    documento_contratante: string
    codigo_subempresa: string
    tipo_doc_trabajador: string
    documento_trabajador: string
    cambio_fechas_o_prorroga: string
    fecha_inicio_contrato_original: string
    fecha_fin_contrato_nueva: string
    valor_contrato_prorroga: string | null
    metodo_subida?: string
  }
  
  export interface ProrrogaFechaContratoTrabajadorIndependienteFormData {
    tipo_doc_contratante: string
    documento_contratante: string
    codigo_subempresa: string
    tipo_doc_trabajador: string
    documento_trabajador: string
    cambio_fechas_o_prorroga: string
    fecha_inicio_contrato_original: string
    fecha_fin_contrato_nueva: string
    valor_contrato_prorroga: string | null
    metodo_subida?: string
  }
  
export function trimRegistroFields(registro: Partial<Registro>): Partial<Registro> {
    const trimmed: any = {}
  
    for (const [key, value] of Object.entries(registro)) {
      if (typeof value === "string") {
        if (key === 'valor_contrato_prorroga') {
          const trimmedValue = value.trim();
          trimmed[key] = trimmedValue === "" ? null : trimmedValue;
        } else {
          trimmed[key] = value.trim()
        }
      } else {
        trimmed[key] = value
      }
    }
  
    return trimmed as Partial<Registro>
}
  
export function convertToSupabaseFormat(formData: Partial<Registro>): Registro {
  const trimmedData = trimRegistroFields(formData)

  const result = {
    id: trimmedData.id || "",
    tipo_doc_contratante: trimmedData.tipo_doc_contratante || "",
    documento_contratante: trimmedData.documento_contratante || "",
    codigo_subempresa: trimmedData.codigo_subempresa || "",
    tipo_doc_trabajador: trimmedData.tipo_doc_trabajador || "",
    documento_trabajador: trimmedData.documento_trabajador || "",
    cambio_fechas_o_prorroga: trimmedData.cambio_fechas_o_prorroga || "",
    fecha_inicio_contrato_original: trimmedData.fecha_inicio_contrato_original || "",
    fecha_fin_contrato_nueva: trimmedData.fecha_fin_contrato_nueva || "",
    metodo_subida: trimmedData.metodo_subida || undefined,
  } as Registro

  // Manejar valor_contrato_prorroga por separado
  result.valor_contrato_prorroga = trimmedData.valor_contrato_prorroga || null

  return result
} 
export interface Registro {
    id: string
    tipo_doc_contratante: string
    nume_doc_contratante: string
    codigo_subempresa: string
    tipo_doc_trabajador: string
    nume_doc_trabajador: string
    nueva_actividad_economica: string
    metodo_subida?: string
}
  
export interface CambioActividadEconomicaIndependienteConContrato {
    id?: string
    tipo_doc_contratante: string
    nume_doc_contratante: string
    codigo_subempresa: string
    tipo_doc_trabajador: string
    nume_doc_trabajador: string
    nueva_actividad_economica: string
    metodo_subida?: string
    independiente_con_contrato_id?: string
}
  
export interface CambioActividadEconomicaIndependienteConContratoFormData {
    tipo_doc_contratante: string
    nume_doc_contratante: string
    codigo_subempresa: string
    tipo_doc_trabajador: string
    nume_doc_trabajador: string
    nueva_actividad_economica: string
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
  
export function convertToSupabaseFormat(formData: Partial<Registro>): CambioActividadEconomicaIndependienteConContrato {
    const trimmedData = trimRegistroFields(formData)

    return {
        tipo_doc_contratante: trimmedData.tipo_doc_contratante || "",
        nume_doc_contratante: trimmedData.nume_doc_contratante || "",
        codigo_subempresa: trimmedData.codigo_subempresa || "",
        tipo_doc_trabajador: trimmedData.tipo_doc_trabajador || "",
        nume_doc_trabajador: trimmedData.nume_doc_trabajador || "",
        nueva_actividad_economica: trimmedData.nueva_actividad_economica || "",
        metodo_subida: trimmedData.metodo_subida || undefined,
    }
}
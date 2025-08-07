export interface NovedadRetiroEmpleadorFormData {
  tipo_documento_empleador: string;
  documento_empleador: string;
  nombres_y_apellidos_y_o_razon_social: string;
  codigo_subempresa: string;
  departamento: string;
  municipio: string;
  fecha_retiro_empleador: string;
  causal_retiro_empleador: string;
  metodo_subida?: string;
}

export interface NovedadRetiroEmpleador {
  tipo_documento_empleador: string;
  documento_empleador: string;
  nombres_y_apellidos_y_o_razon_social: string;
  codigo_subempresa: string;
  departamento: string;
  municipio: string;
  fecha_retiro_empleador: string;
  causal_retiro_empleador: string;
  metodo_subida?: string;
}

export interface Registro extends Omit<NovedadRetiroEmpleador, "metodo_subida"> {
  id?: string;
  metodo_subida?: string;
  registro_id?: string;
}

export function trimRegistroFields(registro: Partial<NovedadRetiroEmpleador>): Partial<NovedadRetiroEmpleador> {
  const trimmed: Partial<NovedadRetiroEmpleador> = {};
  
  for (const [key, value] of Object.entries(registro)) {
    if (typeof value === "string") {
      trimmed[key as keyof NovedadRetiroEmpleador] = value.trim();
    } else {
      trimmed[key as keyof NovedadRetiroEmpleador] = value;
    }
  }
  
  return trimmed;
}

export function convertToSupabaseFormat(formData: NovedadRetiroEmpleadorFormData): Registro {
  const trimmedData = trimRegistroFields(formData);
  
  return {
    tipo_documento_empleador: trimmedData.tipo_documento_empleador || "",
    documento_empleador: trimmedData.documento_empleador || "",
    nombres_y_apellidos_y_o_razon_social: trimmedData.nombres_y_apellidos_y_o_razon_social || "",
    codigo_subempresa: trimmedData.codigo_subempresa || "",
    departamento: trimmedData.departamento || "",
    municipio: trimmedData.municipio || "",
    fecha_retiro_empleador: trimmedData.fecha_retiro_empleador || "",
    causal_retiro_empleador: trimmedData.causal_retiro_empleador || "",
    metodo_subida: trimmedData.metodo_subida || undefined,
  };
} 
export interface NovedadActualizacionDatosEmpleadorFormData {
  tipo_documento_empleador: string;
  documento_empleador: string;
  codigo_subempresa: string;
  correo_electronico: string;
  direccion: string;
  telefono: string;
  departamento: string;
  municipio: string;
  tipo_documento_representante_legal: string;
  documento_representante_legal: string;
  primer_nombre_representante_legal: string;
  segundo_nombre_representante_legal: string;
  primer_apellido_representante_legal: string;
  segundo_apellido_representante_legal: string;
  metodo_subida?: string;
}

export interface NovedadActualizacionDatosEmpleador {
  tipo_documento_empleador: string;
  documento_empleador: string;
  codigo_subempresa: string;
  correo_electronico: string;
  direccion: string;
  telefono: string;
  departamento: string;
  municipio: string;
  tipo_documento_representante_legal: string;
  documento_representante_legal: string;
  primer_nombre_representante_legal: string;
  segundo_nombre_representante_legal: string;
  primer_apellido_representante_legal: string;
  segundo_apellido_representante_legal: string;
  metodo_subida?: string;
}

export interface Registro extends Omit<NovedadActualizacionDatosEmpleador, "metodo_subida"> {
  id?: string;
  metodo_subida?: string;
  registro_id?: string;
}

export function trimRegistroFields(registro: Partial<NovedadActualizacionDatosEmpleador>): Partial<NovedadActualizacionDatosEmpleador> {
  const trimmed: Partial<NovedadActualizacionDatosEmpleador> = {};

  for (const [key, value] of Object.entries(registro)) {
    if (typeof value === "string") {
      trimmed[key as keyof NovedadActualizacionDatosEmpleador] = value.trim();
    } else {
      trimmed[key as keyof NovedadActualizacionDatosEmpleador] = value;
    }
  }

  return trimmed;
}

export function convertToSupabaseFormat(formData: NovedadActualizacionDatosEmpleadorFormData): Registro {
  const trimmedData = trimRegistroFields(formData);

  return {
    tipo_documento_empleador: trimmedData.tipo_documento_empleador || "",
    documento_empleador: trimmedData.documento_empleador || "",
    codigo_subempresa: trimmedData.codigo_subempresa || "",
    correo_electronico: trimmedData.correo_electronico || "",
    direccion: trimmedData.direccion || "",
    telefono: trimmedData.telefono || "",
    departamento: trimmedData.departamento || "",
    municipio: trimmedData.municipio || "",
    tipo_documento_representante_legal: trimmedData.tipo_documento_representante_legal || "",
    documento_representante_legal: trimmedData.documento_representante_legal || "",
    primer_nombre_representante_legal: trimmedData.primer_nombre_representante_legal || "",
    segundo_nombre_representante_legal: trimmedData.segundo_nombre_representante_legal || "",
    primer_apellido_representante_legal: trimmedData.primer_apellido_representante_legal || "",
    segundo_apellido_representante_legal: trimmedData.segundo_apellido_representante_legal || "",
    metodo_subida: trimmedData.metodo_subida || undefined,
  };
} 
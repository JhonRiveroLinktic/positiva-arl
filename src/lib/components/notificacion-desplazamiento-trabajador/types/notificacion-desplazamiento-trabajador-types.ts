export interface NotificacionDesplazamientoTrabajadorFormData {
  tipo_documento_trabajador: string;
  documento_trabajador: string;
  tipo_documento_empleador: string;
  documento_empleador: string;
  codigo_subempresa: string;
  tipo_vinculacion: string;
  fecha_inicio_desplazamiento: string;
  fecha_fin_desplazamiento: string;
  codigo_departamento: string;
  codigo_municipio: string;
  motivo_desplazamiento: string;
  metodo_subida?: string;
}

export interface NotificacionDesplazamientoTrabajador {
  tipo_documento_trabajador: string;
  documento_trabajador: string;
  tipo_documento_empleador: string;
  documento_empleador: string;
  codigo_subempresa: string;
  tipo_vinculacion: string;
  fecha_inicio_desplazamiento: string;
  fecha_fin_desplazamiento: string;
  codigo_departamento: string;
  codigo_municipio: string;
  motivo_desplazamiento: string;
  metodo_subida?: string;
}

export interface Registro extends Omit<NotificacionDesplazamientoTrabajador, "metodo_subida"> {
  id?: string;
  metodo_subida?: string;
  registro_id?: string;
}

export function trimRegistroFields(registro: Partial<NotificacionDesplazamientoTrabajador>): Partial<NotificacionDesplazamientoTrabajador> {
  const trimmed: Partial<NotificacionDesplazamientoTrabajador> = {};

  for (const [key, value] of Object.entries(registro)) {
    if (typeof value === "string") {
      trimmed[key as keyof NotificacionDesplazamientoTrabajador] = value.trim();
    } else {
      trimmed[key as keyof NotificacionDesplazamientoTrabajador] = value;
    }
  }

  return trimmed;
}

export function convertToSupabaseFormat(formData: NotificacionDesplazamientoTrabajadorFormData): Registro {
  const trimmedData = trimRegistroFields(formData);

  return {
    tipo_documento_trabajador: trimmedData.tipo_documento_trabajador || "",
    documento_trabajador: trimmedData.documento_trabajador || "",
    tipo_documento_empleador: trimmedData.tipo_documento_empleador || "",
    documento_empleador: trimmedData.documento_empleador || "",
    codigo_subempresa: trimmedData.codigo_subempresa || "",
    tipo_vinculacion: trimmedData.tipo_vinculacion || "",
    fecha_inicio_desplazamiento: trimmedData.fecha_inicio_desplazamiento || "",
    fecha_fin_desplazamiento: trimmedData.fecha_fin_desplazamiento || "",
    codigo_departamento: trimmedData.codigo_departamento || "",
    codigo_municipio: trimmedData.codigo_municipio || "",
    motivo_desplazamiento: trimmedData.motivo_desplazamiento || "",
    metodo_subida: trimmedData.metodo_subida || undefined,
  };
} 
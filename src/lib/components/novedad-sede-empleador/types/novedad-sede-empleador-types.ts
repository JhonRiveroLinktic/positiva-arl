export interface NovedadSedeEmpleadorFormData {
  tipo_documento_empleador: string;
  documento_empleador: string;
  nombres_y_apellidos_y_o_razon_social: string;
  codigo_subempresa: string;
  nombre_sede: string;
  codigo_dane_departamento_sede: string;
  codigo_dane_municipio_sede: string;
  direccion_sede: string;
  telefono_sede: string;
  correo_electronico_sede: string;
  metodo_subida?: string;
}

export interface NovedadSedeEmpleador {
  tipo_documento_empleador: string;
  documento_empleador: string;
  nombres_y_apellidos_y_o_razon_social: string;
  codigo_subempresa: string;
  nombre_sede: string;
  codigo_dane_departamento_sede: string;
  codigo_dane_municipio_sede: string;
  direccion_sede: string;
  telefono_sede: string;
  correo_electronico_sede: string;
  metodo_subida?: string;
}

export interface Registro extends Omit<NovedadSedeEmpleador, "metodo_subida"> {
  id?: string;
  metodo_subida?: string;
  registro_id?: string;
}

export function trimRegistroFields(registro: Partial<NovedadSedeEmpleador>): Partial<NovedadSedeEmpleador> {
  const trimmed: Partial<NovedadSedeEmpleador> = {};

  for (const [key, value] of Object.entries(registro)) {
    if (typeof value === "string") {
      trimmed[key as keyof NovedadSedeEmpleador] = value.trim();
    } else {
      trimmed[key as keyof NovedadSedeEmpleador] = value;
    }
  }

  return trimmed;
}

export function convertToSupabaseFormat(formData: NovedadSedeEmpleadorFormData): Registro {
  const trimmedData = trimRegistroFields(formData);

  return {
    tipo_documento_empleador: trimmedData.tipo_documento_empleador || "",
    documento_empleador: trimmedData.documento_empleador || "",
    nombres_y_apellidos_y_o_razon_social: trimmedData.nombres_y_apellidos_y_o_razon_social || "",
    codigo_subempresa: trimmedData.codigo_subempresa || "",
    nombre_sede: trimmedData.nombre_sede || "",
    codigo_dane_departamento_sede: trimmedData.codigo_dane_departamento_sede || "",
    codigo_dane_municipio_sede: trimmedData.codigo_dane_municipio_sede || "",
    direccion_sede: trimmedData.direccion_sede || "",
    telefono_sede: trimmedData.telefono_sede || "",
    correo_electronico_sede: trimmedData.correo_electronico_sede || "",
    metodo_subida: trimmedData.metodo_subida || undefined,
  };
} 
"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/lib/components/ui/button"
import { ListWrapper, TableColumn } from "@/lib/components/core/form/list"
import { useRegistroStore } from "../stores/registro-store"
import { EnvioRegistro } from "./envio-registros"
import type { Registro } from "../types/notificacion-desplazamiento-trabajador-types"
import { SubEmpresaOptions } from "@/lib/options/codigo-subempresa"
import { departamentosDaneOptions, getMunicipiosDaneOptionsByDepartamento } from "@/lib/components/independiente-con-contrato/options/index"
import { tiposVinculacionOptions } from "../options/tipos-vinculacion"

export function ListaRegistros() {
  const [openDialog, setOpenDialog] = useState(false)
  const {
    registros,
    eliminarRegistro,
    setRegistroEditando,
    limpiarTodosLosRegistros,
  } = useRegistroStore()

  // Función para obtener el label del código de subempresa
  const getSubempresaLabel = (codigo: string) => {
    if (!codigo) return "-"
    const subempresa = SubEmpresaOptions.find(option => option.value === codigo)
    return subempresa ? subempresa.label : codigo
  }

  // Función para obtener el label del departamento
  const getDepartamentoLabel = (codigo: string) => {
    if (!codigo) return "-"
    const departamento = departamentosDaneOptions.find(option => option.value === codigo)
    return departamento ? departamento.label : codigo
  }

  // Función para obtener el label del municipio
  const getMunicipioLabel = (departamentoCodigo: string, municipioCodigo: string) => {
    if (!municipioCodigo || !departamentoCodigo) return "-"
    const municipios = getMunicipiosDaneOptionsByDepartamento(departamentoCodigo)
    const municipio = municipios.find(option => option.value === municipioCodigo)
    return municipio ? municipio.label : `${municipioCodigo} (no encontrado)`
  }

  // Función para obtener el label del tipo de vinculación
  const getVinculacionLabel = (codigo: string) => {
    if (!codigo) return "-"
    const vinculacion = tiposVinculacionOptions.find(option => option.value === codigo)
    return vinculacion ? vinculacion.label : codigo
  }

  const columns: TableColumn[] = [
    {
      key: "documentoTrabajador",
      label: "Documento Trabajador",
      render: (_, record: Registro) => (
        <div>
          <div className="font-medium">{record.tipo_documento_trabajador}</div>
          <div className="text-sm text-gray-500">{record.documento_trabajador}</div>
        </div>
      ),
    },
    {
      key: "documentoEmpleador",
      label: "Documento Empleador",
      render: (_, record: Registro) => (
        <div>
          <div className="font-medium">{record.tipo_documento_empleador}</div>
          <div className="text-sm text-gray-500">{record.documento_empleador}</div>
        </div>
      ),
    },
    {
      key: "codigoSubempresa",
      label: "Código Subempresa",
      render: (_, record: Registro) => (
        <div className="font-medium truncate max-w-[100px]" title={getSubempresaLabel(record.codigo_subempresa)}>
          {getSubempresaLabel(record.codigo_subempresa)}
        </div>
      ),
    },
    {
      key: "tipoVinculacion",
      label: "Tipo de Vinculación",
      render: (_, record: Registro) => (
        <div className="font-medium">
          {getVinculacionLabel(record.tipo_vinculacion)}
        </div>
      ),
    },
    {
      key: "fechasDesplazamiento",
      label: "Fechas Desplazamiento",
      render: (_, record: Registro) => (
        <div>
          <div className="font-medium">
            {record.fecha_inicio_desplazamiento ? new Date(record.fecha_inicio_desplazamiento).toLocaleDateString('es-ES') : "-"}
          </div>
          <div className="text-sm text-gray-500">
            {record.fecha_fin_desplazamiento ? new Date(record.fecha_fin_desplazamiento).toLocaleDateString('es-ES') : "-"}
          </div>
        </div>
      ),
    },
    {
      key: "departamentoMunicipio",
      label: "Departamento/Municipio",
      render: (_, record: Registro) => (
        <div>
          <div className="font-medium">{getDepartamentoLabel(record.codigo_departamento)}</div>
          <div className="text-sm text-gray-500">{getMunicipioLabel(record.codigo_departamento, record.codigo_municipio)}</div>
        </div>
      ),
    },
    {
      key: "motivoDesplazamiento",
      label: "Motivo del Desplazamiento",
      render: (_, record: Registro) => (
        <div className="font-medium max-w-xs truncate" title={record.motivo_desplazamiento}>
          {record.motivo_desplazamiento || "-"}
        </div>
      ),
    },
  ]

  const extraHeader = (
    <Button
      onClick={() => setOpenDialog(true)}
      className="flex items-center gap-2 w-full text-white bg-orange-500 hover:bg-orange-600"
    >
      <Send className="h-4 w-4" />
      Enviar a Base de Datos
    </Button>
  )

  return (
    <div className="space-y-4" data-testid="lista-registros">
      <ListWrapper
        title="Registros Guardados"
        data={registros}
        columns={columns}
        onEdit={setRegistroEditando}
        onDelete={eliminarRegistro}
        onClearAll={limpiarTodosLosRegistros}
        emptyMessage="No hay registros guardados"
        emptySubMessage="Complete el formulario arriba para agregar registros"
        className="relative"
        extraHeader={registros.length > 0 ? extraHeader : null}
      />

      <EnvioRegistro 
        registros={registros} 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
      />
    </div>
  )
} 
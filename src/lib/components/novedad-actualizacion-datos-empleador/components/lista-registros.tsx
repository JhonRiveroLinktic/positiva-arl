"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/lib/components/ui/button"
import { ListWrapper, TableColumn } from "@/lib/components/core/form/list"
import { useRegistroStore } from "../stores/registro-store"
import { EnvioRegistro } from "./envio-registros"
import type { Registro } from "../types/novedad-actualizacion-datos-empleador-types"
import { SubEmpresaOptions } from "@/lib/options/codigo-subempresa"
import { departamentosDaneOptions, getMunicipiosDaneOptionsByDepartamento } from "@/lib/components/independiente-con-contrato/options/index"

export function ListaRegistros() {
  const [openDialog, setOpenDialog] = useState(false)
  const {
    registros,
    eliminarRegistro,
    setRegistroEditando,
    limpiarTodosLosRegistros,
  } = useRegistroStore()

  const getSubempresaLabel = (codigo: string) => {
    if (!codigo) return "-"
    const subempresa = SubEmpresaOptions.find(option => option.value === codigo)
    return subempresa ? subempresa.label : codigo
  }

  const getDepartamentoLabel = (codigo: string) => {
    if (!codigo) return "-"
    const departamento = departamentosDaneOptions.find(option => option.value === codigo)
    return departamento ? departamento.label : codigo
  }

  const getMunicipioLabel = (departamentoCodigo: string, municipioCodigo: string) => {
    if (!municipioCodigo || !departamentoCodigo) return "-"
    const municipios = getMunicipiosDaneOptionsByDepartamento(departamentoCodigo)
    const municipio = municipios.find(option => option.value === municipioCodigo)
    return municipio ? municipio.label : `${municipioCodigo} (no encontrado)`
  }

  const columns: TableColumn[] = [
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
        <div className="font-medium truncate max-w-[100px]">
          {getSubempresaLabel(record.codigo_subempresa)}
        </div>
      ),
    },
    {
      key: "contacto",
      label: "Contacto",
      render: (_, record: Registro) => (
        <div>
          <div className="font-medium">{record.correo_electronico || "-"}</div>
          <div className="text-sm text-gray-500">{record.telefono || "-"}</div>
        </div>
      ),
    },
    {
      key: "direccion",
      label: "Dirección",
      render: (_, record: Registro) => (
        <div className="font-medium">
          {record.direccion || "-"}
        </div>
      ),
    },
    {
      key: "departamentoMunicipio",
      label: "Departamento/Municipio",
      render: (_, record: Registro) => (
        <div>
          <div className="font-medium">{getDepartamentoLabel(record.departamento)}</div>
          <div className="text-sm text-gray-500">{getMunicipioLabel(record.departamento, record.municipio)}</div>
        </div>
      ),
    },
    {
      key: "representanteLegal",
      label: "Representante Legal",
      render: (_, record: Registro) => (
        <div>
          <div className="text-sm text-gray-500">
            {record.tipo_documento_representante_legal && record.documento_representante_legal 
              ? `${record.tipo_documento_representante_legal} ${record.documento_representante_legal}`
              : "-"}
          </div>
          <div className="text-sm text-gray-500">
            {record.primer_nombre_representante_legal && record.primer_apellido_representante_legal
              ? `${record.primer_nombre_representante_legal} ${record.segundo_nombre_representante_legal || ""} ${record.primer_apellido_representante_legal} ${record.segundo_apellido_representante_legal || ""}`.trim()
              : "-"}
          </div>
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
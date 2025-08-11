"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/lib/components/ui/button"
import { ListWrapper, TableColumn } from "@/lib/components/core/form/list"
import { useRegistroStore } from "../stores/registro-store"
import { EnvioRegistro } from "./envio-registros"
import type { Registro } from "../types/novedad-sede-empleador-types"
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
      key: "nombreSede",
      label: "Nombre de la Sede",
      render: (_, record: Registro) => (
        <div className="font-medium">
          {record.nombre_sede}
        </div>
      ),
    },
    {
      key: "departamentoMunicipioSede",
      label: "Departamento/Municipio Sede",
      render: (_, record: Registro) => (
        <div>
          <div className="font-medium">{getDepartamentoLabel(record.codigo_dane_departamento_sede)}</div>
          <div className="text-sm text-gray-500">{getMunicipioLabel(record.codigo_dane_departamento_sede, record.codigo_dane_municipio_sede)}</div>
        </div>
      ),
    },
    {
      key: "contactoSede",
      label: "Contacto Sede",
      render: (_, record: Registro) => (
        <div>
          <div className="font-medium">{record.telefono_sede || "-"}</div>
          <div className="text-sm text-gray-500">{record.correo_electronico_sede || "-"}</div>
        </div>
      ),
    },
    {
      key: "direccionSede",
      label: "Dirección Sede",
      render: (_, record: Registro) => (
        <div className="font-medium">
          {record.direccion_sede || "-"}
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
"use client"

import { useState } from "react"
import { Send, File, Paperclip } from "lucide-react"
import { Button } from "@/lib/components/ui/button"
import { ListWrapper, TableColumn } from "@/lib/components/core/form/list"
import { useRegistroStore } from "../stores/registro-store"
import { EnvioRegistro } from "./envio-registros"
import { AdjuntarDocumentos } from "./adjuntar-documentos"
import type { Registro } from "../types/afiliacion-empleador-types"

export function ListaRegistros() {
  const [openDialog, setOpenDialog] = useState(false)
  const [openAdjuntarDialog, setOpenAdjuntarDialog] = useState(false)
  const [registroSeleccionado, setRegistroSeleccionado] = useState<Registro | null>(null)
  const {
    registros,
    eliminarRegistro,
    setRegistroEditando,
    limpiarTodosLosRegistros,
  } = useRegistroStore()

  const handleAdjuntarDocumentos = (registro: Registro) => {
    setRegistroSeleccionado(registro)
    setOpenAdjuntarDialog(true)
  }

  const columns: TableColumn[] = [
    {
      key: "documentoEmpleador",
      label: "Documento Empleador",
      render: (_, record: Registro) => (
        <div>
          <div className="font-medium">{record.tipoDocEmpleador}</div>
          <div className="text-sm text-gray-500">{record.documentoEmpleador}</div>
        </div>
      ),
    },
    {
      key: "razonSocialEmpleador",
      label: "Razón Social",
      render: (_, record: Registro) => (
        <div>
          <div className="font-medium">{record.razonSocialEmpleador}</div>
          <div className="text-sm text-gray-500">{record.digitoVerificacionEmpleador}</div>
        </div>
      ),
    },
    {
      key: "ubicacionEmpleador",
      label: "Ubicación Empleador",
      render: (_, record: Registro) => (
        <div>
          <div className="font-medium">{record.departamentoEmpleador}</div>
          <div className="text-sm text-gray-500">{record.municipioEmpleador}</div>
        </div>
      ),
    },
    {
      key: "actEconomicaPrincipalEmpleador",
      label: "Actividad Económica",
      render: (_, record: Registro) => (
        <span>{record.actEconomicaPrincipalEmpleador}</span>
      ),
    },
    {
      key: "fechaRadicacion",
      label: "Fecha Radicación",
      render: (_, record: Registro) => (
        <span>{record.fechaRadicacion ? new Date(record.fechaRadicacion).toLocaleDateString('es-ES') : ''}</span>
      ),
    },
    {
      key: "origen",
      label: "Origen",
      render: (_, record: Registro) => (
        <span>{record.origen}</span>
      ),
    },
    {
      key: "representanteLegal",
      label: "Representante Legal",
      render: (_, record: Registro) => (
        <div>
          <div className="font-medium">
            {record.primerNombreRepresentanteLegal} {record.primerApellidoRepresentanteLegal}
          </div>
          <div className="text-sm text-gray-500">{record.tipoDocRepresentanteLegal} {record.numeDocRepresentanteLegal}</div>
        </div>
      ),
    },
    {
      key: "archivos",
      label: "Documentos",
      render: (_, record: Registro) => {
        const archivos = record.archivos || []
        return (
          <div className="flex items-center gap-2">
            <File className="h-4 w-4 text-gray-400" />
            <span className="text-sm">
              {archivos.length > 0 ? `${archivos.length} archivo(s)` : "Sin archivos"}
            </span>
          </div>
        )
      },
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

  const getCustomActions = (record: Registro) => [
    {
      label: "Adjuntar Documentos",
      icon: <Paperclip className="h-4 w-4" />,
      onClick: () => handleAdjuntarDocumentos(record),
      variant: "outline" as const,
    },
  ]

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
        customActions={getCustomActions}
      />

      <EnvioRegistro 
        registros={registros} 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
      />

      {registroSeleccionado && (
        <AdjuntarDocumentos
          registro={registroSeleccionado}
          open={openAdjuntarDialog}
          onClose={() => {
            setOpenAdjuntarDialog(false)
            setRegistroSeleccionado(null)
          }}
        />
      )}
    </div>
  )
}
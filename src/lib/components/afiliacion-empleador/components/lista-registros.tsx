"use client"

import { useState } from "react"
import { Send, File, Paperclip } from "lucide-react"
import { Button } from "@/lib/components/ui/button"
import { ListWrapper, TableColumn } from "@/lib/components/core/form/list"
import { useRegistroStore } from "../stores/registro-store"
import { EnvioRegistro } from "./envio-registros"
import { AdjuntarDocumentos } from "./adjuntar-documentos"
import type { RegistroCompleto } from "../types/afiliacion-empleador-types"

export function ListaRegistros() {
  const [openDialog, setOpenDialog] = useState(false)
  const [openAdjuntarDialog, setOpenAdjuntarDialog] = useState(false)
  const [registroSeleccionado, setRegistroSeleccionado] = useState<RegistroCompleto | null>(null)
  const {
    registros,
    eliminarRegistro,
    setRegistroEditando,
    limpiarTodosLosRegistros,
  } = useRegistroStore()

  const handleAdjuntarDocumentos = (registro: RegistroCompleto) => {
    setRegistroSeleccionado(registro)
    setOpenAdjuntarDialog(true)
  }

  const columns: TableColumn[] = [
    {
      key: "documentoEmpleador",
      label: "Documento Empleador",
      render: (_, record: RegistroCompleto) => {
        const tipoDoc = record.empleadorDatos?.tipoDocEmpleador || (record as any).tipoDocEmpleador
        const documento = record.empleadorDatos?.documentoEmpleador || (record as any).documentoEmpleador
        
        return (
          <div>
            <div className="font-medium">{tipoDoc}</div>
            <div className="text-sm text-gray-500">{documento}</div>
          </div>
        )
      },
    },
    {
      key: "razonSocialEmpleador",
      label: "Razón Social",
      render: (_, record: RegistroCompleto) => (
        <div>
          <div className="font-medium">{record.empleadorDatos?.razonSocialEmpleador || (record as any).razonSocialEmpleador}</div>
          <div className="text-sm text-gray-500">{record.empleadorDatos?.digitoVerificacionEmpleador || (record as any).digitoVerificacionEmpleador}</div>
        </div>
      ),
    },
    {
      key: "ubicacionEmpleador",
      label: "Ubicación Empleador",
      render: (_, record: RegistroCompleto) => (
        <div>
          <div className="font-medium">{record.empleadorDatos?.departamentoEmpleador || (record as any).departamentoEmpleador}</div>
          <div className="text-sm text-gray-500">{record.empleadorDatos?.municipioEmpleador || (record as any).municipioEmpleador}</div>
        </div>
      ),
    },
    {
      key: "actEconomicaPrincipalEmpleador",
      label: "Actividad Económica",
      render: (_, record: RegistroCompleto) => (
        <span>{record.empleadorDatos?.actEconomicaPrincipalEmpleador || (record as any).actEconomicaPrincipalEmpleador}</span>
      ),
    },
    {
      key: "fechaRadicacion",
      label: "Fecha Radicación",
      render: (_, record: RegistroCompleto) => {
        const fecha = record.empleadorDatos?.fechaRadicacion || (record as any).fechaRadicacion
        return (
          <span>{fecha ? new Date(fecha).toLocaleDateString('es-ES') : ''}</span>
        )
      },
    },
    {
      key: "origen",
      label: "Origen",
      render: (_, record: RegistroCompleto) => (
        <span>{record.empleadorDatos?.origen || (record as any).origen}</span>
      ),
    },
    {
      key: "representanteLegal",
      label: "Representante Legal",
      render: (_, record: RegistroCompleto) => (
        <div>
          <div className="font-medium">
            {(record.representanteLegal?.primerNombre || (record as any).primerNombre)} {(record.representanteLegal?.primerApellido || (record as any).primerApellido)}
          </div>
          <div className="text-sm text-gray-500">{(record.representanteLegal?.tipoDoc || (record as any).tipoDoc)} {(record.representanteLegal?.documento || (record as any).documento)}</div>
        </div>
      ),
    },
    {
      key: "sedes",
      label: "Sedes",
      render: (_, record: RegistroCompleto) => {
        const sedes = record.sedes || []
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{sedes.length}</span>
            <span className="text-xs text-gray-500">sede(s)</span>
          </div>
        )
      },
    },
    {
      key: "centrosTrabajo",
      label: "Centros de Trabajo",
      render: (_, record: RegistroCompleto) => {
        const centros = record.centrosTrabajo || []
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{centros.length}</span>
            <span className="text-xs text-gray-500">centro(s)</span>
          </div>
        )
      },
    },
    {
      key: "archivos",
      label: "Documentos",
      render: (_, record: RegistroCompleto) => {
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

  const getCustomActions = (record: RegistroCompleto) => [
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
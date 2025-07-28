"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/lib/components/ui/button"
import { ListWrapper, TableColumn } from "@/lib/components/core/form/list"
import { useRegistroStore } from "../stores/retiro-trabajador-store"
import { EnvioRegistro } from "./envio-registros"
import type { Registro } from "../types/retiro-trabajador"
import { TIPOS_VINCULACION } from "@/lib/options/tipos-vinculacion"

export function ListaRegistros() {
  const [openDialog, setOpenDialog] = useState(false)
  const {
    registros,
    eliminarRegistro,
    setRegistroEditando,
    limpiarTodosLosRegistros,
  } = useRegistroStore()

  const columns: TableColumn[] = [
    {
      key: "empleador",
      label: "Empleador",
      render: (_, record: Registro) => (
        <div>
          <div className="font-medium">{record.tipoDocEmp}</div>
          <div className="text-sm text-gray-500">{record.numeDocEmp}</div>
        </div>
      ),
    },
    {
      key: "trabajador",
      label: "Trabajador",
      render: (_, record: Registro) => (
        <div>
          <div className="font-medium">{record.tipoDocPersona}</div>
          <div className="text-sm text-gray-500">{record.numeDocPersona}</div>
        </div>
      ),
    },
    {
      key: "tipoVinculacion",
      label: "Tipo de Vinculación",
      render: (_, record: Registro) => {
        const tipo = TIPOS_VINCULACION.find(t => t.value === record.tipoVinculacion)
        return <span>{tipo ? tipo.label : record.tipoVinculacion}</span>
      },
    },
    {
      key: "fechaRetiroTrabajador",
      label: "Fecha Retiro Trabajador",
      render: (_, record: Registro) => (
        <span>{record.fechaRetiroTrabajador ? new Date(record.fechaRetiroTrabajador).toLocaleDateString('es-ES') : ''}</span>
      ),
    },
    { key: "correoNotificacion", label: "Correo de Notificación" },
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
        maxHeight="60vh"
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
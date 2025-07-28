"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/lib/components/ui/button"
import { ListWrapper, TableColumn } from "@/lib/components/core/form/list"
import { useRegistroStore } from "../stores/fecha-cambios-store"
import { EnvioRegistro } from "./envio-registros"
import type { Registro } from "../types/fecha-cambios"

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
      key: "fechas",
      label: "Fechas de Contrato",
      render: (_, record: Registro) => (
        <div>
          <div className="font-medium">Inicio: {record.fechaInicioContrato?.toLocaleDateString('es-ES')}</div>
          <div className="text-sm text-gray-500">Fin: {record.fechaFinContrato?.toLocaleDateString('es-ES')}</div>
        </div>
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
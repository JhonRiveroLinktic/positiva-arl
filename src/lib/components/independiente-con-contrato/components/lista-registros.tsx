"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/lib/components/ui/button"
import { ListWrapper, TableColumn } from "@/lib/components/core/form/list"
import { useRegistroStore } from "../stores/registro-store"
import { EnvioRegistro } from "./envio-registros"
import type { Registro } from "../types/independiente-types"

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
      key: "documento",
      label: "Documento Trabajador",
      render: (_, record: Registro) => (
        <div>
          <div className="font-medium">{record.tipoDocTrabajador}</div>
          <div className="text-sm text-gray-500">{record.numeDocTrabajador}</div>
        </div>
      ),
    },
    {
      key: "nombreCompleto",
      label: "Nombre Trabajador",
      render: (_, record: Registro) => (
        <div>
          <div className="font-medium capitalize">
            {record.nombre1Trabajador} {record.nombre2Trabajador} {record.apellido1Trabajador}{" "}
            {record.apellido2Trabajador}
          </div>
          <div className="text-sm text-gray-500">{record.sexoTrabajador}</div>
        </div>
      ),
    },
    {
      key: "fechaNacimientoTrabajador",
      label: "Fecha Nacimiento",
      render: (_, record: Registro) => (
        <span>{record.fechaNacimientoTrabajador ? new Date(record.fechaNacimientoTrabajador).toLocaleDateString('es-ES') : ''}</span>
      ),
    },
    { key: "cargoOcupacion", label: "Cargo/Ocupación" },
    { key: "tipoContrato", label: "Tipo Contrato" },
    {
      key: "valorTotalContrato",
      label: "Valor Contrato",
      render: (value: number) =>
        `${value}`,
    },
    {
      key: "fechaInicioContrato",
      label: "Fecha Inicio",
      render: (_, record: Registro) => (
        <span>{record.fechaInicioContrato ? new Date(record.fechaInicioContrato).toLocaleDateString('es-ES') : ''}</span>
      ),
    },
    {
      key: "fechaFinContrato",
      label: "Fecha Fin",
      render: (_, record: Registro) => (
        <span>{record.fechaFinContrato ? new Date(record.fechaFinContrato).toLocaleDateString('es-ES') : ''}</span>
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
"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/lib/components/ui/button"
import { ListWrapper, TableColumn } from "@/lib/components/core/form/list"
import { useRegistroStore } from "../stores/registro-store"
import { EnvioRegistro } from "./envio-registros"
import type { Registro } from "../types/arl-registration"

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
      label: "Documento",
      render: (_, record: Registro) => (
        <div>
          <div className="font-medium">{record.tipoDocPersona}</div>
          <div className="text-sm text-gray-500">{record.numeDocPersona}</div>
        </div>
      ),
    },
    {
      key: "nombreCompleto",
      label: "Nombre Completo",
      render: (_, record: Registro) => (
        <div>
          <div className="font-medium">
            {record.nombre1} {record.nombre2} {record.apellido1}{" "}
            {record.apellido2}
          </div>
          <div className="text-sm text-gray-500">{record.sexo}</div>
        </div>
      ),
    },
    { key: "fechaNacimiento", label: "Fecha Nacimiento" },
    { key: "codigoMuniResidencia", label: "Municipio" },
    { key: "codigoEPS", label: "EPS" },
    { key: "codigoOcupacion", label: "Ocupación" },
    {
      key: "salario",
      label: "Salario",
      render: (value: string) =>
        `$${Number.parseInt(value).toLocaleString("es-CO")}`,
    },
  ]

  const extraHeader = (
    <Button
      onClick={() => setOpenDialog(true)}
      className="flex items-center gap-2 bg-orange-500 w-full hover:bg-orange-600 text-white"
    >
      <Send className="h-4 w-4" />
      Enviar a Base de Datos
    </Button>
  )

  return (
    <div className="space-y-4">
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

      <EnvioRegistro registros={registros} open={openDialog} onClose={() => setOpenDialog(false)} />
    </div>
  )
}
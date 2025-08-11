"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/lib/components/ui/button"
import { ListWrapper, TableColumn } from "@/lib/components/core/form/list"
import { useRegistroStore } from "../stores/registro-store"
import { EnvioRegistro } from "./envio-registros"
import type { CambioOcupacionIndependienteVoluntarioFormData } from "../types/cambio-ocupacion-types"

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
      key: "tipoNovedad",
      label: "Tipo de Novedad",
      render: (_, record: CambioOcupacionIndependienteVoluntarioFormData) => (
        <div className="font-medium capitalize">{record.tipo_novedad}</div>
      ),
    },
    {
      key: "documentoTrabajador",
      label: "Documento Trabajador",
      render: (_, record: CambioOcupacionIndependienteVoluntarioFormData) => (
        <div>
          <div className="font-medium">{record.tipo_doc_trabajador}</div>
          <div className="text-sm text-gray-500">{record.documento_trabajador}</div>
        </div>
      ),
    },
    {
      key: "ocupacion",
      label: "Ocupación",
      render: (_, record: CambioOcupacionIndependienteVoluntarioFormData) => (
        <div className="font-medium">{record.nueva_ocupacion}</div>
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
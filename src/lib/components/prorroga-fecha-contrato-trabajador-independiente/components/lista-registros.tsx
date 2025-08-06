"use client"

import { useState } from "react"
import { ListWrapper } from "@/lib/components/core/form/list/list-wrapper"
import { Button } from "@/lib/components/ui/button"
import { useRegistroStore } from "../stores/registro-store"
import { EnvioRegistro } from "./envio-registros"
import { Send } from "lucide-react"
import type { Registro } from "../types/prorroga-fecha-contrato-types"

export function ListaRegistros() {
  const { registros, eliminarRegistro, limpiarTodosLosRegistros, setRegistroEditando } = useRegistroStore()
  const [openDialog, setOpenDialog] = useState(false)

  const columns = [
    {
      key: "tipo_doc_contratante",
      label: "Tipo Doc. Contratante",
      render: (value: string) => value
    },
    {
      key: "documento_contratante",
      label: "Documento Contratante",
      render: (value: string) => value
    },
    {
      key: "razon_social",
      label: "Razón Social",
      render: (value: string) => value
    },
    {
      key: "tipo_doc_trabajador",
      label: "Tipo Doc. Trabajador",
      render: (value: string) => value
    },
    {
      key: "documento_trabajador",
      label: "Documento Trabajador",
      render: (value: string) => value
    },
    {
      key: "fecha_fin_contrato_nueva",
      label: "Nueva Fecha Fin",
      render: (value: string) => value
    },
    {
      key: "valor_contrato_prorroga",
      label: "Valor Contrato",
      render: (value: string) => value ? `$${value}` : "-"
    }
  ]

  const extraHeader = (
    <Button
      onClick={() => setOpenDialog(true)}
      className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
    >
      <Send className="h-4 w-4" />
      Enviar Registros
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
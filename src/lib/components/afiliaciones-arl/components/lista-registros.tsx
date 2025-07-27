"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Send } from "lucide-react"
import { Button } from "@/lib/components/ui/button"
import { ListWrapper, TableColumn } from "@/lib/components/core/form/list"
import { useRegistroStore } from "../stores/registro-store"
import { EnvioRegistro } from "./envio-registros"
import type { Registro } from "../types/arl-registration"

export function ListaRegistros() {
  const [openDialog, setOpenDialog] = useState(false)
  const searchParams = useSearchParams()
  const {
    registros,
    eliminarRegistro,
    setRegistroEditando,
    limpiarTodosLosRegistros,
  } = useRegistroStore()

  // Verificar si existen los parámetros requeridos para habilitar el envío
  const nombre = searchParams.get("nombre")
  const correo = searchParams.get("correo")
  const typeDoc = searchParams.get("typeDoc")
  const numeroDoc = searchParams.get("numeroDoc")
  
  const canSubmit = Boolean(nombre && correo && typeDoc && numeroDoc)

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
    <>
      <Button
        onClick={() => setOpenDialog(true)}
        disabled={!canSubmit}
        className={`flex items-center gap-2 w-full text-white ${
          canSubmit 
            ? "bg-orange-500 hover:bg-orange-600" 
            : "bg-orange-400 !cursor-not-allowed"
        }`}
      >
        <Send className="h-4 w-4" />
        Enviar a Base de Datos
      </Button>
      {!canSubmit && (
        <div className="pt-4 px-2 text-sm text-center text-red-700 font-semibold">
        <p>No se encuentran los parámetros de ruta requeridos para enviar los registros.</p>
        </div>
      )}
    </>
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
        datosCreador={{
          nombre: nombre || "",
          correo: correo || "",
          telefono: searchParams.get("telefono") || "",
        }}
      />
    </div>
  )
}
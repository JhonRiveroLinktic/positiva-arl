"use client"

import { ListWrapper, TableColumn } from "@/lib/components/core/form/list"
import { useRegistroStore } from "../stores/registro-store"
import type { Registro } from "../types/arl-registration"

export function ListaRegistros() {
  const { registros, eliminarRegistro, setRegistroEditando, limpiarTodosLosRegistros } = useRegistroStore()

  const columns: TableColumn[] = [
    {
      key: "documento",
      label: "Documento",
      render: (_, record: Registro) => (
        <div>
          <div className="font-medium">{record.tipoDocPersona}</div>
          <div className="text-sm text-gray-500">{record.numeDocPersona}</div>
        </div>
      )
    },
    {
      key: "nombreCompleto",
      label: "Nombre Completo",
      render: (_, record: Registro) => (
        <div>
          <div className="font-medium">
            {record.nombre1} {record.nombre2} {record.apellido1} {record.apellido2}
          </div>
          <div className="text-sm text-gray-500">{record.sexo}</div>
        </div>
      )
    },
    {
      key: "fechaNacimiento",
      label: "Fecha Nacimiento"
    },
    {
      key: "codigoMuniResidencia",
      label: "Municipio"
    },
    {
      key: "codigoEPS",
      label: "EPS"
    },
    {
      key: "codigoOcupacion",
      label: "Ocupación"
    },
    {
      key: "salario",
      label: "Salario",
      render: (value: string) => `$${Number.parseInt(value).toLocaleString()}`
    }
  ]

  return (
    <ListWrapper
      title="Registros Guardados"
      data={registros}
      columns={columns}
      onEdit={setRegistroEditando}
      onDelete={eliminarRegistro}
      onClearAll={limpiarTodosLosRegistros}
      emptyMessage="No hay registros guardados"
      emptySubMessage="Complete el formulario arriba para agregar registros"
    />
  )
}
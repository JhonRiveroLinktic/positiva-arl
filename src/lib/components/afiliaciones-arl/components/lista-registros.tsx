"use client"

import { Button } from "@/lib/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/lib/components/ui/table"
import { useRegistroStore } from "../stores/registro-store"
import { toast } from "@/lib/utils/toast"
import { Edit, Trash2 } from "lucide-react"

export function ListaRegistros() {
  const { registros, eliminarRegistro, setRegistroEditando } = useRegistroStore()

  const handleDelete = (id: string, nombre: string) => {
    if (confirm(`¿Está seguro que desea eliminar el registro de ${nombre}? Esta acción no se puede deshacer.`)) {
      try {
        eliminarRegistro(id)
        toast.success({
          title: "Registro eliminado",
          description: `Se eliminó el registro de ${nombre}`,
        })
      } catch {
        toast.error({
          title: "Error al eliminar",
          description: "No se pudo eliminar el registro. Por favor intente nuevamente.",
        })
      }
    }
  }

  const handleEdit = (registro: any) => {
    setRegistroEditando(registro)
    toast.info({
      title: "Editando registro",
      description: `Editando el registro de ${registro.nombre1} ${registro.apellido1}`,
    })
  }

  if (registros.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay registros guardados</p>
        <p className="text-sm">Complete el formulario arriba para agregar registros</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto max-h-[70vh] overflow-y-auto rounded-lg border border-orange-100 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-gray-500 p-5">Documento</TableHead>
            <TableHead className="text-gray-500 p-5">Nombre Completo</TableHead>
            <TableHead className="text-gray-500 p-5">Fecha Nacimiento</TableHead>
            <TableHead className="text-gray-500 p-5">Municipio</TableHead>
            <TableHead className="text-gray-500 p-5">EPS</TableHead>
            <TableHead className="text-gray-500 p-5">Ocupación</TableHead>
            <TableHead className="text-gray-500 p-5">Salario</TableHead>
            <TableHead className="text-gray-500 p-5">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registros.map((registro) => (
            <TableRow key={registro.id} className="hover:bg-orange-50">
              <TableCell className="p-5">
                <div>
                  <div className="font-medium">{registro.tipoDocPersona}</div>
                  <div className="text-sm text-gray-500">{registro.numeDocPersona}</div>
                </div>
              </TableCell>
              <TableCell className="p-5">
                <div>
                  <div className="font-medium">
                    {registro.nombre1} {registro.nombre2} {registro.apellido1} {registro.apellido2}
                  </div>
                  <div className="text-sm text-gray-500">{registro.sexo}</div>
                </div>
              </TableCell>
              <TableCell className="p-5">{registro.fechaNacimiento}</TableCell>
              <TableCell className="p-5">{registro.codigoMuniResidencia}</TableCell>
              <TableCell className="p-5">{registro.codigoEPS}</TableCell>
              <TableCell className="p-5">{registro.codigoOcupacion}</TableCell>
              <TableCell className="p-5">${Number.parseInt(registro.salario).toLocaleString()}</TableCell>
              <TableCell className="p-5">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(registro)}
                    className="flex items-center cursor-pointer gap-1 border-orange-200 text-orange-600 hover:text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(registro.id, `${registro.nombre1} ${registro.apellido1}`)}
                    className="flex items-center cursor-pointer gap-1 hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Eliminar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
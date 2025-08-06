"use client"

import { Button } from "@/lib/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/lib/components/ui/table"
import { toast } from "@/lib/utils/toast"
import { AlertTriangle, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/lib/components/ui/dialog"
import { Alert, AlertDescription } from "@/lib/components/ui/alert"
export interface TableColumn {
  key: string
  label: string
  render?: (value: any, record: any) => React.ReactNode
}

export interface ListWrapperProps {
  title: string
  data: any[]
  columns: TableColumn[]
  onEdit?: (record: any) => void
  onDelete?: (id: string, record: any) => void
  onClearAll?: () => void
  emptyMessage?: string
  emptySubMessage?: string
  showActions?: boolean
  editButtonText?: string
  deleteButtonText?: string
  clearAllButtonText?: string
  className?: string
  extraHeader?: React.ReactNode
  customActions?: (record: any) => Array<{
    label: string
    icon: React.ReactNode
    onClick: () => void
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  }>
}

export function ListWrapper({
  title,
  data,
  columns,
  onEdit,
  onDelete,
  onClearAll,
  emptyMessage = "No hay registros guardados",
  emptySubMessage = "Complete el formulario arriba para agregar registros",
  showActions = true,
  editButtonText = "Editar",
  deleteButtonText = "Eliminar",
  clearAllButtonText = "Eliminar Todos",
  className = "",
  extraHeader,
  customActions
}: ListWrapperProps) {
  const handleDelete = (id: string, record: any) => {
    if (!onDelete) return
    try {
      onDelete(id, record)
      
      let recordDescription = "este registro"
      
      if (record.nombre1 && record.apellido1) {
        recordDescription = `${record.nombre1} ${record.apellido1}`
      } else if (record.documento_trabajador && record.tipo_doc_trabajador) {
        recordDescription = `${record.tipo_doc_trabajador} ${record.documento_trabajador}`
      } else if (record.documento_empleador && record.tipo_doc_empleador) {
        recordDescription = `${record.tipo_doc_empleador} ${record.documento_empleador}`
      } else if (record.name) {
        recordDescription = record.name
      } else if (record.title) {
        recordDescription = record.title
      }
      
      toast.success({
        title: "Registro eliminado",
        description: `Se eliminó el registro de ${recordDescription} correctamente`,
      })
    } catch {
      toast.error({
        title: "Error al eliminar",
        description: "No se pudo eliminar el registro. Por favor intente nuevamente.",
      })
    }
  }

  const handleEdit = (record: any) => {
    if (!onEdit) return

    onEdit(record)
    
    let recordDescription = "este registro"
    
    if (record.nombre1 && record.apellido1) {
      recordDescription = `${record.nombre1} ${record.apellido1}`
    } else if (record.documento_trabajador && record.tipo_doc_trabajador) {
      recordDescription = `${record.tipo_doc_trabajador} ${record.documento_trabajador}`
    } else if (record.documento_empleador && record.tipo_doc_empleador) {
      recordDescription = `${record.tipo_doc_empleador} ${record.documento_empleador}`
    } else if (record.name) {
      recordDescription = record.name
    } else if (record.title) {
      recordDescription = record.title
    }

    toast.info({
      title: "Editando registro",
      description: `Editando el registro de ${recordDescription}`,
    })
  }

  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 ${className}`}>
        <h2 className="text-2xl font-semibold text-gray-900">{title} ({data.length})</h2>
        <div className="text-center py-8 text-gray-500">
          <p>{emptyMessage}</p>
          <p className="text-sm">{emptySubMessage}</p>
        </div>  
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title} ({data.length})</h2>
        {onClearAll && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="lg"
                className="flex items-center cursor-pointer gap-2 hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                {clearAllButtonText}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Confirmar Eliminación
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertDescription>
                    <div className="space-y-2 text-black">
                      <p className="font-medium">¿Está seguro que desea eliminar TODOS los registros?</p>
                      <p className="text-sm">
                        Esta acción eliminará permanentemente{" "}
                        <strong>{data.length} registro{data.length !== 1 ? "s" : ""}</strong> y no se puede deshacer.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
              <DialogFooter className="gap-2 sm:justify-end">
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    variant="destructive"
                    className="flex items-center gap-2"
                    onClick={() => {
                      if (onClearAll) {
                        onClearAll()
                        toast.success({
                          title: "Registros eliminados",
                          description: "Todos los registros han sido eliminados correctamente.",
                        })
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Sí, Eliminar Todos
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      <div className={`overflow-x-auto !max-h-[60vh] overflow-y-auto rounded-lg border border-orange-100 bg-white`}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className="text-gray-500 p-5">
                  {column.label}
                </TableHead>
              ))}
              {showActions && (onEdit || onDelete || customActions) && (
                <TableHead className="text-gray-500 p-5">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((record) => (
              <TableRow key={record.id} className="hover:bg-orange-50">
                {columns.map((column) => (
                  <TableCell key={column.key} className="p-5">
                    {column.render 
                      ? column.render(record[column.key], record)
                      : record[column.key]
                    }
                  </TableCell>
                ))}
                {showActions && (onEdit || onDelete || customActions) && (
                  <TableCell className="p-5">
                    <div className="flex gap-2 flex-wrap">
                      {customActions && customActions(record).map((action, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant={action.variant || "outline"}
                          onClick={action.onClick}
                          className="flex items-center cursor-pointer gap-1"
                        >
                          {action.icon}
                          {action.label}
                        </Button>
                      ))}
                      {onEdit && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(record)}
                          className="flex items-center cursor-pointer gap-1 border-orange-200 text-orange-600 hover:text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-colors"
                        >
                          <Edit className="h-3 w-3" />
                          {editButtonText}
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(record.id, record)}
                          className="flex items-center cursor-pointer gap-1 hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                          {deleteButtonText}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-6 w-full">
        {extraHeader}
      </div>
    </div>
  )
}
"use client"

import { Controller, Control, FieldErrors, useFieldArray, useForm } from "react-hook-form"
import { useState } from "react"
import { FormInput } from "@/lib/components/core/form/form-input"
import { FormSelect } from "@/lib/components/core/form/form-select"
import { CentroTrabajoValidationRules } from "../../validations/validation-rules"
import { DocumentTypesOptions } from "../../options"
import { Button } from "@/lib/components/ui/button"
import { Trash2, Plus, Edit, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/lib/components/ui/dialog"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/lib/components/ui/table"
import { Badge } from "@/lib/components/ui/badge"
import { toast } from "@/lib/utils/toast"
import type { AfiliacionEmpleadorFormData } from "../../types/afiliacion-empleador-types"

interface DatosCentrosTrabajoProps {
  control: Control<AfiliacionEmpleadorFormData>
  errors: FieldErrors<AfiliacionEmpleadorFormData>
  watch: (name: keyof AfiliacionEmpleadorFormData) => any
  setValue: (name: keyof AfiliacionEmpleadorFormData, value: any) => void
}

interface CentroTrabajoFormData {
  tipoDocEmpleador: string
  documentoEmpleador: string
  subempresa: string
  idSubempresa: string
  actividadEconomica: string
  idSede: string
}

const initialCentroTrabajoFormData: CentroTrabajoFormData = {
  tipoDocEmpleador: "",
  documentoEmpleador: "",
  subempresa: "",
  idSubempresa: "",
  actividadEconomica: "",
  idSede: "",
}

export function DatosCentrosTrabajo({ control, watch }: DatosCentrosTrabajoProps) {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "centrosTrabajo",
  })

  const watchedSedes = watch("sedes") || []
  const watchedCentrosTrabajo = watch("centrosTrabajo") || []
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isViewing, setIsViewing] = useState(false)

  const centroTrabajoForm = useForm<CentroTrabajoFormData>({
    mode: "all",
    defaultValues: initialCentroTrabajoFormData,
  })

  const sedeOptions = watchedSedes.map((sede: any, index: number) => ({
    value: sede.id || `sede-${index}`,
    label: sede.nombreSede || `Sede #${index + 1}`
  }))

  const handleOpenModal = (index?: number, viewOnly = false) => {
    if (index !== undefined) {
      setEditingIndex(index)
      const centroData = watchedCentrosTrabajo[index]
      centroTrabajoForm.reset(centroData)
      setIsViewing(viewOnly)
    } else {
      setEditingIndex(null)
      centroTrabajoForm.reset(initialCentroTrabajoFormData)
      setIsViewing(false)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingIndex(null)
    setIsViewing(false)
    centroTrabajoForm.reset(initialCentroTrabajoFormData)
  }

  const handleSubmitCentroTrabajo = centroTrabajoForm.handleSubmit((data) => {
    try {
      if (editingIndex !== null) {
        update(editingIndex, data)
        handleCloseModal()
        toast.success({
          title: "Centro de trabajo actualizado",
          description: "El centro de trabajo se actualizó correctamente.",
        })
      } else {
        append(data)
        handleCloseModal()
        toast.success({
          title: "Centro de trabajo agregado",
          description: "El centro de trabajo se agregó correctamente.",
        })
      }
    } catch (error) {
      toast.error({
        title: "Error",
        description: "Ocurrió un error al guardar el centro de trabajo.",
      })
    }
  }, (errors) => {
    console.error("Errores de validación:", errors)
  })

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleSubmitCentroTrabajo()
  }

  const eliminarCentroTrabajo = (index: number) => {
    remove(index)
    toast.success({
      title: "Centro de trabajo eliminado",
      description: "El centro de trabajo se eliminó correctamente.",
    })
  }

  const getSedeLabel = (idSede: string) => {
    if (!idSede) return "Sede Principal"
    const sede = sedeOptions.find((s: { value: string }) => s.value === idSede)
    return sede?.label || "Sede Principal"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap flex-row items-center justify-between border-b w-full pb-4 gap-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Centros de Trabajo
        </h3>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2"
              variant="outline"
              disabled={sedeOptions.length === 0}
            >
              <Plus className="h-4 w-4" />
              Agregar Centro de Trabajo
            </Button>
          </DialogTrigger>
          <DialogContent className="!min-w-11/12 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingIndex !== null 
                  ? (isViewing ? "Ver Centro de Trabajo" : "Editar Centro de Trabajo") 
                  : "Agregar Nuevo Centro de Trabajo"
                }
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleModalSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
                <Controller
                  name="tipoDocEmpleador"
                  control={centroTrabajoForm.control}
                  rules={CentroTrabajoValidationRules.tipoDocEmpleador}
                  render={({ field, fieldState }) => (
                    <FormSelect
                      label="Tipo Documento Empleador"
                      placeholder="Seleccionar tipo"
                      options={DocumentTypesOptions.filter((i: { value: string }) => ["N", "NI"].includes(i.value))}
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      required
                      disabled={isViewing}
                    />
                  )}
                />

                <Controller
                  name="documentoEmpleador"
                  control={centroTrabajoForm.control}
                  rules={CentroTrabajoValidationRules.documentoEmpleador}
                  render={({ field, fieldState }) => (
                    <FormInput
                      label="Documento Empleador"
                      placeholder="Número documento empleador"
                      value={field.value || ""}
                      onChange={field.onChange}
                      maxLength={20}
                      onBlur={field.onBlur}
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      required
                      disabled={isViewing}
                    />
                  )}
                />

                <Controller
                  name="subempresa"
                  control={centroTrabajoForm.control}
                  rules={CentroTrabajoValidationRules.subempresa}
                  render={({ field, fieldState }) => (
                    <FormInput
                      label="Subempresa"
                      placeholder="Nombre de la subempresa"
                      value={field.value || ""}
                      onChange={field.onChange}
                      maxLength={200}
                      onBlur={field.onBlur}
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      disabled={isViewing}
                    />
                  )}
                />

                <Controller
                  name="idSubempresa"
                  control={centroTrabajoForm.control}
                  rules={CentroTrabajoValidationRules.idSubempresa}
                  render={({ field, fieldState }) => (
                    <FormInput
                      label="ID Subempresa"
                      placeholder="Identificador de la subempresa"
                      value={field.value || ""}
                      onChange={field.onChange}
                      maxLength={20}
                      onBlur={field.onBlur}
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      disabled={isViewing}
                    />
                  )}
                />

                <Controller
                  name="actividadEconomica"
                  control={centroTrabajoForm.control}
                  rules={CentroTrabajoValidationRules.actividadEconomica}
                  render={({ field, fieldState }) => (
                    <FormInput
                      label="Actividad Económica"
                      placeholder="Código actividad económica"
                      value={field.value || ""}
                      onChange={field.onChange}
                      maxLength={10}
                      onBlur={field.onBlur}
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      required
                      disabled={isViewing}
                    />
                  )}
                />

                <Controller
                  name="idSede"
                  control={centroTrabajoForm.control}
                  rules={CentroTrabajoValidationRules.idSede}
                  render={({ field, fieldState }) => (
                    <FormSelect
                      label="Sede Asociada"
                      placeholder="Seleccionar sede"
                      options={sedeOptions}
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      disabled={sedeOptions.length === 0 || isViewing}
                    />
                  )}
                />
              </div>

              {sedeOptions.length === 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Debe agregar al menos una sede antes de poder asignar centros de trabajo.
                  </p>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                {!isViewing && sedeOptions.length > 0 && (
                  <Button type="submit">
                    {editingIndex !== null ? "Actualizar Centro de Trabajo" : "Agregar Centro de Trabajo"}
                  </Button>
                )}
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No hay centros de trabajo agregados. Haga clic en &quot;Agregar Centro de Trabajo&quot; para comenzar.</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Centros de Trabajo Registrados ({fields.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Subempresa</TableHead>
                  <TableHead>ID Subempresa</TableHead>
                  <TableHead>Actividad Económica</TableHead>
                  <TableHead>Sede Asociada</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => {
                  const centro = watchedCentrosTrabajo[index]
                  return (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{centro?.subempresa || "N/A"}</TableCell>
                      <TableCell>{centro?.idSubempresa || "N/A"}</TableCell>
                      <TableCell>{centro?.actividadEconomica || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={centro?.idSede ? "default" : "secondary"}>
                          {getSedeLabel(centro?.idSede || "")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenModal(index, true)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenModal(index, false)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => eliminarCentroTrabajo(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
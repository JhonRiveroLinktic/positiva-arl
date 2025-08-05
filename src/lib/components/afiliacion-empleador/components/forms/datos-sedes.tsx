"use client"

import { Controller, Control, FieldErrors, useFieldArray, useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { FormInput } from "@/lib/components/core/form/form-input"
import { FormSelect } from "@/lib/components/core/form/form-select"
import { FormDatePicker } from "@/lib/components/core/form/form-datepicker"
import { SedeValidationRules } from "../../validations/validation-rules"
import { 
  DocumentTypesOptions,
  departamentosDaneOptions,
  getMunicipiosDaneOptionsByDepartamento,
} from "../../options"
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
import type { Sede, AfiliacionEmpleadorFormData } from "../../types/afiliacion-empleador-types"

interface DatosSedesProps {
  control: Control<AfiliacionEmpleadorFormData>
  errors: FieldErrors<AfiliacionEmpleadorFormData>
  watch: (name: keyof AfiliacionEmpleadorFormData) => any
  setValue: (name: keyof AfiliacionEmpleadorFormData, value: any) => void
}

interface SedeFormData {
  tipoDocEmpleador: string
  documentoEmpleador: string
  subempresa: string
  departamento: string
  municipio: string
  actividadEconomica: string
  fechaRadicacion: string
  nombreSede: string
  direccion: string
  zona: string
  telefono: string
  correoElectronico: string
  tipoDocResponsable: string
  documentoResponsable: string
  sedeMision: string
  tipoDocSedeMision: string
  documentoSedeMision: string
}

const initialSedeFormData: SedeFormData = {
  tipoDocEmpleador: "",
  documentoEmpleador: "",
  subempresa: "",
  departamento: "",
  municipio: "",
  actividadEconomica: "",
  fechaRadicacion: "",
  nombreSede: "",
  direccion: "",
  zona: "",
  telefono: "",
  correoElectronico: "",
  tipoDocResponsable: "",
  documentoResponsable: "",
  sedeMision: "",
  tipoDocSedeMision: "",
  documentoSedeMision: "",
}

export function DatosSedes({ control, errors, watch, setValue }: DatosSedesProps) {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "sedes",
  })

  const watchedSedes = watch("sedes") || []
  const [departamentoStates, setDepartamentoStates] = useState<Record<number, string>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isViewing, setIsViewing] = useState(false)

  const sedeForm = useForm<SedeFormData>({
    mode: "all",
    defaultValues: initialSedeFormData,
  })

  const zonaOptions = [
    { value: "U", label: "U - URBANO" },
    { value: "R", label: "R - RURAL" }
  ]

  const handleOpenModal = (index?: number, viewOnly = false) => {
    if (index !== undefined) {
      setEditingIndex(index)
      const sedeData = watchedSedes[index]
      sedeForm.reset(sedeData)
      setIsViewing(viewOnly)
    } else {
      setEditingIndex(null)
      sedeForm.reset(initialSedeFormData)
      setIsViewing(false)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingIndex(null)
    setIsViewing(false)
    sedeForm.reset(initialSedeFormData)
  }

  const handleSubmitSede = sedeForm.handleSubmit((data) => {
    try {
      if (editingIndex !== null) {
        // Actualizar sede existente
        update(editingIndex, data)
        toast.success({
          title: "Sede actualizada",
          description: "La sede se actualizó correctamente.",
        })
      } else {
        // Agregar nueva sede
        append(data)
        toast.success({
          title: "Sede agregada",
          description: "La sede se agregó correctamente.",
        })
      }
      handleCloseModal()
    } catch (error) {
      toast.error({
        title: "Error",
        description: "Ocurrió un error al guardar la sede.",
      })
    }
  }, (errors) => {
    toast.error({
      title: "Error de validación",
      description: "Por favor corrija los errores en el formulario.",
    })
  })

  const eliminarSede = (index: number) => {
    remove(index)
    const newStates = { ...departamentoStates }
    delete newStates[index]
    setDepartamentoStates(newStates)
    toast.success({
      title: "Sede eliminada",
      description: "La sede se eliminó correctamente.",
    })
  }

  // Manejar cambios de departamento para cada sede
  useEffect(() => {
    if (watchedSedes) {
      watchedSedes.forEach((sede: Sede, index: number) => {
        const currentDepartamento = sede?.departamento
        const savedDepartamento = departamentoStates[index]
        
        if (currentDepartamento !== savedDepartamento) {
          setDepartamentoStates(prev => ({
            ...prev,
            [index]: currentDepartamento || ""
          }))
          if (currentDepartamento !== savedDepartamento) {
            setValue(`sedes.${index}.municipio` as any, "")
          }
        }
      })
    }
  }, [watchedSedes, setValue, departamentoStates])

  const getZonaLabel = (zona: string) => {
    return zona === "U" ? "Urbano" : zona === "R" ? "Rural" : zona
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap flex-row items-center justify-between border-b w-full pb-4 gap-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Sedes del Empleador
        </h3>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              Agregar Sede
            </Button>
          </DialogTrigger>
          <DialogContent className="!min-w-11/12 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingIndex !== null
                  ? (isViewing ? "Ver Sede" : "Editar Sede") 
                  : "Agregar Nueva Sede"
                }
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmitSede} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
                <Controller
                  name="tipoDocEmpleador"
                  control={sedeForm.control}
                  rules={SedeValidationRules.tipoDocEmpleador}
                  render={({ field, fieldState }) => (
                    <FormSelect
                      label="Tipo Documento Empleador"
                      placeholder="Seleccionar tipo"
                      options={DocumentTypesOptions.filter((i: { value: string }) => ["N", "NI"].includes(i.value))}
                      value={field.value}
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
                  control={sedeForm.control}
                  rules={SedeValidationRules.documentoEmpleador}
                  render={({ field, fieldState }) => (
                    <FormInput
                      label="Documento Empleador"
                      placeholder="Número documento empleador"
                      value={field.value}
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
                  control={sedeForm.control}
                  rules={SedeValidationRules.subempresa}
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
                  name="nombreSede"
                  control={sedeForm.control}
                  rules={SedeValidationRules.nombreSede}
                  render={({ field, fieldState }) => (
                    <FormInput
                      label="Nombre de la Sede"
                      placeholder="Nombre de la sede"
                      value={field.value}
                      onChange={field.onChange}
                      maxLength={200}
                      onBlur={field.onBlur}
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      required
                      disabled={isViewing}
                    />
                  )}
                />

                <Controller
                  name="departamento"
                  control={sedeForm.control}
                  rules={SedeValidationRules.departamento}
                  render={({ field, fieldState }) => (
                    <FormSelect
                      label="Departamento"
                      placeholder="Seleccionar departamento"
                      options={departamentosDaneOptions}
                      value={field.value}
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
                  name="municipio"
                  control={sedeForm.control}
                  rules={SedeValidationRules.municipio}
                  render={({ field, fieldState }) => (
                    <FormSelect
                      label="Municipio"
                      placeholder="Seleccionar municipio"
                      options={getMunicipiosDaneOptionsByDepartamento(sedeForm.watch("departamento"))}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      required
                      disabled={!sedeForm.watch("departamento") || isViewing}
                    />
                  )}
                />

                <Controller
                  name="direccion"
                  control={sedeForm.control}
                  rules={SedeValidationRules.direccion}
                  render={({ field, fieldState }) => (
                    <FormInput
                      label="Dirección"
                      placeholder="Dirección completa"
                      value={field.value}
                      onChange={field.onChange}
                      maxLength={200}
                      onBlur={field.onBlur}
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      required
                      disabled={isViewing}
                    />
                  )}
                />

                <Controller
                  name="zona"
                  control={sedeForm.control}
                  rules={SedeValidationRules.zona}
                  render={({ field, fieldState }) => (
                    <FormSelect
                      label="Zona"
                      placeholder="Seleccionar zona"
                      options={zonaOptions}
                      value={field.value}
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
                  name="actividadEconomica"
                  control={sedeForm.control}
                  rules={SedeValidationRules.actividadEconomica}
                  render={({ field, fieldState }) => (
                    <FormInput
                      label="Actividad Económica"
                      placeholder="Código actividad económica"
                      value={field.value}
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
                  name="fechaRadicacion"
                  control={sedeForm.control}
                  rules={SedeValidationRules.fechaRadicacion}
                  render={({ field, fieldState }) => (
                    <FormDatePicker
                      label="Fecha de Radicación"
                      placeholder="Seleccionar fecha de radicación"
                      value={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                      onChange={(date) =>
                        field.onChange(
                          date
                            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                            : ""
                        )
                      }
                      onBlur={field.onBlur}
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      required
                      maxDate={new Date()}
                      disabled={isViewing}
                    />
                  )}
                />

                <Controller
                  name="telefono"
                  control={sedeForm.control}
                  rules={SedeValidationRules.telefono}
                  render={({ field, fieldState }) => (
                    <FormInput
                      label="Teléfono"
                      placeholder="Número de teléfono"
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
                  name="correoElectronico"
                  control={sedeForm.control}
                  rules={SedeValidationRules.correoElectronico}
                  render={({ field, fieldState }) => (
                    <FormInput
                      label="Correo Electrónico"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      disabled={isViewing}
                    />
                  )}
                />

                <Controller
                  name="tipoDocResponsable"
                  control={sedeForm.control}
                  rules={SedeValidationRules.tipoDocResponsable}
                  render={({ field, fieldState }) => (
                    <FormSelect
                      label="Tipo Doc. Responsable"
                      placeholder="Seleccionar tipo"
                      options={DocumentTypesOptions.filter((i: { value: string }) => 
                        ["CC", "TI", "CE", "CD", "PT", "SC"].includes(i.value)
                      )}
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      disabled={isViewing}
                    />
                  )}
                />

                <Controller
                  name="documentoResponsable"
                  control={sedeForm.control}
                  rules={SedeValidationRules.documentoResponsable}
                  render={({ field, fieldState }) => (
                    <FormInput
                      label="Documento Responsable"
                      placeholder="Número documento responsable"
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
                  name="sedeMision"
                  control={sedeForm.control}
                  rules={SedeValidationRules.sedeMision}
                  render={({ field, fieldState }) => (
                    <FormInput
                      label="Sede Misión"
                      placeholder="Sede misión"
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
                  name="tipoDocSedeMision"
                  control={sedeForm.control}
                  rules={SedeValidationRules.tipoDocSedeMision}
                  render={({ field, fieldState }) => (
                    <FormSelect
                      label="Tipo Doc. Sede Misión"
                      placeholder="Seleccionar tipo"
                      options={DocumentTypesOptions.filter((i: { value: string }) => 
                        ["CC", "TI", "CE", "CD", "PT", "SC"].includes(i.value)
                      )}
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      disabled={isViewing}
                    />
                  )}
                />

                <Controller
                  name="documentoSedeMision"
                  control={sedeForm.control}
                  rules={SedeValidationRules.documentoSedeMision}
                  render={({ field, fieldState }) => (
                    <FormInput
                      label="Documento Sede Misión"
                      placeholder="Número documento sede misión"
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
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                {!isViewing && (
                  <Button type="submit">
                    {editingIndex !== null ? "Actualizar Sede" : "Agregar Sede"}
                  </Button>
                )}
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No hay sedes agregadas. Haga clic en &quot;Agregar Sede&quot; para comenzar.</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sedes Registradas ({fields.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Nombre Sede</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Municipio</TableHead>
                  <TableHead>Zona</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => {
                  const sede = watchedSedes[index]
                  return (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{sede?.nombreSede || "N/A"}</TableCell>
                      <TableCell>{sede?.departamento || "N/A"}</TableCell>
                      <TableCell>{sede?.municipio || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={sede?.zona === "U" ? "default" : "secondary"}>
                          {getZonaLabel(sede?.zona || "")}
                        </Badge>
                      </TableCell>
                      <TableCell>{sede?.telefono || "N/A"}</TableCell>
                      <TableCell>{sede?.correoElectronico || "N/A"}</TableCell>
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
                            onClick={() => eliminarSede(index)}
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
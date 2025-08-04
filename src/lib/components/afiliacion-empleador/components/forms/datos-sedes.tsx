"use client"

import { Controller, Control, FieldErrors, useFieldArray } from "react-hook-form"
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
import { Trash2, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card"
import type { Sede, AfiliacionEmpleadorFormData } from "../../types/afiliacion-empleador-types"

interface DatosSedesProps {
  control: Control<AfiliacionEmpleadorFormData>
  errors: FieldErrors<AfiliacionEmpleadorFormData>
  watch: (name: keyof AfiliacionEmpleadorFormData) => any
  setValue: (name: keyof AfiliacionEmpleadorFormData, value: any) => void
}

export function DatosSedes({ control, errors, watch, setValue }: DatosSedesProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "sedes",
  })

  const watchedSedes = watch("sedes")
  const [departamentoStates, setDepartamentoStates] = useState<Record<number, string>>({})

  const zonaOptions = [
    { value: "U", label: "U - URBANO" },
    { value: "R", label: "R - RURAL" }
  ]

  const agregarSede = () => {
    const nuevaSede: Sede = {
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
    append(nuevaSede)
  }

  const eliminarSede = (index: number) => {
    remove(index)
    // Limpiar estado del departamento para este índice
    const newStates = { ...departamentoStates }
    delete newStates[index]
    setDepartamentoStates(newStates)
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap flex-row items-center justify-between border-b w-full pb-4 gap-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Sedes del Empleador
        </h3>
        <Button
          type="button"
          onClick={agregarSede}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          Agregar Sede
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay sedes agregadas. Haga clic en &quot;Agregar Sede&quot; para comenzar.</p>
        </div>
      )}

      <div className="space-y-6">
        {fields.map((field, index) => (
          <Card key={field.id} className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Sede #{index + 1}
              </CardTitle>
              <Button
                type="button"
                onClick={() => eliminarSede(index)}
                size="sm"
                variant="destructive"
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
                <Controller
                  name={`sedes.${index}.tipoDocEmpleador`}
                  control={control}
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
                    />
                  )}
                />

                <Controller
                  name={`sedes.${index}.documentoEmpleador`}
                  control={control}
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
                    />
                  )}
                />

                <Controller
                  name={`sedes.${index}.subempresa`}
                  control={control}
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
                    />
                  )}
                />

                <Controller
                  name={`sedes.${index}.nombreSede`}
                  control={control}
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
                    />
                  )}
                />

                <Controller
                  name={`sedes.${index}.departamento`}
                  control={control}
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
                    />
                  )}
                />

                <Controller
                  name={`sedes.${index}.municipio`}
                  control={control}
                  rules={SedeValidationRules.municipio}
                  render={({ field, fieldState }) => (
                    <FormSelect
                      label="Municipio"
                      placeholder="Seleccionar municipio"
                      options={getMunicipiosDaneOptionsByDepartamento(watchedSedes?.[index]?.departamento)}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      required
                      disabled={!watchedSedes?.[index]?.departamento}
                    />
                  )}
                />

                <Controller
                  name={`sedes.${index}.direccion`}
                  control={control}
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
                    />
                  )}
                />

                <Controller
                  name={`sedes.${index}.zona`}
                  control={control}
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
                    />
                  )}
                />

                <Controller
                  name={`sedes.${index}.actividadEconomica`}
                  control={control}
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
                    />
                  )}
                />

                <Controller
                  name={`sedes.${index}.fechaRadicacion`}
                  control={control}
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
                    />
                  )}
                />

                <Controller
                  name={`sedes.${index}.telefono`}
                  control={control}
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
                    />
                  )}
                />

                <Controller
                  name={`sedes.${index}.correoElectronico`}
                  control={control}
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
                    />
                  )}
                />

                <Controller
                  name={`sedes.${index}.tipoDocResponsable`}
                  control={control}
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
                    />
                  )}
                />

                <Controller
                  name={`sedes.${index}.documentoResponsable`}
                  control={control}
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
                    />
                  )}
                />

                <Controller
                  name={`sedes.${index}.sedeMision`}
                  control={control}
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
                    />
                  )}
                />

                <Controller
                  name={`sedes.${index}.tipoDocSedeMision`}
                  control={control}
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
                    />
                  )}
                />

                <Controller
                  name={`sedes.${index}.documentoSedeMision`}
                  control={control}
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
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
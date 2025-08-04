"use client"

import { Controller, Control, FieldErrors, useFieldArray } from "react-hook-form"
import { FormInput } from "@/lib/components/core/form/form-input"
import { FormSelect } from "@/lib/components/core/form/form-select"
import { CentroTrabajoValidationRules } from "../../validations/validation-rules"
import { DocumentTypesOptions } from "../../options"
import { Button } from "@/lib/components/ui/button"
import { Trash2, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card"
import type { CentroTrabajo, AfiliacionEmpleadorFormData } from "../../types/afiliacion-empleador-types"

interface DatosCentrosTrabajoProps {
  control: Control<AfiliacionEmpleadorFormData>
  errors: FieldErrors<AfiliacionEmpleadorFormData>
  watch: (name: keyof AfiliacionEmpleadorFormData) => any
  setValue: (name: keyof AfiliacionEmpleadorFormData, value: any) => void
}

export function DatosCentrosTrabajo({ control, errors, watch, setValue }: DatosCentrosTrabajoProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "centrosTrabajo",
  })

  const watchedSedes = watch("sedes") || []

  // Crear opciones de sedes basadas en las sedes agregadas
  const sedeOptions = watchedSedes.map((sede: any, index: number) => ({
    value: sede.id || `sede-${index}`, // Si tiene ID usa ese, sino usa el índice
    label: sede.nombreSede || `Sede #${index + 1}`
  }))

  const agregarCentroTrabajo = () => {
    const nuevoCentroTrabajo: CentroTrabajo = {
      tipoDocEmpleador: "",
      documentoEmpleador: "",
      subempresa: "",
      idSubempresa: "",
      actividadEconomica: "",
      idSede: "",
    }
    append(nuevoCentroTrabajo)
  }

  const eliminarCentroTrabajo = (index: number) => {
    remove(index)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap flex-row items-center justify-between border-b w-full pb-4 gap-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Centros de Trabajo
        </h3>
        <Button
          type="button"
          onClick={agregarCentroTrabajo}
          className="flex items-center gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          Agregar Centro de Trabajo
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay centros de trabajo agregados. Haga clic en &quot;Agregar Centro de Trabajo&quot; para comenzar.</p>
        </div>
      )}

      <div className="space-y-6">
        {fields.map((field, index) => (
          <Card key={field.id} className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                Centro de Trabajo #{index + 1}
              </CardTitle>
              <Button
                type="button"
                onClick={() => eliminarCentroTrabajo(index)}
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
                  name={`centrosTrabajo.${index}.tipoDocEmpleador`}
                  control={control}
                  rules={CentroTrabajoValidationRules.tipoDocEmpleador}
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
                  name={`centrosTrabajo.${index}.documentoEmpleador`}
                  control={control}
                  rules={CentroTrabajoValidationRules.documentoEmpleador}
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
                  name={`centrosTrabajo.${index}.subempresa`}
                  control={control}
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
                    />
                  )}
                />

                <Controller
                  name={`centrosTrabajo.${index}.idSubempresa`}
                  control={control}
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
                    />
                  )}
                />

                <Controller
                  name={`centrosTrabajo.${index}.actividadEconomica`}
                  control={control}
                  rules={CentroTrabajoValidationRules.actividadEconomica}
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
                  name={`centrosTrabajo.${index}.idSede`}
                  control={control}
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
                      disabled={sedeOptions.length === 0}
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
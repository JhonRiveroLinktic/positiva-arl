"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/lib/components/ui/button"
import { Input } from "@/lib/components/ui/input"
import { Label } from "@/lib/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/lib/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/components/ui/card"
import { Alert, AlertDescription } from "@/lib/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/lib/components/ui/radio-group"
import { DatePicker } from "@/lib/components/ui/date-picker"
import { useActualizacionValorContratoStore } from "../stores/actualizacion-store"
import { ModalDatosActualizados } from "./modal-datos-actualizados"
import { documentTypesValorContrato } from "../options/document-types"
import { MINIMUM_WAGE } from "../validations/validation-rules"
import { toast } from "@/lib/utils/toast"
import { Search, Loader2, UserCheck, Save, X, Info } from "lucide-react"
import type { 
  BusquedaAfiliadoFormData, 
  ActualizacionValorContratoFormData,
  ActualizacionValorContratoPayload,
  DatosAfiliado,
  ApiResponseAfiliado
} from "../types/actualizacion-valor-contrato-types"

export function ActualizacionValorContratoForm() {
  const [tipoValor, setTipoValor] = useState<"total" | "mensual">("total")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [datosActualizados, setDatosActualizados] = useState<ApiResponseAfiliado | null>(null)
  const [contratoActualizadoNum, setContratoActualizadoNum] = useState<string>("")
  
  const { 
    afiliadoEncontrado, 
    isSearching, 
    isUpdating,
    setAfiliadoEncontrado,
    setContratoSeleccionado,
    setIsSearching,
    setIsUpdating,
    limpiarDatos 
  } = useActualizacionValorContratoStore()


  // Formulario de búsqueda
  const searchForm = useForm<BusquedaAfiliadoFormData>({
    mode: "onChange",
    defaultValues: {
      tipoDocumento: "",
      numeroDocumento: "",
    },
  })

  // Formulario de actualización
  const updateForm = useForm<ActualizacionValorContratoFormData>({
    mode: "onChange",
    defaultValues: {
      tipoValor: "total",
      valorContrato: "",
      fechaInicio: "",
      fechaFin: "",
    },
  })

  // Buscar afiliado en el endpoint real
  const buscarAfiliado = async (data: BusquedaAfiliadoFormData) => {
    // Validar que el tipo de documento esté seleccionado
    if (!data.tipoDocumento || data.tipoDocumento === "") {
      toast.error({
        title: "Tipo de documento requerido",
        description: "Por favor seleccione un tipo de documento antes de buscar.",
      })
      return
    }

    setIsSearching(true)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BALU
      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_BALU no está configurado")
      }

      const url = `${apiUrl}/afiliaciones/value-contract/${data.tipoDocumento}/${data.numeroDocumento}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("No se encontró el afiliado con los datos proporcionados")
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const apiData: ApiResponseAfiliado = await response.json()

      // Transformar los datos del API al formato interno
      const afiliadoData: DatosAfiliado = {
        tipoDocumento: apiData.identificationType,
        numeroDocumento: apiData.identification,
        primerNombre: apiData.firstName,
        segundoNombre: apiData.secondName || undefined,
        primerApellido: apiData.surname,
        segundoApellido: apiData.secondSurname || undefined,
        edad: apiData.age,
        sexo: apiData.sex,
        telefono: apiData.phoneNumber,
        email: apiData.email,
        contratos: apiData.contracts,
        contratoSeleccionado: apiData.contracts.length === 1 ? apiData.contracts[0] : undefined,
      }

      setAfiliadoEncontrado(afiliadoData)
      
      toast.success({
        title: "Afiliado encontrado",
        description: `Se encontró el afiliado con ${apiData.contracts.length} contrato(s)`,
      })
    } catch (error) {
      console.error("Error al buscar afiliado:", error)
      toast.error({
        title: "Error en la búsqueda",
        description: error instanceof Error ? error.message : "No se pudo encontrar el afiliado. Verifique los datos ingresados.",
      })
      setAfiliadoEncontrado(null)
    } finally {
      setIsSearching(false)
    }
  }

  // Actualización de valor de contrato (reemplazar con llamada real al endpoint cuando esté disponible)
  const actualizarValorContrato = async (data: ActualizacionValorContratoFormData) => {
    if (!afiliadoEncontrado || !afiliadoEncontrado.contratoSeleccionado) {
      toast.error({
        title: "Error",
        description: "Debe seleccionar un contrato para actualizar.",
      })
      return
    }

    setIsUpdating(true)
    
    try {
      const valorNumerico = parseFloat(data.valorContrato)
      const contratoSeleccionado = afiliadoEncontrado.contratoSeleccionado
      
      // Payload para el endpoint de actualización
      const payload: ActualizacionValorContratoPayload = {
        numContract: contratoSeleccionado.numContract,
        contractStartDate: data.fechaInicio,
        contractEndDate: data.fechaFin || null, // Si está vacío, enviar null
        typeContractUser: contratoSeleccionado.typeContractUser,
      }

      // Agregar valor según el tipo seleccionado
      if (data.tipoValor === "total") {
        payload.contractTotalValue = valorNumerico
      } else {
        payload.contractMonthlyValue = valorNumerico
      }

      console.log("Payload de actualización:", payload)

      const apiUrl = process.env.NEXT_PUBLIC_API_BALU

      const response = await fetch(`${apiUrl}/afiliaciones/value-contract`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        
        // Manejar error específico de validación de salario mínimo
        if (response.status === 400 && errorData?.detail) {
          if (errorData.detail.includes("valor mensual del contrato no puede ser menor al salario mínimo")) {
            throw new Error("El valor mensual del contrato no puede ser menor al salario mínimo. Verifique que el valor ingresado sea correcto según las fechas del contrato.")
          }
          throw new Error(errorData.detail)
        }
        
        throw new Error(`Error ${response.status}: ${errorData?.detail || response.statusText}`)
      }

      // Capturar la respuesta con los datos actualizados
      const responseData: ApiResponseAfiliado = await response.json()
      
      // Guardar el número del contrato actualizado para filtrarlo en el modal
      setContratoActualizadoNum(contratoSeleccionado.numContract)
      
      // Mostrar modal con los datos actualizados
      setDatosActualizados(responseData)
      setShowSuccessModal(true)
      
      toast.success({
        title: "Valor de contrato actualizado",
        description: "El valor del contrato se actualizó correctamente.",
      })
    } catch (error) {
      console.error("Error al actualizar valor de contrato:", error)
      toast.error({
        title: "Error en la actualización",
        description: error instanceof Error ? error.message : "No se pudo actualizar el valor del contrato. Intente nuevamente.",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBusqueda = searchForm.handleSubmit((data) => {
    buscarAfiliado(data)
  })

  const handleActualizacion = updateForm.handleSubmit((data) => {
    actualizarValorContrato(data)
  })

  const handleLimpiar = () => {
    searchForm.reset()
    updateForm.reset()
    limpiarDatos()
  }

  const handleLimpiarForm = () => {
    updateForm.reset({
      tipoValor: "total",
      valorContrato: "",
      fechaInicio: "",
      fechaFin: "",
    })
    setTipoValor("total")
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    setDatosActualizados(null)
    setContratoActualizadoNum("")
    handleLimpiar()
  }

  useEffect(() => {
    if (afiliadoEncontrado?.contratoSeleccionado) {
      const contrato = afiliadoEncontrado.contratoSeleccionado
      updateForm.setValue("fechaInicio", contrato.contractStartDate)
      if (contrato.contractEndDate) {
        updateForm.setValue("fechaFin", contrato.contractEndDate)
      } else {
        updateForm.setValue("fechaFin", "")
      }
    }
  }, [afiliadoEncontrado?.contratoSeleccionado, updateForm])

  return (
    <div className="space-y-6 w-full">
      {/* Alerta informativa */}
      <Alert className="border-orange-200 bg-orange-50">
        <Info className="h-4 w-4 !text-orange-800" />
        <AlertDescription className="text-orange-800">
          <strong>Nota:</strong> Este formulario permite actualizar el valor del contrato de trabajadores dependientes e independientes.
          Primero busque al afiliado por su ID de radicado, luego ingrese la nueva información.
        </AlertDescription>
      </Alert>

      {/* Formulario de búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Afiliado
          </CardTitle>
          <CardDescription>
            Ingrese el tipo y número de documento para buscar la información del afiliado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBusqueda} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoDocumento">
                  Tipo de Documento <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={searchForm.watch("tipoDocumento")}
                  onValueChange={(value) => searchForm.setValue("tipoDocumento", value)}
                  disabled={isSearching || !!afiliadoEncontrado}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypesValorContrato.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {searchForm.formState.errors.tipoDocumento && (
                  <p className="text-sm text-red-500">
                    {searchForm.formState.errors.tipoDocumento.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroDocumento">
                  Número de Documento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="numeroDocumento"
                  placeholder="Ej: 1063727580"
                  {...searchForm.register("numeroDocumento", {
                    required: "El número de documento es obligatorio",
                    minLength: {
                      value: 3,
                      message: "El número de documento debe tener al menos 3 caracteres",
                    },
                    maxLength: {
                      value: 20,
                      message: "El número de documento no puede tener más de 20 caracteres",
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9]+$/,
                      message: "El número de documento solo puede contener letras y números",
                    },
                  })}
                  disabled={isSearching || !!afiliadoEncontrado}
                />
                {searchForm.formState.errors.numeroDocumento && (
                  <p className="text-sm text-red-500">
                    {searchForm.formState.errors.numeroDocumento.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                    type="button"
                    variant="outline"
                    onClick={handleLimpiar}
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar
                  </Button>
              <Button
                type="submit"
                disabled={isSearching || !!afiliadoEncontrado}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar Afiliado
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Información del afiliado encontrado */}
      {afiliadoEncontrado && (
        <>
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <UserCheck className="h-5 w-5" />
                Afiliado Encontrado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-6">
                <div>
                  <span className="font-semibold">Documento:</span>
                  <p className="text-gray-700">
                    {afiliadoEncontrado.tipoDocumento} {afiliadoEncontrado.numeroDocumento}
                  </p>
                </div>
                <div>
                  <span className="font-semibold">Nombres:</span>
                  <p className="text-gray-700">
                    {afiliadoEncontrado.primerNombre} {afiliadoEncontrado.segundoNombre || ""}
                  </p>
                </div>
                <div>
                  <span className="font-semibold">Apellidos:</span>
                  <p className="text-gray-700">
                    {afiliadoEncontrado.primerApellido} {afiliadoEncontrado.segundoApellido || ""}
                  </p>
                </div>
                <div>
                  <span className="font-semibold">Email:</span>
                  <p className="text-gray-700">{afiliadoEncontrado.email}</p>
                </div>
                <div>
                  <span className="font-semibold">Teléfono:</span>
                  <p className="text-gray-700">{afiliadoEncontrado.telefono}</p>
                </div>
                <div>
                  <span className="font-semibold">Edad:</span>
                  <p className="text-gray-700">{afiliadoEncontrado.edad} años</p>
                </div>
                <div>
                  <span className="font-semibold">Sexo:</span>
                  <p className="text-gray-700">{afiliadoEncontrado.sexo}</p>
                </div>
                <div>
                  <span className="font-semibold">Total Contratos:</span>
                  <p className="text-gray-700 font-semibold">{afiliadoEncontrado.contratos.length}</p>
                </div>
              </div>

              {/* Selección de contrato si hay más de uno */}
              {afiliadoEncontrado.contratos.length > 1 && (
                <div className="space-y-2 mb-4">
                  <Label>Seleccione el contrato a actualizar <span className="text-red-500">*</span></Label>
                  <Select
                    value={afiliadoEncontrado.contratoSeleccionado?.numContract || ""}
                    onValueChange={(value) => {
                      const contrato = afiliadoEncontrado.contratos.find(c => c.numContract === value)
                      if (contrato) {
                        setContratoSeleccionado(contrato)
                      }
                    }}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Seleccione un contrato" />
                    </SelectTrigger>
                    <SelectContent>
                      {afiliadoEncontrado.contratos.map((contrato) => (
                        <SelectItem key={contrato.numContract} value={contrato.numContract}>
                          {contrato.numContract} - ${contrato.contractTotalValue.toLocaleString('es-CO')} ({contrato.typeContractUser})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Información del contrato seleccionado */}
              {afiliadoEncontrado.contratoSeleccionado && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold text-green-800 mb-3">Contrato Seleccionado:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Número:</span>
                      <p className="text-gray-700">{afiliadoEncontrado.contratoSeleccionado.numContract}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Tipo:</span>
                      <p className="text-gray-700">{afiliadoEncontrado.contratoSeleccionado.typeContractUser}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Valor Total:</span>
                      <p className="font-semibold text-green-700">
                        ${afiliadoEncontrado.contratoSeleccionado.contractTotalValue.toLocaleString('es-CO')}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold">Valor Mensual:</span>
                      <p className="text-gray-700">
                        ${afiliadoEncontrado.contratoSeleccionado.contractMonthlyValue.toLocaleString('es-CO')}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold">Valor IBC:</span>
                      <p className="text-gray-700">
                        ${afiliadoEncontrado.contratoSeleccionado.contractIbcValue.toLocaleString('es-CO')}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold">Duración:</span>
                      <p className="text-gray-700">{afiliadoEncontrado.contratoSeleccionado.contractDuration}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Fecha Inicio:</span>
                      <p className="text-gray-700">
                        {new Date(afiliadoEncontrado.contratoSeleccionado.contractStartDate).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold">Fecha Fin:</span>
                      <p className="text-gray-700">
                        {afiliadoEncontrado.contratoSeleccionado.contractEndDate 
                          ? new Date(afiliadoEncontrado.contratoSeleccionado.contractEndDate).toLocaleDateString('es-CO')
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulario de actualización - Solo si hay contratos */}
          {afiliadoEncontrado.contratos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Actualizar Valor de Contrato
                </CardTitle>
                <CardDescription>
                  Ingrese el tipo de valor, el nuevo valor del contrato y las fechas de vigencia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleActualizacion} className="space-y-6">
                  {/* Tipo de Valor */}
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <Label className="text-base font-semibold">
                      Tipo de Valor <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup
                      value={tipoValor}
                      onValueChange={(value: string) => {
                        const tipoValorSeleccionado = value as "total" | "mensual"
                        setTipoValor(tipoValorSeleccionado)
                        updateForm.setValue("tipoValor", tipoValorSeleccionado)
                        updateForm.setValue("valorContrato", "")
                      }}
                      disabled={isUpdating}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="total" id="valor-total" />
                        <Label htmlFor="valor-total" className="cursor-pointer font-normal">
                          Valor Total del Contrato
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mensual" id="valor-mensual" />
                        <Label htmlFor="valor-mensual" className="cursor-pointer font-normal">
                          Valor Mensual del Contrato
                        </Label>
                      </div>
                    </RadioGroup>
                    <p className="text-sm text-gray-600">
                      {tipoValor === "total" 
                        ? "Se calculará automáticamente el valor mensual y el IBC"
                        : "Se calculará automáticamente el valor total y el IBC"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valorContrato">
                        {tipoValor === "total" ? "Valor Total" : "Valor Mensual"} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="valorContrato"
                        type="text"
                        placeholder={`Mínimo ${MINIMUM_WAGE.toLocaleString('es-CO')}`}
                        {...updateForm.register("valorContrato", {
                          required: "El valor del contrato es obligatorio",
                          validate: (value: string) => {
                            if (!value || value.trim() === "") {
                              return "El valor del contrato es obligatorio"
                            }
                            if (!/^[0-9]+$/.test(value)) {
                              return "El valor del contrato debe ser un número entero sin puntos, comas, espacios ni símbolos"
                            }
                            const numericValue = parseInt(value)
                            if (numericValue < MINIMUM_WAGE) {
                              return `El valor del contrato debe ser igual o superior al salario mínimo ($${MINIMUM_WAGE.toLocaleString('es-CO')})`
                            }
                            return true
                          },
                        })}
                        disabled={isUpdating}
                      />
                      {updateForm.formState.errors.valorContrato && (
                        <p className="text-sm text-red-500">
                          {updateForm.formState.errors.valorContrato.message}
                        </p>
                      )}
                    </div>

                    <Controller
                      name="fechaInicio"
                      control={updateForm.control}
                      rules={{ required: "La fecha de inicio es obligatoria" }}
                      render={({ field }) => (
                        <DatePicker
                          label="Fecha de Inicio"
                          placeholder="Selecciona fecha de inicio"
                          value={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                          onChange={(date) => {
                            if (date) {
                              const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                              field.onChange(formatted)
                            } else {
                              field.onChange("")
                            }
                          }}
                          error={!!updateForm.formState.errors.fechaInicio}
                          errorMessage={updateForm.formState.errors.fechaInicio?.message}
                          disabled={isUpdating}
                          required={true}
                        />
                      )}
                    />

                    <Controller
                      name="fechaFin"
                      control={updateForm.control}
                      rules={{
                        validate: (value) => {
                          // Solo validar si hay valor (opcional)
                          if (value) {
                            const fechaInicio = updateForm.getValues("fechaInicio")
                            if (fechaInicio) {
                              const fechaInicioDate = new Date(fechaInicio)
                              const fechaFinDate = new Date(value)
                              if (fechaFinDate <= fechaInicioDate) {
                                return "La fecha de fin debe ser posterior a la fecha de inicio"
                              }
                            }
                          }
                          return true
                        }
                      }}
                      render={({ field }) => (
                        <DatePicker
                          label="Fecha de Fin"
                          placeholder="Opcional - Selecciona fecha de fin"
                          value={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                          onChange={(date) => {
                            if (date) {
                              const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                              field.onChange(formatted)
                            } else {
                              field.onChange("")
                            }
                          }}
                          error={!!updateForm.formState.errors.fechaFin}
                          errorMessage={updateForm.formState.errors.fechaFin?.message}
                          disabled={isUpdating}
                          required={false}
                        />
                      )}
                    />
                  </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-800" />
                  <AlertDescription className="text-blue-800 text-sm">
                    <strong>Importante:</strong> El valor del contrato debe ser igual o superior al salario mínimo 
                    vigente (${MINIMUM_WAGE.toLocaleString('es-CO')}). Ingrese el valor como número entero sin puntos, comas o símbolos.
                    <br />
                    <br />
                    <strong>Nota:</strong> Si ingresa el valor total del contrato, el sistema validará que el valor mensual 
                    calculado según el rango de fechas no sea inferior al salario mínimo.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLimpiarForm}
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpiar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Actualizar Valor de Contrato
                      </>
                    )}
                  </Button>
                </div>
                </form>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modal de éxito con datos actualizados */}
      <ModalDatosActualizados
        open={showSuccessModal}
        onClose={handleCloseSuccessModal}
        datosActualizados={datosActualizados}
        contratoActualizadoNum={contratoActualizadoNum}
      />
    </div>
  )
}

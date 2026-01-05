"use client"

import { useEffect, useState, useRef } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/lib/components/ui/button"
import { Input } from "@/lib/components/ui/input"
import { Label } from "@/lib/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/lib/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/lib/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/lib/components/ui/radio-group"
import { DatePicker } from "@/lib/components/ui/date-picker"
import { Badge } from "@/lib/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow, 
  TableCaption 
} from "@/lib/components/ui/table"
import { useActualizacionValorContratoStore } from "../stores/actualizacion-store"
import { ModalDatosActualizados } from "./modal-datos-actualizados"
import { documentTypesValorContrato } from "../options/document-types"
import { toast } from "@/lib/utils/toast"
import { MINIMUM_WAGE } from "@/lib/utils/validations"
import { Search, Loader2, UserCheck, Save, X, Info, PencilLine, Eye } from "lucide-react"
import { supabase } from "@/lib/utils/supabase"
import { useAuth } from "@/lib/components/core/auth/auth-context"
import type { 
  BusquedaAfiliadoFormData, 
  ActualizacionValorContratoFormData,
  ActualizacionValorContratoPayload,
  DatosAfiliado,
  ApiResponseAfiliado,
  Contrato,
  RegistroTrazabilidadCambioContrato
} from "../types/actualizacion-valor-contrato-types"

const normalizarTexto = (valor?: string | null) => {
  if (!valor) return ""
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

const esTipoContratoIndependiente = (tipo?: string | null) => {
  const normalizado = normalizarTexto(tipo)
  return normalizado.includes("independ")
}

const esContratoInactivo = (estado?: string | null) => {
  const normalizado = normalizarTexto(estado)
  return normalizado === "inactiva" || normalizado === "inactivo"
}

const esContratoEditable = (contrato: Contrato) =>
  esTipoContratoIndependiente(contrato.typeContractUser) && esContratoInactivo(contrato.contractStatus)

const obtenerPrioridadEstado = (contrato: Contrato) => {
  if (esContratoInactivo(contrato.contractStatus)) return 0
  return 1
}

// Helper para parsear fechas en formato YYYY-MM-DD como fecha local (no UTC)
// Esto evita el desfase de 1 día causado por la conversión de zona horaria
// Ejemplo: "2025-06-01" se parsea como 1 de junio (no 31 de mayo)
const parsearFechaLocal = (fecha?: string | null): Date | null => {
  if (!fecha) return null
  
  // Si es formato YYYY-MM-DD, parsear manualmente para evitar problemas de zona horaria
  const partes = fecha.split("-")
  if (partes.length === 3) {
    const year = parseInt(partes[0], 10)
    const month = parseInt(partes[1], 10) - 1 // Los meses en JS son 0-indexados
    const day = parseInt(partes[2], 10)

    if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
      // Crear fecha en zona horaria local (no UTC)
      const parsed = new Date(year, month, day)
      if (!Number.isNaN(parsed.getTime())) {
        return parsed
      }
    }
  }
  
  // Fallback: intentar parsear normalmente si no es formato YYYY-MM-DD
  const parsed = new Date(fecha)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const ordenarContratos = (contratos: Contrato[]) => {
  return [...contratos].sort((a, b) => {
    const prioridadA = obtenerPrioridadEstado(a)
    const prioridadB = obtenerPrioridadEstado(b)

    if (prioridadA !== prioridadB) {
      return prioridadA - prioridadB
    }

    const dateA = a.contractEndDate ? (parsearFechaLocal(a.contractEndDate)?.getTime() ?? Number.POSITIVE_INFINITY) : Number.POSITIVE_INFINITY
    const dateB = b.contractEndDate ? (parsearFechaLocal(b.contractEndDate)?.getTime() ?? Number.POSITIVE_INFINITY) : Number.POSITIVE_INFINITY

    return dateA - dateB
  })
}

const integerNumberFormatter = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 })
const decimalNumberFormatter = new Intl.NumberFormat("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatCurrencyDisplay = (value?: number | null) => {
  if (value === undefined || value === null || Number.isNaN(value)) return ""
  return decimalNumberFormatter.format(value)
}

type CurrencyFormatResult = {
  formatted: string
  formattedWithDecimals: string
  numericString: string
  numericValue: number
  exceedsLimit: boolean
}

const formatCurrencyInputValue = (rawValue: string): CurrencyFormatResult => {
  const trimmed = rawValue.trim()
  if (!trimmed) {
    return {
      formatted: "",
      formattedWithDecimals: "",
      numericString: "",
      numericValue: NaN,
      exceedsLimit: false,
    }
  }

  let sanitized = trimmed.replace(/\s/g, "")
  sanitized = sanitized.replace(/\./g, "")
  sanitized = sanitized.replace(/[^\d,]/g, "")

  if (!sanitized) {
    return {
      formatted: "",
      formattedWithDecimals: "",
      numericString: "",
      numericValue: NaN,
      exceedsLimit: false,
    }
  }

  const parts = sanitized.split(",")
  let integerPart = parts.shift() ?? ""
  const decimalPartRaw = parts.join("")
  const decimalPart = decimalPartRaw.replace(/[^\d]/g, "").slice(0, 2)

  integerPart = integerPart.replace(/^0+(?=\d)/, "")
  if (!integerPart) integerPart = "0"

  if (integerPart.length > 17) {
    return {
      formatted: "",
      formattedWithDecimals: "",
      numericString: "",
      numericValue: NaN,
      exceedsLimit: true,
    }
  }

  const typedSeparator = sanitized.includes(",")

  const integerNumber = parseInt(integerPart, 10)
  const formattedInteger = integerNumberFormatter.format(integerNumber)

  let formatted = formattedInteger
  if (decimalPart.length > 0) {
    formatted = `${formattedInteger},${decimalPart}`
  } else if (typedSeparator) {
    formatted = `${formattedInteger},`
  }

  const numericString =
    decimalPart.length > 0 ? `${integerPart}.${decimalPart}` : integerPart
  const numericValue = Number(numericString)

  const formattedWithDecimals =
    decimalPart.length > 0
      ? `${formattedInteger},${decimalPart.padEnd(2, "0")}`
      : `${formattedInteger},00`

  return {
    formatted,
    formattedWithDecimals,
    numericString,
    numericValue: Number.isNaN(numericValue) ? NaN : numericValue,
    exceedsLimit: false,
  }
}

export function ActualizacionValorContratoForm() {
  const [tipoValor, setTipoValor] = useState<"total" | "mensual">("total")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [datosActualizados, setDatosActualizados] = useState<ApiResponseAfiliado | null>(null)
  const [contratoActualizadoNum, setContratoActualizadoNum] = useState<string>("")
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [valorContratoDisplay, setValorContratoDisplay] = useState("")
  const formularioRef = useRef<HTMLDivElement>(null)
  
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

  const { user } = useAuth()


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
      ticketId: "",
    },
  })

  const contratos = afiliadoEncontrado?.contratos ?? []
  const contratoSeleccionado = afiliadoEncontrado?.contratoSeleccionado
  const puedeEditarContrato = contratoSeleccionado ? esContratoEditable(contratoSeleccionado) : false
  const hayContratosEditables = contratos.some(esContratoEditable)

  const formatearFecha = (fecha?: string | null) => {
    if (!fecha) return "-"
    
    const parsed = parsearFechaLocal(fecha)
    if (!parsed) {
      return "-"
    }

    // Evitar mostrar fechas inválidas provenientes de null/epoch
    if (parsed.getFullYear() <= 1970) {
      return "-"
    }

    return parsed.toLocaleDateString("es-CO")
  }

  const manejarSeleccionContrato = (contrato: Contrato) => {
    setContratoSeleccionado(contrato)
    setMostrarFormulario(false)
  }

  const handleActivarEdicion = () => {
    if (!contratoSeleccionado || !esContratoEditable(contratoSeleccionado)) {
      return
    }

    setMostrarFormulario(true)
    setTipoValor("total")
    updateForm.setValue("tipoValor", "total")
    updateForm.setValue("ticketId", "")
    updateForm.clearErrors(["valorContrato", "ticketId"])

    const baseValue = contratoSeleccionado.contractTotalValue
    updateForm.setValue("valorContrato", baseValue.toFixed(2), { shouldDirty: false })
    setValorContratoDisplay(formatCurrencyDisplay(baseValue))

    // Scroll suave al formulario después de que se renderice
    setTimeout(() => {
      formularioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }

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

        const errorData = await response.json().catch(() => null)
        const errorMessage =
          errorData?.detail ||
          errorData?.message ||
          errorData?.error?.message

        if (errorMessage && errorMessage.toLowerCase().includes("no se pudo obtener el usuario de bbdd")) {
          throw new Error("No se encontró información para el afiliado consultado.")
        }

        throw new Error(
          `Error ${response.status}: ${
            errorMessage || response.statusText || "No se pudo completar la búsqueda"
          }`
        )
      }

      const apiData: ApiResponseAfiliado = await response.json()

      const contratosNormalizados = (apiData.contracts || []).map((contrato) => ({
        ...contrato,
        contractStatus: contrato.contractStatus ?? "Desconocido",
        contractTypeVinculation: contrato.contractTypeVinculation ?? null,
        typeContractUser: contrato.typeContractUser ?? "",
        contractorName: contrato.contractorName ?? null,
        subCompany: contrato.subCompany ?? null,
        companyNameContract: contrato.companyNameContract ?? null,
        nitCompanyContract: contrato.nitCompanyContract ?? null,
      }))

      const contratosOrdenados = ordenarContratos(contratosNormalizados)
      const primerContratoEditable = contratosOrdenados.find(esContratoEditable)
      const contratoPredeterminado = primerContratoEditable ?? contratosOrdenados[0] ?? undefined

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
        contratos: contratosOrdenados,
        contratoSeleccionado: contratoPredeterminado,
      }

      if (!primerContratoEditable) {
        toast.info({
          title: "Contratos sin opción de edición",
          description: "Este afiliado no tiene contratos independientes inactivos para actualizar. Puedes revisar el listado para más detalles.",
        })
      }

      setAfiliadoEncontrado(afiliadoData)
      setMostrarFormulario(false)
      
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
    if (
      !afiliadoEncontrado || 
      !afiliadoEncontrado.contratoSeleccionado || 
      !esContratoEditable(afiliadoEncontrado.contratoSeleccionado)
    ) {
      toast.error({
        title: "Error",
        description: "Debe seleccionar un contrato independiente con estado inactivo para actualizar.",
      })
      return
    }

    setIsUpdating(true)
    
    try {
      const valorNumerico = parseFloat(data.valorContrato)
      if (Number.isNaN(valorNumerico)) {
        toast.error({
          title: "Valor inválido",
          description: "El valor del contrato debe ser numérico.",
        })
        return
      }
      const ticketId = data.ticketId.trim()
      if (!ticketId) {
        throw new Error("El ticket asociado es obligatorio.")
      }
      const contratoSeleccionado = afiliadoEncontrado.contratoSeleccionado

      const fechaInicioOriginal = contratoSeleccionado.contractStartDate
      const fechaFinOriginal = contratoSeleccionado.contractEndDate ?? ""
      const fechaInicioNueva = data.fechaInicio
      const fechaFinNueva = data.fechaFin || ""

      const valorReferencia =
        data.tipoValor === "total"
          ? contratoSeleccionado.contractTotalValue
          : contratoSeleccionado.contractMonthlyValue

      const noCambioEnValor = Math.abs(valorReferencia - valorNumerico) < 0.01
      const noCambioEnFechas =
        fechaInicioOriginal === fechaInicioNueva &&
        (fechaFinOriginal || "") === (fechaFinNueva || "")

      if (noCambioEnValor && noCambioEnFechas) {
        toast.error({
          title: "Sin cambios detectados",
          description: "Debes ajustar la fecha o el valor del contrato para poder guardar la actualización.",
        })
        return
      }

      const fechaInicioDate = parsearFechaLocal(fechaInicioNueva)
      const fechaFinDate = parsearFechaLocal(fechaFinNueva)
      
      if (!fechaInicioDate || !fechaFinDate) {
        toast.error({
          title: "Error en fechas",
          description: "Las fechas proporcionadas no son válidas.",
        })
        return
      }

      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      const diffMs = fechaFinDate.getTime() - fechaInicioDate.getTime()
      const diffDias = diffMs / (1000 * 60 * 60 * 24)

      if (diffDias < 30) {
        toast.error({
          title: "Duración insuficiente",
          description: "La duración entre la fecha de inicio y la fecha de terminación no puede ser inferior a un mes.",
        })
        return
      }

      const payload: ActualizacionValorContratoPayload = {
        numContract: contratoSeleccionado.numContract,
        contractStartDate: data.fechaInicio,
        contractEndDate: data.fechaFin,
        typeContractUser: contratoSeleccionado.typeContractUser,
      }

      if (data.tipoValor === "total") {
        payload.contractTotalValue = valorNumerico
      } else {
        payload.contractMonthlyValue = valorNumerico
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_BALU
      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_BALU no está configurado")
      }

      const correoUsuario = user?.email ?? "sin-correo@positiva.com"
      const valorAnterior = valorReferencia

      const trazabilidadPayload: RegistroTrazabilidadCambioContrato = {
        tipo_documento: afiliadoEncontrado.tipoDocumento,
        numero_documento: afiliadoEncontrado.numeroDocumento,
        num_contrato: contratoSeleccionado.numContract,
        fecha_inicial_anterior: contratoSeleccionado.contractStartDate ?? null,
        fecha_final_anterior: contratoSeleccionado.contractEndDate ?? null,
        valor_anterior: valorAnterior ?? null,
        nueva_fecha_inicial: data.fechaInicio,
        nueva_fecha_final: data.fechaFin,
        nuevo_valor: valorNumerico,
        tipo_valor: data.tipoValor,
        correo_modifico: correoUsuario,
        ticket_id: ticketId,
      }

      const responsePromise = fetch(`${apiUrl}/afiliaciones/value-contract`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      let trazabilidadRecordId: string | null = null

      const trazabilidadPromise = supabase
        .from("trazabilidad_cambios_valor_contrato")
        .insert([trazabilidadPayload])
        .select()
        .single()

      const [response, trazabilidadResult] = await Promise.all([
        responsePromise,
        trazabilidadPromise,
      ])

      if (trazabilidadResult.error) {
        const errorCode = (trazabilidadResult.error as { code?: string })?.code
        if (errorCode === "PGRST204") {
          console.warn("No se encontró columna en tabla de trazabilidad. Detalle:", trazabilidadResult.error)
          toast.warning({
            title: "Trazabilidad no disponible",
            description: "No se pudo registrar la trazabilidad en Supabase. Ejecuta el script de actualización de la tabla cuando sea posible.",
          })
        } else {
          console.error("Error al guardar trazabilidad:", trazabilidadResult.error)
          throw new Error("No fue posible registrar la trazabilidad del cambio. Intente nuevamente.")
        }
      } else {
        trazabilidadRecordId = (trazabilidadResult.data as { id?: string } | null)?.id ?? null
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)

        if (trazabilidadRecordId) {
          await supabase
            .from("trazabilidad_cambios_valor_contrato")
            .delete()
            .eq("id", trazabilidadRecordId)
        }

        const errorMessage =
          errorData?.detail ||
          errorData?.message ||
          errorData?.error?.message ||
          response.statusText ||
          "No se pudo actualizar el contrato"

        throw new Error(`Error ${response.status}: ${errorMessage}`)
      }

      const responseData: ApiResponseAfiliado = await response.json()

      const contratosNormalizados = ordenarContratos(
        (responseData.contracts || []).map((contrato) => ({
          ...contrato,
          contractStatus: contrato.contractStatus ?? "Desconocido",
          contractTypeVinculation: contrato.contractTypeVinculation ?? null,
          typeContractUser: contrato.typeContractUser ?? "",
          contractorName: contrato.contractorName ?? null,
          subCompany: contrato.subCompany ?? null,
          companyNameContract: contrato.companyNameContract ?? null,
          nitCompanyContract: contrato.nitCompanyContract ?? null,
        }))
      )

      const contratoActualizadoNormalizado =
        contratosNormalizados.find((contrato) => contrato.numContract === contratoSeleccionado.numContract) ??
        contratosNormalizados.find(esContratoEditable)

      setAfiliadoEncontrado({
        tipoDocumento: afiliadoEncontrado.tipoDocumento,
        numeroDocumento: afiliadoEncontrado.numeroDocumento,
        primerNombre: afiliadoEncontrado.primerNombre,
        segundoNombre: afiliadoEncontrado.segundoNombre,
        primerApellido: afiliadoEncontrado.primerApellido,
        segundoApellido: afiliadoEncontrado.segundoApellido,
        edad: afiliadoEncontrado.edad,
        sexo: afiliadoEncontrado.sexo,
        telefono: afiliadoEncontrado.telefono,
        email: afiliadoEncontrado.email,
        contratos: contratosNormalizados,
        contratoSeleccionado: contratoActualizadoNormalizado,
      })
      setMostrarFormulario(true)
      
      // Guardar el número del contrato actualizado para filtrarlo en el modal
      setContratoActualizadoNum(contratoSeleccionado.numContract)
      
      // Mostrar modal con los datos actualizados
      setDatosActualizados(responseData)
      setShowSuccessModal(true)
      setValorContratoDisplay("")
      
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
    updateForm.reset({
      tipoValor: "total",
      valorContrato: "",
      fechaInicio: "",
      fechaFin: "",
      ticketId: "",
    })
    limpiarDatos()
    setMostrarFormulario(false)
    setValorContratoDisplay("")
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    setDatosActualizados(null)
    setContratoActualizadoNum("")
    handleLimpiar()
  }

  useEffect(() => {
    if (contratoSeleccionado && esContratoEditable(contratoSeleccionado)) {
      updateForm.setValue("fechaInicio", contratoSeleccionado.contractStartDate)
      updateForm.setValue("fechaFin", contratoSeleccionado.contractEndDate ?? "")
      updateForm.setValue("tipoValor", "total")
      updateForm.setValue("valorContrato", "")
      setTipoValor("total")
      setValorContratoDisplay("")
    } else {
      updateForm.reset({
        tipoValor: "total",
        valorContrato: "",
        fechaInicio: "",
        fechaFin: "",
        ticketId: "",
      })
      setTipoValor("total")
      setMostrarFormulario(false)
      setValorContratoDisplay("")
    }
  }, [contratoSeleccionado, updateForm])

  return (
    <div className="space-y-6 w-full">
      {/* Alerta informativa */}
      <Alert className="border-orange-200 bg-orange-50">
        <Info className="h-4 w-4 !text-orange-800" />
        <AlertDescription className="text-orange-800">
          <strong>Nota:</strong> Este formulario permite actualizar el valor del contrato de trabajadores independientes.
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
                  placeholder="Ingresa el número de documento"
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

            </CardContent>
          </Card>

        {/* Listado de contratos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Listado de contratos del afiliado
              <Badge variant="outline" className="text-xs font-medium">
                Total: {contratos.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Los contratos se ordenan priorizando los estados inactivos y luego los activos, aplicando orden cronológico ascendente por fecha de fin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {contratos.length === 0 ? (
              <Alert>
                <AlertTitle>No se encontraron contratos</AlertTitle>
                <AlertDescription>
                  El afiliado consultado no tiene contratos disponibles para mostrar.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contratante / Estado</TableHead>
                      <TableHead>Tipo de vinculación</TableHead>
                      <TableHead>Fecha inicio</TableHead>
                      <TableHead>Fecha fin</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contratos.map((contrato) => {
                      const seleccionado = contratoSeleccionado?.numContract === contrato.numContract
                      const contratoEsEditable = esContratoEditable(contrato)

                      return (
                        <TableRow
                          key={contrato.numContract}
                          className={seleccionado ? "bg-orange-50" : undefined}
                        >
                          <TableCell className="space-y-1">
                            <div className="font-medium">{contrato.contractorName || "-"}</div>
                            <div className="text-xs text-muted-foreground">
                              Contrato: {contrato.numContract}
                            </div>
                          </TableCell>
                          <TableCell>{contrato.subCompany || "-"}</TableCell>
                          <TableCell>{contrato.contractTypeVinculation || "-"}</TableCell>
                          <TableCell>{formatearFecha(contrato.contractStartDate)}</TableCell>
                          <TableCell>{formatearFecha(contrato.contractEndDate)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={esContratoInactivo(contrato.contractStatus) ? "secondary" : "default"}
                              className={
                                esContratoInactivo(contrato.contractStatus)
                                  ? "bg-slate-200 text-slate-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }
                            >
                              {contrato.contractStatus || "Sin estado"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                className={`flex items-center gap-2 ${contratoEsEditable ? "border-orange-300 text-orange-700 hover:bg-orange-50" : "text-slate-600 hover:bg-slate-100"}`}
                                onClick={() => manejarSeleccionContrato(contrato)}
                                title="Ver detalle del contrato"
                              >
                                <Eye className="h-4 w-4" />
                                Ver contrato ({esContratoInactivo(contrato.contractStatus) ? "Inactivo" : "Activo"})
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                  <TableCaption>
                    Selecciona un contrato para ver los detalles y, si está inactivo, habilitar la actualización del valor.
                  </TableCaption>
                </Table>
                {!hayContratosEditables && (
                  <Alert variant="destructive">
                    <AlertTitle>Sin contratos editables</AlertTitle>
                    <AlertDescription>
                      No hay contratos independientes inactivos para actualizar.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {contratoSeleccionado && (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-lg">Detalle del contrato seleccionado</CardTitle>
                  <CardDescription>
                    Consulta la información completa del contrato y decide si requiere modificación.
                  </CardDescription>
                </div>
                <Badge
                  variant={esContratoInactivo(contratoSeleccionado.contractStatus) ? "secondary" : "default"}
                  className={
                    esContratoInactivo(contratoSeleccionado.contractStatus)
                      ? "bg-slate-200 text-slate-800"
                      : "bg-emerald-100 text-emerald-800"
                  }
                >
                  {contratoSeleccionado.contractStatus || "Sin estado"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Número de contrato</span>
                  <p className="text-gray-900">{contratoSeleccionado.numContract}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Tipo de contrato</span>
                  <p className="text-gray-900">{contratoSeleccionado.contractType || "-"}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Tipo de vinculación</span>
                  <p className="text-gray-900">{contratoSeleccionado.contractTypeVinculation || "-"}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Modalidad</span>
                  <p className="text-gray-900">{contratoSeleccionado.typeContractUser || "-"}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Valor total</span>
                  <p className="text-gray-900">
                    {typeof contratoSeleccionado.contractTotalValue === "number"
                      ? `$${contratoSeleccionado.contractTotalValue.toLocaleString("es-CO")}`
                      : "Sin información"}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Valor mensual</span>
                  <p className="text-gray-900">
                    {typeof contratoSeleccionado.contractMonthlyValue === "number"
                      ? `$${contratoSeleccionado.contractMonthlyValue.toLocaleString("es-CO")}`
                      : "Sin información"}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Valor IBC</span>
                  <p className="text-gray-900">
                    {typeof contratoSeleccionado.contractIbcValue === "number"
                      ? `$${contratoSeleccionado.contractIbcValue.toLocaleString("es-CO")}`
                      : "Sin información"}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Duración</span>
                  <p className="text-gray-900">{contratoSeleccionado.contractDuration || "Sin información"}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Fecha de inicio</span>
                  <p className="text-gray-900">{formatearFecha(contratoSeleccionado.contractStartDate)}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Fecha de terminación</span>
                  <p className="text-gray-900">{formatearFecha(contratoSeleccionado.contractEndDate)}</p>
                </div>
                {contratoSeleccionado.companyNameContract && (
                  <div>
                    <span className="font-semibold text-gray-700">Nombre de la empresa contratante</span>
                    <p className="text-gray-900">{contratoSeleccionado.companyNameContract}</p>
                  </div>
                )}
                {contratoSeleccionado.nitCompanyContract && (
                  <div>
                    <span className="font-semibold text-gray-700">NIT de la empresa contratante</span>
                    <p className="text-gray-900">{contratoSeleccionado.nitCompanyContract}</p>
                  </div>
                )}
              </div>

              {esContratoEditable(contratoSeleccionado) ? (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={handleActivarEdicion}
                    disabled={isUpdating}
                  >
                    <PencilLine className="h-4 w-4 mr-2" />
                    Modificar contrato
                  </Button>
                </div>
              ) : (
                <Alert variant="destructive">
                  <AlertTitle>Contrato activo</AlertTitle>
                  <AlertDescription>
                    Este contrato se encuentra activo y no puede modificarse desde la contingencia. Escala la solicitud a nivel 3 por GLPI
                    si requiere ajustes.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Formulario de actualización - Solo después de activar modificación */}
        {mostrarFormulario && puedeEditarContrato && (
            <Card ref={formularioRef}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Actualizar Valor de Contrato
                </CardTitle>
                <CardDescription>
                  Ingrese el tipo de valor, el nuevo valor del contrato y las fechas de vigencia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleActualizacion} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ticketId">
                        Ticket asociado <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="ticketId"
                        placeholder="Ej: INC-123456 o número de ticket"
                        {...updateForm.register("ticketId", {
                          required: "El ticket asociado es obligatorio",
                          minLength: {
                            value: 3,
                            message: "El ticket debe tener al menos 3 caracteres",
                          },
                          maxLength: {
                            value: 50,
                            message: "El ticket no puede superar los 50 caracteres",
                          },
                          pattern: {
                            value: /^[a-zA-Z0-9\-_.]+$/,
                            message: "El ticket solo puede contener letras, números, guiones, puntos o guion bajo",
                          },
                        })}
                        disabled={isUpdating}
                      />
                      {updateForm.formState.errors.ticketId && (
                        <p className="text-sm text-red-500">
                          {updateForm.formState.errors.ticketId.message}
                        </p>
                      )}
                    </div>
                  </div>
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
                        const contrato = contratoSeleccionado
                        if (contrato) {
                          const baseValue = tipoValorSeleccionado === "total"
                            ? contrato.contractTotalValue
                            : contrato.contractMonthlyValue
                          updateForm.setValue("valorContrato", baseValue.toFixed(2), { shouldDirty: false })
                          setValorContratoDisplay(formatCurrencyDisplay(baseValue))
                        } else {
                          updateForm.setValue("valorContrato", "")
                          setValorContratoDisplay("")
                        }
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
                      <Controller
                        name="valorContrato"
                        control={updateForm.control}
                        rules={{
                          validate: (value) => {
                            if (!value) {
                              return "El valor del contrato es obligatorio"
                            }

                            const numericValue = parseFloat(value)
                            if (Number.isNaN(numericValue)) {
                              return "El valor del contrato debe ser un número válido"
                            }

                            return true
                          },
                        }}
                        render={({ field }) => (
                          <Input
                            id="valorContrato"
                            ref={field.ref}
                            value={valorContratoDisplay}
                            placeholder={`Ej: ${formatCurrencyDisplay(MINIMUM_WAGE)}`}
                            inputMode="decimal"
                            onChange={(event) => {
                              const raw = event.target.value
                              if (!raw.trim()) {
                                setValorContratoDisplay("")
                                field.onChange("")
                                return
                              }

                              const result = formatCurrencyInputValue(raw)
                              if (result.exceedsLimit) {
                                return
                              }

                              setValorContratoDisplay(result.formatted)
                              if (Number.isNaN(result.numericValue)) {
                                field.onChange("")
                              } else {
                                field.onChange(result.numericString)
                              }
                            }}
                            onBlur={(event) => {
                              field.onBlur()

                              const result = formatCurrencyInputValue(event.target.value)
                              if (result.exceedsLimit) {
                                return
                              }

                              setValorContratoDisplay(result.formattedWithDecimals)

                              if (!Number.isNaN(result.numericValue)) {
                                field.onChange(result.numericValue.toFixed(2))
                              } else {
                                field.onChange("")
                              }
                            }}
                            disabled={isUpdating}
                          />
                        )}
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
                          value={field.value ? (parsearFechaLocal(field.value) || undefined) : undefined}
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
                        required: "La fecha de fin es obligatoria",
                        validate: (value) => {
                          if (!value) return "La fecha de fin es obligatoria"
                          
                          const fechaInicio = updateForm.getValues("fechaInicio")
                          if (fechaInicio) {
                            const fechaInicioDate = parsearFechaLocal(fechaInicio)
                            const fechaFinDate = parsearFechaLocal(value)
                            if (fechaInicioDate && fechaFinDate && fechaFinDate <= fechaInicioDate) {
                              return "La fecha de fin debe ser posterior a la fecha de inicio"
                            }
                          }
                          
                          return true
                        },
                      }}
                      render={({ field }) => (
                        <DatePicker
                          label="Fecha de Fin"
                          placeholder="Selecciona fecha de fin"
                          value={field.value ? (parsearFechaLocal(field.value) || undefined) : undefined}
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
                          required={true}
                        />
                      )}
                    />
                  </div>


                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLimpiar}
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
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

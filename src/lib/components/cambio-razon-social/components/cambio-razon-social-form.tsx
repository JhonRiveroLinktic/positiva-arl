"use client"

import { useEffect, useState, useRef } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/lib/components/ui/button"
import { Input } from "@/lib/components/ui/input"
import { Label } from "@/lib/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/lib/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/lib/components/ui/card"
import { Checkbox } from "@/lib/components/ui/checkbox"
import { Badge } from "@/lib/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/lib/components/ui/alert"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from "@/lib/components/ui/table"
import { useCambioRazonSocialStore } from "../stores/cambio-razon-social-store"
import { documentTypesValorContrato } from "@/lib/components/actualizacion-valor-contrato/options/document-types"
import { toast } from "@/lib/utils/toast"
import { Search, Loader2, UserCheck, Save, X, Info, PencilLine, Eye } from "lucide-react"
import { supabase } from "@/lib/utils/supabase"
import { useAuth } from "@/lib/components/core/auth/auth-context"
import type { 
  BusquedaRegistroFormData, 
  CambioRazonSocialFormData,
  CambioRazonSocialPayload,
  DatosRegistro,
  RegistroRazonSocial,
  ApiResponseActualizacion,
  RegistroTrazabilidadCambioRazonSocial
} from "../types/cambio-razon-social-types"

const formatearFecha = (fecha?: string | null) => {
  if (!fecha) return "-"
  try {
    const parsed = new Date(fecha)
    if (Number.isNaN(parsed.getTime()) || parsed.getFullYear() < 1970) return "-"
    return parsed.toLocaleDateString("es-CO")
  } catch {
    return "-"
  }
}

const formatearNombreCompleto = (registro: RegistroRazonSocial): string => {
  const partes = [
    registro.first_name,
    registro.second_name,
    registro.surname,
    registro.second_surname,
  ].filter(Boolean)
  return partes.join(" ") || "-"
}

const formatearNaturaleza = (personType?: string | null): string => {
  if (!personType || personType === "N/A") return "-"
  if (personType === "J") return "Jurídica"
  if (personType === "N") return "Natural"
  return personType
}

const esTrabajadorDependiente = (affiliationType?: string | null): boolean => {
  if (!affiliationType) return false
  return affiliationType.trim() === "Trabajador Dependiente"
}

const esVoluntario = (contractTypeVinculation?: string | null): boolean => {
  if (!contractTypeVinculation) return false
  return contractTypeVinculation.trim() === "Voluntario"
}


export function CambioRazonSocialForm() {
  const { user } = useAuth()
  const correoUsuario = user?.email || "admin@positiva.com"
  
  const {
    datosRegistro,
    isSearching,
    isUpdating,
    setDatosRegistro,
    setRegistroSeleccionado,
    setIsSearching,
    setIsUpdating,
    limpiarDatos,
  } = useCambioRazonSocialStore()

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [datosActualizados, setDatosActualizados] = useState<ApiResponseActualizacion | null>(null)
  const formularioRef = useRef<HTMLDivElement>(null)

  const searchForm = useForm<BusquedaRegistroFormData>({
    mode: "onChange",
    defaultValues: {
      tipoDocumento: "",
      numeroDocumento: "",
    },
  })

  const updateForm = useForm<CambioRazonSocialFormData>({
    mode: "onChange",
    defaultValues: {
      modificarRazonSocial: false,
      modificarNit: false,
      modificarNaturaleza: false,
      nuevaRazonSocial: "",
      nuevoNit: "",
      nuevoDv: "",
      nuevaNaturaleza: "",
      ticketId: "",
    },
  })

  const registros = datosRegistro?.registros ?? []
  const registroSeleccionado = datosRegistro?.registroSeleccionado

  const manejarSeleccionRegistro = (registro: RegistroRazonSocial) => {
    setRegistroSeleccionado(registro)
    setMostrarFormulario(false)
  }

  const handleActivarEdicion = () => {
    if (!registroSeleccionado) return

    setMostrarFormulario(true)
    updateForm.reset({
      modificarRazonSocial: false,
      modificarNit: false,
      modificarNaturaleza: false,
      nuevaRazonSocial: registroSeleccionado.company,
      nuevoNit: registroSeleccionado.nit,
      nuevoDv: registroSeleccionado.dv,
      nuevaNaturaleza: (registroSeleccionado.person_type as "N" | "J" | "") || "",
      ticketId: "",
    })

    setTimeout(() => {
      formularioRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }

  // Buscar registros
  const buscarRegistros = async (data: BusquedaRegistroFormData) => {
    if (!data.tipoDocumento || data.tipoDocumento === "") {
      toast.error({
        title: "Tipo de documento requerido",
        description: "Debes seleccionar un tipo de documento para realizar la búsqueda.",
      })
      return
    }

    setIsSearching(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BALU
      if (!apiUrl) {
        throw new Error("La URL de la API no está configurada")
      }

      const response = await fetch(`${apiUrl}/afiliaciones/legal-name/obtenerRadicado/${data.tipoDocumento}/${data.numeroDocumento}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("No se encontraron registros para el documento ingresado")
        }

        const errorData = await response.json().catch(() => null)
        const errorMessage =
          errorData?.detail ||
          errorData?.message ||
          errorData?.error?.message ||
          response.statusText ||
          "No se pudo completar la búsqueda"

        if (errorMessage && errorMessage.toLowerCase().includes("no se pudo obtener el usuario de bbdd")) {
          throw new Error("No se encontró información para el documento consultado.")
        }

        throw new Error(`Error ${response.status}: ${errorMessage}`)
      }

      const registrosData: RegistroRazonSocial[] = await response.json()

      if (!registrosData || registrosData.length === 0) {
        toast.error({
          title: "No se encontraron registros",
          description: "No se encontraron registros para el documento ingresado.",
        })
        setDatosRegistro(null)
        return
      }

      const datos: DatosRegistro = {
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento,
        registros: registrosData,
      }

      setDatosRegistro(datos)
      toast.success({
        title: "Registros encontrados",
        description: `Se encontraron ${registrosData.length} registro(s).`,
      })
    } catch (error) {
      console.error("Error al buscar registros:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      toast.error({
        title: "Error en la búsqueda",
        description: errorMessage.includes("No se pudo obtener el usuario de BBDD")
          ? "No se encontró al afiliado con el documento ingresado."
          : errorMessage,
      })
      setDatosRegistro(null)
    } finally {
      setIsSearching(false)
    }
  }

  // Actualizar razón social/NIT
  const actualizarRazonSocial = async (data: CambioRazonSocialFormData) => {
    if (!registroSeleccionado) {
      toast.error({
        title: "Error",
        description: "No hay un registro seleccionado para actualizar.",
      })
      return
    }

    if (!data.modificarRazonSocial && !data.modificarNit && !data.modificarNaturaleza) {
      toast.error({
        title: "Campos requeridos",
        description: "Debes seleccionar al menos un campo para modificar (Razón Social, NIT o Naturaleza).",
      })
      return
    }

    // Validar cambio de naturaleza: solo de Natural a Jurídica
    if (data.modificarNaturaleza) {
      const naturalezaActual = registroSeleccionado.person_type
      if (naturalezaActual === "J") {
        toast.error({
          title: "Cambio no permitido",
          description: "No se puede cambiar de Jurídica a Natural. Solo se permite cambiar de Natural a Jurídica.",
        })
        return
      }
      if (data.nuevaNaturaleza !== "J") {
        toast.error({
          title: "Valor inválido",
          description: "Solo se permite cambiar a Jurídica (J).",
        })
        return
      }
    }

    const ticketId = data.ticketId.trim()
    if (!ticketId) {
      toast.error({
        title: "Ticket requerido",
        description: "El ticket asociado es obligatorio.",
      })
      return
    }

    // Validar que los datos nuevos sean diferentes a los anteriores
    const razonSocialCambio = data.modificarRazonSocial && 
      data.nuevaRazonSocial.trim() !== registroSeleccionado.company.trim()
    const nitCambio = data.modificarNit && 
      (data.nuevoNit.trim() !== registroSeleccionado.nit.trim() || 
       data.nuevoDv.trim() !== registroSeleccionado.dv.trim())
    const naturalezaCambio = data.modificarNaturaleza && 
      data.nuevaNaturaleza !== (registroSeleccionado.person_type || "")

    if (!razonSocialCambio && !nitCambio && !naturalezaCambio) {
      toast.error({
        title: "Sin cambios detectados",
        description: "Los datos ingresados son idénticos a los registrados previamente. Debes modificar al menos un campo.",
      })
      return
    }

    setIsUpdating(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BALU
      if (!apiUrl) {
        throw new Error("La URL de la API no está configurada")
      }

      // El backend requiere todos los campos siempre, incluso si no se modifican
      // Si se modifica, enviamos el nuevo valor; si no, enviamos el original
      const payload: CambioRazonSocialPayload = {
        filedNumber: registroSeleccionado.filed_number,
        company: data.modificarRazonSocial 
          ? data.nuevaRazonSocial.trim() 
          : registroSeleccionado.company,
        nit: data.modificarNit 
          ? data.nuevoNit.trim() 
          : registroSeleccionado.nit,
        dv: data.modificarNit 
          ? data.nuevoDv.trim() 
          : registroSeleccionado.dv,
        type_person: data.modificarNaturaleza 
          ? (data.nuevaNaturaleza as "N" | "J")
          : (registroSeleccionado.person_type as "N" | "J" | undefined) || "N",
      }

      const response = await fetch(`${apiUrl}/afiliaciones/legal-name`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMessage =
          errorData?.detail ||
          errorData?.message ||
          errorData?.error?.message ||
          response.statusText ||
          "No se pudo actualizar el registro"
        throw new Error(`Error ${response.status}: ${errorMessage}`)
      }

      const responseData: ApiResponseActualizacion = await response.json()

      // Determinar tipo de cambio - texto descriptivo
      const cambios: string[] = []
      if (data.modificarRazonSocial) {
        cambios.push("razon social")
      }
      if (data.modificarNit) {
        cambios.push("nit")
      }
      if (data.modificarNaturaleza) {
        cambios.push("naturaleza")
      }
      const tipoCambio = cambios.join(", ")

      // Preparar datos de trazabilidad
      const trazabilidadPayload: RegistroTrazabilidadCambioRazonSocial = {
        tipo_documento: datosRegistro?.tipoDocumento || "",
        numero_documento: datosRegistro?.numeroDocumento || "",
        filed_number: registroSeleccionado.filed_number,
        razon_social_anterior: data.modificarRazonSocial ? registroSeleccionado.company : null,
        nueva_razon_social: data.modificarRazonSocial ? responseData.company : null,
        nit_anterior: data.modificarNit ? registroSeleccionado.nit : null,
        nuevo_nit: data.modificarNit ? responseData.nit : null,
        dv_anterior: data.modificarNit ? registroSeleccionado.dv : null,
        nuevo_dv: data.modificarNit ? responseData.dv : null,
        naturaleza_anterior: data.modificarNaturaleza ? registroSeleccionado.person_type : null,
        nueva_naturaleza: data.modificarNaturaleza ? responseData.person_type : null,
        tipo_cambio: tipoCambio,
        correo_modifico: correoUsuario,
        ticket_id: ticketId,
      }

      // Ejecutar actualización y trazabilidad en paralelo
      const trazabilidadPromise = supabase
        .from("trazabilidad_cambios_razon_social")
        .insert([trazabilidadPayload])
        .select()
        .single()

      const [trazabilidadResult] = await Promise.all([
        trazabilidadPromise,
      ])

      if (trazabilidadResult.error) {
        console.error("Error al guardar trazabilidad:", trazabilidadResult.error)
        toast.warning({
          title: "Trazabilidad no disponible",
          description: "No se pudo registrar la trazabilidad en Supabase. Ejecuta el script de actualización de la tabla cuando sea posible.",
        })
      }

      setDatosActualizados(responseData)
      setShowSuccessModal(true)
      setMostrarFormulario(false)
      
      toast.success({
        title: "Actualización exitosa",
        description: "El registro se ha actualizado correctamente.",
      })

      // Actualizar el registro en el store
      if (datosRegistro) {
        const registrosActualizados = datosRegistro.registros.map(r => 
          r.filed_number === registroSeleccionado.filed_number 
            ? {
                ...r,
                company: responseData.company,
                nit: responseData.nit,
                dv: responseData.dv,
                person_type: responseData.person_type,
              }
            : r
        )
        setDatosRegistro({
          ...datosRegistro,
          registros: registrosActualizados,
          registroSeleccionado: {
            ...registroSeleccionado,
            company: responseData.company,
            nit: responseData.nit,
            dv: responseData.dv,
            person_type: responseData.person_type,
          },
        })
      }
    } catch (error) {
      console.error("Error al actualizar:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      toast.error({
        title: "Error al actualizar",
        description: errorMessage,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLimpiar = () => {
    searchForm.reset()
    updateForm.reset({
      modificarRazonSocial: false,
      modificarNit: false,
      modificarNaturaleza: false,
      nuevaRazonSocial: "",
      nuevoNit: "",
      nuevoDv: "",
      nuevaNaturaleza: "",
      ticketId: "",
    })
    limpiarDatos()
    setMostrarFormulario(false)
    setShowSuccessModal(false)
    setDatosActualizados(null)
  }

  const handleLimpiarForm = () => {
    updateForm.reset({
      modificarRazonSocial: false,
      modificarNit: false,
      modificarNaturaleza: false,
      nuevaRazonSocial: registroSeleccionado?.company || "",
      nuevoNit: registroSeleccionado?.nit || "",
      nuevoDv: registroSeleccionado?.dv || "",
      nuevaNaturaleza: (registroSeleccionado?.person_type as "N" | "J" | "") || "",
      ticketId: "",
    })
    setMostrarFormulario(false)
  }

  const handleCerrarModal = () => {
    setShowSuccessModal(false)
    setDatosActualizados(null)
    setMostrarFormulario(false)
  }

  // Pre-cargar datos cuando se selecciona un registro
  useEffect(() => {
    if (registroSeleccionado && mostrarFormulario) {
      updateForm.setValue("nuevaRazonSocial", registroSeleccionado.company)
      updateForm.setValue("nuevoNit", registroSeleccionado.nit)
      updateForm.setValue("nuevoDv", registroSeleccionado.dv)
      updateForm.setValue("nuevaNaturaleza", (registroSeleccionado.person_type as "N" | "J" | "") || "")
    }
  }, [registroSeleccionado, mostrarFormulario, updateForm])

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Formulario de búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Búsqueda de Registro
          </CardTitle>
          <CardDescription>
            Ingresa el tipo y número de documento para buscar los registros asociados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={searchForm.handleSubmit(buscarRegistros)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipoDocumento">Tipo de Documento *</Label>
                <Controller
                  name="tipoDocumento"
                  control={searchForm.control}
                  rules={{
                    required: "El tipo de documento es obligatorio",
                  }}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger 
                        id="tipoDocumento" 
                        aria-invalid={!!searchForm.formState.errors.tipoDocumento}
                        className={searchForm.formState.errors.tipoDocumento ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypesValorContrato.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {searchForm.formState.errors.tipoDocumento && (
                  <p className="text-sm text-red-600">
                    {searchForm.formState.errors.tipoDocumento.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroDocumento">Número de Documento *</Label>
                <Controller
                  name="numeroDocumento"
                  control={searchForm.control}
                  rules={{
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
                  }}
                  render={({ field }) => (
                    <Input
                      id="numeroDocumento"
                      placeholder="Ingresa el número de documento"
                      aria-invalid={!!searchForm.formState.errors.numeroDocumento}
                      className={searchForm.formState.errors.numeroDocumento ? "border-red-500" : ""}
                      {...field}
                    />
                  )}
                />
              </div>

              <div className="flex items-center">
                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tabla de registros */}
      {registros.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Registros Encontrados ({registros.length})
            </CardTitle>
            <CardDescription>
              Selecciona un registro para ver los detalles y modificarlo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filed Number</TableHead>
                    <TableHead>Tipo de Afiliación</TableHead>
                    <TableHead>Razón Social</TableHead>
                    <TableHead>NIT</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registros.map((registro) => (
                    <TableRow
                      key={registro.filed_number}
                      className={registroSeleccionado?.filed_number === registro.filed_number ? "bg-orange-50" : ""}
                    >
                      <TableCell className="font-mono text-sm">{registro.filed_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{registro.affiliation_type}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{registro.company}</TableCell>
                      <TableCell className="font-mono">
                        {registro.nit}-{registro.dv}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={registro.affiliation_status === "Activa" ? "default" : "secondary"}
                        >
                          {registro.affiliation_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => manejarSeleccionRegistro(registro)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detalles del registro seleccionado */}
      {registroSeleccionado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Detalles del Registro
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Información de la Persona */}
            <div className="mb-6 pb-4 border-b">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">Información de la Persona</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="font-semibold text-gray-700">Nombre Completo</span>
                  <p className="text-gray-900">{formatearNombreCompleto(registroSeleccionado)}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Tipo de Documento</span>
                  <p className="text-gray-900">{registroSeleccionado.document_type}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Número de Documento</span>
                  <p className="text-gray-900 font-mono">{registroSeleccionado.documentNumber}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Fecha de Nacimiento</span>
                  <p className="text-gray-900">{formatearFecha(registroSeleccionado.date_of_birth)}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Edad</span>
                  <p className="text-gray-900">{registroSeleccionado.age} años</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Teléfono</span>
                  <p className="text-gray-900">{registroSeleccionado.phone_1 || "-"}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Naturaleza</span>
                  <p className="text-gray-900">{formatearNaturaleza(registroSeleccionado.person_type)}</p>
                </div>
              </div>
            </div>

            {/* Información de la Empresa/Afiliación */}
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">Información de la Afiliación</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="font-semibold text-gray-700">Filed Number</span>
                  <p className="text-gray-900 font-mono">{registroSeleccionado.filed_number}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Tipo de Afiliación</span>
                  <p className="text-gray-900">{registroSeleccionado.affiliation_type}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Tipo de Vinculación</span>
                  <p className="text-gray-900">{registroSeleccionado.contractTypeVinculation}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Razón Social</span>
                  <p className="text-gray-900">{registroSeleccionado.company}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">NIT</span>
                  <p className="text-gray-900 font-mono">{registroSeleccionado.nit}-{registroSeleccionado.dv}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Estado</span>
                  <p className="text-gray-900">{registroSeleccionado.affiliation_status}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Fecha de Afiliación</span>
                  <p className="text-gray-900">{formatearFecha(registroSeleccionado.affiliation_date)}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Fecha de Inicio de Cobertura</span>
                  <p className="text-gray-900">{formatearFecha(registroSeleccionado.coverage_start_date)}</p>
                </div>
              </div>
            </div>

            {esTrabajadorDependiente(registroSeleccionado.affiliation_type) ? (
              <Alert variant="destructive">
                <AlertTitle>Registro de Trabajador Dependiente</AlertTitle>
                <AlertDescription>
                  Este registro corresponde a un trabajador dependiente y no puede modificarse desde la contingencia. 
                  El empleador debe actualizar directamente desde Balú.
                </AlertDescription>
              </Alert>
            ) : esVoluntario(registroSeleccionado.contractTypeVinculation) ? (
              <Alert variant="destructive">
                <AlertTitle>Registro de Afiliación Voluntaria</AlertTitle>
                <AlertDescription>
                  Este registro corresponde a una afiliación voluntaria (Decreto 1563) y no puede modificarse desde la contingencia. 
                  Los voluntarios tienen una razón social y NIT específicos que no pueden ser alterados.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="flex justify-end">
                <Button
                  type="button"
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={handleActivarEdicion}
                  disabled={isUpdating}
                >
                  <PencilLine className="h-4 w-4 mr-2" />
                  Modificar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Formulario de actualización */}
      {mostrarFormulario && registroSeleccionado && (
        <Card ref={formularioRef}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Actualizar Razón Social / NIT
            </CardTitle>
            <CardDescription>
              Selecciona los campos que deseas modificar y completa la información
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={updateForm.handleSubmit(actualizarRazonSocial)}
              className="space-y-6"
            >
              {/* Checkboxes para activar edición */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="modificarRazonSocial"
                    control={updateForm.control}
                    rules={{
                      validate: (value, formValues) => {
                        if (!value && !formValues.modificarNit && !formValues.modificarNaturaleza) {
                          return "Debes seleccionar al menos un campo para modificar (Razón Social, NIT o Naturaleza)"
                        }
                        return true
                      },
                    }}
                    render={({ field }) => (
                      <Checkbox
                        id="modificarRazonSocial"
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked)
                          if (!checked) {
                            updateForm.setValue("nuevaRazonSocial", registroSeleccionado.company)
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="modificarRazonSocial" className="font-normal cursor-pointer">
                    Modificar Razón Social
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Controller
                    name="modificarNit"
                    control={updateForm.control}
                    rules={{
                      validate: (value, formValues) => {
                        if (!value && !formValues.modificarRazonSocial && !formValues.modificarNaturaleza) {
                          return "Debes seleccionar al menos un campo para modificar (Razón Social, NIT o Naturaleza)"
                        }
                        return true
                      },
                    }}
                    render={({ field }) => (
                      <Checkbox
                        id="modificarNit"
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked)
                          if (!checked) {
                            updateForm.setValue("nuevoNit", registroSeleccionado.nit)
                            updateForm.setValue("nuevoDv", registroSeleccionado.dv)
                          }
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="modificarNit" className="font-normal cursor-pointer">
                    Modificar NIT
                  </Label>
                </div>

                {/* Checkbox de naturaleza - Solo para Empleadores con person_type "N" */}
                {registroSeleccionado?.affiliation_type?.toLowerCase().includes("empleador") && 
                 registroSeleccionado?.person_type === "N" && (
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="modificarNaturaleza"
                      control={updateForm.control}
                      rules={{
                        validate: (value, formValues) => {
                          if (!value && !formValues.modificarRazonSocial && !formValues.modificarNit) {
                            return "Debes seleccionar al menos un campo para modificar (Razón Social, NIT o Naturaleza)"
                          }
                          return true
                        },
                      }}
                      render={({ field }) => (
                        <Checkbox
                          id="modificarNaturaleza"
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked)
                            if (!checked) {
                              updateForm.setValue("nuevaNaturaleza", (registroSeleccionado.person_type as "N" | "J" | "") || "")
                            } else {
                              // Solo permitir cambiar a Jurídica
                              updateForm.setValue("nuevaNaturaleza", "J")
                            }
                          }}
                        />
                      )}
                    />
                    <Label htmlFor="modificarNaturaleza" className="font-normal cursor-pointer">
                      Modificar Naturaleza (Solo Natural → Jurídica)
                    </Label>
                  </div>
                )}
              </div>

              {/* Campos de edición */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nuevaRazonSocial">
                    Razón Social {updateForm.watch("modificarRazonSocial") && "*"}
                  </Label>
                  <Controller
                    name="nuevaRazonSocial"
                    control={updateForm.control}
                    rules={{
                      validate: (value, formValues) => {
                        if (formValues.modificarRazonSocial) {
                          if (!value || value.trim() === "") {
                            return "La razón social es obligatoria cuando está marcada para modificar"
                          }
                          if (value.trim().length < 3) {
                            return "La razón social debe tener al menos 3 caracteres"
                          }
                          if (value.trim().length > 200) {
                            return "La razón social no puede superar los 200 caracteres"
                          }
                        }
                        return true
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        id="nuevaRazonSocial"
                        placeholder="Ingresa la nueva razón social"
                        disabled={!updateForm.watch("modificarRazonSocial") || isUpdating}
                        aria-invalid={!!updateForm.formState.errors.nuevaRazonSocial}
                        className={updateForm.formState.errors.nuevaRazonSocial ? "border-red-500" : ""}
                        {...field}
                      />
                    )}
                  />
                  {updateForm.formState.errors.nuevaRazonSocial && (
                    <p className="text-sm text-red-600">
                      {updateForm.formState.errors.nuevaRazonSocial.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nuevoNit">
                      NIT {updateForm.watch("modificarNit") && "*"}
                    </Label>
                    <Controller
                      name="nuevoNit"
                      control={updateForm.control}
                      rules={{
                        validate: (value, formValues) => {
                          if (formValues.modificarNit) {
                            if (!value || value.trim() === "") {
                              return "El NIT es obligatorio cuando está marcado para modificar"
                            }
                            if (!/^\d+$/.test(value.trim())) {
                              return "El NIT solo puede contener números"
                            }
                            if (value.trim().length < 5) {
                              return "El NIT debe tener al menos 5 dígitos"
                            }
                            if (value.trim().length > 20) {
                              return "El NIT no puede superar los 20 dígitos"
                            }
                          }
                          return true
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          id="nuevoNit"
                          placeholder="Ingresa el nuevo NIT"
                          disabled={!updateForm.watch("modificarNit") || isUpdating}
                          aria-invalid={!!updateForm.formState.errors.nuevoNit}
                          className={updateForm.formState.errors.nuevoNit ? "border-red-500" : ""}
                          {...field}
                        />
                      )}
                    />
                    {updateForm.formState.errors.nuevoNit && (
                      <p className="text-sm text-red-600">
                        {updateForm.formState.errors.nuevoNit.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nuevoDv">
                      DV {updateForm.watch("modificarNit") && "*"}
                    </Label>
                    <Controller
                      name="nuevoDv"
                      control={updateForm.control}
                      rules={{
                        validate: (value, formValues) => {
                          if (formValues.modificarNit) {
                            if (!value || value.trim() === "") {
                              return "El dígito de verificación (DV) es obligatorio cuando se modifica el NIT"
                            }
                            if (!/^\d+$/.test(value.trim())) {
                              return "El dígito de verificación solo puede contener números"
                            }
                            if (value.trim().length !== 1) {
                              return "El dígito de verificación debe tener exactamente 1 dígito"
                            }
                          }
                          return true
                        },
                      }}
                      render={({ field }) => (
                        <Input
                          id="nuevoDv"
                          placeholder="DV"
                          maxLength={1}
                          disabled={!updateForm.watch("modificarNit") || isUpdating}
                          aria-invalid={!!updateForm.formState.errors.nuevoDv}
                          className={updateForm.formState.errors.nuevoDv ? "border-red-500" : ""}
                          {...field}
                        />
                      )}
                    />
                    {updateForm.formState.errors.nuevoDv && (
                      <p className="text-sm text-red-600">
                        {updateForm.formState.errors.nuevoDv.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Campo de Naturaleza - Solo para Empleadores con person_type "N" */}
                {registroSeleccionado?.affiliation_type?.toLowerCase().includes("empleador") && 
                 registroSeleccionado?.person_type === "N" && (
                  <div className="space-y-2">
                    <Label htmlFor="nuevaNaturaleza">
                      Naturaleza {updateForm.watch("modificarNaturaleza") && "*"}
                    </Label>
                    <Controller
                      name="nuevaNaturaleza"
                      control={updateForm.control}
                      rules={{
                        validate: (value, formValues) => {
                          if (formValues.modificarNaturaleza) {
                            if (!value) {
                              return "La naturaleza es obligatoria cuando está marcada para modificar"
                            }
                            if (value !== "N" && value !== "J") {
                              return "La naturaleza debe ser Natural (N) o Jurídica (J)"
                            }
                          }
                          return true
                        },
                      }}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!updateForm.watch("modificarNaturaleza") || isUpdating}
                        >
                          <SelectTrigger
                            id="nuevaNaturaleza"
                            aria-invalid={!!updateForm.formState.errors.nuevaNaturaleza}
                            className={updateForm.formState.errors.nuevaNaturaleza ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Selecciona la naturaleza" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Solo mostrar Jurídica ya que solo se puede cambiar de N a J */}
                            <SelectItem value="J">Jurídica (J)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {updateForm.formState.errors.nuevaNaturaleza && (
                      <p className="text-sm text-red-600">
                        {updateForm.formState.errors.nuevaNaturaleza.message}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="ticketId">Número de Ticket (GLPI) *</Label>
                  <Controller
                    name="ticketId"
                    control={updateForm.control}
                    rules={{
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
                    }}
                    render={({ field }) => (
                      <Input
                        id="ticketId"
                        placeholder="Ingresa el número de ticket de GLPI"
                        aria-invalid={!!updateForm.formState.errors.ticketId}
                        className={updateForm.formState.errors.ticketId ? "border-red-500" : ""}
                        disabled={isUpdating}
                        {...field}
                      />
                    )}
                  />
                  {updateForm.formState.errors.ticketId && (
                    <p className="text-sm text-red-600">
                      {updateForm.formState.errors.ticketId.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLimpiarForm}
                  disabled={isUpdating}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={
                    isUpdating ||
                    !updateForm.watch("ticketId")?.trim() ||
                    (!updateForm.watch("modificarRazonSocial") && 
                     !updateForm.watch("modificarNit") && 
                     !updateForm.watch("modificarNaturaleza"))
                  }
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Actualizar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Modal de éxito */}
      {showSuccessModal && datosActualizados && registroSeleccionado && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-green-600">Actualización Exitosa</CardTitle>
              <CardDescription>
                El registro se ha actualizado correctamente. A continuación se muestran los datos anteriores y nuevos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Datos Anteriores</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold text-gray-700">Razón Social</span>
                    <p className="text-gray-900">{registroSeleccionado.company}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">NIT</span>
                    <p className="text-gray-900 font-mono">{registroSeleccionado.nit}-{registroSeleccionado.dv}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Datos Actualizados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold text-gray-700">Razón Social</span>
                    <p className="text-gray-900">{datosActualizados.company}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">NIT</span>
                    <p className="text-gray-900 font-mono">{datosActualizados.nit}-{datosActualizados.dv}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={handleCerrarModal}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Cerrar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLimpiar}
                >
                  Nueva Búsqueda
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}


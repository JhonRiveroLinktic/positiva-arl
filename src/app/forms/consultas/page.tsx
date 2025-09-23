"use client"

import { useState, useEffect } from "react"
import { Button } from "@/lib/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card"
import { FormProvider, useFormContext } from "@/lib/components/core/form/form-provider"
import { FormInput } from "@/lib/components/core/form/form-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/lib/components/ui/select"
import { supabase } from "@/lib/utils/supabase"
import { toast } from "@/lib/utils/toast"
import { Search, Loader2, FileText, User, Building } from "lucide-react"
import { Controller } from "react-hook-form"
import { ProtectedRoute } from "@/lib/components/core/auth/protected-route"
import { Header } from "@/lib/components/core/components/header"

interface ConsultaFormData {
  formulario: string
  tipoDocumento: string
  numeroDocumento: string
}

interface Registro {
  id: string
  [key: string]: any
}

const formularios = [
  {
    value: "registros_arl",
    label: "Registros ARL - Balú",
    tabla: "registros_arl",
    campoTrabajador: true,
    campoEmpleador: false,
    camposTrabajador: {
      tipo: "tipo_doc_persona",
      numero: "nume_doc_persona"
    },
    camposEmpleador: null
  },
  {
    value: "registros_arl_seguimiento",
    label: "Seguimiento Afiliaciones ARL",
    tabla: "registros_arl_seguimiento",
    campoTrabajador: true,
    campoEmpleador: true,
    camposTrabajador: {
      tipo: "tipo_doc_persona",
      numero: "nume_doc_persona"
    },
    camposEmpleador: {
      tipo: "tipo_doc_emp",
      numero: "nume_doc_emp"
    }
  },
  {
    value: "independiente_voluntario",
    label: "Independiente Voluntario",
    tabla: "independiente_voluntario",
    campoTrabajador: true,
    campoEmpleador: false,
    camposTrabajador: {
      tipo: "tipo_doc_trabajador",
      numero: "nume_doc_trabajador"
    },
    camposEmpleador: null
  },
  {
    value: "independiente_con_contrato",
    label: "Independiente con Contrato",
    tabla: "independiente_con_contrato",
    campoTrabajador: true,
    campoEmpleador: true,
    camposTrabajador: {
      tipo: "tipo_doc_trabajador",
      numero: "nume_doc_trabajador"
    },
    camposEmpleador: {
      tipo: "tipo_doc_contratante",
      numero: "nume_doc_contratante"
    }
  },
  {
    value: "retiro_trabajadores",
    label: "Retiro Trabajadores",
    tabla: "retiro_trabajadores",
    campoTrabajador: true,
    campoEmpleador: true,
    camposTrabajador: {
      tipo: "tipo_doc_trabajador",
      numero: "documento_trabajador"
    },
    camposEmpleador: {
      tipo: "tipo_doc_empleador",
      numero: "documento_empleador"
    }
  },
  {
    value: "prorroga_fecha_contrato_trabajador_indep",
    label: "Prorroga Fecha Contrato",
    tabla: "prorroga_fecha_contrato_trabajador_indep",
    campoTrabajador: true,
    campoEmpleador: true,
    camposTrabajador: {
      tipo: "tipo_doc_trabajador",
      numero: "documento_trabajador"
    },
    camposEmpleador: {
      tipo: "tipo_doc_contratante",
      numero: "documento_contratante"
    }
  },
  {
    value: "notificacion_desplazamiento_trabajador",
    label: "Notificación Desplazamiento",
    tabla: "notificacion_desplazamiento_trabajador",
    campoTrabajador: true,
    campoEmpleador: true,
    camposTrabajador: {
      tipo: "tipo_documento_trabajador",
      numero: "documento_trabajador"
    },
    camposEmpleador: {
      tipo: "tipo_documento_empleador",
      numero: "documento_empleador"
    }
  },
  {
    value: "novedad_actualizacion_cargo_trabajador",
    label: "Novedad Actualización Cargo",
    tabla: "novedad_actualizacion_cargo_trabajador",
    campoTrabajador: true,
    campoEmpleador: true,
    camposTrabajador: {
      tipo: "tipo_doc_trabajador",
      numero: "documento_trabajador"
    },
    camposEmpleador: {
      tipo: "tipo_doc_empleador",
      numero: "documento_empleador"
    }
  },
  {
    value: "novedad_actualizacion_datos_empleador",
    label: "Novedad Actualización Datos Empleador",
    tabla: "novedad_actualizacion_datos_empleador",
    campoTrabajador: false,
    campoEmpleador: true,
    camposTrabajador: null,
    camposEmpleador: {
      tipo: "tipo_documento_empleador",
      numero: "documento_empleador"
    }
  },
  {
    value: "novedad_actualizacion_datos_trabajador",
    label: "Novedad Actualización Datos Trabajador",
    tabla: "novedad_actualizacion_datos_trabajador",
    campoTrabajador: true,
    campoEmpleador: false,
    camposTrabajador: {
      tipo: "tipo_documento_trabajador",
      numero: "documento_trabajador"
    },
    camposEmpleador: null
  },
  {
    value: "novedad_retiro_empleador",
    label: "Novedad Retiro Empleador",
    tabla: "novedad_retiro_empleador",
    campoTrabajador: false,
    campoEmpleador: true,
    camposTrabajador: null,
    camposEmpleador: {
      tipo: "tipo_documento_empleador",
      numero: "documento_empleador"
    }
  },
  {
    value: "novedad_sede_empleador",
    label: "Novedad Sede Empleador",
    tabla: "novedad_sede_empleador",
    campoTrabajador: false,
    campoEmpleador: true,
    camposTrabajador: null,
    camposEmpleador: {
      tipo: "tipo_documento_empleador",
      numero: "documento_empleador"
    }
  },
  {
    value: "cambio_ocupacion_independiente_voluntario",
    label: "Cambio Ocupación Independiente Voluntario",
    tabla: "cambio_ocupacion_independiente_voluntario",
    campoTrabajador: true,
    campoEmpleador: false,
    camposTrabajador: {
      tipo: "tipo_doc_trabajador",
      numero: "documento_trabajador"
    },
    camposEmpleador: null
  },
  {
    value: "cambio_actividad_economica_independiente_con_contrato",
    label: "Cambio Actividad Económica Independiente con Contrato",
    tabla: "cambio_actividad_economica_independiente_con_contrato",
    campoTrabajador: true,
    campoEmpleador: true,
    camposTrabajador: {
      tipo: "tipo_doc_trabajador",
      numero: "nume_doc_trabajador"
    },
    camposEmpleador: {
      tipo: "tipo_doc_contratante",
      numero: "nume_doc_contratante"
    }
  },
  {
    value: "afiliacion_empleador_datos",
    label: "Afiliación Empleador",
    tabla: "afiliacion_empleador_datos",
    campoTrabajador: false,
    campoEmpleador: true,
    camposTrabajador: null,
    camposEmpleador: {
      tipo: "tipo_doc_empleador",
      numero: "documento_empleador"
    }
  }
]

// Tipos de documento que manejan las inconsistencias en la BD
const tiposDocumento = [
  { value: "CC", label: "Cédula de Ciudadanía", alternativos: ["C", "c", "cc"] },
  { value: "CE", label: "Cédula de Extranjería", alternativos: ["E", "e", "ce"] },
  { value: "TI", label: "Tarjeta de Identidad", alternativos: ["T", "t", "ti"] },
  { value: "NIT", label: "NIT", alternativos: ["N", "NI", "n", "ni", "nit"] },
  { value: "CD", label: "Carnet Diplomático", alternativos: ["D", "d", "cd"] },
  { value: "RC", label: "Registro Civil", alternativos: ["R", "r", "rc"] },
  { value: "NUIP", label: "NUIP", alternativos: ["U", "u", "nuip"] },
  { value: "PPT", label: "Permiso Protección Temporal", alternativos: ["L", "PT", "l", "pt", "ppt"] },
  { value: "SC", label: "Salvoconducto", alternativos: ["SC", "sc"] },
  { value: "PP", label: "Pasaporte", alternativos: ["PP", "pp"] },
  { value: "DE", label: "Documento de Extranjería", alternativos: ["DE", "de"] }
]

// Función para obtener email usando RPC
const obtenerEmailUsuario = async (userId: string): Promise<string> => {
  if (!userId) return 'N/A'
  
  try {
    // Usar la función RPC para obtener el email
    const { data, error } = await supabase
      .rpc('get_user_email', { user_id: userId })
    
    if (!error && data && data !== 'Usuario no encontrado') {
      return data
    }
    
    // Si no funciona la RPC, intentar desde profiles directamente
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()
    
    if (!profileError && profile?.email) {
      return profile.email
    }
    
    // Si no se encuentra, devolver el UUID truncado
    return `${userId.substring(0, 8)}...`
  } catch (error) {
    console.error('Error obteniendo email del usuario:', error)
    return `${userId.substring(0, 8)}...`
  }
}

// Cache para emails ya consultados
const emailCache = new Map<string, string>()

// Función para obtener email con cache
const obtenerEmailConCache = async (userId: string): Promise<string> => {
  if (!userId) return 'N/A'
  
  // Verificar cache
  if (emailCache.has(userId)) {
    return emailCache.get(userId)!
  }
  
  // Obtener email
  const email = await obtenerEmailUsuario(userId)
  
  // Guardar en cache
  emailCache.set(userId, email)
  
  return email
}

function ConsultaFormFields() {
  const { control, watch } = useFormContext()
  const [formularioSeleccionado, setFormularioSeleccionado] = useState("")
  
  const formulario = formularios.find(f => f.value === formularioSeleccionado)

  const mostrarCampos = Boolean(formularioSeleccionado && formulario)

  return (
    <div className="space-y-4">
      <Controller
        name="formulario"
        control={control}
        rules={{ required: "Debe seleccionar un formulario" }}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Formulario a consultar *
            </label>
            <Select 
              value={field.value} 
              onValueChange={(value) => {
                field.onChange(value)
                setFormularioSeleccionado(value)
              }}
            >
              <SelectTrigger className="border-orange-300 focus:border-orange-500 focus:ring-orange-500">
                <SelectValue placeholder="Seleccione un formulario" />
              </SelectTrigger>
              <SelectContent>
                {formularios.map((form) => (
                  <SelectItem key={form.value} value={form.value}>
                    {form.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.error && (
              <p className="text-sm text-red-600">{fieldState.error.message}</p>
            )}
          </div>
        )}
      />

      {mostrarCampos && (
        <>
          <Controller
            name="tipoDocumento"
            control={control}
            rules={{ required: "Debe seleccionar el tipo de documento" }}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Tipo de Documento *
                </label>
                <Select value={field.value} onValueChange={field.onChange}>      
                  <SelectTrigger className="border-orange-300 focus:border-orange-500 focus:ring-orange-500">
                    <SelectValue placeholder="Seleccione el tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposDocumento.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <p className="text-sm text-red-600">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            name="numeroDocumento"
            control={control}
            rules={{ 
              required: "Debe ingresar el número de documento",
              minLength: { value: 5, message: "El documento debe tener al menos 5 caracteres" }
            }}
            render={({ field, fieldState }) => (
              <FormInput
                label="Número de Documento *"
                placeholder="Ingrese el número de documento"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                className="border-orange-300 focus:border-orange-500 focus:ring-orange-500"
              />
            )}
          />
        </>
      )}
    </div>
  )
}

function ResultadosConsulta({ registros, isLoading }: { registros: Registro[], isLoading: boolean }) {
  const [emailMap, setEmailMap] = useState<Map<string, string>>(new Map())

  // Función para formatear fechas UTC a horario de Colombia
  const formatearFechaColombia = (fechaUTC: string) => {
    try {
      const fecha = new Date(fechaUTC)
      return fecha.toLocaleString('es-CO', {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    } catch (error) {
      return fechaUTC
    }
  }

  // Función para formatear el valor según su tipo
  const formatearValor = async (key: string, value: any): Promise<string> => {
    if (value === null || value === undefined) return 'N/A'
    
    // Formatear created_at
    if (key === 'created_at') {
      return formatearFechaColombia(value)
    }
    
    // Formatear created_by
    if (key === 'created_by' && typeof value === 'string') {
      // Verificar si ya tenemos el email en el cache local
      if (emailMap.has(value)) {
        return emailMap.get(value)!
      }
      
      // Obtener email y actualizar cache
      const email = await obtenerEmailConCache(value)
      setEmailMap(prev => new Map(prev).set(value, email))
      return email
    }
    
    // Formatear otras fechas que puedan estar en formato ISO
    if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
      return formatearFechaColombia(value)
    }
    
    return String(value)
  }

  // Función para renderizar valor de forma síncrona (para campos que no son created_by)
  const renderizarValor = (key: string, value: any): string => {
    if (value === null || value === undefined) return 'N/A'
    
    // Para created_by, usar el cache local
    if (key === 'created_by' && typeof value === 'string') {
      return emailMap.get(value) || `${value.substring(0, 8)}...`
    }
    
    // Formatear created_at
    if (key === 'created_at') {
      return formatearFechaColombia(value)
    }
    
    // Formatear otras fechas que puedan estar en formato ISO
    if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
      return formatearFechaColombia(value)
    }
    
    return String(value)
  }

  // Cargar emails para todos los created_by al montar el componente
  useEffect(() => {
    const cargarEmails = async () => {
      const nuevosEmails = new Map<string, string>()
      
      for (const registro of registros) {
        if (registro.created_by && typeof registro.created_by === 'string') {
          const email = await obtenerEmailConCache(registro.created_by)
          nuevosEmails.set(registro.created_by, email)
        }
      }
      
      setEmailMap(nuevosEmails)
    }
    
    if (registros.length > 0) {
      cargarEmails()
    }
  }, [registros])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        <span className="ml-2 text-gray-600">Buscando registros...</span>
      </div>
    )
  }

  if (registros.length === 0) {
    return (
      <div className="text-center p-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No se encontraron registros</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          Resultados ({registros.length} registro{registros.length !== 1 ? 's' : ''})
        </h3>
      </div>
      
      <div className="space-y-4">
        {registros.map((registro, index) => (
          <Card key={registro.id || index} className="border-orange-200 hover:border-orange-300 transition-colors">
            <CardHeader className="pb-3 bg-orange-50">
              <CardTitle className="text-sm text-gray-600">
                Registro #{index + 1} - ID: {registro.id}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(registro).map(([key, value]) => {
                  // Omitir id y updated_at
                  if (key === 'id' || key === 'updated_at') return null
                  
                  return (
                    <div key={key} className="space-y-1 p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {key === 'created_at' ? 'Fecha de Creación' : 
                         key === 'created_by' ? 'Creado por' : 
                         key.replace(/_/g, ' ')}
                      </label>
                      <p className="text-sm text-gray-800 break-words">
                        {renderizarValor(key, value)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function ConsultasPage() {
  const [registros, setRegistros] = useState<Registro[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleConsulta = async (data: ConsultaFormData) => {
    const formulario = formularios.find(f => f.value === data.formulario)
    if (!formulario) {
      toast.error({
        title: "Error",
        description: "Formulario no válido"
      })
      return
    }

    setIsLoading(true)

    try {
      // Obtener todos los tipos de documento válidos para la búsqueda
      const tipoSeleccionado = tiposDocumento.find(t => t.value === data.tipoDocumento)
      const tiposValidos = tipoSeleccionado 
        ? [tipoSeleccionado.value, ...tipoSeleccionado.alternativos]
        : [data.tipoDocumento]

      let query = supabase
        .from(formulario.tabla)
        .select('*')

      // Construir la consulta según el tipo de formulario
      if (formulario.campoTrabajador && formulario.campoEmpleador && formulario.camposTrabajador && formulario.camposEmpleador) {
        // Formularios que tienen tanto trabajador como empleador
        // Buscar por trabajador con múltiples tipos de documento
        const { data: resultadosTrabajador, error: errorTrabajador } = await supabase
          .from(formulario.tabla)
          .select('*')
          .in(formulario.camposTrabajador.tipo, tiposValidos)
          .eq(formulario.camposTrabajador.numero, data.numeroDocumento)
        
        // Buscar por empleador con múltiples tipos de documento
        const { data: resultadosEmpleador, error: errorEmpleador } = await supabase
          .from(formulario.tabla)
          .select('*')
          .in(formulario.camposEmpleador.tipo, tiposValidos)
          .eq(formulario.camposEmpleador.numero, data.numeroDocumento)
        
        if (errorTrabajador || errorEmpleador) {
          throw new Error(errorTrabajador?.message || errorEmpleador?.message)
        }
        
        // Combinar resultados únicos
        const todosLosResultados = [...(resultadosTrabajador || []), ...(resultadosEmpleador || [])]
        const resultadosUnicos = todosLosResultados.filter((item, index, self) => 
          index === self.findIndex(t => t.id === item.id)
        )
        
        setRegistros(resultadosUnicos)
        
        if (resultadosUnicos.length > 0) {
          toast.success({
            title: "Consulta exitosa",
            description: `Se encontraron ${resultadosUnicos.length} registro${resultadosUnicos.length !== 1 ? 's' : ''}`
          })
        } else {
          toast.info({
            title: "Sin resultados",
            description: "No se encontraron registros con los criterios especificados"
          })
        }
        return
      } else if (formulario.campoTrabajador && formulario.camposTrabajador) {
        // Solo trabajador
        query = query.in(formulario.camposTrabajador.tipo, tiposValidos).eq(formulario.camposTrabajador.numero, data.numeroDocumento)
      } else if (formulario.campoEmpleador && formulario.camposEmpleador) {
        // Solo empleador
        query = query.in(formulario.camposEmpleador.tipo, tiposValidos).eq(formulario.camposEmpleador.numero, data.numeroDocumento)
      }

      // Para los casos restantes (solo trabajador o solo empleador)
      const { data: resultados, error } = await query

      if (error) {
        console.error("Error al consultar:", error)
        toast.error({
          title: "Error en la consulta",
          description: error.message
        })
        return
      }

      setRegistros(resultados || [])
      
      if (resultados && resultados.length > 0) {
        toast.success({
          title: "Consulta exitosa",
          description: `Se encontraron ${resultados.length} registro${resultados.length !== 1 ? 's' : ''}`
        })
      } else {
        toast.info({
          title: "Sin resultados",
          description: "No se encontraron registros con los criterios especificados"
        })
      }
    } catch (error) {
      console.error("Error inesperado:", error)
      toast.error({
        title: "Error inesperado",
        description: "Ocurrió un error durante la consulta"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInvalidSubmit = (errors: any) => {
    const errorMessages = []
    if (errors.formulario) errorMessages.push(`Formulario: ${errors.formulario.message}`)
    if (errors.tipoDocumento) errorMessages.push(`Tipo de documento: ${errors.tipoDocumento.message}`)
    if (errors.numeroDocumento) errorMessages.push(`Número de documento: ${errors.numeroDocumento.message}`)

    toast.error({
      title: "Campos requeridos",
      description: errorMessages.length > 0 
        ? errorMessages.join(". ")
        : "Complete todos los campos obligatorios antes de continuar.",
    })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col py-8">
          <div className="container mx-auto px-4 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Consultas de Registros</h1>
              <p className="text-gray-600">
                Busque registros en las diferentes tablas del sistema
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Formulario de consulta */}
              <div className="lg:col-span-1">
                <Card className="border-orange-200 shadow-lg">
                  <CardHeader className="bg-orange-50">
                    <CardTitle className="flex items-center gap-2 text-orange-800">
                      <Search className="h-5 w-5" />
                      Criterios de búsqueda
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <FormProvider<ConsultaFormData>
                      onSubmit={handleConsulta}
                      onInvalidSubmit={handleInvalidSubmit}
                      defaultValues={{
                        formulario: "",
                        tipoDocumento: "",
                        numeroDocumento: "",
                      }}
                      mode="all"
                      reValidateMode="onChange"
                    >
                      <div className="space-y-4">
                        <ConsultaFormFields />
                        
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Buscando...
                            </>
                          ) : (
                            <>
                              <Search className="h-4 w-4 mr-2" />
                              Buscar Registros
                            </>
                          )}
                        </Button>
                      </div>
                    </FormProvider>
                  </CardContent>
                </Card>
              </div>

              {/* Resultados */}
              <div className="lg:col-span-2">
                <Card className="border-orange-200 shadow-lg">
                  <CardHeader className="bg-orange-50">
                    <CardTitle className="flex items-center gap-2 text-orange-800">
                      <FileText className="h-5 w-5" />
                      Resultados de la consulta
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ResultadosConsulta registros={registros} isLoading={isLoading} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

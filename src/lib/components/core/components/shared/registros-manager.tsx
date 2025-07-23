"use client"

//feature futura, no considerar aún
import type React from "react"

import { useState } from "react"
import { Button } from "@/lib/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/lib/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/components/ui/dialog"
import { Alert, AlertDescription } from "@/lib/components/ui/alert"
import { Edit, Trash2, RotateCcw, AlertTriangle, Send, CheckCircle, Mail, Download, Info } from "lucide-react"
import { toast } from "@/lib/utils/toast"

// Tipos genéricos para el manager
export interface RegistroBase {
  id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface DisplayField {
  key: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, registro: RegistroBase) => React.ReactNode
}

export interface SubmitConfig {
  endpoint: string
  buttonText: string
  successMessage: string
  contactData?: {
    nombre: string
    correo: string
    telefono: string
  }
  plantillaUrl?: string
  plantillaText?: string
}

interface RegistrosManagerProps<T extends RegistroBase> {
  // Datos
  registros: T[]

  // Configuración de display
  displayFields: DisplayField[]
  title?: string

  // Configuración de envío
  submitConfig: SubmitConfig

  // Callbacks
  onEdit: (registro: T) => void
  onDelete: (id: string, displayName: string) => void
  onDeleteAll: () => void
  onSubmit: (registros: T[]) => Promise<void>

  // Estados
  isSubmitting?: boolean

  // Funciones de utilidad
  getDisplayName: (registro: T) => string
}

export function RegistrosManager<T extends RegistroBase>({
  registros,
  displayFields,
  title = "Registros Guardados",
  submitConfig,
  onEdit,
  onDelete,
  onDeleteAll,
  onSubmit,
  isSubmitting = false,
  getDisplayName,
}: RegistrosManagerProps<T>) {
  const [openDeleteAllDialog, setOpenDeleteAllDialog] = useState(false)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string>("")
  const [intentadoEnviar, setIntentadoEnviar] = useState(false)

  // Validar datos de contacto si son requeridos
  const hasRequiredContactData = () => {
    if (!submitConfig.contactData) return true
    const { nombre, correo, telefono } = submitConfig.contactData
    return nombre.trim() && correo.trim() && telefono.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
  }

  const handleDelete = (id: string, registro: T) => {
    try {
      const displayName = getDisplayName(registro)
      onDelete(id, displayName)
      toast.success(`Registro de ${displayName} eliminado`)
    } catch (error) {
      toast.error("Error al eliminar el registro")
    }
  }

  const handleEdit = (registro: T) => {
    const displayName = getDisplayName(registro)
    onEdit(registro)
    toast.info(`Editando registro de ${displayName}`)
  }

  const handleDeleteAll = () => {
    try {
      onDeleteAll()
      setOpenDeleteAllDialog(false)
      toast.success("Todos los registros eliminados")
    } catch (error) {
      toast.error("Error al eliminar los registros")
    }
  }

  const handleSubmit = async () => {
    setIntentadoEnviar(true)

    if (!hasRequiredContactData()) {
      setError("Faltan datos de contacto en la URL. Verifique los parámetros nombre, correo y telefono.")
      toast.error("Datos de contacto faltantes")
      return
    }

    setEnviando(true)
    setError("")

    try {
      await onSubmit(registros)
      setEnviado(true)
      toast.success(submitConfig.successMessage)

      // Auto-cerrar modal después de éxito
      setTimeout(() => {
        setIsSubmitModalOpen(false)
        setEnviado(false)
        setError("")
      }, 3000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error inesperado"
      setError(errorMessage)
      toast.error("Error al enviar registros")
    } finally {
      setEnviando(false)
    }
  }

  // Renderizar tabla vacía
  if (registros.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>{title} (0)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>No hay registros guardados</p>
            <p className="text-sm">Complete el formulario arriba para agregar registros</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {title} ({registros.length})
          </CardTitle>

          {/* Botón Eliminar Todos */}
          <Dialog open={openDeleteAllDialog} onOpenChange={setOpenDeleteAllDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm" className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Eliminar Todos
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
                        <strong>
                          {registros.length} registro{registros.length !== 1 ? "s" : ""}
                        </strong>{" "}
                        y no se puede deshacer.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setOpenDeleteAllDialog(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDeleteAll} className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Sí, Eliminar Todos
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {/* Tabla de registros */}
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto rounded-lg border border-orange-100 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                {displayFields.map((field) => (
                  <TableHead key={field.key}>{field.label}</TableHead>
                ))}
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registros.map((registro) => (
                <TableRow key={registro.id} className="hover:bg-orange-50">
                  {displayFields.map((field) => (
                    <TableCell key={field.key}>
                      {field.render ? field.render(registro[field.key], registro) : registro[field.key]}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(registro)}
                        className="flex items-center gap-1 border-orange-200 text-orange-600 hover:bg-orange-50"
                      >
                        <Edit className="h-3 w-3" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(registro.id, registro)}
                        className="flex items-center gap-1"
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

        {/* Botón Enviar Registros */}
        <div className="mt-6 pt-6 border-t">
          <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="w-full flex items-center gap-2 bg-orange-500 hover:bg-orange-600"
                disabled={!hasRequiredContactData()}
              >
                <Send className="h-5 w-5" />
                {submitConfig.buttonText} ({registros.length})
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              {enviado ? (
                // Estado de éxito
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="h-16 w-16 text-orange-500 mb-4" />
                  <h3 className="text-lg font-semibold text-green-700 mb-2">¡Envío Exitoso!</h3>
                  <p className="text-center text-gray-600 mb-4">
                    Los registros han sido enviados correctamente. Recibirás una confirmación en tu correo electrónico.
                  </p>
                  {submitConfig.contactData && (
                    <Alert className="w-full">
                      <Mail className="h-4 w-4" />
                      <AlertDescription>
                        Se ha enviado una copia a: <strong>{submitConfig.contactData.correo}</strong>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                // Estado de confirmación
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Confirmar Envío de Registros
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    {/* Alerta informativa con plantilla */}
                    {submitConfig.plantillaUrl && (
                      <Alert className="border-orange-200 bg-orange-50">
                        <Info className="h-4 w-4 text-orange-600" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <p className="font-medium text-orange-800">
                              {submitConfig.plantillaText || "Descarga la plantilla para carga masiva:"}
                            </p>
                            <a
                              href={submitConfig.plantillaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-orange-700 hover:text-orange-900 underline font-medium"
                            >
                              <Download className="h-4 w-4" />
                              Descargar Plantilla
                            </a>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Datos de contacto */}
                    {submitConfig.contactData && hasRequiredContactData() ? (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">Datos de Contacto:</h4>
                        <div className="space-y-1 text-sm text-green-700">
                          <p>
                            <strong>Nombre:</strong> {submitConfig.contactData.nombre}
                          </p>
                          <p>
                            <strong>Correo:</strong> {submitConfig.contactData.correo}
                          </p>
                          <p>
                            <strong>Teléfono:</strong> {submitConfig.contactData.telefono}
                          </p>
                        </div>
                      </div>
                    ) : (
                      submitConfig.contactData && (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertDescription className="text-red-700">
                            Faltan datos de contacto en la URL. Se requieren los parámetros: nombre, correo y telefono
                          </AlertDescription>
                        </Alert>
                      )
                    )}

                    {/* Error message */}
                    {error && intentadoEnviar && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertDescription className="text-red-700">{error}</AlertDescription>
                      </Alert>
                    )}

                    {/* Resumen */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Resumen:</strong> Se enviarán {registros.length} registro(s) para procesamiento.
                      </p>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3">
                      <Button
                        onClick={handleSubmit}
                        disabled={enviando || !hasRequiredContactData()}
                        className="flex-1 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        {enviando ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Enviar
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)} disabled={enviando}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
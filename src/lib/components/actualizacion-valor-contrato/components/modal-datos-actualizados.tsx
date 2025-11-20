"use client"

import { Button } from "@/lib/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/lib/components/ui/dialog"
import { UserCheck } from "lucide-react"
import type { ApiResponseAfiliado } from "../types/actualizacion-valor-contrato-types"

interface ModalDatosActualizadosProps {
  open: boolean
  onClose: () => void
  datosActualizados: ApiResponseAfiliado | null
  contratoActualizadoNum: string
}

export function ModalDatosActualizados({ 
  open, 
  onClose, 
  datosActualizados,
  contratoActualizadoNum
}: ModalDatosActualizadosProps) {
  if (!datosActualizados) return null

  // Filtrar solo el contrato que se actualizó
  const contratoActualizado = datosActualizados.contracts.find(
    c => c.numContract === contratoActualizadoNum
  )

  const parsearFechaLocal = (fecha?: string | null): Date | null => {
    if (!fecha) return null
    
    const partes = fecha.split("-")
    if (partes.length === 3) {
      const year = parseInt(partes[0], 10)
      const month = parseInt(partes[1], 10) - 1
      const day = parseInt(partes[2], 10)

      if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
        const parsed = new Date(year, month, day)
        if (!Number.isNaN(parsed.getTime())) {
          return parsed
        }
      }
    }
    
    const parsed = new Date(fecha)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-700">
            <UserCheck className="h-6 w-6" />
            Contrato Actualizado Exitosamente
          </DialogTitle>
          <DialogDescription>
            A continuación se muestran los datos actualizados del contrato
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Información del Afiliado */}
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg mb-3">Información del Afiliado</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Documento:</span>
                <p className="text-gray-700">
                  {datosActualizados.identificationType} {datosActualizados.identification}
                </p>
              </div>
              <div>
                <span className="font-semibold">Nombres:</span>
                <p className="text-gray-700">
                  {datosActualizados.firstName} {datosActualizados.secondName || ""}
                </p>
              </div>
              <div>
                <span className="font-semibold">Apellidos:</span>
                <p className="text-gray-700">
                  {datosActualizados.surname} {datosActualizados.secondSurname || ""}
                </p>
              </div>
              <div>
                <span className="font-semibold">Email:</span>
                <p className="text-gray-700">{datosActualizados.email}</p>
              </div>
              <div>
                <span className="font-semibold">Teléfono:</span>
                <p className="text-gray-700">{datosActualizados.phoneNumber}</p>
              </div>
              <div>
                <span className="font-semibold">Edad:</span>
                <p className="text-gray-700">{datosActualizados.age} años</p>
              </div>
            </div>
          </div>

          {/* Información del Contrato Actualizado */}
          {contratoActualizado && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 text-green-800">Contrato Actualizado</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Número de Contrato:</span>
                    <p className="text-gray-700">{contratoActualizado.numContract}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Tipo:</span>
                    <p className="text-gray-700">{contratoActualizado.typeContractUser}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Valor Total:</span>
                    <p className="font-semibold text-green-700">
                      ${contratoActualizado.contractTotalValue.toLocaleString('es-CO')}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold">Valor Mensual:</span>
                    <p className="font-semibold text-green-700">
                      ${contratoActualizado.contractMonthlyValue.toLocaleString('es-CO')}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold">Valor IBC:</span>
                    <p className="font-semibold text-blue-700">
                      ${contratoActualizado.contractIbcValue.toLocaleString('es-CO')}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold">Duración:</span>
                    <p className="text-gray-700">{contratoActualizado.contractDuration}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Fecha Inicio:</span>
                    <p className="text-gray-700">
                      {formatearFecha(contratoActualizado.contractStartDate)}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold">Fecha Fin:</span>
                    <p className="text-gray-700">
                      {contratoActualizado.contractEndDate 
                        ? formatearFecha(contratoActualizado.contractEndDate)
                        : "-"}
                    </p>
                  </div>
                  {contratoActualizado.companyNameContract && (
                    <div>
                      <span className="font-semibold">Nombre de la empresa contratante:</span>
                      <p className="text-gray-700">{contratoActualizado.companyNameContract}</p>
                    </div>
                  )}
                  {contratoActualizado.nitCompanyContract && (
                    <div>
                      <span className="font-semibold">NIT de la empresa contratante:</span>
                      <p className="text-gray-700">{contratoActualizado.nitCompanyContract}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botón de cerrar */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700"
            >
              Cerrar y Limpiar Formulario
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


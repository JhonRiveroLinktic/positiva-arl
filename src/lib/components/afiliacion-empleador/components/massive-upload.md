"use client"

import { useState } from "react"
import * as XLSX from "xlsx"
import { MassiveUploadModal } from "@/lib/components/core/form/massive-upload-modal"
import { useRegistroStore } from "../stores/registro-store"
import { toast } from "@/lib/utils/toast"
import type { Registro } from "../types/afiliacion-empleador-types"

const EXCEL_COLUMN_MAPPING = {
  "TIPO_DOCUMENTO_EMPLEADOR": "tipoDocEmpleador",
  "DOCUMENTO_EMPLEADOR": "documentoEmpleador",
  "DIGITO_VERIFICACION_EMPLEADOR": "digitoVerificacionEmpleador",
  "RAZON_SOCIAL_EMPLEADOR": "razonSocialEmpleador",
  "DEPARTAMENTO_EMPLEADOR": "departamentoEmpleador",
  "MUNICIPIO_EMPLEADOR": "municipioEmpleador",
  "ACT_ECONOMICA_PRINCIPAL_EMPLEADOR (DECRETO 768/2022)": "actEconomicaPrincipalEmpleador",
  "DIRECCION_EMPLEADOR": "direccionEmpleador",
  "TELEFONO_EMPLEADOR": "telefonoEmpleador",
  "FAX (DEJAR SIEMPRE (0))": "faxEmpleador",
  "CORREO_ELECTRONICO": "correoElectronicoEmpleador",
  "ZONA (URBANO O RURAL)": "zonaEmpleador",
  "SUMINISTRO_DE_TRANSPORTE": "suministroDeTransporte",
  "FECHA_DE_RADICACION (AAAA/MM/DD) (DIA DE ENTREGA DE INFORMACION)": "fechaRadicacion",
  "NATURALEZA (JURIDICA O PRIVADA)": "naturaleza",
  "ESTADO_SIEMPRE (1)": "estado",
  "TIPO_DOCUMENTO_REPRESENTANTE_LEGAL": "tipoDocRepresentanteLegal",
  "NUEMERO_DE_DOCUMENTO_REPRESENTANTE_LEGAL": "numeDocRepresentanteLegal",
  "NOMBRE_REPRESENTANTE_LEGAL": "primerNombreRepresentanteLegal",
  "FECHA_COBERTURA (AAAA/MM/DD)": "fechaCobertura",
  "ORIGEN (NUEVA O TRASLADO)": "origen",
  "CODIGO_ARL (SOLO CUANDO ES TRASLADO)": "codigoArl",
  "TIPO_DOCUMENTO_ARL ANTERIOR (SOLO CUANDO ES TRASLADO)": "tipoDocArlAnterior",
  "NIT_ARL_ANTERIOR (SOLO CUANDO ES TRASLADO)": "nitArlAnterior",
  "FECHA_NOTIFICACION_TRASLADO (AAAA/MM/DD) (SOLO CUANDO ES TRASLADO)": "fechaNotificacionTraslado",
  "NUMERO DE DOCUMENTO REPRSSENTANTE LEGAL": "numeDocRepresentanteLegal",
  "PRIMER APELLIDO REPRSENTE LEGAL": "primerApellidoRepresentanteLegal",
  "SEGUNDO APELLIDO REPRESENTANTE LEGAL": "segundoApellidoRepresentanteLegal",
  "PRIMER DOCUMENTO REPRESENTANTE LEGAL": "primerNombreRepresentanteLegal",
  "SEGUNDO NOMBRE REPRESENTANTE LEGAL": "segundoNombreRepresentanteLegal",
  "FECHA DE NACIMIENTO": "fechaNacimientoRepresentanteLegal",
  "SEXO": "sexoRepresentanteLegal",
  "PAIS": "paisRepresentanteLegal",
  "DEPARTAMENTO": "departamentoRepresentanteLegal",
  "MUNICIPIO": "municipioRepresentanteLegal",
  "ZONA": "zonaEmpleador",
  "FAX": "faxEmpleador",
  "TELEFONO": "telefonoRepresentanteLegal",
  "DIRECCION": "direccionRepresentanteLegal",
  "CORREO ELECTRONICO": "correoElectronicoRepresentanteLegal",
  "NIT AFP": "nitAfpRepresentanteLegal",
  "NIT EPS": "nitEpsRepresentanteLegal",
} as const

type FormFieldKeys = typeof EXCEL_COLUMN_MAPPING[keyof typeof EXCEL_COLUMN_MAPPING]

const normalizeHeader = (header: string): string => {
  return header
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "")
}

const processAfiliacionEmpleadorData = (row: any): Partial<Registro> => {
  const processedData: Partial<Registro> = {}

  for (const [excelHeader, formField] of Object.entries(EXCEL_COLUMN_MAPPING)) {
    const normalizedHeader = normalizeHeader(excelHeader)
    const value = row[normalizedHeader]

    if (value !== undefined && value !== null && value !== "") {
      // Procesar fechas específicas
      if (formField === "fechaRadicacion" || formField === "fechaCobertura" || formField === "fechaNotificacionTraslado" || formField === "fechaNacimientoRepresentanteLegal") {
        if (typeof value === "string" && value.includes("/")) {
          const [year, month, day] = value.split("/")
          if (year && month && day) {
            processedData[formField as keyof Registro] = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}` as any
          }
        } else {
          processedData[formField as keyof Registro] = value as any
        }
      } else {
        processedData[formField as keyof Registro] = value as any
      }
    }
  }

  return processedData
}

const validateFileStructure = (headers: string[]): { isValid: boolean; missingColumns: string[] } => {
  const requiredColumns = [
    "TIPO_DOCUMENTO_EMPLEADOR",
    "DOCUMENTO_EMPLEADOR",
    "RAZON_SOCIAL_EMPLEADOR",
    "DEPARTAMENTO_EMPLEADOR",
    "MUNICIPIO_EMPLEADOR",
    "ACT_ECONOMICA_PRINCIPAL_EMPLEADOR (DECRETO 768/2022)",
    "DIRECCION_EMPLEADOR",
    "CORREO_ELECTRONICO",
    "FECHA_DE_RADICACION (AAAA/MM/DD) (DIA DE ENTREGA DE INFORMACION)",
    "TIPO_DOCUMENTO_REPRESENTANTE_LEGAL",
    "NUEMERO_DE_DOCUMENTO_REPRESENTANTE_LEGAL",
    "NOMBRE_REPRESENTANTE_LEGAL",
    "PRIMER APELLIDO REPRSENTE LEGAL",
    "FECHA DE NACIMIENTO",
    "SEXO",
    "DEPARTAMENTO",
    "MUNICIPIO",
    "DIRECCION",
    "CORREO ELECTRONICO",
  ]

  const normalizedHeaders = headers.map(normalizeHeader)
  const requiredColumnsNormalized = requiredColumns.map(normalizeHeader)
  
  const missingColumns = requiredColumnsNormalized.filter(
    required => !normalizedHeaders.includes(required)
  )

  return {
    isValid: missingColumns.length === 0,
    missingColumns: missingColumns.map(col => 
      requiredColumns[requiredColumnsNormalized.indexOf(col)]
    )
  }
}

const config = {
  title: "Carga Masiva de Afiliación de Empleador",
  instructions: `
    <p><strong>Instrucciones:</strong></p>
    <ul>
      <li>El archivo debe ser un Excel (.xlsx) con los encabezados exactos</li>
      <li>Los campos marcados con * son obligatorios</li>
      <li>Las fechas deben estar en formato AAAA/MM/DD</li>
      <li>Los campos de representante legal son obligatorios</li>
      <li>Los campos de traslado solo son necesarios cuando el origen es "TRASLADO"</li>
    </ul>
    <p><strong>Campos obligatorios:</strong></p>
    <ul>
      <li>TIPO_DOCUMENTO_EMPLEADOR</li>
      <li>DOCUMENTO_EMPLEADOR</li>
      <li>RAZON_SOCIAL_EMPLEADOR</li>
      <li>DEPARTAMENTO_EMPLEADOR</li>
      <li>MUNICIPIO_EMPLEADOR</li>
      <li>ACT_ECONOMICA_PRINCIPAL_EMPLEADOR</li>
      <li>DIRECCION_EMPLEADOR</li>
      <li>CORREO_ELECTRONICO</li>
      <li>FECHA_DE_RADICACION</li>
      <li>TIPO_DOCUMENTO_REPRESENTANTE_LEGAL</li>
      <li>NUEMERO_DE_DOCUMENTO_REPRESENTANTE_LEGAL</li>
      <li>NOMBRE_REPRESENTANTE_LEGAL</li>
      <li>PRIMER APELLIDO REPRSENTE LEGAL</li>
      <li>FECHA DE NACIMIENTO</li>
      <li>SEXO</li>
      <li>DEPARTAMENTO</li>
      <li>MUNICIPIO</li>
      <li>DIRECCION</li>
      <li>CORREO ELECTRONICO</li>
    </ul>
  `,
}

export function AfiliacionEmpleadorMassiveUpload() {
  const [isOpen, setIsOpen] = useState(false)
  const { agregarRegistro } = useRegistroStore()

  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        if (jsonData.length < 2) {
          toast.error({
            title: "Archivo inválido",
            description: "El archivo debe contener al menos una fila de datos además de los encabezados.",
          })
          return
        }

        const headers = jsonData[0] as string[]
        const rows = jsonData.slice(1) as any[][]

        // Validar estructura del archivo
        const validation = validateFileStructure(headers)
        if (!validation.isValid) {
          toast.error({
            title: "Estructura de archivo inválida",
            description: `Faltan las siguientes columnas obligatorias: ${validation.missingColumns.join(", ")}`,
          })
          return
        }

        // Convertir filas a objetos
        const records: any[] = []
        rows.forEach((row, index) => {
          const rowData: any = {}
          headers.forEach((header, colIndex) => {
            if (row[colIndex] !== undefined && row[colIndex] !== null) {
              rowData[normalizeHeader(header)] = row[colIndex]
            }
          })
          records.push(rowData)
        })

        // Procesar datos
        let successCount = 0
        let errorCount = 0
        const errors: string[] = []

        records.forEach((row, index) => {
          try {
            const processedData = processAfiliacionEmpleadorData(row)
            
            if (processedData.documentoEmpleador && processedData.razonSocialEmpleador) {
              const registro: Registro = {
                id: Date.now().toString() + index,
                ...processedData,
                metodoSubida: "carga_masiva",
                archivos: [],
              }
              
              agregarRegistro(registro)
              successCount++
            } else {
              errorCount++
              errors.push(`Fila ${index + 2}: Faltan campos obligatorios`)
            }
          } catch (error) {
            errorCount++
            errors.push(`Fila ${index + 2}: Error al procesar datos`)
          }
        })

        if (successCount > 0) {
          toast.success({
            title: "Carga masiva completada",
            description: `Se procesaron ${successCount} registros correctamente.${errorCount > 0 ? ` ${errorCount} registros con errores.` : ""}`,
          })
        }

        if (errorCount > 0 && errors.length > 0) {
          console.error("Errores en carga masiva:", errors)
        }

        setIsOpen(false)
      } catch (error) {
        console.error("Error al procesar archivo:", error)
        toast.error({
          title: "Error al procesar archivo",
          description: "Ocurrió un error al procesar el archivo Excel. Verifique el formato.",
        })
      }
    }

    reader.readAsArrayBuffer(file)
  }

  return (
    <MassiveUploadModal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onFileUpload={handleFileUpload}
      config={config}
    />
  )
}
import type { DocumentType, DocumentTypeOption } from './data-types'

export const documentTypesData: DocumentType[] = [
  {
    "Tipo": "CC",
    "Nombre": "Cédula Ciudadanía"
  },
  {
    "Tipo": "CD",
    "Nombre": "Carnet Diplómatico"
  },
  {
    "Tipo": "CE",
    "Nombre": "Cédula Extranjería"
  },
  {
    "Tipo": "NI",
    "Nombre": "Nit"
  },
  {
    "Tipo": "PT",
    "Nombre": "Permiso por protección temporal"
  },
  {
    "Tipo": "SC",
    "Nombre": "Salvoconducto"
  },
  {
    "Tipo": "TI",
    "Nombre": "Tarjeta de identidad"
  }
]

export const documentTypeOptions: DocumentTypeOption[] = documentTypesData.map(item => ({
  code: item.Tipo,
  name: item.Nombre
})) 
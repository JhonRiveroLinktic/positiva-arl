type TypeDocumentType = {
    value: string
    label: string
  }

type TypeDocumentTypeOptions = {
    value: string
    label: string
}

export const documentTypes: TypeDocumentType[] = [
  {
    value: 'C',
    label: 'Cédula Ciudadanía',
  },
  {
    value: 'D',
    label: 'Carnet Diplomático',
  },
  {
    value: 'E',
    label: 'Cédula Extranjería',
  },
  {
    value: 'R',
    label: 'Registro civil',
  },
  {
    value: 'T',
    label: 'Tarjeta de identidad',
  },
  {
    value: 'U',
    label: 'NUIP',
  },
  {
    value: 'L',
    label: 'Permiso Protección Temporal',
  }
]

export const DocumentTypesOptions: TypeDocumentTypeOptions[] = documentTypes.map(item => ({
  value: item.value,
  label: `${item.value} - ${item.label}`
}))
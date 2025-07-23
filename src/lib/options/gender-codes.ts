import type { GenderCode, GenderCodeOption } from './data-types'

export const genderCodesData: GenderCode[] = [
  {
    "Tipo": "M",
    "Nombre": "Masculino"
  },
  {
    "Tipo": "F",
    "Nombre": "Femenino"
  },
  {
    "Tipo": "T",
    "Nombre": "Transexual"
  },
  {
    "Tipo": "N",
    "Nombre": "No Binario"
  },
  {
    "Tipo": "O",
    "Nombre": "Otros"
  }
]

export const genderCodeOptions: GenderCodeOption[] = genderCodesData.map(item => ({
  code: item.Tipo,
  name: item.Nombre
})) 
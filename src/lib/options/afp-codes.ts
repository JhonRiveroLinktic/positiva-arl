import type { AFPCode, AFPCodeOption } from './data-types'

export const afpCodesData: AFPCode[] = [
  {
    "Id": "0",
    "Nombre": "SIN AFP (PENSIONADOS o NO OBLIGADOS A COTIZAR PENSION)"
  },
  {
    "Id": "2",
    "Nombre": "PROTECCION"
  },
  {
    "Id": "3",
    "Nombre": "PORVENIR"
  },
  {
    "Id": "4",
    "Nombre": "COLFONDOS S.A. PENSIONES Y CESANTIAS"
  },
  {
    "Id": "7",
    "Nombre": "OLD MUTUAL (ANTES SKANDIA)"
  },
  {
    "Id": "14",
    "Nombre": "COLPENSIONES ADMINISTRADORA COLOMBIANA DE PENSIONES"
  }
]

// Transform to normalized select options
export const afpCodeOptions: AFPCodeOption[] = afpCodesData.map(item => ({
  code: item.Id,
  name: item.Nombre
})) 
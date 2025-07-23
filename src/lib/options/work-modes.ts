import type { WorkMode, WorkModeOption } from './data-types'

export const workModesData: WorkMode[] = [
  {
    "Id": "0",
    "Nombre": "Trabajo en Casa",
    "Observación": "Trabajo en casa es la habilitación temporal del trabajador para que desarrolle sus actividades por fuera del sitio donde habitualmente las desarrolla"
  },
  {
    "Id": "1",
    "Nombre": "Teletrabajo",
    "Observación": "Trabajadores independientes que se valen de las tic para el desarrollo de sus tareas"
  },
  {
    "Id": "2",
    "Nombre": "Presencial",
    "Observación": "Implica el desarrollo de las actividades laborales compartiendo un mismo espacio físico durante todos los días hábiles de la semana"
  },
  {
    "Id": "3",
    "Nombre": "Trabajo Remoto",
    "Observación": "Esta modalidad de trabajo se realiza remotamente desde un inicio del contrato hasta su finalización"
  }
]

export const workModeOptions: WorkModeOption[] = workModesData.map(item => ({
  code: item.Id,
  name: item.Nombre,
  description: item.Observación
})) 
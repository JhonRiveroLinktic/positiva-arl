import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { 
  RegistroCompleto, 
  EmpleadorDatos, 
  RepresentanteLegal, 
  Sede, 
  CentroTrabajo 
} from "../types/afiliacion-empleador-types"

interface RegistroState {
  registros: RegistroCompleto[]
  registroEditando: RegistroCompleto | null

  agregarRegistro: (registro: RegistroCompleto) => void
  actualizarRegistro: (registro: RegistroCompleto) => void
  eliminarRegistro: (id: string) => void
  limpiarTodosLosRegistros: () => void
  setRegistroEditando: (registro: RegistroCompleto | null) => void

  getRegistroById: (id: string) => RegistroCompleto | undefined
  getTotalRegistros: () => number

  // Métodos para manejar datos temporales del formulario
  setEmpleadorDatos: (datos: EmpleadorDatos) => void
  setRepresentanteLegal: (datos: RepresentanteLegal) => void
  setSedes: (sedes: Sede[]) => void
  setCentrosTrabajo: (centros: CentroTrabajo[]) => void
  setArchivos: (archivos: File[]) => void

  // Getters para datos temporales
  getEmpleadorDatos: () => EmpleadorDatos | null
  getRepresentanteLegal: () => RepresentanteLegal | null
  getSedes: () => Sede[]
  getCentrosTrabajo: () => CentroTrabajo[]
  getArchivos: () => File[]

  // Métodos para limpiar datos temporales
  limpiarDatosTemporales: () => void
}

export const useRegistroStore = create<RegistroState>()(
  persist(
    (set, get) => ({
      registros: [],
      registroEditando: null,

      agregarRegistro: (registro) =>
        set((state) => ({
          registros: [...state.registros, registro],
        })),

      actualizarRegistro: (registroActualizado) =>
        set((state) => ({
          registros: state.registros.map((registro) =>
            registro.id === registroActualizado.id ? registroActualizado : registro
          ),
        })),

      eliminarRegistro: (id) =>
        set((state) => ({
          registros: state.registros.filter((registro) => registro.id !== id),
          registroEditando: state.registroEditando?.id === id ? null : state.registroEditando,
        })),

      limpiarTodosLosRegistros: () =>
        set({
          registros: [],
          registroEditando: null,
        }),

      setRegistroEditando: (registro) =>
        set({
          registroEditando: registro,
        }),

      getRegistroById: (id) => {
        const state = get()
        return state.registros.find((registro) => registro.id === id)
      },

      getTotalRegistros: () => {
        const state = get()
        return state.registros.length
      },

      // Métodos para datos temporales
      setEmpleadorDatos: (datos) => {
        const state = get()
        const empleadorDatosKey = 'empleador-datos-temp'
        localStorage.setItem(empleadorDatosKey, JSON.stringify(datos))
      },

      setRepresentanteLegal: (datos) => {
        const state = get()
        const representanteLegalKey = 'representante-legal-temp'
        localStorage.setItem(representanteLegalKey, JSON.stringify(datos))
      },

      setSedes: (sedes) => {
        const state = get()
        const sedesKey = 'sedes-temp'
        localStorage.setItem(sedesKey, JSON.stringify(sedes))
      },

      setCentrosTrabajo: (centros) => {
        const state = get()
        const centrosKey = 'centros-trabajo-temp'
        localStorage.setItem(centrosKey, JSON.stringify(centros))
      },

      setArchivos: (archivos) => {
        const state = get()
        const archivosKey = 'archivos-temp'
        // Los archivos no se pueden serializar directamente, se manejan de forma especial
        // Por ahora solo guardamos los nombres
        const archivosInfo = archivos.map(archivo => ({
          name: archivo.name,
          size: archivo.size,
          type: archivo.type
        }))
        localStorage.setItem(archivosKey, JSON.stringify(archivosInfo))
      },

      getEmpleadorDatos: () => {
        const empleadorDatosKey = 'empleador-datos-temp'
        const datos = localStorage.getItem(empleadorDatosKey)
        return datos ? JSON.parse(datos) : null
      },

      getRepresentanteLegal: () => {
        const representanteLegalKey = 'representante-legal-temp'
        const datos = localStorage.getItem(representanteLegalKey)
        return datos ? JSON.parse(datos) : null
      },

      getSedes: () => {
        const sedesKey = 'sedes-temp'
        const datos = localStorage.getItem(sedesKey)
        return datos ? JSON.parse(datos) : []
      },

      getCentrosTrabajo: () => {
        const centrosKey = 'centros-trabajo-temp'
        const datos = localStorage.getItem(centrosKey)
        return datos ? JSON.parse(datos) : []
      },

      getArchivos: () => {
        return []
      },

      limpiarDatosTemporales: () => {
        const keys = [
          'empleador-datos-temp',
          'representante-legal-temp', 
          'sedes-temp',
          'centros-trabajo-temp',
          // 'archivos-temp'
        ]
        keys.forEach(key => localStorage.removeItem(key))
      },
    }),
    {
      name: "afiliacion-empleador-storage",
      partialize: (state) => ({
        registros: state.registros,
      }),
    }
  )
)
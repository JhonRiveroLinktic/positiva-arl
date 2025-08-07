import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Registro } from "../types/novedad-actualizacion-datos-empleador-types"

interface RegistroState {
  registros: Registro[]
  registroEditando: Registro | null

  agregarRegistro: (registro: Registro) => void
  actualizarRegistro: (registro: Registro) => void
  eliminarRegistro: (id: string) => void
  limpiarTodosLosRegistros: () => void
  setRegistroEditando: (registro: Registro | null) => void

  getRegistroById: (id: string) => Registro | undefined
  getTotalRegistros: () => number
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
    }),
    {
      name: "novedad-actualizacion-datos-empleador-storage",
      partialize: (state) => ({
        registros: state.registros,
      }),
    }
  )
) 
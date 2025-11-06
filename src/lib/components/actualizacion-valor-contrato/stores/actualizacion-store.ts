import { create } from "zustand"
import type { ActualizacionValorContratoState, DatosAfiliado, Contrato } from "../types/actualizacion-valor-contrato-types"

export const useActualizacionValorContratoStore = create<ActualizacionValorContratoState>((set) => ({
  afiliadoEncontrado: null,
  isSearching: false,
  isUpdating: false,
  setAfiliadoEncontrado: (afiliado) => set({ afiliadoEncontrado: afiliado }),
  setContratoSeleccionado: (contrato) => set((state) => ({
    afiliadoEncontrado: state.afiliadoEncontrado 
      ? { ...state.afiliadoEncontrado, contratoSeleccionado: contrato }
      : null
  })),
  setIsSearching: (isSearching) => set({ isSearching }),
  setIsUpdating: (isUpdating) => set({ isUpdating }),
  limpiarDatos: () => set({ 
    afiliadoEncontrado: null, 
    isSearching: false, 
    isUpdating: false 
  }),
}))



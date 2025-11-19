import { create } from "zustand"
import type { CambioRazonSocialState, DatosRegistro, RegistroRazonSocial } from "../types/cambio-razon-social-types"

export const useCambioRazonSocialStore = create<CambioRazonSocialState>((set) => ({
  datosRegistro: null,
  isSearching: false,
  isUpdating: false,
  setDatosRegistro: (datos) => set({ datosRegistro: datos }),
  setRegistroSeleccionado: (registro) => set((state) => ({
    datosRegistro: state.datosRegistro 
      ? { ...state.datosRegistro, registroSeleccionado: registro }
      : null
  })),
  setIsSearching: (isSearching) => set({ isSearching }),
  setIsUpdating: (isUpdating) => set({ isUpdating }),
  limpiarDatos: () => set({ 
    datosRegistro: null, 
    isSearching: false, 
    isUpdating: false 
  }),
}))


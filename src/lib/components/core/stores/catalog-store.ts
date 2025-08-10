import { create } from "zustand"
import { persist } from "zustand/middleware"

// Types for catalog data
interface CatalogOption {
  code: string
  name: string
  department?: string
  risk?: string
}

interface CatalogState {
  // Data
  documentTypes: CatalogOption[]
  genderCodes: CatalogOption[]
  municipalities: CatalogOption[]
  epsCodes: CatalogOption[]
  afpCodes: CatalogOption[]
  occupations: CatalogOption[]
  occupationsDecreto: CatalogOption[]
  economicActivities: CatalogOption[]
  workModes: CatalogOption[]

  // Loading states
  loading: {
    documentTypes: boolean
    genderCodes: boolean
    municipalities: boolean
    epsCodes: boolean
    afpCodes: boolean
    occupations: boolean
    occupationsDecreto: boolean
    economicActivities: boolean
    workModes: boolean
  }

  // Actions
  setDocumentTypes: (data: CatalogOption[]) => void
  setGenderCodes: (data: CatalogOption[]) => void
  setMunicipalities: (data: CatalogOption[]) => void
  setEpsCodes: (data: CatalogOption[]) => void
  setAfpCodes: (data: CatalogOption[]) => void
  setOccupations: (data: CatalogOption[]) => void
  setOccupationsDecreto: (data: CatalogOption[]) => void
  setEconomicActivities: (data: CatalogOption[]) => void
  setWorkModes: (data: CatalogOption[]) => void

  setLoading: (catalog: keyof CatalogState["loading"], loading: boolean) => void

  // Lazy loaders
  loadDocumentTypes: () => Promise<void>
  loadGenderCodes: () => Promise<void>
  loadMunicipalities: () => Promise<void>
  loadEpsCodes: () => Promise<void>
  loadAfpCodes: () => Promise<void>
  loadOccupations: () => Promise<void>
  loadOccupationsDecreto: () => Promise<void>
  loadEconomicActivities: () => Promise<void>
  loadWorkModes: () => Promise<void>
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      // Initial data
      documentTypes: [],
      genderCodes: [],
      municipalities: [],
      epsCodes: [],
      afpCodes: [],
      occupations: [],
      occupationsDecreto: [],
      economicActivities: [],
      workModes: [],

      // Initial loading states
      loading: {
        documentTypes: false,
        genderCodes: false,
        municipalities: false,
        epsCodes: false,
        afpCodes: false,
        occupations: false,
        occupationsDecreto: false,
        economicActivities: false,
        workModes: false,
      },

      // Setters
      setDocumentTypes: (data) => set({ documentTypes: data }),
      setGenderCodes: (data) => set({ genderCodes: data }),
      setMunicipalities: (data) => set({ municipalities: data }),
      setEpsCodes: (data) => set({ epsCodes: data }),
      setAfpCodes: (data) => set({ afpCodes: data }),
      setOccupations: (data) => set({ occupations: data }),
      setOccupationsDecreto: (data) => set({ occupationsDecreto: data }),
      setEconomicActivities: (data) => set({ economicActivities: data }),
      setWorkModes: (data) => set({ workModes: data }),

      setLoading: (catalog, loading) =>
        set((state) => ({
          loading: { ...state.loading, [catalog]: loading },
        })),

      // Lazy loaders
      loadDocumentTypes: async () => {
        const state = get()
        if (state.documentTypes.length > 0 || state.loading.documentTypes) return

        set((state) => ({ loading: { ...state.loading, documentTypes: true } }))
        try {
          const { documentTypeOptions } = await import("@/lib/options/document-types")
          set({ documentTypes: documentTypeOptions })
        } catch (error) {
          console.error("Error loading document types:", error)
        } finally {
          set((state) => ({ loading: { ...state.loading, documentTypes: false } }))
        }
      },

      loadGenderCodes: async () => {
        const state = get()
        if (state.genderCodes.length > 0 || state.loading.genderCodes) return

        set((state) => ({ loading: { ...state.loading, genderCodes: true } }))
        try {
          const { genderCodeOptions } = await import("@/lib/options/gender-codes")
          set({ genderCodes: genderCodeOptions })
        } catch (error) {
          console.error("Error loading gender codes:", error)
        } finally {
          set((state) => ({ loading: { ...state.loading, genderCodes: false } }))
        }
      },

      loadMunicipalities: async () => {
        const state = get()
        if (state.municipalities.length > 0 || state.loading.municipalities) return

        set((state) => ({ loading: { ...state.loading, municipalities: true } }))
        try {
          const { municipalityOptions } = await import("@/lib/options/municipalities")
          set({ municipalities: municipalityOptions })
        } catch (error) {
          console.error("Error loading municipalities:", error)
        } finally {
          set((state) => ({ loading: { ...state.loading, municipalities: false } }))
        }
      },

      loadEpsCodes: async () => {
        const state = get()
        if (state.epsCodes.length > 0 || state.loading.epsCodes) return

        set((state) => ({ loading: { ...state.loading, epsCodes: true } }))
        try {
          const { epsCodeOptions } = await import("@/lib/options/eps-codes")
          set({ epsCodes: epsCodeOptions })
        } catch (error) {
          console.error("Error loading EPS codes:", error)
        } finally {
          set((state) => ({ loading: { ...state.loading, epsCodes: false } }))
        }
      },

      loadAfpCodes: async () => {
        const state = get()
        if (state.afpCodes.length > 0 || state.loading.afpCodes) return

        set((state) => ({ loading: { ...state.loading, afpCodes: true } }))
        try {
          const { afpCodeOptions } = await import("@/lib/options/afp-codes")
          set({ afpCodes: afpCodeOptions })
        } catch (error) {
          console.error("Error loading AFP codes:", error)
        } finally {
          set((state) => ({ loading: { ...state.loading, afpCodes: false } }))
        }
      },

      loadOccupations: async () => {
        const state = get()
        if (state.occupations.length > 0 || state.loading.occupations) return

        set((state) => ({ loading: { ...state.loading, occupations: true } }))
        try {
          const { occupationOptions } = await import("@/lib/options/occupations")
          set({ occupations: occupationOptions })
        } catch (error) {
          console.error("Error loading occupations:", error)
        } finally {
          set((state) => ({ loading: { ...state.loading, occupations: false } }))
        }
      },

      loadOccupationsDecreto: async () => {
        const state = get()
        if (state.occupationsDecreto.length > 0 || state.loading.occupationsDecreto) return

        set((state) => ({ loading: { ...state.loading, occupationsDecreto: true } }))
        try {
          const { occupationDecretoOptions } = await import("@/lib/options/ocupaciones-decreto-15632016")
          set({ occupationsDecreto: occupationDecretoOptions })
        } catch (error) {
          console.error("Error loading occupations:", error)
        } finally {
          set((state) => ({ loading: { ...state.loading, occupationsDecreto: false } }))
        }
      },

      loadEconomicActivities: async () => {
        const state = get()
        if (state.economicActivities.length > 0 || state.loading.economicActivities) return

        set((state) => ({ loading: { ...state.loading, economicActivities: true } }))
        try {
          const { economicActivityOptions } = await import("@/lib/options/economic-activities")
          set({ economicActivities: economicActivityOptions })
        } catch (error) {
          console.error("Error loading economic activities:", error)
        } finally {
          set((state) => ({ loading: { ...state.loading, economicActivities: false } }))
        }
      },

      loadWorkModes: async () => {
        const state = get()
        if (state.workModes.length > 0 || state.loading.workModes) return

        set((state) => ({ loading: { ...state.loading, workModes: true } }))
        try {
          const { workModeOptions } = await import("@/lib/options/work-modes")
          set({ workModes: workModeOptions })
        } catch (error) {
          console.error("Error loading work modes:", error)
        } finally {
          set((state) => ({ loading: { ...state.loading, workModes: false } }))
        }
      },
    }),
    {
      name: "catalog-storage",
      partialize: (state) => ({
        documentTypes: state.documentTypes,
        genderCodes: state.genderCodes,
        municipalities: state.municipalities,
        epsCodes: state.epsCodes,
        afpCodes: state.afpCodes,
        occupations: state.occupations,
        occupationsDecreto: state.occupationsDecreto,
        economicActivities: state.economicActivities,
        workModes: state.workModes,
      }),
    },
  ),
)
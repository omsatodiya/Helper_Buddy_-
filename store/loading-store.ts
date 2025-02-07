import { create } from 'zustand'
import { StateCreator } from 'zustand'

interface LoadingState {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const useLoadingStore = create<LoadingState>((set: (fn: (state: LoadingState) => LoadingState) => void) => ({
  isLoading: true,
  setIsLoading: (loading: boolean) => set((state) => ({ ...state, isLoading: loading })),
})) 
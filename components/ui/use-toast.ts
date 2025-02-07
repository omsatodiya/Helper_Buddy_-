import { create } from 'zustand'

interface ToastState {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  showToast: (toast: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => void
  toast: (props: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => void
}

export const useToast = create<ToastState>((set) => ({
  isOpen: false,
  title: undefined,
  description: undefined,
  variant: 'default',
  setIsOpen: (open) => set({ isOpen: open }),
  showToast: (toast) => {
    set({ ...toast, isOpen: true })
    setTimeout(() => {
      set({ isOpen: false })
    }, 3000)
  },
  toast: (props) => {
    set({ ...props, isOpen: true })
    setTimeout(() => {
      set({ isOpen: false })
    }, 3000)
  }
})) 
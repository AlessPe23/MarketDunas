import { createContext } from 'react'

export interface ToastInput {
  title: string
  description?: string
}

export interface ToastApi {
  notify: (toast: ToastInput) => void
}

export const ToastContext = createContext<ToastApi | null>(null)

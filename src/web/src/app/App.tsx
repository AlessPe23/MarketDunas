import { RouterProvider } from 'react-router'
import { ToastProvider, TooltipProvider } from '@/design-system'
import { router } from '@/routes/router'

export function App() {
  return (
    <TooltipProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </TooltipProvider>
  )
}

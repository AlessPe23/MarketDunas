import { Navigate, createBrowserRouter } from 'react-router'
import { LoadingState } from '@/design-system'
import { AppLayout } from '@/layouts/AppLayout/AppLayout'
import { InventoryPage } from '@/pages/InventoryPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProvisionalPage } from '@/pages/ProvisionalPage'
import { DESIGN_SYSTEM_PATH } from './navigation'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    HydrateFallback: () => <LoadingState label="Cargando aplicación" rows={3} />,
    children: [
      { index: true, element: <Navigate to="/inventario" replace /> },
      { path: 'inventario', element: <InventoryPage /> },
      { path: 'reposicion', element: <ProvisionalPage /> },
      { path: 'pedidos', element: <ProvisionalPage /> },
      { path: 'indicadores', element: <ProvisionalPage /> },
      {
        path: DESIGN_SYSTEM_PATH.slice(1),
        lazy: async () => {
          const { GalleryPage } = await import('@/design-system/gallery/GalleryPage')
          return { Component: GalleryPage }
        },
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

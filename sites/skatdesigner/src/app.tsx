import React, { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { createRouter } from './router'

const Devtools = import.meta.env.DEV
  ? React.lazy(() =>
      import('@tanstack/react-query-devtools').then((mod) => ({
        default: mod.ReactQueryDevtools,
      })),
    )
  : null

export default function App() {
  const queryClient = useMemo(() => new QueryClient({}), [])
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={createRouter()} />
      {Devtools ? (
        <React.Suspense fallback={null}>
          <Devtools />
        </React.Suspense>
      ) : null}
    </QueryClientProvider>
  )
}

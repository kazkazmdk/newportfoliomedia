import React, { useEffect, useMemo, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { createRouter } from './router'

export default function App() {
  const queryClient = useMemo(() => new QueryClient({}), [])
  const [Devtools, setDevtools] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    if (!import.meta.env.DEV) return
    let cancelled = false
    import('@tanstack/react-query-devtools').then((mod) => {
      if (!cancelled) setDevtools(() => mod.ReactQueryDevtools)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={createRouter()} />
      {Devtools ? <Devtools /> : null}
    </QueryClientProvider>
  )
}

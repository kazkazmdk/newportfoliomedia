import React from 'react'
import { Header } from '../header'
import { Footer } from 'src/components/footer'

export const getNoneLayout = (page: React.ReactElement) => page

export const getDefaultLayout = (page: React.ReactElement) => {
  return (
    <div className="min-h-screen">
      <Header />
      {page}
      <Footer />
    </div>
  )
}

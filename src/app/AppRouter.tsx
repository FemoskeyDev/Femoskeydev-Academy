import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLoader } from '../components/ui/AppLoader'
import { routeConfig } from './routeConfig'

const router = createBrowserRouter(routeConfig)
export function AppRouter() {
  const [showLoader, setShowLoader] = useState(true)
  return <><div inert={showLoader} aria-hidden={showLoader}><RouterProvider router={router}/></div>{showLoader && <AppLoader onDismiss={() => setShowLoader(false)}/>}</>
}

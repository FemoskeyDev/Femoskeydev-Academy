import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { LoadingScreen } from '../components/ui/LoadingScreen'
import { routeConfig } from './routeConfig'

const router = createBrowserRouter(routeConfig)
export function AppRouter() { return <><RouterProvider router={router}/><LoadingScreen/></> }

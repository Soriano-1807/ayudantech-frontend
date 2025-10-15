"use client"

import { BookOpen, Users, LogOut, Calendar, AlertCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Ayudantia {
  id: number
  cedula_ayudante: string
  cedula_supervisor: string
  plaza: string
  desc_objetivo: string | null
  tipo_ayudante: string
  nombre_ayudante?: string
}

interface Supervisor {
  cedula: string
  nombre: string
  correo: string
}

export default function SupervisorDashboard() {
  const router = useRouter()
  const [periodoActual, setPeriodoActual] = useState<string>("")
  const [evaluacionActiva, setEvaluacionActiva] = useState<boolean>(false)
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null)
  const [ayudantias, setAyudantias] = useState<Ayudantia[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPeriodoActual = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/periodos/actual`)
        if (response.ok) {
          const data = await response.json()
          setPeriodoActual(data.nombre)
        }
      } catch (error) {
        console.error("Error al obtener periodo actual:", error)
      }
    }

    const fetchEvaluacionStatus = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ventana-aprob`)
        if (response.ok) {
          const data = await response.json()
          setEvaluacionActiva(data.activa)
        }
      } catch (error) {
        console.error("Error al obtener estado de evaluación:", error)
      }
    }

    const fetchSupervisorData = async () => {
      try {
        const supervisorDataStr = localStorage.getItem("supervisorData")
        if (!supervisorDataStr) {
          router.push("/supervisor/login")
          return
        }

        const supervisorData = JSON.parse(supervisorDataStr)
        setSupervisor(supervisorData)

        // Fetch ayudantias for this supervisor
        const ayudantiasResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/ayudantias/supervisor/${supervisorData.cedula}`,
        )
        if (ayudantiasResponse.ok) {
          const ayudantiasData = await ayudantiasResponse.json()

          // Fetch ayudante names for each ayudantia
          const ayudantiasWithNames = await Promise.all(
            ayudantiasData.map(async (ayudantia: Ayudantia) => {
              try {
                const ayudanteResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/ayudantes/${ayudantia.cedula_ayudante}`,
                )
                if (ayudanteResponse.ok) {
                  const ayudanteData = await ayudanteResponse.json()
                  return { ...ayudantia, nombre_ayudante: ayudanteData.nombre }
                }
              } catch (error) {
                console.error("Error fetching ayudante:", error)
              }
              return { ...ayudantia, nombre_ayudante: ayudantia.cedula_ayudante }
            }),
          )

          setAyudantias(ayudantiasWithNames)
        }
      } catch (error) {
        console.error("Error al obtener datos del supervisor:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPeriodoActual()
    fetchEvaluacionStatus()
    fetchSupervisorData()

    const interval = setInterval(fetchEvaluacionStatus, 30000)
    return () => clearInterval(interval)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("supervisorData")
    router.push("/supervisor/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AyudanTech</h1>
                <p className="text-sm text-muted-foreground">Panel de Supervisor</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {periodoActual && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Periodo Actual:</span>
                  <span className="font-semibold text-foreground">{periodoActual}</span>
                </div>
              )}
              <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2 bg-transparent">
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {evaluacionActiva && (
            <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
              <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-200 font-semibold">
                Periodo de Evaluación Activo
              </AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300 mt-2">
                <p className="mb-3">El periodo de evaluación está activo. Puedes evaluar a los estudiantes ahora.</p>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => router.push("/supervisor/evaluacion")}
                >
                  Evaluar Estudiantes
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Bienvenido, {supervisor?.nombre || "Supervisor"}
            </h2>
            <p className="text-muted-foreground">Gestiona y supervisa las ayudantías asignadas a tu cargo.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Ayudantías a tu Cargo</span>
              </CardTitle>
              <CardDescription>Lista de ayudantías que supervisas en el periodo actual</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : ayudantias.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No tienes ayudantías asignadas en este momento.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estudiante</TableHead>
                        <TableHead>Plaza</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Objetivo</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ayudantias.map((ayudantia) => (
                        <TableRow key={ayudantia.id}>
                          <TableCell className="font-medium">{ayudantia.nombre_ayudante}</TableCell>
                          <TableCell>{ayudantia.plaza}</TableCell>
                          <TableCell>{ayudantia.tipo_ayudante}</TableCell>
                          <TableCell className="max-w-md truncate">
                            {ayudantia.desc_objetivo || (
                              <span className="text-muted-foreground italic">Sin objetivo definido</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                              <Eye className="h-4 w-4" />
                              Ver Actividades
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

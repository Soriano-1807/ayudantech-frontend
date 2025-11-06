"use client"

import { ArrowLeft, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Ayudantia {
  id: number
  cedula_ayudante: string
  cedula_supervisor: string
  plaza: string
  desc_objetivo: string
  tipo_ayudante: string
  nombre_ayudante?: string
}

interface Aprobado {
  id: number
  id_ayudantia: number
  periodo: string
}

export default function EvaluacionPage() {
  const router = useRouter()
  const [ayudantiasNoAprobadas, setAyudantiasNoAprobadas] = useState<Ayudantia[]>([])
  const [ayudantiasAprobadas, setAyudantiasAprobadas] = useState<Ayudantia[]>([])
  const [loading, setLoading] = useState(true)

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [ayudantiaToApprove, setAyudantiaToApprove] = useState<Ayudantia | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const fetchAyudantias = async () => {
      try {
        // Get supervisor data from localStorage
        const supervisorData = localStorage.getItem("supervisorData")
        if (!supervisorData) {
          router.push("/supervisor/login")
          return
        }

        const supervisor = JSON.parse(supervisorData)
        const cedulaSupervisor = supervisor.cedula

        // Fetch current period
        const periodoRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/periodos/actual`)
        if (!periodoRes.ok) {
          console.error("No hay período activo")
          setLoading(false)
          return
        }
        const periodoData = await periodoRes.json()
        const periodoActual = periodoData.nombre

        // Fetch supervisor's ayudantías
        const ayudantiasRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/ayudantias/supervisor/${cedulaSupervisor}`,
        )
        if (!ayudantiasRes.ok) {
          setLoading(false)
          return
        }
        const ayudantiasData: Ayudantia[] = await ayudantiasRes.json()

        // Fetch approved ayudantías for current period
        const aprobadosRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/aprobado/periodo/${periodoActual}`)
        const aprobadosData: Aprobado[] = aprobadosRes.ok ? await aprobadosRes.json() : []

        // Create a Set of approved ayudantía IDs for quick lookup
        const aprobadosIds = new Set(aprobadosData.map((a) => a.id_ayudantia))

        // Fetch ayudante names for all ayudantías
        const ayudantiasConNombres = await Promise.all(
          ayudantiasData.map(async (ayudantia) => {
            try {
              const ayudanteRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/ayudantes/${ayudantia.cedula_ayudante}`,
              )
              if (ayudanteRes.ok) {
                const ayudanteData = await ayudanteRes.json()
                return { ...ayudantia, nombre_ayudante: ayudanteData.nombre }
              }
            } catch (error) {
              console.error("Error fetching ayudante:", error)
            }
            return { ...ayudantia, nombre_ayudante: ayudantia.cedula_ayudante }
          }),
        )

        // Separate into approved and not approved
        const noAprobadas = ayudantiasConNombres.filter((a) => !aprobadosIds.has(a.id))
        const aprobadas = ayudantiasConNombres.filter((a) => aprobadosIds.has(a.id))

        setAyudantiasNoAprobadas(noAprobadas)
        setAyudantiasAprobadas(aprobadas)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching ayudantías:", error)
        setLoading(false)
      }
    }

    fetchAyudantias()
  }, [router])

  const handleAprobar = (ayudantia: Ayudantia) => {
    setAyudantiaToApprove(ayudantia)
    setShowConfirmDialog(true)
  }

  const confirmAprobar = async () => {
    if (!ayudantiaToApprove) return

    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/aprobado`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_ayudantia: ayudantiaToApprove.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setErrorMessage(errorData.error || "Error al aprobar la ayudantía")
        setShowErrorModal(true)
        setShowConfirmDialog(false)
        setIsSubmitting(false)
        return
      }

      // Move ayudantía from no aprobadas to aprobadas
      setAyudantiasNoAprobadas((prev) => prev.filter((a) => a.id !== ayudantiaToApprove.id))
      setAyudantiasAprobadas((prev) => [...prev, ayudantiaToApprove])

      setShowConfirmDialog(false)
      setShowSuccessModal(true)
      setAyudantiaToApprove(null)
      setIsSubmitting(false)
    } catch (error) {
      console.error("Error al aprobar:", error)
      setErrorMessage("Error al aprobar la ayudantía")
      setShowErrorModal(true)
      setShowConfirmDialog(false)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/supervisor/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Evaluación de Estudiantes</h1>
                <p className="text-sm text-muted-foreground">Aprueba o rechaza ayudantes</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ayudantes sin aprobar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Ayudantes sin Aprobar
                </CardTitle>
                <CardDescription>Estudiantes pendientes de evaluación ({ayudantiasNoAprobadas.length})</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">Cargando...</p>
                  </div>
                ) : ayudantiasNoAprobadas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No hay ayudantes pendientes de aprobación</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ayudantiasNoAprobadas.map((ayudantia) => (
                      <Card key={ayudantia.id} className="border-orange-200">
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-foreground">{ayudantia.nombre_ayudante}</h3>
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                {ayudantia.tipo_ayudante}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Plaza:</span> {ayudantia.plaza}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Cédula:</span> {ayudantia.cedula_ayudante}
                            </p>
                            {ayudantia.desc_objetivo && (
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Objetivo:</span> {ayudantia.desc_objetivo}
                              </p>
                            )}
                            <div className="pt-2">
                              <Button
                                onClick={() => handleAprobar(ayudantia)}
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                Aprobar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Aprobados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Aprobados
                </CardTitle>
                <CardDescription>Estudiantes que han sido aprobados ({ayudantiasAprobadas.length})</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">Cargando...</p>
                  </div>
                ) : ayudantiasAprobadas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No hay ayudantes aprobados aún</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ayudantiasAprobadas.map((ayudantia) => (
                      <Card key={ayudantia.id} className="border-green-200">
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-foreground">{ayudantia.nombre_ayudante}</h3>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                {ayudantia.tipo_ayudante}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Plaza:</span> {ayudantia.plaza}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Cédula:</span> {ayudantia.cedula_ayudante}
                            </p>
                            {ayudantia.desc_objetivo && (
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Objetivo:</span> {ayudantia.desc_objetivo}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Confirmar Aprobación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas aprobar a{" "}
              <span className="font-semibold">{ayudantiaToApprove?.nombre_ayudante}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              <strong>Advertencia:</strong> Una vez aprobado, esta acción no se puede deshacer.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={confirmAprobar} className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
              {isSubmitting ? "Procesando..." : "Confirmar Aprobación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Aprobación Exitosa
            </DialogTitle>
            <DialogDescription>El ayudante ha sido aprobado correctamente para el período actual.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccessModal(false)} className="bg-green-600 hover:bg-green-700">
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Error
            </DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowErrorModal(false)} variant="destructive">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

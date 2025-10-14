"use client"

import { BookOpen, ArrowLeft, Mail, Award as IdCard, Building2, User, Briefcase, Edit2, Save, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AyudanteData {
  cedula: number
  correo: string
  nombre: string
  apellido: string
}

interface AyudantiaData {
  id: number
  cedula_ayudante: number
  cedula_supervisor: number
  plaza: string
  desc_objetivo: string
  tipo_ayudante: string
}

interface PeriodoData {
  nombre: string
  actual: boolean
}

export default function AyudanteDashboardPage() {
  const [ayudante, setAyudante] = useState<AyudanteData | null>(null)
  const [ayudantia, setAyudantia] = useState<AyudantiaData | null>(null)
  const [hasAyudantia, setHasAyudantia] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingObjetivo, setIsEditingObjetivo] = useState(false)
  const [objetivoText, setObjetivoText] = useState("")
  const [isSavingObjetivo, setIsSavingObjetivo] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [periodoActual, setPeriodoActual] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchPeriodoActual = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/periodos/actual`)
        if (response.ok) {
          const data: PeriodoData = await response.json()
          setPeriodoActual(data.nombre)
        }
      } catch (error) {
        console.error("Error fetching periodo actual:", error)
      }
    }

    fetchPeriodoActual()
  }, [])

  useEffect(() => {
    const fetchAyudanteData = async () => {
      const email = localStorage.getItem("ayudanteEmail")

      if (!email) {
        router.push("/ayudante/login")
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ayudantes/correo/${email}`)

        if (response.ok) {
          const data = await response.json()
          setAyudante(data)

          try {
            const ayudantiaResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ayudantias/cedula/${data.cedula}`)

            if (ayudantiaResponse.ok) {
              const ayudantiaData = await ayudantiaResponse.json()
              setAyudantia(ayudantiaData)
              setHasAyudantia(true)
              setObjetivoText(ayudantiaData.desc_objetivo || "")
            } else if (ayudantiaResponse.status === 404) {
              setHasAyudantia(false)
            }
          } catch (error) {
            console.error("Error fetching ayudantia data:", error)
            setHasAyudantia(false)
          }
        } else {
          localStorage.removeItem("ayudanteEmail")
          router.push("/ayudante/login")
        }
      } catch (error) {
        console.error("Error fetching ayudante data:", error)
        router.push("/ayudante/login")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAyudanteData()
  }, [router])

  const handleSaveObjetivo = async () => {
    if (!ayudantia) return

    setIsSavingObjetivo(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ayudantias/${ayudantia.id}/objetivo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ desc_objetivo: objetivoText }),
      })

      if (response.ok) {
        setAyudantia({ ...ayudantia, desc_objetivo: objetivoText })
        setIsEditingObjetivo(false)
        setShowSuccessModal(true)
      } else {
        const error = await response.json()
        alert(`❌ Error: ${error.error || "No se pudo actualizar el objetivo"}`)
      }
    } catch (error) {
      console.error("Error saving objetivo:", error)
      alert("❌ Error al guardar el objetivo")
    } finally {
      setIsSavingObjetivo(false)
    }
  }

  const handleCancelEdit = () => {
    setObjetivoText(ayudantia?.desc_objetivo || "")
    setIsEditingObjetivo(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("ayudanteEmail")
    router.push("/ayudante/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Portal de Ayudantes</h1>
              <p className="text-muted-foreground">Bienvenido a tu panel de ayudantía</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {periodoActual && (
              <div className="text-sm font-medium text-foreground bg-accent/50 px-3 py-1.5 rounded-lg">
                Periodo Actual: <span className="font-bold">{periodoActual}</span>
              </div>
            )}
            {ayudante && (
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <IdCard className="h-4 w-4" />
                  <span>Cédula: {ayudante.cedula}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{ayudante.correo}</span>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Salir
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mi Ayudantía</CardTitle>
            </CardHeader>
            <CardContent>
              {hasAyudantia && ayudantia ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Plaza</p>
                        <p className="text-base font-semibold text-foreground">{ayudantia.plaza}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tipo de Ayudante</p>
                        <p className="text-base font-semibold text-foreground">{ayudantia.tipo_ayudante}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Cédula Supervisor</p>
                        <p className="text-base font-semibold text-foreground">{ayudantia.cedula_supervisor}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <IdCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">ID Ayudantía</p>
                        <p className="text-base font-semibold text-foreground">#{ayudantia.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Descripción del Objetivo</p>
                      {!isEditingObjetivo && (
                        <Button variant="ghost" size="sm" onClick={() => setIsEditingObjetivo(true)} className="h-8">
                          <Edit2 className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      )}
                    </div>

                    {isEditingObjetivo ? (
                      <div className="space-y-3">
                        <Textarea
                          value={objetivoText}
                          onChange={(e) => setObjetivoText(e.target.value)}
                          placeholder="Describe el objetivo de tu ayudantía..."
                          className="min-h-[120px] resize-none"
                        />
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isSavingObjetivo}>
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                          <Button size="sm" onClick={handleSaveObjetivo} disabled={isSavingObjetivo}>
                            <Save className="h-4 w-4 mr-2" />
                            {isSavingObjetivo ? "Guardando..." : "Guardar"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted/50 rounded-lg p-4">
                        {ayudantia.desc_objetivo ? (
                          <p className="text-base text-foreground whitespace-pre-wrap">{ayudantia.desc_objetivo}</p>
                        ) : (
                          <p className="text-muted-foreground italic">
                            No hay objetivo definido. Haz clic en "Editar" para agregar uno.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Sin Ayudantía Asignada</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Todavía no has sido asignado a una ayudantía. Por favor, contacta con el administrador para más
                    información.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Objetivo actualizado correctamente</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="text-center text-muted-foreground">
              La descripción del objetivo ha sido guardada exitosamente.
            </p>
          </div>
          <div className="flex justify-center pb-2">
            <Button onClick={() => setShowSuccessModal(false)} className="w-24">
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

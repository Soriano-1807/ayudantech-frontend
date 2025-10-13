"use client"

import { BookOpen, ArrowLeft, Mail, Award as IdCard, Building2, User, Briefcase } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function AyudanteDashboardPage() {
  const [ayudante, setAyudante] = useState<AyudanteData | null>(null)
  const [ayudantia, setAyudantia] = useState<AyudantiaData | null>(null)
  const [hasAyudantia, setHasAyudantia] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

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

                  {ayudantia.desc_objetivo && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Descripción del Objetivo</p>
                      <p className="text-base text-foreground">{ayudantia.desc_objetivo}</p>
                    </div>
                  )}
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
    </div>
  )
}

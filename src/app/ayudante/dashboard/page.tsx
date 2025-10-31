"use client"

import type React from "react"

import {
  BookOpen,
  ArrowLeft,
  Mail,
  Award as IdCard,
  Building2,
  User,
  Briefcase,
  Edit2,
  Save,
  X,
  Plus,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  const router = useRouter() // <-- agrega esto

  const [ayudante, setAyudante] = useState<AyudanteData | null>(null)
  const [ayudantia, setAyudantia] = useState<AyudantiaData | null>(null)
  const [hasAyudantia, setHasAyudantia] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingObjetivo, setIsEditingObjetivo] = useState(false)
  const [objetivoText, setObjetivoText] = useState("")
  const [isSavingObjetivo, setIsSavingObjetivo] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [periodoActual, setPeriodoActual] = useState<string | null>(null)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [actividadDesc, setActividadDesc] = useState("")
  const [actividadFecha, setActividadFecha] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [actividadEvidencia, setActividadEvidencia] = useState<File | null>(null)
  const [actividadEvidenciaComentario, setActividadEvidenciaComentario] = useState<string>("")
  const [actividadMensaje, setActividadMensaje] = useState<string | null>(null)
  const [isSubmittingActividad, setIsSubmittingActividad] = useState(false)
  const [showActivitySuccessModal, setShowActivitySuccessModal] = useState(false)
  const [actividades, setActividades] = useState<any[]>([])
  const [isAprobadaEnPeriodoActual, setIsAprobadaEnPeriodoActual] = useState(false)

  // NUEVO: listado de actividades y función para obtenerlas
  const fetchActividades = async () => {
    if (!ayudantia) {
      setActividades([])
      return
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/actividades/ayudantia/${ayudantia.id}`)
      if (res.ok) {
        const data = await res.json()
        setActividades(data)
      } else {
        setActividades([])
      }
    } catch (err) {
      console.error("Error fetching actividades:", err)
      setActividades([])
    }
  }

  // Llama a fetchActividades cuando se cargue la ayudantía
  useEffect(() => {
    if (ayudantia) fetchActividades()
  }, [ayudantia])

  useEffect(() => {
    const fetchAyudanteData = async () => {
      const email = localStorage.getItem("ayudanteEmail")

      if (!email) {
        router.push("/ayudante/login")
        return
      }

      try {
        const periodoResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/periodos/actual`)
        let currentPeriodo: string | null = null

        if (periodoResponse.ok) {
          const periodoData: PeriodoData = await periodoResponse.json()
          currentPeriodo = periodoData.nombre
          setPeriodoActual(currentPeriodo)
        }

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

              if (currentPeriodo) {
                try {
                  const aprobadosResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/aprobado/detalles`)

                  if (aprobadosResponse.ok) {
                    const aprobadosData = await aprobadosResponse.json()

                    // Extraer el array de ayudantías aprobadas
                    let ayudantiasAprobadas: any[] = []

                    if (Array.isArray(aprobadosData)) {
                      ayudantiasAprobadas = aprobadosData
                    } else if (aprobadosData && typeof aprobadosData === "object") {
                      // Intentar extraer de diferentes propiedades posibles
                      if (Array.isArray(aprobadosData.ayudantias_aprobadas)) {
                        ayudantiasAprobadas = aprobadosData.ayudantias_aprobadas
                      } else if (Array.isArray(aprobadosData.data)) {
                        ayudantiasAprobadas = aprobadosData.data
                      } else if (Array.isArray(aprobadosData.rows)) {
                        ayudantiasAprobadas = aprobadosData.rows
                      }
                    }

                    console.log("[v0] Array extraído:", ayudantiasAprobadas)
                    console.log("[v0] Cantidad:", ayudantiasAprobadas.length)

                    if (ayudantiasAprobadas.length > 0) {
                      const nombreAyudanteActual = `${data.nombre} ${data.apellido}`.toLowerCase().trim()
                      console.log("[v0] Buscando:", nombreAyudanteActual)
                      console.log("[v0] Primer registro:", ayudantiasAprobadas[0])

                      const isApproved = ayudantiasAprobadas.some((aprobado: any) => {
                        const nombreAprobado = (aprobado.nombre_ayudante || "").toLowerCase().trim()
                        console.log("[v0] Comparando:", nombreAprobado, "===", nombreAyudanteActual)
                        return nombreAprobado === nombreAyudanteActual
                      })

                      console.log("[v0] Resultado:", isApproved)
                      setIsAprobadaEnPeriodoActual(isApproved)
                    } else {
                      console.log("[v0] No hay registros aprobados")
                      setIsAprobadaEnPeriodoActual(false)
                    }
                  }
                } catch (error) {
                  console.error("[v0] Error:", error)
                  setIsAprobadaEnPeriodoActual(false)
                }
              }
            } else if (ayudantiaResponse.status === 404) {
              setHasAyudantia(false)
            }
          } catch (error) {
            console.error("[v0] Error fetching ayudantia data:", error)
            setHasAyudantia(false)
          }
        } else {
          localStorage.removeItem("ayudanteEmail")
          router.push("/ayudante/login")
        }
      } catch (error) {
        console.error("[v0] Error fetching ayudante data:", error)
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

  const getCurrentUserFromSession = () => {
    try {
      if (typeof window === "undefined") return null
      return JSON.parse(localStorage.getItem("user") || "null")
    } catch (err) {
      console.error("getCurrentUserFromSession parse error:", err)
      return null
    }
  }

  const handleFileChangeActividad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setActividadEvidencia(file)
  }

  // helper para leer archivo como DataURL
  const readFileAsDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = (err) => reject(err)
      reader.readAsDataURL(file)
    })

  const handleCreateActividad = async () => {
    // require ayudantía (backend necesita id_ayudantia)
    if (!ayudantia) {
      setActividadMensaje("❌ No tienes una ayudantía asignada")
      console.error("No ayudantia available - ayudantia:", ayudantia)
      return
    }

    if (!actividadDesc || !actividadDesc.trim()) {
      setActividadMensaje("❌ La descripción es obligatoria")
      return
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
      setActividadMensaje("❌ URL del backend no configurada")
      console.error("NEXT_PUBLIC_API_URL is undefined")
      return
    }

    setIsSubmittingActividad(true)
    setActividadMensaje(null)

    try {
      // preparar evidencia: si hay archivo lo convertimos a base64, si no usamos el comentario (si existe)
      let evidenciaPayload: string | null = null
      if (actividadEvidencia) {
        try {
          evidenciaPayload = await readFileAsDataURL(actividadEvidencia)
        } catch (err) {
          console.error("Error leyendo archivo de evidencia:", err)
          setActividadMensaje("❌ Error al leer la evidencia")
          setIsSubmittingActividad(false)
          return
        }
      } else if (actividadEvidenciaComentario && actividadEvidenciaComentario.trim()) {
        evidenciaPayload = actividadEvidenciaComentario.trim()
      }

      const periodo =
        periodoActual || getCurrentUserFromSession()?.periodo || getCurrentUserFromSession()?.periodoActual || ""
      const fecha = actividadFecha // frontend incluye fecha (backend también genera si lo prefiere)

      const payload: any = {
        id_ayudantia: ayudantia.id,
        descripcion: actividadDesc,
      }
      if (evidenciaPayload) payload.evidencia = evidenciaPayload
      if (fecha) payload.fecha = fecha
      if (periodo) payload.periodo = periodo

      console.debug("Enviando actividad (JSON) ->", {
        url: `${apiUrl}/actividades`,
        payload,
      })

      const res = await fetch(`${apiUrl}/actividades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        // mostrar confirmación clara al usuario
        setActividadMensaje(null)
        setActividadDesc("")
        setActividadEvidencia(null)
        setActividadEvidenciaComentario("")
        setActividadFecha(new Date().toISOString().slice(0, 10))
        setShowActivityModal(false)
        setShowActivitySuccessModal(true) // <-- abre modal de confirmación
        // actualizar lista si existe
        if (typeof (global as any).fetchActividades === "function") (global as any).fetchActividades()
      } else {
        let errObj = null
        try {
          errObj = await res.json()
        } catch (jsonErr) {
          const txt = await res.text().catch(() => "")
          console.error("Actividad create response (text):", txt)
          setActividadMensaje(`❌ Error: ${txt || "Respuesta inesperada del servidor"}`)
          return
        }
        console.error("Actividad create response (json):", errObj)
        const msg = errObj?.error || errObj?.message || "Error al crear la actividad"
        setActividadMensaje(`❌ ${msg}`)
      }
    } catch (e) {
      console.error("Error al crear actividad:", e)
      setActividadMensaje("❌ Error de conexión al crear la actividad")
    } finally {
      setIsSubmittingActividad(false)
    }
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

        {isAprobadaEnPeriodoActual && (
          <div className="mb-6 rounded-lg border border-green-500 bg-green-50 dark:bg-green-950/20 p-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base text-green-800 dark:text-green-200 mb-1">
                  ¡Felicidades! Has sido aprobado en el periodo {periodoActual}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Tu ayudantía ha sido evaluada y aprobada exitosamente. Eres elegible para recibir el beneficio.
                </p>
              </div>
            </div>
          </div>
        )}

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

          {/* NUEVO: Registro de Actividades */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Actividades realizadas</CardTitle>
                <p className="text-sm text-muted-foreground">Resumen de actividades registradas por ti</p>
              </div>
              <div>
                <Button onClick={() => setShowActivityModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {actividades.length === 0 ? (
                <div className="text-muted-foreground">No hay actividades registradas todavía.</div>
              ) : (
                <ul className="space-y-3">
                  {actividades.map((a) => (
                    <li key={a.id} className="flex items-start justify-between p-3 bg-muted/30 rounded-md">
                      <div>
                        <div className="text-sm text-muted-foreground">{new Date(a.fecha).toLocaleString()}</div>
                        <div className="font-medium text-foreground">{a.descripcion}</div>
                        {a.evidencia && (
                          <div className="text-xs text-muted-foreground mt-1 truncate max-w-lg">
                            Evidencia: {String(a.evidencia).slice(0, 120)}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{a.periodo}</div>
                    </li>
                  ))}
                </ul>
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

      {/* Modal de crear actividad */}
      <Dialog
        open={showActivityModal}
        onOpenChange={(open) => {
          setShowActivityModal(open)
          if (!open) {
            setActividadMensaje(null)
            setActividadDesc("")
            setActividadEvidencia(null)
            setActividadEvidenciaComentario("")
            setActividadFecha(new Date().toISOString().slice(0, 10))
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Agregar Actividad</DialogTitle>
          </DialogHeader>

          {actividadMensaje && (
            <div
              className={`p-3 rounded-md mb-3 ${actividadMensaje.startsWith("✅") ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}
            >
              {actividadMensaje}
            </div>
          )}

          <div className="space-y-4">
            <Textarea
              placeholder="Descripción de la actividad"
              value={actividadDesc}
              onChange={(e) => setActividadDesc(e.target.value)}
              rows={4}
              className="min-h-[100px]"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha</Label>
                <Input type="date" value={actividadFecha} onChange={(e) => setActividadFecha(e.target.value)} />
              </div>
              <div>
                <Label>Periodo (auto)</Label>
                <Input value={periodoActual || ""} readOnly />
              </div>
            </div>

            <div>
              <Label>Evidencia (archivo)</Label>
              <div className="flex items-center gap-3">
                <input
                  id="actividad-evidencia-file"
                  type="file"
                  accept=".pdf,.jpg,.png,.jpeg"
                  onChange={handleFileChangeActividad}
                  className="hidden"
                />
                <label
                  htmlFor="actividad-evidencia-file"
                  className="inline-flex items-center px-3 py-2 rounded-md bg-muted/20 cursor-pointer text-sm"
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Seleccionar archivo
                </label>
                <span className="text-sm text-muted-foreground">
                  {actividadEvidencia ? actividadEvidencia.name : "Sin archivos seleccionados"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Adjunta un archivo (opcional) o escribe un comentario abajo.
              </p>
            </div>

            <div>
              <Label>Comentario de evidencia (opcional)</Label>
              <Input
                placeholder="Describe la evidencia o agrega un enlace (opcional)"
                value={actividadEvidenciaComentario}
                onChange={(e) => setActividadEvidenciaComentario(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowActivityModal(false)}>
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  await handleCreateActividad()
                  // actualizar lista si se creó correctamente
                  setTimeout(fetchActividades, 500)
                }}
                disabled={isSubmittingActividad || !actividadDesc}
              >
                {isSubmittingActividad ? "Guardando..." : "Crear Actividad"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmación de actividad */}
      <Dialog open={showActivitySuccessModal} onOpenChange={setShowActivitySuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Actividad registrada</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <p className="text-center text-muted-foreground">
              ✅ La actividad fue registrada correctamente. Tu supervisor podrá validarla.
            </p>
          </div>
          <div className="flex justify-center pb-2">
            <Button onClick={() => setShowActivitySuccessModal(false)} className="w-24">
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

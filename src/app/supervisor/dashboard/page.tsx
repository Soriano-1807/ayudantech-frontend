"use client"

import { BookOpen, Users, LogOut, Calendar, AlertCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Search, DownloadCloud } from "lucide-react"

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

interface AyudantiaForSupervisor {
  id: number
  cedula_ayudante: number
  cedula_supervisor: number
  plaza: string
  desc_objetivo: string
  tipo_ayudante: string
  nombre_ayudante?: string
}

interface ActividadItem {
  id: number
  id_ayudantia: number
  fecha: string
  descripcion: string
  evidencia?: string | null
  periodo?: string | null
}

export default function SupervisorDashboard() {
  const router = useRouter()

  // mínimo handler de logout para evitar "Cannot find name 'handleLogout'"
  const handleLogout = () => {
    try {
      localStorage.removeItem("supervisorEmail")
      localStorage.removeItem("supervisor")
    } catch {}
    router.push("/") // ajusta la ruta de salida si necesitas otra
  }

  const [periodoActual, setPeriodoActual] = useState<string>("")
  const [evaluacionActiva, setEvaluacionActiva] = useState<boolean>(false)
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null)
  const [ayudantias, setAyudantias] = useState<AyudantiaForSupervisor[]>([])
  const [actividadesMap, setActividadesMap] = useState<Record<number, ActividadItem[]>>({})
  const [showActivitiesModal, setShowActivitiesModal] = useState(false)
  const [selectedAyudantia, setSelectedAyudantia] = useState<AyudantiaForSupervisor | null>(null)
  const [selectedActividades, setSelectedActividades] = useState<ActividadItem[]>([])
  const [filter, setFilter] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showDetail, setShowDetail] = useState(false)
  const [detailActividad, setDetailActividad] = useState<ActividadItem | null>(null)
  const pollingRef = useRef<number | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  // toggle de ventana de evaluación
  const toggleEvaluacion = async () => {
    if (!apiUrl) return
    try {
      const res = await fetch(`${apiUrl}/ventana-aprob`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !evaluacionActiva }),
      })
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        const nueva = data?.nuevaVentana?.activa
        if (typeof nueva === "boolean") setEvaluacionActiva(nueva)
        else setEvaluacionActiva(!evaluacionActiva)
      } else {
        console.error("Error toggling evaluacion:", await res.text().catch(() => ""))
      }
    } catch (err) {
      console.error("Error toggling evaluacion:", err)
    }
  }

  const getSessionEmail = () => {
    try {
      if (typeof window === "undefined") return null
      return localStorage.getItem("supervisorEmail")
    } catch {
      return null
    }
  }

  const fetchAyudantias = async (cedulaSupervisor?: number) => {
    if (!apiUrl || !cedulaSupervisor) return []
    try {
      const res = await fetch(`${apiUrl}/ayudantias/supervisor/${cedulaSupervisor}`)
      if (!res.ok) return []
      const data = await res.json()
      return data as AyudantiaForSupervisor[]
    } catch (err) {
      console.error("Error fetching ayudantias:", err)
      return []
    }
  }

  const fetchActividadesForAyudantia = async (idAyudantia: number) => {
    if (!apiUrl) return []
    try {
      const res = await fetch(`${apiUrl}/actividades/ayudantia/${idAyudantia}`)
      if (!res.ok) return []
      const data = await res.json()
      return data as ActividadItem[]
    } catch (err) {
      console.error("Error fetching actividades for ayudantia", idAyudantia, err)
      return []
    }
  }

  // cargar periodo actual y estado de ventana dentro de fetchAll
  const fetchAll = async () => {
    setIsLoading(true)
    try {
      // obtener supervisor desde sesión/back-office
      const email = getSessionEmail()
      if (!email) {
        router.push("/supervisor/login")
        return
      }
      // obtener datos del supervisor (simple) por correo si tu backend expone endpoint, sino usa localStorage
      let supCedula: number | undefined
      try {
        const supResp = await fetch(`${apiUrl}/supervisores/correo/${encodeURIComponent(email)}`)
        if (supResp.ok) {
          const sup = await supResp.json()
          setSupervisor(sup)
          supCedula = sup.cedula
        } else {
          // fallback si no existe endpoint o falla
          const item = JSON.parse(localStorage.getItem("supervisor") || "null")
          supCedula = item?.cedula
          setSupervisor(item || null)
        }
      } catch (err) {
        console.error("Error fetching supervisor by email:", err)
      }

      const ayus = await fetchAyudantias(supCedula)
      // enriquecer con nombre del estudiante si es posible
      const nombres = await Promise.all(
        ayus.map((a) => fetchAyudanteNombre(a.cedula_ayudante).catch(() => null))
      )
      const ayusEnriched = ayus.map((a, i) => ({
        ...a,
        nombre_ayudante: nombres[i] || a.nombre_ayudante || `${a.cedula_ayudante}`,
      }))
      setAyudantias(ayusEnriched)

      const map: Record<number, ActividadItem[]> = {}
      await Promise.all(
        ayus.map(async (a) => {
          const acts = await fetchActividadesForAyudantia(a.id)
          map[a.id] = acts
        }),
      )
      setActividadesMap(map)

      // obtener periodo actual
      try {
        const pRes = await fetch(`${apiUrl}/periodos/actual`)
        if (pRes.ok) {
          const pJson = await pRes.json()
          setPeriodoActual(pJson?.nombre || "")
        }
      } catch (err) {
        console.error("Error fetching periodo actual:", err)
      }

      // obtener estado de ventana de evaluación
      try {
        const vRes = await fetch(`${apiUrl}/ventana-aprob`)
        if (vRes.ok) {
          const vJson = await vRes.json()
          setEvaluacionActiva(Boolean(vJson?.activa))
        }
      } catch (err) {
        console.error("Error fetching ventana-aprob:", err)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // polling cada 6s
    if (pollingRef.current) window.clearInterval(pollingRef.current)
    pollingRef.current = window.setInterval(() => {
      fetchAll()
    }, 6000)
    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleOpenDetail = (actividad: ActividadItem) => {
    setDetailActividad(actividad)
    setShowDetail(true)
  }

  const downloadEvidence = (evidencia?: string | null) => {
    if (!evidencia) return
    // si es URL directa, abrir; si es dataURL, forzar descarga
    if (evidencia.startsWith("http") || evidencia.startsWith("/uploads")) {
      window.open(evidencia, "_blank")
    } else if (evidencia.startsWith("data:")) {
      const a = document.createElement("a")
      a.href = evidencia
      a.download = "evidencia"
      document.body.appendChild(a)
      a.click()
      a.remove()
    } else {
      // texto: copiar a portapapeles
      navigator.clipboard?.writeText(evidencia).then(() => {
        alert("Evidencia (texto) copiada al portapapeles")
      })
    }
  }

  // obtiene nombre del ayudante por su cédula
  const fetchAyudanteNombre = async (cedula: number | string) => {
    try {
      const res = await fetch(`${apiUrl}/ayudantes/${cedula}`)
      if (!res.ok) return null
      const data = await res.json()
      return `${data.nombre || ""}${data.apellido ? " " + data.apellido : ""}`.trim()
    } catch (err) {
      console.error("Error fetching ayudante:", err)
      return null
    }
  }

  // abre modal con actividades de la ayudantía seleccionada
  const openActivities = async (ayudantia: AyudantiaForSupervisor) => {
    setSelectedAyudantia(ayudantia)
    // usar cache si existe
    const cached = actividadesMap[ayudantia.id] || []
    if (cached.length > 0) {
      setSelectedActividades(cached)
      setShowActivitiesModal(true)
      return
    }
    const acts = await fetchActividadesForAyudantia(ayudantia.id)
    setActividadesMap((prev) => ({ ...prev, [ayudantia.id]: acts }))
    setSelectedActividades(acts)
    setShowActivitiesModal(true)
  }

  // filtro por cédula o texto en ayudantía/descripcion
  const filteredAyudantias = ayudantias.filter((a) => {
    if (!filter) return true
    const s = filter.trim().toLowerCase()
    return (
      String(a.cedula_ayudante).includes(s) ||
      String(a.plaza || "").toLowerCase().includes(s) ||
      String(a.tipo_ayudante || "").toLowerCase().includes(s)
    )
  })

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
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 bg-transparent"
                              onClick={() => openActivities(ayudantia)}
                            >
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

      {/* Modal detalle actividad */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de la actividad</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {detailActividad ? new Date(detailActividad.fecha).toLocaleString() : ""}
            </div>
            <div className="font-medium text-foreground">{detailActividad?.descripcion}</div>
            {detailActividad?.evidencia && (
              <div>
                <div className="text-sm text-muted-foreground mb-2">Evidencia</div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => downloadEvidence(detailActividad.evidencia)}>
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    Abrir / Descargar
                  </Button>
                </div>
              </div>
            )}
            <div className="text-sm text-muted-foreground">Periodo: {detailActividad?.periodo || "-"}</div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowDetail(false)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: actividades de la ayudantía */}
      <Dialog open={showActivitiesModal} onOpenChange={setShowActivitiesModal}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Actividades — Ayudantía #{selectedAyudantia?.id}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Estudiante:{" "}
              <span className="font-medium text-foreground">
                {selectedAyudantia?.nombre_ayudante || "Cargando..."}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Plaza:{" "}
              <span className="font-medium text-foreground">{selectedAyudantia?.plaza}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Tipo:{" "}
              <span className="font-medium text-foreground">{selectedAyudantia?.tipo_ayudante}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Objetivo:{" "}
              <span className="font-medium text-foreground">
                {selectedAyudantia?.desc_objetivo || "-"}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                if (!selectedAyudantia) return
                // obtener nombre ayudante si no está en caché
                if (!selectedAyudantia.nombre_ayudante) {
                  const nombre = await fetchAyudanteNombre(selectedAyudantia.cedula_ayudante)
                  setSelectedAyudantia((prev) =>
                    prev
                      ? {
                          ...prev,
                          nombre_ayudante: nombre ?? prev.nombre_ayudante ?? String(prev.cedula_ayudante),
                        }
                      : prev,
                  )
                }
                setSelectedActividades(actividadesMap[selectedAyudantia.id] || [])
              }}
            >
              Cargar Actividades
            </Button>
          </div>
          {selectedActividades.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              No hay actividades registradas para esta ayudantía.
            </div>
          ) : (
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Evidencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedActividades.map((actividad) => (
                    <TableRow key={actividad.id}>
                      <TableCell className="font-medium">
                        {new Date(actividad.fecha).toLocaleString()}
                      </TableCell>
                      <TableCell>{actividad.descripcion}</TableCell>
                      <TableCell className="text-right">
                        {actividad.evidencia ? (
                          <Button
                            variant="link"
                            onClick={() => downloadEvidence(actividad.evidencia)}
                            className="p-0"
                          >
                            Descargar
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">Sin evidencia</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowActivitiesModal(false)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

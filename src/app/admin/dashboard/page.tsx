"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  BookOpen,
  Users,
  Briefcase,
  TrendingUp,
  Award,
  Settings,
  LogOut,
  Bell,
  Search,
  Plus,
  Menu,
  ChevronLeft,
  UserPlus,
  GraduationCap,
  AlertTriangle,
  Edit,
  Trash2,
} from "lucide-react"

const createAssistantSchema = z.object({
  cedula: z.string().min(1, "La cédula es requerida").regex(/^\d+$/, "La cédula debe contener solo números"),
  nombre: z.string().min(1, "El nombre es requerido").min(2, "El nombre debe tener al menos 2 caracteres"),
  correo: z
    .string()
    .min(1, "El correo es requerido")
    .email("Formato de correo inválido")
    .refine((email) => email.endsWith("@correo.unimet.edu.ve"), "El correo debe terminar en @correo.unimet.edu.ve"),
  nivel: z.string().min(1, "Debes seleccionar un nivel académico"),
  facultad: z.string().min(1, "Debes seleccionar una facultad"),
  carrera: z.string().min(1, "Debes seleccionar una carrera"),
})

const editAssistantSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").min(2, "El nombre debe tener al menos 2 caracteres"),
  correo: z
    .string()
    .min(1, "El correo es requerido")
    .email("Formato de correo inválido")
    .refine((email) => email.endsWith("@correo.unimet.edu.ve"), "El correo debe terminar en @correo.unimet.edu.ve"),
  nivel: z.string().min(1, "Debes seleccionar un nivel académico"),
  facultad: z.string().min(1, "Debes seleccionar una facultad"),
  carrera: z.string().min(1, "Debes seleccionar una carrera"),
})

const createSupervisorSchema = z.object({
  cedula: z.string().min(1, "La cédula es requerida").regex(/^\d+$/, "La cédula debe contener solo números"),
  nombre: z.string().min(1, "El nombre es requerido").min(2, "El nombre debe tener al menos 2 caracteres"),
  correo: z
    .string()
    .min(1, "El correo es requerido")
    .email("Formato de correo inválido")
    .refine((email) => email.endsWith("@correo.unimet.edu.ve"), "El correo debe terminar en @correo.unimet.edu.ve"),
})

type CreateAssistantForm = z.infer<typeof createAssistantSchema>
type EditAssistantForm = z.infer<typeof editAssistantSchema>
type CreateSupervisorForm = z.infer<typeof createSupervisorSchema>

interface Facultad {
  nombre: string
}

interface Carrera {
  nombre: string
  facultad_nombre: string
}

interface Ayudante {
  cedula: string
  nombre: string
  correo: string
  nivel: string
  facultad: string
  carrera: string
}

interface Supervisor {
  cedula: string
  nombre: string
  correo: string
  contraseña: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("users")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssistantForm, setShowAssistantForm] = useState(false)
  const [showSupervisorForm, setShowSupervisorForm] = useState(false)
  const [showEditAssistantModal, setShowEditAssistantModal] = useState(false)
  const [editingAssistant, setEditingAssistant] = useState<Ayudante | null>(null)
  const [apiMessage, setApiMessage] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorDialogMessage, setErrorDialogMessage] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [facultades, setFacultades] = useState<Facultad[]>([])
  const [loadingFacultades, setLoadingFacultades] = useState(false)
  const [carreras, setCarreras] = useState<Carrera[]>([])
  const [loadingCarreras, setLoadingCarreras] = useState(false)

  const [ayudantes, setAyudantes] = useState<Ayudante[]>([])
  const [supervisores, setSupervisores] = useState<Supervisor[]>([])
  const [loadingAyudantes, setLoadingAyudantes] = useState(false)
  const [loadingSupervisores, setLoadingSupervisores] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
    control,
  } = useForm<CreateAssistantForm>({
    resolver: zodResolver(createAssistantSchema),
    defaultValues: {
      nivel: "pregrado",
      facultad: "Ingeniería",
      carrera: "",
    },
  })

  const {
    register: registerEditAssistant,
    handleSubmit: handleSubmitEditAssistant,
    formState: { errors: errorsEditAssistant, isSubmitting: isSubmittingEditAssistant },
    setValue: setValueEditAssistant,
    watch: watchEditAssistant,
    reset: resetEditAssistant,
    control: controlEditAssistant,
  } = useForm<EditAssistantForm>({
    resolver: zodResolver(editAssistantSchema),
  })

  const {
    register: registerSupervisor,
    handleSubmit: handleSubmitSupervisor,
    formState: { errors: errorsSupervisor, isSubmitting: isSubmittingSupervisor },
    reset: resetSupervisor,
  } = useForm<CreateSupervisorForm>({
    resolver: zodResolver(createSupervisorSchema),
  })

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = sessionStorage.getItem("adminAuthenticated")
      const email = sessionStorage.getItem("adminEmail")

      if (!authenticated || authenticated !== "true") {
        router.push("/admin/login")
        return
      }

      setIsAuthenticated(true)
      setAdminEmail(email || "")
    }

    checkAuth()
  }, [router])

  const fetchFacultades = async () => {
    try {
      setLoadingFacultades(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      if (!apiUrl) {
        console.error("API URL not configured")
        return
      }

      const response = await fetch(`${apiUrl}/facultades`)

      if (!response.ok) {
        throw new Error(`Error fetching faculties: ${response.status}`)
      }

      const data = await response.json()
      setFacultades(data)
    } catch (error) {
      console.error("Error fetching faculties:", error)
      setFacultades([
        { nombre: "Ingeniería" },
        { nombre: "Ciencias Económicas y Sociales" },
        { nombre: "Ciencias" },
        { nombre: "Humanidades" },
        { nombre: "Estudios Jurídicos y Políticos" },
      ])
    } finally {
      setLoadingFacultades(false)
    }
  }

  const fetchCarreras = async (facultadNombre: string) => {
    if (!facultadNombre) {
      setCarreras([])
      return
    }

    try {
      setLoadingCarreras(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      if (!apiUrl) {
        console.error("API URL not configured")
        return
      }

      const response = await fetch(`${apiUrl}/facultades/${encodeURIComponent(facultadNombre)}/carreras`)

      if (!response.ok) {
        throw new Error(`Error fetching careers: ${response.status}`)
      }

      const data = await response.json()
      setCarreras(data)

      if (data.length > 0) {
        setValue("carrera", data[0].nombre)
      }
    } catch (error) {
      console.error("Error fetching careers:", error)
      const fallbackCarreras = getFallbackCarreras(facultadNombre)
      setCarreras(fallbackCarreras)
      if (fallbackCarreras.length > 0) {
        setValue("carrera", fallbackCarreras[0].nombre)
      }
    } finally {
      setLoadingCarreras(false)
    }
  }

  const fetchCarrerasForEdit = async (facultadNombre: string) => {
    if (!facultadNombre) {
      setCarreras([])
      return
    }

    try {
      setLoadingCarreras(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      if (!apiUrl) {
        console.error("API URL not configured")
        return
      }

      const response = await fetch(`${apiUrl}/facultades/${encodeURIComponent(facultadNombre)}/carreras`)

      if (!response.ok) {
        throw new Error(`Error fetching careers: ${response.status}`)
      }

      const data = await response.json()
      setCarreras(data)

      // Don't auto-select first career for edit form - keep current value
    } catch (error) {
      console.error("Error fetching careers:", error)
      const fallbackCarreras = getFallbackCarreras(facultadNombre)
      setCarreras(fallbackCarreras)
    } finally {
      setLoadingCarreras(false)
    }
  }

  const getFallbackCarreras = (facultadNombre: string): Carrera[] => {
    const fallbackData: Record<string, Carrera[]> = {
      Ingeniería: [
        { nombre: "Ingeniería Civil", facultad_nombre: "Ingeniería" },
        { nombre: "Ingeniería Mecánica", facultad_nombre: "Ingeniería" },
        { nombre: "Ingeniería Producción", facultad_nombre: "Ingeniería" },
        { nombre: "Ingeniería Química", facultad_nombre: "Ingeniería" },
        { nombre: "Ingeniería de Sistemas", facultad_nombre: "Ingeniería" },
        { nombre: "Ingeniería Eléctrica", facultad_nombre: "Ingeniería" },
      ],
      "Ciencias Económicas y Sociales": [
        { nombre: "Ciencias Administrativas", facultad_nombre: "Ciencias Económicas y Sociales" },
        { nombre: "Economía y Finanzas", facultad_nombre: "Ciencias Económicas y Sociales" },
      ],
      Ciencias: [
        { nombre: "Matemáticas", facultad_nombre: "Ciencias" },
        { nombre: "Física", facultad_nombre: "Ciencias" },
        { nombre: "Química", facultad_nombre: "Ciencias" },
      ],
      Humanidades: [
        { nombre: "Psicología", facultad_nombre: "Humanidades" },
        { nombre: "Comunicación Social", facultad_nombre: "Humanidades" },
        { nombre: "Educación", facultad_nombre: "Humanidades" },
      ],
      "Estudios Jurídicos y Políticos": [
        { nombre: "Derecho", facultad_nombre: "Estudios Jurídicos y Políticos" },
        { nombre: "Ciencias Políticas", facultad_nombre: "Estudios Jurídicos y Políticos" },
      ],
    }
    return fallbackData[facultadNombre] || []
  }

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated")
    sessionStorage.removeItem("adminEmail")
    router.push("/admin/login")
  }

  useEffect(() => {
    const selectedFacultad = watch("facultad")
    if (selectedFacultad && showAssistantForm) {
      setValue("carrera", "")
      fetchCarreras(selectedFacultad)
    }
  }, [watch("facultad"), showAssistantForm, setValue])

  useEffect(() => {
    const selectedFacultad = watchEditAssistant("facultad")
    if (selectedFacultad && showEditAssistantModal && editingAssistant) {
      if (selectedFacultad !== editingAssistant.facultad) {
        setValueEditAssistant("carrera", "")
      }
      fetchCarrerasForEdit(selectedFacultad)
    }
  }, [watchEditAssistant("facultad"), showEditAssistantModal, setValueEditAssistant, editingAssistant])

  const fetchAyudantes = async () => {
    try {
      setLoadingAyudantes(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      if (!apiUrl) {
        console.error("API URL not configured")
        return
      }

      const response = await fetch(`${apiUrl}/ayudantes`)

      if (!response.ok) {
        throw new Error(`Error fetching ayudantes: ${response.status}`)
      }

      const data = await response.json()
      setAyudantes(data)
    } catch (error) {
      console.error("Error fetching ayudantes:", error)
      setAyudantes([])
    } finally {
      setLoadingAyudantes(false)
    }
  }

  const fetchSupervisores = async () => {
    try {
      setLoadingSupervisores(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      if (!apiUrl) {
        console.error("API URL not configured")
        return
      }

      const response = await fetch(`${apiUrl}/supervisores`)

      if (!response.ok) {
        throw new Error(`Error fetching supervisores: ${response.status}`)
      }

      const data = await response.json()
      setSupervisores(data)
    } catch (error) {
      console.error("Error fetching supervisores:", error)
      setSupervisores([])
    } finally {
      setLoadingSupervisores(false)
    }
  }

  useEffect(() => {
    if (activeSection === "users" && isAuthenticated) {
      fetchAyudantes()
      fetchSupervisores()
    }
  }, [activeSection, isAuthenticated])

  const filteredAyudantes = useMemo(() => {
    if (!searchTerm.trim()) return ayudantes

    const searchLower = searchTerm.toLowerCase().trim()
    return ayudantes.filter(
      (ayudante) =>
        String(ayudante.cedula).toLowerCase().includes(searchLower) ||
        ayudante.nombre.toLowerCase().includes(searchLower),
    )
  }, [ayudantes, searchTerm])

  const filteredSupervisores = useMemo(() => {
    if (!searchTerm.trim()) return supervisores

    const searchLower = searchTerm.toLowerCase().trim()
    return supervisores.filter(
      (supervisor) =>
        String(supervisor.cedula).toLowerCase().includes(searchLower) ||
        supervisor.nombre.toLowerCase().includes(searchLower),
    )
  }, [supervisores, searchTerm])

  const onSubmitAssistant = async (data: CreateAssistantForm) => {
    try {
      setApiError(null)
      setApiMessage(null)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      console.log("[v0] =================================")
      console.log("[v0] DEBUGGING INFORMACIÓN DE API:")
      console.log("[v0] API URL desde env:", apiUrl)
      console.log("[v0] Datos a enviar:", data)

      if (!apiUrl) {
        const errorMsg =
          "❌ URL del backend no configurada. Verifica que NEXT_PUBLIC_API_URL esté definida en .env.local"
        console.log("[v0]", errorMsg)
        throw new Error(errorMsg)
      }

      const fullUrl = `${apiUrl}/ayudantes`
      console.log("[v0] URL completa que se va a llamar:", fullUrl)
      console.log("[v0] Método: POST")
      console.log("[v0] Headers: Content-Type: application/json")
      console.log("[v0] =================================")

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      console.log("[v0] =================================")
      console.log("[v0] RESPUESTA DEL SERVIDOR:")
      console.log("[v0] Status:", response.status)
      console.log("[v0] Status Text:", response.statusText)
      console.log("[v0] URL de respuesta:", response.url)
      console.log("[v0] Headers de respuesta:", Object.fromEntries(response.headers.entries()))

      if (response.status === 404) {
        console.log("[v0] ❌ ERROR 404: El endpoint no existe")
        console.log("[v0] Verifica que:")
        console.log("[v0] 1. La URL del backend sea correcta:", apiUrl)
        console.log("[v0] 2. El endpoint /ayudantes exista en tu backend")
        console.log("[v0] 3. Tu backend esté corriendo y deployado")
        throw new Error(`❌ Endpoint no encontrado (404). Verifica que ${fullUrl} exista en tu backend.`)
      }

      const contentType = response.headers.get("content-type")
      console.log("[v0] Content-Type:", contentType)

      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.log("[v0] Respuesta no-JSON recibida:", textResponse.substring(0, 500))
        console.log("[v0] =================================")
        throw new Error(`El servidor no devolvió JSON. Respuesta: ${response.status} ${response.statusText}`)
      }

      if (!response.ok) {
        const errorData = await response.json()
        console.log("[v0] Error del servidor:", errorData)
        console.log("[v0] =================================")

        if (response.status === 400 || response.status === 409 || response.status === 500) {
          const errorMessage = errorData.error || errorData.message || ""

          const isDuplicateKeyError = errorMessage.includes("duplicate key value violates unique constraint")

          if (isDuplicateKeyError) {
            if (errorMessage.includes("ayudante_pkey") || errorMessage.includes("PRIMARY KEY")) {
              setErrorDialogMessage(
                `La cédula "${data.cedula}" ya está registrada en el sistema. Por favor, verifica el número de cédula e intenta nuevamente.`,
              )
              setShowErrorDialog(true)
              return
            }

            if (
              errorMessage.includes("correo") ||
              errorMessage.includes("email") ||
              errorMessage.includes("unique_email")
            ) {
              setErrorDialogMessage(
                `El correo "${data.correo}" ya está registrado en el sistema. Por favor, utiliza un correo diferente.`,
              )
              setShowErrorDialog(true)
              return
            }

            setErrorDialogMessage(
              "Ya existe un registro con estos datos en el sistema. Por favor, verifica la información e intenta nuevamente.",
            )
            setShowErrorDialog(true)
            return
          }
        }

        throw new Error(errorData.error || `Error del servidor: ${response.status}`)
      }

      const result = await response.json()
      console.log("[v0] ✅ Ayudante creado exitosamente:", result)
      console.log("[v0] =================================")

      setApiMessage(result.status || "✅ Ayudante creado correctamente")

      setTimeout(() => {
        reset()
        setShowAssistantForm(false)
        setShowCreateModal(false)
        setApiMessage(null)
        fetchAyudantes() // Refresh the list
      }, 2000)
    } catch (error) {
      console.error("[v0] ❌ ERROR COMPLETO:", error)
      console.log("[v0] =================================")
      setApiError(error instanceof Error ? error.message : "Error desconocido")
    }
  }

  const onSubmitEditAssistant = async (data: EditAssistantForm) => {
    if (!editingAssistant) return

    try {
      setApiError(null)
      setApiMessage(null)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      if (!apiUrl) {
        throw new Error(
          "❌ URL del backend no configurada. Verifica que NEXT_PUBLIC_API_URL esté definida en .env.local",
        )
      }

      const fullUrl = `${apiUrl}/ayudantes/${editingAssistant.cedula}`

      const response = await fetch(fullUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (response.status === 400 || response.status === 409 || response.status === 500) {
          const errorMessage = errorData.error || errorData.message || ""
          const isDuplicateKeyError = errorMessage.includes("duplicate key value violates unique constraint")

          if (isDuplicateKeyError) {
            if (
              errorMessage.includes("correo") ||
              errorMessage.includes("email") ||
              errorMessage.includes("unique_email")
            ) {
              if (data.correo !== editingAssistant.correo) {
                setErrorDialogMessage(
                  `El correo "${data.correo}" ya está registrado en el sistema. Por favor, utiliza un correo diferente.`,
                )
                setShowErrorDialog(true)
                return
              }
            }

            setErrorDialogMessage(
              "Ya existe un registro con estos datos en el sistema. Por favor, verifica la información e intenta nuevamente.",
            )
            setShowErrorDialog(true)
            return
          }
        }

        if (response.status === 404) {
          setErrorDialogMessage("El ayudante no fue encontrado en el sistema.")
          setShowErrorDialog(true)
          return
        }

        throw new Error(errorData.error || `Error del servidor: ${response.status}`)
      }

      const result = await response.json()
      setApiMessage(result.status || "✅ Ayudante modificado correctamente")

      setTimeout(() => {
        resetEditAssistant()
        setShowEditAssistantModal(false)
        setEditingAssistant(null)
        setApiMessage(null)
        fetchAyudantes() // Refresh the list
      }, 2000)
    } catch (error) {
      console.error("❌ ERROR:", error)
      setApiError(error instanceof Error ? error.message : "Error desconocido")
    }
  }

  const onSubmitSupervisor = async (data: CreateSupervisorForm) => {
    try {
      setApiError(null)
      setApiMessage(null)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      if (!apiUrl) {
        throw new Error(
          "❌ URL del backend no configurada. Verifica que NEXT_PUBLIC_API_URL esté definida en .env.local",
        )
      }

      const fullUrl = `${apiUrl}/supervisores`

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (response.status === 400 || response.status === 409 || response.status === 500) {
          const errorMessage = errorData.error || errorData.message || ""
          const isDuplicateKeyError = errorMessage.includes("duplicate key value violates unique constraint")

          if (isDuplicateKeyError) {
            if (errorMessage.includes("supervisor_pkey") || errorMessage.includes("PRIMARY KEY")) {
              setErrorDialogMessage(
                `La cédula "${data.cedula}" ya está registrada en el sistema. Por favor, verifica el número de cédula e intenta nuevamente.`,
              )
              setShowErrorDialog(true)
              return
            }

            if (
              errorMessage.includes("correo") ||
              errorMessage.includes("email") ||
              errorMessage.includes("unique_email")
            ) {
              setErrorDialogMessage(
                `El correo "${data.correo}" ya está registrado en el sistema. Por favor, utiliza un correo diferente.`,
              )
              setShowErrorDialog(true)
              return
            }

            setErrorDialogMessage(
              "Ya existe un registro con estos datos en el sistema. Por favor, verifica la información e intenta nuevamente.",
            )
            setShowErrorDialog(true)
            return
          }
        }

        throw new Error(errorData.error || `Error del servidor: ${response.status}`)
      }

      const result = await response.json()
      setApiMessage(result.status || "✅ Supervisor creado correctamente")

      setTimeout(() => {
        resetSupervisor()
        setShowSupervisorForm(false)
        setShowCreateModal(false)
        setApiMessage(null)
        fetchSupervisores() // Refresh the list
      }, 2000)
    } catch (error) {
      console.error("❌ ERROR:", error)
      setApiError(error instanceof Error ? error.message : "Error desconocido")
    }
  }

  const handleCreateUser = () => {
    setShowCreateModal(true)
  }

  const handleCreateAssistant = () => {
    fetchFacultades().then(() => {
      if (facultades.length > 0 && !watch("facultad")) {
        setValue("facultad", facultades[0].nombre)
      }
    })
    setShowAssistantForm(true)
  }

  const handleEditAssistant = async (ayudante: Ayudante) => {
    setEditingAssistant(ayudante)

    // Fetch facultades first
    await fetchFacultades()

    await fetchCarrerasForEdit(ayudante.facultad)

    resetEditAssistant({
      nombre: ayudante.nombre,
      correo: ayudante.correo,
      nivel: ayudante.nivel,
      facultad: ayudante.facultad,
      carrera: ayudante.carrera,
    })

    setShowEditAssistantModal(true)
  }

  const handleCreateSupervisor = () => {
    setShowSupervisorForm(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setShowAssistantForm(false)
    setShowSupervisorForm(false)
    setShowEditAssistantModal(false)
    setEditingAssistant(null)
    reset()
    resetSupervisor()
    resetEditAssistant()
    setSearchTerm("") // Clear search term when closing modal
  }

  const handleCloseErrorDialog = () => {
    setShowErrorDialog(false)
    setErrorDialogMessage("")
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="mr-2">
              {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AyudanTech</h1>
              <p className="text-xs text-muted-foreground">Panel de Administración</p>
            </div>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">{adminEmail}</div>
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`${sidebarCollapsed ? "w-16" : "w-80"} border-r border-border bg-card/30 min-h-[calc(100vh-4rem)] transition-all duration-300`}
        >
          <div className="p-6">
            <div className="space-y-2">
              {[
                {
                  id: "users",
                  title: "Gestión de Usuarios",
                  description: "Administrar estudiantes, supervisores y coordinadores",
                  icon: <Users className="h-4 w-4" />,
                  color: "bg-blue-500",
                  stats: "156 usuarios activos",
                },
                {
                  id: "plazas",
                  title: "Gestión de Plazas de Ayudantía",
                  description: "Crear y administrar plazas disponibles",
                  icon: <Briefcase className="h-4 w-4" />,
                  color: "bg-green-500",
                  stats: "24 plazas activas",
                },
                {
                  id: "seguimiento",
                  title: "Seguimiento de Ayudantías",
                  description: "Monitorear el progreso y actividades",
                  icon: <TrendingUp className="h-4 w-4" />,
                  color: "bg-purple-500",
                  stats: "18 ayudantías en curso",
                },
                {
                  id: "evaluacion",
                  title: "Evaluación y Beneficios",
                  description: "Gestionar evaluaciones y asignar beneficios",
                  icon: <Award className="h-4 w-4" />,
                  color: "bg-orange-500",
                  stats: "12 evaluaciones pendientes",
                },
              ].map((section) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "default" : "ghost"}
                  className={`w-full ${sidebarCollapsed ? "justify-center px-2" : "justify-start"} transition-all duration-300`}
                  onClick={() => setActiveSection(section.id)}
                  title={sidebarCollapsed ? section.title : undefined}
                >
                  <span className={sidebarCollapsed ? "" : "mr-2"}>{section.icon}</span>
                  {!sidebarCollapsed && <span className="text-left">{section.title}</span>}
                </Button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">
                  {
                    [
                      {
                        id: "users",
                        title: "Gestión de Usuarios",
                        description: "Administrar estudiantes, supervisores y coordinadores",
                        icon: <Users className="h-4 w-4" />,
                        color: "bg-blue-500",
                        stats: "156 usuarios activos",
                      },
                      {
                        id: "plazas",
                        title: "Gestión de Plazas de Ayudantía",
                        description: "Crear y administrar plazas disponibles",
                        icon: <Briefcase className="h-4 w-4" />,
                        color: "bg-green-500",
                        stats: "24 plazas activas",
                      },
                      {
                        id: "seguimiento",
                        title: "Seguimiento de Ayudantías",
                        description: "Monitorear el progreso y actividades",
                        icon: <TrendingUp className="h-4 w-4" />,
                        color: "bg-purple-500",
                        stats: "18 ayudantías en curso",
                      },
                      {
                        id: "evaluacion",
                        title: "Evaluación y Beneficios",
                        description: "Gestionar evaluaciones y asignar beneficios",
                        icon: <Award className="h-4 w-4" />,
                        color: "bg-orange-500",
                        stats: "12 evaluaciones pendientes",
                      },
                    ].find((s) => s.id === activeSection)?.title
                  }
                </h2>
                <CardDescription>
                  {activeSection === "users"
                    ? "Administra ayudantes y supervisores del sistema"
                    : `Esta sección estará disponible próximamente. Aquí podrás gestionar todo lo relacionado con ${[
                        {
                          id: "users",
                          title: "Gestión de Usuarios",
                          description: "Administrar estudiantes, supervisores y coordinadores",
                          icon: <Users className="h-4 w-4" />,
                          color: "bg-blue-500",
                          stats: "156 usuarios activos",
                        },
                        {
                          id: "plazas",
                          title: "Gestión de Plazas de Ayudantía",
                          description: "Crear y administrar plazas disponibles",
                          icon: <Briefcase className="h-4 w-4" />,
                          color: "bg-green-500",
                          stats: "24 plazas activas",
                        },
                        {
                          id: "seguimiento",
                          title: "Seguimiento de Ayudantías",
                          description: "Monitorear el progreso y actividades",
                          icon: <TrendingUp className="h-4 w-4" />,
                          color: "bg-purple-500",
                          stats: "18 ayudantías en curso",
                        },
                        {
                          id: "evaluacion",
                          title: "Evaluación y Beneficios",
                          description: "Gestionar evaluaciones y asignar beneficios",
                          icon: <Award className="h-4 w-4" />,
                          color: "bg-orange-500",
                          stats: "12 evaluaciones pendientes",
                        },
                      ]
                        .find((s) => s.id === activeSection)
                        ?.title.toLowerCase()}.`}
                </CardDescription>
              </div>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleCreateUser}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Nuevo
              </Button>
            </div>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">
                  {
                    [
                      {
                        id: "users",
                        title: "Gestión de Usuarios",
                        description: "Administrar estudiantes, supervisores y coordinadores",
                        icon: <Users className="h-4 w-4" />,
                        color: "bg-blue-500",
                        stats: "156 usuarios activos",
                      },
                      {
                        id: "plazas",
                        title: "Gestión de Plazas de Ayudantía",
                        description: "Crear y administrar plazas disponibles",
                        icon: <Briefcase className="h-4 w-4" />,
                        color: "bg-green-500",
                        stats: "24 plazas activas",
                      },
                      {
                        id: "seguimiento",
                        title: "Seguimiento de Ayudantías",
                        description: "Monitorear el progreso y actividades",
                        icon: <TrendingUp className="h-4 w-4" />,
                        color: "bg-purple-500",
                        stats: "18 ayudantías en curso",
                      },
                      {
                        id: "evaluacion",
                        title: "Evaluación y Beneficios",
                        description: "Gestionar evaluaciones y asignar beneficios",
                        icon: <Award className="h-4 w-4" />,
                        color: "bg-orange-500",
                        stats: "12 evaluaciones pendientes",
                      },
                    ].find((s) => s.id === activeSection)?.title
                  }
                </CardTitle>
                <CardDescription>
                  {activeSection === "users"
                    ? "Administra ayudantes y supervisores del sistema"
                    : `Esta sección estará disponible próximamente. Aquí podrás gestionar todo lo relacionado con ${[
                        {
                          id: "users",
                          title: "Gestión de Usuarios",
                          description: "Administrar estudiantes, supervisores y coordinadores",
                          icon: <Users className="h-4 w-4" />,
                          color: "bg-blue-500",
                          stats: "156 usuarios activos",
                        },
                        {
                          id: "plazas",
                          title: "Gestión de Plazas de Ayudantía",
                          description: "Crear y administrar plazas disponibles",
                          icon: <Briefcase className="h-4 w-4" />,
                          color: "bg-green-500",
                          stats: "24 plazas activas",
                        },
                        {
                          id: "seguimiento",
                          title: "Seguimiento de Ayudantías",
                          description: "Monitorear el progreso y actividades",
                          icon: <TrendingUp className="h-4 w-4" />,
                          color: "bg-purple-500",
                          stats: "18 ayudantías en curso",
                        },
                        {
                          id: "evaluacion",
                          title: "Evaluación y Beneficios",
                          description: "Gestionar evaluaciones y asignar beneficios",
                          icon: <Award className="h-4 w-4" />,
                          color: "bg-orange-500",
                          stats: "12 evaluaciones pendientes",
                        },
                      ]
                        .find((s) => s.id === activeSection)
                        ?.title.toLowerCase()}.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeSection === "users" ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar por cédula o nombre..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {searchTerm && (
                        <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                          Limpiar
                        </Button>
                      )}
                    </div>

                    <Tabs defaultValue="ayudantes" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="ayudantes">
                          Ayudantes ({filteredAyudantes.length}
                          {searchTerm && ` de ${ayudantes.length}`})
                        </TabsTrigger>
                        <TabsTrigger value="supervisores">
                          Supervisores ({filteredSupervisores.length}
                          {searchTerm && ` de ${supervisores.length}`})
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="ayudantes" className="space-y-4">
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Cédula</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Correo</TableHead>
                                <TableHead>Nivel</TableHead>
                                <TableHead>Facultad</TableHead>
                                <TableHead>Carrera</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {loadingAyudantes ? (
                                <TableRow>
                                  <TableCell colSpan={7} className="text-center py-8">
                                    <div className="flex items-center justify-center space-x-2">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                      <span>Cargando ayudantes...</span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ) : filteredAyudantes.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    {searchTerm
                                      ? `No se encontraron ayudantes que coincidan con "${searchTerm}"`
                                      : "No hay ayudantes registrados"}
                                  </TableCell>
                                </TableRow>
                              ) : (
                                filteredAyudantes.map((ayudante) => (
                                  <TableRow key={ayudante.cedula}>
                                    <TableCell className="font-medium">{ayudante.cedula}</TableCell>
                                    <TableCell>{ayudante.nombre}</TableCell>
                                    <TableCell>{ayudante.correo}</TableCell>
                                    <TableCell className="capitalize">{ayudante.nivel}</TableCell>
                                    <TableCell>{ayudante.facultad}</TableCell>
                                    <TableCell>{ayudante.carrera}</TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex items-center justify-end space-x-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                          title="Editar ayudante"
                                          onClick={() => handleEditAssistant(ayudante)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                          title="Eliminar ayudante"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>

                      <TabsContent value="supervisores" className="space-y-4">
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Cédula</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Correo</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {loadingSupervisores ? (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center py-8">
                                    <div className="flex items-center justify-center space-x-2">
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                      <span>Cargando supervisores...</span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ) : filteredSupervisores.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    {searchTerm
                                      ? `No se encontraron supervisores que coincidan con "${searchTerm}"`
                                      : "No hay supervisores registrados"}
                                  </TableCell>
                                </TableRow>
                              ) : (
                                filteredSupervisores.map((supervisor) => (
                                  <TableRow key={supervisor.cedula}>
                                    <TableCell className="font-medium">{supervisor.cedula}</TableCell>
                                    <TableCell>{supervisor.nombre}</TableCell>
                                    <TableCell>{supervisor.correo}</TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex items-center justify-end space-x-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                          title="Editar supervisor"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                          title="Eliminar supervisor"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      {
                        [
                          {
                            id: "users",
                            title: "Gestión de Usuarios",
                            description: "Administrar estudiantes, supervisores y coordinadores",
                            icon: <Users className="h-4 w-4" />,
                            color: "bg-blue-500",
                            stats: "156 usuarios activos",
                          },
                          {
                            id: "plazas",
                            title: "Gestión de Plazas de Ayudantía",
                            description: "Crear y administrar plazas disponibles",
                            icon: <Briefcase className="h-4 w-4" />,
                            color: "bg-green-500",
                            stats: "24 plazas activas",
                          },
                          {
                            id: "seguimiento",
                            title: "Seguimiento de Ayudantías",
                            description: "Monitorear el progreso y actividades",
                            icon: <TrendingUp className="h-4 w-4" />,
                            color: "bg-purple-500",
                            stats: "18 ayudantías en curso",
                          },
                          {
                            id: "evaluacion",
                            title: "Evaluación y Beneficios",
                            description: "Gestionar evaluaciones y asignar beneficios",
                            icon: <Award className="h-4 w-4" />,
                            color: "bg-orange-500",
                            stats: "12 evaluaciones pendientes",
                          },
                        ].find((s) => s.id === activeSection)?.icon
                      }
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Próximamente</h3>
                    <p className="text-muted-foreground mb-4">
                      Esta funcionalidad se desarrollará en las próximas iteraciones.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Dialog open={showErrorDialog} onOpenChange={handleCloseErrorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Error al crear {showSupervisorForm ? "supervisor" : "ayudante"}</span>
          </DialogTitle>

          <div className="py-4">
            <p className="text-sm text-muted-foreground">{errorDialogMessage}</p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCloseErrorDialog}>Entendido</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateModal} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md"
          showCloseButton={false}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogTitle className="text-lg font-semibold">
            {showAssistantForm ? "Crear Ayudante" : showSupervisorForm ? "Crear Supervisor" : "Crear Nuevo Usuario"}
          </DialogTitle>

          <div className="space-y-2 pb-4">
            {!showAssistantForm && !showSupervisorForm && (
              <p className="text-sm text-muted-foreground">Selecciona el tipo de usuario que deseas crear</p>
            )}
          </div>

          {!showAssistantForm && !showSupervisorForm ? (
            <div className="flex flex-col space-y-4 py-4">
              <Button onClick={handleCreateAssistant} className="flex items-center justify-center space-x-2 h-12">
                <GraduationCap className="h-5 w-5" />
                <span>Crear Ayudante</span>
              </Button>

              <Button
                onClick={handleCreateSupervisor}
                variant="outline"
                className="flex items-center justify-center space-x-2 h-12 bg-transparent"
              >
                <UserPlus className="h-5 w-5" />
                <span>Crear Supervisor</span>
              </Button>

              <div className="flex justify-end pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : showSupervisorForm ? (
            <form onSubmit={handleSubmitSupervisor(onSubmitSupervisor)} className="space-y-4 py-4">
              {apiMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">{apiMessage}</p>
                </div>
              )}

              {apiError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">❌ {apiError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supervisor-cedula">Cédula</Label>
                  <Input
                    id="supervisor-cedula"
                    placeholder="12345678"
                    {...registerSupervisor("cedula")}
                    className={errorsSupervisor.cedula ? "border-red-500" : ""}
                  />
                  {errorsSupervisor.cedula && <p className="text-sm text-red-500">{errorsSupervisor.cedula.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supervisor-nombre">Nombre Completo</Label>
                  <Input
                    id="supervisor-nombre"
                    placeholder="Juan Pérez"
                    {...registerSupervisor("nombre")}
                    className={errorsSupervisor.nombre ? "border-red-500" : ""}
                  />
                  {errorsSupervisor.nombre && <p className="text-sm text-red-500">{errorsSupervisor.nombre.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supervisor-correo">Correo Electrónico</Label>
                <Input
                  id="supervisor-correo"
                  type="email"
                  placeholder="juan.perez@correo.unimet.edu.ve"
                  {...registerSupervisor("correo")}
                  className={errorsSupervisor.correo ? "border-red-500" : ""}
                />
                {errorsSupervisor.correo && <p className="text-sm text-red-500">{errorsSupervisor.correo.message}</p>}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmittingSupervisor}>
                  {isSubmittingSupervisor ? "Creando..." : "Crear Supervisor"}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit(onSubmitAssistant)} className="space-y-4 py-4">
              {apiMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">{apiMessage}</p>
                </div>
              )}

              {apiError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">❌ {apiError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cedula">Cédula</Label>
                  <Input
                    id="cedula"
                    placeholder="12345678"
                    {...register("cedula")}
                    className={errors.cedula ? "border-red-500" : ""}
                  />
                  {errors.cedula && <p className="text-sm text-red-500">{errors.cedula.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <Input
                    id="nombre"
                    placeholder="Juan Pérez"
                    {...register("nombre")}
                    className={errors.nombre ? "border-red-500" : ""}
                  />
                  {errors.nombre && <p className="text-sm text-red-500">{errors.nombre.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="correo">Correo Electrónico</Label>
                <Input
                  id="correo"
                  type="email"
                  placeholder="juan.perez@correo.unimet.edu.ve"
                  {...register("correo")}
                  className={errors.correo ? "border-red-500" : ""}
                />
                {errors.correo && <p className="text-sm text-red-500">{errors.correo.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nivel">Nivel Académico</Label>
                <Controller
                  name="nivel"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} defaultValue="pregrado">
                      <SelectTrigger className={errors.nivel ? "border-red-500" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pregrado">Pregrado</SelectItem>
                        <SelectItem value="postgrado">Postgrado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.nivel && <p className="text-sm text-red-500">{errors.nivel.message}</p>}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facultad">Facultad</Label>
                  <Controller
                    name="facultad"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={errors.facultad ? "border-red-500" : ""}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingFacultades ? (
                            <div className="p-2 text-sm text-muted-foreground">Cargando facultades...</div>
                          ) : (
                            facultades.map((facultad) => (
                              <SelectItem key={facultad.nombre} value={facultad.nombre}>
                                {facultad.nombre}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.facultad && <p className="text-sm text-red-500">{errors.facultad.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carrera">Carrera</Label>
                  <Controller
                    name="carrera"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!watch("facultad") || loadingCarreras}
                      >
                        <SelectTrigger className={errors.carrera ? "border-red-500" : ""}>
                          <SelectValue
                            placeholder={
                              !watch("facultad")
                                ? "Primero selecciona una facultad"
                                : loadingCarreras
                                  ? "Cargando carreras..."
                                  : "Selecciona una carrera"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingCarreras ? (
                            <div className="p-2 text-sm text-muted-foreground">Cargando carreras...</div>
                          ) : carreras.length > 0 ? (
                            carreras.map((carrera) => (
                              <SelectItem key={carrera.nombre} value={carrera.nombre}>
                                {carrera.nombre}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">
                              No hay carreras disponibles para esta facultad
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.carrera && <p className="text-sm text-red-500">{errors.carrera.message}</p>}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creando..." : "Crear Ayudante"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showEditAssistantModal} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md"
          showCloseButton={false}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogTitle className="text-lg font-semibold">Editar Ayudante</DialogTitle>

          <div className="space-y-2 pb-4">
            <p className="text-sm text-muted-foreground">
              Modifica la información del ayudante {editingAssistant?.nombre}
            </p>
          </div>

          <form onSubmit={handleSubmitEditAssistant(onSubmitEditAssistant)} className="space-y-4 py-4">
            {apiMessage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">{apiMessage}</p>
              </div>
            )}

            {apiError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">❌ {apiError}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cedula">Cédula</Label>
                <Input
                  id="edit-cedula"
                  value={editingAssistant?.cedula || ""}
                  disabled
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">La cédula no se puede modificar</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre Completo</Label>
                <Input
                  id="edit-nombre"
                  placeholder="Juan Pérez"
                  {...registerEditAssistant("nombre")}
                  className={errorsEditAssistant.nombre ? "border-red-500" : ""}
                />
                {errorsEditAssistant.nombre && (
                  <p className="text-sm text-red-500">{errorsEditAssistant.nombre.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-correo">Correo Electrónico</Label>
              <Input
                id="edit-correo"
                type="email"
                placeholder="juan.perez@correo.unimet.edu.ve"
                {...registerEditAssistant("correo")}
                className={errorsEditAssistant.correo ? "border-red-500" : ""}
              />
              {errorsEditAssistant.correo && (
                <p className="text-sm text-red-500">{errorsEditAssistant.correo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-nivel">Nivel Académico</Label>
              <Controller
                name="nivel"
                control={controlEditAssistant}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={errorsEditAssistant.nivel ? "border-red-500" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pregrado">Pregrado</SelectItem>
                      <SelectItem value="postgrado">Postgrado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errorsEditAssistant.nivel && <p className="text-sm text-red-500">{errorsEditAssistant.nivel.message}</p>}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-facultad">Facultad</Label>
                <Controller
                  name="facultad"
                  control={controlEditAssistant}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={errorsEditAssistant.facultad ? "border-red-500" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingFacultades ? (
                          <div className="p-2 text-sm text-muted-foreground">Cargando facultades...</div>
                        ) : (
                          facultades.map((facultad) => (
                            <SelectItem key={facultad.nombre} value={facultad.nombre}>
                              {facultad.nombre}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errorsEditAssistant.facultad && (
                  <p className="text-sm text-red-500">{errorsEditAssistant.facultad.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-carrera">Carrera</Label>
                <Controller
                  name="carrera"
                  control={controlEditAssistant}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!watchEditAssistant("facultad") || loadingCarreras}
                    >
                      <SelectTrigger className={errorsEditAssistant.carrera ? "border-red-500" : ""}>
                        <SelectValue
                          placeholder={
                            !watchEditAssistant("facultad")
                              ? "Primero selecciona una facultad"
                              : loadingCarreras
                                ? "Cargando carreras..."
                                : "Selecciona una carrera"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingCarreras ? (
                          <div className="p-2 text-sm text-muted-foreground">Cargando carreras...</div>
                        ) : carreras.length > 0 ? (
                          carreras.map((carrera) => (
                            <SelectItem key={carrera.nombre} value={carrera.nombre}>
                              {carrera.nombre}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground">
                            No hay carreras disponibles para esta facultad
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errorsEditAssistant.carrera && (
                  <p className="text-sm text-red-500">{errorsEditAssistant.carrera.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmittingEditAssistant}>
                {isSubmittingEditAssistant ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

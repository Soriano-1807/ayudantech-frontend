"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
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
  CheckCircle2,
  Building2,
  Activity,
  ClipboardList,
} from "lucide-react"

const createAssistantSchema = z.object({
  cedula: z.string().min(1, "La cédula es requerida").regex(/^\d+$/, "La cédula debe contener solo números"),
  nombre: z.string().min(1, "El nombre es requerido"),
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

const editSupervisorSchema = z.object({
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
type EditSupervisorForm = z.infer<typeof editSupervisorSchema>

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
  contraseña?: string // Added optional password field for fetching
}

interface Supervisor {
  cedula: string
  nombre: string
  correo: string
  contraseña: string
}

interface Plaza {
  id: number
  nombre: string
}

interface Ayudantia {
  id: number
  cedula_ayudante: number
  tipo_ayudante: string // Updated field name
  cedula_supervisor: number
  plaza: string
  desc_objetivo: string // Added field
}

export default function AdminDashboard() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("users")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssistantForm, setShowAssistantForm] = useState(false)
  const [showSupervisorForm, setShowSupervisorForm] = useState(false)
  const [showEditAssistantModal, setShowEditAssistantModal] = useState(false)
  const [showEditSupervisorModal, setShowEditSupervisorModal] = useState(false)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [showDeleteSupervisorConfirmModal, setShowDeleteSupervisorConfirmModal] = useState(false)
  const [deletingAssistant, setDeletingAssistant] = useState<Ayudante | null>(null)
  const [deletingSupervisor, setDeletingSupervisor] = useState<Supervisor | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeletingSupervisor, setIsDeletingSupervisor] = useState(false)
  const [editingAssistant, setEditingAssistant] = useState<Ayudante | null>(null)
  const [editingSupervisor, setEditingSupervisor] = useState<Supervisor | null>(null)
  const [apiMessage, setApiMessage] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorDialogMessage, setErrorDialogMessage] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
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

  const [plazas, setPlazas] = useState<Plaza[]>([])
  const [loadingPlazas, setLoadingPlazas] = useState(false)
  const [showPlazaModal, setShowPlazaModal] = useState(false)
  const [plazaNombre, setPlazaNombre] = useState("")
  const [editingPlaza, setEditingPlaza] = useState<Plaza | null>(null)
  const [nuevoNombrePlaza, setNuevoNombrePlaza] = useState("")

  const [tipos, setTipos] = useState<any[]>([])

  const [searchTerm, setSearchTerm] = useState("")

  const [showAyudantiasView, setShowAyudantiasView] = useState(false)
  const [showCreateAyudantiaModal, setShowCreateAyudantiaModal] = useState(false)
  const [ayudantias, setAyudantias] = useState<Ayudantia[]>([])
  const [cedulaAyudante, setCedulaAyudante] = useState("")
  const [tipoAyudantia, setTipoAyudantia] = useState("")
  const [cedulaSupervisor, setCedulaSupervisor] = useState("")
  const [plazaAyudantia, setPlazaAyudantia] = useState("")
  const [deletingAyudantia, setDeletingAyudantia] = useState<Ayudantia | null>(null)
  const [showDeleteAyudantiaModal, setShowDeleteAyudantiaModal] = useState(false)

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

  const {
    register: registerEditSupervisor,
    handleSubmit: handleSubmitEditSupervisor,
    formState: { errors: errorsEditSupervisor, isSubmitting: isSubmittingEditSupervisor },
    reset: resetEditSupervisor,
  } = useForm<EditSupervisorForm>({
    resolver: zodResolver(editSupervisorSchema),
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

  const fetchPlazas = async () => {
    setLoadingPlazas(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/plazas`)
      const data = await res.json()
      const sortedPlazas = data.sort((a: Plaza, b: Plaza) => a.nombre.localeCompare(b.nombre))
      setPlazas(sortedPlazas)
      if (sortedPlazas.length > 0 && !plazaAyudantia) {
        setPlazaAyudantia(sortedPlazas[0].nombre)
      }
    } catch (err) {
      setPlazas([])
    } finally {
      setLoadingPlazas(false)
    }
  }

  const fetchTipos = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/tipos-ayudante`)
      const data = await res.json()
      setTipos(data)
      if (data.length > 0 && !tipoAyudantia) {
        setTipoAyudantia(data[0].tipo)
      }
    } catch (err) {
      setTipos([])
    }
  }

  const handleCreatePlaza = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/plazas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: plazaNombre }),
      })
      if (res.ok) {
        setPlazaNombre("")
        setShowPlazaModal(false)
        fetchPlazas()
      }
    } catch {}
  }

  const handleEditPlaza = async () => {
    if (!editingPlaza) return
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/plazas/${editingPlaza.nombre}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevoNombre: nuevoNombrePlaza }),
      })
      if (res.ok) {
        setEditingPlaza(null)
        setNuevoNombrePlaza("")
        setShowPlazaModal(false)
        fetchPlazas()
      }
    } catch {}
  }

  const handleDeletePlaza = async (nombre: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${apiUrl}/plazas/${nombre}`, { method: "DELETE" })
      if (res.ok) fetchPlazas()
    } catch {}
  }

  useEffect(() => {
    if (activeSection === "plazas") fetchPlazas()
  }, [activeSection])

  useEffect(() => {
    if (showAyudantiasView) {
      fetchPlazas()
      fetchTipos()
    }
  }, [showAyudantiasView])

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

  const fetchAyudantias = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (!apiUrl) {
        console.error("API URL not configured")
        return
      }
      const response = await fetch(`${apiUrl}/ayudantias`)
      if (!response.ok) {
        throw new Error(`Error fetching ayudantias: ${response.status}`)
      }
      const data = await response.json()
      setAyudantias(data)
    } catch (error) {
      console.error("Error fetching ayudantias:", error)
      setAyudantias([])
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

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response ok:", response.ok)

      const responseData = await response.json()
      console.log("[v0] Response data:", responseData)

      if (!response.ok) {
        const errorMessage = responseData.error || ""

        if (errorMessage.includes("ayudante_correo_key") || errorMessage.toLowerCase().includes("correo")) {
          throw new Error("❌ Ya existe un ayudante con este correo electrónico")
        }

        // Check for duplicate cedula in supervisor table (from backend validation)
        if (errorMessage.includes("supervisor con esa cédula")) {
          throw new Error("❌ Ya existe un supervisor con esta cédula")
        }

        // Check for duplicate cedula in ayudante table (check last to avoid false positives)
        if (errorMessage.includes("ayudante_pkey") || errorMessage.includes("duplicate key")) {
          throw new Error("❌ Ya existe un ayudante con esta cédula")
        }

        throw new Error(errorMessage || "Error al crear el ayudante")
      }

      const assistantDataResponse = await fetch(`${apiUrl}/ayudantes/${data.cedula}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!assistantDataResponse.ok) {
        console.error("[v0] Error fetching assistant data for email")
        throw new Error("Ayudante creado pero no se pudo obtener la información completa")
      }

      const assistantData = await assistantDataResponse.json()
      console.log("[v0] Complete assistant data:", assistantData)

      try {
        const emailResponse = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: assistantData.correo,
            subject: "🎓 Bienvenido a AyudanTech - Credenciales de Acceso",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2563eb; margin: 0; font-size: 28px;">🎓 AyudanTech</h1>
                    <p style="color: #64748b; margin: 10px 0 0 0; font-size: 16px;">Sistema de Gestión Académica</p>
                  </div>
                  
                  <h2 style="color: #1e293b; margin-bottom: 20px;">¡Bienvenido al equipo!</h2>
                  
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                    Hola <strong>${assistantData.nombre}</strong>, tu cuenta de ayudante ha sido creada exitosamente. 
                    A continuación encontrarás tus credenciales de acceso al sistema:
                  </p>
                  
                  <div style="background-color: #f1f5f9; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2563eb;">
                    <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">📋 Información de tu cuenta:</h3>
                    <p style="margin: 8px 0; color: #475569;"><strong>Cédula:</strong> ${assistantData.cedula}</p>
                    <p style="margin: 8px 0; color: #475569;"><strong>Nombre:</strong> ${assistantData.nombre}</p>
                    <p style="margin: 8px 0; color: #475569;"><strong>Correo:</strong> ${assistantData.correo}</p>
                    <p style="margin: 8px 0; color: #475569;"><strong>Nivel:</strong> ${assistantData.nivel}</p>
                    <p style="margin: 8px 0; color: #475569;"><strong>Facultad:</strong> ${assistantData.facultad}</p>
                    <p style="margin: 8px 0; color: #475569;"><strong>Carrera:</strong> ${assistantData.carrera}</p>
                  </div>
                  
                  <div style="background-color: #fef3c7; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                    <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">🔐 Credenciales de Acceso:</h3>
                    <p style="margin: 8px 0; color: #92400e;"><strong>Usuario:</strong> ${assistantData.correo}</p>
                    <p style="margin: 8px 0; color: #92400e;"><strong>Contraseña:</strong> ${assistantData.contraseña}</p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://ayudantech-frontend.vercel.app/ayudante/login" 
                       style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                      🚀 Acceder al Sistema
                    </a>
                  </div>
                  
                  <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-top: 25px;">
                    <p style="color: #64748b; font-size: 14px; margin: 0; text-align: center;">
                      <strong>Importante:</strong> Guarda estas credenciales en un lugar seguro. 
                      Si tienes alguna pregunta, contacta al administrador del sistema.
                    </p>
                  </div>
                  
                  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                      Este correo fue enviado automáticamente por el sistema AyudanTech
                    </p>
                  </div>
                </div>
              </div>
            `,
          }),
        })

        if (!emailResponse.ok) {
          console.error("[v0] Error sending email:", await emailResponse.text())
          // Don't throw error here since the assistant was created successfully
          setApiMessage("✅ Ayudante creado correctamente, pero hubo un problema enviando el correo de bienvenida")
        } else {
          setApiMessage("✅ Ayudante creado correctamente y correo de bienvenida enviado")
        }
      } catch (emailError) {
        console.error("[v0] Email sending failed:", emailError)
        setApiMessage("✅ Ayudante creado correctamente, pero hubo un problema enviando el correo de bienvenida")
      }

      // Reset form and close modal
      reset()
      setShowCreateModal(false) // Changed from setIsCreateModalOpen to setShowCreateModal
      setShowAssistantForm(false) // Close assistant form specifically

      // Refresh assistants list
      fetchAyudantes() // Changed from fetchAssistants to fetchAyudantes

      setShowSuccessModal(true)
    } catch (error: any) {
      console.error("[v0] Error en onSubmitAssistant:", error)
      setApiError(error.message || "Error desconocido al crear el ayudante")
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

      try {
        // Get the complete supervisor data including the auto-generated password
        const supervisorResponse = await fetch(`${apiUrl}/supervisores/${data.cedula}`)

        if (supervisorResponse.ok) {
          const supervisorData = await supervisorResponse.json()

          // Send welcome email with credentials
          const emailResponse = await fetch("/api/send-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: supervisorData.correo,
              subject: "Bienvenido al Ayudantech - Credenciales de Acceso",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                  <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <h1 style="color: #2563eb; margin: 0; font-size: 28px;">¡Bienvenido al Sistema!</h1>
                      <p style="color: #64748b; margin: 10px 0 0 0; font-size: 16px;">Sistema de Gestión de Ayudantías</p>
                    </div>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                      <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 20px;">Información de tu cuenta</h2>
                      <div style="margin-bottom: 12px;">
                        <strong style="color: #374151;">Nombre:</strong> 
                        <span style="color: #6b7280;">${supervisorData.nombre}</span>
                      </div>
                      <div style="margin-bottom: 12px;">
                        <strong style="color: #374151;">Cédula:</strong> 
                        <span style="color: #6b7280;">${supervisorData.cedula}</span>
                      </div>
                      <div style="margin-bottom: 12px;">
                        <strong style="color: #374151;">Rol:</strong> 
                        <span style="color: #059669; font-weight: 600;">Supervisor</span>
                      </div>
                    </div>
                    
                    <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                      <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px;">🔐 Credenciales de Acceso</h3>
                      <div style="margin-bottom: 12px;">
                        <strong style="color: #374151;">Usuario:</strong> 
                        <code style="background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px; color: #1f2937;">${supervisorData.correo}</code>
                      </div>
                      <div>
                        <strong style="color: #374151;">Contraseña:</strong> 
                        <code style="background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px; color: #1f2937;">${supervisorData.contraseña}</code>
                      </div>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 25px;">
                      <a href="https://ayudantech-frontend.vercel.app/supervisor/login" 
                         style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                        Acceder al Sistema
                      </a>
                    </div>
                    
                    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
                      <p style="color: #6b7280; margin: 0; font-size: 14px;">
                        Por favor, guarda estas credenciales en un lugar seguro.<br>
                        Si tienes alguna pregunta, contacta al administrador del sistema.
                      </p>
                    </div>
                  </div>
                </div>
              `,
            }),
          })

          if (!emailResponse.ok) {
            console.error("Error sending welcome email:", await emailResponse.text())
            // Don't throw error here as the supervisor was already created successfully
          }
        }
      } catch (emailError) {
        console.error("Error in email process:", emailError)
        // Don't throw error here as the supervisor was already created successfully
      }

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

  const onSubmitEditSupervisor = async (data: EditSupervisorForm) => {
    if (!editingSupervisor) return

    try {
      setApiError(null)
      setApiMessage(null)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      if (!apiUrl) {
        throw new Error(
          "❌ URL del backend no configurada. Verifica que NEXT_PUBLIC_API_URL esté definida en .env.local",
        )
      }

      const fullUrl = `${apiUrl}/supervisores/${editingSupervisor.cedula}`

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
              if (data.correo !== editingSupervisor.correo) {
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
          setErrorDialogMessage("El supervisor no fue encontrado en el sistema.")
          setShowErrorDialog(true)
          return
        }

        throw new Error(errorData.error || `Error del servidor: ${response.status}`)
      }

      const result = await response.json()
      setApiMessage(result.status || "✅ Supervisor modificado correctamente")

      setTimeout(() => {
        resetEditSupervisor()
        setShowEditSupervisorModal(false)
        setEditingSupervisor(null)
        setApiMessage(null)
        fetchSupervisores() // Refresh the list
      }, 2000)
    } catch (error) {
      console.error("❌ ERROR:", error)
      setApiError(error instanceof Error ? error.message : "Error desconocido")
    }
  }

  const handleCreateUser = () => {
    setApiMessage(null)
    setApiError(null)
    setShowCreateModal(true)
  }

  const handleCreateAssistant = () => {
    setApiMessage(null)
    setApiError(null)
    fetchFacultades().then(() => {
      if (facultades.length > 0 && !watch("facultad")) {
        setValue("facultad", facultades[0].nombre)
      }
    })
    setShowAssistantForm(true)
    setShowCreateModal(true)
    setShowSupervisorForm(false)
  }

  const handleEditAssistant = (assistant: Ayudante) => {
    setApiMessage(null) // Clear any previous messages
    setApiError(null) // Clear any previous errors
    setEditingAssistant(assistant)

    // Fetch facultades first
    fetchFacultades().then(() => {
      fetchCarrerasForEdit(assistant.facultad).then(() => {
        resetEditAssistant({
          nombre: assistant.nombre,
          correo: assistant.correo,
          nivel: assistant.nivel,
          facultad: assistant.facultad,
          carrera: assistant.carrera,
        })
        setShowEditAssistantModal(true)
      })
    })
  }

  const handleEditSupervisor = (supervisor: Supervisor) => {
    setApiMessage(null) // Clear any previous messages
    setApiError(null) // Clear any previous errors
    setEditingSupervisor(supervisor)

    resetEditSupervisor({
      nombre: supervisor.nombre,
      correo: supervisor.correo,
    })

    setShowEditSupervisorModal(true)
  }

  const handleDeleteAssistant = (ayudante: Ayudante) => {
    setDeletingAssistant(ayudante)
    setShowDeleteConfirmModal(true)
  }

  const confirmDeleteAssistant = async () => {
    if (!deletingAssistant) return

    try {
      setIsDeleting(true)
      setApiError(null)
      setApiMessage(null)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      if (!apiUrl) {
        throw new Error(
          "❌ URL del backend no configurada. Verifica que NEXT_PUBLIC_API_URL esté definida en .env.local",
        )
      }

      const fullUrl = `${apiUrl}/ayudantes/${deletingAssistant.cedula}`

      const response = await fetch(fullUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (response.status === 404) {
          setErrorDialogMessage("El ayudante no fue encontrado en el sistema.")
          setShowErrorDialog(true)
          return
        }

        throw new Error(errorData.error || `Error del servidor: ${response.status}`)
      }

      const result = await response.json()
      setApiMessage(result.status || "✅ Ayudante eliminado correctamente")

      // Close modal and refresh data
      setShowDeleteConfirmModal(false)
      setDeletingAssistant(null)
      fetchAyudantes() // Refresh the list

      setShowSuccessModal(true)
      // Clear success message after 3 seconds
      // setTimeout(() => {
      //   setApiMessage(null)
      // }, 3000)
    } catch (error) {
      console.error("❌ ERROR:", error)
      setApiError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDeleteAssistant = () => {
    setShowDeleteConfirmModal(false)
    setDeletingAssistant(null)
  }

  const handleCreateSupervisor = () => {
    setApiMessage(null)
    setApiError(null)
    setShowCreateModal(true)
    setShowSupervisorForm(true)
    setShowAssistantForm(false)
  }

  const handleDeleteSupervisor = (supervisor: Supervisor) => {
    // Added function to handle supervisor deletion
    setDeletingSupervisor(supervisor)
    setShowDeleteSupervisorConfirmModal(true)
  }

  const confirmDeleteSupervisor = async () => {
    // Added function to confirm supervisor deletion
    if (!deletingSupervisor) return

    try {
      setIsDeletingSupervisor(true)
      setApiError(null)
      setApiMessage(null)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      if (!apiUrl) {
        throw new Error(
          "❌ URL del backend no configurada. Verifica que NEXT_PUBLIC_API_URL esté definida en .env.local",
        )
      }

      const fullUrl = `${apiUrl}/supervisores/${deletingSupervisor.cedula}`

      const response = await fetch(fullUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (response.status === 404) {
          setErrorDialogMessage("El supervisor no fue encontrado en el sistema.")
          setShowErrorDialog(true)
          return
        }

        throw new Error(errorData.error || `Error del servidor: ${response.status}`)
      }

      const result = await response.json()
      setApiMessage(result.status || "✅ Supervisor eliminado correctamente")

      // Close modal and refresh data
      setShowDeleteSupervisorConfirmModal(false)
      setDeletingSupervisor(null)
      fetchSupervisores() // Refresh the list

      setShowSuccessModal(true)
      // Clear success message after 3 seconds
      // setTimeout(() => {
      //   setApiMessage(null)
      // }, 3000)
    } catch (error) {
      console.error("❌ ERROR:", error)
      setApiError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsDeletingSupervisor(false)
    }
  }

  const cancelDeleteSupervisor = () => {
    // Added function to cancel supervisor deletion
    setShowDeleteSupervisorConfirmModal(false)
    setDeletingSupervisor(null)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setShowAssistantForm(false)
    setShowSupervisorForm(false)
    setShowEditAssistantModal(false)
    setShowEditSupervisorModal(false)
    setShowDeleteConfirmModal(false)
    setShowDeleteSupervisorConfirmModal(false) // Added supervisor delete modal to close function
    setEditingAssistant(null)
    setEditingSupervisor(null)
    setDeletingAssistant(null)
    setDeletingSupervisor(null) // Added supervisor deletion state reset
    setApiMessage(null) // Clear messages when closing modals
    setApiError(null) // Clear errors when closing modals
    reset()
    resetSupervisor()
    resetEditAssistant()
    resetEditSupervisor()
    setSearchTerm("") // Clear search term when closing modal
  }

  const handleCloseErrorDialog = () => {
    setShowErrorDialog(false)
    setErrorDialogMessage("")
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    setApiMessage(null)
  }

  const handleVerCrearAyudantias = () => {
    // Fetch ayudantias when switching to the view
    fetchAyudantias() // Call the newly added fetchAyudantias function
    setShowAyudantiasView(true)
  }

  const handleBackFromAyudantias = () => {
    setShowAyudantiasView(false)
  }

  const handleCreateAyudantia = () => {
    if (plazas.length > 0 && !plazaAyudantia) {
      setPlazaAyudantia(plazas[0].nombre)
    }
    if (tipos.length > 0 && !tipoAyudantia) {
      setTipoAyudantia(tipos[0].tipo)
    }
    setShowCreateAyudantiaModal(true)
  }

  const handleCloseAyudantiaModal = () => {
    setShowCreateAyudantiaModal(false)
    setCedulaAyudante("")
    setTipoAyudantia("")
    setCedulaSupervisor("")
    setPlazaAyudantia("")
    setApiError(null)
  }

  const handleSubmitAyudantia = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] handleSubmitAyudantia called")
    console.log("[v0] Form data:", {
      cedula_ayudante: cedulaAyudante,
      tipo_ayudante: tipoAyudantia,
      cedula_supervisor: cedulaSupervisor,
      plaza: plazaAyudantia,
    })

    if (!cedulaAyudante || !tipoAyudantia || !cedulaSupervisor || !plazaAyudantia) {
      setApiError("Por favor, completa todos los campos.")
      return
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    console.log("[v0] API URL:", apiUrl)

    if (!apiUrl) {
      setApiError("URL del backend no configurada.")
      return
    }

    try {
      console.log("[v0] Sending request to:", `${apiUrl}/ayudantias`)
      const response = await fetch(`${apiUrl}/ayudantias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula_ayudante: cedulaAyudante,
          tipo_ayudante: tipoAyudantia,
          cedula_supervisor: cedulaSupervisor,
          plaza: plazaAyudantia,
        }),
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.log("[v0] Error data:", errorData)
        const errorMessage = errorData.error || errorData.message || "Error al crear la ayudantía"

        // Remove emojis and display clean error messages
        const cleanMessage = errorMessage.replace(/❌|✅/g, "").trim()

        // Detect specific error cases and show user-friendly messages
        if (cleanMessage.includes("cédula del ayudante no existe")) {
          setApiError("La cédula del ayudante no está registrada en el sistema.")
        } else if (cleanMessage.includes("cédula del supervisor no existe")) {
          setApiError("La cédula del supervisor no está registrada en el sistema.")
        } else if (cleanMessage.includes("ya tiene una ayudantía registrada")) {
          setApiError("Este ayudante ya tiene una ayudantía asignada.")
        } else {
          setApiError(cleanMessage)
        }
        return
      }

      const result = await response.json()
      console.log("[v0] Success result:", result)
      setApiMessage("Ayudantía creada exitosamente.")
      setShowSuccessModal(true)
      handleCloseAyudantiaModal()
      fetchAyudantias() // Refresh the list of ayudantias after creation
    } catch (error: any) {
      console.error("[v0] Error creating ayudantia:", error)
      setApiError("Error al conectar con el servidor. Por favor, intenta de nuevo.")
    }
  }

  const handleDeleteAyudantia = (ayudantia: Ayudantia) => {
    setDeletingAyudantia(ayudantia)
    setShowDeleteAyudantiaModal(true)
  }

  const confirmDeleteAyudantia = async () => {
    if (!deletingAyudantia) return

    try {
      setIsDeleting(true)
      setApiError(null)
      setApiMessage(null)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      if (!apiUrl) {
        throw new Error("URL del backend no configurada. Verifica que NEXT_PUBLIC_API_URL esté definida en .env.local")
      }

      const fullUrl = `${apiUrl}/ayudantias/${deletingAyudantia.id}`

      const response = await fetch(fullUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (response.status === 404) {
          setApiError("La ayudantía no fue encontrada en el sistema.")
          return
        }

        throw new Error(errorData.error || `Error del servidor: ${response.status}`)
      }

      const result = await response.json()
      setApiMessage(result.status?.replace("✅", "").trim() || "Ayudantía eliminada correctamente")

      setShowSuccessModal(true)
      setShowDeleteAyudantiaModal(false)
      setDeletingAyudantia(null)
      fetchAyudantias()
    } catch (error) {
      console.error("Error:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setApiError(errorMessage.replace("❌", "").trim())
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDeleteAyudantia = () => {
    setShowDeleteAyudantiaModal(false)
    setDeletingAyudantia(null)
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
                  icon: <Building2 className="h-4 w-4" />,
                  color: "bg-green-500",
                  stats: "24 plazas activas",
                },
                {
                  id: "seguimiento",
                  title: "Seguimiento de Ayudantías",
                  description: "Monitorear el progreso y actividades",
                  icon: <Activity className="h-4 w-4" />,
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

        <main className="flex-1 p-6 overflow-x-hidden">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">
                  {
                    [
                      { id: "users", title: "Gestión de Usuarios" },
                      { id: "plazas", title: "Gestión de Plazas de Ayudantía" },
                      { id: "seguimiento", title: "Seguimiento de Ayudantías" },
                      { id: "evaluacion", title: "Evaluación y Beneficios" },
                    ].find((s) => s.id === activeSection)?.title
                  }
                </h2>
                <CardDescription>
                  {activeSection === "users"
                    ? "Administra ayudantes y supervisores del sistema."
                    : activeSection === "plazas"
                      ? "Crea, edita y elimina las plazas de ayudantía disponibles."
                      : activeSection === "seguimiento"
                        ? "Monitorea el progreso y las actividades de las ayudantías."
                        : activeSection === "evaluacion"
                          ? "Gestiona las evaluaciones de los ayudantes y sus beneficios."
                          : `Esta sección estará disponible próximamente.`}
                </CardDescription>
              </div>

              <div>
                {activeSection === "users" && (
                  <Button className="bg-primary hover:bg-primary/90" onClick={handleCreateUser}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Nuevo
                  </Button>
                )}
                {activeSection === "plazas" && (
                  <Button
                    onClick={() => {
                      setShowPlazaModal(true)
                      setEditingPlaza(null)
                      setPlazaNombre("")
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Plaza
                  </Button>
                )}
                {activeSection === "seguimiento" && !showAyudantiasView && (
                  <Button onClick={handleVerCrearAyudantias}>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Ver Ayudantías
                  </Button>
                )}
              </div>
            </div>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">
                  {
                    [
                      { id: "users", title: "Lista de Usuarios" },
                      { id: "plazas", title: "Lista de Plazas" },
                      { id: "seguimiento", title: "Seguimiento de Ayudantías" },
                      { id: "evaluacion", title: "Evaluación y Beneficios" },
                    ].find((s) => s.id === activeSection)?.title
                  }
                </CardTitle>
                <CardDescription>
                  {activeSection === "users"
                    ? "Visualiza, edita o elimina los ayudantes y supervisores registrados."
                    : activeSection === "plazas"
                      ? "Administra las plazas disponibles para las ayudantías."
                      : activeSection === "seguimiento"
                        ? "Revisa las asignaciones, actividades y el progreso de las ayudantías."
                        : activeSection === "evaluacion"
                          ? "Gestiona las evaluaciones de los ayudantes y los beneficios asociados."
                          : `Esta funcionalidad estará disponible próximamente.`}
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
                                          onClick={() => handleDeleteAssistant(ayudante)}
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
                                          onClick={() => handleEditSupervisor(supervisor)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                          title="Eliminar supervisor"
                                          onClick={() => handleDeleteSupervisor(supervisor)} // Added onClick handler for supervisor delete button
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
                ) : activeSection === "plazas" ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-end"></div>
                    <Card>
                      <CardContent className="pt-6">
                        {loadingPlazas ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                            <span>Cargando plazas...</span>
                          </div>
                        ) : plazas.length === 0 ? (
                          <div className="text-center text-muted-foreground py-8">No hay plazas registradas.</div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {plazas.map((plaza) => (
                                <TableRow key={plaza.nombre}>
                                  <TableCell>{plaza.nombre}</TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      title="Editar plaza"
                                      onClick={() => {
                                        setEditingPlaza(plaza)
                                        setNuevoNombrePlaza(plaza.nombre)
                                        setShowPlazaModal(true)
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      title="Eliminar plaza"
                                      onClick={() => handleDeletePlaza(plaza.nombre)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </Card>

                    {/* Modal para crear/editar plaza */}
                    <Dialog
                      open={showPlazaModal}
                      onOpenChange={(open) => {
                        setShowPlazaModal(open)
                        if (!open) {
                          setEditingPlaza(null)
                          setPlazaNombre("")
                          setNuevoNombrePlaza("")
                        }
                      }}
                    >
                      <DialogContent>
                        <DialogTitle>{editingPlaza ? "Editar Plaza" : "Nueva Plaza"}</DialogTitle>
                        <div className="space-y-4">
                          <Input
                            placeholder="Nombre de la plaza"
                            value={editingPlaza ? nuevoNombrePlaza : plazaNombre}
                            onChange={(e) =>
                              editingPlaza ? setNuevoNombrePlaza(e.target.value) : setPlazaNombre(e.target.value)
                            }
                          />
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowPlazaModal(false)
                                setEditingPlaza(null)
                                setPlazaNombre("")
                                setNuevoNombrePlaza("")
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={editingPlaza ? handleEditPlaza : handleCreatePlaza}
                              disabled={!(editingPlaza ? nuevoNombrePlaza : plazaNombre)}
                            >
                              {editingPlaza ? "Guardar Cambios" : "Crear"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  (activeSection === "seguimiento" || activeSection === "evaluacion") && (
                    <div className="flex flex-col items-center justify-center py-12 gap-6">
                      {activeSection === "seguimiento" ? (
                        showAyudantiasView ? (
                          <div className="w-full">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" onClick={handleBackFromAyudantias}>
                                  <ChevronLeft className="h-4 w-4 mr-2" />
                                  Volver
                                </Button>
                                <h2 className="text-2xl font-bold">Gestión de Ayudantías</h2>
                              </div>
                              <Button onClick={handleCreateAyudantia}>
                                <Plus className="h-4 w-4 mr-2" />
                                Crear Ayudantía
                              </Button>
                            </div>

                            <Card>
                              <CardHeader>
                                <CardTitle>Lista de Ayudantías</CardTitle>
                                <CardDescription>Visualiza y gestiona todas las ayudantías activas</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="overflow-x-auto -mx-6 px-6">
                                  <Table className="min-w-[800px]">
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Cédula Ayudante</TableHead>
                                        <TableHead>Cédula Supervisor</TableHead>
                                        <TableHead>Plaza</TableHead>
                                        <TableHead>Descripción Objetivo</TableHead>
                                        <TableHead>Tipo Ayudante</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {ayudantias.length === 0 ? (
                                        <TableRow>
                                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                            No hay ayudantías registradas. Crea una nueva ayudantía para comenzar.
                                          </TableCell>
                                        </TableRow>
                                      ) : (
                                        ayudantias.map((ayudantia) => (
                                          <TableRow key={ayudantia.id}>
                                            <TableCell>{ayudantia.id}</TableCell>
                                            <TableCell>{ayudantia.cedula_ayudante}</TableCell>
                                            <TableCell>{ayudantia.cedula_supervisor}</TableCell>
                                            <TableCell>{ayudantia.plaza}</TableCell>
                                            <TableCell>{ayudantia.desc_objetivo}</TableCell>
                                            <TableCell>{ayudantia.tipo_ayudante}</TableCell>
                                            <TableCell className="text-right">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteAyudantia(ayudantia)}
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </TableCell>
                                          </TableRow>
                                        ))
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                            <Card
                              className="border-2 border-border hover:border-primary/50 transition-colors cursor-pointer group"
                              onClick={handleVerCrearAyudantias}
                            >
                              <CardHeader className="text-center pb-4">
                                <div className="mx-auto h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                                  <Briefcase className="h-8 w-8 text-blue-500" />
                                </div>
                                <CardTitle className="text-xl">Ver y Crear Ayudantías</CardTitle>
                                <CardDescription className="mt-2">
                                  Gestiona las ayudantías activas y crea nuevas asignaciones
                                </CardDescription>
                              </CardHeader>
                            </Card>

                            <Card className="border-2 border-border hover:border-primary/50 transition-colors cursor-pointer group">
                              <CardHeader className="text-center pb-4">
                                <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                                  <TrendingUp className="h-8 w-8 text-green-500" />
                                </div>
                                <CardTitle className="text-xl">Ver Actividades</CardTitle>
                                <CardDescription className="mt-2">
                                  Monitorea el progreso y las actividades realizadas
                                </CardDescription>
                              </CardHeader>
                            </Card>
                          </div>
                        )
                      ) : (
                        // This is the placeholder for the 'evaluacion' section
                        <div>
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
                                  icon: <Building2 className="h-4 w-4" />,
                                  color: "bg-green-500",
                                  stats: "24 plazas activas",
                                },
                                {
                                  id: "seguimiento",
                                  title: "Seguimiento de Ayudantías",
                                  description: "Monitorear el progreso y actividades",
                                  icon: <Activity className="h-4 w-4" />,
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
                    </div>
                  )
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
                    <Select onValueChange={field.onChange} value={field.value}>
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

      <Dialog open={showEditSupervisorModal} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md"
          showCloseButton={false}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogTitle className="text-lg font-semibold">Editar Supervisor</DialogTitle>

          <div className="space-y-2 pb-4">
            <p className="text-sm text-muted-foreground">
              Modifica la información del supervisor {editingSupervisor?.nombre}
            </p>
          </div>

          <form onSubmit={handleSubmitEditSupervisor(onSubmitEditSupervisor)} className="space-y-4 py-4">
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
                <Label htmlFor="edit-supervisor-cedula">Cédula</Label>
                <Input
                  id="edit-supervisor-cedula"
                  value={editingSupervisor?.cedula || ""}
                  disabled
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">La cédula no se puede modificar</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-supervisor-nombre">Nombre Completo</Label>
                <Input
                  id="edit-supervisor-nombre"
                  placeholder="Juan Pérez"
                  {...registerEditSupervisor("nombre")}
                  className={errorsEditSupervisor.nombre ? "border-red-500" : ""}
                />
                {errorsEditSupervisor.nombre && (
                  <p className="text-sm text-red-500">{errorsEditSupervisor.nombre.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-supervisor-correo">Correo Electrónico</Label>
              <Input
                id="edit-supervisor-correo"
                type="email"
                placeholder="juan.perez@correo.unimet.edu.ve"
                {...registerEditSupervisor("correo")}
                className={errorsEditSupervisor.correo ? "border-red-500" : ""}
              />
              {errorsEditSupervisor.correo && (
                <p className="text-sm text-red-500">{errorsEditSupervisor.correo.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmittingEditSupervisor}>
                {isSubmittingEditSupervisor ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirmModal} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md"
          showCloseButton={false}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Confirmar Eliminación</span>
          </DialogTitle>

          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              ¿Estás seguro de que deseas eliminar al ayudante{" "}
              <span className="font-semibold text-foreground">{deletingAssistant?.nombre}</span> con cédula{" "}
              <span className="font-semibold text-foreground">{deletingAssistant?.cedula}</span>?
            </p>
            <p className="text-sm text-red-600 font-medium">Esta acción no se puede deshacer.</p>

            {apiError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">❌ {apiError}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={cancelDeleteAssistant} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDeleteAssistant} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteSupervisorConfirmModal} onOpenChange={() => {}}>
        {" "}
        {/* Added supervisor delete confirmation modal */}
        <DialogContent
          className="sm:max-w-md"
          showCloseButton={false}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Confirmar Eliminación</span>
          </DialogTitle>

          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              ¿Estás seguro de que deseas eliminar al supervisor{" "}
              <span className="font-semibold text-foreground">{deletingSupervisor?.nombre}</span> con cédula{" "}
              <span className="font-semibold text-foreground">{deletingSupervisor?.cedula}</span>?
            </p>
            <p className="text-sm text-red-600 font-medium">Esta acción no se puede deshacer.</p>

            {apiError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">❌ {apiError}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={cancelDeleteSupervisor} disabled={isDeletingSupervisor}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteSupervisor}
              disabled={isDeletingSupervisor}
            >
              {isDeletingSupervisor ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateAyudantiaModal} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md"
          showCloseButton={false}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogTitle className="text-lg font-semibold">Crear Ayudantía</DialogTitle>

          <div className="space-y-2 pb-4">
            <p className="text-sm text-muted-foreground">Completa los datos para crear una nueva ayudantía</p>
          </div>

          {apiError && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{apiError}</h3>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitAyudantia} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cedula-ayudante">Cédula Ayudante</Label>
              <Input
                id="cedula-ayudante"
                type="text"
                placeholder="12345678"
                value={cedulaAyudante}
                onChange={(e) => setCedulaAyudante(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipoAyudantia} onValueChange={setTipoAyudantia}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tipos.map((tipo) => (
                    <SelectItem key={tipo.tipo} value={tipo.tipo}>
                      {tipo.tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cedula-supervisor">Cédula Supervisor</Label>
              <Input
                id="cedula-supervisor"
                type="text"
                placeholder="87654321"
                value={cedulaSupervisor}
                onChange={(e) => setCedulaSupervisor(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plaza">Plaza</Label>
              <Select value={plazaAyudantia} onValueChange={setPlazaAyudantia}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una plaza" />
                </SelectTrigger>
                <SelectContent>
                  {plazas.map((plaza) => (
                    <SelectItem key={plaza.nombre} value={plaza.nombre}>
                      {plaza.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseAyudantiaModal}>
                Cancelar
              </Button>
              <Button type="submit">Crear Ayudantía</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDeleteAyudantiaModal && deletingAyudantia !== null}
        onOpenChange={(open) => {
          if (!open) cancelDeleteAyudantia()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la ayudantía con ID {deletingAyudantia?.id}? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDeleteAyudantia} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteAyudantia} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessModal} onOpenChange={handleCloseSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="flex items-center space-x-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span>Operación Exitosa</span>
          </DialogTitle>

          <div className="py-4">
            <p className="text-sm text-muted-foreground">{apiMessage}</p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCloseSuccessModal}>Aceptar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirmModal} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md"
          showCloseButton={false}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Confirmar Eliminación</span>
          </DialogTitle>

          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              ¿Estás seguro de que deseas eliminar al ayudante{" "}
              <span className="font-semibold text-foreground">{deletingAssistant?.nombre}</span> con cédula{" "}
              <span className="font-semibold text-foreground">{deletingAssistant?.cedula}</span>?
            </p>
            <p className="text-sm text-red-600 font-medium">Esta acción no se puede deshacer.</p>

            {apiError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">❌ {apiError}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={cancelDeleteAssistant} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDeleteAssistant} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteSupervisorConfirmModal} onOpenChange={() => {}}>
        {" "}
        {/* Added supervisor delete confirmation modal */}
        <DialogContent
          className="sm:max-w-md"
          showCloseButton={false}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Confirmar Eliminación</span>
          </DialogTitle>

          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              ¿Estás seguro de que deseas eliminar al supervisor{" "}
              <span className="font-semibold text-foreground">{deletingSupervisor?.nombre}</span> con cédula{" "}
              <span className="font-semibold text-foreground">{deletingSupervisor?.cedula}</span>?
            </p>
            <p className="text-sm text-red-600 font-medium">Esta acción no se puede deshacer.</p>

            {apiError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">❌ {apiError}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={cancelDeleteSupervisor} disabled={isDeletingSupervisor}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteSupervisor}
              disabled={isDeletingSupervisor}
            >
              {isDeletingSupervisor ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateAyudantiaModal} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md"
          showCloseButton={false}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogTitle className="text-lg font-semibold">Crear Ayudantía</DialogTitle>

          <div className="space-y-2 pb-4">
            <p className="text-sm text-muted-foreground">Completa los datos para crear una nueva ayudantía</p>
          </div>

          {apiError && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{apiError}</h3>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitAyudantia} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cedula-ayudante">Cédula Ayudante</Label>
              <Input
                id="cedula-ayudante"
                type="text"
                placeholder="12345678"
                value={cedulaAyudante}
                onChange={(e) => setCedulaAyudante(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipoAyudantia} onValueChange={setTipoAyudantia}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tipos.map((tipo) => (
                    <SelectItem key={tipo.tipo} value={tipo.tipo}>
                      {tipo.tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cedula-supervisor">Cédula Supervisor</Label>
              <Input
                id="cedula-supervisor"
                type="text"
                placeholder="87654321"
                value={cedulaSupervisor}
                onChange={(e) => setCedulaSupervisor(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plaza">Plaza</Label>
              <Select value={plazaAyudantia} onValueChange={setPlazaAyudantia}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una plaza" />
                </SelectTrigger>
                <SelectContent>
                  {plazas.map((plaza) => (
                    <SelectItem key={plaza.nombre} value={plaza.nombre}>
                      {plaza.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseAyudantiaModal}>
                Cancelar
              </Button>
              <Button type="submit">Crear Ayudantía</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDeleteAyudantiaModal && deletingAyudantia !== null}
        onOpenChange={(open) => {
          if (!open) cancelDeleteAyudantia()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la ayudantía con ID {deletingAyudantia?.id}? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDeleteAyudantia} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteAyudantia} disabled={isDeleting}>
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessModal} onOpenChange={handleCloseSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="flex items-center space-x-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span>Operación Exitosa</span>
          </DialogTitle>

          <div className="py-4">
            <p className="text-sm text-muted-foreground">{apiMessage}</p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleCloseSuccessModal}>Aceptar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

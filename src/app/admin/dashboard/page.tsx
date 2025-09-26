"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
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
  X,
  UserPlus,
  GraduationCap,
} from "lucide-react"
import Link from "next/link"

const createAssistantSchema = z.object({
  cedula: z.string().min(1, "La cédula es requerida").regex(/^\d+$/, "La cédula debe contener solo números"),
  nombre: z.string().min(1, "El nombre es requerido").min(2, "El nombre debe tener al menos 2 caracteres"),
  correo: z
    .string()
    .min(1, "El correo es requerido")
    .email("Formato de correo inválido")
    .refine((email) => email.endsWith("@correo.unimet.edu.ve"), "El correo debe terminar en @correo.unimet.edu.ve"),
  nivel: z.string().min(1, "El nivel es requerido"),
  facultad: z.string().min(1, "La facultad es requerida"),
  carrera: z.string().min(1, "La carrera es requerida"),
})

type CreateAssistantForm = z.infer<typeof createAssistantSchema>

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState("users")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssistantForm, setShowAssistantForm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<CreateAssistantForm>({
    resolver: zodResolver(createAssistantSchema),
  })

  const sections = [
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

  const onSubmitAssistant = async (data: CreateAssistantForm) => {
    try {
      console.log("Datos del ayudante:", data)
      // Aquí se conectará con el backend
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simular llamada API

      // Reset form and close modal
      reset()
      setShowAssistantForm(false)
      setShowCreateModal(false)
    } catch (error) {
      console.error("Error al crear ayudante:", error)
    }
  }

  const handleCreateUser = () => {
    setShowCreateModal(true)
  }

  const handleCreateAssistant = () => {
    setShowAssistantForm(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setShowAssistantForm(false)
    reset()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="mr-2">
              {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
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
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${sidebarCollapsed ? "w-16" : "w-80"} border-r border-border bg-card/30 min-h-[calc(100vh-4rem)] transition-all duration-300`}
        >
          <div className="p-6">
            <div className="space-y-2">
              {sections.map((section) => (
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

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">
                  {sections.find((s) => s.id === activeSection)?.title}
                </h2>
                <p className="text-muted-foreground">{sections.find((s) => s.id === activeSection)?.description}</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleCreateUser}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Nuevo
              </Button>
            </div>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground">{sections.find((s) => s.id === activeSection)?.title}</CardTitle>
                <CardDescription>
                  Esta sección estará disponible próximamente. Aquí podrás gestionar todo lo relacionado con{" "}
                  {sections.find((s) => s.id === activeSection)?.title.toLowerCase()}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    {sections.find((s) => s.id === activeSection)?.icon}
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Próximamente</h3>
                  <p className="text-muted-foreground mb-4">
                    Esta funcionalidad se desarrollará en las próximas iteraciones.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Dialog open={showCreateModal} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="space-y-2 pb-4">
            <h2 className="text-lg font-semibold">Crear Nuevo Usuario</h2>
            <p className="text-sm text-muted-foreground">Selecciona el tipo de usuario que deseas crear</p>
          </div>

          {!showAssistantForm ? (
            <div className="flex flex-col space-y-4 py-4">
              <Button onClick={handleCreateAssistant} className="flex items-center justify-center space-x-2 h-12">
                <GraduationCap className="h-5 w-5" />
                <span>Crear Ayudante</span>
              </Button>

              <Button
                variant="outline"
                disabled
                className="flex items-center justify-center space-x-2 h-12 bg-transparent"
              >
                <UserPlus className="h-5 w-5" />
                <span>Crear Supervisor</span>
                <span className="text-xs text-muted-foreground ml-2">(Próximamente)</span>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmitAssistant)} className="space-y-4 py-4">
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
                <Select onValueChange={(value) => setValue("nivel", value)}>
                  <SelectTrigger className={errors.nivel ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecciona el nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pregrado">Pregrado</SelectItem>
                    <SelectItem value="postgrado">Postgrado</SelectItem>
                  </SelectContent>
                </Select>
                {errors.nivel && <p className="text-sm text-red-500">{errors.nivel.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facultad">Facultad</Label>
                  <Select onValueChange={(value) => setValue("facultad", value)}>
                    <SelectTrigger className={errors.facultad ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecciona facultad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ingenieria">Ingeniería</SelectItem>
                      <SelectItem value="ciencias">Ciencias</SelectItem>
                      <SelectItem value="humanidades">Humanidades</SelectItem>
                      <SelectItem value="administracion">Administración</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.facultad && <p className="text-sm text-red-500">{errors.facultad.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carrera">Carrera</Label>
                  <Select onValueChange={(value) => setValue("carrera", value)}>
                    <SelectTrigger className={errors.carrera ? "border-red-500" : ""}>
                      <SelectValue placeholder="Selecciona carrera" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sistemas">Ingeniería de Sistemas</SelectItem>
                      <SelectItem value="industrial">Ingeniería Industrial</SelectItem>
                      <SelectItem value="civil">Ingeniería Civil</SelectItem>
                      <SelectItem value="matematicas">Matemáticas</SelectItem>
                      <SelectItem value="fisica">Física</SelectItem>
                    </SelectContent>
                  </Select>
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
    </div>
  )
}

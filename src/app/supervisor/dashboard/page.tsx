"use client"

import { BookOpen, Users, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function SupervisorDashboard() {
  const router = useRouter()

  const handleLogout = () => {
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
            <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Bienvenido, Supervisor</h2>
            <p className="text-muted-foreground">
              Este es tu panel de control temporal. Próximamente tendrás acceso a todas las funcionalidades.
            </p>
          </div>

          {/* Temporary Content */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Gestión de Ayudantes</span>
                </CardTitle>
                <CardDescription>Supervisa y gestiona a los ayudantes asignados</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidad en desarrollo...</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span>Reportes</span>
                </CardTitle>
                <CardDescription>Visualiza reportes y estadísticas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidad en desarrollo...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

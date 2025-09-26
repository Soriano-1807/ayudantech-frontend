"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Shield, ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    correo: "",
    contraseña: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      if (!apiUrl) {
        throw new Error("URL del backend no configurada")
      }

      const response = await fetch(`${apiUrl}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: formData.correo,
          contraseña: formData.contraseña,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al iniciar sesión")
        setIsLoading(false)
        return
      }

      sessionStorage.setItem("adminAuthenticated", "true")
      sessionStorage.setItem("adminEmail", formData.correo)

      console.log(data.status)
      window.location.href = "/admin/dashboard"
    } catch (err) {
      console.error("Error en login:", err)
      setError("Error de conexión. Verifica tu conexión a internet.")
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (error) setError("")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Link>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">AyudanTech</span>
          </div>

          <div className="flex items-center justify-center space-x-2 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Acceso de Administrador</h1>
          </div>
          <p className="text-muted-foreground">Ingresa tus credenciales para continuar</p>
        </div>

        {/* Login Form */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-foreground">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Utiliza tus credenciales de la DDBE para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="correo" className="text-foreground">
                  Correo Electrónico
                </Label>
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  placeholder="Ingresa tu correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  required
                  className="bg-background border-border focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contraseña" className="text-foreground">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="contraseña"
                    name="contraseña"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    value={formData.contraseña}
                    onChange={handleInputChange}
                    required
                    className="bg-background border-border focus:border-primary pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ¿Problemas para acceder?{" "}
                <a href="mailto:ayudantech@unimet.edu.ve" className="text-primary hover:underline">
                  Contacta soporte
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 AyudanTech - Universidad Metropolitana</p>
        </div>
      </div>
    </div>
  )
}

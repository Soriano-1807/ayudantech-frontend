import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, CheckCircle, BarChart3, Shield, Clock } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">AyudanTech</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Características
              </a>
              <a href="#benefits" className="text-muted-foreground hover:text-foreground transition-colors">
                Beneficios
              </a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contacto
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary border-primary/20">
            🎓 Innovación en Gestión Académica
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6 text-foreground">
            Gestión de Ayudantías
            <span className="text-primary block">Simplificada</span>
          </h1>

          <p className="text-xl text-muted-foreground text-balance mb-12 max-w-2xl mx-auto leading-relaxed">
            Plataforma integral para administrar, supervisar y gestionar las ayudantías universitarias de la UNIMET de
            manera eficiente y moderna.
          </p>

          {/* Login Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/admin/login">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                <Shield className="mr-2 h-5 w-5" />
                Iniciar Sesión como Admin
              </Button>
            </Link>
            <Link href="/supervisor/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
              >
                <Users className="mr-2 h-5 w-5" />
                Iniciar Sesión como Supervisor
              </Button>
            </Link>
            <Link href="/ayudante/login">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Iniciar Sesión como Ayudante
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-muted-foreground">Ayudantes Activos</div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">50+</div>
                <div className="text-muted-foreground">Supervisores</div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-muted-foreground">Confiable</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Características Principales</h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar las ayudantías de manera profesional y eficiente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border/50 bg-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Gestión de Roles</h3>
                <p className="text-muted-foreground">
                  Sistema completo de roles para administradores, supervisores y ayudantes con permisos específicos.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Seguimiento de Actividades</h3>
                <p className="text-muted-foreground">
                  Registro y validación de actividades con evidencias y evaluaciones en tiempo real.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Reportes Automáticos</h3>
                <p className="text-muted-foreground">
                  Generación automática de reportes para el departamento de finanzas y seguimiento.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Seguridad Avanzada</h3>
                <p className="text-muted-foreground">
                  Autenticación segura y control de acceso basado en credenciales de la DDBE.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Tiempo Real</h3>
                <p className="text-muted-foreground">
                  Actualizaciones instantáneas y sincronización en tiempo real entre todos los usuarios.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Gestión de Plazas</h3>
                <p className="text-muted-foreground">
                  Creación, edición y asignación de plazas de ayudantía con control completo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
                ✨ Beneficios Clave
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Optimiza la gestión académica con tecnología moderna
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                AyudanTech transforma la manera en que la UNIMET gestiona sus programas de ayudantías, proporcionando
                herramientas intuitivas y procesos automatizados.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Reducción del tiempo administrativo</h4>
                    <p className="text-muted-foreground">
                      Automatización de procesos repetitivos y generación de reportes
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">Transparencia total en evaluaciones</h4>
                    <p className="text-muted-foreground">Seguimiento claro y objetivo del desempeño de cada ayudante</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-accent/5 p-8">
                <CardContent className="p-0">
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Dashboard Intuitivo</h3>
                    <p className="text-muted-foreground mb-6">
                      Visualiza toda la información importante en un solo lugar con gráficos y métricas en tiempo real.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-background/50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-primary">24/7</div>
                        <div className="text-muted-foreground">Disponibilidad</div>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-primary">100%</div>
                        <div className="text-muted-foreground">Precisión</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-border/40 bg-muted/30 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">AyudanTech</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Sistema de gestión de ayudantías para la Universidad Metropolitana (UNIMET).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contacto</h4>
              <div className="space-y-2 text-muted-foreground">
                <p>DDBE - UNIMET</p>
                <p>Caracas, Venezuela</p>
                <p>ayudantech@unimet.edu.ve</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Soporte</h4>
              <div className="space-y-2 text-muted-foreground">
                <p>Lunes a Viernes</p>
                <p>8:00 AM - 5:00 PM</p>
                <p>Soporte técnico disponible</p>
              </div>
            </div>
          </div>
          <div className="border-t border-border/40 mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 AyudanTech - Universidad Metropolitana. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


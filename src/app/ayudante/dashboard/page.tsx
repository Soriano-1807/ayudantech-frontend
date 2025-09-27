"use client"

import { BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AyudanteDashboardPage() {
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
          <Link
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Salir
          </Link>
        </div>

        {/* Temporary Content */}
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard de Ayudante</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Esta es una página temporal. Aquí se implementarán las funcionalidades específicas para ayudantes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

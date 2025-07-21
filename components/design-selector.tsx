"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Palette, Check } from "lucide-react"
import type { DesignTheme } from "../app/page"

interface DesignSelectorProps {
  currentTheme: DesignTheme
  onThemeChange: (theme: DesignTheme) => void
}

export function DesignSelector({ currentTheme, onThemeChange }: DesignSelectorProps) {
  const themes = [
    {
      id: "default" as DesignTheme,
      name: "Default",
      description: "Clean and professional",
      preview: "bg-white border-gray-200",
    },
    {
      id: "modern" as DesignTheme,
      name: "Modern",
      description: "Gradients and glass effects",
      preview: "bg-gradient-to-r from-blue-500 to-purple-500",
    },
    {
      id: "minimal" as DesignTheme,
      name: "Minimal",
      description: "Simple and focused",
      preview: "bg-gray-100 border-gray-300",
    },
    {
      id: "corporate" as DesignTheme,
      name: "Corporate",
      description: "Professional business style",
      preview: "bg-slate-700",
    },
    {
      id: "dark" as DesignTheme,
      name: "Dark",
      description: "Dark mode interface",
      preview: "bg-gray-800",
    },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette className="h-4 w-4 mr-2" />
          Design: {themes.find((t) => t.id === currentTheme)?.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className="flex items-center gap-3 p-3"
          >
            <div className={`w-8 h-8 rounded border ${theme.preview}`} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{theme.name}</span>
                {currentTheme === theme.id && <Check className="h-4 w-4 text-green-600" />}
              </div>
              <p className="text-xs text-muted-foreground">{theme.description}</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

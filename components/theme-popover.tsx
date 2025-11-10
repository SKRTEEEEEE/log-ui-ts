"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Palette } from 'lucide-react'
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

type ThemeType = {
  light: { name: string; color: string }[];
  dark: { name: string; color: string }[];
};

const themes: ThemeType = {
  light: [
    { name: "grays", color: "bg-zinc-100" },
    { name: "gold", color: "bg-yellow-300" },
    { name: "neon", color: "bg-pink-500" },
    { name: "sky", color: "bg-purple-400" },
    { name: "soft", color: "bg-gray-800" },
  ],
  dark: [
    { name: "grays", color: "bg-zinc-950" },
    { name: "gold", color: "bg-yellow-700" },
    { name: "neon", color: "bg-pink-600" },
    { name: "sky", color: "bg-purple-600" },
    { name: "soft", color: "bg-gray-300" },
  ],
};

export default function ThemePopover() {
  const {resolvedTheme, theme, setTheme} = useTheme()
  const [mode, setMode] = useState<"light" | "dark">(resolvedTheme?.split("-")[0] as "light"|"dark"||"dark")
  
  const handleModeChange = (newMode: "light" | "dark") => {
    const selectedTheme = theme?.split("-")[1] || "grays";
    const newTheme = `${newMode}-${selectedTheme}`;
    setMode(newMode);
    setTheme(newTheme);
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="text-accent"
          aria-label="Customize Theme"
        >
          <Palette className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0">
        <Tabs defaultValue={mode} onValueChange={(value) => handleModeChange(value as "light" | "dark")}>
          <TabsList className="grid w-full px-4 gap-2 grid-cols-2">
            <TabsTrigger value="light">Light</TabsTrigger>
            <TabsTrigger value="dark">Dark</TabsTrigger>
          </TabsList>
          <TabsContent value={mode} className="p-4 space-y-4">
            <h3 className="text-lg font-semibold sr-only">Choose Color for {mode} mode</h3>
            <div className="flex flex-col space-y-2">
              {themes[mode as keyof ThemeType].map((themeOpt) => (
                <Button
                  key={themeOpt.name}
                  variant="outline"
                  onClick={() => setTheme(mode + "-" + themeOpt.name)}
                  className={cn(
                    "flex items-center justify-start gap-x-2 border-2 border-muted bg-secondary text-foreground transition ease-in",
                    theme === mode + "-" + themeOpt.name && "border-4 border-border"
                  )}
                >
                  <span className={`w-4 h-4 rounded-full border shrink-0 ${themeOpt.color} mr-2`}></span>
                  {themeOpt.name}
                  {theme === `${mode}-${themeOpt.name}` && <span className="ml-auto text-accent font-black">✓</span>}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}

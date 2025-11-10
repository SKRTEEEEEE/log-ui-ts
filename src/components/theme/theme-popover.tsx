"use client";

import { useEffect, useMemo, useState } from "react";
import { Palette } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "../../lib/utils";

const THEME_GROUPS = {
  light: [
    { name: "grays", swatch: "bg-zinc-100" },
    { name: "gold", swatch: "bg-yellow-300" },
    { name: "neon", swatch: "bg-pink-500" },
    { name: "sky", swatch: "bg-blue-400" },
    { name: "soft", swatch: "bg-purple-200" },
  ],
  dark: [
    { name: "grays", swatch: "bg-zinc-900" },
    { name: "gold", swatch: "bg-yellow-600" },
    { name: "neon", swatch: "bg-pink-600" },
    { name: "sky", swatch: "bg-indigo-600" },
    { name: "soft", swatch: "bg-gray-300" },
  ],
} as const;

type Mode = keyof typeof THEME_GROUPS;

export function ThemePopover() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const activeTheme = useMemo(() => theme ?? resolvedTheme ?? "dark-soft", [theme, resolvedTheme]);
  const [mode, setMode] = useState<Mode>(activeTheme.startsWith("light") ? "light" : "dark");

  useEffect(() => {
    setMode((theme ?? resolvedTheme ?? "dark-soft").startsWith("light") ? "light" : "dark");
  }, [theme, resolvedTheme]);

  const applyTheme = (modeValue: Mode, palette?: string) => {
    const registry = THEME_GROUPS[modeValue];
    const nextPalette = palette && registry.some((preset) => preset.name === palette) ? palette : registry[0].name;
    setTheme(`${modeValue}-${nextPalette}`);
  };

  const handleThemeChange = (palette: string) => {
    applyTheme(mode, palette);
  };

  const handleModeChange = (value: Mode) => {
    setMode(value);
    const [, currentPalette = "grays"] = activeTheme.split("-");
    applyTheme(value, currentPalette);
  };

  const currentValue = activeTheme as string;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Customize theme" className="text-accent">
          <Palette className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-4">
        <div className="inline-flex w-full gap-1 rounded-md border bg-accent/10 p-1 text-xs font-semibold uppercase">
          {(["light", "dark"] as Mode[]).map((value) => (
            <button
              key={value}
              type="button"
              className={cn(
                "flex-1 rounded-sm px-3 py-1 transition-colors",
                mode === value ? "bg-background text-foreground shadow" : "text-muted-foreground"
              )}
              onClick={() => handleModeChange(value)}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {THEME_GROUPS[mode].map((preset) => {
            const value = `${mode}-${preset.name}`;
            const isActive = currentValue === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => handleThemeChange(preset.name)}
                className={cn(
                  "flex items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors",
                  isActive ? "border-ring bg-accent/20" : "border-border/70 hover:border-ring/60"
                )}
              >
                <span className={cn("h-4 w-4 rounded-full border", preset.swatch)} aria-hidden="true" />
                <span className="capitalize">{preset.name}</span>
                {isActive && (
                  <span aria-hidden="true" className="ml-auto text-xs font-semibold text-primary">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

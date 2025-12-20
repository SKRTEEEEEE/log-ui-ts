"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import type { IntlBase } from "@skrteeeeee/profile-domain";
import type { SerializedError } from "../error-serialization";
import { getErrorIcon } from "../get-error-icon";

/**
 * Hook para mostrar un toast solo una vez
 * Usa useRef para evitar re-renders y ejecuciones duplicadas
 * 
 * Soporta dos modos:
 * 1. SerializedError completo (con título + descripción + icono)
 * 2. IntlBase simple (solo mensaje, sin título)
 * 
 * @param input - SerializedError o IntlBase
 * 
 * @example
 * ```tsx
 * // Modo completo (con error serializado)
 * export function MyFallback({ error }: { error: SerializedError }) {
 *   useToastOnce(error);
 *   return <EmptyState />;
 * }
 * 
 * // Modo simple (solo mensaje)
 * export function MyComponent() {
 *   useToastOnce({ 
 *     es: "Operación exitosa", 
 *     en: "Operation successful" 
 *   });
 *   return <div>...</div>;
 * }
 * ```
 */
export function useToastOnce(input: SerializedError | IntlBase) {
  const shown = useRef(false);
  const locale = useLocale() as "es" | "en" | "ca" | "de";

  if (!shown.current) {
    // Detectar si es SerializedError (tiene 'title' y 'description')
    const isSerializedError = 'title' in input && 'description' in input;
    
    if (isSerializedError) {
      const error = input as SerializedError;
      
      // Silent error (no mostrar toast)
      if (error.description.es === 'd') {
        shown.current = true;
        return;
      }
      
      // Toast completo con título + descripción + icono
      toast.error(error.title[locale], {
        description: error.description[locale],
        icon: getErrorIcon(error.iconType)
      });
    } else {
      // IntlBase simple (solo mensaje)
      const message = input as IntlBase;
      toast.error(message[locale]);
    }
    
    shown.current = true;
  }
}

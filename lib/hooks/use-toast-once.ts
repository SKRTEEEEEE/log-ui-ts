"use client";

import { useRef } from "react";
import { toast } from "sonner";

/**
 * Hook para mostrar un toast solo una vez
 * Usa useRef para evitar re-renders y ejecuciones duplicadas
 * 
 * @param message - Mensaje a mostrar en el toast
 * 
 * @example
 * ```tsx
 * "use client";
 * export function MyFallback() {
 *   useToastOnce("Error loading data");
 *   return <EmptyState />;
 * }
 * ```
 */
export function useToastOnce(message: string) {
  const shown = useRef(false);

  if (!shown.current) {
    toast.error(message);
    shown.current = true;
  }
}

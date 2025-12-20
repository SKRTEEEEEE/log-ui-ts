"use client";

import type { ReactNode } from "react";
import { useToastOnce } from "@log-ui/lib/hooks/use-toast-once";
import type { SerializedError } from "@log-ui/lib/error-serialization";

/**
 * Client Component Fallback genérico para Sections
 * Muestra toast automático con título + descripción + icono
 * Renderiza children como UI alternativa (empty state, skeleton, etc.)
 * 
 * @example
 * ```tsx
 * // En Server Component
 * catch (error) {
 *   const serializedError = analyzeError(error);
 *   return (
 *     <SectionFallbackProvider error={serializedError}>
 *       <EmptyState />
 *     </SectionFallbackProvider>
 *   );
 * }
 * ```
 */
export function SectionFallbackProvider({ 
  children, 
  error 
}: { 
  children: ReactNode; 
  error: SerializedError;
}) {
  // useToastOnce maneja SerializedError completo (título + descripción + icono)
  useToastOnce(error);

  return <>{children}</>;
}

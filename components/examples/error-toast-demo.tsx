"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useErrorToast } from "@log-ui/lib/hooks/use-error-toast";
import { createDomainError, ErrorCodes, type DomainError } from "@skrteeeeee/profile-domain";

/**
 * Componente de demostración del sistema de toast para errores DomainError
 * 
 * Muestra ejemplos de cómo usar useErrorToast con diferentes tipos de friendlyDesc:
 * - 'd' → NO muestra toast (error silencioso)
 * - string predefinido ('tryAgainOrContact', 'credentials') → usa i18n
 * - objeto IntlBase → muestra mensaje directo con soporte multiidioma
 * - undefined → muestra mensaje genérico
 */
export function ErrorToastDemo() {
  const [error, setError] = useState<DomainError | null>(null);
  
  // Hook automático que detecta y muestra toasts
  useErrorToast(error);

  const simulateSilentError = () => {
    const err = createDomainError(
      ErrorCodes.DATABASE_ACTION,
      ErrorToastDemo,
      "simulateSilentError",
      'd' // NO mostrará toast
    );
    setError(err);
    // Resetear después de un tiempo
    setTimeout(() => setError(null), 100);
  };

  const simulatePredefinedError = () => {
    const err = createDomainError(
      ErrorCodes.UNAUTHORIZED_ACTION,
      ErrorToastDemo,
      "simulatePredefinedError",
      'credentials' // Mostrará "Credenciales inválidas" en el idioma actual
    );
    setError(err);
    setTimeout(() => setError(null), 100);
  };

  const simulateCustomError = () => {
    const err = createDomainError(
      ErrorCodes.DATABASE_FIND,
      ErrorToastDemo,
      "simulateCustomError",
      {
        es: "No se encontró el recurso solicitado",
        en: "The requested resource was not found",
        ca: "No s'ha trobat el recurs sol·licitat",
        de: "Die angeforderte Ressource wurde nicht gefunden"
      }
    );
    setError(err);
    setTimeout(() => setError(null), 100);
  };

  const simulateGenericError = () => {
    const err = createDomainError(
      ErrorCodes.SHARED_ACTION,
      ErrorToastDemo,
      "simulateGenericError"
      // Sin friendlyDesc → mostrará mensaje genérico
    );
    setError(err);
    setTimeout(() => setError(null), 100);
  };

  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <div>
        <h3 className="text-lg font-semibold mb-2">Error Toast System Demo</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Prueba los diferentes tipos de errores DomainError con toast automático
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          onClick={simulateSilentError}
        >
          Silent Error (friendlyDesc: 'd')
        </Button>
        
        <Button 
          variant="outline" 
          onClick={simulatePredefinedError}
        >
          Predefined Error ('credentials')
        </Button>
        
        <Button 
          variant="outline" 
          onClick={simulateCustomError}
        >
          Custom Error (IntlBase)
        </Button>
        
        <Button 
          variant="outline" 
          onClick={simulateGenericError}
        >
          Generic Error (no friendlyDesc)
        </Button>
      </div>

      <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded">
        <strong>Nota:</strong> Los toasts aparecerán en bottom-right según el locale actual.
        El Silent Error NO mostrará ningún toast (solo para logs del servidor).
      </div>
    </div>
  );
}

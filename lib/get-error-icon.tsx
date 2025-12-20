"use client";

import { ServerCrash, ShieldX, AlertCircle } from "lucide-react";
import { ErrorIcon, type IconType } from "./error-serialization";

/**
 * Resuelve el icono React a partir de un IconType
 * Solo disponible en cliente (usa componentes de lucide-react)
 * 
 * @param iconType - ErrorIcon enum o undefined
 * @returns Componente React del icono o undefined
 * 
 * Iconos disponibles:
 * - ErrorIcon.CREDENTIALS: Error de credenciales/autenticación (ShieldX) 🛡️
 * - ErrorIcon.TRY_AGAIN_OR_CONTACT: Error de servidor/red (ServerCrash) 💥
 * - ErrorIcon.ALERT_CIRCLE: Error genérico (AlertCircle) ⚠️
 */
export function getErrorIcon(iconType?: IconType): React.ReactNode {
  switch (iconType) {
    case ErrorIcon.CREDENTIALS:
      return <ShieldX className="h-5 w-5" />;
    case ErrorIcon.TRY_AGAIN_OR_CONTACT:
      return <ServerCrash className="h-5 w-5" />;
    case ErrorIcon.ALERT_CIRCLE:
      return <AlertCircle className="h-5 w-5" />;
    default:
      return undefined;
  }
}

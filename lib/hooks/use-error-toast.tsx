"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import type { DomainError } from "@skrteeeeee/profile-domain";

/**
 * Hook para mostrar toasts de error basados en DomainError
 * 
 * Detecta el campo friendlyDesc y muestra el mensaje apropiado según i18n:
 * - 'd' → NO mostrar toast (error silencioso para logs)
 * - string predefinido ('tryAgainOrContact', 'credentials', etc.) → usa traducción i18n
 * - objeto IntlBase → usa mensaje directamente según locale
 * - undefined → muestra mensaje genérico
 * 
 * @param error - Error capturado que puede ser DomainError
 * @param onError - Callback opcional que se ejecuta cuando hay error
 */
export function useErrorToast(
  error: Error | DomainError | null,
  onError?: (error: Error | DomainError) => void
) {
  const locale = useLocale() as "es" | "en" | "ca" | "de";
  const t = useTranslations("errors");

  useEffect(() => {
    if (!error) return;

    // Ejecutar callback opcional
    if (onError) {
      onError(error);
    }

    // Verificar si es DomainError
    const isDomainError = "type" in error && "friendlyDesc" in error;
    if (!isDomainError) {
      // Error genérico no controlado
      toast.error(t("generic.title"), {
        description: t("generic.description"),
      });
      return;
    }

    const domainError = error as DomainError;
    const { friendlyDesc, meta } = domainError;

    // Caso 1: 'd' → NO mostrar toast (error silencioso)
    // Detectar patrón creado por createDomainError cuando friendlyDesc === 'd':
    // - meta.desc existe con "Ups, ha ocurrido un error"
    // - friendlyDesc es objeto con "Inténtalo de nuevo más tarde..."
    if (
      meta?.silent === true || 
      (
        typeof friendlyDesc === "object" && 
        "es" in friendlyDesc && 
        friendlyDesc.es === "Inténtalo de nuevo más tarde o contáctanos si persiste" &&
        meta?.desc && 
        typeof meta.desc === "object" && 
        "es" in meta.desc &&
        meta.desc.es === "Ups, ha ocurrido un error"
      )
    ) {
      return;
    }
    
    // Fallback: si friendlyDesc es 'd' literal (no debería llegar aquí con domain package actual)
    if (typeof friendlyDesc === "string" && friendlyDesc === "d") {
      return;
    }

    // Caso 2: friendlyDesc es undefined → mensaje genérico
    if (!friendlyDesc) {
      toast.error(t("generic.title"), {
        description: t("generic.description"),
      });
      return;
    }

    // Caso 3: friendlyDesc es string predefinido → usar i18n
    if (typeof friendlyDesc === "string") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const title = t(`predefined.${friendlyDesc}.title` as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const description = t(`predefined.${friendlyDesc}.description` as any);
      toast.error(title, { description });
      return;
    }

    // Caso 4: friendlyDesc es objeto IntlBase → usar mensaje directo
    if (typeof friendlyDesc === "object" && locale in friendlyDesc) {
      const message = friendlyDesc[locale];
      
      // Verificar si hay meta.desc para usar como título
      const title = domainError.meta?.desc 
        ? (domainError.meta.desc as Record<string, string>)[locale] || t("generic.title")
        : t("generic.title");
      
      toast.error(title, { description: message });
      return;
    }

    // Fallback: mostrar mensaje genérico
    toast.error(t("generic.title"), {
      description: t("generic.description"),
    });
  }, [error, locale, t, onError]);
}

/**
 * Utility para mostrar toast de error directamente sin hook
 * Útil para usar en try/catch sin necesitar un estado de error
 * 
 * @example
 * try {
 *   await someAction()
 * } catch (error) {
 *   showErrorToast(error as DomainError, locale, t)
 * }
 */
export function showErrorToast(
  error: Error | DomainError,
  locale: "es" | "en" | "ca" | "de",
  t: (key: string) => string
) {
  const isDomainError = "type" in error && "friendlyDesc" in error;
  
  if (!isDomainError) {
    toast.error(t("errors.generic.title"), {
      description: t("errors.generic.description"),
    });
    return;
  }

  const domainError = error as DomainError;
  const { friendlyDesc, meta } = domainError;

  // 'd' → NO mostrar (detectar patrón de createDomainError con 'd')
  if (
    meta?.silent === true || 
    (
      typeof friendlyDesc === "object" && 
      "es" in friendlyDesc && 
      friendlyDesc.es === "Inténtalo de nuevo más tarde o contáctanos si persiste" &&
      meta?.desc && 
      typeof meta.desc === "object" && 
      "es" in meta.desc &&
      meta.desc.es === "Ups, ha ocurrido un error"
    )
  ) {
    return;
  }
  
  // Fallback
  if (typeof friendlyDesc === "string" && friendlyDesc === "d") {
    return;
  }

  if (!friendlyDesc) {
    toast.error(t("errors.generic.title"), {
      description: t("errors.generic.description"),
    });
    return;
  }

  if (typeof friendlyDesc === "string") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const title = t(`errors.predefined.${friendlyDesc}.title` as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const description = t(`errors.predefined.${friendlyDesc}.description` as any);
    toast.error(title, { description });
    return;
  }

  if (typeof friendlyDesc === "object" && locale in friendlyDesc) {
    const message = friendlyDesc[locale];
    const title = domainError.meta?.desc 
      ? (domainError.meta.desc as Record<string, string>)[locale] || t("errors.generic.title")
      : t("errors.generic.title");
    
    toast.error(title, { description: message });
    return;
  }

  toast.error(t("errors.generic.title"), {
    description: t("errors.generic.description"),
  });
}

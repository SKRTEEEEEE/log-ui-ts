"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

/**
 * Skeleton/Fallback del botón de conexión
 * Muestra un botón deshabilitado con el mensaje "No disponible"
 * 
 * @example
 * ```tsx
 * // En Server Component con Suspense
 * <Suspense fallback={<UserConnectSkeleton />}>
 *   <CustomConnectButton {...props} />
 * </Suspense>
 * 
 * // Con SectionFallbackProvider para mostrar toast en caso de error
 * import { SectionFallbackProvider } from "@log-ui/components/section-fallback-provider";
 * 
 * try {
 *   const user = await getCurrentUserUC();
 *   return <CustomConnectButton initialUser={user} {...props} />;
 * } catch (error) {
 *   const serializedError = analyzeError(error);
 *   return (
 *     <SectionFallbackProvider error={serializedError}>
 *       <UserConnectSkeleton />
 *     </SectionFallbackProvider>
 *   );
 * }
 * ```
 */
export function UserConnectSkeleton() {
  const t = useTranslations("auth");
  
  return (
    <Button 
      variant="outline" 
      disabled
      suppressHydrationWarning
      aria-label={t("notAvailable")}
      className="w-full"
    >
      {t("notAvailable")}
    </Button>
  );
}

import { getCurrentUserUC } from "@log-ui/core/application/usecases/entities/user";
import { CustomConnectButton } from "../custom-connect-button";

type UserConnectWrapperProps = {
  connectButtonLabel: string;
  locale: "es_ES" | "en_US" | "ja_JP" | "tl_PH";
  walletTranslations: {
    yourWallet: string;
    walletSettings: string;
  };
};

/**
 * Server Component que obtiene datos del usuario y renderiza CustomConnectButton
 * Se puede envolver con Suspense para mostrar skeleton mientras carga
 */
export async function UserConnectWrapper({
  connectButtonLabel,
  locale,
  walletTranslations,
}: UserConnectWrapperProps) {
  const user = await getCurrentUserUC();

  return (
    <CustomConnectButton
      connectButtonLabel={connectButtonLabel}
      initialUser={user}
      locale={locale}
      walletTranslations={walletTranslations}
    />
  );
}

/**
 * Skeleton del botón de conexión
 */
export function UserConnectSkeleton() {
  return (
    <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
  );
}

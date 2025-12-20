"use client"

import { generatePayload, getUserData, isLoggedIn, login } from "@log-ui/core/presentation/controllers/auth"
import { ConnectButton } from "thirdweb/react"
import { createWallet, inAppWallet } from "thirdweb/wallets";
import {  buttonVariants } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { ThirdwebClientConfig } from "@log-ui/core/infrastructure/connectors/thirdweb-auth";
import { useEffect, useState } from "react";
import UserFormDialog from "./site-header/user-form-dialog";
import { cn } from "@/lib/utils";
import { analyzeError } from "@log-ui/lib/error-serialization";
import { toast } from "sonner";
import { getErrorIcon } from "@log-ui/lib/get-error-icon";
import { useLocale, useTranslations } from "next-intl";

const wallets = [
    inAppWallet({
      auth: {
        options: [
          "google",
          "discord",
          "telegram",
          "email",
          "facebook",
          "passkey",
          "phone",
          "apple",
        ],
      },
    }),
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
    createWallet("io.rabby"),
    createWallet("io.zerion.wallet"),
    createWallet("com.hashpack.wallet"),
    createWallet("org.uniswap"),
    createWallet("com.okex.wallet"),
    createWallet("ai.hacken"),
    createWallet("com.trusteeglobal"),
    createWallet("com.thirdweb"),
    createWallet("com.coinsdo"),
    createWallet("us.binance"),
    createWallet("dev.auroracloud"),
    createWallet("zone.bitverse"),
    createWallet("co.xellar"),
    createWallet("app.subwallet"),
    createWallet("com.kraken"),
    createWallet("com.alphawallet"),
    createWallet("org.mathwallet"),
    createWallet("com.bitget.web3"),
    createWallet("com.trustwallet.app"),
    createWallet("com.ledger"),
    createWallet("com.bybit"),
    createWallet("com.safepal"),
    createWallet("pro.tokenpocket"),
    createWallet("xyz.timelesswallet"),
    createWallet("global.safe"),
    createWallet("io.1inch.wallet"),
    createWallet("com.robinhood.wallet"),
    createWallet("com.crypto.wallet"),
    createWallet("com.exodus"),
    createWallet("im.token"),
    createWallet("com.zengo"),
    createWallet("com.mewwallet"),
    createWallet("app.keyring"),
    createWallet("xyz.frontier.wallet"),
    createWallet("app.omni"),
    createWallet("app.onto"),
    createWallet("com.fireblocks"),
    createWallet("technology.obvious"),
    createWallet("com.ambire"),
    createWallet("com.bitcoin"),
    createWallet("io.internetmoney"),
    createWallet("app.walletnow"),
    createWallet("com.mtpelerin"),
  ];

const getClient = new ThirdwebClientConfig()
const client = getClient.client


type User = {
  id: string;
  nick: string | null;
  img: string | null;
  email: string | null;
  address: string;
  role: string | null;
  isVerified: boolean;
  solicitud: string | null;
}

// Map next-intl locales to Thirdweb locales
const mapToThirdwebLocale = (locale: "es" | "en" | "ca" | "de"): "es_ES" | "en_US" | "de_DE" => {
  const localeMap = {
    'es': 'es_ES' as const,
    'en': 'en_US' as const,
    'ca': 'es_ES' as const, // Thirdweb no tiene catalán, usar español
    'de': 'de_DE' as const,
  };
  return localeMap[locale];
};

export const CustomConnectButton = ({
  connectButtonLabel,
  initialUser = null,
  wrapperClassName,
  showUserFormButton = true,
  locale = "es",
  walletTranslations = { yourWallet: 'Tu cartera', walletSettings: 'Configuración de tu cartera' },
}:{
  connectButtonLabel?:string,
  initialUser?: User | null,
  wrapperClassName?: string,
  showUserFormButton?: boolean,
  locale?: "es" | "en" | "ca" | "de",
  walletTranslations?: { yourWallet: string; walletSettings: string }
}) =>{
    const thirdwebLocale = mapToThirdwebLocale(locale);
    const currentLocale = useLocale() as "es" | "en" | "ca" | "de";
    const t = useTranslations("errors.predefined");
    const [img, setImg] = useState<string|undefined>(initialUser?.img || undefined)
    const [user, setUser] = useState<User | null>(initialUser)
    const [isLogged, setIsLogged] = useState(!!initialUser)

    /**
     * Helper para mostrar toast de errores de autenticación
     * @param error - Error capturado
     * @param fallbackKey - Clave de traducción de fallback (logout, checkLogin, generatePayload)
     */
    const showAuthErrorToast = (error: unknown, fallbackKey: string) => {
      try {
        const serializedError = analyzeError(error);
        
        // Si no es error silencioso ('d'), mostrar toast
        if (serializedError.description.es !== 'd') {
          toast.error(serializedError.title[currentLocale], {
            description: serializedError.description[currentLocale],
            icon: getErrorIcon(serializedError.iconType)
          });
        }
      } catch (analyzeErr) {
        // Fallback: usar traducciones predefinidas
        toast.error(t(`${fallbackKey}.title`), {
          description: t(`${fallbackKey}.description`)
        });
      }
    };

    const loadUserData = async () => {
      try {
        const logged = await isLoggedIn()
        setIsLogged(logged)
        if (logged) {
          const userData = await getUserData()
          if (userData) {
            setUser(userData)
            setImg(userData.img || undefined)
          }
        }
      } catch (error) {
        // Error al cargar datos, mostrar toast
        showAuthErrorToast(error, "checkLogin");
      }
    }

    useEffect(() => {
      // Solo cargar si no hay usuario inicial
      if (!initialUser) {
        loadUserData()
      }
    }, [initialUser])

    return(
      <div suppressHydrationWarning className={cn("flex gap-2 items-center", wrapperClassName)}>
        {showUserFormButton && isLogged && user && (
          <UserFormDialog 
            user={user}
            buttonLabelVariant="outline"
            buttonLabelClass="w-10 px-0"
            onUserUpdate={loadUserData}
          />
        )}
        <ConnectButton
        client={client}
        wallets={wallets}
        connectModal={{
            size: "compact",
            showThirdwebBranding: false,
          }}
        locale={thirdwebLocale}
        detailsModal={{
            footer: () => <div className="w-full text-2xl"><p>SKRT👾</p></div>,
            hideSwitchWallet: true,
            hideDisconnect: false,
            connectedAccountAvatarUrl: img
        }}
        connectButton={{ 
          label: connectButtonLabel, 
          style:{
            height:  "2.25rem",
            width: "100%",
            borderRadius: "0.25rem",
            fontSize: "0.875rem",
            lineHeight:  "1.25rem",
          }, 
          className: "bg-background hover:shadow-xl hover:shadow-primary h-9 px-4 py-2 " 
        }}
        detailsButton={{
          render: () => (
            <div className={cn(buttonVariants({ variant: "outline" }),"w-full px-2")}>
              <Wallet width={20} height={20} />
              <span className="inline-block sm:hidden px-2">{walletTranslations.yourWallet}</span>
              <p className="hidden sm:sr-only">{walletTranslations.walletSettings}</p>
            </div>
          ),
        }}
        auth={{
            isLoggedIn: async (address: string) => {
                console.info("check if logged in: ", {address})
                try {
                  return await isLoggedIn()
                } catch (error) {
                  showAuthErrorToast(error, "checkLogin");
                  return false;
                }
            },
            doLogin: async (params: unknown) => {
                console.info("logging in!")
                try {
                  const loginResult = await login(params as Parameters<typeof login>[0])
                  if (loginResult && loginResult.userData) {
                    setUser(loginResult.userData)
                    setImg(loginResult.userData.img || undefined)
                    setIsLogged(true)
                  }
                } catch(error) {
                  // Mostrar toast de error
                  showAuthErrorToast(error, "loginError");
                  // Re-lanzar para que Thirdweb maneje el flujo
                  throw error;
                }
            },
            getLoginPayload: async ({ address }: { address: string }) => {
                try {
                  return await generatePayload({ address });
                } catch (error) {
                  showAuthErrorToast(error, "generatePayload");
                  throw error;
                }
            },
            doLogout:async () => {
              try {
                await fetch('/api/logout', { method: 'GET' });
                setIsLogged(false)
                setUser(null)
              } catch (error) {
                showAuthErrorToast(error, "logout");
              }
            }
        }}
        />
      </div>
    )
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ThirdwebClient } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { Wallet } from "lucide-react";

import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import type { AuthHandlers, LogUser, UserActionRenderer } from "../../lib/types";
import { getThirdwebClient } from "./thirdweb-client";

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

export type CustomConnectButtonProps = {
  authHandlers: AuthHandlers;
  connectButtonLabel?: string;
  initialUser?: LogUser | null;
  wrapperClassName?: string;
  userActionSlot?: UserActionRenderer;
  onLoginRedirect?: (address?: string) => void;
  thirdwebClient?: ThirdwebClient;
  thirdwebClientId?: string;
  showUserActionSlot?: boolean;
};

export function CustomConnectButton({
  authHandlers,
  connectButtonLabel = "Iniciar sesión",
  initialUser = null,
  wrapperClassName,
  userActionSlot,
  onLoginRedirect,
  thirdwebClient,
  thirdwebClientId,
  showUserActionSlot = true,
}: CustomConnectButtonProps) {
  const [user, setUser] = useState<LogUser | null>(initialUser);
  const [img, setImg] = useState<string | undefined>(initialUser?.img ?? undefined);
  const [isLogged, setIsLogged] = useState(Boolean(initialUser));

  const client = getThirdwebClient({ client: thirdwebClient, clientId: thirdwebClientId });

  const loadUserData = useCallback(async () => {
    try {
      const logged = await authHandlers.isLoggedIn();
      setIsLogged(logged);
      if (logged) {
        const userData = await authHandlers.getUserData();
        if (userData) {
          setUser(userData);
          setImg(userData.img ?? undefined);
        }
      }
    } catch (error) {
      console.error("CustomConnectButton:isLoggedIn", error);
    }
  }, [authHandlers]);

  useEffect(() => {
    if (!initialUser) {
      void loadUserData();
    }
  }, [initialUser, loadUserData]);

  const handleRedirect = useCallback(
    (address?: string) => {
      if (onLoginRedirect) {
        onLoginRedirect(address);
        return;
      }
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    },
    [onLoginRedirect]
  );

  const renderUserSlot = useMemo(() => {
    if (!showUserActionSlot || !userActionSlot || !user) {
      return null;
    }
    return typeof userActionSlot === "function"
      ? userActionSlot(user, { refreshUser: loadUserData, isLoggedIn })
      : userActionSlot;
  }, [showUserActionSlot, userActionSlot, user, loadUserData, isLogged]);

  return (
    <div suppressHydrationWarning className={cn("flex items-center gap-2", wrapperClassName)}>
      {renderUserSlot}
      <ConnectButton
        client={client}
        wallets={wallets}
        connectModal={{
          size: "compact",
          showThirdwebBranding: false,
        }}
        locale="es_ES"
        detailsModal={{
          footer: () => (
            <div className="w-full text-2xl">
              <p>SKRT👾</p>
            </div>
          ),
          hideSwitchWallet: true,
          hideDisconnect: false,
          connectedAccountAvatarUrl: img,
        }}
        connectButton={{
          label: connectButtonLabel,
          style: {
            height: "2.25rem",
            width: "100%",
            borderRadius: "0.25rem",
            fontSize: "0.875rem",
            lineHeight: "1.25rem",
          },
          className: "bg-background hover:shadow-xl hover:shadow-primary h-9 px-4 py-2",
        }}
        detailsButton={{
          render: () => (
            <Button variant="outline" className="w-full px-2">
              <Wallet width={20} height={20} />
              <span className="inline-block sm:hidden px-2">Tu cartera</span>
              <p className="hidden sm:sr-only">Configuración de tu cartera</p>
            </Button>
          ),
        }}
        auth={{
          isLoggedIn: async () => {
            try {
              return await authHandlers.isLoggedIn();
            } catch (error) {
              console.error("CustomConnectButton:isLoggedIn", error);
              return false;
            }
          },
          doLogin: async (params) => {
            const loginResult = await authHandlers.login(params);
            if (loginResult && "userData" in loginResult && loginResult.userData) {
              setUser(loginResult.userData);
              setImg(loginResult.userData.img ?? undefined);
              setIsLogged(true);
            } else {
              setIsLogged(true);
            }
            handleRedirect(typeof params === "object" && params ? (params as { address?: string }).address : undefined);
          },
          getLoginPayload: async ({ address }) => authHandlers.generatePayload({ address }),
          doLogout: async () => {
            if (authHandlers.logout) {
              await authHandlers.logout();
            }
            setIsLogged(false);
            setUser(null);
          },
        }}
      />
    </div>
  );
}

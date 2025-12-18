"use client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { resendVerificationEmail } from "@log-ui/core/presentation/controllers/user";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

type User = {
  id: string;
  nick: string | null;
  img: string | null;
  email: string | null;
  address: string;
  role: string | null;
  isVerified: boolean;
}

export const VerificacionEmailAlert = ({ user }: { user: User }) => {
    const t = useTranslations('userProfile');
    const [loading, setLoading] = useState(false);
    const [lastSent, setLastSent] = useState<number | null>(null);

    // Cargar la fecha del último envío desde localStorage
    useEffect(() => {
        const storedLastSent = localStorage.getItem('lastSent');
        if (storedLastSent) {
            setLastSent(Number(storedLastSent));
        }
    }, []);

    const canShowAlert = () => {
        if (lastSent) {
            const now = Date.now();
            return now - lastSent >= 30 * 60 * 1000; // 30 minutos
        }
        return true; // Si nunca se ha enviado, se puede mostrar
    };

    const showAlert = !user.isVerified && user.email;

    if (showAlert) {
        if (canShowAlert()) {
            const userI = {
                id: user.id,
                email: user.email as string
            };

            const handleResend = async () => {
                setLoading(true);
                try {
                    await resendVerificationEmail(userI);
                    const currentTime = Date.now();
                    setLastSent(currentTime);
                    localStorage.setItem('lastSent', currentTime.toString());
                } catch (error) {
                    // Error is already handled by the controller with DomainError
                    throw error;
                } finally {
                    setLoading(false);
                }
            };

            return (
                <Alert className="bg-yellow/10 border-accent">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t('emailNotVerified')}</AlertTitle>
                    <AlertDescription>
                        {t('clickToVerify')}
                        <Button
                            className="align-end"
                            onClick={handleResend}
                            variant={"outline"}
                            disabled={loading}
                        >
                            {loading ? t('sending') : t('receiveValidationEmail')}
                        </Button>
                    </AlertDescription>
                </Alert>
            );
        } else {
            // Mostrar un alert diferente si no ha pasado el tiempo
            return (
                <Alert className="bg-gray/10 border-gray">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{t('verificationEmailSent')}</AlertTitle>
                    <AlertDescription>
                        {t('checkInbox')}
                    </AlertDescription>
                </Alert>
            );
        }
    }

    return null;
};

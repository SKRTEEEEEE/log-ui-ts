"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/lib/i18n/routing";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function LocalSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const localActive = useLocale();
  const pathname = usePathname();
  const t = useTranslations("root");

  const onSelectChange = (nextLocale: string) => {
    startTransition(() => {
      // Use window.location for full page reload to preserve cookies/session
      window.location.href = `/${nextLocale}${pathname}`;
    });
  };

  const languages = [
    { value: "es", label: "Español" },
    { value: "ca", label: "Català" },
    { value: "en", label: "English" },
    { value: "de", label: "Deutsch" },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="text-accent"
          aria-label="Change Language"
        >
          <Languages className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold mb-2">{t("lang")}</h3>
          {languages.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onSelectChange(value)}
              disabled={isPending}
              className={`w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-accent hover:text-accent-foreground ${
                isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              } ${value === localActive ? "bg-accent/50" : ""}`}
            >
              <Avatar className="h-5 w-5">
                <AvatarImage
                  src={`/comm/logo-${value}.png`}
                  alt={`${label} flag`}
                />
                <AvatarFallback className="text-xs">{value.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>{label}</span>
              {value === localActive && (
                <span className="ml-auto text-accent font-black">✓</span>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
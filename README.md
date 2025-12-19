# Log Ui Ts

> *Submodule compartido para unificar componentes, autenticación y core entre micro-frontend's Next.js*

## ⚙️ Requisitos
App Router (Next.js 15+), Node 18+, Tailwind CSS 4 con shadcn/ui configurado 🚀

### 📦 Domain Package
Este submodule depende de `@skrteeeeee/profile-domain` para tipos de dominio compartidos. **Importante:** El package NO se instala en log-ui-ts sino en el proyecto host que lo usa (ej: admin-next, agora-next).

**Configurar en el proyecto host:**
```bash
# 1. Crear .npmrc en la raíz del proyecto
echo "@skrteeeeee:registry=https://npm.pkg.github.com" > .npmrc

# 2. Instalar el package
npm install @skrteeeeee/profile-domain

# 3. log-ui-ts usará el package desde node_modules del host
```

**GitHub Token requerido:** Necesitas un token con scope `read:packages`. Sigue las [instrucciones de instalación](https://github.com/SKRTEEEEEE/profile-domain#installation).
### 🎨 Shadcn/ui
Componentes UI necesarios: `button`, `dialog`, `dropdown-menu`, `navigation-menu`, `popover`, `avatar`, `sheet`, `separator`, `input`, `form`, `select`, `label`, `alert`, `tabs`. Instala con `npx shadcn@latest add [componente]` para que `@/components/ui/*` resuelva correctamente 🎯
### 🔐 Thirdweb
Env vars requeridas: `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`, `NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN`, `THIRDWEB_ADMIN_PRIVATE_KEY`. Sin ellas el ConnectButton no renderiza 🔐
### 🌈 Tailwind CSS 4
Respeta `@log-ui/lib/globals.css` para tokens de color, gradientes y temas. Rompe diseños sin esta importación 🌈
### 🌓 next-themes
Requerido para toggle de tema y persistencia. Provider debe envolver tu app en el layout raíz 🌓
### 📤 uploadthing
Router en `/api/uploadthing` usando `@log-ui/core/infrastructure/connectors/uploadthing-st`. Auth middleware valida JWT antes de upload 🚀
### 🌍 next-intl
`SiteNavConfig<TPath>` es genérico para soportar tus rutas personalizadas. Define paths en `routing.ts` del host y pásalos al config 🧭
## 🚀 Setup Rápido
### 📦 Dependencias
```bash
npm install thirdweb uploadthing @uploadthing/react next-themes react-hook-form @hookform/resolvers zod
npm install @radix-ui/react-label @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-tabs
```
### 🧩 Submodule
```bash
git submodule add https://github.com/SKRTEEEEEE/log-ui-ts.git log-ui-ts
git submodule update --init --recursive
```
### 🧭 tsconfig.json
```json
"paths": {
  "@/*": ["./src/*"],
  "@log-ui/*": ["./log-ui-ts/*"]
}
```
### 🎨 globals.css
```css
@import "@log-ui/lib/globals.css";
```
### 🪛 Config
- [`<app>/src/lib/log-ui-data.tsx`](#-appsrcliblog-ui-datatsx): Configuración especifica del repositorio
- `<app>/src/data/*/log-ui.json`: Config i18n especifica del repositorio
- `./i18n/*/common.json`: Configuración i18n para 'log-ui'
- `./lib/config/apps-config.ts`: Configuración endpoints que utilizan 'log-ui'
### 🏗️ Core Architecture
- `@log-ui/core`: Domain entities, repos base, flows compartidos (úsalo para tipos y lógica)
- `@/components/ui`: UI components del host (log-ui importa desde aquí)
- `@log-ui/lib/hooks`: Hooks compartidos como `use-media-query`, `use-error-toast`
### 🎛️ Vercel Deploy
```json
{ "installCommand": "git submodule update --init --recursive && npm install" }
```
## 🔧 Uso
Importa controllers con `@log-ui/core/presentation/controllers/*`, componentes con `@log-ui/components/*`, hooks con `@log-ui/lib/hooks/*`, y core con `@log-ui/core/*`. Los componentes de navegación aceptan `SiteNavConfig<TPath>` genérico para tus rutas específicas 🎯

### 🚨 Sistema de Toast para Errores
El hook `useErrorToast` detecta automáticamente errores `DomainError` y muestra toasts con i18n según el `friendlyDesc`:

**Comportamiento según `friendlyDesc`:**
- `'d'` → NO muestra toast (error silencioso para logs)
- `'tryAgainOrContact'` | `'credentials'` | `'credentials--mock'` → usa i18n predefinido
- `IntlBase` (objeto con es/en/ca/de) → muestra mensaje directo multiidioma
- `undefined` → muestra mensaje genérico "Ups, ha ocurrido un error"

**NOT RECOMMENDED - Uso directo (sin hook)**
```tsx
import { showErrorToast } from "@log-ui/lib/hooks";
import { useLocale, useTranslations } from "next-intl";

try {
  await someAction();
} catch (error) {
  showErrorToast(error as DomainError, locale, t);
}
```
**NOT RECOMMENDED - Uso directo (con hook)**
```tsx
"use client";
import { useState } from "react";
import { useErrorToast } from "@log-ui/lib/hooks";
import type { DomainError } from "@skrteeeeee/profile-domain";

export function MyComponent() {
  const [error, setError] = useState<DomainError | null>(null);
  
  // Detecta y muestra toast automáticamente según friendlyDesc
  useErrorToast(error);

  const handleAction = async () => {
    try {
      await someAction();
    } catch (err) {
      setError(err as DomainError);
    }
  };
}
```
**SE RECOMIENDA UTILIZAR DomainError con el método `createDomainError`**
### 🔶 `<app>/src/lib/log-ui-data.tsx`
#### Nav - 'fast links'
```ts
const siteConfig: {
    name: string;
    description: string;
    icon: JSX.Element;
    //endpoints que se muestran
    // i18n -> nav.{localeRoute.id}
    paths: {
        id: string;
        path: string;
    }[];
}
```
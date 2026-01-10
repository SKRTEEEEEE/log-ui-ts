# Configuración de Nuevos Micro-Frontends en `log-ui-ts`

Para integrar un nuevo micro-frontend con `log-ui-ts`, sigue estos pasos:

## 1. Actualizar `APPS_CONFIG`

Define tu nueva aplicación en `log-ui-ts/lib/config/apps-config.ts` dentro del array `APPS_CONFIG`.
Cada entrada requiere un `id` único y las `url` de `dev` y `prod`.

```typescript
// log-ui-ts/lib/config/apps-config.ts
export const APPS_CONFIG: AppConfig[] = [
  // ...
  {
    id: "yourAppId",
    url: {
      dev: "http://localhost:XXXX",
      prod: "https://your-app.example.com",
    },
  },
];
```

## 2. Funcionamiento de `getCurrentApp()`

La función `getCurrentApp()` detecta la app actual dinámicamente.
-   **SSR:** Usa `process.env.NEXT_PUBLIC_BASE_URL`. Configura `NEXT_PUBLIC_BASE_URL` en tu `.env`.
-   **Cliente:** Usa `window.location.origin`.
No necesitas modificar `getCurrentApp()` directamente; se basa en `APPS_CONFIG`.

## 3. Configuración en `src/lib/log-ui-data.tsx` del Micro-Frontend

Cada micro-frontend debe configurar `siteConfig` para `log-ui-ts` (ej., para el `SiteHeader`).
Este archivo, `src/lib/log-ui-data.tsx`, define el nombre, ícono y rutas de navegación específicas de tu aplicación.

```typescript
// src/lib/log-ui-data.tsx (en tu micro-frontend)
import { SiteHeaderConfig } from "@log-ui/lib/config/apps-config";
import Image from "next/image";

export const siteConfig: SiteHeaderConfig = {
  name: "Nombre de tu App",
  icon: <Image src="/path/to/icon.ico" alt="Icono" width={24} height={24} />,
  paths: [
    { id: "home", path: "/" },
    // ... más rutas específicas de tu app
  ],
};
```

## 4. `package.json` y `peerDependencies`

El submódulo `log-ui-ts` contiene un `package.json` que **actúa como un "contrato-documento"**, no como un gestor de dependencias tradicional.

-   **`peerDependencies`**: Define las librerías y versiones que `log-ui-ts` **espera** que el proyecto anfitrión (ej. `admin-next`) le proporcione.
-   **No se valida automáticamente**: Debido a que `log-ui-ts` es un submódulo local, `npm` no verifica si el proyecto host cumple con estas `peerDependencies`.
-   **Responsabilidad del desarrollador**: Es **obligación** del desarrollador asegurarse de que el `package.json` del proyecto host tiene instaladas las dependencias y versiones que `log-ui-ts` declara en su `package.json`.

Este enfoque solo lograría la validación automática si `log-ui-ts` se publicara como un paquete de `npm` y se instalara formalmente en el proyecto host.

## 5. Testing y Cobertura

`log-ui-ts` utiliza una configuración de Vitest independiente para garantizar la calidad del código sin interferir con la configuración global del proyecto.

- **Configuración:** `vitest.config.log-ui-ts.ts` (ubicado en la raíz). Define los alias `@log-ui`, el entorno `jsdom` y los umbrales de cobertura.
- **Comandos:**
  - `npm run vitest:run:l-ui`: Ejecuta los tests unitarios.
  - `npm run vitest:cov:l-ui`: Ejecuta los tests con reporte de cobertura.
- **Umbrales:** Se ha establecido un umbral del **20%** de cobertura en funciones, líneas y ramas para asegurar que el submódulo mantenga un estándar mínimo de calidad.

## 6. Consideraciones Finales

-   Asegura que `NEXT_PUBLIC_BASE_URL` esté definida y coincida con las URLs en `APPS_CONFIG`.
-   Ejecuta `npm run test:cov` para verificar la configuración.

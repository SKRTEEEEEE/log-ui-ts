# Guía Rápida: Manejo de Errores en Admin-Next
## 🎯 Regla de Oro

**SIEMPRE usar `throw createDomainError()` en TODAS las capas**

⚠️ **IMPORTANTE:** `createDomainError` **SOLO CREA** el error, **NO lo lanza automáticamente**.  
**SIEMPRE debes usar `throw`** antes de `createDomainError()`.

```typescript
// ❌ INCORRECTO - Solo crea el error pero no lo lanza
createDomainError(ErrorCodes.DATABASE_FIND, MyClass, "functionName", friendlyDesc, meta);

// ✅ CORRECTO - Crea Y lanza el error
throw createDomainError(
  ErrorCodes.DATABASE_FIND,
  MyClass,
  "functionName",
  friendlyDesc,  // ← CLAVE: Define el comportamiento
  meta
);
```

---

## 📋 El `friendlyDesc` Decide Todo

| Valor | Comportamiento | Cuándo Usar |
|-------|----------------|-------------|
| `undefined` | ❌ ErrorBoundary (rompe la página) | Servidor completamente caído |
| `'d'` | 🔇 Silencioso (solo logs) | Errores esperados/internos |
| `'tryAgainOrContact'` | ✅ Toast predefinido + icono | Error servidor genérico |
| `'credentials'` | ✅ Toast predefinido + icono | Error de autenticación |
| `IntlBase` | ✅ Toast personalizado + icono | **Casos específicos** |

---

## 🎨 Sistema de Toast con Título + Descripción + Icono

Todos los errores muestran un toast con:
- **Título**: Contexto del error (ej: "Error del servidor")
- **Descripción**: Mensaje detallado (ej: "Inténtalo de nuevo más tarde...")
- **Icono**: Visual automático según tipo de error

### Iconos Automáticos

| Tipo de Error | String/Detección | Icono | Cuándo se usa |
|---------------|------------------|-------|---------------|
| Credenciales | `'credentials'` o `meta.desc.es === 'Credenciales inválidas'` | 🛡️ ShieldX | Errores de autenticación |
| Servidor/Red | `'tryAgainOrContact'` o texto incluye "servidor"/"Inténtalo de nuevo" | 💥 ServerCrash | Errores de conexión o servidor |
| Genérico | IntlBase personalizado sin match | ⚠️ AlertCircle | Otros errores |

**Cómo funciona:**
1. `profile-domain/createDomainError()` expande strings predefinidos → `IntlBase` + `meta.desc`
2. `analyzeError()` detecta el tipo por `meta.desc` o contenido → asigna `iconType`
3. `getErrorIcon()` convierte `iconType` → componente React (solo cliente)

#### Hay que mejorar este sistema, dependerá siempre del tipo de 'friendlyDesc'
---

## ⚡ El Patrón en 4 Pasos

### 1️⃣ **Repository**: Try/catch SOLO para errores de red

⚠️ **Try/catch NO es obligatorio** para errores HTTP (response.ok).  
✅ **Try/catch SÍ es obligatorio** para capturar errores de red (ECONNREFUSED, timeout).

```typescript
async readEjemplo(): Promise<ResFlow<Project[]>> {
  try {
    const response = await fetch(endpoint);
    
    // Error HTTP → throw createDomainError directamente
    if (!response.ok) {
      throw createDomainError(
        ErrorCodes.DATABASE_FIND,
        ProjectApiRepository,
        "readEjemplo",
        "tryAgainOrContact", // ← String predefinido
        { entity: "projects", optionalMessage: `HTTP ${response.status}` }
      );
    }
    
    return response.json();
  } catch (error) {
    // Si ya es DomainError, re-lanzar
    if (error && typeof error === 'object' && 'type' in error) throw error;
    
    // Error de red (ECONNREFUSED, timeout) → Convertir a DomainError
    throw createDomainError(
      ErrorCodes.DATABASE_FIND,
      ProjectApiRepository,
      "readEjemplo",
      { 
        es: "No se pudo conectar con el servidor.",
        en: "Could not connect to server.",
        ca: "No s'ha pogut connectar amb el servidor.",
        de: "Verbindung fehlgeschlagen."
      }, // ← IntlBase personalizado (se usa como DESCRIPCIÓN)
      { entity: "projects" }
    );
  }
}
```

**⚠️ IMPORTANTE sobre IntlBase personalizado:**
- El `IntlBase` que pasas como 4º parámetro es la **DESCRIPCIÓN** del error
- El **TÍTULO** viene de `meta.desc` (si lo pasas) o será genérico ("Error")
- Para tener título personalizado, usa `meta: { desc: { es: "...", en: "...", ca: "...", de: "..." } }`

**Strings predefinidos disponibles:**
- `'tryAgainOrContact'` → Título: "Error del servidor" + Descripción + icono ServerCrash
- `'credentials'` → Título: "Credenciales inválidas" + Descripción + icono ShieldX
- `'credentials--mock'` → Variante para modo demo

### 2️⃣ **Use Case**: SIEMPRE lanza con `throw createDomainError`

⚠️ **NO olvides el `throw`** - `createDomainError` solo crea el error, no lo lanza.

```typescript
export const getProjectsUC = async (): Promise<Project[]> => {
  const response = await readProjectUC();
  
  if (!response.success) {
    // ✅ CORRECTO - throw + createDomainError
    throw createDomainError(
      ErrorCodes.DATABASE_FIND,
      getProjectsUC,
      "getProjectsUC",
      {
        es: "No se pudieron cargar los proyectos.",
        en: "Could not load projects.",
        ca: "No s'han pogut carregar els projectes.",
        de: "Projekte konnten nicht geladen werden."
      }, // ← IntlBase (se usa como DESCRIPCIÓN del error)
      { entity: "projects" }
    );
  }
  
  return response.data;
};
```

**💡 Tip:** Si quieres título personalizado, agrégalo en `meta.desc`:
```typescript
throw createDomainError(
  ErrorCodes.DATABASE_FIND,
  getProjectsUC,
  "getProjectsUC",
  { es: "Los proyectos no están disponibles.", en: "Projects unavailable.", ca: "...", de: "..." },
  { 
    entity: "projects",
    desc: { es: "Error de proyectos", en: "Projects error", ca: "...", de: "..." } // ← Título
  }
);
```

### 3️⃣ **Server Component**: Try/Catch + Analiza + Render Fallback

```typescript
export async function ProjectsSection({ locale }) {
  const t = await getTranslations("admin");
  
  try {
    const projects = await getProjectsUC();
    return <ProjectsGrid projects={projects} />;
    
  } catch (error) {
    // analyzeError lanza automáticamente si: no es DomainError o friendlyDesc === undefined
    const serializedError = analyzeError(error);
    
    // friendlyDesc === 'd' → Silencioso (solo empty state, sin toast)
    if (serializedError.description.es === 'd') {
      return <EmptyState />;
    }
    
    // friendlyDesc !== undefined → Render fallback con toast
    return (
      <SectionFallbackProvider error={serializedError}>
        <div className="empty-state">{t("projects.empty")}</div>
      </SectionFallbackProvider>
    );
  }
}
```

**Override opcional (título y/o descripción):**
```typescript
// Override solo descripción
const serializedError = analyzeError(error, undefined, {
  es: "No se pudieron cargar los proyectos en este momento.",
  en: "Could not load projects at this time.",
  ca: "No s'han pogut carregar els projectes ara.",
  de: "Projekte konnten jetzt nicht geladen werden."
});

// Override título y descripción
const serializedError = analyzeError(
  error,
  { es: "Error crítico", en: "Critical error", ca: "Error crític", de: "Kritischer Fehler" },
  { es: "Contacta soporte", en: "Contact support", ca: "Contacta suport", de: "Support kontaktieren" }
);
```

### 4️⃣ **Client Fallback**: `SectionFallbackProvider` (Componente Genérico)

**Componente reutilizable:** `log-ui-ts/components/section-fallback-provider.tsx`

```typescript
"use client";
import type { ReactNode } from "react";
import { useToastOnce } from "@log-ui/lib/hooks/use-toast-once";
import type { SerializedError } from "@log-ui/lib/error-serialization";

export function SectionFallbackProvider({ 
  children, 
  error 
}: { 
  children: ReactNode; 
  error: SerializedError;
}) {
  // useToastOnce maneja automáticamente:
  // - Título + Descripción (según locale)
  // - Icono dinámico
  // - Solo se muestra una vez
  useToastOnce(error);
  
  return <>{children}</>;
}
```

**Uso:**
```typescript
// En Server Component
return (
  <SectionFallbackProvider error={serializedError}>
    {/* Cualquier UI: empty state, skeleton, mensaje custom */}
    <div className="empty-state">No hay proyectos disponibles</div>
  </SectionFallbackProvider>
);
```

**`useToastOnce` soporta 2 modos:**

```typescript
// Modo 1: SerializedError completo (título + descripción + icono)
useToastOnce(serializedError);

// Modo 2: IntlBase simple (solo mensaje, sin título personalizado)
useToastOnce({
  es: "Operación exitosa",
  en: "Operation successful",
  ca: "Operació exitosa",
  de: "Vorgang erfolgreich"
});
```

---

## ✅ Checklist por Capa

| Capa | Acción |
|------|--------|
| **Repository** | `try/catch` + `createDomainError` (string predefinido o IntlBase) |
| **Use Case** | `createDomainError` con IntlBase OBLIGATORIO |
| **Server Component** | `try/catch` + `analyzeError` + `<SectionFallbackProvider>` |
| **Client Fallback** | Usar `<SectionFallbackProvider>` genérico |

---

## 📦 Componentes Disponibles

### **1. `analyzeError(error, overrideTitle?, overrideDescription?)`**
Analiza un DomainError y devuelve SerializedError con:
- Título (IntlBase)
- Descripción (IntlBase)
- Icono (React.ReactNode opcional)

### **2. `<SectionFallbackProvider error={serializedError}>`**
Componente genérico que:
- Muestra toast automático (título + descripción + icono)
- Renderiza children como UI alternativa

### **3. `useToastOnce(error | message)`**
Hook que muestra toast solo una vez:
- Acepta `SerializedError` completo
- Acepta `IntlBase` simple

---

## 🚀 Iconos Dinámicos

Los errores predefinidos incluyen iconos automáticos:

| String Predefinido | Icono | Título |
|-------------------|-------|--------|
| `'tryAgainOrContact'` | `<ServerCrash />` | "Error del servidor" |
| `'credentials'` | `<ShieldX />` | "Credenciales inválidas" |
| Errores con IntlBase | `<AlertCircle />` | Según `meta.desc` o "Error" |

**Los iconos son de Lucide React y se muestran automáticamente en el toast.**

---

## ❌ Anti-Patrones

```typescript
// ❌ 1. Olvidar el throw (ERROR MÁS COMÚN)
if (!response.ok) {
  createDomainError(...); // ← Solo crea, NO lanza el error
}
// ✅ CORRECTO
if (!response.ok) {
  throw createDomainError(...); // ← Crea Y lanza
}

// ❌ 2. fetch sin try/catch cuando NECESITAS capturar errores de red
async readData() {
  const response = await fetch(...); // Si falla la conexión → TypeError no controlado
  return response.json();
}
// ✅ CORRECTO (solo si necesitas errores de red)
async readData() {
  try {
    const response = await fetch(...);
    if (!response.ok) throw createDomainError(...);
    return response.json();
  } catch (error) {
    if (isDomainError(error)) throw error;
    throw createDomainError(..., { es: "No se pudo conectar...", ... });
  }
}

// ❌ 3. return [] en use case en lugar de throw
if (!response.success) return [];

// ❌ 4. friendlyDesc sin i18n (string simple sin traducción)
throw createDomainError(..., "Error loading data", ...);

// ❌ 5. Crear fallback específico en lugar de usar SectionFallbackProvider
export function MySpecificFallback({ error }) { ... }

// ❌ 6. throw new Error (NO usar Error nativo)
throw new Error("Something failed");

// ❌ 7. useEffect en lugar de useToastOnce
useEffect(() => { toast.error(message); }, []);

// ❌ 8. Pensar que IntlBase es el título (es la DESCRIPCIÓN)
throw createDomainError(
  ...,
  { es: "Este será el título", en: "This will be the title" }, // ← NO, es la descripción
  { entity: "data" }
);
```

---

## 🎯 Resumen Ultra-Corto

1. **Repository** → `try/catch` solo para errores de red + **`throw createDomainError`**
2. **Use Case** → **`throw createDomainError`** con IntlBase
3. **Server Component** → `try/catch` + `analyzeError` + `<SectionFallbackProvider>`
4. **Client Fallback** → Usar `<SectionFallbackProvider>` genérico (no crear específicos)

**⚠️ REGLAS CRÍTICAS:**
- **SIEMPRE usar `throw`** antes de `createDomainError` (NO lanza automáticamente)
- El IntlBase en `createDomainError` es la **DESCRIPCIÓN**, NO el título
- El **TÍTULO** viene de `meta.desc` o será genérico ("Error")
- Try/catch en repository solo para errores de **RED**, no para HTTP

---

## 📝 Ejemplo Completo con Explicaciones

```typescript
// 1. Repository - Try/catch para errores de RED
async readProjects(): Promise<ResFlow<Project[]>> {
  try {
    const response = await fetch(endpoint);
    
    // Error HTTP → throw createDomainError (NO necesita try/catch para esto)
    if (!response.ok) {
      throw createDomainError(
        ErrorCodes.DATABASE_FIND,
        ProjectApiRepository,
        "readProjects",
        "tryAgainOrContact", // ← Predefinido: título + descripción + icono
        { entity: "projects" }
      );
    }
    
    return response.json();
  } catch (error) {
    // Si ya es DomainError, re-lanzar
    if (isDomainError(error)) throw error;
    
    // Error de red → Convertir a DomainError
    throw createDomainError(
      ErrorCodes.DATABASE_FIND,
      ProjectApiRepository,
      "readProjects",
      { 
        es: "No se pudo conectar con el servidor.", 
        en: "Could not connect to server.",
        ca: "No s'ha pogut connectar amb el servidor.",
        de: "Verbindung fehlgeschlagen."
      }, // ← Este IntlBase es la DESCRIPCIÓN (no el título)
      { 
        entity: "projects",
        desc: { 
          es: "Error de conexión", 
          en: "Connection error",
          ca: "Error de connexió",
          de: "Verbindungsfehler"
        } // ← Esto es el TÍTULO
      }
    );
  }
}

// 2. Use Case - SIEMPRE throw createDomainError
export const getProjectsUC = async (): Promise<Project[]> => {
  const response = await readProjects();
  
  if (!response.success) {
    // ⚠️ NO olvides el throw
    throw createDomainError(
      ErrorCodes.DATABASE_FIND,
      getProjectsUC,
      "getProjectsUC",
      { 
        es: "No se pudieron cargar los proyectos.", 
        en: "Could not load projects.",
        ca: "No s'han pogut carregar els projectes.",
        de: "Projekte konnten nicht geladen werden."
      }, // ← DESCRIPCIÓN
      { entity: "projects" }
    );
  }
  
  return response.data;
};

// 3. Server Component - analyzeError + override de título
export async function ProjectsSection() {
  try {
    const projects = await getProjectsUC();
    return <ProjectsGrid projects={projects} />;
  } catch (error) {
    // Override del título para contexto específico
    const serializedError = analyzeError(error, {
      es: "Error cargando proyectos",
      en: "Error loading projects",
      ca: "Error carregant projectes",
      de: "Fehler beim Laden der Projekte"
    });
    
    if (serializedError.description.es === 'd') return <EmptyState />;
    
    return (
      <SectionFallbackProvider error={serializedError}>
        <EmptyState />
      </SectionFallbackProvider>
    );
  }
}
```

**Resultado del Toast:**
- **Título**: "Error cargando proyectos" (del override en Server Component)
- **Descripción**: "No se pudo conectar con el servidor." (del repository)
- **Icono**: `<ServerCrash />` (si usó `'tryAgainOrContact'`) o `<AlertCircle />` (si usó IntlBase) ✅

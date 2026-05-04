# Memoria del Proyecto Pay2Peer

## 1. Portada

- **Título:** Pay2Peer — Plataforma segura de transferencias y monedero digital
- **Autor:** Alejo Viñeta
- **Ciclo:** ASIR con especialización en Ciberseguridad
- **Fecha de entrega Fase 1:** 18/12/2025
- **Fecha de entrega Fase 2:** 5/05/26
- **Versión:** 2.0

---

## 2. Resumen ejecutivo

Pay2Peer es una aplicación web fintech de cartera y transferencia de dinero entre usuarios, desarrollada como proyecto de fin de ciclo de ASIR con especialización en Ciberseguridad. Funciona de forma similar a PayPal: permite registrarse, añadir fondos mediante tarjeta (Stripe), enviar dinero a otros usuarios, solicitar dinero y consultar el historial de transacciones.

El proyecto se ha desarrollado en dos fases. La primera entregó un MVP funcional. La segunda fase, cuyo objetivo era llevar el proyecto a un estado de producción seguro y conforme a la normativa europea, ha abarcado: securización completa según OWASP Top 10, cumplimiento LOPD/GDPR, implementación de una blockchain privada PoA para auditoría de transacciones, autenticación de dos factores (2FA/TOTP), suite de tests E2E con 149 pruebas, y despliegue en producción con Docker Compose, Nginx y Cloudflare en un servidor propio.

---

## 3. Índice

1. Portada  
2. Resumen ejecutivo  
3. Índice  
4. Introducción  
5. Objetivos  
6. Arquitectura del sistema  
7. Funcionalidades implementadas  
8. Seguridad  
9. Cumplimiento legal (LOPD/GDPR)  
10. Blockchain PoA  
11. Testing  
12. Despliegue e infraestructura  
13. Conclusiones  
14. Trabajo futuro  

---

## 4. Introducción

Este proyecto se inició para el curso de ASIR con especialización en ciberseguridad como proyecto de fin de ciclo. La idea parte de un proyecto de aprendizaje de React anterior en el que solo se creó un MVP básico sin seguridad ni infraestructura. Este ciclo dio la oportunidad de completarlo, combinando conocimientos de desarrollo web con sistemas, redes y ciberseguridad para llevarlo a producción.

El proyecto se divide en dos fases. La Fase 1 (entregada el 18/12/2025) cubría el MVP funcional: autenticación, wallets, transferencias entre usuarios, integración con Stripe y despliegue básico. La Fase 2 (entregada en abril de 2026) tiene como alcance securizar la aplicación según estándares europeos, asegurar el cumplimiento de la LOPD/GDPR, implementar auditoría de transacciones mediante blockchain privada, añadir autenticación de dos factores, escribir una suite completa de tests E2E y desplegar la aplicación en producción con una infraestructura robusta.

---

## 5. Objetivos

### Objetivo general
Construir una aplicación fintech segura, conforme a los requisitos legales de la Unión Europea, desplegada en producción y con trazabilidad criptográfica de todas las transacciones.

### Objetivos Fase 1 (alcanzados)
- Registro e inicio de sesión con JWT
- Wallets por usuario
- Transferencias P2P entre usuarios
- Integración con Stripe para añadir fondos
- Historial de transacciones
- Solicitudes de dinero entre usuarios
- Cola de mensajes con RabbitMQ

### Objetivos Fase 2 (alcanzados)
- Remediación de 15 vulnerabilidades de seguridad identificadas en análisis STRIDE
- Cumplimiento LOPD/GDPR: consentimiento informado, derecho al olvido, portabilidad de datos
- Blockchain privada PoA (Proof of Authority) con SHA-256 y firma Ed25519
- Autenticación de dos factores (TOTP / RFC 6238)
- Rate limiting en 4 niveles (global, auth, password-reset, pagos)
- RBAC (control de acceso basado en roles): user, admin, support
- Logging estructurado con Winston (eventos de seguridad, errores, webhooks)
- Suite de tests E2E: 149 tests en 13 suites con Jest
- Despliegue en producción: VM propia + Docker Compose + Nginx + Cloudflare

---

## 6. Arquitectura del sistema

### Visión general

```
Internet → Cloudflare (CDN + HTTPS + WAF) → Nginx (reverse proxy)
                                              ├── Frontend (Next.js :3000)
                                              └── Backend API (Express :5000)
                                                     ├── MongoDB :27017
                                                     └── RabbitMQ :5672
```

Todo el tráfico pasa por Cloudflare, que proporciona TLS, protección DDoS y caché de activos estáticos. Nginx actúa como reverse proxy que enruta `/api/*` al backend y el resto al frontend. Todos los servicios corren en contenedores Docker gestionados con Docker Compose.

### Frontend

- **Framework:** Next.js 15 (React 19) con TypeScript
- **CSS:** Tailwind CSS — evita conflictos de cascadas en componentes y reduce el tamaño del bundle
- **Gráficas:** Recharts para histogramas de transacciones en el dashboard
- **Pagos:** react-stripe-js para el formulario de tarjeta (Stripe Elements)
- **Autenticación:** JWT almacenado en memoria (a través de `AuthContext`); las rutas del dashboard están protegidas con un guard en el layout
- **2FA:** Formulario de código TOTP al hacer login cuando el usuario tiene 2FA activo; página de configuración con QR en ajustes de cuenta

### Backend

- **Framework:** Express.js 5 con Node.js 22 (Alpine)
- **Base de datos:** MongoDB 4.4 con Mongoose — elegido por la flexibilidad en un desarrollo iterativo
- **Autenticación:** `express-jwt` para validación de tokens; bcrypt (EksBlowfish) para contraseñas; refresh tokens en BD con rotación
- **Validación:** `express-validator` en todos los endpoints de entrada de datos
- **Pagos:** Stripe API — PaymentIntents para depósitos, webhook con verificación de firma para eventos asíncronos
- **Email:** SendGrid — registro, recuperación de contraseña, notificaciones de transacciones, alertas de disputas
- **Cola de mensajes:** RabbitMQ — buffer para peticiones en picos de carga
- **Logging:** Winston con niveles estructurados; eventos de seguridad, transacciones y errores persisten en archivos de log
- **Blockchain:** Cadena privada PoA integrada, persiste en MongoDB (`blocks` collection)

### Base de datos — esquemas principales

| Colección | Campos clave |
|---|---|
| `users` | name, email, password (bcrypt), role, twoFactorSecret, twoFactorEnabled, stripeAccountId |
| `wallets` | author (ref User), funds (€ formateado), frozen, paymentMethod |
| `transactions` | sender, receiver, amount, stripeSender, date, blockchainRef |
| `blocks` | index, hash, previousHash, transactions, signature, timestamp |
| `userconsents` | userId, privacyPolicyAccepted, termsOfServiceAccepted, ipAddress, userAgent, date |
| `resettokens` | userId, token (hash), expiresAt |

---

## 7. Funcionalidades implementadas

### Autenticación y sesión
- Registro con validación de email, contraseña fuerte y consentimiento obligatorio (LOPD)
- Login con respuesta genérica (prevención de enumeración de usuarios)
- JWT de acceso (15 min) + refresh token de 7 días con rotación automática
- Recuperación de contraseña por email con token de un solo uso (TTL 1h)
- Autenticación de dos factores TOTP (RFC 6238 / Google Authenticator compatible)
  - Setup: genera secreto, devuelve QR code en data URL
  - Verify: activa 2FA en la cuenta
  - Login flow: login normal devuelve `twoFactorRequired: true` + `tempToken` (5min); el cliente manda el código TOTP para completar el login
  - Disable: desactiva con verificación de código actual

### Wallet y transferencias
- Wallet creada automáticamente al registrarse con saldo €0
- Añadir fondos mediante tarjeta (Stripe PaymentIntents + confirmación en backend)
- Transferencia P2P: busca destinatario por email, verifica fondos, actualiza ambas wallets en transacción atómica, registra en blockchain
- Solicitar dinero: crea una solicitud pendiente; al aceptarla se ejecuta la transferencia automáticamente
- Historial de transacciones paginado con filtrado por tipo (income/outcome)
- Retiro simulado: debita wallet y registra como transacción WITHDRAWAL (sin payout real por requisitos regulatorios de Stripe)

### Dashboard
- Resumen de saldo actual
- Histograma de transacciones (últimos 7 días, ingresos vs gastos)
- Tarjetas de transacciones recientes con paginación
- Perfil de usuario (nombre, avatar, email)

---

## 8. Seguridad

La seguridad de la Fase 2 partió de un análisis STRIDE completo (709 líneas, disponible en `docs/threat-model-STRIDE.txt`) que identificó 15 vulnerabilidades. Todas han sido remediadas.

### Vulnerabilidades críticas remediadas

| ID | Categoría STRIDE | Descripción | Solución |
|---|---|---|---|
| S-01/S-02 | Spoofing | JWT sin expiración adecuada | Access token 15min + refresh token 7d con rotación |
| S-03 | Spoofing | Rol leído del token (hardcoded) | Rol se obtiene de MongoDB en cada login/refresh |
| S-04 | Tampering | Webhooks Stripe sin validación de firma | `stripe.webhooks.constructEvent()` con STRIPE_WEBHOOK_SECRET |
| E-01 | Elevation | Endpoints `/me/:id` permitían acceder a datos de otros usuarios | Eliminados, solo `/me` |
| T-03/T-04 | Tampering | Mass assignment en wallet y usuario | Destructuring explícito en todos los controllers |
| I-01 | Info Disclosure | Credenciales RabbitMQ hardcodeadas `guest/guest` | Variables de entorno RABBITMQ_* |
| I-03 | Info Disclosure | Stack traces expuestos en errores 500 | Global error handler middleware |
| I-04 | Info Disclosure | Mensaje de signup revelaba si el email existía | Respuesta genérica `"Account created or already exists"` |
| I-05 | Info Disclosure | Hash de contraseña en respuestas JSON | `toJSON` transform elimina `password` y `twoFactorSecret` |
| I-06 | Info Disclosure | Endpoint blockchain público sin autenticación | JWT protection añadido |
| D-01 | Denial of Service | Sin rate limiting | 4 tier rate limiter (global 200/15min, auth 10/15min, password-reset 3/15min, pagos 20/15min) |
| D-02 | Info Disclosure | `express.static()` en root exponía archivos del proyecto | Reubicado a `/public` |
| R-01 | Repudiation | Sin logging de eventos de seguridad | Winston con eventos AUTH, TRANSACTION, WEBHOOK, SECURITY |
| E-02 | Elevation | Wallet podía quedar en negativo o crearse con fondos | Verificación de conflict 409 + fondos siempre inicializados a €0 |
| E-03/E-04 | Elevation | Sin control de roles | RBAC con `requireRole` middleware + comparaciones estrictas `===` |

### Medidas adicionales de seguridad

- **`x-powered-by` deshabilitado** — no hay información de la tecnología en headers
- **Body size limit** — `express.json({ limit: "100kb" })` para prevenir ataques de payload masivo
- **`express-validator`** en todos los endpoints que reciben datos de usuario
- **Wallet frozen** — las wallets implicadas en una disputa de Stripe se congelan automáticamente, bloqueando transferencias y retiros
- **Refresh token rotation** — cada uso del refresh token genera uno nuevo e invalida el anterior

---

## 9. Cumplimiento legal (LOPD/GDPR)

Implementado en febrero-marzo 2026. Cumple con la Ley Orgánica de Protección de Datos (España) y el GDPR (UE).

### Consentimiento informado (Artículo 6 LOPD / Artículo 7 GDPR)
- El registro requiere aceptar obligatoriamente la Política de Privacidad y los Términos de Servicio
- El backend rechaza el signup con HTTP 400 si `privacyPolicyAccepted !== true` o `termsOfServiceAccepted !== true`
- Se registra en la colección `userconsents`: fecha, hora, IP del cliente y user-agent del navegador

### Derecho al olvido (Artículo 17 GDPR)
`DELETE /api/users/me` ejecuta un borrado en cascada:
1. Elimina registros de consentimiento
2. Revoca todos los refresh tokens (cierra todas las sesiones)
3. Elimina las wallets
4. **Anonimiza las transacciones** (sender/receiver → null, amount queda para integridad del bloque)  
   _Las entradas de blockchain no se eliminan — la integridad de la cadena es un requisito de auditoría_
5. Elimina solicitudes de dinero
6. Elimina la cuenta

### Portabilidad de datos (Artículo 20 GDPR)
`GET /api/users/me/export` devuelve un JSON con todo los datos del usuario:
perfil, consentimientos, wallets, transacciones enviadas y recibidas, solicitudes de dinero.

### Artículos adicionales cubiertos
| Artículo | Descripción | Estado |
|---|---|---|
| Art. 5 | Minimización y propósito | ✅ Solo se recogen nombre, apellido, email |
| Art. 9 | Seguridad | ✅ Bcrypt, JWT, cifrado en tránsito (TLS) |
| Art. 12 | Auditoría | ✅ Winston logger con timestamps |
| Art. 15 | Derecho de acceso | ✅ `GET /api/users/me/export` |
| Art. 17 | Derecho al olvido | ✅ `DELETE /api/users/me` |
| Art. 20 | Portabilidad | ✅ Exportación JSON |
| Art. 25 | Privacy by design | ✅ Contraseñas hasheadas, campos sensibles excluidos de JSON |
| Art. 32 | Seguridad del tratamiento | ✅ Ver sección 8 |

---

## 10. Blockchain PoA

### Propósito
La blockchain privada de Pay2Peer tiene como objetivo proporcionar un **registro inmutable y verificable** de todas las transacciones financieras. No es una blockchain pública ni de criptomonedas: es una ledger de auditoría criptográfica que complementa MongoDB.

### Algoritmos y diseño

- **Hash de bloque:** SHA-256 sobre `(index + previousHash + timestamp + transactions + nonce)`
- **Firma de bloque (Proof of Authority):** Ed25519 — el servidor firma cada bloque con su clave privada; la clave pública se lista como autoridad
- **Prueba de trabajo:** Dificultad configurable (nonce hasta que el hash empiece con N ceros) — en producción se usa dificultad 2 para equilibrar velocidad y seguridad
- **Bloque génesis:** índice 0, `previousHash = "0"`, creado automáticamente si la colección `blocks` está vacía

### Ciclo de vida de un bloque

1. Cada transacción (P2P o Stripe) se añade a `pendingTransactions`
2. Cada 10 segundos, o cuando `pendingTransactions.length >= 10`, se intenta sellar un bloque
3. Se crea un bloque con las transacciones pendientes, se mina (PoW) y se firma (PoA)
4. El bloque se persiste en MongoDB (`blocks` collection)
5. `pendingTransactions` se vacía

### Verificación
`GET /api/blockchain/verify` recalcula todos los hashes de la cadena y verifica las firmas Ed25519 de cada bloque. Devuelve `{ valid: true }` si la cadena es íntegra o describe el bloque corrupto.

### Integración con transacciones
Cada vez que `handleTransaction` (transferencia P2P) o `createStripeTransaction` (depósito) se ejecutan, la transacción se registra tanto en MongoDB como en `blockchain.addTransaction()`. Las transacciones quedan selladas en el próximo bloque.

---

## 11. Testing

### Enfoque
Suite de tests E2E con Jest + Supertest. Cada test lanza el servidor real contra una instancia de MongoMemoryServer (en memoria), sin mocks de base de datos. Los tests de Stripe mockean el cliente de Stripe para no hacer llamadas reales.

### Resultado final: **149 tests — 13 suites — 100% passing**

| Archivo | Descripción | Tests |
|---|---|---|
| `01-auth.test.js` | Registro, login, refresh token, logout | ~15 |
| `02-wallet.test.js` | Balance, fondos, operaciones de wallet | ~10 |
| `03-transactions.test.js` | Transferencias P2P, paginación, historial | ~12 |
| `04-token-lifecycle.test.js` | Expiración de tokens, rotación, revocación | ~8 |
| `05-security.test.js` | OWASP Top 10: mass assignment, endpoints protegidos, enumeración | ~15 |
| `06-rate-limiting.test.js` | Los 4 tiers de rate limiting | ~10 |
| `07-stripe-webhooks.test.js` | Verificación de firma de webhook, prevención de tampering | ~6 |
| `08-rbac.test.js` | Control de acceso por rol (user/admin/support) | ~8 |
| `09-lopd.test.js` | Consentimiento, derecho al olvido, exportación de datos | ~12 |
| `10-blockchain.test.js` | Verificación de cadena, sellado de bloques, integridad | ~10 |
| `11-new-features.test.js` | Solicitudes de dinero, paginación, retiro simulado, freeze/unfreeze | ~15 |
| `12-2fa.test.js` | Setup TOTP, verificación, login flow con tempToken, disable | ~9 |
| `13-stripe-connect.test.js` | Onboarding Connect, status, retiro real, rollback en fallo Stripe | ~15 |

### Detalles técnicos destacados

- **Rate limiter reset entre tests:** cada `beforeEach` llama a `resetAllStores()` del rate limiter para evitar 429 entre tests consecutivos
- **TOTP puro en tests:** implementación RFC 6238 con `crypto` nativo (se evitó `otplib` por incompatibilidad ESM/Jest)
- **Mock de Stripe Connect:** `_setStripeForTesting()` permite inyectar un cliente mock; se restaura en `afterAll`
- **Tests de rollback:** el test de fallo de Stripe Transfer verifica que el saldo del wallet se restaura al valor original

---

## 12. Despliegue e infraestructura

### Stack de producción

| Componente | Tecnología | Versión |
|---|---|---|
| Servidor | VM propia (Linux) | — |
| CDN / HTTPS / WAF | Cloudflare | Free plan |
| Reverse proxy | Nginx | Alpine |
| Orquestación | Docker Compose | v2 |
| Frontend | Next.js en Node | 22-alpine |
| Backend | Express en Node | 22-alpine |
| Base de datos | MongoDB | 4.4 |
| Cola de mensajes | RabbitMQ | 3-management |

### Docker Compose (producción)

Los servicios están organizados en una red interna Docker. Solo Nginx expone puertos al exterior (80 y 443). El backend tiene `read_only: true` con tmpfs en `/tmp` y `/app/logs` para seguridad. Variables de entorno sensibles se gestionan con archivos `.env` fuera del repositorio.

```
nginx:443/80  →  frontend:3000
              →  backend:5000  →  mongo:27017
                              →  rabbitmq:5672
```

### Dominio y certificados

- Dominio: `www.pauoscaralejo.es`
- TLS: gestionado por Cloudflare (certificado automático, modo Full Strict)
- DNS: registros A apuntan al servidor; Cloudflare proxea el tráfico

### CI/CD

No se ha implementado un pipeline CI/CD automatizado. El proceso de despliegue es manual: `scp` de los archivos modificados al servidor y `docker compose build --no-cache && up -d` del servicio afectado.

---

## 13. Conclusiones

La Fase 2 ha cumplido con todos los objetivos planteados. Se ha pasado de un MVP funcional pero inseguro a una aplicación que:

- Tiene securizados sus endpoints según el análisis STRIDE (15/15 vulnerabilidades remediadas)
- Cumple con la LOPD y el GDPR en los aspectos que aplican a un proyecto de este tamaño
- Dispone de un registro de auditoría criptográficamente verificable de todas las transacciones mediante blockchain privada
- Implementa autenticación de dos factores (TOTP) compatible con Google Authenticator
- Está verificada con 149 tests automáticos E2E
- Está desplegada en producción real con un dominio, TLS y CDN

El aprendizaje principal ha sido que la seguridad aplicada es un proceso iterativo: analizar (STRIDE), priorizar, remediar y verificar. Y que muchas de las vulnerabilidades más comunes —mass assignment, falta de rate limiting, tokens sin expiración, webhooks sin verificar— se pueden remediar con poco código pero requieren conocer qué buscar.

El bug errático del formulario de Stripe mencionado en la Fase 1 quedó resuelto: era un problema de hidratación React en la verificación del estado del PaymentIntent, solventado moviendo la confirmación al backend con `stripe.paymentIntents.retrieve()`.

---

## 14. Trabajo futuro

- **Alta disponibilidad:** MongoDB Atlas + segundo servidor en VPS como failover pasivo gestionado por Cloudflare Load Balancer
- **Retiros reales:** Stripe Connect (Express Accounts) para payouts bancarios — requiere cuenta empresarial en Stripe; la infraestructura ya está implementada
- **CI/CD:** pipeline con GitHub Actions para ejecutar tests automáticamente en cada push y desplegando a producción si pasan
- **Migración de base de datos:** PostgreSQL con Prisma para un esquema más estricto ahora que el diseño está estabilizado
- **SSO / OAuth:** login con Google o GitHub para delegar la gestión de credenciales
- **Política de privacidad y términos:** páginas estáticas en el frontend (`/privacy`, `/terms`) que complementen el consentimiento registrado en backend
- **Notificación de brechas (Art. 33 GDPR):** mecanismo de alerta al DPO en caso de acceso no autorizado detectado por los logs de Winston
s de la Unión Europea.
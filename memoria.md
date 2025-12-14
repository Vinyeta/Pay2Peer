# Memoria del Proyecto Pay2Peer

## 1. Portada
- **Título:** Pay2Peer — Plataforma de transferencias y monedero
- **Autor/es:** Alejo VIñeta  
- **Fecha:** 14/12/25 
- **Versión:** 0.1

## 2. Resumen ejecutivo
- Este proyecto es una aplicación web de cartera y transferencia de dinero estilo PayPal con la estructura lógica de despliegue necesaria.
- El objetivo es crear un entorno seguro en el que tener una cartera de dinero y poder transferirlo entre carteras de forma segura y crear una infraestructura lógica donde hostearla
- El objetivo es conseguir una aplicación que cumpla con los estándares legales de la Union Europea sobre seguridad y privacidad en una aplicación financiera con la infraestructura lógica necesaria.

## 3. Índice
- Secciones y anexos con números de página (si aplica)

## 4. Introducción
- Este proyecto se inició para el curso de ASIR con especialización en ciberseguridad como proyecto de final de ciclo. La idea del proyecto viene de un proyecto de aprendizaje de React realizado anteriormente en el que solo se creo un MVP con la funcionalidad básica para una demo. Es un proyecto que hasta ahora no he podido desarrollar más y este ciclo me ha dado la oportunidad dehacerlo complementando mis conocimientos de desarrollo web con conocimientos de sistemas, redes y ciberseguridad para poder llevar este proyecto a término.
- El proyecto se divide en 2 fases. La primera se entrega el 18/12/25 y tiene como alcance un mvp de la aplicación web.
La segunda fase finaliza a finales de Abril de 2026. Su alcance incluye securizar la apliación según estandares europeos, preparar la infraestuctura lógica necesaria para desplegar este proyecto y dejarlo listo para producción.

## 5. Objetivos

- Objetivo general: construir una aplicación segura y conforme a requisitos legales para gestionar saldos y transferencias.
- Objetivos específicos: autenticación, persistencia de sesión, integración con Stripe, trazabilidad de transacciones y pruebas E2E.

## 6. Requisitos

### 6.1 Requisitos funcionales (RF)
- RF01 — Registro de usuario: `POST /api/users` → 201 + `{ user }`.
- RF02 — Autenticación: `POST /api/auth/login` → 200 + `{ token }`.
- RF03 — Persistencia de sesión: token en `localStorage`; `AuthContext` expone `token`, `user`, `logout` y `refreshUserAndWallet`.
- RF04 — Ver saldo y transacciones: `GET /api/wallets/:userId`, `GET /api/transactions`.
- RF05 — Recarga (pagos): frontend solicita `POST /api/payments/create-payment-intent { amount }` y confirma con Stripe usando `clientSecret`.
- RF06 — Confirmación y contabilización: `POST /api/payments/confirm-payment-intent { paymentIntentId }` actualiza `Wallet` y crea `Transaction`.

### 6.2 Requisitos no funcionales (RNF)
- RNF01 — Seguridad: delegar tokenización de tarjetas a Stripe; TLS en producción; no almacenar datos de tarjetas.
- RNF02 — Rendimiento: TTFB < 300 ms en staging para dashboard; creación de PaymentIntent < 3 s en condiciones normales.
- RNF03 — Disponibilidad: Uso de colas para permanencia de peticiones

### 6.3 Criterios de aceptación (QA)
- CA01 — Flujo de recarga completo con tarjeta de prueba en Stripe.
- CA02 — Mensajes de error apropiados y sin exposición de datos sensibles.
- CA03 — Remount/retry del `CardElement` en errores `Element destroyed`.

### 6.4 Contratos de API (ejemplos)
- `POST /api/payments/create-payment-intent`
  - Request: `{ "amount": number }` (euros)
  - Response: `{ "clientSecret": string, "id": string, "amount": number }`
- `POST /api/payments/confirm-payment-intent`
  - Request: `{ "paymentIntentId": string }`
  - Response: `{ "success": boolean, "walletId"?: string, "amount"?: number }`
- `GET /api/payments/ready`
  - Response: `{ "ready": boolean }`

### 6.5 Restricciones
- No almacenar datos de tarjetas; usar Stripe Elements.
- Secretos en variables de entorno (`STRIPE_API_KEY`, `JWT_SECRET`).

---

## 7. Arquitectura del sistema

### Visión general

Cliente: Next.js (App Router) — Backend: Node.js/Express — DB: MongoDB — Servicios: Stripe.

### Componentes principales
- Frontend: `app/` con `AuthContext`, `CheckoutForm`, `StripeClient`.
- Backend: `Pay2Peer-Node` con rutas de pagos en `src/resources/stripe`.
- Persistencia: colecciones `users`, `wallets`, `transactions`.

### Flujo de pagos (resumen)
1. Frontend POST `/api/payments/create-payment-intent` con `amount`.
2. Backend crea PaymentIntent y devuelve `clientSecret`.
3. Frontend llama `stripe.confirmCardPayment(clientSecret, { payment_method: { card } })`.
4. Backend verifica resultado y actualiza `Wallet` + `Transaction`.

### Modelos clave
- `User`: `_id`, `email`, `name`, `passwordHash`, `createdAt`.
- `Wallet`: `_id`, `userId`, `funds` (string decimal), `currency`, `updatedAt`.
- `Transaction`: `_id`, `walletId`, `type`, `amount`, `currency`, `stripePaymentIntentId`, `status`, `createdAt`.

---

## 8. Diseño e implementación

### Frontend
- `app/context/AuthContext.tsx`: centraliza token, usuario y wallet.
- `app/dashboard/fund/page.tsx`: `CheckoutForm` que consume `StripeClient`.
- `app/dashboard/fund/StripeClient.tsx`: monta Stripe Elements en cliente y maneja remount/retry.

### Backend
- Endpoints principales: `create-payment-intent`, `confirm-payment-intent`, `ready`.
- `stripe.controller.js`: crea y verifica PaymentIntents; actualiza `Wallet` y `Transaction`.

### Normalización de importes
- Usar céntimos (enteros) para llamadas a Stripe; almacenar en DB como string/decimal con dos decimales.

---

## 9. Seguridad y privacidad

- Autenticación con JWT; `Authorization: Bearer <token>` en peticiones protegidas.
- Validaciones y saneamiento de `amount` en frontend y backend.
- No exponer `STRIPE_API_KEY` en cliente.

---

## 10. Despliegue

Variables de entorno principales:
- Backend: `STRIPE_API_KEY`, `JWT_SECRET`, `MONGO_URI`.
- Frontend: `NEXT_PUBLIC_API_ROOT`, `NEXT_PUBLIC_STRIPE_PK`.

Build:
```bash
npm install
npm run build
npm run start
```
## 11. Conclusiones
- Se han alcanzado los objetivos de la primera fase, pero por restricciones de tiempo debidoa  imprevistos no se ha podido implementar la seguridad y la base datos con mirada a futuro por lo que habrá que refactorizar muchas cosas en la segunda fase. Hay además un bug erratico en el formulario proporcionado por Stripe que no se ha conseguido debugar a tiempo para la primera fase.
- Ha habido una investigación sobre como securizar y desplegar correctamente el proyecto por lo que ha habido un aprendizaje en ese aspecto, sin embargo la primera fase del proyecto es meramente la infrestructura necesaria para poder empezar la parte dífil del proyecto: la securización y creación de la infraestructura de despliegue.

## 12. Trabajo futuro
- Mejoras prioritarias: testing, debug del formulario de Stripe
- Nuevas funcionalidades planificadas:
  Implementaciín de blockchain en transacciones por seguridad.
  Refactorización de la API para no exponer ids de usuarios y carteras
  Usar OAuth u SSO para login para securizarlo. Las grandes empresas que proporcionan estos servicios invierten grandes cantidades de dinero en securizar sus logins y debido a limitaciones de tiempo y recursos no forma parte del alcance del proyecto.
  Dockerización del proyecto
  Investigar e implementar neuvas medidas de seguridad acordes a los estandares de la Unión Europea
# Evercare Cafeteria Frontend

> Angular 15 single-page application that powers the live cafeteria.evercare.ng experience - delivering ordering, payments, reporting, and administrative workflows on top of the Dining backend.

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Solution Layout](#solution-layout)
- [Core Capabilities](#core-capabilities)
- [Data & API Integration](#data--api-integration)
- [User Experience](#user-experience)
- [Local Setup](#local-setup)
- [Configuration](#configuration)
- [Build & Deployment](#build--deployment)
- [Testing & Quality](#testing--quality)
- [Contribution Guide](#contribution-guide)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

---

## Overview
The frontend consumes the Dining API to deliver a responsive operations console for Evercare Lagos cafeteria. It enables cashless meal ordering, voucher redemption, online payments, service desk operations, and management reporting for staff, outsource partners, and guests.

The project is an Angular CLI application (`angular.json:5`) with Angular Material, Bootstrap, Tailwind utility layers, and bespoke components built around cafeteria business logic.

---

## Tech Stack
- Framework: Angular 15 with Angular CLI (`@angular/cli` 15.2.x)
- UI Toolkit: Angular Material, Flex Layout, Bootstrap 5, Tailwind utility layers (`src/styles.scss`)
- Charts & Data Viz: Chart.js + ng2-charts, DevExtreme widgets, custom bar charts (`src/app/bar-chart`)
- Tables & Export: Angular Material tables, `mat-table-exporter`, `xlsx`, `ngx-csv`
- Payments: angular4-paystack, Squad and Paystack REST integrations (`src/app/shared/onlinepayment.service.ts`)
- State & Utilities: RxJS, `@ngneat/until-destroy`, custom encryption service (`src/app/shared/EncrDecrService.service.ts`)
- Tooling: Karma/Jasmine unit tests, Protractor e2e scaffolding, TSLint, Tailwind CLI config

---

## Solution Layout
```
src/
|-- app/
|   |-- auth/                    # Auth guard, login orchestration, freeze-state logic
|   |-- dashboard-page/          # Landing dashboard tiles and charts
|   |-- staffpayment/            # Staff payment CRUD and serving flows
|   |-- guestpayment/            # Guest meal ordering and cart management
|   |-- voucher, voucher-new/    # Voucher catalogue, issuance and editing
|   |-- users-payment-info/      # Served queue, email notifications, payment drilldowns
|   |-- onlinepayment/           # Card/transfer integrations and confirmation dialogs
|   |-- report/, transfer-and-reports/  # Revenue summaries, served/unserved analytics
|   |-- settings/, welcome/, pages/     # Shell pages, admin screens, help/about
|   |-- shared/                  # DTOs, services, validators, models, exports
|   |-- loader/                  # Global HTTP spinner (interceptor and component)
|   `-- ...                      # Dialogs, menus, footer, utilities
|-- assets/                      # Static assets (logos, hero imagery)
`-- environments/                # environment.ts and production override
```
The root `app.component` (`src/app/app.component.ts`) hosts the material sidenav shell, responsive breakpoints, route memory, and freeze toggles that write back to the Dining API.

---

## Core Capabilities
- Authentication & Session: Username/password login with encrypted comparison, freeze-state enforcement, and hash-based routing guard (`src/app/auth`). Session data persists in `localStorage` with idle timeout hooks ready for activation.
- Dynamic Payments: Landing `PaymentComponent` (`src/app/payment/payment.component.ts`) auto-routes the user to staff, outsourced, or guest payment flows based on `custTypeId`.
- Staff & Outsourced Billing: CRUD for payment main records, marking meals served, and balance adjustments, backed by RepoDb endpoints (`src/app/staffpayment`).
- Voucher Lifecycle: Create/edit vouchers, apply tariffs, and manage menu categories through dialog-heavy UIs (`src/app/voucher*`, `src/app/menu-dialog`).
- Orders & Serving: `users-payment-info` module aggregates outstanding orders, supports batch serving, updates freeze flags, and triggers served-meal emails (`src/app/users-payment-info/users-payment-info.component.ts`).
- Online Payments: Squad and Paystack verification plus direct Dining API submission (`src/app/shared/onlinepayment.service.ts`). Includes duplicate reference checks and reconciliation dashboards in Administration.
- Reporting & Analytics: Administration and Report pages surface served/unserved summaries, revenue totals, alacarte activity, and exportable data grids using DevExtreme and MatTable exporters (`src/app/pages/Administration`).
- Operations Support: Forgot password emails, contact dialogs, transfers, settings toggles, and a help center deliver day-to-day operational tooling.

---

## Data & API Integration
- All HTTP traffic is centralized through typed services under `src/app/shared` (for example `payment.service.ts`, `served.service.ts`, `transfer.service.ts`).
- `EnvironmentUrlService` injects the base API URL from the active environment file (`src/app/shared/services/environment-url.service.ts`). Adjust `environment.ts` or `environment.prod.ts` for each deployment.
- `LoaderInterceptor` wraps requests with progress indicators (`src/app/loader/loader.interceptor.ts`), and auth checks rely on the local `AuthService` instead of JWT headers.
- Development proxy (`proxy.conf.ts`) can forward `/api` calls to `https://cafeteriaapi.evercare.ng:2020` to bypass CORS while running `ng serve`.

---

## User Experience
- Responsive material shell using `BreakpointObserver` automatically collapses the sidebar on handset form factors (`src/app/app.component.ts`).
- Global progress bar and spinner reflect HTTP state, keeping long-running operations transparent (`src/app/loader`).
- Extensive dialog usage (MatDialog) for confirmations, menu creation, contact forms, and payment breakdowns keeps workflows inline.
- Data-heavy grids support pagination, column exports (CSV/XLSX), and custom filters via `mat-table-exporter`, `ngx-csv`, and DevExtreme widgets.
- Tailwind utility layers and Bootstrap themes coexist with Angular Material to match Evercare branding.

---

## Local Setup
1. Prerequisites
   - Node.js 16 LTS (or newer compatible with Angular 15)
   - Angular CLI (`npm install -g @angular/cli@15`)
2. Install dependencies
   ```bash
   npm install
   ```
3. Run the app
   ```bash
   npm run start
   ```
   - Uses the dev proxy in `proxy.conf.ts`; adjust or disable if pointing to a different backend.
   - For local HTTPS (needed for some payment SDKs), supply the bundled certificates:
     ```bash
     ng serve --ssl true --ssl-cert ./localhost.crt --ssl-key ./localhost.key
     ```
4. Access the app on `http://localhost:4200` (hash-based routing is enabled by default).

---

## Configuration
- API Base URL: Update `urlAddress` in `src/environments/environment*.ts` to match your backend host.
- Deployment Environment: `angular.json` production build replaces the environment file and enables build optimizer and hashing.
- Hash Routing: `HashLocationStrategy` keeps deep links working behind legacy proxies (configured in `AppModule`).
- Payment Secrets: Sandbox keys in `src/app/shared/onlinepayment.service.ts` are placeholders; route live keys through a secure configuration service before shipping.
- Styling: Global styles import Material, Bootstrap, DevExtreme, and Tailwind layers (`angular.json:22`). Extend `styles.scss` for branding tweaks.

---

## Build & Deployment
```bash
# production build
npm run build -- --configuration production

# artifacts
# outputs to dist/angular-responsive-sidebar/
```
- Generated bundles can be zipped (`dist.zip`) for IIS or Nginx deployment; the repository keeps historical bundles (`dist_old/`, `dist_old22/`).
- Ensure the backend URL in the production environment file matches the target infrastructure before packaging.

---

## Testing & Quality
- Unit tests: `npm test` runs Karma and Jasmine against specs alongside Material and DevExtreme shims.
- E2E: Protractor scaffolding remains available via `npm run e2e`; update selectors before relying on it.
- Linting: `npm run lint` executes TSLint with project rules.
- Git hooks are not configured - run tests and lint manually before pushing changes.

---

## Contribution Guide
- Organize features into lazy-loadable modules where possible; keep shared DTOs and services under `src/app/shared`.
- Favor strongly typed models when expanding API contracts (see `src/app/shared/*.model.ts`).
- Capture long-running operations with the loader service and surface toast or snack-bar feedback for user actions.
- When wiring new API calls, extend environment typing via `EnvironmentUrlService` rather than hard-coding hosts.
- Update this README whenever routes, environments, or deployment workflows change.

---

## Troubleshooting
- Blank screen after login: Confirm `localStorage` contains `user` and `isLoggedIn` keys; otherwise the guard will redirect to `/login`.
- CORS errors: Run through the proxy (`proxy.conf.ts`) or align backend CORS (see the backend README for server origins).
- Payment verification failures: Validate that Squad/Paystack keys and callback URLs are up to date and not left in sandbox mode.
- Chart or grid styles missing: Ensure DevExtreme and Tailwind CSS paths remain listed in `angular.json`.

---

## Support
- Product Owner: Cafeteria Operations Lead
- Technical Contact: Evercare IT Applications Team
- Incident Response: Follow the hospital incident bridge; payment reconciliation issues are Sev-1.

For change requests or operational issues, open a ticket with the IT Applications Team before modifying production builds.

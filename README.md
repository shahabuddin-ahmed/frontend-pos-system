
# Frontend POS System

  

Frontend submission for the `Senior Technical Assessment: POS 2026` brief. This app implements a multi-outlet POS control panel where HQ manages outlets and menu items, assigns items to outlets, and reviews reports, while each outlet operates with its own inventory and sales flow.

  

## Assessment Scope

  

The brief describes a single company with multiple outlets:

  

- HQ manages the master menu

- HQ assigns menu items to specific outlets

- HQ can override price per outlet

- Each outlet sells only its assigned items

- Each outlet maintains its own inventory

- Sales deduct outlet stock and must not allow negative stock

- Sales generate sequential receipt numbers per outlet

- HQ can review revenue by outlet and top-selling items

  

## What This Frontend Implements

  

### HQ module

  

-  `HQ Dashboard`: outlet count, menu count, active item count, and revenue summary by period

-  `Outlets`: create outlets, update outlet details, activate/deactivate outlets

-  `Master Menu`: create menu items, edit name/base price, activate/deactivate items

-  `Assignments`: assign active HQ menu items to an outlet and optionally set outlet-specific override prices

-  `Reports`: revenue by outlet and top-selling items filtered by reporting period

  

### Outlet module

  

-  `Inventory`: view current stock by outlet and set stock for assigned items

-  `Outlet POS`: search outlet menu items, add items to cart, enforce stock-aware quantity limits, complete sale, and display receipt summary

  

### Frontend safeguards already present

  

- POS only shows active items assigned to the selected outlet

- Inventory updates are scoped per outlet

- Cart quantity is constrained by available stock

- Checkout is blocked when any cart item exceeds current stock

- Revenue views support `today`, `thisMonth`, and `lifetime`

  

## Tech Stack

  

- Next.js 16

- React 19

- TypeScript

- Tailwind CSS 4

- Redux Toolkit

- Shadcn

  

## Project Structure

  

```text

src/app

hq/ HQ pages

outlet/ Outlet inventory and POS pages

src/features Page-specific UI modules

src/components Shared layout and UI components

src/lib API client, formatting helpers, providers

src/stores Redux store and cart state

```

  

## API Expectations

  

This repository is frontend-only. It expects a backend API at `NEXT_PUBLIC_API_URL` and currently defaults to:

  

```bash

http://localhost:3001/api/v1

```

  

The frontend calls these resource groups:

  

-  `/health`

-  `/outlets`

-  `/menu-items`

-  `/outlet-menu-items`

-  `/inventories`

-  `/sales`

-  `/reports`

  

Responses are expected in this envelope shape:

  

```ts

type  ApiEnvelope<T> = {

code: string;

message: string;

response: T;

errors: string[];

};

```

  

## Getting Started

  

### 1. Install dependencies

  

```bash

yarn  install

```

  

### 2. Configure environment

NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

```

  

### 3. Run the app

  

```bash

yarn  dev

```

  

Open `http://localhost:3000`.

  

## Available Scripts

  

```bash

yarn  dev

yarn  build

yarn  start

yarn  lint

```

  

## Main Routes

  

-  `/` landing page

-  `/hq/dashboard`

-  `/hq/outlets`

-  `/hq/menu`

-  `/hq/assignments`

-  `/hq/reports`

-  `/outlet/inventory`

-  `/outlet/pos`

  
## License

  

MIT
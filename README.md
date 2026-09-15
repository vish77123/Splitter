# Trip Splitter

Mobile-first React + TypeScript trip expense manager inspired by the interaction model of Splitwise/TravelSpend, but designed around flexible per-expense ownership and a shared trip wallet.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Zustand
- Recharts
- Lucide React
- Browser `localStorage` persistence

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Architecture

```text
src/
  components/
    CreateTrip.tsx       # onboarding / trip creation
    TripShell.tsx        # app shell + navigation + backup/restore
    Dashboard.tsx        # KPI cards + analytics
    ExpenseList.tsx      # expense CRUD
    ExpenseForm.tsx      # split editor and validation
    Settlements.tsx      # balances + optimized transfers
    ui.tsx               # reusable UI primitives
  hooks/
    useTrip.ts
  lib/
    calculations.ts      # canonical financial engine
    storage.ts           # local persistence / JSON backup
  store.ts               # Zustand state
  types.ts               # domain types
```

## Financial model

For each participant:

`net = directPayments + fundContributions - consumedShare`

A positive net means the participant should receive money. A negative net means they should pay.

Expenses paid from the trip fund do not credit the payer; the wallet itself is reduced. Contributions are tracked separately so the wallet can be reconciled.

### Split methods

- Equal: selected people divide the expense equally.
- Exact amount: each participant receives an explicit rupee amount; total must equal expense amount.
- Percentage: selected participants receive percentages; total must equal 100%.
- Weight: selected participants receive shares proportional to weights; zero-weight people are not charged.

The settlement engine greedily matches the largest debtor with the largest creditor. This gives a compact transfer set and is O(n log n) for sorting.

## Persistence / backup

The current implementation intentionally has no server or database. Trip data is stored locally in browser storage under:

`trip-splitter:v1`

JSON export is versioned so the format can later be migrated. A production SaaS version should move the same domain model behind an API and use PostgreSQL.

## Suggested production schema

```sql
trips (
  id uuid primary key,
  name varchar(160) not null,
  destination varchar(160),
  created_at timestamptz not null,
  updated_at timestamptz not null
);

trip_participants (
  id uuid primary key,
  trip_id uuid references trips(id) on delete cascade,
  display_name varchar(120) not null,
  email varchar(320),
  unique(trip_id, display_name)
);

expenses (
  id uuid primary key,
  trip_id uuid references trips(id) on delete cascade,
  title varchar(200) not null,
  amount numeric(14,2) not null check (amount > 0),
  category varchar(40) not null,
  paid_by uuid null references trip_participants(id),
  paid_from_fund boolean not null default false,
  notes text,
  expense_date date not null,
  split_method varchar(20) not null
);

expense_allocations (
  id uuid primary key,
  expense_id uuid references expenses(id) on delete cascade,
  participant_id uuid references trip_participants(id) on delete restrict,
  allocation_value numeric(14,6) not null check (allocation_value >= 0),
  unique(expense_id, participant_id)
);

fund_contributions (
  id uuid primary key,
  trip_id uuid references trips(id) on delete cascade,
  participant_id uuid references trip_participants(id),
  amount numeric(14,2) not null check (amount > 0),
  contribution_date date not null,
  note text
);
```

For a real multi-user SaaS, add `users`, `trip_memberships`, roles, audit events, optimistic concurrency, and server-side settlement recalculation.

## UX blueprint

1. **Onboarding** — trip name, destination, 2+ people. Keep it one screen.
2. **Overview** — four high-value KPIs, then analytics, then participant balances.
3. **Expenses** — one-tap add; the split editor is the core interaction. Participants are selectable independently per expense.
4. **Settlements** — explain the calculation in human terms, then show recommended transfers.
5. **People** — edit membership and provide backup/restore.
6. **Mobile** — horizontal compact navigation, bottom-friendly controls, modal sheets, large touch targets.
7. **Trust** — show allocation validation before save, preserve exact rupee precision, and keep backup/export one tap away.

## Production hardening

Before shipping publicly:
- Move money calculations to integer paise internally.
- Add schema migrations for imported JSON.
- Add unit/property tests for settlement invariants.
- Prevent edits to participants referenced by historical expenses, or use soft deletion.
- Add IndexedDB for larger offline datasets.
- Add backend auth + PostgreSQL for shared trips.
- Add server-side validation and idempotency for expense writes.
- Add accessibility tests and keyboard/focus management.
- Add error boundaries and telemetry.

# Aureon — How It All Works (Plain-English Guide)

This file explains how the whole project fits together, written for someone who
**doesn't** already know how websites, databases, or blockchains work. No prior
knowledge assumed. Every technical word is explained the first time it shows up,
usually with a real-world comparison.

Aureon is an online **marketplace for luxury collectibles** (watches, art, rare
items) — think of a high-end version of eBay. Sellers list items, buyers buy them,
admins moderate, support agents help, and every item can get a tamper-proof
"certificate of ownership" recorded on a blockchain.

---

## Table of contents

1. [The big picture (start here)](#1-the-big-picture-start-here)
2. [A mini-dictionary of the words we'll use](#2-a-mini-dictionary-of-the-words-well-use)
3. [The frontend — what the user sees](#3-the-frontend--what-the-user-sees)
4. [The backend — the work that happens on the server](#4-the-backend--the-work-that-happens-on-the-server)
5. [The database — where everything is remembered](#5-the-database--where-everything-is-remembered)
6. [Authentication & sessions — how "being logged in" works](#6-authentication--sessions--how-being-logged-in-works)
7. [Routing — how a web address becomes a page](#7-routing--how-a-web-address-becomes-a-page)
8. [Roles — four kinds of user](#8-roles--four-kinds-of-user)
9. [Payments & email](#9-payments--email)
10. [The blockchain (Phase 2) — explained from zero](#10-the-blockchain-phase-2--explained-from-zero)
11. [Two full journeys, start to finish](#11-two-full-journeys-start-to-finish)

---

## 1. The big picture (start here)

Every website has three layers. A useful comparison is a **restaurant**:

| Layer | Restaurant equivalent | In Aureon |
| --- | --- | --- |
| **Frontend** | The dining room — what customers see and touch | The pages, buttons, and images in your browser |
| **Backend** | The kitchen — does the real work out of sight | Code that runs on the server: checks logins, processes payments |
| **Database** | The storeroom — where everything is kept | Supabase: stores users, products, orders |

You (the customer) sit in the dining room. You never walk into the kitchen or the
storeroom — you ask a waiter, and the kitchen fetches from the storeroom and brings
food back. The "waiter" here is the internet connection carrying **requests** (asks)
and **responses** (answers).

```
   YOU (browser)                THE SERVER                  THE DATABASE
  ┌─────────────┐   request    ┌─────────────┐  query      ┌─────────────┐
  │  Frontend   │ ───────────► │   Backend   │ ──────────► │  Supabase   │
  │ (pages/UI)  │ ◄─────────── │ (the logic) │ ◄────────── │ (storeroom) │
  └─────────────┘   response   └─────────────┘  rows       └─────────────┘
        ▲                             │
        │                            also talks to:
        │                       Stripe (payments), Resend (email),
        └────────────────────── Blockchain (certificates)
```

In this project the **frontend and backend are the same program** (a framework
called **Next.js**). Some of its code runs in your browser (frontend) and some runs
on the server (backend). That's normal for modern sites — one codebase, two places
it runs.

> **Term: framework.** A framework is a ready-made foundation for building software,
> so you don't start from a blank page. Like a pre-fab house kit: the walls and
> plumbing rules are provided; you decorate and arrange the rooms.

---

## 2. A mini-dictionary of the words we'll use

Skim this now, refer back as needed.

- **Frontend** — the part you see and click in the browser (buttons, text, images).
- **Backend / server** — a computer somewhere that runs code you *can't* see, doing
  the trusted work (checking passwords, taking payments). "Server-side" = happening
  there.
- **Client / client-side** — your browser. "Runs on the client" = runs on your
  device.
- **Database** — an organized digital storeroom. Ours is a **table**-based database
  (like a set of giant, strict spreadsheets).
- **Request / response** — a request is the browser asking for something ("show me
  product X"); the response is the server's answer.
- **Next.js** — the framework that builds the whole site (frontend + backend).
- **React** — the tool Next.js uses to build the visual pieces ("components").
- **Component** — a reusable Lego-brick of UI. A "ProductCard" component is built
  once and reused for every product.
- **TypeScript** — the programming language everything is written in. It's JavaScript
  (the language browsers speak) plus **type labels** that catch mistakes early.
  - *Type label example:* saying a price is `number` means the code refuses to
    accidentally put the word `"hello"` where a price should go — the mistake is
    caught before the site ever runs.
- **Supabase** — the company/service that gives us the database + login system.
- **PostgreSQL (Postgres)** — the specific database engine Supabase runs. Very common,
  very reliable.
- **API** — a doorway one program uses to talk to another. Ordering at a drive-through
  speaker is an API: fixed menu, fixed way to ask.
- **Blockchain** — a shared notebook that everyone can read, nobody can erase, and
  every new line is permanent. (Full explanation in §10.)

---

## 3. The frontend — what the user sees

The frontend is everything visible: the homepage, the product grid, the cart, the
buttons. It's built from **components** (reusable UI bricks) using **React**.

**What's used and why:**

| Tool | What it does (plainly) |
| --- | --- |
| **React** | Builds the screen out of reusable bricks (components) and updates the screen instantly when something changes (e.g. you click "Add to cart"). |
| **Next.js** | Organizes those components into actual pages/URLs and decides what runs in the browser vs on the server. |
| **Tailwind CSS** | The styling. Instead of a separate design file, you write style directly on each element (`text-lg`, `rounded-xl`). Like having a labelled box of every paint colour and size right next to you. |
| **Radix UI** | Ready-made, accessible building blocks (dropdowns, dialogs) so we don't rebuild tricky pieces from scratch. |
| **Framer Motion** | The smooth animations (things fading/sliding in). |
| **Zustand** | A small **in-browser memory** for things the UI needs to remember *right now*, like what's in your cart before you check out. |

> **Why a cart lives in the browser (Zustand), not the database:** while you're still
> shopping, your cart is temporary and personal — no need to bother the server on
> every click. It's like a physical shopping basket you carry around the store; only
> at the checkout counter (payment) does it become an official order that gets
> written down.

**Key idea — the UI is "dumb" on purpose.** The frontend never decides who's allowed
to do what, and never touches the database directly. It just *shows things* and
*asks the backend* to do the real work. This matters for security: anything the
browser controls, a clever user could tamper with, so all trust lives on the server.

---

## 4. The backend — the work that happens on the server

The backend is code that runs on the server (the "kitchen"), where users can't see
or change it. In this project there's **no separate backend program** — Next.js runs
the backend for us. It does trusted work in three shapes:

1. **Server Components** — pages that are *built on the server* before being sent to
   you. When you open a product page, the server fetches that product from the
   database, bakes it into finished HTML, and sends you the ready page. Faster, and
   the database credentials never leave the server.

   > *Analogy:* ordering a pizza that arrives fully cooked, vs being handed raw
   > ingredients to cook yourself. Server Components arrive "cooked."

2. **Server Actions** — functions that live on the server but can be *triggered from
   a button in the browser*. You click "Submit review"; the browser calls a server
   action; the server validates it and saves it. You never see the machinery.

   > *Analogy:* a "call button" at a hotel. You press it (in your room); staff act on
   > it (in the back office). You don't go behind the desk yourself.

3. **API Routes** — special web addresses meant for programs, not people. For example
   Stripe (the payment company) needs to *tell us* "payment succeeded." It sends a
   message to a hidden address like `/api/webhooks/stripe`, and our code reacts.

**The one rule that keeps this tidy** (a pattern used all over the code):

- **Reading** data (show me products, show me my orders) → files in
  [`src/lib/data/`](src/lib/data/).
- **Writing** data (create a listing, submit a review, mint a token) → files in
  [`src/lib/actions/`](src/lib/actions/).

So if you ever wonder "where does the code that *saves* a new product live?" — it's an
**action**. "Where does the code that *lists* products live?" — it's in **data**.

---

## 5. The database — where everything is remembered

The frontend forgets everything when you close the tab. The database is the permanent
memory. Ours is **Supabase**, which is really **PostgreSQL** (a table database) plus
some extras.

**Think of it as a set of very strict spreadsheets called _tables_.** Each table
holds one kind of thing, one row per item:

- `profiles` — one row per user (name, role).
- `products` — one row per item for sale (title, price, seller).
- `orders` — one row per purchase.
- `order_items` — the individual products inside each order.
- `reviews`, `wishlist_items`, `support_tickets`, … — one table per concept.

Tables are **linked**. A row in `orders` doesn't repeat the buyer's name — it stores
the buyer's **id** (a unique code) that points to a row in `profiles`. This is like a
library: a loan record doesn't copy your whole identity, it just writes your library
card number, which links to your full details.

```
profiles                         orders
┌────┬──────────┬────────┐       ┌────┬──────────┬────────┐
│ id │ name     │ role   │◄──┐   │ id │ buyer_id │ total  │
├────┼──────────┼────────┤   └───┼────┼──────────┼────────┤
│ 7  │ Amina    │ buyer  │       │ 91 │    7     │ $8,500 │   ("buyer_id 7" = Amina)
└────┴──────────┴────────┘       └────┴──────────┴────────┘
```

**How the app talks to the database (the "call"):** the backend sends a **query** — a
precise request like "give me all products where status = active, newest first." The
database finds the matching rows and returns them. The backend then reshapes those raw
rows into a friendly form for the screen (this reshaping is the **view-model** — the
raw storeroom form vs the nice display form).

> **One gotcha worth remembering:** money is stored as a whole number of **cents**,
> not dollars. `$85.00` is saved as `8500`. Why? Because computers handle whole
> numbers perfectly but can make tiny rounding errors with decimals — and rounding
> errors on money are unacceptable. The code divides by 100 only at the last second,
> when showing the price.

**Row-Level Security (RLS) — the database's own bouncer.** Even if a request reaches
the database, Postgres itself checks "is this person allowed to see/change this
row?" For example, a buyer can read their *own* orders but not someone else's — the
database enforces that directly, so a bug in the app can't accidentally leak data.

> *Analogy:* a safety deposit vault where the vault itself checks your ID at each box,
> not just the guard at the front door. Two layers, so one failure isn't a disaster.

---

## 6. Authentication & sessions — how "being logged in" works

**Authentication** = proving who you are (logging in). **Session** = the site
*remembering* you're logged in as you move from page to page, so you don't re-enter
your password every click.

Here's the whole flow in plain steps:

1. You type your email + password and submit.
2. Supabase's login service checks them. If correct, it hands your browser a
   **cookie** — a small, signed piece of text the browser stores and automatically
   sends back on every future request.

   > **Term: cookie.** Like a wristband at an event. You show ID once at the entrance;
   > they give you a wristband; after that you just flash the wristband. The wristband
   > is signed/tamper-proof, so you can't fake one.

3. On each new page, the server reads that cookie and asks Supabase "who is this, and
   are they still valid?" Supabase answers with your identity and your **role**
   (buyer, seller, admin, support).
4. The code that does this lookup is [`getSessionUser`](src/lib/auth/session.ts). Any
   page can call it to know who's visiting.

Important detail: the server **re-verifies** the cookie with Supabase rather than just
trusting whatever the browser sends. (Trusting the browser blindly would be like
accepting any homemade wristband — the whole point is that the venue confirms it.)

---

## 7. Routing — how a web address becomes a page

**Routing** = the rule that turns a URL (web address) into the correct page.

Next.js uses **folder-based routing**: the shape of the folders *is* the map of the
site. A folder becomes part of the address, and a `page` file inside it is what shows
up.

```
src/app/
├── browse/         → the address  /browse
├── account/        → the address  /account
│   └── collection/ → the address  /account/collection
├── seller/         → the address  /seller
└── product/[slug]/ → the address  /product/rolex-daytona   ([slug] = a fill-in-the-blank)
```

> `[slug]` in square brackets means "a blank that changes." One folder handles
> `/product/rolex-daytona`, `/product/patek-nautilus`, and every other product. Like
> a form letter: "Dear ______," reused for every name.

**The guard at the door — `middleware.ts`.** Before *any* page loads, one gatekeeper
file, [`src/middleware.ts`](src/middleware.ts), runs first and asks: "Does this
visitor's role allow this page?"

- A logged-out person trying to reach `/account` → bounced to the sign-in page.
- A buyer trying to reach `/admin` → bounced back to their own area.
- Everyone can reach public pages like `/browse` and `/product/...`.

This gatekeeper is the **single** place route permissions are decided, so the rules
live in one spot instead of being scattered (and possibly forgotten) across pages.

> *Analogy:* the security desk in a lobby. Everyone passes it before reaching any
> floor; it checks your badge and only lets you to floors you're cleared for.

---

## 8. Roles — four kinds of user

Everyone has exactly one **role**, which decides what they can see and do:

| Role | Who they are | What they get |
| --- | --- | --- |
| **customer** | A buyer | Browse, wishlist, cart, checkout, their orders & collection |
| **seller** | Someone selling items | A "Seller Hub": create listings, see sales, get paid |
| **admin** | The platform staff | Moderate products, manage users, attest authenticity |
| **support** | Help-desk agent | The ticket inbox to answer customer questions |

The role is stored on the user's row in the database, read during the session lookup
(§6), and enforced by the gatekeeper (§7). A customer can *become* a seller by
applying, which upgrades their role.

---

## 9. Payments & email

Two jobs are handed off to specialist outside services, because money and email
deliverability are hard to do safely yourself.

- **Stripe (payments).** When you check out, Stripe securely collects the card and
  charges it — the card number never touches our server (less risk for everyone).
  When the charge succeeds, Stripe pings our hidden API address, and *then* we create
  the official order in the database. Sellers get paid through **Stripe Connect**,
  which splits the money and sends each seller their share (minus the platform fee).

- **Resend (email).** Sends the automatic emails — "your order is confirmed," "your
  item shipped." We hand Resend the message and recipient; it handles delivery.

> **Term: webhook.** A webhook is "don't call us, we'll call you." Instead of us
> constantly asking Stripe "paid yet? paid yet?", Stripe calls *our* address the
> moment it happens. Like a pizza place texting you when the pizza's out for
> delivery, instead of you phoning every two minutes.

---

## 10. The blockchain (Phase 2) — explained from zero

### What a blockchain even is

Forget crypto and money for a second. A **blockchain** is just a **shared notebook**
with three special properties:

1. **Append-only:** you can add new lines, but you can **never erase or edit** old
   ones.
2. **Shared & verifiable:** many copies exist; everyone can check them; no single
   person can secretly rewrite history.
3. **Permanent:** once written, a line is there forever.

That's it. It's a notebook that **can't be forged or back-dated**. This is *perfect*
for proving the history of a luxury item — "who made it, who owned it, is it real" —
because the whole value of a $100,000 watch depends on trusting that history.

> *Analogy:* a stone monument where each new event is carved in. You can add a new
> carving, but you can't un-carve the old ones or fake an older date. Compare that to
> a pencil-and-eraser ledger, which anyone could quietly rewrite.

### The words you'll meet

- **Smart contract** — a small program that *lives on* the blockchain and enforces
  rules automatically. Think of a **vending machine**: put in the right coin, it
  *must* give you the snack — no cashier, no arguing, the rules are the machine.
- **Token / NFT** — a unique digital certificate representing one specific real item.
  Not a coin — more like a **numbered deed** ("Deed #5 = this exact Rolex").
- **Mint** — to *create* that token for the first time (like a mint stamping a new,
  serial-numbered coin).
- **Wallet / address** — an identity on the blockchain, like an account number.
- **Hardhat** — a tool that runs a **blockchain on your own laptop** for building and
  testing, so you don't need the real, public, money-costing one.
- **Solidity** — the programming language smart contracts are written in.
- **Gas** — normally the small fee to write to a public blockchain. On our local
  laptop blockchain it's free/fake, so ignore it here.

### What Aureon actually does with it

Every item can get a **digital twin**: a unique token that carries the item's
permanent record. Three things get written to the notebook:

1. **Minted** — "digital twin #5 created for this Rolex, by this seller, at this
   time." (Done by the seller.)
2. **Attested** — "an Aureon admin certifies this item is genuine, here's the
   certificate." (Done by an admin; can only happen **once** per item.)
3. **Transferred** — "ownership moved to the buyer." (Happens automatically when an
   order is delivered.)

Anyone viewing the product then sees a **chain of custody** — Minted → Attested →
Transferred — that literally cannot be faked, plus a green "Authenticated" badge.

### The clever part: no wallets, no MetaMask

Normally, using a blockchain means every person needs a **wallet** (a crypto account
with a secret key) and a browser extension to sign actions. That's a terrible
experience for a shopping site — imagine grandma installing MetaMask to buy a watch.

So Aureon uses a **server-side signer**:

- The **platform itself holds one key** and signs every blockchain action on behalf
  of sellers/admins/buyers. When a seller clicks "Mint," the *server* does the actual
  blockchain write. Users never see any of it.
- **Buyers get an automatic address** derived from their user id — a permanent
  blockchain identity created for them, no setup, no extension.
- The secret key stays **only on the server**, never in the browser (a key in the
  browser could be stolen).

> *Analogy:* a **notary public**. You don't personally operate the official seal —
> you tell the notary what happened, and the trusted notary stamps the record on your
> behalf. Aureon is the notary for the blockchain.

**Reading vs writing:**
- *Writing* (mint/attest/transfer) is powerful, so it's locked behind that server key
  and permission checks (`SELLER_ROLE`, `ATTESTOR_ROLE`).
- *Reading* (showing the provenance) needs no key at all — the notebook is public — so
  the browser reads it directly.

### How the two worlds stay connected

We have two memories now: the normal database (Supabase) and the blockchain. They're
joined by **one number**: the token id.

```
 Supabase (products table)                 Blockchain (the notebook)
 ┌───────────────────────────┐             ┌───────────────────────────────┐
 │ Rolex Daytona             │             │ Token #1                      │
 │ price, images, seller …   │             │  Minted  by  seller@…         │
 │ blockchain_token_id = 1 ──┼───────────► │  Attested by admin@…          │
 └───────────────────────────┘   "go read  │  Transferred to buyer@…       │
                                  token #1" └───────────────────────────────┘
```

When you mint an item, the blockchain hands back a token number (e.g. `1`), and we
save that number on the product's row in Supabase. Later, to show provenance, the app
reads the token number from Supabase, then asks the blockchain "tell me the history of
token #1." That single stored number is the **bridge** between the two worlds.

---

## 11. Two full journeys, start to finish

Seeing every layer cooperate at once ties it together.

### Journey A — a buyer purchases a watch

```
1. Browser:   Buyer opens /product/rolex-daytona
2. Server:    Builds the page — READS the product from Supabase (a "data" file),
              re-checks the login cookie to know who's visiting
3. Browser:   Buyer clicks "Add to cart"  → saved in the in-browser cart (Zustand)
4. Browser:   Buyer clicks "Checkout"
5. Stripe:    Securely takes the card and charges it
6. Stripe:    Pings our hidden /api/webhooks/stripe address: "payment succeeded"
7. Server:    Creates the official order in Supabase (an "action"),
              triggers Resend to email a confirmation
8. Browser:   Buyer sees "Order confirmed" and it now appears under their orders
```

Every layer played its part: **frontend** (clicks), **backend** (validation +
saving), **database** (the permanent order), **Stripe** (money), **Resend** (email).

### Journey B — an item gets its blockchain certificate

```
1. Seller (browser):  Clicks "Mint Digital Twin" on their published listing
2. Server:            Uses the platform's blockchain key to CREATE token #5,
                      then saves "blockchain_token_id = 5" on the product in Supabase
3. Admin (browser):   Clicks "Attest" on that product
4. Server:            Uses the key to write the authenticity certificate for token #5
5. Order delivered:   When the buyer's order is marked delivered,
                      the server automatically TRANSFERS token #5 to the buyer
6. Anyone (browser):  Opens the product page → the browser READS token #5 directly
                      from the blockchain and shows Minted → Attested → Transferred
```

The buyer never installed a wallet. The seller and admin never touched a key. Yet the
item now has a permanent, un-fakeable history anyone can verify.

---

### One-paragraph summary to remember

**Aureon is a Next.js app.** The **frontend** (React + Tailwind) shows the pages but
makes no decisions. The **backend** (also Next.js, on the server) does all trusted
work, split into *data* files (reading) and *action* files (writing). Everything
permanent lives in the **Supabase/Postgres database** as linked tables, guarded by the
database's own Row-Level Security. **Login** is a signed cookie the server verifies
each time; **routing** maps folders to URLs with one gatekeeper (middleware) enforcing
roles. **Stripe** handles money, **Resend** handles email. And **Phase 2** adds a
local **Hardhat blockchain** where smart contracts record each item's mint, authenticity
attestation, and ownership transfers — signed for everyone by a single server-side key,
so users get an un-fakeable certificate of ownership without ever needing a crypto wallet.

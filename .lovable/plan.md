

# Kilegram Alpha — Visual Store & Armory Build Plan

## Overview
Build the polished Visual Store, Armory, and core UI shell for Kilegram — a 3D top-down Battle Royale Telegram Mini App. All weapons, characters, and gear will be rendered as detailed procedural 3D models using React Three Fiber, styled to match the military/tactical aesthetic of the reference art.

---

## Phase 1: Foundation & Database Schema

### Supabase Schema Migration
- Create/update the **profiles** table with fields: `telegram_id`, `username`, `first_name`, `level`, `xp`, `k_coins`, `k_gems`, `selected_skin`, `selected_weapon`, `total_kills`, `total_wins`, `total_matches`, `is_banned`
- Create **inventory** table: `user_id`, `item_id`, `item_type` (skin/weapon/helmet/backpack), `item_name`, `skin_level`, `is_equipped`, `acquired_at`
- Create **game_events** table for admin news pushes
- Create **match_history** table for stats tracking
- Create **user_roles** table with `admin`/`player` roles
- Add a new ammo type `7.62mm` for AK-Death
- Set up Row Level Security (RLS) policies for all tables

### Game Data Registry
- Define the official item catalog in code:
  - **Characters:** Ghost Riley, Nova Prime, Viper Snake, Shadow Exe — each with unique color palette, armor style, and skin levels 1-5
  - **Weapons:** K416 (5.56mm), AK-Death (7.62mm), AWM-X (.300 Mag), Vector-Neon (9mm), S12-Breacher (12 Gauge) — each with damage, fire rate, magazine, reload stats
  - **Helmets:** Recon Cap, Tactical Ops, Titanium Juggernaut — with armor values
  - **Backpacks:** Light Scout, Commando, Elite Expedition — with capacity values

---

## Phase 2: Procedural 3D Models (React Three Fiber)

### Character Models
Build 4 unique procedural 3D character models using R3F primitives:
- **Ghost Riley** — Dark tactical operator with skull-motif visor, heavy armor plating, muted blacks/greys
- **Nova Prime** — Sleek futuristic soldier with glowing cyan accents, streamlined armor
- **Viper Snake** — Agile stealth operative with green/dark camo tones, slim profile
- **Shadow Exe** — Digital warfare specialist with purple/neon highlights, angular armor

Each character built from capsules, cylinders, and custom shapes with emissive materials for skin levels 1-5.

### Weapon Models
Build 5 detailed procedural 3D weapon models:
- **K416** — Compact assault rifle with rail system, foregrip, red-dot sight
- **AK-Death** — Heavy assault rifle with curved magazine, wooden/black finish, menacing profile
- **AWM-X** — Long bolt-action sniper with scope, bipod, heavy barrel
- **Vector-Neon** — Compact SMG with neon-accented body, folding stock
- **S12-Breacher** — Bulky tactical shotgun with drum magazine, wide barrel

### Gear Models
- 3 helmet models with increasing bulk/protection visuals
- 3 backpack models with size progression

---

## Phase 3: Visual Store & Armory UI

### Store Page (`/store`)
- Premium dark UI with military/gaming aesthetic (dark slate, neon accents)
- **Tab navigation:** Characters | Weapons | Gear
- Each item displayed as an interactive 3D card — the procedural model rotates on a lit platform
- Item details panel: name, stats, price (K-Coins / K-Gems), rarity tier
- "Buy" and "Equip" buttons with animated feedback
- Player's current K-Coins and K-Gems balance displayed in header
- Items already owned shown with "Owned" badge and "Equip" action

### Armory Page (loadout view within Store)
- Shows currently equipped character, weapon, helmet, and backpack side by side
- 3D preview of full loadout on a turntable
- Quick-swap slots to change equipped items from owned inventory
- Stats comparison when hovering alternative items

### Store Item Detail Modal
- Full-screen 3D model viewer with orbit controls
- Weapon stats radar chart (damage, fire rate, range, accuracy, magazine)
- Character ability/lore description
- Purchase confirmation flow

---

## Phase 4: App Shell & Navigation

### Main Layout
- **Splash Screen** — Kilegram logo with animated entrance
- **Home Screen** — Play button, current rank/level, active events banner
- **Bottom Navigation** — Home, Store, Squad, Profile tabs
- **Profile Page** — Player stats, match history, level progression bar
- **Squad Page** — Create/join squad with squad code

### Telegram Mini App Integration
- Authenticate using `window.Telegram.WebApp` context
- Extract user data (telegram_id, first_name, username, photo_url)
- Auto-create profile on first visit
- Haptic feedback on purchases and actions

---

## Phase 5: Admin Dashboard (`/admin`)

- Protected route (only users with `admin` role)
- **Player Management** — Search, view, ban/unban players, adjust K-Coins/K-Gems
- **News/Events** — Create and push game events/announcements
- **Stats Overview** — Total players, active matches, revenue metrics
- Simple table-based UI with action buttons

---

## What This Plan Delivers
By the end of implementation, you'll have:
1. A fully functional Supabase backend with the complete item catalog
2. 12+ unique procedural 3D models (4 characters, 5 weapons, 3 helmets, 3 backpacks)
3. A polished Visual Store where every item is displayed as its specific 3D model
4. An Armory/loadout system with equip functionality
5. Full app navigation shell ready for the Game Arena phase
6. Admin panel for player and content management
7. Telegram Mini App authentication


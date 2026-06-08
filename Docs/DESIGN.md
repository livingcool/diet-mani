# Design System: Diet Mani
**Project ID:** 17513268854263420896

## 1. Visual Theme & Atmosphere
Diet Mani utilizes **Neobrutalism 2.0**—a custom design language that is a hybrid of **Neobrutalism**, **Premium Health Tech**, **Modern Wellness**, and **Gamification**. 

The mood is **Alive, Playful, Colorful, and World-class**. Rather than standard flat interfaces, the app feels handcrafted, tactile, and responsive. It balances high-contrast, thick-stroke elements with clean, modern typography and smooth, organic animations (Framer Motion) to create an addictive, premium health tracking experience.

Key Visual Anchors:
- **Bold Strokes**: 4px solid black borders on cards, buttons, and inputs.
- **Tectonic Depth**: 8px brutal offset shadows without diffusion (hard edges) that project depth.
- **Organic Geometry**: Generous corner rounding (24px) to soften the aggressive brutalism and make the interface feel friendly and approachable.

---

## 2. Color Palette & Roles

### 2.1 Light Mode Colors
*   **Background (Canvas):** Warm Bone-Cream (`#FFFDF7`) - Provides a soft, premium backdrop that is easier on the eyes than stark white.
*   **Primary Action:** Electric Hyper-Blue (`#0057FF`) - Main brand color, used for primary action buttons, key metrics, and circular progress tracks.
*   **Secondary Action / Water:** Radiant Cyan-Teal (`#00D5B5`) - Secondary actions, hydration progress indicators, and water metrics.
*   **Accent / Gamification:** Warm Amber-Yellow (`#FFB703`) - Highlights streak states, achievements, unlocked badges, and special alerts.
*   **Success state:** Forest Green (`#32D74B`) - Used for fully completed meal logs, perfect days, and positive status displays.
*   **Warning state:** Safety Orange (`#FF7A00`) - Used for partially completed states or progress alerts.
*   **Danger state:** Vivid Red (`#FF3B30`) - Used for missed logs, critical warnings, or deletions.

#### Card & Surface Pastels (Light Mode)
Cards utilize soft, low-saturation backgrounds to keep the interface colorful but readable:
*   **Mint:** Soft Teal-Green (`#D4F7E7`) - Calming, used for nutrition cards and morning options.
*   **Lavender:** Gentle Purple (`#E0DCFF`) - Restful, used for sleep log cards.
*   **Coral:** Muted Coral-Pink (`#FFE9E5`) - Energetic, used for high-protein meals.
*   **Sky Blue:** Pale Sky Blue (`#CCEFFF`) - Hydrating, used for hydration options.
*   **Yellow:** Muted Lemon (`#FDF0A6`) - Cheerful, used for vitamins/micronutrients.
*   **Peach:** Creamy Orange (`#FFE2CC`) - Warm, used for snacks and afternoon options.

### 2.2 Dark Mode Colors
*   **Background (Canvas):** Pitch Black (`#111111`) - Core background canvas.
*   **Surface / Card:** Charcoal-Gray (`#1B1B1B`) - Base layer for cards, inputs, and list containers.
*   **Primary Accent:** Neon Sky-Blue (`#4D8DFF`) - Dark mode main interactive highlight.
*   **Secondary Accent:** Cyber Mint-Teal (`#00E6C3`) - Secondary highlights and tags.
*   **Accent / Gamification:** Electric Gold (`#FFC94D`) - Unlocked states, badges, and streaks.
*   **Text (Primary):** Crisp White (`#FFFFFF`) - Core readable copy.
*   **Border:** Slate-Gray (`#2E2E2E`) - Contrast outline for dark mode components.

---

## 3. Typography Rules

The system uses a **Duo-Font System** to balance modern editorial elegance with readable data:

*   **Headlines (Manrope):** Chosen for its structural balance and modern friendliness. Used for all main headers, titles, and card names.
    *   *Rules:* Set letter-spacing to tight (`-0.02em`) with bold (`700`) or extra-bold (`800`) weights.
*   **Body Text (Manrope):** Used for descriptions, notes, and general paragraphs.
    *   *Rules:* Regular weight (`400`), generous line-height (`1.6`) to maintain a premium feel.
*   **Labels & Small Copy (Inter):** Used for micro-copy, chips, tags, and small numerical metrics.
    *   *Rules:* Medium weight (`500`), letter-spacing neutral (`0em`), maximum legibility at small sizes.

---

## 4. Component Stylings

### 4.1 Buttons
*   **Primary Button (Light Mode):**
    *   *Style:* Background `#0057FF`, text `#FFFFFF`, font-family `Manrope`, weight `700`.
    *   *Geometry:* `rounded-[24px]` (or `rounded-full`), `border-4 border-black`, height `56px`.
    *   *Shadow:* hard offset `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`.
    *   *Behavior:* Hover translates card `-2px, -2px` with shadow expanding to `6px 6px`. Active click translates `4px, 4px` with shadow disappearing (`shadow-none`).
*   **Secondary/Accent Button:**
    *   *Style:* Background matches Card Pastels (e.g. Lavender `#E0DCFF` or Mint `#D4F7E7`), text `#000000`, `border-4 border-black`.
*   **Outline Button:**
    *   *Style:* Transparent background, text `#000000`, `border-4 border-black`, `rounded-[24px]`.

### 4.2 Cards/Containers
*   **Standard Card:**
    *   *Style:* Background set to one of the custom Card Pastels, text `#000000`.
    *   *Geometry:* `rounded-[24px]` corners, `border-4 border-black` outline.
    *   *Shadow:* Hard offset `shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`.
*   **Dark Mode Card:**
    *   *Style:* Background `#1B1B1B`, text `#FFFFFF`, `border-4 border-[#2E2E2E]`, shadow `shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]` or outline only.

### 4.3 Inputs & Forms
*   **Text/Select Inputs:**
    *   *Style:* Background `#FFFDF7` (light) / `#1B1B1B` (dark), `border-4 border-black` (light) / `border-4 border-[#2E2E2E]` (dark), text color matches mode.
    *   *Geometry:* `rounded-[24px]` corners, generous padding (`px-5 py-4`).
    *   *Focus State:* Border color stays black, but card scales slightly or background turns white (`#FFFFFF`) with a subtle glow.

---

## 5. Layout Principles

*   **Mobile-First Ergonomics:** Since the app is designed for mobile-first usage, all critical controls (like meal completion checkboxes, quick water adds, and calendar day selection) must sit within the bottom 40% of the screen (the "thumb zone").
*   **Asymmetric Alignment:** Card layouts should sometimes be staggered or slightly offset to break the monotony of standard grids. 
*   **Zero Divider Lines:** Section boundaries should be defined by spacing, background panels (e.g., placing cards on a slightly darker container), or bold 4px borders rather than faint 1px divider lines.
*   **Pacing & Spacing:** Generous whitespace (margins of `16px` to `24px`) is utilized between cards to prevent the dense neobrutalist borders from making the UI feel cluttered.

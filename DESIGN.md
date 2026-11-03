---
name: HourRadar Enterprise Governance
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#42474f'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737780'
  outline-variant: '#c3c6d0'
  surface-tint: '#3a608d'
  primary: '#002546'
  on-primary: '#ffffff'
  primary-container: '#0d3b66'
  on-primary-container: '#81a6d7'
  inverse-primary: '#a4c9fc'
  secondary: '#016399'
  on-secondary: '#ffffff'
  secondary-container: '#81c4ff'
  on-secondary-container: '#00517e'
  tertiary: '#152539'
  on-tertiary: '#ffffff'
  tertiary-container: '#2b3b50'
  on-tertiary-container: '#95a5be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d3e4ff'
  primary-fixed-dim: '#a4c9fc'
  on-primary-fixed: '#001c38'
  on-primary-fixed-variant: '#204874'
  secondary-fixed: '#cde5ff'
  secondary-fixed-dim: '#94ccff'
  on-secondary-fixed: '#001d32'
  on-secondary-fixed-variant: '#004b74'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-kpi:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: '0'
  body-default:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  body-mono-num:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: '0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

# Brand & Style

The design system establishes a clinical, high-trust operational environment tailored for financial controllers, procurement leaders, legal counsel, and program directors operating under strict statutory oversight (including German ArbZG labor law regulations).

The emotional tone is authoritative, unshakeable, and analytically precise. Every visual element must justify its presence through operational utility:

- **Design Philosophy:** Utilitarian Enterprise Modernism. Zero decorative gradients, zero whimsical micro-interactions, and zero extraneous chrome.
- **Visual Weight:** Deliberate balance between high tabular data density and systematic whitespace. The interface conveys institutional stability, audit readiness, and predictability.
- **Information Architecture:** Statuses are explicit, numbers are monospaced or tabular-aligned, and visual hierarchies prevent alert fatigue while isolating regulatory violations with surgical clarity.

## Colors

The color hierarchy is strictly functional, avoiding purely decorative tints. Contrast ratios must meet or exceed WCAG AA standards (minimum 4.5:1 for body copy and 3:1 for graphical elements).

### Core Brand & Surfaces

- **Canvas / App Shell:** `#F8FAFC` (Slate 50) provides a low-strain, glare-free backdrop for extended operational shifts.
- **Card / Table Surface:** `#FFFFFF` (Pure White) establishes structural clarity and crisp elevation above the canvas.
- **Primary Base:** `#0D3B66` (Deep Navy) conveys structural authority, applied to primary navigation surfaces, active brand elements, and top-tier headers.
- **Interactive Accent:** `#1C6EA4` (Corporate Slate Blue) indicates actionable touchpoints, focus states, and primary actions.
- **Surface Hover:** `#F1F5F9` (Slate 100) indicates interactive row and element states without shifting perceptual weight.
- **Structural Borders:** `#E2E8F0` (Slate 200) strictly enforces tabular and spatial divisions.

### Typography & Text Hierarchy

- **Text Primary:** `#0F172A` (Slate 900) for all primary metric values, headers, and standard table cells.
- **Text Muted / Metadata:** `#64748B` (Slate 500) for input labels, table column headers, timestamps, and statutory citations.

### Functional & Regulatory Semantic Palette

Semantic colors are reserved strictly for operational status, legal compliance, and financial runway metrics:

- **Success / Compliant / Approved:** `#2E7D32` (Forest Green) indicates verified ArbZG rest periods, valid PO funds, and approved timesheets.
- **Warning / Approaching Limit:** `#F9A825` (Amber Gold) signals runway depletion (<15% PO balance remaining) or impending 10-hour daily work limit thresholds.
- **Critical / Violation / Re-order Alert:** `#C62828` (Crimson Red) highlights statutory ArbZG violations, PO budget overruns, or unassigned external headcount.

## Typography

The system uses `Inter` exclusively to maintain systematic legibility across complex multi-column layouts and deep data grids.

### Font Weight Rules

- **Regular (400):** Applied to standard data values, prose descriptions, body entries, and table cell strings.
- **Medium (500):** Applied to interactive field labels, metadata descriptions, pagination markers, and secondary navigation elements.
- **Semibold (600):** Strictly limited to page/module headers, structural labels, high-level KPI cards, and critical threshold highlights.

### Tabular Formatting

All numerical instances—including Euro amounts (€), purchase order balances, hours worked, burn-down percentages, and dates—must enforce `font-feature-settings: "tnum" 1` (tabular lining numbers). Column alignment for numerical metrics must align right, while associated qualitative descriptors align left.

## Layout & Spacing

The layout implements an asymmetric fixed-sidebar fluid-workspace model engineered for widescreen enterprise operations (1440px+ benchmark, responsive down to 1024px minimum desktop compliance).

### Structural Architecture

- **Sidebar Canvas:** Fixed `260px` primary navigation pane pinned to the left viewport edge (`h-screen`, `z-30`). Background `#0D3B66` with light text accents.
- **Content Canvas:** Fluid main frame with an absolute minimum horizontal margin of `24px` (`margin: 1.5rem`) and standardized internal module gutters of `16px` (`gutter: 1rem`).
- **Data Grids:** Structured 12-column layout across workspace modules, allowing dashboards to cleanly divide into metric quarters (3 columns each), core audit overviews (8 columns), and ancillary risk sidecars (4 columns).

### Layout Density Guidelines

- **Form & Input Row Gap:** Fixed `16px` (`space-md`) vertical rhythm between interconnected configuration groups.
- **Table Cell Padding:** Compact operational height: `8px` (`space-sm`) top/bottom padding and `12px` left/right padding per cell to ensure high vertical information throughput without scroll exhaustion.
- **Section Block Rhythm:** Major modules and KPI blocks maintain `24px` to `32px` (`space-lg` to `space-xl`) separation.

## Elevation & Depth

Elevation adheres to a crisp, low-altitude planar paradigm. Deep atmospheric shadows and blur-heavy drop shadows are prohibited.

### Tiers of Depth

- **Level 0 (Base Canvas):** `#F8FAFC`. Zero elevation, zero shadow.
- **Level 1 (Panels, Cards, Tables):** `#FFFFFF`. Defined by a 1px boundary of `#E2E8F0` coupled with an ultra-subtle, sharp ambient drop: `box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05)`.
- **Level 2 (Popovers, Filter Menus, Select Dropdowns):** `#FFFFFF`. Retains a 1px `#E2E8F0` boundary, elevated via `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)`.
- **Level 3 (Regulatory Modals, Audit Drawers):** `#FFFFFF`. Structured boundary with a focused scrim of `rgba(15, 23, 42, 0.4)` on the background, framed with `box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)`.

## Shapes

Geometry emphasizes calibrated restraint, aligning with German industrial UI aesthetics:

- **Containers, Cards, Inputs, and Dialogs:** `8px` (`rounded-lg` equivalent in standard 8pt frameworks; corresponding to `roundedness: 1` tier specifications).
- **Status Pills, Badges, and Micro-Indicators:** `4px` corner radius. Completely rounded pill shapes (`9999px`) are forbidden to prevent a casual or playful visual tone.
- **Dividers & Outlines:** 1px stroke weight uniformly applied across cards, row separators, and metric indicators (`#E2E8F0`).

## Components

### Buttons

- **Primary Action:** Solid `#1C6EA4` background, white text (`#FFFFFF`), `font-weight: 500`, `font-size: 14px`. Padding: `8px 16px`. Radius: `8px`. Hover: `#175884`. Focus: `2px` offset outline with `#1C6EA4`.
- **Secondary / Outline:** White `#FFFFFF` background, `#E2E8F0` 1px border, `#0F172A` text. Hover: `#F1F5F9`.
- **Destructive Action:** `#C62828` background, white text. Reserved strictly for canceling PO lines or flagging severe labor non-compliance.
- **Sizing:** Standard inputs and buttons share an exact height of `36px` (compact) or `40px` (default).

### Status Pills & ArbZG Badges

- **Shape & Geometry:** `4px` border radius, padding `2px 8px`, `font-size: 11px`, `font-weight: 600`, text-transform uppercase, tracking `0.04em`.
- **Compliant / Active:** Background `#E8F5E9`, text `#2E7D32`, border 1px solid `#C8E6C9`.
- **Approaching Limit / Warning:** Background `#FFF8E1`, text `#F9A825`, border 1px solid `#FFECB3`.
- **ArbZG Breach / PO Exhausted:** Background `#FFEBEE`, text `#C62828`, border 1px solid `#FFCDD2`.

### Data Tables (Tabular Precision)

- **Header Row:** Height `36px`, background `#F8FAFC`, bottom border 1px solid `#E2E8F0`. Text: `11px`, uppercase, semibold (600), color `#64748B`.
- **Body Rows:** Height `44px`, background `#FFFFFF`, bottom border 1px solid `#F1F5F9`. Hover state: `#F1F5F9`.
- **Numerical Alignment:** Monospaced tabular figures (`tnum`), right-aligned with column header alignment mirrored.

### Form Inputs & Select Fields

- **Container:** Height `38px`, background `#FFFFFF`, border 1px solid `#CBD5E1`, radius `8px`, padding `0 12px`.
- **Typography:** Regular (400), `14px`, text `#0F172A`. Placeholder: `#94A3B8`.
- **Focus State:** 1px solid `#1C6EA4` with `0 0 0 2px rgba(28, 110, 164, 0.15)`. No default browser rings.
- **Labels:** Positioned above input (`margin-bottom: 6px`), Medium (500), `13px`, text `#0F172A`.

### KPI & Metric Cards

- **Card Shell:** Background `#FFFFFF`, 1px solid `#E2E8F0`, 8px radius, padding `20px`.
- **Label:** `12px` uppercase, semibold, `#64748B`.
- **Primary Metric:** `32px` semibold, `#0F172A`, tracking `-0.02em`.
- **Sub-Metric / Trend:** Paired status badge (4px radius) + `12px` caption showing variance against PO allocation or statutory rest periods.

### Navigation Sidebar (Fixed 260px)

- **Shell:** Background `#0D3B66`, border-right 1px solid rgba(255, 255, 255, 0.08).
- **Navigation Item:** Height `40px`, horizontal padding `12px`, radius `6px`, margin `2px 12px`. Text: `14px`, regular, color `rgba(255, 255, 255, 0.7)`.
- **Active Navigation Item:** Background `rgba(255, 255, 255, 0.12)`, text `#FFFFFF`, font-weight medium (500), leading indicator accent `#1C6EA4`.
- **Bottom Role Pill:** Fixed to footer, displaying user authorization tier (e.g., "ArbZG Compliance Auditor", "Procurement Lead"), background `rgba(0, 0, 0, 0.25)`, padding `12px`, radius `6px`.

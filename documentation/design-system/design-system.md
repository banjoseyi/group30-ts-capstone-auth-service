# Design System

## Overview

The Group 30 Authentication Service frontend follows a consistent, responsive visual style across its public authentication pages, user dashboard, profile and security settings, session management, and administration screens. The design combines a dark navy text color with indigo, blue, and purple accents, light page backgrounds, clear forms, and reusable interface patterns.

The Figma designs provide the visual reference; the React frontend implements the interface with custom CSS and Lucide icons.

## Colors

The core project palette is:

| Token | Value | Usage |
| --- | --- | --- |
| Primary | `#5B5FEF` | Primary buttons, links, selected navigation, and key actions |
| Secondary | `#4F7CFF` | Secondary blue accents, illustrations, and supporting highlights |
| Accent | `#7C4DFF` | Purple accents and decorative emphasis |
| Dark Text | `#161A2D` | Main headings, prominent text, and dark interface areas |
| Background | `#F8FAFC` | Light page backgrounds |
| Surface | `#FFFFFF` | Cards, form panels, and content surfaces |
| Muted Text | `#64748B` | Supporting text, hints, and secondary information |
| Border | `#E2E8F0` | Input borders, dividers, and subtle outlines |
| Success | `#16A34A` | Successful actions and active-status messaging |
| Warning | `#D97706` | Cautionary messages and warning states |
| Danger | `#DC2626` | Validation errors, destructive actions, and suspended-status messaging |

Use color consistently. Do not rely on color alone to communicate errors, success, or account status; include readable labels or messages.

## Typography

- **Typeface:** Inter or a similar readable sans-serif with a system-font fallback.
- **Headings:** Approximately 600–700 font weight, with a clear size hierarchy.
- **Body text:** Approximately 400–500 font weight, optimized for reading.
- **Buttons and labels:** Medium or semibold weight for clarity.
- **Helper and error text:** Smaller than body text but legible, with sufficient contrast.

## Spacing and Layout

Use the existing consistent spacing scale:

```text
4px · 8px · 12px · 16px · 24px · 32px · 48px
```

Use generous spacing between sections, consistent padding within cards, and aligned form labels and controls. Rounded cards and form panels help group related information without making the interface overly decorative.

## Interface Components

Keep the following patterns consistent across pages:

- **Buttons:** Primary, secondary, danger, disabled, and loading states.
- **Forms and inputs:** Visible labels, required-field guidance, validation errors, password-visibility controls where applicable, and submission feedback.
- **Cards and panels:** Reusable surfaces for dashboard summaries, account information, and security settings.
- **Navigation:** Public-site navigation and authenticated application navigation, including a clear active-page state.
- **Alerts and feedback:** Success, warning, error, empty, and loading messages.
- **Profile avatars:** User images or a readable fallback when no image is available.
- **Status badges:** Clearly labelled user roles, account statuses, and session states.
- **Tables and lists:** Readable presentation of sessions and administrator user-management data.
- **Icons:** Lucide React icons used consistently alongside meaningful text or accessible labels.

## Interaction States

### Buttons

- **Primary:** Main action on a page or form.
- **Secondary:** Alternative or less prominent action.
- **Danger:** Destructive actions such as revoking sessions or suspending an account.
- **Disabled:** Unavailable action with an appropriate visual state.
- **Loading:** Indicates a request is in progress and helps prevent repeated submissions.

### Forms

- **Default:** Clearly labelled, editable fields.
- **Focus:** Visible focus indicator for keyboard users.
- **Error:** Field-level guidance explaining what needs to change.
- **Success:** Confirmation after a completed action.
- **Disabled:** Clear visual treatment when a field cannot be edited.

## Responsive Design

The frontend is designed for desktop, tablet, and mobile layouts. Content should resize or stack as available space decreases, forms should remain easy to complete, and navigation and data displays should remain usable on smaller screens. Avoid horizontal overflow and preserve sufficient space around touch targets.

## Screens Covered

The design system applies to the landing page, registration, sign-in, forgot-password and reset-password pages, dashboard, profile, account security, sessions, admin user management, and admin user-details pages.

## Accessibility and Consistency

Use semantic headings, visible input labels, keyboard-accessible controls, clear focus states, descriptive validation feedback, and sufficient text contrast. Authentication and security messaging should describe features that are actually implemented. In particular, the backend uses **bcrypt** for password hashing; do not describe it as Argon2 or claim that multi-factor authentication is enabled unless those features are implemented.

This document describes the intended shared design language. If implementation details change, update the corresponding CSS values and this document together.

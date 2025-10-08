RMS Modern Theme — Integration Guide
===================================

Overview
--------
This theme provides a central CSS variable file (`theme.css`) and a component stylesheet (`components.css`) to give your app a consistent, modern look. It favors a neutral base with a vivid blue primary accent and warm highlight accent.

Files added
-----------
- `src/styles/theme.css` — CSS variables, typographic scales, spacing, dark-mode variables and base resets.
- `src/styles/components.css` — shared component styles (buttons, inputs, cards, nav, table, modal, alerts, utilities).

How to integrate (quick)
------------------------
1. Import the theme CSS globally in your root entry (`src/index.js` or `src/index.css`):

```css
/* in src/index.js */
import './styles/theme.css';
import './styles/components.css';
```

2. Use component classes in your JSX:

```jsx
<button className="btn btn-primary">Search</button>
<div className="card">
  <div className="card-header">
    <h3 className="card-title">My panel</h3>
  </div>
  <div className="card-body">...</div>
</div>
```

3. Gradual adoption strategy:
- Start by importing the CSS globally so base typography and variables are applied.
- Replace navigation/header classes next (so layout spacing matches new header height).
- Replace buttons and inputs in high-traffic pages (Home, Books, Signin).
- Migrate complex components one-by-one. Use the `.glass` utility on existing elements to get glassmorphism quickly.

Dark mode
---------
Toggle dark mode by setting `data-theme="dark"` on the document element (`<html>` or `<body>`):

```js
document.documentElement.setAttribute('data-theme', 'dark');
```

Accessibility and contrast
--------------------------
- The theme uses a strong text color and ensures primary/foreground color pairs meet WCAG 4.5:1 in normal text sizes. If you change accents, run a contrast checker.
- Buttons and interactive elements have visible focus styles (box-shadow). You can increase the focus ring thickness in `theme.css` if needed.

Naming conventions
------------------
- The styles use simple utility and component class names (BEM-like without strict nesting). You can adopt CSS Modules by renaming files to `.module.css` and importing them inside components.

Suggested immediate fixes to apply across your app
-------------------------------------------------
- Unify button paddings: replace site buttons with `.btn` + `.btn-primary`/`.btn-secondary`.
- Ensure form inputs use the `.input` class so focus states and error styles are consistent.
- Add `.container` to main page wrappers for consistent max-width/padding.
- Replace inline colors with CSS variables (e.g. `style={{ background: 'var(--color-primary)' }}`) to keep consistency.

Migration tips
--------------
- Start small: import theme globally and update `Header`, `Footer`, and `Signin` pages.
- Use feature branches and update components iteratively.
- Keep old styles during migration; remove legacy CSS only after pages are fully migrated and tested.

If you want, I can:
- Convert these styles to SCSS with maps/mixins for easier theme programmatic changes.
- Provide styled-components variants or a Tailwind-compatible configuration.
- Replace Header and Allbooks components to use these classes directly (I can do that next).

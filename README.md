# parzivalxiii.github.io

Personal developer portfolio for **Parzival** — Backend Developer & Applied AI Engineer.  
Live at: **[https://parzivalxiii.github.io](https://parzivalxiii.github.io)**

---

## Overview

A fully static, zero-dependency portfolio site built with vanilla HTML, CSS, and JavaScript.
Dynamically fetches public GitHub repositories via the GitHub REST API and renders them
in a responsive card grid.

**Pages**

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero section and 3 featured project cards |
| Projects | `projects.html` | All public repos fetched live from GitHub API |
| About | `about.html` | Background, technology stack, current focus |

---

## Project Structure

```
/
├── index.html          # Home page
├── projects.html       # Projects page (dynamic)
├── about.html          # About page
├── css/
│   └── styles.css      # All styling — responsive, auto dark/light theme
├── js/
│   └── repos.js        # GitHub API integration
├── assets/
│   └── images/         # Reserved for future images
└── README.md
```

---

## GitHub Pages Deployment

This repository uses **GitHub Pages** for free static hosting.

### How it works

1. GitHub Pages serves the content of the `main` branch root directory.
2. Every `git push` to `main` automatically updates the live site.
3. The site is available at `https://<username>.github.io` within seconds.

### Enable GitHub Pages (first time only)

1. Go to **Settings → Pages** in this repository.
2. Set **Source** to `Deploy from a branch`.
3. Set **Branch** to `main`, directory to `/ (root)`.
4. Click **Save**. The site goes live within 1–2 minutes.

### Deploy an update

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

The live site updates automatically.

---

## Customisation Guide

### Update featured projects (Home page)

Edit the three `<article class="card">` blocks in `index.html`.  
Change the `<h3>` title, `<p>` description, tag `<span>` elements, and the `href` link.

```html
<!-- In index.html -->
<h3 class="card__title">your-repo-name</h3>
<p class="card__description">Short description of the project.</p>
<a href="https://github.com/ParzivalXIII/your-repo-name" ...>View on GitHub &#8599;</a>
```

### Exclude repos from the Projects page

Edit the `EXCLUDE_REPOS` array at the top of `js/repos.js`:

```js
const EXCLUDE_REPOS = [
  'parzivalxiii.github.io',  // always exclude the portfolio repo itself
  'another-repo-to-hide',    // add any repo name here
];
```

### Change the GitHub username

Edit `GITHUB_USERNAME` in `js/repos.js`:

```js
const GITHUB_USERNAME = 'YourNewUsername';
```

### Change colours / theme

All design tokens are CSS custom properties at the top of `css/styles.css`.
Light theme values are in the first `:root {}` block.  
Dark theme overrides are inside `@media (prefers-color-scheme: dark)`.

```css
:root {
  --color-accent: #0969da;  /* primary blue */
  --color-bg: #ffffff;      /* page background */
  /* ... */
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-accent: #58a6ff;
    --color-bg: #0d1117;
    /* ... */
  }
}
```

### Update About page content

All About page content is plain HTML in `about.html`.  
Edit the text inside the `<article class="about-section">` blocks.

---

## Technology

- **HTML5** — semantic markup
- **CSS3** — custom properties, grid, flexbox, `prefers-color-scheme`
- **Vanilla JavaScript** — GitHub REST API, DOM manipulation
- **GitHub Pages** — free static hosting

No frameworks. No build tools. No dependencies.

---

## License

MIT

/**
 * repos.js — GitHub API integration for the Projects page
 *
 * Fetches public repositories for a GitHub user, filters forks,
 * sorts by most recently updated, and renders cards into the DOM.
 *
 * Configuration: edit GITHUB_USERNAME and EXCLUDE_REPOS below.
 */

/* -------------------------------------------------------
   CONFIGURATION — edit these values to customise behaviour
------------------------------------------------------- */

/** Your GitHub username */
const GITHUB_USERNAME = 'ParzivalXIII';

/**
 * Repository names to exclude from the Projects listing.
 * Add the exact repo name (case-sensitive) as a string.
 * Example: ['my-username.github.io', 'some-old-repo']
 */
const EXCLUDE_REPOS = [
  `${GITHUB_USERNAME.toLowerCase()}.github.io`, // hide this portfolio repo itself
];

/** Maximum number of repos to display (GitHub API max is 100 per page) */
const MAX_REPOS = 100;

/* -------------------------------------------------------
   GITHUB API — language colour map (extend as needed)
------------------------------------------------------- */

const LANGUAGE_COLOURS = {
  Python:     '#3572A5',
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  HTML:       '#e34c26',
  CSS:        '#563d7c',
  Shell:      '#89e051',
  Dockerfile: '#384d54',
  Go:         '#00ADD8',
  Rust:       '#dea584',
  Java:       '#b07219',
};

/* -------------------------------------------------------
   DOM ELEMENT REFERENCES
------------------------------------------------------- */

const reposGrid    = document.getElementById('repos-grid');
const reposLoading = document.getElementById('repos-loading');
const reposError   = document.getElementById('repos-error');

/* -------------------------------------------------------
   UTILITIES
------------------------------------------------------- */

/**
 * Format an ISO date string to a human-readable relative label.
 * @param {string} isoString
 * @returns {string}
 */
function formatRelativeDate(isoString) {
  const updated = new Date(isoString);
  const now     = new Date();
  const diffMs  = now - updated;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0)  return 'today';
  if (diffDays === 1)  return 'yesterday';
  if (diffDays < 30)   return `${diffDays} days ago`;
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

/**
 * Safely create a text node — prevents XSS from API data.
 * @param {string} str
 * @returns {Text}
 */
function safeText(str) {
  return document.createTextNode(str ?? '');
}

/* -------------------------------------------------------
   CARD RENDERING
------------------------------------------------------- */

/**
 * Build a repository card element from raw GitHub API repo data.
 * Uses createElement + appendChild throughout to avoid innerHTML XSS.
 * @param {Object} repo
 * @returns {HTMLElement}
 */
function buildRepoCard(repo) {
  // ── article.card ──────────────────────────────────────
  const article = document.createElement('article');
  article.className = 'card';
  article.setAttribute('aria-label', `Repository: ${repo.name}`);

  // ── .card__body ────────────────────────────────────────
  const body = document.createElement('div');
  body.className = 'card__body';

  // Header (icon + title)
  const header = document.createElement('div');
  header.className = 'card__header';

  const icon = buildRepoIcon();
  header.appendChild(icon);

  const titleEl = document.createElement('h3');
  titleEl.className = 'card__title';
  titleEl.appendChild(safeText(repo.name));
  header.appendChild(titleEl);

  body.appendChild(header);

  // Description
  const desc = document.createElement('p');
  desc.className = 'card__description';
  desc.appendChild(safeText(repo.description || 'No description provided.'));
  body.appendChild(desc);

  // Meta (language + stars)
  const meta = document.createElement('div');
  meta.className = 'card__meta';

  if (repo.language) {
    const langItem = document.createElement('span');
    langItem.className = 'card__meta-item';

    const dot = document.createElement('span');
    dot.className = 'card__lang-dot';
    dot.setAttribute('data-lang', repo.language);
    dot.setAttribute('aria-hidden', 'true');
    // Apply colour inline as fallback
    const colour = LANGUAGE_COLOURS[repo.language];
    if (colour) dot.style.backgroundColor = colour;

    const langText = document.createElement('span');
    langText.appendChild(safeText(repo.language));

    langItem.appendChild(dot);
    langItem.appendChild(langText);
    meta.appendChild(langItem);
  }

  if (repo.stargazers_count > 0) {
    const starsItem = document.createElement('span');
    starsItem.className = 'card__meta-item';
    starsItem.setAttribute('title', `${repo.stargazers_count} stars`);

    const starSvg = buildStarIcon();
    const starsText = document.createElement('span');
    starsText.appendChild(safeText(String(repo.stargazers_count)));

    starsItem.appendChild(starSvg);
    starsItem.appendChild(starsText);
    meta.appendChild(starsItem);
  }

  // Updated date
  const updatedItem = document.createElement('span');
  updatedItem.className = 'card__meta-item';
  updatedItem.appendChild(safeText(`Updated ${formatRelativeDate(repo.updated_at)}`));
  meta.appendChild(updatedItem);

  body.appendChild(meta);
  article.appendChild(body);

  // ── .card__footer ──────────────────────────────────────
  const footer = document.createElement('div');
  footer.className = 'card__footer';

  const link = document.createElement('a');
  link.className = 'card__link';
  link.href = repo.html_url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.appendChild(safeText('View on GitHub ↗'));
  footer.appendChild(link);

  article.appendChild(footer);

  return article;
}

/**
 * Build the repository SVG icon.
 * @returns {SVGElement}
 */
function buildRepoIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'card__icon');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('fill', 'currentColor');
  // GitHub-style repo icon path
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d',
    'M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z'
  );
  svg.appendChild(path);
  return svg;
}

/**
 * Build the star SVG icon.
 * @returns {SVGElement}
 */
function buildStarIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('width', '12');
  svg.setAttribute('height', '12');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d',
    'M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z'
  );
  svg.appendChild(path);
  return svg;
}

/* -------------------------------------------------------
   FETCH & RENDER PIPELINE
------------------------------------------------------- */

/**
 * Show or hide the loading indicator.
 * @param {boolean} visible
 */
function setLoading(visible) {
  reposLoading.hidden = !visible;
}

/**
 * Show the error state.
 */
function showError() {
  setLoading(false);
  reposError.hidden = false;
}

/**
 * Fetch all repos (up to MAX_REPOS) for GITHUB_USERNAME,
 * apply filters and sorting, then render into the grid.
 */
async function fetchAndRenderRepos() {
  const apiUrl = `https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}/repos`
    + `?per_page=${MAX_REPOS}&sort=updated&direction=desc`;

  try {
    const response = await fetch(apiUrl, {
      headers: { Accept: 'application/vnd.github+json' },
    });

    if (!response.ok) {
      console.error(`GitHub API error ${response.status}: ${response.statusText}`);
      showError();
      return;
    }

    /** @type {Array<Object>} */
    const repos = await response.json();

    // Filter: remove forks and excluded repos
    const filtered = repos.filter((repo) => {
      if (repo.fork) return false;
      if (EXCLUDE_REPOS.includes(repo.name)) return false;
      if (EXCLUDE_REPOS.includes(repo.name.toLowerCase())) return false;
      return true;
    });

    // Sort by updated_at descending (API already does this, but be explicit)
    filtered.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    // Hide loading indicator
    setLoading(false);

    if (filtered.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'repos-status__error';
      empty.style.padding = '1.5rem 0';
      empty.appendChild(safeText('No public repositories found.'));
      reposGrid.appendChild(empty);
      return;
    }

    // Render cards
    const fragment = document.createDocumentFragment();
    for (const repo of filtered) {
      fragment.appendChild(buildRepoCard(repo));
    }
    reposGrid.appendChild(fragment);

  } catch (err) {
    console.error('Failed to fetch GitHub repositories:', err);
    showError();
  }
}

/* -------------------------------------------------------
   INIT
------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', fetchAndRenderRepos);

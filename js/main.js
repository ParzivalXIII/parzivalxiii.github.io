/**
 * main.js — Featured repositories for the Home page
 *
 * Fetches repo metadata from the GitHub API for each pinned repo
 * and renders cards into #repos in the declared order.
 *
 * Configuration: add/remove repo names in FEATURED_REPOS below.
 */

const GITHUB_USERNAME = 'ParzivalXIII';

/**
 * Pinned repos to feature on the home page.
 * Cards appear in the order listed here.
 */
const FEATURED_REPOS = [
  'arq-task-planner',
  'fastapi-starter-kit',
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Escape special HTML characters to prevent XSS from API data. */
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Render ────────────────────────────────────────────────────────────────────

/**
 * Build and inject one card per repo into the container.
 * @param {Array} repos
 * @param {HTMLElement} container
 */
function renderRepos(repos, container) {
  repos.forEach(repo => {
    const item = document.createElement('article');
    item.className = 'card';

    item.innerHTML = `
      <div class="card__body">
        <div class="card__header">
          <h3 class="card__title">${escapeHtml(repo.name)}</h3>
        </div>
        <p class="card__description">${escapeHtml(repo.description || 'No description provided.')}</p>
        ${repo.language ? `<div class="card__meta">
          <span class="card__meta-item">
            <span class="card__lang-dot" data-lang="${escapeHtml(repo.language)}" aria-hidden="true"></span>
            <span>${escapeHtml(repo.language)}</span>
          </span>
        </div>` : ''}
      </div>
      <div class="card__footer">
        <a class="card__link" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer">
          View on GitHub &#8599;
        </a>
      </div>
    `;

    container.appendChild(item);
  });
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

/**
 * Fetch a single repo by name from the GitHub API.
 * @param {string} repoName
 * @returns {Promise<Object>}
 */
function fetchRepo(repoName) {
  return fetch(
    `https://api.github.com/repos/${GITHUB_USERNAME}/${encodeURIComponent(repoName)}`,
    { headers: { Accept: 'application/vnd.github+json' } }
  ).then(response => {
    if (!response.ok) throw new Error(`GitHub API responded with ${response.status} for ${repoName}`);
    return response.json();
  });
}

Promise.all(FEATURED_REPOS.map(fetchRepo))
  .then(repos => {
    const container = document.getElementById('repos');
    const loading   = document.getElementById('featured-loading');
    const error     = document.getElementById('featured-error');

    if (loading) loading.hidden = true;

    renderRepos(repos, container);
  })
  .catch(err => {
    console.error('Failed to load featured repositories:', err);
    const loading = document.getElementById('featured-loading');
    const error   = document.getElementById('featured-error');
    if (loading) loading.hidden = true;
    if (error)   error.hidden = false;
  });

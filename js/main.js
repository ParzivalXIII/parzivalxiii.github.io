/**
 * main.js — Featured repositories for the Home page
 *
 * Fetches the most recently updated public repos for the configured
 * GitHub user, filters forks, and renders cards into #repos.
 *
 * Configuration: change GITHUB_USERNAME or FEATURED_COUNT below.
 */

const GITHUB_USERNAME  = 'ParzivalXIII';
const FEATURED_COUNT   = 2; // how many repos to show on the home page

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

fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`)
  .then(response => {
    if (!response.ok) throw new Error(`GitHub API responded with ${response.status}`);
    return response.json();
  })
  .then(data => {
    const container = document.getElementById('repos');
    const loading   = document.getElementById('featured-loading');
    const error     = document.getElementById('featured-error');

    if (loading) loading.hidden = true;

    const repos = data
      .filter(repo => !repo.fork)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, FEATURED_COUNT);

    if (repos.length === 0) {
      container.innerHTML = '<p style="color:var(--color-text-muted)">No public repositories found.</p>';
      return;
    }

    renderRepos(repos, container);
  })
  .catch(err => {
    console.error('Failed to load featured repositories:', err);
    const loading = document.getElementById('featured-loading');
    const error   = document.getElementById('featured-error');
    if (loading) loading.hidden = true;
    if (error)   error.hidden = false;
  });

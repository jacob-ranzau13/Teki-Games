function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function loadReviews() {
  const gameIdFromQuery = getQueryParam('gameId');
  const selectElem = document.getElementById('review-game');
  const selectedVal = selectElem && selectElem.value;
  const game_id = gameIdFromQuery || (selectedVal ? selectedVal : null);

  try {
    const url = game_id ? (API + '/reviews/' + encodeURIComponent(game_id)) : (API + '/reviews');
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load reviews');
    const reviews = await res.json();

    const list = document.getElementById('reviewsList');
    list.innerHTML = '';

    if (!Array.isArray(reviews) || reviews.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:#00d9ff">No reviews yet.</div>';
      return;
    }

    reviews.forEach(r => {
      const card = document.createElement('div');
      card.className = 'game-card';

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerText = `Rating: ${r.rating} • by ${r.username || ('user ' + r.user_id)}`;

      const body = document.createElement('div');
      body.style.marginTop = '6px';
      body.innerText = r.review_text;

      card.appendChild(meta);
      card.appendChild(body);
      list.appendChild(card);
    });
  } catch (err) {
    document.getElementById('reviewsList').innerHTML = '<div style="color:red;text-align:center">Error loading reviews</div>';
    console.error('loadReviews error', err);
  }
}

async function addReview() {
  const gameIdFromQuery = getQueryParam('gameId');
  const selectElem = document.getElementById('review-game');
  const game_id = gameIdFromQuery || (selectElem && selectElem.value);
  const rating = document.getElementById('rating').value.trim();
  const review_text = document.getElementById('review_text').value.trim();

  const currentUser = user();
  if (!currentUser || !currentUser.user_id) {
    document.getElementById('review-error').innerText = 'You must be logged in to post a review.';
    return;
  }
  if (!game_id) {
    document.getElementById('review-error').innerText = 'No game selected.';
    return;
  }
  if (!rating || isNaN(Number(rating))) {
    document.getElementById('review-error').innerText = 'Please enter a numeric rating.';
    return;
  }

  try {
    const res = await fetch(API + '/reviews', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ user_id: currentUser.user_id, game_id, rating: Number(rating), review_text })
    });
    if (!res.ok) throw new Error('Failed to post review');
    document.getElementById('rating').value = '';
    document.getElementById('review_text').value = '';
    hideAddForm();
    await loadReviews();
  } catch (err) {
    console.error('addReview error', err);
    document.getElementById('review-error').innerText = 'Failed to add review.';
  }
}

async function loadGamesList() {
  const sel = document.getElementById('review-game');
  if (!sel) return;
  sel.innerHTML = '<option>Loading games...</option>';
  try {
    const res = await fetch(API + '/games');
    if (!res.ok) throw new Error('Failed to load games');
    const games = await res.json();
    sel.innerHTML = '';
    const q = getQueryParam('gameId');
    if (!q) {
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.innerText = 'All games (no filter)';
      sel.appendChild(placeholder);
    }
    if (!Array.isArray(games) || games.length === 0) {
      const o = document.createElement('option'); o.value = ''; o.innerText = 'No games available'; sel.appendChild(o);
      return;
    }
    games.forEach(g => {
      const o = document.createElement('option');
      o.value = g.game_id;
      o.innerText = `${g.title} (${g.release_year || 'N/A'})`;
      sel.appendChild(o);
    });
    if (q) {
      sel.value = q;
      sel.disabled = true;
    }
  } catch (err) {
    sel.innerHTML = '<option>Error loading games</option>';
    console.error('loadGamesList error', err);
  }
}

function showAddForm() { document.getElementById('add-form').classList.remove('hidden'); }
function hideAddForm() { document.getElementById('add-form').classList.add('hidden'); }

document.addEventListener('DOMContentLoaded', async () => {
  await loadGamesList();
  const sel = document.getElementById('review-game');
  if (sel) sel.addEventListener('change', loadReviews);
  await loadReviews();
});

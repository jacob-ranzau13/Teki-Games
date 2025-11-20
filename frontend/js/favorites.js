async function getCurrentUser() {
  try {
    return user();
  } catch (e) {
    return null;
  }
}

async function loadGamesForSelect() {
  const sel = document.getElementById('favorite-game');
  if (!sel) return;
  sel.innerHTML = '<option>Loading games...</option>';
  try {
    const res = await fetch(API + '/games');
    if (!res.ok) throw new Error('Failed to load games');
    const games = await res.json();
    sel.innerHTML = '';
    if (!Array.isArray(games) || games.length === 0) {
      const o = document.createElement('option'); o.value = ''; o.innerText = 'No games available'; sel.appendChild(o);
      return;
    }
    const placeholder = document.createElement('option'); placeholder.value = ''; placeholder.innerText = 'Select a game to favorite'; sel.appendChild(placeholder);
    games.forEach(g => {
      const o = document.createElement('option');
      o.value = g.game_id;
      o.innerText = `${g.title} (${g.release_year || 'N/A'})`;
      sel.appendChild(o);
    });
  } catch (err) {
    sel.innerHTML = '<option>Error loading games</option>';
    console.error('loadGamesForSelect error', err);
  }
}

async function loadFavorites() {
  const current = getCurrentUser();
  const list = document.getElementById('favoritesList');
  list.innerHTML = '<div style="text-align:center; color:#00d9ff;">Loading...</div>';

  const usr = await current;
  if (!usr || !usr.user_id) {
    list.innerHTML = '<div style="text-align:center;color:#00d9ff">You must be logged in to see favorites.</div>';
    return;
  }

  try {
    const res = await fetch(API + '/favorites/' + encodeURIComponent(usr.user_id));
    if (!res.ok) throw new Error('Failed to load favorites');
    const favs = await res.json();

    // load all games to map ids to titles
    const gamesRes = await fetch(API + '/games');
    const games = gamesRes.ok ? await gamesRes.json() : [];
    const gameMap = {};
    if (Array.isArray(games)) games.forEach(g => { gameMap[g.game_id] = g; });

    if (!Array.isArray(favs) || favs.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:#00d9ff">No favorites yet.</div>';
      return;
    }

    list.innerHTML = '';
    favs.forEach(f => {
      const g = gameMap[f.game_id] || { title: 'Unknown game', release_year: '' };
      const card = document.createElement('div');
      card.className = 'game-card';

      const title = document.createElement('div');
      title.className = 'title';
      title.innerText = g.title || 'Untitled';

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.innerText = `${g.genre || ''} ${g.release_year ? '• ' + g.release_year : ''}`;

      const actions = document.createElement('div');
      actions.className = 'actions';

      const reviewBtn = document.createElement('button');
      reviewBtn.className = 'tron-button';
      reviewBtn.style.padding = '6px 10px';
      reviewBtn.style.fontSize = '13px';
      reviewBtn.innerText = 'Reviews';
      reviewBtn.onclick = () => { window.location = `reviews.html?gameId=${f.game_id}`; };

      actions.appendChild(reviewBtn);

      card.appendChild(title);
      card.appendChild(meta);
      card.appendChild(actions);
      list.appendChild(card);
    });
  } catch (err) {
    list.innerHTML = `<div style="color:red;text-align:center">Error loading favorites</div>`;
    console.error('loadFavorites error', err);
  }
}

async function addFavorite() {
  document.getElementById('fav-error').innerText = '';
  const sel = document.getElementById('favorite-game');
  if (!sel) return;
  const game_id = sel.value;
  const current = await getCurrentUser();
  if (!current || !current.user_id) {
    document.getElementById('fav-error').innerText = 'You must be logged in.';
    return;
  }
  if (!game_id) {
    document.getElementById('fav-error').innerText = 'Please select a game.';
    return;
  }

  try {
    const res = await fetch(API + '/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: current.user_id, game_id })
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error('Add favorite failed: ' + txt);
    }
    hideAddForm();
    await loadFavorites();
  } catch (err) {
    console.error('addFavorite error', err);
    document.getElementById('fav-error').innerText = 'Failed to add favorite.';
  }
}

function showAddForm() { document.getElementById('add-form').classList.remove('hidden'); }
function hideAddForm() { document.getElementById('add-form').classList.add('hidden'); }

window.addFavorite = addFavorite;
window.showAddForm = showAddForm; window.hideAddForm = hideAddForm;

document.addEventListener('DOMContentLoaded', async () => {
  await loadGamesForSelect();
  await loadFavorites();
  const sel = document.getElementById('favorite-game');
  if (sel) sel.addEventListener('change', () => {});
});

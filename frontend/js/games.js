async function loadGames() {
  const list = document.getElementById('list');
  list.innerHTML = '<div style="text-align:center; color:#00d9ff;">Loading...</div>';
  try {
    const res = await fetch(API + '/games');
    if (!res.ok) throw new Error('Failed to load games');
    const games = await res.json();
    if (!Array.isArray(games) || games.length === 0) {
      list.innerHTML = '<div style="text-align:center; color:#00d9ff;">No games yet.</div>';
      return;
    }
    
    list.innerHTML = '';
    games.forEach(g => {
      const card = document.createElement('div');
      card.className = 'game-card';

      const title = document.createElement('div');
      title.className = 'title';
      title.innerText = g.title || 'Untitled';

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.innerText = `${g.genre || 'Unknown genre'} • ${g.release_year || 'Year N/A'} • platform ${g.platform_id || 'N/A'}`;

      const actions = document.createElement('div');
      actions.className = 'actions';

      const reviewBtn = document.createElement('button');
      reviewBtn.className = 'tron-button';
      reviewBtn.style.padding = '6px 10px';
      reviewBtn.style.fontSize = '13px';
      reviewBtn.innerText = 'Reviews';
      reviewBtn.onclick = () => { window.location = `reviews.html?gameId=${g.game_id}`; };

      actions.appendChild(reviewBtn);

      card.appendChild(title);
      card.appendChild(meta);
      card.appendChild(actions);
      list.appendChild(card);
    });
  } catch (err) {
    list.innerHTML = `<div style="color:red;text-align:center">Error loading games</div>`;
    console.error('loadGames error', err);
  }
}

async function addGame() {
  const title = document.getElementById('title').value.trim();
  const genre = document.getElementById('genre').value.trim();
  const release_year = document.getElementById('year').value.trim();
  const platform_id = document.getElementById('platform').value.trim();

  if (!title) {
    alert('Title is required');
    return;
  }

  try {
    const res = await fetch(API + '/games', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ title, genre, release_year: release_year || null, platform_id: platform_id || null })
    });
    if (!res.ok) throw new Error('Add game failed');
    const data = await res.json();
    document.getElementById('title').value = '';
    document.getElementById('genre').value = '';
    document.getElementById('year').value = '';
    document.getElementById('platform').value = '';
    await loadGames();
  } catch (err) {
    console.error('addGame error', err);
    alert('Failed to add game');
  }
}

window.addGame = addGame;
function showAddForm() { document.getElementById('add-form').classList.remove('hidden'); }
function hideAddForm() { document.getElementById('add-form').classList.add('hidden'); }
window.showAddForm = showAddForm; window.hideAddForm = hideAddForm;
document.addEventListener('DOMContentLoaded', loadGames);

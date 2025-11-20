async function loadPlatforms() {
  const list = document.getElementById('platformsList');
  list.innerHTML = '<div style="text-align:center; color:#00d9ff;">Loading...</div>';
  try {
    const res = await fetch(API + '/platforms');
    if (!res.ok) throw new Error('Failed to load platforms');
    const platforms = await res.json();
    if (!Array.isArray(platforms) || platforms.length === 0) {
      list.innerHTML = '<div style="text-align:center; color:#00d9ff;">No platforms yet.</div>';
      return;
    }

    list.innerHTML = '';
    platforms.forEach(p => {
      const card = document.createElement('div');
      card.className = 'game-card';

      const title = document.createElement('div');
      title.className = 'title';
      title.innerText = p.platform_name || 'Unnamed';

      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.innerText = `Platform ID: ${p.platform_id || 'N/A'}`;

      card.appendChild(title);
      card.appendChild(meta);
      list.appendChild(card);
    });
  } catch (err) {
    list.innerHTML = `<div style="color:red;text-align:center">Error loading platforms</div>`;
    console.error('loadPlatforms error', err);
  }
}

document.addEventListener('DOMContentLoaded', loadPlatforms);
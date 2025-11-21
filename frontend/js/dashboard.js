document.addEventListener('DOMContentLoaded', async () => {
  async function fetchJson(path) {
    try {
      const res = await fetch(path);
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error('Fetch error', path, e);
      return [];
    }
  }

  function createBarChart(ctx, labels, data, label, color) {
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label,
          data,
          backgroundColor: color,
          borderColor: color,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#cfefff' } },
          y: { beginAtZero: true, ticks: { color: '#cfefff' } }
        }
      }
    });
  }

  function updateChart(chart, labels, data) {
    if (!chart) return;
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
  }

  const base = typeof API !== 'undefined' ? API : 'http://localhost:4000';

  let popularChart = null;
  let favoritedChart = null;
  let reviewersChart = null;
  let platformsChart = null;

  async function fetchAndRender() {
    const [popular, favorited, topReviewers, platforms] = await Promise.all([
      fetchJson(base + '/stats/most-popular-games'),
      fetchJson(base + '/stats/most-favorited'),
      fetchJson(base + '/stats/top-reviewers'),
      fetchJson(base + '/stats/platform-game-counts')
    ]);

    try {
      const labels = popular.map(p => p.title || 'Unknown');
      const data = popular.map(p => p.review_count || 0);
      const ctx = document.getElementById('chart-popular').getContext('2d');
      if (popularChart) { try { popularChart.destroy(); } catch (e) {} }
      popularChart = createBarChart(ctx, labels, data, 'Review Count', '#00d9ff');
    } catch (e) { console.error('Chart error popular', e); }

    try {
      const labels = favorited.map(p => p.title || 'Unknown');
      const data = favorited.map(p => p.favorite_count || 0);
      const ctx = document.getElementById('chart-favorited').getContext('2d');
      if (favoritedChart) { try { favoritedChart.destroy(); } catch (e) {} }
      favoritedChart = createBarChart(ctx, labels, data, 'Favorites', '#00ffa6');
    } catch (e) { console.error('Chart error favorited', e); }

    try {
      const labels = topReviewers.map(u => u.username || ('User ' + u.user_id));
      const data = topReviewers.map(u => u.review_count || 0);
      const ctx = document.getElementById('chart-top-reviewers').getContext('2d');
      if (reviewersChart) { try { reviewersChart.destroy(); } catch (e) {} }
      reviewersChart = createBarChart(ctx, labels, data, 'Reviews', '#ffb86b');
    } catch (e) { console.error('Chart error reviewers', e); }

    try {
      const labels = platforms.map(p => p.platform_name || ('Platform ' + p.platform_id));
      const data = platforms.map(p => p.game_count || 0);
      const ctx = document.getElementById('chart-platforms').getContext('2d');
      if (platformsChart) { try { platformsChart.destroy(); } catch (e) {} }
      platformsChart = createBarChart(ctx, labels, data, 'Games', '#9b8cff');
    } catch (e) { console.error('Chart error platforms', e); }
  }

  await fetchAndRender();


});

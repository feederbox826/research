function createChart(data) {
  const labels = Object.keys(data).map((key) => `${key} mins`);
  const counts = Object.values(data);
  console.log(labels, counts);

  const config = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Number of Scenes',
        data: counts
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

  const ctx = document.getElementById('chart')
  new Chart(ctx, config);
}
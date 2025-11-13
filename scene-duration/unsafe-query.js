// graphql client
// const addr = "http://localhost:9999/graphql"

const fetchDurations = async (addr, ApiKey) => {
  const query = `mutation {
    querySQL(sql: "SELECT duration from video_files") {
      rows }}`
  const response = await fetch(addr, {
    method: "POST",
    headers: { "Content-Type": "application/json", ApiKey },
    body: JSON.stringify({ query }),
  })
  const result = await response.json()
  return result.data.querySQL.rows.map(row => Math.floor(row[0]))
}

async function queryStash() {
  const addr = document.getElementById("stash-url").value || "http://localhost:9999/graphql"
  const ApiKey = document.getElementById("apikey").value
  const durations = await fetchDurations(addr, ApiKey)
  // group durations into buckets of 60 seconds
  const buckets = {}
  durations.forEach((duration) => {
    const bucket = Math.floor(duration / 60)
    if (!buckets[bucket]) {
      buckets[bucket] = 0
    }
    buckets[bucket]++
  })
  console.log("Duration Buckets (seconds):")
  console.table(buckets)
  const sum = durations.reduce((a, b) => a + b, 0)
  const sorted = durations.slice().sort((a, b) => a - b)
  const median = (() => {
    const mid = Math.floor(sorted.length / 2)
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2
    } else {
      return sorted[mid]
    }
  })()
  const sd = (() => {
    const mean = sum / durations.length
    const variance =
      durations.reduce((a, b) => a + (b - mean) ** 2, 0) / durations.length
    return Math.sqrt(variance)
  })()
  // get 90th percentile
  const percentile90 = sorted[Math.floor(0.9 * sorted.length)]
  const mean = sum / durations.length
  document.getElementById("mean").innerText = `Mean Duration: ${Math.floor(mean)} seconds`
  document.getElementById("median").innerText = `Median Duration: ${Math.floor(median)} seconds`
  document.getElementById("stddev").innerText = `Standard Deviation: +-${Math.floor(sd)} seconds`
  const minBucket = Object.keys(buckets)[0]
  const minDuration = sorted[0]
  document.getElementById("min").innerText = `Min Duration: ${minDuration} seconds (${minBucket} scenes)`
  document.getElementById("percentile90").innerText = `90th Percentile: ${percentile90} seconds`
  // bucket key for max
  const maxDuration = sorted[sorted.length - 1]
  const bucketMax = Object.keys(buckets)[Object.keys(buckets).length - 1]
  document.getElementById("max").innerText = `Max Duration: ${maxDuration} seconds (${buckets[bucketMax]} scenes)`
  document.getElementById("total").innerText = `Total Scenes: ${durations.length}`
  createChart(buckets)
}
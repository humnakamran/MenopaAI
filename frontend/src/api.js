const BASE_URL = 'http://127.0.0.1:5000'

export async function predictHealth(formData) {
  const res = await fetch(`${BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
  return res.json()
}

export async function getFeatureImportance(model = 'Menopause Stage') {
  const res = await fetch(
    `${BASE_URL}/feature-importance?model=${encodeURIComponent(model)}`
  )
  return res.json()
}

export async function chatMessage(message, predictions = null) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, predictions }),
  })
  return res.json()
}

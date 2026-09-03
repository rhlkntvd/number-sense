import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('App element not found')
}

app.innerHTML = `
  <main>
    <h1>Number Sense</h1>
  </main>
`
import './app.css'
import App from './App.svelte'

const targetElement = document.getElementById('app')

if (!targetElement) {
  throw new Error("Couldn't get the element with id 'app'")
}

const app = new App({
  target: targetElement,
})

export default app

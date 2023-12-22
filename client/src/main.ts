import './app.css'
import App from './App.svelte'

const targetElement = document.getElementById('app')

if (!targetElement) {
  throw new Error("Couldn't get the element with id 'app'")
}

targetElement.classList.add('w-dvw', 'h-dvh')

const app = new App({
  target: targetElement,
})

export default app

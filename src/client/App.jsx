import { useState } from 'react'
import reactLogo from './assets/react.svg'
import axios from 'axios'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  function apiCall() {
    axios
      .get('/api/test')
      .then((response) => {
        console.log(response)
        alert(response.data)
      })
      .catch((error) => {
        console.log('error')
        console.log(error.response)
        alert(error.response.data)
      })
  }

  function apiCallErr() {
    axios
      .get('/api/err')
      .then((response) => {
        console.log(response)
        alert(response.data)
      })
      .catch((error) => {
        console.log('error')
        console.log(error.response)
        alert(error.response.data)
      })
  }

  return (
    <div className='App'>
      <div>
        <a href='https://vitejs.dev' target='_blank'>
          <img src='/vite.svg' className='logo' alt='Vite logo' />
        </a>
        <a href='https://reactjs.org' target='_blank'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className='card'>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR!
        </p>
        <button onClick={() => apiCall()}>Api Call</button>
        <button onClick={() => apiCallErr()}>Api Call Error</button>
      </div>
      <p className='read-the-docs'>
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App

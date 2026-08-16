import Login from './Login.jsx'

export default function App() {
  const handleLogin = (session) => {
    console.log('Login exitoso:', session)
  }
  return <Login onLogin={handleLogin} />
}

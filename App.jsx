import Login from './Login'

export default function App() {
  return <Login onLogin={(session) => console.log('Sesión:', session)} />
}

import { useState } from 'react'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'

export default function App() {
  const [session, setSession] = useState(null)

  if (!session) {
    return <Login onLogin={setSession} />
  }

  return <Dashboard session={session} onLogout={() => setSession(null)} />
}

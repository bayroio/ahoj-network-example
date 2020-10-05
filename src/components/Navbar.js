import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../redanchor.png'

export const AhojNavbar = () => (
  <nav>
    <section>
      <Link to="/"><img src={logo} className="App-logo" alt="logo" /></Link>
      <Link to="/ahojdefi">Ahoj DeFi</Link>
    </section>
  </nav>
)

export default AhojNavbar;
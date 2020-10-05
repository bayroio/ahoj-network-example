import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom" 

import Navbar from './components/Navbar'
import MainPage from './pages/MainPage'
import AboutPage from './pages/AboutPage'
import ContactUsPage from './pages/ContactUsPage'
import AhojDeFiPage from './pages/AhojDeFiPage'


/*const App = () => (
  //<Navbar bg="dark">
  //  <Navbar.Brand href="#home">
  //    <img
  //      src="./redanchor.png"
  //      width="30"
  //      height="30"
  //      className="d-inline-block align-top"
  //      alt="Ahoj logo"
  //    />
  //  </Navbar.Brand>
  //  <Nav className="mr-auto">
  //    <Nav.Link href="#home">Home</Nav.Link>
  //    <Nav.Link href="#features">Features</Nav.Link>
  //    <Nav.Link href="#pricing">Pricing</Nav.Link>
  //  </Nav>
  //</Navbar>
  <Router>
    <Navbar />
    <Switch>
      <Route exact path="/" component={MainPage} />
      <Route exact path="/blog" component={() => { 
        window.location.href = 'https://medium.com/@edgarherrador'; 
        return null;
      }}/>
      <Route exact path="/about" component={AboutPage} />
      <Route exact path="/contactus" component={ContactUsPage}/>
      <Route exact path="/ahojdefi" component={AhojDeFiPage}/>
      <Redirect to="/" />
    </Switch>
  </Router>
)*/
class App extends Component {
  render() {
    return (
      <Router>
        <Navbar />
        <Switch>
          <Route exact path="/" component={MainPage} />
          <Route exact path="/ahojdefi" component={AhojDeFiPage}/>
          <Redirect to="/" />
        </Switch>
      </Router>
    )
  }
}

export default App;

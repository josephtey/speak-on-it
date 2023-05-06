import logo from "./logo.svg";
import Home from "./screens/Home";
import Chat from "./screens/Chat";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <div className="h-screen">
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/chat/:id" component={Chat} />
        </Switch>
      </Router>
      <ToastContainer />
    </div>
  );
}

export default App;

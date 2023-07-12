import logo from "./logo.svg";
import Home from "./screens/Home";
import Chat from "./screens/Chat";
import Evaluate from "./screens/Evaluate";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import HomeEssay from "./screens/HomeEssay";
import HomeSpace from "./screens/HomeSpace";
import Dashboard from "./screens/Dashboard";
import Feedback from "./screens/Feedback";
import ThankYou from "./screens/ThankYou";

function App() {
  return (
    <div>
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/teachers" component={HomeSpace} />
          <Route exact path="/dashboard" component={Dashboard} />
          <Route exact path="/pwr" component={HomeEssay} />
          <Route exact path="/thankyou" component={ThankYou} />
          <Route exact path="/chat/:id" component={Chat} />
          <Route exact path="/feedback/:id" component={Feedback} />
          <Route exact path="/evaluate/:id/" component={Evaluate} />
        </Switch>
      </Router>
      <ToastContainer />
    </div>
  );
}

export default App;

import { Router, Route } from "@solidjs/router";
import EmailList from "./components/EmailList";
import Login from "./components/Login";

function App() {
  return (
    <div class="container mx-auto p-4">
      <header class="mb-8">
        <h1 class="text-3xl font-bold">Gmail Viewer</h1>
      </header>
      <Router base="/gmail-uploader">
        <Route path="/" component={Login} />
        <Route path="/emails" component={EmailList} />
      </Router>
    </div>
  );
}

export default App;

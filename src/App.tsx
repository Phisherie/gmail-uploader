import { Router, Route } from "@solidjs/router";
import EmailList from "./components/EmailList";
import Login from "./components/Login";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <div class="container mx-auto p-4">
        <header class="mb-8">
          <h1 class="text-3xl font-bold">Gmail Viewer</h1>
        </header>
        <Router base="/gmail-uploader">
          <Route path="/" component={Login} />
          <Route path="/emails" component={EmailList} />
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;

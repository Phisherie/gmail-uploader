import { Router, Route } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import EmailList from "./components/EmailList";
import Login from "./components/Login";
import { AuthProvider } from "./context/AuthContext";
import { GoogleApiInitializer } from "./components/GoogleApiInitializer";

function App() {
  const [isInitialized, setIsInitialized] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  return (
    <AuthProvider>
      <GoogleApiInitializer
        onInitialized={() => setIsInitialized(true)}
        onError={setError}
      />
      <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div class="container mx-auto p-4">
          <header class="mb-8">
            <h1 class="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
              Gmail Sample Uploader
            </h1>
          </header>

          <Show
            when={isInitialized()}
            fallback={
              <div class="text-center">
                <Show
                  when={!error()}
                  fallback={
                    <div class="text-red-500">
                      Error loading Google APIs: {error()}
                    </div>
                  }
                >
                  <div class="text-gray-700 dark:text-gray-300">
                    Loading Google APIs...
                  </div>
                </Show>
              </div>
            }
          >
            <Router base="/gmail-uploader">
              <Route path="/" component={Login} />
              <Route path="/emails" component={EmailList} />
            </Router>
          </Show>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;

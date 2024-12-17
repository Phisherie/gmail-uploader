import { createSignal, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useAuth } from "../context/AuthContext";

const CLIENT_ID =
  "67531991276-4h6nfo4fs2kh0c9qu9rlcc5viki3smaa.apps.googleusercontent.com";
const API_KEY = "AIzaSyBb3vGJCL_uAC20ZmWOCpNi_s6UwqmYA3s";
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest";
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.insert",
  "https://www.googleapis.com/auth/gmail.modify",
].join(" ");

function Login() {
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();

  onMount(() => {
    console.log("Login");
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = gapiLoaded;
    document.body.appendChild(script);

    const scriptGsi = document.createElement("script");
    scriptGsi.src = "https://accounts.google.com/gsi/client";
    scriptGsi.onload = gisLoaded;
    document.body.appendChild(scriptGsi);
  });

  async function gapiLoaded() {
    try {
      await new Promise((resolve, reject) => {
        gapi.load("client", { callback: resolve, onerror: reject });
      });
      await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
      });
    } catch (err) {
      setError("Error initializing GAPI client");
      console.error(err);
    }
  }

  async function gisLoaded() {
    try {
      // Initialize the client with your credentials
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: async (response) => {
          if (response.error) {
            setError(response.error);
            setIsLoading(false);
            return;
          }

          // Store the access token and redirect to emails page
          const accessToken = response.access_token;
          if (accessToken) {
            setAccessToken(accessToken);
            navigate("/emails");
          }
          setIsLoading(false);
        },
      });

      // Store tokenClient for later use
      window.tokenClient = tokenClient;
    } catch (err) {
      setError("Error initializing token client");
      console.error(err);
    }
  }

  const handleLogin = () => {
    setIsLoading(true);
    if (window.tokenClient) {
      window.tokenClient.requestAccessToken();
    } else {
      setError("Authentication client not initialized");
      setIsLoading(false);
    }
  };

  return (
    <div class="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 class="text-2xl mb-6">Sign in with Google</h2>
      {error() && <div class="text-red-500 mb-4">{error()}</div>}
      <button
        onClick={handleLogin}
        disabled={isLoading()}
        class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading() ? "Loading..." : "Login with Google"}
      </button>
    </div>
  );
}

// Add TokenClient to the Window interface
declare global {
  interface Window {
    tokenClient: any;
  }
}

export default Login;

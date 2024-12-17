import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();

  const handleLogin = () => {
    setIsLoading(true);
    if (window.tokenClient) {
      window.tokenClient.callback = async (response: {
        error?: string;
        access_token?: string;
      }) => {
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
      };

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

export default Login;

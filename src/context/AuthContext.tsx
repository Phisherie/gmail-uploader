import { createContext, useContext, createSignal, JSX } from "solid-js";

interface AuthContextType {
  accessToken: () => string | null;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
}

const AUTH_TOKEN_KEY = "gmail_uploader_token";

const AuthContext = createContext<AuthContextType>();

export function AuthProvider(props: { children: JSX.Element }) {
  // Initialize from localStorage if available
  const initialToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const [accessToken, setAccessTokenState] = createSignal<string | null>(
    initialToken
  );

  const setAccessToken = (token: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setAccessTokenState(token);
  };

  const clearAccessToken = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setAccessTokenState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        clearAccessToken,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

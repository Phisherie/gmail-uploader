import { createContext, useContext, createSignal, JSX } from "solid-js";

interface AuthContextType {
  accessToken: () => string | null;
  setAccessToken: (token: string) => void;
  clearAccessToken: () => void;
}

const AuthContext = createContext<AuthContextType>();

export function AuthProvider(props: { children: JSX.Element }) {
  const [accessToken, setAccessToken] = createSignal<string | null>(null);

  const clearAccessToken = () => setAccessToken(null);

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

import { onMount } from "solid-js";

const CLIENT_ID =
  "67531991276-4h6nfo4fs2kh0c9qu9rlcc5viki3smaa.apps.googleusercontent.com";
const API_KEY = "AIzaSyBb3vGJCL_uAC20ZmWOCpNi_s6UwqmYA3s";
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest";
export const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.insert",
  "https://www.googleapis.com/auth/gmail.modify",
].join(" ");

interface Props {
  onInitialized?: () => void;
  onError?: (error: string) => void;
}

export function GoogleApiInitializer(props: Props) {
  onMount(() => {
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
      props.onInitialized?.();
    } catch (err) {
      console.error("Error initializing GAPI client:", err);
      props.onError?.("Error initializing GAPI client");
    }
  }

  async function gisLoaded() {
    try {
      // Initialize the client with your credentials
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: () => {}, // We'll handle the callback in the Login component
      });

      // Store tokenClient for later use
      window.tokenClient = tokenClient;
    } catch (err) {
      console.error("Error initializing token client:", err);
      props.onError?.("Error initializing token client");
    }
  }

  return null;
}

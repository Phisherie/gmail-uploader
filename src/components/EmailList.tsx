import { createSignal, createEffect, Show } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import EmailUploader from "./EmailUploader";

interface Email {
  id: string;
  subject: string;
  from: string;
  date: string;
}

interface MessageHeader {
  name: string;
  value: string;
}

function EmailList() {
  const [emails, setEmails] = createSignal<Email[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const checkGapiAvailable = () => {
    if (typeof gapi === "undefined" || !gapi.client || !gapi.client.gmail) {
      navigate("/gmail-uploader/");
      return false;
    }
    return true;
  };

  const loadEmails = async () => {
    try {
      console.log("loadEmails", location.hash);
      if (!checkGapiAvailable()) return;

      const accessToken = new URLSearchParams(location.hash.substring(1)).get(
        "access_token"
      );

      if (!accessToken) {
        setError("No access token found. Please login again.");
        // navigate("/");
        setLoading(false);
        return;
      }

      gapi.client.setToken({ access_token: accessToken });

      const response = await gapi.client.gmail.users.messages.list({
        userId: "me",
        maxResults: 10,
      });

      const messages = response.result.messages || [];
      const emailDetails = await Promise.all(
        messages.map(async (message) => {
          const detail = await gapi.client.gmail.users.messages.get({
            userId: "me",
            id: message.id,
          });

          const headers = detail.result.payload?.headers || [];
          const subject =
            headers.find((h: MessageHeader) => h.name === "Subject")?.value ||
            "No Subject";
          const from =
            headers.find((h: MessageHeader) => h.name === "From")?.value ||
            "Unknown";
          const date =
            headers.find((h: MessageHeader) => h.name === "Date")?.value || "";

          return {
            id: message.id,
            subject,
            from,
            date,
          };
        })
      );

      setEmails(emailDetails);
    } catch (err) {
      console.error("Error loading emails:", err);
      if (err instanceof Error && err.message.includes("Token")) {
        navigate("/gmail-uploader/");
      } else {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    if (!checkGapiAvailable()) return;
    loadEmails();
  });

  return (
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Upload Emails
        </h2>
        <EmailUploader />
      </div>

      <div class="mt-12">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Recent Emails
        </h2>
        <Show
          when={!loading()}
          fallback={
            <div class="text-center text-gray-700 dark:text-gray-300">
              Loading emails...
            </div>
          }
        >
          <Show
            when={!error()}
            fallback={<div class="text-red-500 text-center">{error()}</div>}
          >
            <div class="space-y-4">
              {emails().map((email) => (
                <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div class="flex justify-between items-start gap-4">
                    <div class="flex-grow">
                      <h3 class="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {email.subject}
                      </h3>
                      <div class="text-sm text-gray-600 dark:text-gray-400">
                        {email.from}
                      </div>
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                      {new Date(email.date).toLocaleString(undefined, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Show>
        </Show>
      </div>
    </div>
  );
}

export default EmailList;

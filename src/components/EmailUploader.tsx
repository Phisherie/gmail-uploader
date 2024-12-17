import { createSignal, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";

interface UploadStatus {
  fileName: string;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export default function EmailUploader() {
  const [uploadStatuses, setUploadStatuses] = createSignal<UploadStatus[]>([]);
  const [isDragging, setIsDragging] = createSignal(false);
  const navigate = useNavigate();

  const checkGapiAvailable = () => {
    if (typeof gapi === "undefined" || !gapi.client || !gapi.client.gmail) {
      navigate("/");
      return false;
    }
    return true;
  };

  const handleFiles = async (files: FileList) => {
    // if (!checkGapiAvailable()) return;

    const newFiles = Array.from(files).filter(
      (file) => file.name.endsWith(".eml") || file.type === "message/rfc822"
    );

    if (newFiles.length === 0) {
      return;
    }

    // Add new files to status list
    setUploadStatuses((prev) => [
      ...prev,
      ...newFiles.map((file) => ({
        fileName: file.name,
        status: "pending" as const,
      })),
    ]);

    // Process each file
    for (const file of newFiles) {
      try {
        setUploadStatuses((prev) =>
          prev.map((status) =>
            status.fileName === file.name
              ? { ...status, status: "uploading" }
              : status
          )
        );

        const content = await file.text();
        // Base64 encode the email content
        const raw = btoa(unescape(encodeURIComponent(content)))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        await gapi.client.gmail.users.messages.insert({
          userId: "me",
          internalDateSource: "dateHeader",
          raw: raw,
        });

        setUploadStatuses((prev) =>
          prev.map((status) =>
            status.fileName === file.name
              ? { ...status, status: "success" }
              : status
          )
        );
      } catch (error) {
        console.error("Error uploading file:", error);
        if (error instanceof Error && error.message.includes("Token")) {
          navigate("/");
          return;
        }
        setUploadStatuses((prev) =>
          prev.map((status) =>
            status.fileName === file.name
              ? {
                  ...status,
                  status: "error",
                  error:
                    error instanceof Error ? error.message : "Upload failed",
                }
              : status
          )
        );
      }
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div class="max-w-4xl mx-auto mt-8">
      <div
        class={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging()
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-700"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div class="mb-4">
          <label
            for="file-upload"
            class="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Choose .eml files
            <input
              id="file-upload"
              type="file"
              accept=".eml,message/rfc822"
              multiple
              class="hidden"
              onChange={(e) => {
                if (e.currentTarget.files) {
                  handleFiles(e.currentTarget.files);
                }
              }}
            />
          </label>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            or drag and drop .eml files here
          </p>
        </div>

        <Show when={uploadStatuses().length > 0}>
          <div class="mt-6 space-y-2">
            {uploadStatuses().map((status) => (
              <div
                class={`flex items-center justify-between p-3 rounded-md ${
                  status.status === "error"
                    ? "bg-red-50 dark:bg-red-900/20"
                    : "bg-gray-50 dark:bg-gray-800"
                }`}
              >
                <div class="flex-1">
                  <p
                    class={`text-sm ${
                      status.status === "error"
                        ? "text-red-700 dark:text-red-400"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {status.fileName}
                  </p>
                  <Show when={status.error}>
                    <p class="text-xs text-red-600 dark:text-red-400 mt-1">
                      {status.error}
                    </p>
                  </Show>
                </div>
                <div class="ml-4">
                  {status.status === "pending" && (
                    <span class="text-gray-500">Pending</span>
                  )}
                  {status.status === "uploading" && (
                    <span class="text-blue-500">Uploading...</span>
                  )}
                  {status.status === "success" && (
                    <span class="text-green-500">✓ Uploaded</span>
                  )}
                  {status.status === "error" && (
                    <span class="text-red-500">Failed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Show>
      </div>
    </div>
  );
}

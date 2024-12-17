declare namespace google.accounts.oauth2 {
  interface TokenResponse {
    access_token: string;
    error?: string;
  }

  interface TokenClient {
    requestAccessToken(): void;
  }

  function initTokenClient(config: {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
  }): TokenClient;
}

declare namespace gapi.client.gmail {
  interface Message {
    id: string;
    payload?: {
      headers?: Array<{
        name: string;
        value: string;
      }>;
    };
  }

  interface ListMessagesResponse {
    messages?: Array<{ id: string }>;
  }

  interface GmailResponse<T> {
    result: T;
  }

  interface InsertRequest {
    userId: string;
    internalDateSource?: "dateHeader" | "receivedTime";
    raw?: string;
  }

  namespace users.messages {
    function list(params: {
      userId: string;
      maxResults?: number;
    }): Promise<GmailResponse<ListMessagesResponse>>;

    function get(params: {
      userId: string;
      id: string;
    }): Promise<GmailResponse<Message>>;

    function insert(params: InsertRequest): Promise<GmailResponse<Message>>;
  }
}

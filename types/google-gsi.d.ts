export {};

declare global {
  interface GoogleCredentialResponse {
    credential: string;
    select_by?: string;
  }

  interface GoogleButtonOptions {
    type?: "standard" | "icon";
    theme?: "outline" | "filled_blue" | "filled_black";
    size?: "large" | "medium" | "small";
    text?: "signin_with" | "signup_with" | "continue_with" | "signin";
    shape?: "rectangular" | "pill" | "circle" | "square";
    logo_alignment?: "left" | "center";
    width?: number;
    locale?: string;
  }

  interface GoogleIdentityServices {
    initialize(options: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
      ux_mode?: "popup" | "redirect";
      auto_select?: boolean;
      cancel_on_tap_outside?: boolean;
    }): void;
    renderButton(parent: HTMLElement, options?: GoogleButtonOptions): void;
    prompt(): void;
    disableAutoSelect(): void;
  }

  interface Window {
    google?: {
      accounts: {
        id: GoogleIdentityServices;
      };
    };
  }
}

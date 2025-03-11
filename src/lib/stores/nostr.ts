import { writable } from 'svelte/store';
import NDK from '@nostr-dev-kit/ndk';

class NostrService {
  private static instance: NostrService;
  private ndk: NDK;
  private _isConnecting: boolean = false;
  private _isConnected: boolean = false;

  private constructor() {
    this.ndk = new NDK({
      explicitRelayUrls: [
        "wss://relay.nostr.net",
        "wss://relay.damus.io",
        "wss://relay.primal.net",
      ],
    });
  }

  public static getInstance(): NostrService {
    if (!NostrService.instance) {
      NostrService.instance = new NostrService();
    }
    return NostrService.instance;
  }

  public async connect(): Promise<void> {
    if (this._isConnected || this._isConnecting) return;
    
    this._isConnecting = true;
    try {
      await this.ndk.connect();
      this._isConnected = true;
    } finally {
      this._isConnecting = false;
    }
  }

  public get isConnected(): boolean {
    return this._isConnected;
  }

  public get isConnecting(): boolean {
    return this._isConnecting;
  }

  public get ndkInstance(): NDK {
    return this.ndk;
  }
}

// Create a writable store with the NostrService instance
export const nostrStore = writable(NostrService.getInstance());

// Export the singleton instance directly as well
export const nostrService = NostrService.getInstance(); 
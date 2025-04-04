import NDK from '@nostr-dev-kit/ndk';
import { writable } from 'svelte/store';

// export const appRelay = ['wss://relay.dvmcp.fun'];
export const explicitRelayUrls = [
	// ...appRelay
	// 'wss://relay.nostr.net',
	// 'wss://relay.damus.io',
	// 'wss://purplepag.es',
	// 'wss://relay.nostrdvm.com'
	'ws://localhost:10547'
];
export const ndk: NDK = new NDK({
	explicitRelayUrls,
	autoConnectUserRelays: true
	// cacheAdapter,
});

ndk.connect().then(() => console.log('ndk connected successfully'));

const ndkStore = writable(ndk);

export default ndkStore;

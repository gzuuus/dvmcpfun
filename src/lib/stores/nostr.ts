import NDK from '@nostr-dev-kit/ndk';
import { writable } from 'svelte/store';

export const appRelay = ['wss://relay.dvmcp.fun'];
export const generalRelays = ['wss://relay.nostr.net', 'wss://relay.damus.io', 'wss://nos.lol'];
export const userMetaRelays = [
	'wss://0.kindpag.es/',
	'wss://purplepag.es',
	'wss://relay.nostr.net'
];
export const explicitRelayUrls = [
	...appRelay
	// 'wss://relay.nostrdvm.com'
	// 'ws://localhost:10547'
];
export const ndk: NDK = new NDK({
	explicitRelayUrls,
	autoConnectUserRelays: true
	// cacheAdapter,
});

export const ndkProfile: NDK = new NDK({
	explicitRelayUrls: userMetaRelays
});

ndk.connect().then(() => console.log('ndk connected successfully'));

ndkProfile.connect().then(() => console.log('ndkProfile connected successfully'));

const ndkStore = writable(ndk);

export default ndkStore;

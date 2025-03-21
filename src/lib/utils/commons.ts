import type { DVMCPContent } from '$lib/types';
import { decode } from 'nostr-tools/nip19';

export function parseAnnouncementContent(content: string): DVMCPContent | null {
	try {
		return JSON.parse(content);
	} catch {
		return null;
	}
}

export const decodePk = (pk: string | null | undefined) => {
	if (!pk) return null;
	return pk.startsWith('npub') ? decode(pk).data.toString() : pk;
};

export function getHexColorFingerprintFromHexPubkey(input: string): string {
	const hexpub = input.startsWith('npub') ? decodePk(input) : input;
	return `#${hexpub?.slice(0, 6)}`;
}

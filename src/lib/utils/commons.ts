import { decode } from 'nostr-tools/nip19';
import type { JSONSchema7 } from 'json-schema';

export function parseAnnouncementContent<T>(content: string): T | null {
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

export function filterOptionalParameters(
	params: Record<string, unknown> | undefined,
	schema: JSONSchema7
): Record<string, unknown> {
	const requiredParams = (schema.required || []) as string[];

	return Object.entries(params || {}).reduce(
		(acc, [key, value]) => {
			if (requiredParams.includes(key)) {
				acc[key] = value;
				return acc;
			}

			if (Array.isArray(value)) {
				if (value.length > 0) {
					acc[key] = value;
				}
			} else if (value !== undefined && value !== null && value !== '') {
				acc[key] = value;
			}
			return acc;
		},
		{} as Record<string, unknown>
	);
}

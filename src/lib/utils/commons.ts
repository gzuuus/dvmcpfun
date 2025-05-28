import { decode } from 'nostr-tools/nip19';
import type { JSONSchema7 } from 'json-schema';
import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { TAG_CAPABILITY } from '@dvmcp/commons/core';
import type { CapPricing, GenericCapabilityList } from '$lib/types';
import { logger } from '$lib/utils/logger';

export function parseContent<T>(content: string): T | null {
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

export function parseCapabilityListEvent<T>(
	event: NDKEvent,
	capabilityType: string,
	contentParser: (content: string) => T | null
): GenericCapabilityList<T> | null {
	try {
		const parsedContent = contentParser(event.content);
		if (!parsedContent) return null;

		const pricing = new Map<string, CapPricing>();
		event.tags
			.filter((tag) => tag[0] === TAG_CAPABILITY && tag.length >= 4)
			.forEach((tag) => {
				const [_, name, price, unit] = tag;
				if (name && price && unit) {
					pricing.set(name, { price, unit });
				}
			});

		return {
			content: parsedContent,
			pricing: pricing
		};
	} catch (error) {
		logger.error(`Error parsing ${capabilityType} list`, error, 'commons:parseCapabilityListEvent');
		return null;
	}
}

import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { parseAnnouncementContent } from './commons';
import type { CapPricing, PromptsList } from '$lib/types';
import { TAG_CAPABILITY } from '@dvmcp/commons/core';
import type { Prompt } from '@modelcontextprotocol/sdk/types.js';

/**
 * Parse a prompts list event (kind 31319)
 * According to the new DVMCP spec, prompts list events contain:
 * - A list of prompts in the content
 * - Pricing information in the cap tags
 *
 * @param event The prompts list event
 * @returns A PromptsList object or null if parsing fails
 */
export const parsePromptsList = (event: NDKEvent): PromptsList | null => {
	try {
		const parsedContent = parseAnnouncementContent<{ prompts: Prompt[] }>(event.content);
		if (!parsedContent || !parsedContent.prompts) return null;

		// Extract prompt pricing information from cap tags
		const promptsPricing = new Map<string, CapPricing>();
		event.tags
			.filter((tag) => tag[0] === TAG_CAPABILITY && tag.length >= 4)
			.forEach((tag) => {
				const [_, promptName, price, unit] = tag;
				if (promptName && price && unit) {
					promptsPricing.set(promptName, { price, unit });
				}
			});

		// Return the prompts list with pricing information
		return {
			prompts: parsedContent.prompts,
			promptsPricing
		};
	} catch (error) {
		console.error('Error parsing prompts list:', error);
		return null;
	}
};

import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { parseContent, parseCapabilityListEvent } from './commons';
import type { CapPricing, PromptsList } from '$lib/types';
import type { ListPromptsResult } from '@modelcontextprotocol/sdk/types.js';

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
	const result = parseCapabilityListEvent<ListPromptsResult>(event, 'prompt', parseContent);

	if (!result || !result.content?.prompts) {
		return null;
	}

	return {
		prompts: result.content.prompts,
		promptsPricing: result.pricing
	};
};

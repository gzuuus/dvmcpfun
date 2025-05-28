import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { parseContent, parseCapabilityListEvent } from './commons';
import type { CapPricing, ResourcesList, ResourcesTemplatesList } from '$lib/types';
import type { Resource, ResourceTemplate } from '@modelcontextprotocol/sdk/types.js';

/**
 * Parse a resources list event (kind 31318)
 * According to the new DVMCP spec, resources list events contain:
 * - A list of resources or resource templates in the content
 * - Pricing information in the cap tags
 *
 * @param event The resources list event
 * @returns A ResourcesList or ResourcesTemplatesList object or null if parsing fails
 */
export const parseResourcesList = (
	event: NDKEvent
): ResourcesList | ResourcesTemplatesList | null => {
	const result = parseCapabilityListEvent<{
		resources?: Resource[];
		resourceTemplates?: ResourceTemplate[];
	}>(event, 'resource', parseContent);

	if (!result || (!result.content?.resources && !result.content?.resourceTemplates)) {
		return null;
	}

	if (result.content.resources) {
		return {
			resources: result.content.resources,
			resourcesPricing: result.pricing
		};
	} else if (result.content.resourceTemplates) {
		return {
			resourceTemplates: result.content.resourceTemplates,
			resourceTemplatesPricing: result.pricing
		};
	}

	return null;
};

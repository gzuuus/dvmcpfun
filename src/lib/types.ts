import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { NostrEvent } from '@nostr-dev-kit/ndk';

export interface ToolPricing {
	price: string;
	unit: string;
}

export interface PaymentInfo {
	invoice: string;
	amount: string;
	unit: string;
	eventId: string;
	pubkey: string;
}

export interface DVMCPContent {
	name: string;
	about: string;
	picture?: string;
	website?: string;
	banner?: string;
	tools: Tool[];
}

export interface ExtendedDVMCP extends DVMCPContent {
	event: NostrEvent;
	capabilities: string[];
	toolNames: string[];
	toolPricing?: Map<string, ToolPricing>;
}

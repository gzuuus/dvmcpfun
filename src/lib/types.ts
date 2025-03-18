import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { NostrEvent } from '@nostr-dev-kit/ndk';

export interface DVMCPContent {
	name: string;
	about: string;
	tools: Tool[];
}

export interface ExtendedDVMCP extends DVMCPContent {
	event: NostrEvent;
	capabilities: string[];
	toolNames: string[];
}

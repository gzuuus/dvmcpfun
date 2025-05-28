import type {
	Implementation,
	Prompt,
	Resource,
	ResourceTemplate,
	Tool
} from '@modelcontextprotocol/sdk/types.js';

export interface CapPricing {
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
	name?: string;
	about?: string;
	picture?: string;
	website?: string;
	banner?: string;
}

export interface ProviderServerMeta extends DVMCPContent {
	providerPubkey?: string;
	serverId?: string;
}

// Server with metadata
export interface ServerWithMeta {
	server: Implementation;
	meta: ProviderServerMeta;
}

// Tools list (kind 31317)
export interface ToolsList {
	tools: Tool[];
	toolsPricing?: Map<string, CapPricing>;
}

// Tools list with provider metadata

export type ToolsListWithProvider = ToolsList & ProviderServerMeta;

// Resources list (kind 31318)
export interface ResourcesList {
	resources?: Resource[];
	resourcesPricing?: Map<string, CapPricing>;
}

// Resources list with provider metadata
export type ResourcesListWithProvider = ResourcesList & ProviderServerMeta;

export interface ResourcesTemplatesList {
	resourceTemplates?: ResourceTemplate[];
	resourceTemplatesPricing?: Map<string, CapPricing>;
}

// Resources templates list with provider metadata
export type ResourcesTemplatesListWithProvider = ResourcesTemplatesList & ProviderServerMeta;

// Prompts list (kind 31319)
export interface PromptsList {
	prompts: Prompt[];
	promptsPricing?: Map<string, CapPricing>;
}

// Prompts list with provider metadata
export type PromptsListWithProvider = PromptsList & ProviderServerMeta;

// Legacy interface for backward compatibility
export interface DVMAnnouncement extends DVMCPContent, ProviderServerMeta {
	tools: Tool[];
	resources?: Resource[];
	prompts?: Prompt[];
}

export interface GenericCapabilityList<T> {
	content: T | null;
	pricing: Map<string, CapPricing>;
}

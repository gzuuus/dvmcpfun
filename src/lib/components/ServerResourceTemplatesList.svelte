<script lang="ts">
	import type { ResourceTemplate } from '@modelcontextprotocol/sdk/types.js';
	import type { ResourcesTemplatesListWithProvider } from '$lib/types';
	import Spinner from './spinner.svelte';
	import CapabilityCard from './CapabilityCard.svelte';

	// Props
	export let resourceTemplatesData: ResourcesTemplatesListWithProvider | null | undefined =
		undefined;
	export let isLoading: boolean = false;
	export let error: Error | null = null;
	export let onSelectResourceTemplate: (template: ResourceTemplate) => void = () => {};

	// Computed property for resource templates
	$: resourceTemplates = resourceTemplatesData?.resourceTemplates || [];
	$: hasResourceTemplates = resourceTemplates.length > 0;
</script>

<section>
	{#if isLoading}
		<div class="flex h-full w-full items-center justify-center py-4">
			<Spinner />
		</div>
	{:else if error}
		<div class="py-2 text-destructive">
			Error loading resource templates: {error.message}
		</div>
	{:else if hasResourceTemplates}
		<div class="mb-6">
			<h3 class="mb-3 text-lg font-semibold text-primary">Resource Templates</h3>
			<div class="space-y-2">
				{#each resourceTemplates as template}
					{@const pricing =
						resourceTemplatesData?.resourceTemplatesPricing?.get(template.uriTemplate) ||
						resourceTemplatesData?.resourceTemplatesPricing?.get(template.name)}
					<CapabilityCard
						name={template.name}
						description={template.description}
						price={typeof pricing?.price === 'string' ? parseFloat(pricing.price) : pricing?.price}
						unit={pricing?.unit}
						type="resourceTemplate"
						mimeType={template.mimeType}
						uriTemplate={template.uriTemplate}
						capability={template}
						onSelect={onSelectResourceTemplate}
					/>
				{/each}
			</div>
		</div>
	{:else}
		<div class="py-2 text-foreground/70">No resource templates available.</div>
	{/if}
</section>

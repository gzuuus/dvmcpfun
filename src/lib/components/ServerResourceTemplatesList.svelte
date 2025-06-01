<script lang="ts">
	import type { ResourceTemplate } from '@modelcontextprotocol/sdk/types.js';
	import type { ResourcesTemplatesListWithProvider } from '$lib/types';
	import Spinner from './spinner.svelte';
	import CapabilityCard from './CapabilityCard.svelte';

	// Props
	let {
		resourceTemplatesData = undefined,
		isLoading = false,
		error = null,
		onSelectResourceTemplate = () => {}
	}: {
		resourceTemplatesData?: ResourcesTemplatesListWithProvider;
		isLoading?: boolean;
		error: Error | null;
		onSelectResourceTemplate?: (resourceTemplate: ResourceTemplate) => void;
	} = $props();

	// Computed property for resource templates
	const resourceTemplates = $derived(resourceTemplatesData?.resourceTemplates || []);
	const hasResourceTemplates = $derived(resourceTemplates.length > 0);
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
						type="resourceTemplates"
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

<script lang="ts">
	import type { ResourceTemplate } from '@modelcontextprotocol/sdk/types.js';
	import type { ResourcesTemplatesListWithProvider } from '$lib/types';
	import Spinner from './spinner.svelte';

	// Props
	export let resourceTemplatesData: ResourcesTemplatesListWithProvider | null | undefined =
		undefined;
	export let isLoading: boolean = false;
	export let error: Error | null = null;
	export let onSelectResourceTemplate: (template: ResourceTemplate) => void = () => {};

	// Helper function to get pricing for a resource template
	function getResourceTemplatePricing(name: string) {
		return resourceTemplatesData?.resourceTemplatesPricing?.get(name);
	}

	// Computed property for resource templates
	$: resourceTemplates = resourceTemplatesData?.resourceTemplates || [];
	$: hasResourceTemplates = resourceTemplates.length > 0;
</script>

<div>
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
					<div
						class="cursor-pointer rounded-lg border border-primary/20 bg-background p-3 transition-colors hover:border-primary/40"
						on:click={() => onSelectResourceTemplate(template)}
						on:keydown={(e) => e.key === 'Enter' && onSelectResourceTemplate(template)}
						tabindex="0"
						role="button"
					>
						<div class="flex items-center justify-between">
							<h4 class="text-base font-medium text-primary">{template.name}</h4>
							{#if getResourceTemplatePricing(template.name)}
								{@const pricing = getResourceTemplatePricing(template.name)}
								<span class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
									Price: {pricing?.price}
									{pricing?.unit}
								</span>
							{/if}
						</div>
						{#if template.description}
							<p class="mt-1 text-sm text-foreground">{template.description}</p>
						{/if}
						{#if template.mimeType}
							<p class="mt-1 text-xs text-foreground/70">Type: {template.mimeType}</p>
						{/if}
						<p class="mt-1 truncate text-xs text-foreground/70">
							Template: {template.uriTemplate}
						</p>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="py-2 text-foreground/70">No resource templates available.</div>
	{/if}
</div>

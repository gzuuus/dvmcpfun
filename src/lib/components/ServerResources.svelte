<script lang="ts">
	import { createResourcesListQuery } from '$lib/queries/servers';
	import Spinner from './spinner.svelte';
	import type { Resource, ResourceTemplate } from '@modelcontextprotocol/sdk/types.js';

	// Props
	export let serverId: string;
	export let onSelectResource: (resource: Resource) => void = () => {};
	export let onSelectResourceTemplate: (template: ResourceTemplate) => void = () => {};

	// Fetch resources list for this server
	$: resourcesListQuery = serverId ? createResourcesListQuery(serverId) : undefined;
</script>

<div>
	{#if !resourcesListQuery}
		<div class="py-2 text-foreground/70">No server ID provided.</div>
	{:else if $resourcesListQuery?.isLoading}
		<div class="flex h-full w-full items-center justify-center py-4">
			<Spinner />
		</div>
	{:else if $resourcesListQuery?.error}
		<div class="py-2 text-destructive">
			Error loading resources: {$resourcesListQuery?.error?.message}
		</div>
	{:else if $resourcesListQuery?.data}
		<!-- Resources Section -->
		{#if 'resources' in $resourcesListQuery?.data && $resourcesListQuery?.data?.resources && $resourcesListQuery?.data?.resources.length > 0}
			<div class="mb-6">
				<h3 class="mb-3 text-lg font-semibold text-primary">Resources</h3>
				<div class="space-y-2">
					{#each $resourcesListQuery?.data?.resources || [] as resource}
						<div
							class="cursor-pointer rounded-lg border border-primary/20 bg-background p-3 transition-colors hover:border-primary/40"
							on:click={() => onSelectResource(resource)}
							on:keydown={(e) => e.key === 'Enter' && onSelectResource(resource)}
							tabindex="0"
							role="button"
						>
							<div class="flex items-center justify-between">
								<h4 class="text-base font-medium text-primary">{resource.name}</h4>
								{#if $resourcesListQuery?.data?.resourcesPricing && $resourcesListQuery?.data?.resourcesPricing.get(resource.name)}
									<span
										class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
									>
										Price: {$resourcesListQuery?.data?.resourcesPricing.get(resource.name)?.price}
										{$resourcesListQuery?.data?.resourcesPricing.get(resource.name)?.unit}
									</span>
								{/if}
							</div>
							{#if resource.description}
								<p class="mt-1 text-sm text-foreground">{resource.description}</p>
							{/if}
							{#if resource.mimeType}
								<p class="mt-1 text-xs text-foreground/70">Type: {resource.mimeType}</p>
							{/if}
							<p class="mt-1 truncate text-xs text-foreground/70">URI: {resource.uri}</p>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Resource Templates Section -->
		{#if 'resourceTemplates' in $resourcesListQuery?.data && $resourcesListQuery?.data?.resourceTemplates && $resourcesListQuery?.data?.resourceTemplates.length > 0}
			<div>
				<h3 class="mb-3 text-lg font-semibold text-primary">Resource Templates</h3>
				<div class="space-y-2">
					{#each $resourcesListQuery?.data?.resourceTemplates || [] as template}
						<div
							class="cursor-pointer rounded-lg border border-primary/20 bg-background p-3 transition-colors hover:border-primary/40"
							on:click={() => onSelectResourceTemplate(template)}
							on:keydown={(e) => e.key === 'Enter' && onSelectResourceTemplate(template)}
							tabindex="0"
							role="button"
						>
							<div class="flex items-center justify-between">
								<h4 class="text-base font-medium text-primary">{template.name}</h4>
								{#if $resourcesListQuery?.data?.resourcesTemplatesPricing?.get(template.name)}
									<span
										class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
									>
										Price: {$resourcesListQuery?.data?.resourcesTemplatesPricing?.get(template.name)
											?.price}
										{$resourcesListQuery?.data?.resourcesTemplatesPricing?.get(template.name)?.unit}
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
		{/if}

		{#if (!('resources' in $resourcesListQuery.data) || !$resourcesListQuery.data.resources || $resourcesListQuery.data.resources.length === 0) && (!('resourceTemplates' in $resourcesListQuery.data) || !$resourcesListQuery.data.resourceTemplates || $resourcesListQuery.data.resourceTemplates.length === 0)}
			<div class="py-2 text-foreground/70">No resources available for this server.</div>
		{/if}
	{:else}
		<div class="py-2 text-foreground/70">No resources available for this server.</div>
	{/if}
</div>

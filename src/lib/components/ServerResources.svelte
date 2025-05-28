<script lang="ts">
	import { createResourcesListQuery } from '$lib/queries/servers';
	import type { Resource, ResourceTemplate } from '@modelcontextprotocol/sdk/types.js';
	import ServerResourcesList from './ServerResourcesList.svelte';
	import ServerResourceTemplatesList from './ServerResourceTemplatesList.svelte';

	// Props
	export let serverId: string;
	export let onSelectResource: (resource: Resource) => void = () => {};
	export let onSelectResourceTemplate: (template: ResourceTemplate) => void = () => {};

	// Fetch resources and resource templates for this server
	$: resourcesQuery = serverId ? createResourcesListQuery(serverId) : undefined;

	// Extract resources and resource templates data from the combined result
	$: resourcesData = $resourcesQuery?.data?.resources || null;
	$: resourceTemplatesData = $resourcesQuery?.data?.resourceTemplates || null;

	// Track if we have any resources or templates
	$: hasResources = resourcesData?.resources && resourcesData.resources.length > 0;
	$: hasResourceTemplates =
		resourceTemplatesData?.resourceTemplates && resourceTemplatesData.resourceTemplates.length > 0;
</script>

<div>
	{#if !serverId}
		<div class="py-2 text-foreground/70">No server ID provided.</div>
	{:else}
		<!-- Resources Section -->
		<ServerResourcesList
			{resourcesData}
			isLoading={$resourcesQuery?.isLoading}
			error={$resourcesQuery?.error}
			{onSelectResource}
		/>

		<!-- Resource Templates Section -->
		<ServerResourceTemplatesList
			{resourceTemplatesData}
			isLoading={$resourcesQuery?.isLoading}
			error={$resourcesQuery?.error}
			{onSelectResourceTemplate}
		/>

		{#if !hasResources && !hasResourceTemplates && !$resourcesQuery?.isLoading && !$resourcesQuery?.error}
			<div class="py-2 text-foreground/70">
				No resources or resource templates available for this server.
			</div>
		{/if}
	{/if}
</div>

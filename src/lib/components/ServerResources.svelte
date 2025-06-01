<script lang="ts">
	import { createResourcesListQuery } from '$lib/queries/servers';
	import type { Resource, ResourceTemplate } from '@modelcontextprotocol/sdk/types.js';
	import ServerResourcesList from './ServerResourcesList.svelte';
	import ServerResourceTemplatesList from './ServerResourceTemplatesList.svelte';

	let {
		serverId,
		onSelectResource = () => {},
		onSelectResourceTemplate = () => {}
	}: {
		serverId: string;
		onSelectResource?: (resource: Resource) => void;
		onSelectResourceTemplate?: (resourceTemplate: ResourceTemplate) => void;
	} = $props();

	const resourcesQuery = $derived(serverId ? createResourcesListQuery(serverId) : undefined);

	const resourcesData = $derived($resourcesQuery?.data?.resources || null);
	const resourceTemplatesData = $derived($resourcesQuery?.data?.resourceTemplates || null);
	const hasResources = $derived(resourcesData?.resources && resourcesData.resources.length > 0);
	const hasResourceTemplates = $derived(
		resourceTemplatesData?.resourceTemplates && resourceTemplatesData.resourceTemplates.length > 0
	);
</script>

<div>
	{#if !serverId}
		<div class="py-2 text-foreground/70">No server ID provided.</div>
	{:else if $resourcesQuery?.data}
		<ServerResourcesList
			resourcesData={resourcesData || undefined}
			isLoading={$resourcesQuery?.isLoading}
			error={$resourcesQuery?.error}
			{onSelectResource}
		/>

		<ServerResourceTemplatesList
			resourceTemplatesData={resourceTemplatesData || undefined}
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

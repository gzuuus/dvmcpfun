<script lang="ts">
	import { createResourcesListQuery } from '$lib/queries/servers';
	import type { Resource, ResourceTemplate } from '@modelcontextprotocol/sdk/types.js';
	import ServerResourcesList from './ServerResourcesList.svelte';
	import ServerResourceTemplatesList from './ServerResourceTemplatesList.svelte';

	export let serverId: string;
	export let onSelectResource: (resource: Resource) => void = () => {};
	export let onSelectResourceTemplate: (template: ResourceTemplate) => void = () => {};

	$: resourcesQuery = serverId ? createResourcesListQuery(serverId) : undefined;

	$: resourcesData = $resourcesQuery?.data?.resources || null;
	$: resourceTemplatesData = $resourcesQuery?.data?.resourceTemplates || null;
	$: hasResources = resourcesData?.resources && resourcesData.resources.length > 0;
	$: hasResourceTemplates =
		resourceTemplatesData?.resourceTemplates && resourceTemplatesData.resourceTemplates.length > 0;
</script>

<div>
	{#if !serverId}
		<div class="py-2 text-foreground/70">No server ID provided.</div>
	{:else if $resourcesQuery?.data}
		<ServerResourcesList
			{resourcesData}
			isLoading={$resourcesQuery?.isLoading}
			error={$resourcesQuery?.error}
			{onSelectResource}
		/>

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

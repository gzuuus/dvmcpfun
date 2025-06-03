<script lang="ts">
	import {
		createPromptsListQuery,
		createResourcesListQuery,
		createToolsListQuery
	} from '$lib/queries/servers';
	import type { Implementation } from '@modelcontextprotocol/sdk/types.js';

	let {
		server,
		id
	}: {
		server: Implementation;
		id?: string;
	} = $props();

	const toolsListQuery = $derived(id ? createToolsListQuery(id) : undefined);

	const resourcesListQuery = $derived(id ? createResourcesListQuery(id) : undefined);

	const promptsListQuery = $derived(id ? createPromptsListQuery(id) : undefined);
</script>

<div class="flex flex-wrap gap-2">
	{#if server.capabilities}
		{#if $toolsListQuery?.data?.tools?.length}
			<span class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
				Tools
			</span>
		{/if}
		{#if $resourcesListQuery?.data?.resources}
			<span class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
				Resources
			</span>
		{/if}
		{#if $promptsListQuery?.data?.prompts?.length}
			<span class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
				Prompts
			</span>
		{/if}
	{/if}
</div>

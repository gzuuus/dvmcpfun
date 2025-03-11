<script lang="ts">
	import { createToolsQuery } from '$lib/queries/tools';
	import type { McpTool } from '$lib/queries/tools';

	const toolsQuery = createToolsQuery();
</script>

<div class="p-4">
	<h1 class="text-2xl font-bold mb-4">MCP Tools</h1>

	{#if $toolsQuery.isLoading}
		<p>Loading tools...</p>
	{:else if $toolsQuery.isError}
		<p class="text-red-500">Error: {$toolsQuery.error.message}</p>
	{:else if $toolsQuery.data}
		<div class="space-y-4">
			{#each $toolsQuery.data as tool (tool.eventId)}
				<div class="border p-4 rounded-lg">
					<div class="mb-2">
						<h2 class="text-xl font-semibold">{tool.name}</h2>
						<p class="text-gray-600">{tool.description}</p>
					</div>
					
					{#if tool.parameters}
						<div class="mt-4">
							<h3 class="text-sm font-semibold text-gray-500 mb-2">Parameters:</h3>
							<pre class="bg-gray-50 p-2 rounded text-sm font-mono">{JSON.stringify(tool.parameters, null, 2)}</pre>
						</div>
					{/if}

					<div class="mt-4 text-sm text-gray-500">
						<p>Author: {tool.author}</p>
						<p>Event ID: {tool.eventId}</p>
					</div>

					{#if tool.rawContent}
						<details class="mt-4">
							<summary class="text-sm text-gray-500 cursor-pointer">Raw Content</summary>
							<pre class="mt-2 bg-gray-50 p-2 rounded text-sm font-mono overflow-auto">{JSON.stringify(tool.rawContent, null, 2)}</pre>
						</details>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div> 
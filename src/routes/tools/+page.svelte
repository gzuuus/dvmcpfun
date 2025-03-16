<script lang="ts">
	import { createToolsQuery } from '$lib/queries/tools';

	const toolsQuery = createToolsQuery();
</script>

<div class="p-4">
	<h1 class="mb-4 text-2xl font-bold">MCP Tools</h1>

	{#if $toolsQuery.isLoading}
		<p>Loading tools...</p>
	{:else if $toolsQuery.isError}
		<p class="text-red-500">Error: {$toolsQuery.error.message}</p>
	{:else if $toolsQuery.data}
		<div class="space-y-4">
			{#each $toolsQuery.data as tool (tool.eventId)}
				<div class="rounded-lg border p-4">
					<div class="mb-2">
						<h2 class="text-xl font-semibold">{tool.name}</h2>
						<p class="text-gray-600">{tool.description}</p>
					</div>

					{#if tool.parameters}
						<div class="mt-4">
							<h3 class="mb-2 text-sm font-semibold text-gray-500">Parameters:</h3>
							<pre class="rounded bg-gray-50 p-2 font-mono text-sm">{JSON.stringify(
									tool.parameters,
									null,
									2
								)}</pre>
						</div>
					{/if}

					<div class="mt-4 text-sm text-gray-500">
						<p>Author: {tool.author}</p>
						<p>Event ID: {tool.eventId}</p>
					</div>

					{#if tool.rawContent}
						<details class="mt-4">
							<summary class="cursor-pointer text-sm text-gray-500">Raw Content</summary>
							<pre
								class="mt-2 overflow-auto rounded bg-gray-50 p-2 font-mono text-sm">{JSON.stringify(
									tool.rawContent,
									null,
									2
								)}</pre>
						</details>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

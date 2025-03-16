<script lang="ts">
	import { page } from '$app/stores';
	import { createToolQuery } from '$lib/queries/tools';
	import { setThemeContext } from '@sjsf/shadcn-theme';
	import { components } from '@sjsf/shadcn-theme/default';
	import ToolForm from '../../../components/ToolForm.svelte';

	const toolQuery = createToolQuery($page.params.id);

	// Set up shadcn theme
	setThemeContext({ components });
</script>

<main class="mx-auto max-w-7xl px-6 py-8">
	<a
		href="/"
		class="mb-8 inline-flex items-center text-primary transition-colors hover:text-primary/80"
	>
		<span class="mr-2">←</span>
		Back to Tools
	</a>

	{#if $toolQuery.isLoading}
		<div class="animate-pulse space-y-6">
			<div class="h-8 w-1/3 rounded bg-border/20"></div>
			<div class="h-4 w-2/3 rounded bg-border/20"></div>
			<div class="rounded-lg border border-primary/20 p-6">
				<div class="mb-4 h-4 w-1/2 rounded bg-border/20"></div>
				<div class="h-4 w-3/4 rounded bg-border/20"></div>
			</div>
		</div>
	{:else if $toolQuery.isError}
		<div class="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-red-400">
			Error: {$toolQuery.error.message}
		</div>
	{:else if $toolQuery.data}
		<div class="space-y-6">
			<!-- Tool Card -->
			<div class="rounded-lg border border-primary/20 bg-background p-6">
				<h1 class="mb-2 text-3xl font-bold text-primary">{$toolQuery.data.name}</h1>
				<p class="mb-6 text-lg text-primary/50">{$toolQuery.data.description}</p>

				{#if $toolQuery.data.about}
					<div class="mb-6">
						<h2 class="mb-3 text-xl font-semibold text-primary">About</h2>
						<p class="text-primary/50">{$toolQuery.data.about}</p>
					</div>
				{/if}
				<div class="mb-6 flex flex-wrap gap-2">
					{#if $toolQuery.data.toolNames && $toolQuery.data.toolNames.length > 0}
						{#each $toolQuery.data.toolNames as toolName}
							<span
								class="overflow-hidden overflow-ellipsis whitespace-nowrap rounded-full bg-border/20 px-3 py-1 text-sm text-primary"
							>
								{toolName}
							</span>
						{/each}
					{/if}
				</div>
				{#if $toolQuery.data.capabilities && $toolQuery.data.capabilities.length > 0}
					<div class="mb-6">
						<h2 class="mb-3 text-xl font-semibold text-primary">Capabilities</h2>
						<div class="flex flex-wrap gap-2">
							{#each $toolQuery.data.capabilities as capability}
								<span class="rounded-full bg-border/20 px-3 py-1 text-sm text-primary">
									{capability}
								</span>
							{/each}
						</div>
					</div>
				{/if}

				{#if $toolQuery.data.parameters}
					<div class="mb-6">
						<h2 class="mb-3 text-xl font-semibold text-primary">Parameters</h2>
						<div class="rounded-lg border border-primary/20 bg-background p-4">
							<pre class="overflow-auto font-mono text-sm text-primary/50">{JSON.stringify(
									$toolQuery.data.parameters,
									null,
									2
								)}</pre>
						</div>
					</div>
				{/if}

				<div class="text-sm text-primary/50">
					<p>Author: {$toolQuery.data.author}</p>
					<p>Event ID: {$toolQuery.data.eventId}</p>
				</div>
			</div>

			<!-- Try it out section -->
			<div class="rounded-lg border border-primary/20 bg-background p-6">
				<h2 class="mb-3 text-xl font-semibold text-primary">Try it out</h2>
				{#if $toolQuery.data?.rawContent?.parsed?.tools?.length > 0}
					<div class="space-y-8">
						{#each $toolQuery.data.rawContent.parsed.tools as tool}
							<ToolForm {tool} provider={$toolQuery.data} />
						{/each}
					</div>
				{:else}
					<p class="text-primary/50">This MCP server has no tools with input schemas to try out.</p>
				{/if}
			</div>

			<!-- Raw Data -->
			<div class="rounded-lg border border-primary/20 bg-background p-6">
				<h2 class="mb-3 text-xl font-semibold text-primary">Raw Data</h2>
				<div class="rounded-lg border border-primary/20 bg-background p-4">
					<pre class="overflow-auto font-mono text-sm text-primary/50">{JSON.stringify(
							$toolQuery.data.rawContent,
							null,
							2
						)}</pre>
				</div>
			</div>
		</div>
	{/if}
</main>

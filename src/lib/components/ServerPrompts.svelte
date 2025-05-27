<script lang="ts">
	import { createPromptsListQuery } from '$lib/queries/servers';
	import Spinner from './spinner.svelte';
	import type { Prompt } from '@modelcontextprotocol/sdk/types.js';

	// Props
	export let serverId: string;
	export let onSelectPrompt: (prompt: Prompt) => void = () => {};

	// Fetch prompts list for this server
	$: promptsListQuery = serverId ? createPromptsListQuery(serverId) : undefined;
</script>

<div>
	{#if !promptsListQuery}
		<div class="py-2 text-foreground/70">No server ID provided.</div>
	{:else if $promptsListQuery?.isLoading}
		<div class="flex h-full w-full items-center justify-center py-4">
			<Spinner />
		</div>
	{:else if $promptsListQuery?.error}
		<div class="py-2 text-destructive">
			Error loading prompts: {$promptsListQuery?.error?.message}
		</div>
	{:else if $promptsListQuery?.data?.prompts && $promptsListQuery?.data?.prompts.length > 0}
		<div class="space-y-2">
			{#each $promptsListQuery?.data?.prompts || [] as prompt}
				<div
					class="cursor-pointer rounded-lg border border-primary/20 bg-background p-3 transition-colors hover:border-primary/40"
					on:click={() => onSelectPrompt(prompt)}
					on:keydown={(e) => e.key === 'Enter' && onSelectPrompt(prompt)}
					tabindex="0"
					role="button"
				>
					<div class="flex items-center justify-between">
						<h3 class="text-base font-medium text-primary">{prompt.name}</h3>
						{#if $promptsListQuery?.data?.promptsPricing && $promptsListQuery?.data?.promptsPricing.get(prompt.name)}
							<span class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
								Price: {$promptsListQuery?.data?.promptsPricing.get(prompt.name)?.price}
								{$promptsListQuery?.data?.promptsPricing.get(prompt.name)?.unit}
							</span>
						{/if}
					</div>
					{#if prompt.description}
						<p class="mt-1 text-sm text-foreground">{prompt.description}</p>
					{/if}
					{#if prompt.arguments && prompt.arguments.length > 0}
						<div class="mt-2">
							<p class="text-xs font-medium text-foreground/70">Arguments:</p>
							<div class="mt-1 space-y-1">
								{#each prompt.arguments as arg}
									<div class="flex items-center gap-1 text-xs">
										<span class="font-medium">{arg.name}</span>
										{#if arg.required}
											<span class="text-destructive">*</span>
										{/if}
										{#if arg.description}
											<span class="text-foreground/70">- {arg.description}</span>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div class="py-2 text-foreground/70">No prompts available for this server.</div>
	{/if}
</div>

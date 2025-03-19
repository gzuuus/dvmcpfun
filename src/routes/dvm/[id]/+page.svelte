<script lang="ts">
	import { page } from '$app/stores';
	import { setThemeContext } from '@sjsf/shadcn-theme';
	import { components } from '@sjsf/shadcn-theme/default';
	import ToolForm from '$lib/components/ToolForm.svelte';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import { createDVMCPQuery } from '$lib/queries/tools';
	import * as Tabs from '$lib/components/ui/tabs/index.js';

	const dvmcpQuery = createDVMCPQuery($page.params.id);

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

	{#if $dvmcpQuery.isLoading}
		<div class="animate-pulse space-y-6">
			<div class="h-8 w-1/3 rounded bg-border/20"></div>
			<div class="h-4 w-2/3 rounded bg-border/20"></div>
			<div class="rounded-lg border border-primary/20 p-6">
				<div class="mb-4 h-4 w-1/2 rounded bg-border/20"></div>
				<div class="h-4 w-3/4 rounded bg-border/20"></div>
			</div>
		</div>
	{:else if $dvmcpQuery.isError}
		<div class="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-red-400">
			Error: {$dvmcpQuery.error.message}
		</div>
	{:else if $dvmcpQuery.data}
		<div class="space-y-6">
			<Tabs.Root value="overview">
				<Tabs.List>
					<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
					<Tabs.Trigger value="install" disabled>Install</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="overview">
					<div class="rounded-lg border border-primary/20 bg-background p-6">
						<div class=" inline-flex items-end gap-2">
							{#if $dvmcpQuery.data.picture}
								<img
									src={$dvmcpQuery.data.picture}
									alt=""
									class="h-12 w-12 rounded-lg border border-primary/20 object-cover"
								/>
							{:else}
								<div class="h-12 w-12 rounded-lg border border-primary/20 bg-border/10"></div>
							{/if}
							<h1 class="mb-2 text-3xl font-bold text-primary">{$dvmcpQuery.data.name}</h1>
						</div>

						{#if $dvmcpQuery.data.about}
							<div class="mb-6">
								<h2 class="mb-3 text-2xl font-semibold text-primary">About</h2>
								<p class="text-primary/50">{$dvmcpQuery.data.about}</p>
							</div>
						{/if}
						{#if $dvmcpQuery.data.website}
							<div class="mb-6">
								<h2 class="mb-3 text-2xl font-semibold text-primary">Website</h2>
								<a href={$dvmcpQuery.data.website} target="_blank" class="text-primary/50"
									>{$dvmcpQuery.data.website}</a
								>
							</div>
						{/if}
						<div class="mb-6">
							<h2 class="mb-3 text-2xl font-semibold text-primary">Author</h2>
							<p class=" text-primary/50">{$dvmcpQuery.data.event.pubkey}</p>
						</div>
						<div class="mb-6 flex flex-wrap gap-2">
							{#if $dvmcpQuery.data.toolNames && $dvmcpQuery.data.toolNames.length > 0}
								{#each $dvmcpQuery.data.toolNames as toolName}
									<span
										class="overflow-hidden overflow-ellipsis whitespace-nowrap rounded-full bg-border/20 px-3 py-1 text-sm text-primary"
									>
										{toolName}
									</span>
								{/each}
							{/if}
						</div>
						<Accordion.Root type="single" class="w-full">
							<Accordion.Item value="item-1">
								<Accordion.Trigger>More info</Accordion.Trigger>
								<Accordion.Content>
									{#if $dvmcpQuery.data.capabilities && $dvmcpQuery.data.capabilities.length > 0}
										<div class="mb-6">
											<h2 class="mb-3 text-xl font-semibold text-primary">Capabilities</h2>
											<div class="flex flex-wrap gap-2">
												{#each $dvmcpQuery.data.capabilities as capability}
													<span class="rounded-full bg-border/20 px-3 py-1 text-sm text-primary">
														{capability}
													</span>
												{/each}
											</div>
										</div>
									{/if}

									<div class="text-sm text-primary/50">
										<p>Event ID: {$dvmcpQuery.data.event.id}</p>
									</div>
								</Accordion.Content>
							</Accordion.Item>
						</Accordion.Root>
					</div>
				</Tabs.Content>
				<Tabs.Content value="install">
					<div class="rounded-lg border border-primary/20 bg-background p-6">
						<div class=" inline-flex items-end gap-2">
							{#if $dvmcpQuery.data.picture}
								<img
									src={$dvmcpQuery.data.picture}
									alt=""
									class="h-12 w-12 rounded-lg border border-primary/20 object-cover"
								/>
							{:else}
								<div class="h-12 w-12 rounded-lg border border-primary/20 bg-border/10"></div>
							{/if}
							<h1 class="mb-2 text-3xl font-bold text-primary">{$dvmcpQuery.data.name}</h1>
						</div>
						<div>
							<div class="rounded-lg border border-primary/20 bg-background p-4">Soon!</div>
						</div>
					</div></Tabs.Content
				>
			</Tabs.Root>
			<div class="rounded-lg border border-primary/20 bg-background p-6">
				<h2 class="mb-3 text-xl font-semibold text-primary">Try it out</h2>
				{#if $dvmcpQuery.data?.tools?.length > 0}
					<div class="space-y-8">
						{#each $dvmcpQuery.data.tools as tool}
							<Accordion.Root type="single" class="w-full">
								<Accordion.Item value="item-1">
									<Accordion.Trigger class="hover:no-underline">
										<div>
											<span class=" flex flex-col truncate text-start"
												>{tool.name}<span class=" text-primary/50">{tool.description}</span>
											</span>
										</div>
									</Accordion.Trigger>
									<Accordion.Content>
										<ToolForm {tool} provider={$dvmcpQuery.data} />
									</Accordion.Content>
								</Accordion.Item>
							</Accordion.Root>
						{/each}
					</div>
				{:else}
					<p class="text-primary/50">This MCP server has no tools with input schemas to try out.</p>
				{/if}
			</div>
			<Accordion.Root type="single" class="w-full">
				<Accordion.Item value="item-1">
					<Accordion.Trigger>
						<h2 class="mb-3 text-xl font-semibold text-primary">Raw Data</h2>
					</Accordion.Trigger>
					<Accordion.Content>
						<div class="rounded-lg border border-primary/20 bg-background p-4">
							<pre class="overflow-auto font-mono text-sm text-primary/50">{JSON.stringify(
									$dvmcpQuery.data.event,
									null,
									2
								)}</pre>
						</div>
					</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>
		</div>
	{/if}
</main>

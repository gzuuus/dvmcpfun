<script lang="ts">
	import { page } from '$app/state';
	import { setThemeContext } from '@sjsf/shadcn-theme';
	import { components } from '@sjsf/shadcn-theme/default';
	import ToolForm from '$lib/components/ToolForm.svelte';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import { createDVMCPQuery } from '$lib/queries/tools';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { nip19 } from 'nostr-tools';
	import ndkStore from '$lib/stores/nostr';
	import type { NDKTag, NostrEvent } from '@nostr-dev-kit/ndk';
	import { copyToClipboard } from '$lib/utils';
	import { npubEncode } from 'nostr-tools/nip19';

	const dvmcpQuery = createDVMCPQuery(page.params.identifier);

	setThemeContext({ components });

	$: pageTitle = $dvmcpQuery.data
		? `${$dvmcpQuery.data.name.length > 12 ? $dvmcpQuery.data.name.slice(0, 12) + '...' : $dvmcpQuery.data.name} | DVMCP Fun`
		: 'Loading... | DVMCP Fun';

	$: currentRelayPool = Array.from($ndkStore.pool.relays.values()).map((relay) => relay.url);
	$: nprofileString =
		$dvmcpQuery.data && currentRelayPool ? generateNprofile($dvmcpQuery.data.event) : '';
	$: naddrString =
		$dvmcpQuery.data && currentRelayPool ? generateNaddr($dvmcpQuery.data.event) : '';

	function generateNprofile(event: NostrEvent): string {
		if (!event || !event.pubkey) return '';

		return nip19.nprofileEncode({
			pubkey: event.pubkey,
			relays: currentRelayPool
		});
	}

	function generateNaddr(event: NostrEvent): string {
		if (!event || !event.pubkey || !event.kind) return '';

		const dTags = event.tags?.filter((tag: NDKTag) => tag[0] === 'd') || [];
		const identifier = dTags.length > 0 ? dTags[0][1] : '';

		return nip19.naddrEncode({
			pubkey: event.pubkey,
			kind: event.kind,
			identifier,
			relays: currentRelayPool
		});
	}
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

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
					<Tabs.Trigger value="install">Install</Tabs.Trigger>
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
							<p class=" break-all text-primary/50">
								{npubEncode($dvmcpQuery.data.event.pubkey) ?? ''}
							</p>
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
						<div class="space-y-6">
							<div>
								<h2 class="mb-3 text-xl font-semibold text-primary">Installation Options</h2>
								<p class="mb-4 text-primary/70">
									You can install and run this DVM locally using the @dvmcp/discovery package.
									Choose one of the following methods:
								</p>

								<div class="space-y-4">
									<div class="rounded-lg border border-primary/20 bg-background p-4">
										<h3 class="mb-2 text-lg font-medium text-primary">
											Option 1: Using Server Flag
										</h3>
										<p class="mb-2 text-primary/70">Run with the server's naddr:</p>

										<Tabs.Root value="raw" class="w-full">
											<Tabs.List>
												<Tabs.Trigger value="raw">Command</Tabs.Trigger>
												<Tabs.Trigger value="claude">Claude</Tabs.Trigger>
											</Tabs.List>

											<Tabs.Content value="raw">
												<div class="mb-2">
													<div class="mb-2 flex items-center justify-between">
														<span class="text-sm text-primary/50">Command</span>
														<button
															class="text-sm text-primary hover:text-primary/80"
															on:click={() =>
																copyToClipboard(`npx @dvmcp/discovery --server ${naddrString}`)}
															aria-label="Copy server command to clipboard"
														>
															Copy
														</button>
													</div>
													<pre
														class="overflow-auto rounded-lg border border-primary/20 p-4 font-mono text-sm text-primary/50">npx @dvmcp/discovery --server {naddrString}</pre>
												</div>
											</Tabs.Content>

											<Tabs.Content value="claude">
												<div class="mb-2">
													<div class="mb-2 flex items-center justify-between">
														<span class="text-sm text-primary/50">JSON Configuration</span>
														<button
															class="text-sm text-primary hover:text-primary/80"
															on:click={() =>
																copyToClipboard(
																	JSON.stringify(
																		{
																			mcpServers: {
																				dvm: {
																					command: 'npx',
																					args: ['@dvmcp/discovery', '--server', naddrString]
																				}
																			}
																		},
																		null,
																		2
																	)
																)}
															aria-label="Copy Claude configuration to clipboard"
														>
															Copy
														</button>
													</div>
													<pre
														class="overflow-auto rounded-lg border border-primary/20 p-4 font-mono text-sm text-primary/50">{`
  "mcpServers": {
    "dvm": {
      "command": "npx",
      "args": [
        "@dvmcp/discovery",
        "--server",
        "${naddrString}"
      ]
    }
  }
`}</pre>
												</div>
											</Tabs.Content>
										</Tabs.Root>

										<p class="text-sm text-primary/70">
											This command uses the naddr which encodes the event kind, public key, and the
											'd' tag of the event. It will get the tools just from this server.
										</p>
									</div>

									<div class="rounded-lg border border-primary/20 bg-background p-4">
										<h3 class="mb-2 text-lg font-medium text-primary">
											Option 2: Using Provider Flag
										</h3>
										<p class="mb-2 text-primary/70">Run with the provider's nprofile:</p>

										<Tabs.Root value="raw" class="w-full">
											<Tabs.List>
												<Tabs.Trigger value="raw">Command</Tabs.Trigger>
												<Tabs.Trigger value="claude">Claude</Tabs.Trigger>
											</Tabs.List>

											<Tabs.Content value="raw">
												<div class="mb-2">
													<div class="mb-2 flex items-center justify-between">
														<span class="text-sm text-primary/50">Command</span>
														<button
															class="text-sm text-primary hover:text-primary/80"
															on:click={() =>
																copyToClipboard(
																	`npx @dvmcp/discovery --provider ${nprofileString}`
																)}
															aria-label="Copy provider command to clipboard"
														>
															Copy
														</button>
													</div>
													<pre
														class="overflow-auto rounded-lg border border-primary/20 p-4 font-mono text-sm text-primary/50">npx @dvmcp/discovery --provider {nprofileString}</pre>
												</div>
											</Tabs.Content>

											<Tabs.Content value="claude">
												<div class="mb-2">
													<div class="mb-2 flex items-center justify-between">
														<span class="text-sm text-primary/50">JSON Configuration</span>
														<button
															class="text-sm text-primary hover:text-primary/80"
															on:click={() =>
																copyToClipboard(
																	JSON.stringify(
																		{
																			mcpServers: {
																				dvm: {
																					command: 'npx',
																					args: ['@dvmcp/discovery', '--provider', nprofileString]
																				}
																			}
																		},
																		null,
																		2
																	)
																)}
															aria-label="Copy Claude configuration to clipboard"
														>
															Copy
														</button>
													</div>
													<pre
														class="overflow-auto rounded-lg border border-primary/20 p-4 font-mono text-sm text-primary/50">{`
  "mcpServers": {
    "dvm": {
      "command": "npx",
      "args": [
        "@dvmcp/discovery",
        "--provider",
        "${nprofileString}"
      ]
    }
  }
`}</pre>
												</div>
											</Tabs.Content>
										</Tabs.Root>

										<p class="text-sm text-primary/70">
											This command uses the nprofile which encodes the public key and relay hints.
											It will get all tools from this provider.
										</p>
									</div>
								</div>
							</div>

							<div>
								<h2 class="mb-3 text-xl font-semibold text-primary">What Happens Next?</h2>
								<p class="text-primary/70">After running one of the commands above:</p>
								<ol class="mt-2 list-inside list-decimal space-y-2 pl-4 text-primary/70">
									<li>
										The discovery package will fetch the DVM configuration from the Nostr network
									</li>
									<li>It will start a local server running this DVM</li>
									<li>You can then interact with the DVM through your local instance</li>
								</ol>
							</div>
						</div>
					</div>
				</Tabs.Content>
			</Tabs.Root>
			<div class="rounded-lg border border-primary/20 bg-background p-6">
				<h2 class="mb-3 text-xl font-semibold text-primary">Try it out</h2>
				{#if $dvmcpQuery.data?.tools?.length > 0}
					<div class="space-y-8">
						{#each $dvmcpQuery.data.tools as tool}
							<Accordion.Root type="single" class="w-full">
								<Accordion.Item value="item-1">
									<Accordion.Trigger class="hover:no-underline">
										<div class="flex flex-col truncate whitespace-pre-wrap text-start">
											<span class=" ">{tool.name} </span>
											<span class=" text-primary/50">{tool.description}</span>
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

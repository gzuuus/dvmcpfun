<script lang="ts">
	import { page } from '$app/state';
	import { setThemeContext } from '@sjsf/shadcn-theme';
	import { components } from '@sjsf/shadcn-theme/default';
	import ToolForm from '$lib/components/ToolForm.svelte';
	import ResourceForm from '$lib/components/ResourceForm.svelte';
	import PromptForm from '$lib/components/PromptForm.svelte';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { nip19 } from 'nostr-tools';
	import { copyToClipboard, slugify } from '$lib/utils';
	import { createAuthorQuery } from '$lib/queries/authors';
	import AuthorCard from '$lib/components/authorCard.svelte';
	import { getHexColorFingerprintFromHexPubkey } from '$lib/utils/commons';
	import {
		createServerQuery,
		createToolsListQuery,
		createResourcesListQuery,
		createPromptsListQuery
	} from '$lib/queries/servers';
	import Spinner from '$lib/components/spinner.svelte';

	// Import the new dedicated capability components
	import ServerTools from '$lib/components/ServerTools.svelte';
	import ServerResources from '$lib/components/ServerResources.svelte';
	import ServerPrompts from '$lib/components/ServerPrompts.svelte';
	import type {
		Tool,
		Resource,
		ResourceTemplate,
		Prompt
	} from '@modelcontextprotocol/sdk/types.js';

	// Generate naddr and nprofile strings for the install tab
	$: naddrString =
		$serverQuery.data?.meta.serverId && $serverQuery.data?.meta.providerPubkey
			? nip19.naddrEncode({
					pubkey: $serverQuery.data.meta.providerPubkey,
					kind: 31990,
					identifier: $serverQuery.data.meta.serverId,
					relays: []
				})
			: '';

	$: nprofileString = $serverQuery.data?.meta.providerPubkey
		? nip19.nprofileEncode({
				pubkey: $serverQuery.data.meta.providerPubkey,
				relays: []
			})
		: '';

	// Fetch server details
	const serverQuery = createServerQuery(page.params.identifier);

	// Fetch capabilities lists for pricing information
	$: toolsListQuery = $serverQuery.data?.meta.serverId
		? createToolsListQuery($serverQuery.data.meta.serverId)
		: undefined;

	$: resourcesListQuery = $serverQuery.data?.meta.serverId
		? createResourcesListQuery($serverQuery.data.meta.serverId)
		: undefined;

	$: promptsListQuery = $serverQuery.data?.meta.serverId
		? createPromptsListQuery($serverQuery.data.meta.serverId)
		: undefined;

	// State for selected capabilities
	let selectedTool: Tool | null = null;
	let selectedResource: Resource | null = null;
	let selectedResourceTemplate: ResourceTemplate | null = null;
	let selectedPrompt: Prompt | null = null;

	// Handler functions for capability selection
	function handleSelectTool(tool: Tool) {
		selectedTool = tool;
		selectedResource = null;
		selectedResourceTemplate = null;
		selectedPrompt = null;
	}

	function handleSelectResource(resource: Resource) {
		selectedResource = resource;
		selectedTool = null;
		selectedResourceTemplate = null;
		selectedPrompt = null;
	}

	function handleSelectResourceTemplate(template: ResourceTemplate) {
		selectedResourceTemplate = template;
		selectedTool = null;
		selectedResource = null;
		selectedPrompt = null;
	}

	function handleSelectPrompt(prompt: Prompt) {
		selectedPrompt = prompt;
		selectedTool = null;
		selectedResource = null;
		selectedResourceTemplate = null;
	}

	// Author query
	$: authorQuery = $serverQuery.data?.meta.providerPubkey
		? createAuthorQuery($serverQuery.data.meta.providerPubkey)
		: undefined;

	// Page title
	$: pageTitle = $serverQuery.data
		? `${$serverQuery.data.meta.name || 'Server'} | DVMCP Fun`
		: 'Loading... | DVMCP Fun';

	setThemeContext({ components });
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<main class="mx-auto max-w-7xl px-6 py-8">
	<a
		href="/"
		class="mb-8 inline-flex items-center text-primary no-underline transition-colors hover:text-primary/80 hover:underline"
	>
		<span class="mr-2">←</span>
		Back to Tools
	</a>

	{#if $serverQuery.isLoading}
		<div class="flex h-full w-full items-center justify-center">
			<Spinner />
		</div>
	{:else if $serverQuery.error}
		<div class="flex h-full w-full items-center justify-center">
			<p class="text-destructive">Error: {$serverQuery.error.message}</p>
		</div>
	{:else if $serverQuery.data}
		<div class="space-y-6">
			<Tabs.Root value="overview">
				<Tabs.List>
					<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
					<Tabs.Trigger value="install">Install</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="overview">
					<div class="rounded-lg border border-primary/20 bg-background p-6">
						<div class="flex items-center gap-2">
							{#if $serverQuery.data.meta.picture}
								<img
									src={$serverQuery.data.meta.picture}
									alt=""
									class="h-12 w-12 rounded-lg border border-primary/20 object-cover"
								/>
							{:else}
								<div
									class="h-12 w-12 rounded-lg border border-primary/20 bg-border/10"
									style="background: {getHexColorFingerprintFromHexPubkey(
										$serverQuery.data.meta.providerPubkey || ''
									)}"
								></div>
							{/if}
							<h1 class="m-0 font-bold text-primary">{$serverQuery.data.meta.name || 'Server'}</h1>
						</div>

						{#if $serverQuery.data.meta.about}
							<div class="mb-6">
								<h2 class="mb-3 text-2xl font-semibold text-primary">About</h2>
								<p class="text-foreground">{$serverQuery.data.meta.about}</p>
							</div>
						{/if}
						{#if $serverQuery.data.meta.website}
							<div class="mb-6">
								<h2 class="mb-3 text-2xl font-semibold text-primary">Website</h2>
								<a href={$serverQuery.data.meta.website} target="_blank" class="text-foreground"
									>{$serverQuery.data.meta.website}</a
								>
							</div>
						{/if}
						<div class="mb-6">
							<h2 class="mb-3 text-2xl font-semibold text-primary">Provider</h2>
							<AuthorCard
								profile={$authorQuery?.data}
								variant="compact"
								pubkey={$serverQuery.data.meta.providerPubkey}
							/>
						</div>
						<!-- Server Capabilities Section -->
						<div class="mb-6">
							<h2 class="mb-3 text-2xl font-semibold text-primary">Capabilities</h2>
							<div class="flex flex-wrap gap-2">
								{#if $serverQuery.data.server.capabilities && typeof $serverQuery.data.server.capabilities === 'object' && 'tools' in $serverQuery.data.server.capabilities}
									<span
										class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
									>
										Tools
									</span>
								{/if}
								{#if $serverQuery.data.server.capabilities && typeof $serverQuery.data.server.capabilities === 'object' && 'resources' in $serverQuery.data.server.capabilities}
									<span
										class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
									>
										Resources
									</span>
								{/if}
								{#if $serverQuery.data.server.capabilities && typeof $serverQuery.data.server.capabilities === 'object' && 'prompts' in $serverQuery.data.server.capabilities}
									<span
										class="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
									>
										Prompts
									</span>
								{/if}
							</div>
						</div>

						{#if selectedTool || selectedResource || selectedResourceTemplate || selectedPrompt}
							<!-- Selected capability details -->
							<div class="mb-6">
								<button
									class="mb-4 inline-flex items-center text-primary no-underline transition-colors hover:text-primary/80 hover:underline"
									on:click={() => {
										selectedTool = null;
										selectedResource = null;
										selectedResourceTemplate = null;
										selectedPrompt = null;
									}}
								>
									<span class="mr-2">←</span>
									Back to capabilities
								</button>

								{#if selectedTool}
									<!-- Tool detail view -->
									<div>
										<h2 class="mb-3 text-2xl font-semibold text-primary">{selectedTool.name}</h2>
										{#if selectedTool.description}
											<p class="mb-4 text-foreground">{selectedTool.description}</p>
										{/if}
										<ToolForm
											tool={selectedTool}
											provider={{
												providerPubkey: $serverQuery.data?.meta?.providerPubkey || '',
												serverId: $serverQuery.data?.meta?.serverId || ''
											}}
											pricing={$toolsListQuery?.data?.toolsPricing?.get(selectedTool.name)}
										/>
									</div>
								{:else if selectedResource}
									<!-- Resource detail view -->
									<div>
										<h2 class="mb-3 text-2xl font-semibold text-primary">
											{selectedResource.name}
										</h2>
										{#if selectedResource.description}
											<p class="mb-4 text-foreground">{selectedResource.description}</p>
										{/if}
										<ResourceForm
											resource={selectedResource}
											provider={{
												providerPubkey: $serverQuery.data?.meta?.providerPubkey || '',
												serverId: $serverQuery.data?.meta?.serverId || ''
											}}
										/>
									</div>
								{:else if selectedResourceTemplate}
									<!-- Resource template detail view -->
									<div>
										<h2 class="mb-3 text-2xl font-semibold text-primary">
											{selectedResourceTemplate.name}
										</h2>
										{#if selectedResourceTemplate.description}
											<p class="mb-4 text-foreground">{selectedResourceTemplate.description}</p>
										{/if}
										<div class="rounded-lg border border-primary/20 bg-background p-4">
											<h3 class="mb-2 text-lg font-medium text-primary">Template Details</h3>
											<p class="mb-2 text-foreground">
												<span class="font-medium">URI Template:</span>
												{selectedResourceTemplate.uriTemplate}
											</p>
											{#if selectedResourceTemplate.mimeType}
												<p class="text-foreground">
													<span class="font-medium">MIME Type:</span>
													{selectedResourceTemplate.mimeType}
												</p>
											{/if}
										</div>
									</div>
								{:else if selectedPrompt}
									<!-- Prompt detail view -->
									<div>
										<h2 class="mb-3 text-2xl font-semibold text-primary">{selectedPrompt.name}</h2>
										{#if selectedPrompt.description}
											<p class="mb-4 text-foreground">{selectedPrompt.description}</p>
										{/if}
										<PromptForm
											prompt={selectedPrompt}
											provider={{
												providerPubkey: $serverQuery.data?.meta?.providerPubkey || '',
												serverId: $serverQuery.data?.meta?.serverId || ''
											}}
											pricing={$promptsListQuery?.data?.promptsPricing?.get(selectedPrompt.name)}
										/>
									</div>
								{/if}
							</div>
						{:else}
							<!-- Capability listings -->
							{#if $serverQuery.data.server.capabilities && typeof $serverQuery.data.server.capabilities === 'object' && 'tools' in $serverQuery.data.server.capabilities}
								<div class="mb-6">
									<h2 class="mb-3 text-2xl font-semibold text-primary">Tools</h2>
									<ServerTools
										serverId={$serverQuery.data.meta.serverId || ''}
										onSelectTool={handleSelectTool}
									/>
								</div>
							{/if}

							{#if $serverQuery.data.server.capabilities && typeof $serverQuery.data.server.capabilities === 'object' && 'resources' in $serverQuery.data.server.capabilities}
								<div class="mb-6">
									<h2 class="mb-3 text-2xl font-semibold text-primary">Resources</h2>
									<ServerResources
										serverId={$serverQuery.data.meta.serverId || ''}
										onSelectResource={handleSelectResource}
										onSelectResourceTemplate={handleSelectResourceTemplate}
									/>
								</div>
							{/if}

							{#if $serverQuery.data.server.capabilities && typeof $serverQuery.data.server.capabilities === 'object' && 'prompts' in $serverQuery.data.server.capabilities}
								<div class="mb-6">
									<h2 class="mb-3 text-2xl font-semibold text-primary">Prompts</h2>
									<ServerPrompts
										serverId={$serverQuery.data.meta.serverId || ''}
										onSelectPrompt={handleSelectPrompt}
									/>
								</div>
							{/if}
						{/if}

						<Accordion.Root type="single" class="w-full">
							<Accordion.Item value="item-1">
								<Accordion.Trigger>Technical Details</Accordion.Trigger>
								<Accordion.Content>
									<div class="space-y-2 text-sm text-primary/50">
										<p>Server ID: {$serverQuery.data.meta.serverId || page.params.identifier}</p>
										<p>Provider: {$serverQuery.data.meta.providerPubkey}</p>
										{#if $serverQuery.data.server.protocolVersion}
											<p>Protocol Version: {$serverQuery.data.server.protocolVersion}</p>
										{/if}
										{#if $serverQuery.data.server.serverInfo && typeof $serverQuery.data.server.serverInfo === 'object' && 'version' in $serverQuery.data.server.serverInfo}
											<p>Server Version: {$serverQuery.data.server.serverInfo.version}</p>
										{/if}
									</div>
								</Accordion.Content>
							</Accordion.Item>
						</Accordion.Root>
					</div>
				</Tabs.Content>
				<Tabs.Content value="install">
					<div class="rounded-lg border border-primary/20 bg-background p-6">
						<div class=" inline-flex items-end gap-2">
							{#if $serverQuery.data.meta.picture}
								<img
									src={$serverQuery.data.meta.picture}
									alt=""
									class="h-12 w-12 rounded-lg border border-primary/20 object-cover"
								/>
							{:else}
								<div class="h-12 w-12 rounded-lg border border-primary/20 bg-border/10"></div>
							{/if}
							<h1 class="mb-2 text-3xl font-bold text-primary">{$serverQuery.data.meta.name}</h1>
						</div>
						<div class="space-y-6">
							<div>
								<h2 class="mb-3 text-xl font-semibold text-primary">Installation Options</h2>
								<p class="mb-4 text-foreground">
									You can install and run this DVM locally using the @dvmcp/discovery package.
									Choose one of the following methods:
								</p>

								<div class="space-y-4">
									<div class="rounded-lg border border-primary/20 bg-background p-4">
										<h3 class="mb-2 text-lg font-medium text-primary">
											Option 1: Using Server Flag
										</h3>
										<p class="mb-2 text-foreground">Run with the server's naddr:</p>

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
																	`npx @dvmcp/discovery -y --server ${naddrString || ''}`
																)}
															aria-label="Copy server command to clipboard"
														>
															Copy
														</button>
													</div>
													<pre
														class="overflow-auto rounded-lg border border-primary/20 p-4 font-mono text-sm text-primary">npx @dvmcp/discovery --server {naddrString}</pre>
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
																					args: [
																						'@dvmcp/discovery',
																						'-y',
																						'--server',
																						naddrString || ''
																					]
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
														class="overflow-auto rounded-lg border border-primary/20 p-4 font-mono text-sm text-primary">{`
  "mcpServers": {
    "${slugify($serverQuery.data.meta.name || '') || 'dvm'}": {
      "command": "npx",
      "args": [
        "@dvmcp/discovery",
		"-y",
        "--server",
        "${naddrString || 'nostr-event'}"
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
										<p class="mb-2 text-foreground">Run with the provider's nprofile:</p>

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
																	`npx @dvmcp/discovery -y --provider ${nprofileString || 'nostr-key'}`
																)}
															aria-label="Copy provider command to clipboard"
														>
															Copy
														</button>
													</div>
													<pre
														class="overflow-auto rounded-lg border border-primary/20 p-4 font-mono text-sm text-primary">npx @dvmcp/discovery --provider {nprofileString}</pre>
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
																					args: [
																						'@dvmcp/discovery',
																						'-y',
																						'--provider',
																						nprofileString || 'nostr-key'
																					]
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
														class="overflow-auto rounded-lg border border-primary/20 p-4 font-mono text-sm text-primary">{`
  "mcpServers": {
    "${slugify($serverQuery.data.meta.name || '') || 'dvm'}": {
      "command": "npx",
      "args": [
        "@dvmcp/discovery",
        "-y",
        "--provider",
        "${nprofileString || 'nostr-key'}"
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
				<!-- Tool forms section removed as part of the refactoring -->
				<p class="text-primary/50">
					This MCP server has tools that can be accessed through the Tools section above.
				</p>
			</div>
			<!-- <Accordion.Root type="single" class="w-full">
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
			</Accordion.Root> -->
		</div>
	{/if}
</main>

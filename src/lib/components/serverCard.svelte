<script lang="ts">
	import { createAuthorQuery } from '$lib/queries/authors';
	import AuthorCard from './authorCard.svelte';
	import { getHexColorFingerprintFromHexPubkey } from '$lib/utils/commons';
	import type { ServerWithMeta } from '$lib/types';
	import ServerCapBadges from './serverCapBadges.svelte';

	export let server: ServerWithMeta;
	const authorQuery = server.meta.providerPubkey
		? createAuthorQuery(server.meta.providerPubkey)
		: undefined;
</script>

{#if server}
	<a
		href="/s/{server.meta.serverId}"
		class="group grid grid-rows-[auto_1fr_auto] rounded-xl border border-primary/40 bg-background p-4 pt-0 no-underline transition-transform duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
	>
		<div class="mb-2 flex items-center gap-4">
			{#if server.meta.picture}
				<img
					src={server.meta.picture}
					alt=""
					class="h-12 w-12 rounded-lg border border-primary/20 object-cover shadow-sm"
				/>
			{:else}
				<div
					class="my-4 h-12 w-12 rounded-lg border border-primary/20 bg-border/10"
					style="background: {getHexColorFingerprintFromHexPubkey(
						server.meta.providerPubkey || ''
					)}"
				></div>
			{/if}
			<div class="flex min-w-0 flex-col">
				<h3
					class="m-0 mb-1 truncate text-xl font-semibold text-primary group-hover:text-primary/60"
				>
					{server.meta.name}
				</h3>
				<span class="max-w-60">
					<AuthorCard
						profile={$authorQuery?.data}
						variant="minimal"
						pubkey={server.meta.providerPubkey}
					/>
				</span>
			</div>
		</div>

		{#if server.meta.about || server.meta.website}
			<div class="flex min-h-[2.5rem] flex-col gap-1 pb-2">
				{#if server.meta.about}
					<p class="line-clamp-2 text-primary/90">{server.meta.about}</p>
				{/if}
				{#if server.meta.website}
					<p class="mt-2 line-clamp-2 text-foreground">{server.meta.website}</p>
				{/if}
				<ServerCapBadges server={server.server} />
			</div>
		{/if}
	</a>
{/if}

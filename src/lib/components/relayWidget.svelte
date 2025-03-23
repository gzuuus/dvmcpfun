<script lang="ts">
	import ndkStore, { explicitRelayUrls } from '$lib/stores/nostr';
	import { NDKRelay, NDKRelayAuthPolicies, normalizeRelayUrl } from '@nostr-dev-kit/ndk';
	import { Button } from '$lib/components/ui/button';
	import { CircleX, Cross, Server } from 'lucide-svelte';
	import ScrollArea from './ui/scroll-area/scroll-area.svelte';
	import RelayList from './relayList.svelte';
	import { Input } from './ui/input';
	import { Label } from '$lib/components/ui/label/index.js';

	let isOpen = $state(false);

	let inputRelayUrl = $state('');
	function handleAddRelay() {
		if (inputRelayUrl) {
			$ndkStore.pool.addRelay(
				new NDKRelay(normalizeRelayUrl(inputRelayUrl), NDKRelayAuthPolicies.signIn(), $ndkStore)
			);
			ndkStore.set($ndkStore);
			inputRelayUrl = '';
		}
	}

	function handleConnectToDefaultRelays() {
		explicitRelayUrls.forEach((relay) => {
			$ndkStore.pool.addRelay(
				new NDKRelay(normalizeRelayUrl(relay), NDKRelayAuthPolicies.signIn(), $ndkStore)
			);
		});
		ndkStore.set($ndkStore);
	}
</script>

<div class="flex flex-col">
	{#if !isOpen}
		<Button
			data-tooltip="Manage your nostr relays!"
			size="icon"
			variant="outline"
			class="border-gray border"
			onclick={() => (isOpen = !isOpen)}
		>
			<Server class="h-6 w-6" />
		</Button>
	{/if}

	{#if isOpen}
		<div class={`fixed bottom-0 flex w-fit flex-col gap-2 border-2 border-black bg-white p-2`}>
			<div class="text-end">
				<Button size="icon" variant="ghost" onclick={() => (isOpen = false)}>
					<CircleX class="h-6 w-6" />
				</Button>
			</div>
			{#if $ndkStore.pool?.relays.size}
				<section>
					<span class=" font-bold">Explicit relays</span> ({$ndkStore.pool?.relays.size}):
					<ScrollArea class={`${$ndkStore.pool?.relays.size > 10 ? 'h-72' : ''}`}>
						{#each $ndkStore.pool.relays.values() as relay (relay.url)}
							<RelayList {relay} relayType="kind3" />
						{/each}
					</ScrollArea>
				</section>
			{:else}
				<div class="flex flex-col gap-2">
					You are not connected to any relay
					<Button onclick={handleConnectToDefaultRelays}>Use default relays</Button>
				</div>
			{/if}
			{#if $ndkStore.outboxPool?.relays.size}
				<section>
					<span class=" font-bold">Outbox relays</span> ({$ndkStore.outboxPool?.relays.size}):
					<ScrollArea class={`${$ndkStore.outboxPool?.relays.size > 10 ? 'h-72' : ''}`}>
						{#each $ndkStore.outboxPool.relays.values() as relay (relay.url)}
							<RelayList {relay} relayType="outbox" />
						{/each}
					</ScrollArea>
				</section>
			{/if}
			<form onsubmit={handleAddRelay} class="flex w-full flex-row items-end gap-2">
				<Label class="flex w-full flex-col gap-2">
					Add a relay
					<Input name="relayUrl" bind:value={inputRelayUrl} type="url" />
				</Label>
				<Button type="submit" variant="outline"><Cross class="h-6 w-6" /></Button>
			</form>
		</div>
	{/if}
</div>

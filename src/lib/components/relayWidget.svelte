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

	// Reactive arrays for relays
	let explicitRelays: NDKRelay[] = $state([]);
	let outboxRelays: NDKRelay[] = $state([]);

	// Effect to keep explicitRelays and outboxRelays in sync with $ndkStore
	$effect(() => {
		if ($ndkStore.pool?.relays) {
			explicitRelays = Array.from($ndkStore.pool.relays.values());
		} else {
			explicitRelays = [];
		}

		if ($ndkStore.outboxPool?.relays) {
			outboxRelays = Array.from($ndkStore.outboxPool.relays.values());
		} else {
			outboxRelays = [];
		}
	});

	let inputRelayUrl = $state('');
	function handleAddRelay() {
		if (inputRelayUrl) {
			$ndkStore.pool.addRelay(
				new NDKRelay(inputRelayUrl, NDKRelayAuthPolicies.signIn(), $ndkStore)
			);
			// This makes the entire store's value (the NDK instance) reactive,
			// which will trigger the $effect above.
			ndkStore.set($ndkStore);
			$ndkStore.connect();
			inputRelayUrl = '';
		}
	}

	function handleConnectToDefaultRelays() {
		explicitRelayUrls.forEach((relay) => {
			$ndkStore.pool.addRelay(
				new NDKRelay(normalizeRelayUrl(relay), NDKRelayAuthPolicies.signIn(), $ndkStore)
			);
		});
		// This makes the entire store's value (the NDK instance) reactive,
		// which will trigger the $effect above.
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
		<div
			class={`fixed bottom-0 flex w-fit flex-col gap-2 border-2 border-black bg-white p-2 dark:border-primary dark:bg-background`}
		>
			<div class="text-end">
				<Button size="icon" variant="ghost" onclick={() => (isOpen = false)}>
					<CircleX class="h-6 w-6" />
				</Button>
			</div>
			{#if explicitRelays.length > 0}
				<section>
					<span class=" font-bold">Explicit relays</span> ({explicitRelays.length}):
					<ScrollArea class={`${explicitRelays.length > 10 ? 'h-72' : ''}`}>
						{#each explicitRelays as relay (relay.url)}
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
			{#if outboxRelays.length > 0}
				<section>
					<span class=" font-bold">Outbox relays</span> ({outboxRelays.length}):
					<ScrollArea class={`${outboxRelays.length > 10 ? 'h-72' : ''}`}>
						{#each outboxRelays as relay (relay.url)}
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

<script lang="ts">
	import '../app.css';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import Header from '$lib/components/Header.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import RelayWidget from '$lib/components/relayWidget.svelte';
	import { queryClient } from '$lib/queries/queryClient';
	import { onMount } from 'svelte';
	import { login, getStoredAccount } from '$lib/stores/login';
	import LoginDialog from '$lib/components/loginDialog.svelte';

	let { children } = $props();
	const siteTitle = 'DVMCP Fun';
	let showNsecLoginDialog = $state(false);
	let autoLogin: boolean = $state(false);
	onMount(async () => {
		autoLogin = localStorage.getItem('auto_login') === 'true';
		if (autoLogin) {
			const loginMethod = localStorage.getItem('login_method') as 'NIP07' | 'NSEC' | 'NIP46' | null;
			if (loginMethod) {
				if (loginMethod === 'NSEC') {
					// For NSEC, we need to get the stored account and show the login dialog
					const storedAccount = getStoredAccount();
					if (storedAccount?.metadata?.encryptedKey) {
						showNsecLoginDialog = true;
					}
				} else if (loginMethod === 'NIP07') {
					// For NIP07, we can attempt to login directly
					await login(loginMethod, undefined, true);
				}
			}
		}
	});
</script>

<svelte:head>
	<title>{siteTitle}</title>
</svelte:head>

<ModeWatcher />
<Toaster />

<QueryClientProvider client={queryClient}>
	<div class="min-h-screen bg-background text-primary">
		<Header />
		{@render children()}
		<section class="fixed bottom-0 z-20 flex">
			<RelayWidget />
		</section>
	</div>

	{#if showNsecLoginDialog}
		<LoginDialog
			bind:open={showNsecLoginDialog}
			initialMethod="NSEC"
			autoFocus={true}
			isAutoLogin={autoLogin}
		/>
	{/if}
</QueryClientProvider>

<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { login, logout, generateNewKey, createNcryptSec } from '$lib/stores/login';
	import ndkStore from '$lib/stores/nostr';
	import { copyToClipboard, wait } from '$lib/utils';
	import { getHexColorFingerprintFromHexPubkey } from '$lib/utils/commons';
	import { User } from 'lucide-svelte';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';

	let open = $state(false);
	let showEncryptedKey = $state(false);
	let loginMethod = $state<'NIP07' | 'NSEC'>('NIP07');
	let loading = $state(false);
	let error = $state('');
	let keyValue = $state('');
	let encryptedKey = $state('');

	const handleLogin = async (method: 'NIP07' | 'NSEC', formData?: FormData) => {
		loading = true;
		error = '';
		try {
			if (method === 'NSEC' && formData) {
				const key = formData.get('key') as string;
				const password = formData.get('password') as string;

				if (key.startsWith('nsec1')) {
					const { ncryptsec } = createNcryptSec(key, password);
					encryptedKey = ncryptsec;
					showEncryptedKey = true;
				}
			}

			const success = await login(method, formData);
			if (success && !showEncryptedKey) {
				await wait(1000);
				open = false;
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Login failed';
		} finally {
			loading = false;
		}
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger
		class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground dark:rotate-0 dark:scale-100"
		style={`background: ${getHexColorFingerprintFromHexPubkey($ndkStore.activeUser?.pubkey ?? '')} ;`}
	>
		{#if $ndkStore.activeUser?.profile}
			{#if $ndkStore.activeUser?.profile.picture}
				<img
					src={$ndkStore.activeUser?.profile.picture}
					alt=""
					class="h-8 w-8 rounded-lg border border-primary/20 object-cover"
				/>
			{:else}
				<User
					class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-0 dark:scale-100"
				/>
			{/if}
		{:else}
			<User
				class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-0 dark:scale-100"
			/>
		{/if}
		<span class="sr-only">User menu</span>
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{$ndkStore.activeUser ? 'Profile' : 'Login'}</Dialog.Title>
			<Dialog.Description>
				{#if $ndkStore.activeUser}
					Manage your account or log out
				{:else}
					Choose your login method to continue
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			{#if $ndkStore.activeUser}
				<div class="flex flex-col items-center gap-4">
					{#if $ndkStore.activeUser?.profile?.picture}
						<img
							src={$ndkStore.activeUser.profile.picture}
							alt=""
							class="h-20 w-20 rounded-lg border border-primary/20 object-cover"
						/>
					{/if}
					{#if $ndkStore.activeUser?.profile?.name}
						<p class="text-lg font-semibold">{$ndkStore.activeUser.profile.name}</p>
					{/if}
					<Button variant="destructive" onclick={() => logout()}>Logout</Button>
				</div>
			{:else}
				<div class="flex flex-col gap-4">
					<div class="flex gap-4">
						<Button
							variant={loginMethod === 'NIP07' ? 'default' : 'outline'}
							onclick={() => (loginMethod = 'NIP07')}
						>
							Extension
						</Button>
						<Button
							variant={loginMethod === 'NSEC' ? 'default' : 'outline'}
							onclick={() => (loginMethod = 'NSEC')}
						>
							Private Key
						</Button>
					</div>

					{#if loginMethod === 'NIP07'}
						<Button disabled={loading} onclick={() => handleLogin('NIP07')}>
							{loading ? 'Connecting...' : 'Login with Extension'}
						</Button>
					{:else}
						<div class="flex flex-col gap-4">
							<form
								class="flex flex-col gap-4"
								onsubmit={(e) => {
									e.preventDefault();
									handleLogin('NSEC', new FormData(e.target as HTMLFormElement));
								}}
							>
								<div class="grid gap-2">
									<Label for="key">Private Key (nsec or ncryptsec)</Label>
									<Input
										bind:value={keyValue}
										id="key"
										name="key"
										type="password"
										placeholder="nsec1..."
										required
									/>
								</div>
								<div class="grid gap-2">
									<Label for="password">Password</Label>
									<Input
										id="password"
										name="password"
										type="password"
										placeholder="Enter password"
										required
									/>
								</div>
								<div class="mb-4 flex gap-2">
									<Button
										variant="outline"
										type="button"
										onclick={() => {
											try {
												keyValue = generateNewKey();
											} catch (e) {
												error = e instanceof Error ? e.message : 'Failed to generate key';
											}
										}}
									>
										Generate New Key
									</Button>
								</div>
								<Button type="submit" disabled={loading}>
									{loading ? 'Connecting...' : 'Login with Private Key'}
								</Button>
							</form>
						</div>
					{/if}

					{#if error}
						<p class="text-sm text-destructive">{error}</p>
					{/if}
				</div>
			{/if}
		</div>
	</Dialog.Content>

	<Dialog.Root bind:open={showEncryptedKey}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>Save Your Encrypted Key</Dialog.Title>
				<Dialog.Description>
					Store this encrypted key somewhere safe. You can use either this encrypted key or the
					original nsec key to log in.
				</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-4 py-4">
				<div class="rounded-lg border border-border bg-muted p-4">
					<div class="mb-4 flex items-center justify-between">
						<p class="text-sm font-medium">Your encrypted key:</p>
						<Button
							variant="outline"
							size="sm"
							class="shrink-0"
							onclick={() => copyToClipboard(encryptedKey)}
						>
							Copy to Clipboard
						</Button>
					</div>
					<code class="block max-w-full break-all rounded bg-background/50 p-2 text-xs"
						>{encryptedKey}</code
					>
				</div>
				<div class="flex justify-end">
					<Button
						variant="default"
						onclick={() => {
							showEncryptedKey = false;
							open = false;
						}}>Done</Button
					>
				</div>
			</div></Dialog.Content
		>
	</Dialog.Root>
</Dialog.Root>

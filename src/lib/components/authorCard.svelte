<script lang="ts">
	import { truncatePubkeyToNpub } from '$lib/utils';
	import type { NDKUserProfile } from '@nostr-dev-kit/ndk';
	import { createUservalidateNip05Query } from '$lib/queries/authors';
	import { npubEncode } from 'nostr-tools/nip19';
	import Spinner from './spinner.svelte';
	import { Check } from 'lucide-svelte';
	import X from '@lucide/svelte/icons/x';
	import Nip05Badge from './Nip05Badge.svelte';

	export let profile: NDKUserProfile | null = null;
	export let pubkey: string | undefined = undefined;
	export let variant: 'inline' | 'compact' | 'extended' | 'full' | 'minimal' = 'compact';

	$: avatarUrl = profile?.picture || profile?.image || '';
	$: displayName = profile?.displayName || profile?.name || 'Unknown';
	$: bio = profile?.about || profile?.bio || '';
	$: website = profile?.website;
	$: bannerUrl = profile?.banner;
	$: nip05 = profile?.nip05;
	$: npub = pubkey ? truncatePubkeyToNpub(pubkey) : undefined;

	$: nip05ValidationQuery =
		profile && nip05 && pubkey ? createUservalidateNip05Query(profile, pubkey) : undefined;
</script>

{#if variant === 'minimal'}
	{#if profile?.nip05}
		<span class="inline-flex items-center gap-1 font-mono text-xs text-foreground">
			<Nip05Badge
				nip05={profile.nip05}
				isLoading={$nip05ValidationQuery?.isLoading}
				isValid={$nip05ValidationQuery?.data ?? undefined}
			/>
		</span>
	{:else if profile?.displayName || profile?.name}
		<span class="truncate text-xs font-medium text-foreground"
			>{profile.displayName || profile.name}</span
		>
	{:else if pubkey}
		<span class="font-mono text-xs text-foreground" title={npub}>{npub}</span>
	{/if}
{:else if !profile && pubkey}
	<!-- No profile, just show npub -->
	<div class="flex items-center gap-2">
		<span class=" truncate font-mono text-sm text-foreground" title={npub}
			>{npubEncode(pubkey)}</span
		>
	</div>
{:else if !profile && !pubkey}
	<!-- No profile and no pubkey: render nothing -->
{:else if variant === 'inline'}
	<div class="inline-flex items-center gap-2">
		{#if avatarUrl}
			<img src={avatarUrl} alt={displayName} class="h-6 w-6 rounded-full object-cover" />
		{/if}
		<span class="text-sm font-medium">{displayName}</span>
		{#if nip05}
			<span class="text-foreground/40">|</span>
			<Nip05Badge
				{nip05}
				isLoading={$nip05ValidationQuery?.isLoading}
				isValid={$nip05ValidationQuery?.data ?? undefined}
			/>
		{:else if npub}
			<span class="max-w-[12ch] font-mono text-xs text-foreground/40" title={npub}>{npub}</span>
		{/if}
	</div>
{:else if variant === 'compact'}
	<div
		class="flex w-fit items-center gap-2 rounded-lg border border-primary/20 p-1 shadow dark:border-primary/50"
	>
		{#if avatarUrl}
			<img src={avatarUrl} alt={displayName} class="w-10 rounded-full object-cover" />
		{/if}
		<div>
			<div class="flex items-center gap-1 font-semibold leading-tight">
				{displayName}
				{#if nip05}
					<span class="text-foreground/40">|</span>
					{#if $nip05ValidationQuery?.isLoading}
						<Spinner color="currentColor" size={2} borderThickness={2} />
						<span
							class="flex max-w-[16ch] items-center gap-1 truncate font-mono text-xs text-foreground/40"
							title={nip05}
						>
							{nip05}
						</span>
					{:else if $nip05ValidationQuery?.data}
						<Check size={16} />
						<span
							class="flex max-w-[16ch] items-center gap-1 truncate font-mono text-xs text-foreground/70"
							title={nip05}
						>
							{nip05}
						</span>
					{:else}
						<X class=" text-destructive" size={16} />
						<span
							class="flex max-w-[16ch] items-center gap-1 truncate font-mono text-xs text-destructive/70"
							title={nip05}
						>
							{nip05}
						</span>
					{/if}
				{:else if npub}
					<span class="max-w-[12ch] font-mono text-xs text-foreground/40" title={npub}>{npub}</span>
				{/if}
			</div>
			{#if bio}
				<div class="max-w-xs truncate text-xs text-foreground dark:text-foreground">{bio}</div>
			{/if}
		</div>
	</div>
{:else if variant === 'extended'}
	<div
		class="flex items-start gap-4 rounded-xl border border-primary/20 p-4 shadow dark:border-primary/50"
	>
		{#if avatarUrl}
			<img src={avatarUrl} alt={displayName} class="h-16 w-16 rounded-full object-cover" />
		{/if}
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-2 text-lg font-bold">
				{displayName}
				{#if nip05}
					<span class="text-foreground/40">|</span>
					<Nip05Badge
						{nip05}
						isLoading={$nip05ValidationQuery?.isLoading}
						isValid={$nip05ValidationQuery?.data ?? undefined}
					/>
				{/if}
				{#if npub}
					<span class="text-foreground/40">|</span>
					<span class="truncate font-mono text-xs text-foreground/60" title={npub}>{npub}</span>
				{/if}
			</div>
			{#if profile?.name && profile?.displayName && profile.displayName !== profile.name}
				<div class="text-sm text-foreground dark:text-foreground">@{profile.name}</div>
			{/if}
			{#if bio}
				<div class="mt-1 line-clamp-2 text-sm text-foreground dark:text-foreground">{bio}</div>
			{/if}
			<div class="mt-2 flex flex-wrap gap-3 text-xs text-foreground dark:text-foreground">
				{#if website}
					<a href={website} target="_blank" rel="noopener"
						>🌐 {website.replace(/^https?:\/\//, '')}</a
					>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<!-- full variant -->
	<div class="rounded-xl border border-primary/20 shadow dark:border-primary/50">
		{#if bannerUrl}
			<div class="w-full">
				<img src={bannerUrl} alt="Banner" class="w-full object-cover" />
			</div>
		{/if}
		<div class="flex items-center gap-4 px-6">
			{#if avatarUrl}
				<img
					src={avatarUrl}
					alt={displayName}
					class="h-20 w-20 rounded-full border-4 border-white object-cover shadow-lg dark:border-gray-900"
				/>
			{/if}
			<div class="mt-8">
				<div class="flex items-center gap-3 text-2xl font-bold">
					{displayName}
					{#if nip05}
						<span class="text-foreground/40">|</span>
						{#if $nip05ValidationQuery?.isLoading}
							<Spinner color="currentColor" size={2} borderThickness={2} />
							<span
								class="flex max-w-[24ch] items-center gap-1 truncate font-mono text-xs text-foreground/40"
								title={nip05}>{nip05}</span
							>
						{:else if $nip05ValidationQuery?.data}
							<Check size={16} />
							<span
								class="flex max-w-[24ch] items-center gap-1 truncate font-mono text-xs text-primary/70"
								title={nip05}>{nip05}</span
							>
						{:else}
							<X class="text-destructive" size={16} />
							<span
								class="flex max-w-[24ch] items-center gap-1 truncate font-mono text-xs text-destructive/70"
								title={nip05}>{nip05}</span
							>
						{/if}
					{/if}
					{#if npub}
						<span class="text-foreground/40">|</span>
						<span class="max-w-[20ch] truncate font-mono text-xs text-foreground/60" title={npub}
							>{npub}</span
						>
					{/if}
				</div>
				{#if profile?.name && profile?.displayName && profile.displayName !== profile.name}
					<div class="text-base text-foreground dark:text-foreground">@{profile.name}</div>
				{/if}
			</div>
		</div>
		<div class="px-6 pb-6 pt-2">
			{#if bio}
				<div class="mb-2 text-base text-foreground dark:text-foreground">{bio}</div>
			{/if}
			<div class="flex flex-wrap gap-4 text-sm text-foreground dark:text-foreground">
				{#if website}
					<a href={website} target="_blank" rel="noopener"
						>🌐 {website.replace(/^https?:\/\//, '')}</a
					>
				{/if}
				{#if profile?.lud16}
					<span>⚡ {profile.lud16}</span>
				{/if}
				{#if profile?.lud06}
					<span>⚡ {profile.lud06}</span>
				{/if}
			</div>
		</div>
	</div>
{/if}

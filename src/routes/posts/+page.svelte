<script lang="ts">
	import { createPostsQuery } from '$lib/queries/posts';
	import type { NostrPost } from '$lib/queries/posts';

	const postsQuery = createPostsQuery();
</script>

<div class="p-4">
	<h1 class="text-2xl font-bold mb-4">Nostr Posts</h1>

	{#if $postsQuery.isLoading}
		<p>Loading posts...</p>
	{:else if $postsQuery.isError}
		<p class="text-red-500">Error: {$postsQuery.error.message}</p>
	{:else if $postsQuery.data}
		<div class="space-y-4">
			{#each $postsQuery.data as post (post.id)}
				<div class="border p-4 rounded-lg">
					<p class="text-sm text-gray-500">Author: {post.author}</p>
					<p class="mt-2">{post.content}</p>
					<p class="text-sm text-gray-500 mt-2">
						{new Date(post.createdAt * 1000).toLocaleString()}
					</p>
				</div>
			{/each}
		</div>
	{/if}
</div> 
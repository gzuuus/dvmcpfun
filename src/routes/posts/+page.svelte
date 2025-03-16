<script lang="ts">
	import { createPostsQuery } from '$lib/queries/posts';

	const postsQuery = createPostsQuery();
</script>

<div class="p-4">
	<h1 class="mb-4 text-2xl font-bold">Nostr Posts</h1>

	{#if $postsQuery.isLoading}
		<p>Loading posts...</p>
	{:else if $postsQuery.isError}
		<p class="text-red-500">Error: {$postsQuery.error.message}</p>
	{:else if $postsQuery.data}
		<div class="space-y-4">
			{#each $postsQuery.data as post (post.id)}
				<div class="rounded-lg border p-4">
					<p class="text-sm text-gray-500">Author: {post.author}</p>
					<p class="mt-2">{post.content}</p>
					<p class="mt-2 text-sm text-gray-500">
						{new Date(post.createdAt * 1000).toLocaleString()}
					</p>
				</div>
			{/each}
		</div>
	{/if}
</div>

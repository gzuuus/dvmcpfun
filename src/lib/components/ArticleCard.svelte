<script lang="ts">
	import type { NostrArticle } from '$lib/queries/docs';
	import { formatDate } from '$lib/utils';

	export let article: NostrArticle;

	const truncate = (text: string, maxLength = 150) => {
		if (text && text.length > maxLength) {
			return text.substring(0, maxLength) + '...';
		}
		return text;
	};
</script>

<a
	href="/docs/{article.identifier}"
	class=" flex h-full flex-col overflow-hidden rounded-lg border text-inherit no-underline transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
>
	{#if article.image}
		<div class="h-48 overflow-hidden bg-primary">
			<img src={article.image} alt={article.title} class="h-full w-full object-cover" />
		</div>
	{/if}
	<div class="flex flex-grow flex-col p-6">
		<h2 class="mb-3 mt-0 text-xl font-semibold text-primary">{article.title}</h2>
		{#if article.summary}
			<p class="mb-4 line-clamp-3 flex-grow text-muted-foreground">{truncate(article.summary)}</p>
		{:else}
			<p class="mb-4 line-clamp-3 flex-grow text-muted-foreground">{truncate(article.content)}</p>
		{/if}
		<div class="flex items-center justify-between text-xs text-muted-foreground">
			<span>{formatDate(article.publishedAt || article.createdAt)}</span>
		</div>
	</div>
</a>

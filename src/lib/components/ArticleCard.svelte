<script lang="ts">
	import type { NostrArticle } from '$lib/queries/docs';

	export let article: NostrArticle;

	// Format date to readable format
	const formatDate = (timestamp: number) => {
		return new Date(timestamp * 1000).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	// Truncate text if it's too long
	const truncate = (text: string, maxLength = 150) => {
		if (text && text.length > maxLength) {
			return text.substring(0, maxLength) + '...';
		}
		return text;
	};
</script>

<a href="/docs/{article.identifier}" class="card">
	{#if article.image}
		<div class="card-image">
			<img src={article.image} alt={article.title} />
		</div>
	{/if}
	<div class="card-content">
		<h2 class="card-title">{article.title}</h2>
		{#if article.summary}
			<p class="card-summary">{truncate(article.summary)}</p>
		{:else}
			<p class="card-summary">{truncate(article.content)}</p>
		{/if}
		<div class="card-meta">
			<span class="card-date">
				{formatDate(article.publishedAt || article.createdAt)}
			</span>
		</div>
	</div>
</a>

<style>
	.card {
		display: flex;
		flex-direction: column;
		background-color: var(--color-bg-secondary);
		border-radius: 0.5rem;
		overflow: hidden;
		height: 100%;
		transition:
			transform 0.2s ease-in-out,
			box-shadow 0.2s ease-in-out;
		text-decoration: none;
		color: inherit;
	}

	.card:hover {
		transform: translateY(-4px);
		box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
	}

	.card-image {
		height: 200px;
		overflow: hidden;
	}

	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.card-content {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		flex-grow: 1;
	}

	.card-title {
		margin-top: 0;
		margin-bottom: 0.75rem;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.card-summary {
		margin-bottom: 1rem;
		color: var(--color-text-secondary);
		flex-grow: 1;
	}

	.card-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.875rem;
		color: var(--color-text-tertiary);
	}
</style>

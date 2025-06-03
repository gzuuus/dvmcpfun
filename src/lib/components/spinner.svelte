<script lang="ts">
	let {
		size = 24, // Size in pixels
		color = 'currentColor',
		trackColor = 'transparent',
		thickness = 2 // Thickness in pixels
	} = $props<{
		size?: number;
		color?: string;
		trackColor?: string;
		thickness?: number;
	}>();

	const viewBoxSize = $derived(24);

	const radius = $derived(viewBoxSize / 2 - thickness);
</script>

<div style="width: {size}px; height: {size}px;" aria-label="Loading" role="status">
	<svg
		class="spinner"
		viewBox="0 0 {viewBoxSize} {viewBoxSize}"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		style="--duration: 0.8s;"
	>
		<circle
			cx={viewBoxSize / 2}
			cy={viewBoxSize / 2}
			r={radius}
			stroke={trackColor}
			stroke-width={thickness}
		/>
		<path
			d="M{viewBoxSize / 2} {thickness / 2} A{radius} {radius} 0 0 1 {viewBoxSize / 2 +
				radius} {viewBoxSize / 2}"
			stroke={color}
			stroke-width={thickness}
			stroke-linecap="round"
		/>
	</svg>
</div>

<style>
	.spinner {
		animation: spin var(--duration, 0.8s) linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>

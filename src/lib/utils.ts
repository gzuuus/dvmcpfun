import { type ClassValue, clsx } from 'clsx';
import { decode, npubEncode } from 'nostr-tools/nip19';
import { twMerge } from 'tailwind-merge';
import { encrypt } from 'nostr-tools/nip49';
import { toast } from 'svelte-sonner';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function wait(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const createNcryptSec = (
	sk: string,
	pass: string
): { decodedSk: Uint8Array; ncryptsec: string } => {
	const decoded = decode(sk);
	if (decoded.type !== 'nsec') throw new Error('Not nsec');
	const ncryptsec = encrypt(decoded.data, pass);
	return { decodedSk: decoded.data, ncryptsec };
};

export async function copyToClipboard(data: BlobPart, mimeType = 'text/plain') {
	try {
		if (navigator.clipboard.write) {
			await navigator.clipboard.write([
				new ClipboardItem({
					[mimeType]: new Blob([data], {
						type: mimeType
					}),
					['text/plain']: new Blob([data], {
						type: 'text/plain'
					})
				})
			]);
		} else {
			await new Promise((resolve) => {
				resolve(navigator.clipboard.writeText(String(data)));
			});
		}
		toast.success('Copied 👍');
	} catch (e) {
		toast.error(`Error: ${e}`);
		console.log(e);
	}
}

export const formatDate = (timestamp: number) => {
	return new Date(timestamp * 1000).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
};

export function truncatePubkeyToNpub(pubkey: string): string {
	pubkey = npubEncode(pubkey);
	return `${pubkey.slice(0, 8)}...${pubkey.slice(-3)}`;
}

export function slugify(text: string): string {
	return text
		.toString() // Convert to string (just in case)
		.toLowerCase() // Lowercase all characters
		.trim() // Remove leading/trailing spaces
		.normalize('NFD') // Normalize the string to decompose accented characters
		.replace(/[\u0300-\u036f]/g, '') // Remove all combining diacritical marks
		.replace(/[^a-z0-9\s-]/g, '') // Remove all non-word characters (allows letters, numbers, spaces, dashes)
		.replace(/[\s-]+/g, '-') // Replace spaces and dashes with a single dash
		.replace(/^-+|-+$/g, ''); // Trim dashes from the beginning and the end
}

export function generateRandomColors(count: number) {
	const colors = [];
	for (let i = 0; i < count; i++) {
		const r = Math.floor(Math.random() * 200) + 55;
		const g = Math.floor(Math.random() * 200) + 55;
		const b = Math.floor(Math.random() * 200) + 55;
		colors.push(`rgba(${r}, ${g}, ${b}, 0.6)`);
	}
	return colors;
}

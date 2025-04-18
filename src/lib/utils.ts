import { type ClassValue, clsx } from 'clsx';
import { decode } from 'nostr-tools/nip19';
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

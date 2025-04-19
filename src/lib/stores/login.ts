import { NDKNip07Signer, type NDKNip46Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
import ndkStore, { ndk, ndkProfile } from './nostr';
import { bytesToHex } from '@noble/hashes/utils';
import { decrypt, encrypt } from 'nostr-tools/nip49';
import { decode, nsecEncode } from 'nostr-tools/nip19';
import { generateSecretKey } from 'nostr-tools';

export type BaseAccount = {
	hexPubKey: string;
	type: 'NIP07' | 'NSEC' | 'NIP46';
	lastLogged: number;
	metadata?: {
		encryptedKey?: string;
	};
};

const ACCOUNT_STORAGE_KEY = 'last_account';

export const getStoredAccount = (): BaseAccount | null => {
	const stored = localStorage.getItem(ACCOUNT_STORAGE_KEY);
	return stored ? JSON.parse(stored) : null;
};

export const saveAccount = (account: BaseAccount): void => {
	if (account.metadata?.encryptedKey) {
		localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
	}
};

export const login = async (
	loginMethod: BaseAccount['type'],
	formData?: FormData,
	autoLogin = false
): Promise<boolean> => {
	try {
		if (autoLogin) {
			localStorage.setItem('auto_login', 'true');
			localStorage.setItem('login_method', loginMethod);
		}

		switch (loginMethod) {
			case 'NIP07':
				return loginWithExtension();
			case 'NSEC': {
				if (!formData) throw new Error('Form data required for NSEC login');
				const key = formData.get('key') as string;
				const password = formData.get('password') as string;
				const temporary = formData.get('temporary') === 'true';
				return loginWithPrivateKey(key, password, temporary);
			}
			case 'NIP46':
				throw new Error('NIP-46 login not implemented');
			default:
				throw new Error(`Unknown login method: ${loginMethod}`);
		}
	} catch (e) {
		console.error('Login failed:', e);
		return false;
	}
};

export const loginWithExtension = async (): Promise<boolean> => {
	try {
		const signer = new NDKNip07Signer();
		await setupNDKSigner(signer);

		if (!ndk.signer) {
			throw new Error('Signer setup failed');
		}

		const user = await ndk.signer.user();
		saveAccount({
			hexPubKey: user.pubkey,
			type: 'NIP07',
			lastLogged: Date.now()
		});

		return true;
	} catch (e) {
		console.error('Login with extension failed:', e);
		return false;
	}
};

export const loginWithPrivateKey = async (
	key: string,
	password: string,
	temporary = false
): Promise<boolean> => {
	key = key.trim();
	const encryptedKey = key.startsWith('nsec')
		? createNcryptSec(key, password).ncryptsec
		: key.startsWith('ncryptsec')
			? key
			: null;

	if (!encryptedKey) throw new Error('Invalid key format. Must be nsec or ncryptsec');
	return handlePrivateKeyLogin(encryptedKey, password, temporary);
};

const handlePrivateKeyLogin = async (
	encryptedKey: string,
	password: string,
	temporary: boolean
): Promise<boolean> => {
	try {
		const decryptedKey = decrypt(encryptedKey, password);
		const hexKey = typeof decryptedKey === 'string' ? decryptedKey : bytesToHex(decryptedKey);
		const signer = new NDKPrivateKeySigner(hexKey);
		await setupNDKSigner(signer);

		if (!ndk.signer) {
			throw new Error('Signer setup failed');
		}

		const user = await ndk.signer.user();
		saveAccount({
			hexPubKey: user.pubkey,
			type: 'NSEC',
			lastLogged: Date.now(),
			metadata: {
				encryptedKey
			}
		});

		return true;
	} catch (e) {
		console.error('Private key decryption failed:', e);
		return false;
	}
};

export const createNcryptSec = (
	sk: string,
	pass: string
): { decodedSk: Uint8Array; ncryptsec: string } => {
	const decoded = decode(sk);
	if (decoded.type !== 'nsec') throw new Error('Not nsec');
	const decodedData = decoded.data;
	const ncryptsec = encrypt(decodedData, pass);
	return { decodedSk: decodedData, ncryptsec };
};

export const generateNewKey = (): string => {
	const secretKey = generateSecretKey();
	return nsecEncode(secretKey);
};

export const setupNDKSigner = async (
	signer: NDKNip07Signer | NDKPrivateKeySigner | NDKNip46Signer
): Promise<void> => {
	await signer.blockUntilReady();
	ndk.signer = signer;
	const user = await ndk.signer.user();
	user.ndk = ndkProfile;
	await user.fetchProfile();
	ndkStore.set(ndk);
};

export const logout = (): void => {
	localStorage.removeItem(ACCOUNT_STORAGE_KEY);
	localStorage.removeItem('auto_login');
	localStorage.removeItem('login_method');
	location.replace('/');
};

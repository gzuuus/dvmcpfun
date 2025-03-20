import { NDKNip07Signer, type NDKNip46Signer, type NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
import ndkStore, { ndk } from './nostr';

export type BaseAccount = {
	hexPubKey: string;
	type: 'NIP07' | 'NSEC' | 'NIP46';
	lastLogged: number;
};

export const login = async (
	loginMethod: BaseAccount['type'],
	autoLogin = false
): Promise<boolean> => {
	if (autoLogin) {
		localStorage.setItem('auto_login', 'true');
		localStorage.setItem('login_method', loginMethod);
	}

	switch (loginMethod) {
		case 'NIP07':
			return loginWithExtension();
		case 'NSEC':
			// TODO: Implement private key login
			return false;
		case 'NIP46':
			// TODO: Implement NIP-46 login
			return false;
		default:
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
		await user.fetchProfile();

		ndkStore.set(ndk);

		return true;
	} catch (e) {
		console.error('Login with extension failed:', e);
		return false;
	}
};

export const setupNDKSigner = async (
	signer: NDKNip07Signer | NDKPrivateKeySigner | NDKNip46Signer
) => {
	await signer.blockUntilReady();
	ndk.signer = signer;
	ndkStore.set(ndk);
};

export const logout = (): void => {
	ndk.signer = undefined;
	ndkStore.set(ndk);
	localStorage.removeItem('auto_login');
	localStorage.removeItem('login_method');
};

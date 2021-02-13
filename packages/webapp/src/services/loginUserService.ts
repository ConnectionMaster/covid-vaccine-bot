import firebase from 'firebase/app'
import 'firebase/auth'
import { AppState } from '../store/schema/AppState'
import firebaseConfig from '../configs/firebase.json'

export const loginUserService = async (): Promise<AppState | undefined> => {
	let authResp = undefined

	if (!firebase.apps.length) {
		firebase.initializeApp(firebaseConfig)
	}

	const provider = new firebase.auth.GithubAuthProvider()
	provider.addScope('repo')

	const response = await firebase.auth().signInWithPopup(provider)

	if (response) {
		const oauthCreds = response.credential as firebase.auth.OAuthCredential
		authResp = {
			isAuthenticated: true,
			accessToken: oauthCreds.accessToken,
			email: response.user?.email,
			userDisplayName: response.user?.displayName,
			username: response.additionalUserInfo?.username,
		} as AppState
	}

	return authResp
}

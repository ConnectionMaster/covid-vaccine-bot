/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
export interface AppState {
	isAuthenticated: boolean
	isAuthorized: boolean
	accessToken?: string
	username?: string
	email?: string
	userDisplayName?: string
	branches?: any[]
	issues?: any[]
	mainBranch?: any
	repoFileData?: any
	initRepoFileData?: any[]
	globalFileData?: any
	initGlobalFileData?: any
	currentLanguage: string
	toggleQualifier: boolean
	isEditable: boolean
	pendingChanges: boolean
	isDataRefreshing: boolean
	prChanges?: any[]
}

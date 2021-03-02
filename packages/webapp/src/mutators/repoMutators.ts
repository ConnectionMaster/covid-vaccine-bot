/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { mutatorAction } from 'satcheljs'
import { getAppStore } from '../store/store'
import { createLocationDataObj } from '../utils/dataUtils'

export const setBranchList = mutatorAction(
	'setBranchList',
	(data: any[] | undefined) => {
		if (data) {
			const store = getAppStore()
			store.branches = data
			const mainBranch = data.find((branch) => branch.name === 'main')
			store.mainBranch = mainBranch
		}
	}
)

export const setIssuesList = mutatorAction(
	'setIssuesList',
	(data: any[] | undefined) => {
		if (data) {
			const store = getAppStore()
			store.issues = data
		}
	}
)

export const handleCreatePR = mutatorAction(
	'handleCreatePR',
	(data: any[] | undefined) => {
		if (data) {
			alert('Checkout Github!')
		}
	}
)

export const setRepoFileData = mutatorAction(
	'setRepoFileData',
	(data: any[] | undefined) => {
		if (data) {
			const store = getAppStore()
			console.log(data)
			store.repoFileData = data[0]
			store.initRepoFileData = data[0]
			store.globalFileData = {
				customStrings: data[1],
				cdcStateNames: data[2],
				cdcStateLinks: data[3],
			}
		}
	}
)

export const setCurrentLanguage = mutatorAction(
	'setCurrentLanguage',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			store.currentLanguage = data.key
		}
	}
)
export const updateLocationList = mutatorAction(
	'updateLocationList',
	(locationData: any, isRegion: boolean, selectedState?: any) => {
		if (locationData) {
			const store = getAppStore()
			const newLocObj = createLocationDataObj(locationData)
			store.pendingChanges = true

			if (!isRegion) {
				store.globalFileData.cdcStateNames.content[
					`cdc/${newLocObj.info.content.id}/state_name`
				] = {
					'en-us': locationData.details,
					'es-us': locationData.details,
					'vi-vn': locationData.details,
				}

				store.repoFileData[newLocObj.info.content.id] = newLocObj
				store.repoFileData = { ...store.repoFileData }
			} else {
				newLocObj.info.path = `${selectedState.key}/regions/${newLocObj.info.path}`
				newLocObj.vaccination.path = `${selectedState.key}/regions/${newLocObj.vaccination.path}`

				if (store.repoFileData[selectedState.key].regions) {
					store.repoFileData[selectedState.key].regions[
						newLocObj.info.content.id
					] = newLocObj
				} else {
					store.repoFileData[selectedState.key].regions = {
						[newLocObj.info.content.id]: newLocObj,
					}
				}

				store.repoFileData = { ...store.repoFileData }
			}
		}
	}
)

export const updatePhaseList = mutatorAction(
	'updatePhaseList',
	(phaseItems: any[], isRegion: boolean, selectedState: any) => {
		if (phaseItems) {
			const store = getAppStore()
			store.pendingChanges = true
			store.repoFileData[
				selectedState.key
			].vaccination.content.phases = phaseItems.map((item) => {
				return {
					id: item.keyId,
					label: item.name,
					qualifications: item.value.qualifications,
				}
			})

			store.repoFileData = { ...store.repoFileData }
		}
	}
)

export const modifyStateStrings = mutatorAction(
	'modifyStateStrings',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			if (store?.repoFileData) {
				store.pendingChanges = true
				const location = store.repoFileData[data.locationKey]
				if (!location.strings?.content[data.infoKey]) {
					const newStringsObj: any = {}
					newStringsObj[store.currentLanguage] = data.item.moreInfoContent
					location.strings.content[data.infoKey] = newStringsObj
					if (!data.regionInfo) {
						const affectedPhase = location.vaccination.content.phases.find(
							(phase: any) => phase.id === data.item.groupId
						)
						const affectedQualifier = affectedPhase.qualifications.find(
							(qualification: any) =>
								qualification.question.toLowerCase() === data.item.qualifierId.toLowerCase()
						)
						if (affectedQualifier) {
							affectedQualifier.moreInfoText = data.infoKey
						} else {
							affectedPhase.qualifications.push({
								question: data.item.qualifierId,
								moreInfoText: data.infoKey,
							})
						}
					} else {
						const regionVaccinationObj =
							location.regions[data.regionInfo.key].vaccination

						if (!regionVaccinationObj.content?.phases) {
							copyPhaseData(regionVaccinationObj, location.vaccination)
						}
							const affectedPhase = regionVaccinationObj.content.phases.find(
								(phase: any) => phase.id === data.item.groupId
							)
							const affectedQualifier = affectedPhase.qualifications.find(
									(qualification: any) =>
										qualification.question.toLowerCase() === data.item.qualifierId.toLowerCase()
								)

							affectedQualifier.moreInfoText = data.infoKey

					}
				} else {
					location.strings.content[data.infoKey][store.currentLanguage] =
						data.item.moreInfoContent
				}
			}
		}
	}
)

const copyPhaseData = ( newObj:any, oldObj:any ) => {

	newObj.content['phases'] = []
						oldObj.content.phases.forEach((phase: any) => {
							const currPhaseObj: any = {}
							currPhaseObj['id'] = phase.id
							currPhaseObj['qualifications'] = []
							phase.qualifications.forEach((qual: any) => {
								currPhaseObj.qualifications.push({
									question: qual.question.toLowerCase(),
									moreInfoText: qual.moreInfoText?.toLowerCase(),
									moreInfoUrl: qual.moreInfoUrl,
								})
							})

							newObj.content.phases.push(currPhaseObj)
						})
}

export const modifyMoreInfoLinks = mutatorAction(
	'modifyMoreInfoLinks',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			if (store?.repoFileData) {
				store.pendingChanges = true
				const location = store.repoFileData[data.locationKey]
				if (data.regionInfo) {
					const regionVaccinationObj =
						location.regions[data.regionInfo.key].vaccination
					if (!regionVaccinationObj.content?.phases) {
						copyPhaseData(regionVaccinationObj, location.vaccination)
					}

					const affectedPhase = regionVaccinationObj.content.phases.find(
						(phase: any) => phase.id === data.item.groupId
					)

					if (affectedPhase) {
						const affectedQualifier = affectedPhase.qualifications.find(
							(qualification: any) =>
								qualification.question.toLowerCase() === data.item.qualifierId.toLowerCase()
						)

						if (affectedQualifier) {
							affectedQualifier.moreInfoUrl = data.item.moreInfoUrl
						}
					}
				} else {
					const affectedPhase = location.vaccination.content.phases.find(
						(phase: any) => phase.id === data.item.groupId
					)
					const affectedQualifier = affectedPhase.qualifications.find(
						(qualification: any) =>
							qualification.question.toLowerCase() === data.item.qualifierId.toLowerCase()
					)
					if (affectedQualifier) {
						affectedQualifier.moreInfoUrl = data.item.moreInfoUrl
					} else {
						affectedPhase.qualifications.push({
							question: data.item.qualifierId,
							moreInfoUrl: data.item.moreInfoUrl,
						})
					}
				}
			}
		}
	}
)

export const updateQualifier = mutatorAction(
	'updateQualifier',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			if (store?.repoFileData) {
				store.pendingChanges = true
				const location = store.repoFileData[data.locationKey]

				if (data.regionInfo) {
					const regionVaccinationObj =
						location.regions[data.regionInfo.key].vaccination
					if (!regionVaccinationObj.content?.phases) {
						copyPhaseData(regionVaccinationObj, location.vaccination)
					}

					const affectedPhase = regionVaccinationObj.content.phases.find(
						(phase: any) => phase.id === data.item.groupId
					)

					const affectedQualifier = affectedPhase.qualifications.find(
						(qualification: any) =>
							qualification.question.toLowerCase() === data.oldId.toLowerCase()
					)
					if (affectedQualifier) {

							affectedQualifier.question = data.item.qualifierId.toLowerCase()

					}

				} else {
					const affectedPhase = location.vaccination.content.phases.find(
						(phase: any) => phase.id === data.item.groupId
					)

					const affectedQualifier = affectedPhase.qualifications.find(
						(qualification: any) =>
							qualification.question.toLowerCase() === data.oldId.toLowerCase()
					)
					if (affectedQualifier) {

							affectedQualifier.question = data.item.qualifierId.toLowerCase()

					}

				}


			}
		}
	}
	)
export const addQualifier = mutatorAction(
	'addQualifier',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			if (store?.repoFileData) {
				store.pendingChanges = true
				const location = store.repoFileData[data.locationKey]

				if (data.regionInfo) {
					const regionVaccinationObj =
						location.regions[data.regionInfo.key].vaccination
					if (!regionVaccinationObj.content?.phases) {
						copyPhaseData(regionVaccinationObj, location.vaccination)
					}
					const affectedPhase = regionVaccinationObj.content.phases.find(
						(phase: any) => phase.id === data.item.groupId
					)

					affectedPhase.qualifications.push({
							question: data.item.qualifierId,
						})
				} else {
					const affectedPhase = location.vaccination.content.phases.find(
						(phase: any) => phase.id === data.item.groupId
					)

					affectedPhase.qualifications.push({
							question: data.item.qualifierId,
						})

				}
			}
		}
	}
	)
export const removeQualifier = mutatorAction(
	'removeQualifier',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			if (store?.repoFileData) {
				store.pendingChanges = true
				const location = store.repoFileData[data.locationKey]

				if (data.regionInfo) {
					const regionVaccinationObj =
						location.regions[data.regionInfo.key].vaccination
					if (!regionVaccinationObj.content?.phases) {
						copyPhaseData(regionVaccinationObj, location.vaccination)
					}
					const affectedPhase = regionVaccinationObj.content.phases.find(
						(phase: any) => phase.id === data.item.groupId
					)

					const removeIndex = affectedPhase.qualifications.findIndex(
						(qualification: any) =>
							qualification.question.toLowerCase() === data.item.qualifierId.toLowerCase()
					)
					affectedPhase.qualifications.splice(removeIndex,1)
					store.repoFileData = { ...store.repoFileData }

				} else {
					const affectedPhase = location.vaccination.content.phases.find(
						(phase: any) => phase.id === data.item.groupId
					)

					const removeIndex = affectedPhase.qualifications.findIndex(
						(qualification: any) =>
							qualification.question.toLowerCase() === data.item.qualifierId.toLowerCase()
					)
					affectedPhase.qualifications.splice(removeIndex,1)
					store.repoFileData = { ...store.repoFileData }


				}
			}
		}
	}
	)
export const removePhase = mutatorAction(
	'removePhase',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			if (store?.repoFileData) {
				store.pendingChanges = true
				const location = store.repoFileData[data.locationKey]

				if (data.regionInfo) {
					const regionVaccinationObj =
						location.regions[data.regionInfo.key].vaccination
					if (!regionVaccinationObj.content?.phases) {
						copyPhaseData(regionVaccinationObj, location.vaccination)
					}
					const removeIndex = regionVaccinationObj.content.phases.findIndex(
						(phase: any) => phase.id === data.phaseId
					)

					regionVaccinationObj.content.phases.splice(removeIndex,1)
					store.repoFileData = { ...store.repoFileData }



				} else {
					const removeIndex = location.vaccination.content.phases.findIndex(
						(phase: any) => phase.id === data.phaseId
					)

					location.vaccination.content.phases.splice(removeIndex,1)
					store.repoFileData = { ...store.repoFileData }
				}
			}
		}
	}

)
export const setActivePhase = mutatorAction(
	'setActivePhase',
	(data: any | undefined) => {
		if (data) {
			const store = getAppStore()
			if (store?.repoFileData) {
				store.pendingChanges = true
				const location = store.repoFileData[data.locationKey]

				if (data.regionInfo) {
					const regionVaccinationObj =
						location.regions[data.regionInfo.key].vaccination
					regionVaccinationObj.content['activePhase'] = data.phaseId
					store.repoFileData = { ...store.repoFileData }
				} else {
					location.vaccination.content['activePhase'] = data.phaseId
					store.repoFileData = { ...store.repoFileData }
				}
			}
		}
	}
)

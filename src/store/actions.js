import {
    MobilizonApi,
    MbzRequestError,
    MbzProxyAuthError,
    MbzProxyRequestError,
    MbzProxyValidationError,
} from '../api/mobilizon'
import { ScrapperApi } from '../api/scrapper.js'
import { GeoApi } from '../api/geo.js'
import compareVersions from '../utils/compareVersions.js'
import router from '../router.js'
import versionData from '../version.js'
import { messageTranslate } from '../i18n/utils.js'

const mobilizonApi = new MobilizonApi()
const scrapperApi = new ScrapperApi()
const geoApi = new GeoApi()

export const issueMobilizonRequest = async ({ dispatch, commit, getters, state }, requestHandler) => {
    
    try {
        return await requestHandler({ dispatch, commit, getters, state })
    } catch (error) {
        if (error instanceof MbzProxyAuthError) {
            console.log('Action - Proxy auth error')
            dispatch('createErrorFromText', messageTranslate('auth_error'))
            dispatch('logoutMobilizon')
            store.dispatch('navigateTo', '/')
        } else if (error instanceof MbzRequestError) {
            dispatch('createErrorFromText', messageTranslate('server_communication_error'))
        }
    }
}

export default {
    async init({ commit, dispatch }) {

        console.log('Action - Initialize application')

        console.log('Action - Checking version')

        const appVersionSaved = localStorage.getItem('appVersion')
        const currentAppVersion = versionData.version
        const isBreakingVersion = versionData.isBreaking

        if ((!appVersionSaved || compareVersions(appVersionSaved, currentAppVersion) < 0) && isBreakingVersion) {
            console.log('Action - New breaking app version detected')
            dispatch('logoutMobilizon')
            localStorage.setItem('appVersion', currentAppVersion)
            commit('addMessage', { text: 'Application mise à jour. Veuillez vous reconnecter.', type: 'primary' })
            console.log('Action - New app version saved')
        }

        const mobilizonAppIsAuthorized = localStorage.getItem('mobilizonAppIsAuthorized')
        if (mobilizonAppIsAuthorized) {
            commit('setMobilizonAppIsAuthorized', JSON.parse(mobilizonAppIsAuthorized))
            // refresh data
            dispatch('fetchMobilizonConfigAndLoggedUser')            
        } else {
            commit('setMobilizonAppIsAuthorized', false)
        }
        
        const mobilizonInstanceUrl = localStorage.getItem('mobilizonInstanceUrl')
        if (mobilizonInstanceUrl) {
            mobilizonApi.instanceUrl = mobilizonInstanceUrl
            commit('setMobilizonInstanceUrl', mobilizonInstanceUrl)
            console.log('Action - Mobilizon instance url set from localstorage', mobilizonInstanceUrl)
        } else {
            console.log('Action - No Mobilizon instance url in localstorage')
        }        
        
        const localEvent = localStorage.getItem('localEvent')
        if (localEvent) {
            commit('setLocalEvent', JSON.parse(localEvent))
            console.log('Action - Local event set from localstorage', JSON.parse(localEvent))
        }

        const groups = localStorage.getItem('mobilizonGroups')
        if (groups) {
            commit('setMobilizonGroups', JSON.parse(groups))
            console.log('Action - Mobilizon groups set from localstorage', JSON.parse(groups))
        }   
        
        const identities = localStorage.getItem('mobilizonIdentities')
        if (identities) {
            commit('setMobilizonIdentities', JSON.parse(identities))
            console.log('Action - Mobilizon identities set from localstorage', JSON.parse(identities))
        }  
        
        const selectedMobilizonIdentity = localStorage.getItem('selectedMobilizonIdentity')
        if (selectedMobilizonIdentity) {
            dispatch('selectMobilizonIdentity', JSON.parse(selectedMobilizonIdentity))
            console.log('Action - Selected mobilizon identity set from localstorage', JSON.parse(selectedMobilizonIdentity))
        }  
        
        const selectedMobilizonGroup = localStorage.getItem('selectedMobilizonGroup')
        if (selectedMobilizonGroup) {
            dispatch('selectMobilizonGroup', JSON.parse(selectedMobilizonGroup))
            console.log('Action - Selected mobilizon group set from localstorage', JSON.parse(selectedMobilizonGroup))
        }              

        const mobilizonConfig = localStorage.getItem('mobilizonConfig')
        if (mobilizonConfig) {
            commit('setMobilizonConfig', JSON.parse(mobilizonConfig))
            console.log('Action - Mobilizon config set from localstorage', JSON.parse(mobilizonConfig))
        }  

        const eventScrapperUrl = localStorage.getItem('eventScrapperUrl')
        if (eventScrapperUrl) {
            commit('setEventScrapperUrl', JSON.parse(eventScrapperUrl))
            console.log('Action - Scrapper URL set from localstorage', JSON.parse(eventScrapperUrl))
        }  

        const lastSavedUUID = localStorage.getItem('lastSavedUUID')
        if (lastSavedUUID) {
            commit('setMobilizonCreatedEventUuid', lastSavedUUID)
            console.log('Action - Last event saved UUID set from localstorage', lastSavedUUID)
        }  

        const sharingUrl = localStorage.getItem('sharingUrl')
        if (sharingUrl) {
            commit('setSharingUrl', sharingUrl && sharingUrl !== '' ? sharingUrl : null)
            console.log('Action - Sharing URL set from localstorage', sharingUrl)
        }  
        
        return true
    },
    logoutMobilizon({ commit, dispatch }) {
        console.log('Action - Logout')
        dispatch('resetEvent')
        dispatch('resetEventScrapper')
        localStorage.removeItem('mobilizonTokenData')
        localStorage.removeItem('mobilizonGroups')
        localStorage.removeItem('mobilizonIdentities')
        localStorage.removeItem('selectedMobilizonIdentity')
        localStorage.removeItem('selectedMobilizonGroup')
        localStorage.removeItem('mobilizonConfig')
        localStorage.removeItem('lastSavedUUID')
        localStorage.removeItem('mobilizonAppIsAuthorized')
        commit('setMobilizonAppIsAuthorized', false)
        commit('clearMobilizonSession')
        commit('clearHistory')
    },
    async authorizeApp({ commit, state }, data) {
        console.log('Action - Authorizing app with code ' + data.code)
        await mobilizonApi.authorizeApp(data.code, data.clientId)
        localStorage.setItem('mobilizonAppIsAuthorized', true)
        commit('setMobilizonAppIsAuthorized', true)
    },
    selectMobilizonIdentityAndGroup({ commit, dispatch }, payload) {
        dispatch('selectMobilizonIdentity', payload.identity)
        dispatch('selectMobilizonGroup', payload.group)
    },
    selectMobilizonIdentity({ commit }, id) {
        console.log(`Action - Select identity ${id}`);
        localStorage.setItem('selectedMobilizonIdentity', id)
        commit('setSelectedMobilizonIdentity', id)
    },
    selectMobilizonGroup({ commit }, id) {
        console.log(`Action - Select group ${id}`);
        localStorage.setItem('selectedMobilizonGroup', id)
        commit('setSelectedMobilizonGroup', id)
    },
    async scrapEvent({ commit, dispatch }, url) {
        dispatch('resetEvent')
        dispatch('resetEventScrapper')
        commit('setEventScrapperUrl', url)
        localStorage.setItem('eventScrapperUrl', JSON.stringify(url))
        commit('setIsLoadingScrapper', true)
        let data = null
        try {
            data = await scrapperApi.scrapEvent(url)
        } catch (error) {
            dispatch('createErrorFromText', messageTranslate('scrap_event_error'))
        }
        commit('setEventScrapperData', data)
        commit('setIsLoadingScrapper', false)    
        return data
    },
    async scrapGroup({ commit, dispatch }, url) {
        commit('setIsLoadingScrapper', true)
        let data = null
        try {
            data = await scrapperApi.scrapGroup(url)
        } catch (error) {
            dispatch('createErrorFromText', messageTranslate('scrap_group_error'))
        }
        commit('setGroupScrapperData', data)            
        commit('setIsLoadingScrapper', false)
    },
    resetGroupScrapperData({ commit }) {
        commit('setGroupScrapperData', null)            
    },
    async uploadImage(store, file) {
        const requestHandler = async ({ commit }) => {
            commit('setMobilizonSavedImageURL', null)
            const data = await mobilizonApi.uploadImage(file)
            commit('setMobilizonSavedImageURL', data.url)
        }

        await issueMobilizonRequest(store, requestHandler)
    },
    async searchAddressFromCoords(store, addressCoords) {
        addressCoords.lng = parseFloat(addressCoords.lng)
        addressCoords.lat = parseFloat(addressCoords.lat)
        const requestHandler = ({ commit, state }) => {
            const commitResult = source => data => commit('addAddressesFromCoords', { addresses: data || [], searchIndex, source })
            commit('clearAddressesFromCoords')
            commit('newAdressesFromCoordsSearch')
            const { searchIndex } = state.addressesFromCoords
            issueMobilizonRequest(store, async ({ commit }) => {
                const data = await mobilizonApi.reverseGeocode(addressCoords)
                commit('addAddressesFromCoords', { addresses: data || [], searchIndex, source: 'osm' })
            })
            geoApi
                .reverse(addressCoords)
                .then(commitResult('geodata'))
        }
        issueMobilizonRequest(store, requestHandler)
    },        
    fetchMobilizonConfigAndLoggedUser(store) {
        
        console.log('Action - Load mobilizon config and groups')

        issueMobilizonRequest(store, async ({ commit, dispatch, state }) => {
            commit('setConfigIsLoading', true)
            commit('setIsLoadingGroups', true)
            
            // API call
            const { config, loggedUser } = await mobilizonApi.getConfigAndLoggedUser()
            localStorage.setItem('mobilizonConfig', JSON.stringify(config))
            
            // Set config
            commit('setMobilizonConfig', config)

            // Set identities and groups
            const groups = loggedUser.memberships
            const actors = loggedUser.actors
            const formattedGroups = groups.elements
                .filter(group => group.role === 'MODERATOR' || group.role === 'ADMINISTRATOR')
                .map(group => ({
                    ...group.parent, 
                    id: parseInt(group.parent.id),
                    memberId: parseInt(group.actor.id)
                }))
            const formattedActors = actors.map(actor => ({
                id: parseInt(actor.id),
                name: actor.name,
                preferredUsername: actor.preferredUsername,
                avatar: actor.avatar ? {...actor.avatar} : null,
            }))
            localStorage.setItem('mobilizonGroups', JSON.stringify(formattedGroups))
            localStorage.setItem('mobilizonIdentities', JSON.stringify(formattedActors))
            commit('setMobilizonGroups', formattedGroups)
            commit('setMobilizonIdentities', formattedActors)

            commit('setConfigIsLoading', false)
            commit('setIsLoadingGroups', false)
            
            if (!state.mobilizon.selectedIdentityId) {
                dispatch('selectMobilizonIdentity', formattedActors[0].id)
                dispatch('selectMobilizonGroup', null)
            }
        })        
    },
    createErrorFromText({ commit }, text) {
        commit('addMessage', { text, type: 'error' })
    },
    informUser({ commit }, text) {
        commit('addMessage', { text, type: 'info' })
    },        
    async saveMobilizonGroup(store, group) {
        console.log('Action - Save mobilizon group : ', group);

        const requestHandler = async ({ dispatch, commit, state }) => {
            commit('setIsSavingGroup', true)
            try {                
                const createdGroup = await mobilizonApi.createGroup(group)
                const formattedGroup = {
                    ...createdGroup, 
                    id: parseInt(createdGroup.id),
                    memberId: state.mobilizon.selectedIdentityId
                }
                commit('addMobilizonGroup', formattedGroup)
                dispatch('selectMobilizonGroup', formattedGroup.id)
            } catch (error) { 
                if (error instanceof MbzProxyValidationError) {
                    error.messages.forEach(message => {
                        commit('addMessage', { text: message, type: 'error' })
                    })
                } else {
                    throw error
                }
                    
                return null
            } finally {
                commit('setIsSavingGroup', false)
            } 
        }        
        return await issueMobilizonRequest(store, requestHandler)
    },
    async saveMobilizonEvent(store, event) {
        console.log('Action - Save mobilizon event : ', event);
        
        const requestHandler = async ({ commit, state }) => {
            commit('setIsSavingEvent', true)
            try {                
                commit('setMobilizonCreatedEventUuid', null)
                const uuid = await mobilizonApi.createEvent(
                    {
                        ...event,
                        organizerActorId: state.mobilizon.selectedIdentityId,
                        attributedToId: state.mobilizon.selectedGroupId,
                    }
                )
                commit('setLastSavedIsDraft', event.draft)
                commit('setMobilizonCreatedEventUuid', uuid)
                localStorage.setItem('lastSavedUUID', uuid)
                return uuid
            } catch (error) { 
                if (error instanceof MbzProxyValidationError) {
                    error.messages.forEach(message => {
                        commit('addMessage', { text: message, type: 'error' })
                    })
                } else {
                    throw error
                }
                    
                return null
            } finally {
                commit('setIsSavingEvent', false)
            }
        }
        return await issueMobilizonRequest(store, requestHandler)
    },
    async searchAddressFromString(store, addressString) {
        
        const requestHandler = ({ commit, state }) => {
            const commitResult = source => data => commit('addAddressesFromString', { addresses: data || [], searchIndex, source })
            commit('clearAddressesFromString')
            commit('newAdressesFromStringSearch')
            const { searchIndex } = state.addressesFromString
            issueMobilizonRequest(store, async ({ commit }) => {
                    const data = await mobilizonApi.searchAddress(addressString)
                    commit('addAddressesFromString', { addresses: data || [], searchIndex, source: 'osm' })
            })
            geoApi
                .search(addressString)
                .then(commitResult('geodata'))
        }
        issueMobilizonRequest(store, requestHandler)
    },
    setPageTitle({ commit }, title) {
        commit('setPageTitle', title)            
    },
    async registerApp({ commit, dispatch }, mobilizonInstanceUrl) {
        try {
            commit('setIsRegisteringApp', true)
            const authUrl = await mobilizonApi.registerApp(mobilizonInstanceUrl)
            localStorage.setItem('mobilizonInstanceUrl', mobilizonInstanceUrl)
            commit('setMobilizonInstanceUrl', mobilizonInstanceUrl)
            window.location = authUrl
        } catch (error) {
            dispatch('createErrorFromText', messageTranslate('register_app_error', { error: error && error.message ? error.message : String(error) }))
        } finally {
            commit('setIsRegisteringApp', false)
        }
    },
    resetEventScrapper({ commit }) {
        console.log('Action - Reset scrapper')
        localStorage.removeItem('eventScrapperUrl')
        commit('setEventScrapperUrl', null)
        commit('setEventScrapperData', null)
    },
    resetEvent({ commit }) {
        console.log('Action - Reset event')
        commit('setMobilizonCreatedEventUuid', null)
        commit('clearAddressesFromCoords')   
        commit('setLastSavedIsDraft', null)           
        commit('setLocalEvent', null)
        localStorage.removeItem('localEvent')
        localStorage.removeItem('lastSavedUUID')
    },
    saveLocalEvent({ commit }, event) {
        console.log('Action - Save local event', event)
        localStorage.setItem('localEvent', JSON.stringify(event))
        commit('setLocalEvent', event)
    },
    shareUrl({ commit }, url) {
        console.log('Action - Share url');
        localStorage.setItem('eventScrapperUrl', JSON.stringify(url))
        commit('setEventScrapperUrl', url)
    },
    async registerFeed({ state, commit, dispatch }, { url, type }) {
        const personId = state.mobilizon.selectedIdentityId
        const groupId = state.mobilizon.selectedGroupId
        console.log(`Action - Registering feed`, url, personId, groupId)
        commit('setIsRegisteringAutomation', true)
        try {
            await mobilizonApi.createAutomation(url, type, personId, groupId)
            return true
        } catch (error) {
            if (error.body && error.body.name === "AutomationAlreadyExists") {
                const key = groupId ? 'feed_already_exists_group' : 'feed_already_exists_user'
                dispatch('createErrorFromText', messageTranslate(key))
            } else {
                dispatch('createErrorFromText', messageTranslate('create_automation_error', { error: error && error.message ? error.message : String(error) }))
            }
            return false
        } finally {
            commit('setIsRegisteringAutomation', false)
        }
    },
    async fetchAutomations({ state, commit, dispatch }) {
        console.log(`Action - Fetching automations`);
        const personId = state.mobilizon.selectedIdentityId
        const groupId = state.mobilizon.selectedGroupId        
        commit('setIsFetchingAutomations', true)
        commit('setAutomations', [])
        commit('resetAutomationHistory')
        try {
            const automations = await mobilizonApi.getAutomations(personId, groupId)
            commit('setAutomations', automations)
            commit('setIsFetchingAutomations', false)
        // Handles Abort Exception
        } catch (error) {
            if ( ! (error instanceof DOMException) ) {
                dispatch('createErrorFromText', messageTranslate('fetch_automations_error', { error: error && error.message ? error.message : String(error) }))
            } else {
                console.log(error.message);
            }
        }   
    },
    async fetchAutomationHistory({ state, commit, dispatch }, automationId) {
        console.log(`Action - Fetching automation history`, automationId)    
        commit('setIsFetchingAutomationHistory', true)
        try {
            const history = await mobilizonApi.getAutomationHistory(automationId)
            commit('setAutomationHistory', history)
        // Handles Abort Exception
        } catch (error) {
            if ( ! (error instanceof DOMException) ) {
                dispatch('createErrorFromText', messageTranslate('fetch_automation_history_error', { error: error && error.message ? error.message : String(error) }))
            } else {
                console.log(error.message);
            }
        } finally {
            commit('setIsFetchingAutomationHistory', false)
        }
    },
    async loadAutomation({ commit, dispatch }, automationId) {
        console.log(`Action - Loading automation`, automationId)
        commit('resetAutomationHistory')
        dispatch('fetchAutomationHistory', automationId)
    },
    async executeAutomation({ commit, state }, automationId) {
        console.log(`Action - Executing automation`, automationId)
        commit('setIsExecutingAutomation', { isExecuting: true, automationId })
        const history = await mobilizonApi.executeAutomation(automationId)
        commit('setAutomationHistory', history)
        commit('setIsExecutingAutomation', {isExecuting: false, automationId})
    },
    navigateToAndReplace({ commit, state }, path) { 
        console.log(`Action - Navigating to ${path} and replace current route`)
        const lastPath = state.history[state.history.length - 2] || null
        if (lastPath) {
            commit('removeLastPathsFromHistory', 1)
        }
        commit('addPathToHistory', path)
        router.replace(path)
    },
    navigateTo({ commit, state }, path) {
        console.log(`Action - Navigating to ${path}`)
        commit('addPathToHistory', path)
        router.push(path)
    },
    navigateBack({ commit, state }) {
        const lastPath = state.history[state.history.length - 2] || null
        console.log(`Action - Navigating to previous route : ${lastPath}`)
        if (lastPath) {
            commit('removeLastPathsFromHistory', 1)
            router.push(lastPath)
        }
    },
    saveSharingUrl({ commit }, url) {
        console.log(`Action - Sharing url ${url}`)
        localStorage.setItem('sharingUrl', url || '')
        commit('setSharingUrl', url)
    }
}
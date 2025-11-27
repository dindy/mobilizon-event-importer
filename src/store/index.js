import { createStore } from 'vuex'
import { MobilizonApi, ExpiredTokenError, RequestError, SaveError } from '../api/mobilizon'
import { ScrapperApi } from '../api/scrapper.js'
import { GeoApi } from '../api/geo.js'

const mobilizonApi = new MobilizonApi()
const scrapperApi = new ScrapperApi()
const geoApi = new GeoApi()
let reIssueCounter = 0
const issueMobilizonRequest = async ({ dispatch, commit, getters, state }, requestHandler) => {
    
    let token = getters.getMobilizonTokenData 
    
    // If no access token, fetch it using the code
    if (!token) {
        await dispatch('fetchMobilizonToken')
        token = getters.getMobilizonTokenData
    }
    try {
        return await requestHandler(token, { dispatch, commit, getters, state })
    } catch (error) {
        if (error instanceof ExpiredTokenError) { 
            // Handle expired token error
            console.log('Action - Token expired')
            // Check if we have a valid refresh token
            const last_refresh = state.mobilizon.tokenData.last_refresh
            const currentTime = Date.now()
            const refreshTokenExpiresIn = state.mobilizon.tokenData.refresh_token_expires_in
            const refreshToken = state.mobilizon.tokenData.refresh_token
            if (last_refresh && (currentTime - last_refresh) < refreshTokenExpiresIn * 1000) {
                // If the refresh token is still valid, try to refresh the token
                console.log('Action - Fetching new token from refresh token')
                try { 
                    commit('setRefreshingMobilizonToken', true)
                    const data = await mobilizonApi.refreshToken(refreshToken)
                    data.last_refresh = Date.now()
                    localStorage.setItem('mobilizonTokenData', JSON.stringify(data))
                    commit('setMobilizonTokenData', data)
                    console.log('Action - Re-issue the request');
                    if (reIssueCounter < 5) {
                        reIssueCounter++
                        await issueMobilizonRequest({ dispatch, commit, getters, state }, requestHandler)
                    } else {
                        dispatch('createErrorFromText', 'Communication avec le serveur impossible')
                        dispatch('logoutMobilizon')
                        setTimeout(() => {
                            location.reload();
                        }, 3000)
                    }
                } catch (error) {
                    console.log('Action - Error refreshing Mobilizon token :', error)
                    dispatch('createErrorFromText', 'Impossible de rafraîchir le jeton de connexion : ' + error.message)
                    dispatch('logoutMobilizon')
                } finally {
                    commit('setRefreshingMobilizonToken', false)
                }
            } else {
                // If the refresh token is expired, clear the session
                console.log('Action - Refresh token expired, clear mobilizon data...')
                dispatch('createErrorFromText', 'Session expirée. Veuillez vous reconnecter.')
                commit('clearMobilizonSession')
            }
        } else if (error instanceof SaveError) {
            dispatch('createErrorFromText', 'Erreur lors de la sauvegarde.')
        } else if (error instanceof RequestError) {
            dispatch('createErrorFromText', 'Erreur de communication avec le serveur : ' + error.message)
        } else {
            dispatch('createErrorFromText', 'Erreur de communication inconnue avec le serveur : ' + error.message)
        }
    }
}
const entriesAsObject = entries => Object.entries(entries).map(([_key, value]) => ({ ...value, _key }))
const getAddresses = sources => entriesAsObject(sources)
    .sort((a, b) => a.priority - b.priority)
    .reduce((results, source) => [...results, ...source.results], [])
const getIdentityById = (state, identityId) => identityId ? state.mobilizon.identities.filter(identity => identity.id === identityId)[0] : null   
const getGroupById = (state, groupId) => groupId ? state.mobilizon.groups.filter(group => group.id === groupId)[0] : null

export default createStore({
    state() {
        return {
            pageTitle: null,
            messages: [],
            mobilizon: {
                savingGroup: false,
                loadingGroups: false,
                savingEvent: false,
                fetchingToken: false,
                refreshingToken: false,
                instanceUrl: null,
                application: {
                    name: null,
                    scope: null,
                    client_secret: null,
                    client_id: null,
                    redirect_uri: null,
                    website: null,
                },
                tokenData: {
                    code: null,
                    access_token: null,
                    expires_in: null,
                    refresh_token: null,
                    refresh_token_expires_in: null,
                    scopes: null,
                    token_type: null,
                    last_refresh: null,
                },
                identities: [],
                groups: [],
                selectedGroupId: null,
                selectedIdentityId: null,
                config: null,
                createdEventUuid: null,
                lastSavedUUID: null,
                lastSavedImageUrl: null,
                lastSavedIsDraft: null
            },
            scrapper: {
                isLoading: false,
                event: {
                    data: null,
                    url: null
                },
                group: {
                    data: null,
                    url: null                    
                }
            },
            geo: {
                isLoadingAdressesFromString: false,
                isLoadingAdressesFromStringRequestIndex: null,
                isLoadingAdressesFromCoords: false,
                foundAdressesFromCoords: null,
                foundAdressesFromString: null,
            },
            addressesFromString: {
                sources: {
                    geodata: {
                        results: [],
                        loading: false,
                        priority: 2
                    },
                    osm: {
                        results: [],
                        laoding: false,
                        priority: 1
                    }
                },
                searchIndex: 1
            },
            addressesFromCoords: {
                sources: {
                    geodata: {
                        results: [],
                        loading: false,
                        priority: 2
                    },
                    osm: {
                        results: [],
                        laoding: false,
                        priority: 1
                    }
                },
                searchIndex: 1
            }, 
            localEvent: null            
        }
    },
    getters: {
        getAddressesFromString: state => getAddresses(state.addressesFromString.sources),
        getAddressFromStringById: state => id => getAddresses(state.addressesFromString.sources).filter(address => address.id === id)[0],
        isLoadingAddressesFromString: state => entriesAsObject(state.addressesFromString.sources)
            .reduce((loading, source) => loading || source.loading, false),
        getAddressesFromCoords: state => getAddresses(state.addressesFromCoords.sources),
        getAddressFromCoordsById: state => id => getAddresses(state.addressesFromCoords.sources).filter(address => address.id === id)[0],
        isLoadingAddressesFromCoords: state => entriesAsObject(state.addressesFromCoords.sources)
            .reduce((loading, source) => loading || source.loading, false),
        getMobilizonTokenData: state => state.mobilizon.tokenData.access_token,
        getIdentities: state => state.mobilizon.identities,
        getIdentityById: state => identityId => getIdentityById(state, identityId),
        getGroupById: state => groupId => getGroupById(state, groupId),        
        getGroupsByIdentityId: state => identityId => state.mobilizon.groups.filter(group => group.memberId === identityId),
        getSelectedIdentity: state => getIdentityById(state, state.mobilizon.selectedIdentityId),
        getSelectedGroup: state => getGroupById(state, state.mobilizon.selectedGroupId),
        isLoadingGroups: state => state.mobilizon.loadingGroups,
        isSavingEvent: state => state.mobilizon.savingEvent,
        isSavingGroup: state => state.mobilizon.savingGroup,
        isLoadingScrapper: state => state.scrapper.isLoading,
        getScrappedEvent: state => state.scrapper.event.data,
        getScrappedGroup: state => state.scrapper.group.data,
        getEventCategories: state => state.mobilizon.config.eventCategories,
        getUploadLimits: state => state.mobilizon.config.uploadLimits,
        getMobilizonConfig: state => state.mobilizon.config,
        getMessages: state => state.messages,
        getPageTitle: state => state.pageTitle,
        getCurrentMessage: state => state.messages
            .sort((a, b) => a.id - b.id)
            .filter(message => !message.hidden)[0],
        isMobilizonUserAuthenticated: state => state.mobilizon.identities.length > 0,
        isInstanceConfigLoaded: state => state.mobilizon.config !== null,
        isConnectingToMobilizon: state => state.mobilizon.fetchingToken || state.mobilizon.refreshingToken,
        getMobilizonEventUUID: state => state.mobilizon.lastSavedUUID,
        getMobilizonImageURL: state => state.mobilizon.lastSavedImageUrl,
        getSelectedGroupAddress: state => state.mobilizon.selectedGroupId ?
            state.mobilizon.groups?.filter(group => group.id === state.mobilizon.selectedGroupId)[0].physicalAddress
            : null,
        hasMobilizonTokenData: state => state.mobilizon.tokenData.access_token !== null,
        getMobilizonInstanceUrl: state => state.mobilizon.instanceUrl,
        getEventScrapperUrl: state => state.scrapper.event.url,
        getGroupScrapperUrl: state => state.scrapper.group.url,
        getMobilizonEventIsDraft: state => state.mobilizon.lastSavedIsDraft,
        getLocalEvent: state => state.localEvent,
    },
    mutations: {
        clearAddressesFromString(state) {
            entriesAsObject(state.addressesFromString.sources)
                .forEach(source => state.addressesFromString.sources[source._key].results = []) 
        },
        newAdressesFromStringSearch(state) {
            state.addressesFromString.searchIndex++
            entriesAsObject(state.addressesFromString.sources)
                .forEach(source => state.addressesFromString.sources[source._key].loading = true) 
        },
        addAddressesFromString(state, data) {
            const { searchIndex } = data
            if (searchIndex !== state.addressesFromString.searchIndex) return
            let addressIndex = getAddresses(state.addressesFromString.sources).length
            state.addressesFromString.sources[data.source].results = data.addresses.map((address, index) => ({ ...address, id: addressIndex + index }))
            state.addressesFromString.sources[data.source].loading = false
        },
        clearAddressesFromCoords(state) {
            entriesAsObject(state.addressesFromCoords.sources)
                .forEach(source => state.addressesFromCoords.sources[source._key].results = []) 
        },
        newAdressesFromCoordsSearch(state) {
            state.addressesFromCoords.searchIndex++
            entriesAsObject(state.addressesFromCoords.sources)
                .forEach(source => state.addressesFromCoords.sources[source._key].loading = true) 
        },
        addAddressesFromCoords(state, data) {
            const { searchIndex } = data
            if (!searchIndex == state.addressesFromCoords.searchIndex) return
            let addressIndex = getAddresses(state.addressesFromCoords.sources).length
            state.addressesFromCoords.sources[data.source].results = data.addresses.map((address, index) => ({ ...address, id: addressIndex + index }))
            state.addressesFromCoords.sources[data.source].loading = false
        },

        addMessage(state, message) {
            state.messages.push({
                type: message.type,
                created: Date.now(),
                text: message.text,
                id: state.messages.length + 1,
                hidden: false
            })
        },
        hideMessage(state, messageId) {
            const message = state.messages.filter(message => message.id == messageId)[0]
            message.hidden = true
        },
        setMobilizonCode(state, code) {
            state.mobilizon.code = code
        },
        setMobilizonTokenData(state, data) {
            console.log('Mutation - Mutate mobilizon token data with', data);
            state.mobilizon.tokenData = data
        },
        setMobilizonGroups(state, groups) {
            state.mobilizon.groups = groups
            console.log('Mutation - Mobilizon groups set:', state.mobilizon.groups);
        },
        addMobilizonGroup(state, group) {
            state.mobilizon.groups.push(group)
            console.log('Mutation - Mobilizon group added:', group);
        },
        setMobilizonIdentities(state, identities) {
            state.mobilizon.identities = identities
            console.log('Mutation - Mobilizon identities set:', state.mobilizon.identities);
        },
        setIsLoadingGroups(state, isLoading) {
            console.log('Mutation - Set is loading groups : ' + isLoading);
            state.mobilizon.loadingGroups = isLoading
        },
        setIsSavingEvent(state, isSaving) {
            state.mobilizon.savingEvent = isSaving
        },
        setIsSavingGroup(state, isSaving) {
            state.mobilizon.savingGroup = isSaving
        },
        clearMobilizonSession(state) {
            state.mobilizon.tokenData = {
                code: null,
                access_token: null,
                expires_in: null,
                refresh_token: null,
                refresh_token_expires_in: null,
                scopes: null,
                token_type: null,
                last_refresh: null,
            }
            state.mobilizon.identities = []
            state.mobilizon.groups = []
            state.mobilizon.selectedGroupId = null
            state.mobilizon.selectedIdentityId = null
        },
        setIsLoadingScrapper(state, isLoading) {
            state.scrapper.isLoading = isLoading
        },
        setSelectedMobilizonIdentity(state, id) {
            state.mobilizon.selectedIdentityId = id
        },
        setSelectedMobilizonGroup(state, id) {
            state.mobilizon.selectedGroupId = id
        },
        setEventScrapperData(state, data) {
            console.log('Mutation - Set event scrapper data', data);
            state.scrapper.event.data = data
        },
        setGroupScrapperData(state, data) {
            console.log('Mutation - Set group scrapper data', data);
            state.scrapper.group.data = data
        },
        setMobilizonConfig(state, config) {
            console.log('Mutation - Set mobilizon config', config);
            state.mobilizon.config = config
        },
        setMobilizonCreatedEventUuid(state, value) {
            console.log('Mutation - Set event UUID : ' + value);
            state.mobilizon.lastSavedUUID = value
        },
        setMobilizonSavedImageURL(state, value) {
            console.log('Mutation - Set image URL : ' + value);
            state.mobilizon.lastSavedImageUrl = value
        },
        setPageTitle(state, title) {
            state.pageTitle = title
        },
        setFetchingMobilizontoken(state, isFetching) {
            state.mobilizon.fetchingToken = isFetching
        },
        setRefreshingMobilizonToken(state, isRefreshing) {
            state.mobilizon.refreshingToken = isRefreshing
        },
        setMobilizonAppData(state, appData) {
            state.mobilizon.application = appData
        },
        setMobilizonInstanceUrl(state, url) {
            console.log('Mutation - Set mobilizon instance url', url)
            state.mobilizon.instanceUrl = url
        },
        setEventScrapperUrl(state, url) {
            console.log('Mutation - Set event scrapper url', url)
            state.scrapper.event.url = url
        },
        setGroupScrapperUrl(state, url) {
            console.log('Mutation - Set group scrapper url', url)
            state.scrapper.group.url = url
        },        
        setLastSavedIsDraft(state, isDraft) {
            console.log('Mutation - Set last saved is draft', isDraft)
            state.mobilizon.lastSavedIsDraft = isDraft
        },
        setLocalEvent(state, event) {
            state.localEvent = event
        }
    },
    actions: {
        async init({ commit, dispatch }) {

            console.log('Action - Initialize application');

            const mobilizonAppDataString = localStorage.getItem('mobilizonAppData')
            if (mobilizonAppDataString) {
                const mobilizonAppData = JSON.parse(mobilizonAppDataString)
                mobilizonApi.clientSecret = mobilizonAppData.client_secret
                mobilizonApi.clientId = mobilizonAppData.client_id
                commit('setMobilizonAppData', mobilizonAppData)
                console.log('Action - Mobilizon app data set from localstorage', mobilizonAppData)
            } else {
                console.log('Action - No Mobilizon app data in localstorage')
            }
            
            const mobilizonInstanceUrl = localStorage.getItem('mobilizonInstanceUrl')
            if (mobilizonInstanceUrl) {
                mobilizonApi.instanceUrl = mobilizonInstanceUrl
                commit('setMobilizonInstanceUrl', mobilizonInstanceUrl)
                console.log('Action - Mobilizon instance url set from localstorage', mobilizonInstanceUrl)
            } else {
                console.log('Action - No Mobilizon instance url in localstorage')
            }

            const mobilizonTokenData = localStorage.getItem('mobilizonTokenData')
            if (mobilizonTokenData) {
                commit('setMobilizonTokenData', JSON.parse(mobilizonTokenData))
                console.log('Action - Mobilizon Token set from localstorage', JSON.parse(mobilizonTokenData))
                // Refresh data
                dispatch('fetchMobilizonGroups')
                dispatch('loadMobilizonConfig')
            } else {
                console.log('Action - No Mobilizon Token data in localstorage')
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
                commit('setSelectedMobilizonIdentity', JSON.parse(selectedMobilizonIdentity))
                console.log('Action - Selected mobilizon identity set from localstorage', JSON.parse(selectedMobilizonIdentity))
            }  
            
            const selectedMobilizonGroup = localStorage.getItem('selectedMobilizonGroup')
            if (selectedMobilizonGroup) {
                commit('setSelectedMobilizonGroup', JSON.parse(selectedMobilizonGroup))
                console.log('Action - Selected mobilizon identity set from localstorage', JSON.parse(selectedMobilizonGroup))
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
            
            return true
        },
        loadMobilizonTokenDataFromLocalStorage() { 
            console.log('Action - Loading Mobilizon token data from local storage');
            return 
        },
        loadMobilizonAppDataFromLocalStorage() { 
            console.log('Action - Loading Mobilizon app data from local storage');
            return localStorage.getItem('mobilizonAppData')
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
            commit('clearMobilizonSession')
        },
        saveMobilizonCode({ commit }, code) {
            console.log('Action - Saving Mobilizon code:', code);
            commit('setMobilizonCode', code)
        },
        async fetchMobilizonToken({ dispatch, commit, state }) {
            console.log('Action - Fetch Mobilizon Token');
            if (state.mobilizon.code) {
                try {
                    commit('setFetchingMobilizontoken', true)
                    const data = await mobilizonApi.exchangeCodeForToken(state.mobilizon.code)
                    data.last_refresh = Date.now()
                    localStorage.setItem('mobilizonTokenData', JSON.stringify(data))
                    commit('setMobilizonTokenData', data)
                } catch (error) {
                    dispatch('createErrorFromText', 'Impossible d\'obtenir un jeton de connexion : ' + error.message)
                } finally { 
                    commit('setFetchingMobilizontoken', false)
                }
            } else {

            }
        },
        async fetchMobilizonGroups(store) {             
            const requestHandler = async (token, { commit }) => {
                try {
                    console.log('Action - Fetch Mobilizon Groups')
                    commit('setIsLoadingGroups', true)       
                    const data = await mobilizonApi.getUserGroups(token)
                    const groups = data.loggedUser.memberships
                    const actors = data.loggedUser.actors
                    const formattedGroups = groups.elements
                        .filter(group => group.role === 'MODERATOR' || group.role === 'ADMINISTRATOR')
                        .map(group => ({
                            ...group.parent,
                            memberId: group.actor.id
                        }))

                    const formattedActors = actors.map(actor => ({
                        id: actor.id,
                        name: actor.name,
                        preferredUsername: actor.preferredUsername,
                        avatar: actor.avatar ? {...actor.avatar} : null,
                    }))
                    localStorage.setItem('mobilizonGroups', JSON.stringify(formattedGroups))
                    localStorage.setItem('mobilizonIdentities', JSON.stringify(formattedActors))
                    commit('setMobilizonGroups', formattedGroups)
                    commit('setMobilizonIdentities', formattedActors)
                } finally {
                    commit('setIsLoadingGroups', false)                
                }
            }
            await issueMobilizonRequest(store, requestHandler)
        },
        selectMobilizonIdentityAndGroup({ commit }, payload) {
            console.log(`Action - Select identity ${payload.identity} and group ${payload.group}`);
            localStorage.setItem('selectedMobilizonGroup', JSON.stringify(payload.group))
            localStorage.setItem('selectedMobilizonIdentity', JSON.stringify(payload.identity))
            commit('setSelectedMobilizonIdentity', payload.identity)
            commit('setSelectedMobilizonGroup', payload.group)
        },
        async scrapEvent({ commit, dispatch }, url) {
            dispatch('resetEvent')
            dispatch('resetEventScrapper')
            commit('setEventScrapperUrl', url)
            localStorage.setItem('eventScrapperUrl', JSON.stringify(url))
            commit('setIsLoadingScrapper', true)
            const data = await scrapperApi.scrapEvent(url)
            commit('setEventScrapperData', data)
            commit('setIsLoadingScrapper', false)    
            return data
        },
        async scrapGroup({ commit }, url) {
            commit('setIsLoadingScrapper', true)
            const data = await scrapperApi.scrapGroup(url)
            commit('setGroupScrapperData', data)            
            commit('setIsLoadingScrapper', false)
        },
        resetGroupScrapperData({ commit }) {
            commit('setGroupScrapperData', null)            
        },
        async uploadImage(store, file) {

            const requestHandler = async (token, { commit }) => {
                commit('setMobilizonSavedImageURL', null)
                const data = await mobilizonApi.uploadImage(file, token)
                commit('setMobilizonSavedImageURL', data.url)
            }

            await issueMobilizonRequest(store, requestHandler)
        },
        async searchAddressFromCoords(store, addressCoords) {
            addressCoords.lng = parseFloat(addressCoords.lng)
            addressCoords.lat = parseFloat(addressCoords.lat)
            const requestHandler = (token, { commit, state }) => {
                const commitResult = source => data => commit('addAddressesFromCoords', { addresses: data || [], searchIndex, source })
                commit('clearAddressesFromCoords')
                commit('newAdressesFromCoordsSearch')
                const { searchIndex } = state.addressesFromCoords
                issueMobilizonRequest(store, async (token, { commit }) => {
                    const data = await mobilizonApi.reverseGeocode(addressCoords, token)
                    commit('addAddressesFromCoords', { addresses: data || [], searchIndex, source: 'osm' })
                })
                geoApi
                    .reverse(addressCoords)
                    .then(commitResult('geodata'))
            }
            issueMobilizonRequest(store, requestHandler)
        },        
        loadMobilizonConfig(store) {
            console.log('Action - Load mobilizon config')
            issueMobilizonRequest(store, async (token, { commit }) => {
                const config = await mobilizonApi.getConfig(token)
                localStorage.setItem('mobilizonConfig', JSON.stringify(config))
                commit('setMobilizonConfig', config)
            })
        },
        createErrorFromText({ commit }, text) {
            commit('addMessage', { text, type: 'error' })
        },
        async saveMobilizonGroup(store, group) {
            console.log('Action - Save mobilizon group : ', group);

            const requestHandler = async (token, { commit, state }) => {
                commit('setIsSavingGroup', true)
                try {                
                    const createdGroup = await mobilizonApi.createGroup(group, token)
                    const formattedGroup = {...createdGroup, memberId: state.mobilizon.selectedIdentityId }
                    commit('addMobilizonGroup', formattedGroup)
                    commit('setSelectedMobilizonGroup', formattedGroup.id)
                } catch (error) { 
                    if (error instanceof SaveError) {
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
            
            const requestHandler = async (token, { commit, state }) => {
                commit('setIsSavingEvent', true)
                try {                
                    const uuid = await mobilizonApi.createEvent(
                        {
                            ...event,
                            organizerActorId: state.mobilizon.selectedIdentityId,
                            attributedToId: state.mobilizon.selectedGroupId,
                        },
                        token
                    )
                    commit('setLastSavedIsDraft', event.draft)
                    commit('setMobilizonCreatedEventUuid', uuid)
                    localStorage.setItem('lastSavedUUID', uuid)
                    return uuid
                } catch (error) { 
                    if (error instanceof SaveError) {
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
            
            const requestHandler = (token, { commit, state }) => {
                const commitResult = source => data => commit('addAddressesFromString', { addresses: data || [], searchIndex, source })
                commit('clearAddressesFromString')
                commit('newAdressesFromStringSearch')
                const { searchIndex } = state.addressesFromString
                issueMobilizonRequest(store, async (token, { commit }) => {
                        const data = await mobilizonApi.searchAddress(addressString, token)
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
                const data = await mobilizonApi.registerApp(mobilizonInstanceUrl)
                mobilizonApi.clientSecret = data.client_secret
                mobilizonApi.clientId = data.client_id
                mobilizonApi.instanceUrl = mobilizonInstanceUrl
                localStorage.setItem('mobilizonAppData', JSON.stringify(data))
                localStorage.setItem('mobilizonInstanceUrl', mobilizonInstanceUrl)
                commit('setMobilizonAppData', data)
                commit('setMobilizonInstanceUrl', mobilizonInstanceUrl)
                const authUrl = mobilizonApi.getAuthorizationUrl()
                window.location = authUrl
            } catch (error) {
                dispatch('createErrorFromText', 'Impossible de se connecter à l\'instance : ' + error)
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
        }
    },
})
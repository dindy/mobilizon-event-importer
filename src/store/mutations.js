import {
    entriesAsObject, 
    getAddresses,
} from './utils.js'

export default {
    setMobilizonAppIsAuthorized(state, isAuthorized) {
        state.mobilizon.authorized = isAuthorized
    },
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
    setIsRegisteringApp(state, isLoading) {
        console.log('Mutation - Set is registering app : ' + isLoading);
        state.mobilizon.registeringApp = isLoading
    },
    setConfigIsLoading(state, isLoading) {
        console.log('Mutation - Set is loading config : ' + isLoading);
        state.mobilizon.loadingConfig = isLoading
    },
    setIsSavingEvent(state, isSaving) {
        state.mobilizon.savingEvent = isSaving
    },
    setIsSavingGroup(state, isSaving) {
        state.mobilizon.savingGroup = isSaving
    },
    clearMobilizonSession(state) {
        state.mobilizon.identities = []
        state.mobilizon.groups = []
        state.mobilizon.selectedGroupId = null
        state.mobilizon.selectedIdentityId = null
    },
    setIsLoadingScrapper(state, isLoading) {
        state.scrapper.isLoading = isLoading
    },
    setSelectedMobilizonIdentity(state, id) {
        console.log(`Mutation - Set selected mbz identity`, id);
        state.mobilizon.selectedIdentityId = parseInt(id)
    },
    setSelectedMobilizonGroup(state, id) {
        console.log(`Mutation - Set selected mbz group`, id);
        state.mobilizon.selectedGroupId = parseInt(id)
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
    },
    setIsRegisteringAutomation(state, isRegistering) {
        state.automations.isRegistering = isRegistering
    },
    setIsFetchingAutomations(state, isFetching) {
        console.log('Mutation - Set is fetching automations', isFetching)
        state.automations.isFetching = isFetching
    },
    setAutomations(state, automations) {
        console.log('Mutation - Set automations', automations)
        state.automations.currentActorAutomations = automations.map(aut => ({ ...aut, isExecuting: false }))
    },
    setAutomationHistory(state, { logs, events }) {
        console.log('Mutation - Set automation history', logs, events)
        state.automations.logs = logs
        state.automations.events = events
    },
    resetAutomationHistory(state) {
        console.log('Mutation - Reset automation history')
        state.automations.logs = []
        state.automations.events = []
    },
    setIsFetchingAutomationHistory(state, isFetching) {
        console.log('Mutation - Set is fetching automation history', isFetching)
        state.automations.isFetchingHistory = isFetching
    }, 
    setIsExecutingAutomation(state, { automationId, isExecuting }) {
        console.log('Mutation - Set is executing', automationId, isExecuting)
        state.automations.currentActorAutomations = state.automations.currentActorAutomations.map(aut => ({ ...aut, isExecuting: aut.id == automationId ? isExecuting : aut.isExecuting }))
    },
    addPathToHistory(state, path) {
        console.log('Mutation - Push path', path)
        state.history.push(path)
        console.log('Mutation - History : ', state.history)
    },
    removeLastPathsFromHistory(state, n) {
        console.log(`Mutation - Remove last ${n} path(s)`)
        state.history.splice(-1 * n)
    },
    setIsFirstRoute(state, isFirstRoute) {
        state.isFirstRoute = isFirstRoute
    },
    clearHistory(state) {
        state.history = []
    }
}
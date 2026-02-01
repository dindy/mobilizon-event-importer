export default {
    sharingUrl: null,
    isFirstRoute: true,
    history: [],
    pageTitle: null,
    messages: [],
    mobilizon: {
        authorized: true,
        savingGroup: false,
        loadingGroups: false,
        loadingConfig: false,
        savingEvent: false,
        registeringApp: false,
        instanceUrl: null,
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
    automations: {
        isCreating: false,
        isFetching: false,
        isFetchingHistory: false,
        currentActorAutomations: [],
        logs: [],
        events: [],
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
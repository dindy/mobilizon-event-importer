import {
    entriesAsObject, 
    getAddresses, 
    getIdentityById, 
    getGroupById
} from './utils.js'

export default {
    getAddressesFromString: state => getAddresses(state.addressesFromString.sources),
    getAddressFromStringById: state => id => getAddresses(state.addressesFromString.sources).filter(address => address.id === id)[0],
    isLoadingAddressesFromString: state => entriesAsObject(state.addressesFromString.sources)
        .reduce((loading, source) => loading || source.loading, false),
    getAddressesFromCoords: state => getAddresses(state.addressesFromCoords.sources),
    getAddressFromCoordsById: state => id => getAddresses(state.addressesFromCoords.sources).filter(address => address.id === id)[0],
    isLoadingAddressesFromCoords: state => entriesAsObject(state.addressesFromCoords.sources)
        .reduce((loading, source) => loading || source.loading, false),
    getIdentities: state => state.mobilizon.identities,
    getGroups: state => state.mobilizon.groups,
    getIdentityById: state => identityId => getIdentityById(state, identityId),
    getGroupById: state => groupId => getGroupById(state, groupId),        
    getGroupsByIdentityId: state => identityId => state.mobilizon.groups.filter(group => group.memberId === identityId),
    getSelectedIdentity: state => getIdentityById(state, state.mobilizon.selectedIdentityId),
    getSelectedIdentityGroups: state => state.mobilizon.groups.filter(group => group.memberId === state.mobilizon.selectedIdentityId),
    getSelectedGroup: state => getGroupById(state, state.mobilizon.selectedGroupId),
    isLoadingGroups: state => state.mobilizon.loadingGroups,
    isLoadingConfig: state => state.mobilizon.loadingConfig,
    isSavingEvent: state => state.mobilizon.savingEvent,
    isRegisteringApp: state => state.mobilizon.registeringApp,
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
    getMobilizonEventUUID: state => state.mobilizon.lastSavedUUID,
    getMobilizonImageURL: state => state.mobilizon.lastSavedImageUrl,
    getSelectedGroupAddress: state => state.mobilizon.selectedGroupId ?
        state.mobilizon.groups?.filter(group => group.id === state.mobilizon.selectedGroupId)[0].physicalAddress
        : null,
    getMobilizonInstanceUrl: state => state.mobilizon.instanceUrl,
    getEventScrapperUrl: state => state.scrapper.event.url,
    getGroupScrapperUrl: state => state.scrapper.group.url,
    getMobilizonEventIsDraft: state => state.mobilizon.lastSavedIsDraft,
    getLocalEvent: state => state.localEvent,
    isMobilizonAppAuthorized: state => state.mobilizon.authorized
}
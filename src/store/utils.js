export const entriesAsObject = entries => Object.entries(entries).map(([_key, value]) => ({ ...value, _key }))

export const getAddresses = sources => entriesAsObject(sources)
    .sort((a, b) => a.priority - b.priority)
    .reduce((results, source) => [...results, ...source.results], [])

export const getIdentityById = (state, identityId) => identityId ? state.mobilizon.identities.filter(identity => identity.id === identityId)[0] : null   

export const getGroupById = (state, groupId) => groupId ? state.mobilizon.groups.filter(group => group.id === groupId)[0] : null
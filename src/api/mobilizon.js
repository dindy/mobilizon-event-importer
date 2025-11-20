export class RequestError extends Error {
    constructor(message) {
        super(message)
        this.name = "RequestError"
    }
}

export class ExpiredTokenError extends RequestError {
    constructor(message) {
        super(message)
        this.name = "ExpiredTokenError"
    }
}

export class SaveError extends RequestError {
    constructor(messages) {
        super('Erreur lors de la sauvegarde')
        this.name = "SaveError"
        this.messages = messages
    }
}

const isObject = (x) => typeof x === 'object' && !Array.isArray(x) && x !== null
const isString = (x) => typeof x === 'string' || x instanceof String

export class MobilizonApi {

    // static instanceUrl = import.meta.env.VITE_MOBILIZON_API_URI
    // static clientId = import.meta.env.VITE_MOBILIZON_CLIENT_ID
    // static clientSecret = import.meta.env.VITE_MOBILIZON_CLIENT_SECRET
    instanceUrl = null
    clientId = null
    clientSecret = null    
    redirectUri = `${window.location.protocol}//${window.location.host}/mobilizon/callback`
    scope = 'read write'
    state = 'import-mobilizon-state'
    clientName = 'mobilizon-importer-1'
    websiteUrl = 'https://website.mobilizon.webworkers.agency'
    
    get apiUrl() {
        return `${this.instanceUrl}/api`
    } 

    searchAddressController = null

    constructor() {

    }

    async handleResponse(response) {

        if (response.status === 200) {
            
            const body = await response.json()
            return body
        
        } else if (response.status === 401) {

            const body = await response.json()
            
            if (body.message === 'invalid_token' && body.details === ':token_expired') {
                throw new ExpiredTokenError('Unauthorized: Token expired')
            }
        }

        throw new RequestError(response)        
    }

    async registerApp(instanceUrl) {

        const response = await fetch(`${instanceUrl}/apps`, {
            method: 'POST',
            body: new URLSearchParams({
                'name': this.clientName,
                'redirect_uri': this.redirectUri,
                'website': this.websiteUrl,
                'scope': this.scope
            })            
        })

        if (response.status === 200) {
            const body = await response.json()
            return body
        } else if (response.status.toString().startsWith('4')) {
            const body = await response.json()
            const error = body.error && body.error_description ?
                `${body.error} : ${body.error_description}` :
                `${response.status} ${response.statusText}`
            throw new RequestError(error)
        } else {
            throw new RequestError(`${response.status} ${response.statusText}`)
        }        
    }

    getAuthorizationUrl() {
        return `${this.instanceUrl}/oauth/authorize?` + new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            scope: this.scope,
            state: this.state
        })
    }

    async exchangeCodeForToken(code) {
        
        const response = await fetch(`${this.instanceUrl}/oauth/token?` + new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: this.redirectUri,
            scope: this.scope,
        }), {
            method: 'POST',
        })

        if (response.status === 200) {
            const body = await response.json()
            return body
        } else if (response.status.toString().startsWith('4')) {
            const body = await response.json()
            const error = body.error && body.error_description ?
                `${body.error} : ${body.error_description}` :
                `${response.status} ${response.statusText}`
            throw new RequestError(error)
        } else {
            throw new RequestError(`${response.status} ${response.statusText}`)
        }

    }

    async refreshToken(refreshToken) {
        
        const response = await fetch(`${this.instanceUrl}/oauth/token?` + new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }), {
            method: 'POST',
        })
            
        if (response.status === 200) {
            const body = await response.json()
            return body
        }
        
        throw new RequestError(`Failed to refresh token: ${response.status} ${response.statusText}`);
    }

    async getUserGroups(accessToken) { 

        const document = `
            query LoggedUserMemberships($membershipName: String, $page: Int, $limit: Int) {
                loggedUser {
                    id
                    memberships(name: $membershipName, page: $page, limit: $limit) {
                        total
                        elements {
                            role
                            actor {
                                ...ActorFragment
                            }
                            parent {
                                ...ActorFragment
                                ...GroupFragment
                            }
                        }
                    }
                    actors {      
                        ...ActorFragment      
                    }                        
                }
            }

            fragment GroupFragment on Group {
                id
                physicalAddress {
                    ...AdressFragment 
                }
            }

            fragment AdressFragment on Address {
                id
                description
                geom
                street
                locality
                postalCode
                region
                country
                type
                url
                originId
                timezone
                pictureInfo {
                    url
                    author {
                        name
                        url
                    }
                    source {
                        name
                        url
                    }
                }
            }

            fragment ActorFragment on Actor {
                id
                type
                preferredUsername
                name
                avatar {
                    url
                }
            }
        `

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ query: document })
        })

        return (await this.handleResponse(response)).data
    }

    async uploadImage(file, accessToken) {

        const formData = new FormData()

        formData.append("query", `mutation uploadMedia($file: Upload!, $name: String!) {
                uploadMedia(file: $file, name: $name) {
                    url
                    id
                    __typename
                }
            }`
        )        
        formData.append("variables", `{"name":"${file.name}","file":"image1"}`)        
        formData.append("image1", file, file.name)   

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        })

        return (await this.handleResponse(response)).data.uploadMedia
    }

    async getConfig(accessToken) {

        const query = `
            query FullConfig {
                config {
                    name
                    description
                    slogan
                    version
                    registrationsOpen
                    registrationsAllowlist
                    demoMode
                    longEvents
                    durationOfLongEvent
                    countryCode
                    languages
                    primaryColor
                    secondaryColor
                    instanceLogo {
                        url
                        __typename
                    }
                    defaultPicture {
                        url
                        name
                        metadata {
                            width
                            height
                            blurhash
                            __typename
                        }
                        __typename
                    }
                    eventCategories {
                        id
                        label
                        __typename
                    }
                    anonymous {
                        participation {
                            allowed
                            validation {
                                email {
                                    enabled
                                    confirmationRequired
                                    __typename
                                }
                                captcha {
                                    enabled
                                    __typename
                                }
                                __typename
                            }
                            __typename
                        }
                        eventCreation {
                            allowed
                            validation {
                                email {
                                    enabled
                                    confirmationRequired
                                    __typename
                                }
                                captcha {
                                    enabled
                                    __typename
                                }
                                __typename
                            }
                            __typename  
                        }
                        reports {
                            allowed
                            __typename
                        }
                        actorId
                        __typename
                    }
                    location {
                        latitude
                        longitude
                        __typename
                    }
                    maps {
                        tiles {
                            endpoint
                            attribution
                            __typename
                        }
                        routing {
                            type
                            __typename
                        }
                        __typename
                    }
                    geocoding {
                        provider
                        autocomplete
                        __typename
                    }
                    resourceProviders {
                        type
                        endpoint
                        software
                        __typename
                    }
                    features {
                        groups
                        eventCreation
                        eventExternal
                        antispam
                        __typename
                    }
                    restrictions {
                        onlyAdminCanCreateGroups
                        onlyGroupsCanCreateEvents
                        __typename
                    }
                    auth {
                        ldap
                        databaseLogin
                        oauthProviders {
                            id
                            label
                            __typename
                        }
                        __typename
                    }
                    uploadLimits {
                        default
                        avatar
                        banner
                        __typename
                    }
                    instanceFeeds {
                        enabled
                        __typename
                    }
                    webPush {
                        enabled
                        publicKey
                        __typename
                    }
                    analytics {
                        id
                        enabled
                        configuration {
                            key
                            value
                            type
                            __typename
                        }
                        __typename
                    }
                    search {
                        global {
                            isEnabled
                            isDefault
                            __typename
                        }
                        __typename
                    }
                    exportFormats {
                        eventParticipants
                        __typename
                    }
                    __typename
                }
            }        
        ` 
        
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                operationName: 'FullConfig',
                query: query,
                variables: '{}'
            })
        })

        return (await this.handleResponse(response)).data.config
    }

    async searchAddress(queryString, accessToken) {

        const query = `
            query SearchAddress($query: String!, $locale: String, $type: AddressSearchType) {
                searchAddress(query: $query, locale: $locale, type: $type) {
                    ...AdressFragment
                    __typename
                }
            }
            
            fragment AdressFragment on Address {
                id
                description
                geom
                street
                locality
                postalCode
                region
                country
                type
                url
                originId
                timezone
                pictureInfo {
                    url
                    author {
                        name
                        url
                        __typename
                    }
                    source {
                        name
                        url
                        __typename
                    }
                    __typename
                }
                __typename
            }
        `

        if (this.searchAddressController) this.searchAddressController.abort()
        
        this.searchAddressController = new AbortController()
        
        const response = await fetch(this.apiUrl, {
            signal: this.searchAddressController.signal,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                operationName: 'SearchAddress',
                query: query,
                variables: {
                    locale: 'fr',
                    query: queryString,
                }
            })
        })

        return (await this.handleResponse(response))
            .data
            .searchAddress
            .filter(address => address.country == 'France') 
            .filter(address => address.type == 'street' || address.type == 'house' || (address.type == 'city' && address.postalCode))
            .map(address => ({ ...address, street: address.street ? address.street.trim() : address.street }))
            .map(address => {
                return (address.type == 'city') ?
                    { ...address, locality: address.description } :
                    { ...address }
            })        
            .map(address => {
                return (address.type == 'street') ?
                    { ...address, street: address.description } :
                    { ...address }
            })        
    }

    async reverseGeocode(coords, accessToken) {

        const query = `
            query ReverseGeocode($latitude: Float!, $longitude: Float!, $zoom: Int, $locale: String) {
                reverseGeocode(
                    latitude: $latitude
                    longitude: $longitude
                    zoom: $zoom
                    locale: $locale
                ) {
                    ...AdressFragment
                    __typename
                }
            }
            fragment AdressFragment on Address {
                id
                description
                geom
                street
                locality
                postalCode
                region
                country
                type
                url
                originId
                timezone
                pictureInfo {
                    url
                    author {
                    name
                    url
                    __typename
                    }
                    source {
                    name
                    url
                    __typename
                    }
                    __typename
                }
                __typename
            }
        `
        
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                operationName: 'ReverseGeocode',
                query: query,
                variables: {
                    longitude: coords.lng,
                    latitude: coords.lat,
                    locale: 'fr',
                    zoom: 18
                }
            })
        })

        return (await this.handleResponse(response))
            .data
            .reverseGeocode
            .filter(result => result.type == 'house')
    }

    async createEvent(event, accessToken) {

        const bannerFormInputName = "p...i...c...t...u...r...e...m.e.d.i.a.file"
        const formData = new FormData()
        formData.append("query", `mutation createEvent(
            $organizerActorId: ID!,
            $title: String!,
            $attributedToId: ID,
            $description: String!,
            $beginsOn: DateTime!,
            $endsOn: DateTime,
            $onlineAddress: String,
            $picture: MediaInput,
            $category: EventCategory,
            $physicalAddress: AddressInput,
            $options: EventOptionsInput,
            $metadata: [EventMetadataInput],
            $draft: Boolean
        ) {
            createEvent(
                organizerActorId: $organizerActorId
                title: $title
                attributedToId: $attributedToId
                description: $description
                beginsOn: $beginsOn
                endsOn: $endsOn
                onlineAddress: $onlineAddress
                picture: $picture
                category: $category
                physicalAddress: $physicalAddress
                options: $options,
                metadata: $metadata,
                draft: $draft
            ) {
                id
                uuid
            }
        }`)
        
        const data = {
            title: event.title,
            description: event.description, 
            beginsOn: event.startDate,
            endsOn: event.endDate,
            onlineAddress: event.url,
            picture: event.banner ? {
                media: {
                    name: event.banner.name,
                    alt: event.banner.name,
                    file: bannerFormInputName
                }
            } : null,
            category: event.category ? event.category.toUpperCase() : null,
            physicalAddress: event.physicalAddress,
            options: {
                showStartTime: true,
                showEndTime: event.endDate ? true : false,
                showRemainingAttendeeCapacity: false,
                hideOrganizerWhenGroupEvent: false
            },
            organizerActorId: event.organizerActorId,
            attributedToId: event.attributedToId,
            draft: event.draft
        }

        if (event.ticketsUrl) {
            data.metadata = [{
                key: 'mz:ticket:external_url',
                type: 'STRING',
                value: event.ticketsUrl
            }]
        }

        formData.append('variables', JSON.stringify(data))

        if (event.banner) {
            formData.append(bannerFormInputName, event.banner, event.banner.name)
        }
        
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        })

        const body = (await this.handleResponse(response))
        
        if (body.errors) {
            let messages = []
            body.errors.forEach(error => {
                const field = error.field || 'inconnu'
                const message = error.message || 'erreur inconnue'
                if (isString(message)) {
                    if (error.field) {
                        messages.push(`Champ ${field} : ${message}`)
                    } else {
                        messages.push(`${message}`)
                    }
                }
                else if (Array.isArray(message)) {
                    message.forEach(subMessage => {
                        if (isString(subMessage)) { 
                            messages.push(`Champ ${field} : ${subMessage}`)
                        }
                        else if (isObject(subMessage)) {
                            for (let key in subMessage) {
                                if (Array.isArray(subMessage[key])) {
                                    subMessage[key].forEach(subSubMessage => {
                                        messages.push(`Champ ${field} : ${subSubMessage}`)
                                    })
                                } else if (isString(subMessage[key])) {
                                    messages.push(`Champ ${field} : ${subMessage[key]}`)
                                } else {
                                    messages.push(`Champ ${field} : Erreur inconnue`)
                                }
                            }
                        } else {
                            messages.push(`Champ ${field} : Erreur inconnue`)
                        }
                    })
                } else {
                    messages.push(`Champ ${field} : Erreur inconnue`)
                }
            })
            throw new SaveError(messages)
        } else {
            return body.data.createEvent.uuid
        }
    }
}
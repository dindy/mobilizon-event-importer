export class MbzRequestError extends Error {
    
    response = null
    body = null

    constructor(response, body = null) {
        super('Mobilizon request error.')
        this.response = response
        this.body = body
    }
}

export class MbzProxyRequestError extends MbzRequestError {
    constructor(response, body = null) {
        super(response, body)
    }
}

export class MbzProxyAuthError extends MbzProxyRequestError {
    constructor(response, body = null) {
        super(response, body)
    }    
}

export class MbzProxyValidationError extends MbzProxyRequestError {
    constructor(errors, response, body) {
        super(response, body)
        this.messages = errors
    }
}

const isObject = (x) => typeof x === 'object' && !Array.isArray(x) && x !== null
const isString = (x) => typeof x === 'string' || x instanceof String

export class MobilizonApi {

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

    getProxyApiUrl(path) {
        return `${import.meta.env.VITE_MOBILIZON_PROXY_URI}/${path}`
    }

    searchAddressController = null

    constructor() {

    }

    async handleProxyResponse(response) { 
        
        let body = null
        
        if (response.status === 401) {
            body = await response.json()
            throw new MbzProxyAuthError(response, body)
        }

        try {
            body = await response.json()
        } catch (error) {
            throw new MbzProxyRequestError(response)
        }
        
        if (body.mobilizonApiErrorName && body.mobilizonApiErrorName == 'BadRequestError' && body.body.errors) {
            let messages = []
            body.body.errors.forEach(error => {
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

            throw new MbzProxyValidationError(messages)
        }

        if (response.status === 200) return body


        
        throw new MbzProxyRequestError(response, body)
    }

    async handleResponse(response) {

        if (response.status === 200) {
            
            const body = await response.json()
            return body
        }

        throw new MbzRequestError(response, body)        
    }

    async registerApp(instanceUrl) {

        let instanceDomain = instanceUrl.replace(/https?:\/\//i, '')

        const response = await fetch(this.getProxyApiUrl('auth/register?') + new URLSearchParams({
                instance: instanceDomain,
                redirect_uri: this.redirectUri
            })            
        )
        
        return (await this.handleProxyResponse(response)).url      
    }

    async authorizeApp(code, clientId) {
        const response = await fetch(this.getProxyApiUrl('auth/authorize?'), {
            method: 'POST',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code,
                client_id: clientId,
                redirect_uri: this.redirectUri
            })
        })
        
        return (await this.handleProxyResponse(response))
    }

    // async getUserGroups() { 

    //     const document = `query LoggedUserMemberships($membershipName: String, $page: Int, $limit: Int) {
    //             loggedUser {
    //                 id
    //                 memberships(name: $membershipName, page: $page, limit: $limit) {
    //                     total
    //                     elements {
    //                         role
    //                         actor {
    //                             id
    //                         }
    //                         parent {
    //                             ...ActorFragment
    //                             ...GroupFragment
    //                         }
    //                     }
    //                 }
    //                 actors {      
    //                     ...ActorFragment      
    //                 }                        
    //             }
    //         }

    //         fragment GroupFragment on Group {
    //             id
    //             physicalAddress {
    //                 ...AdressFragment 
    //             }
    //         }

    //         fragment AdressFragment on Address {
    //             id
    //             description
    //             geom
    //             street
    //             locality
    //             postalCode
    //             region
    //             country
    //             type
    //             url
    //             originId
    //             timezone
    //             pictureInfo {
    //                 url
    //                 author {
    //                     name
    //                     url
    //                 }
    //                 source {
    //                     name
    //                     url
    //                 }
    //             }
    //         }

    //         fragment ActorFragment on Actor {
    //             id
    //             type
    //             preferredUsername
    //             name
    //             avatar {
    //                 url
    //             }
    //         }
    //     `

    //     const response = await fetch(this.getProxyApiUrl('mbz/query'), {
    //         method: 'POST',
    //         credentials: "include",
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             query: document,
    //             variables: { page: 1, limit: 999 },
    //             operationName: 'LoggedUserMemberships'
    //         })
    //     })

    //     return (await this.handleProxyResponse(response)).data
    // }

    async uploadImage(file) {

        const formData = new FormData()

        formData.append("query", `mutation uploadMedia($file: Upload!, $name: String!) {
                uploadMedia(file: $file, name: $name) {
                    url
                }
            }`
        )        
        formData.append("variables", `{"name":"${file.name}","file":"image1"}`)        
        formData.append("image1", file, file.name)   

        const response = await fetch(this.getProxyApiUrl('mbz/query'), {
            method: 'POST',
            credentials: "include",
            body: formData
        })

        return (await this.handleProxyResponse(response)).data.uploadMedia
    }

    async searchAddress(queryString) {

        const query = `
            query SearchAddress($query: String!, $locale: String, $type: AddressSearchType) {
                searchAddress(query: $query, locale: $locale, type: $type) {
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
        `
        
        let response

        if (this.searchAddressController) this.searchAddressController.abort()
    
        this.searchAddressController = new AbortController()
        
        try {
            response = await fetch(this.apiUrl, {
                signal: this.searchAddressController.signal,
                method: 'POST',
                headers: {
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
        // Handles Abort Exception
        } catch (error) {
            if ( ! (error instanceof DOMException) ) {
                throw exception
            } else {
                console.log(error.message);
            }
        }   
        
        if (!response) return null

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

    async reverseGeocode(coords) {

        const query = `
            query ReverseGeocode($latitude: Float!, $longitude: Float!, $zoom: Int, $locale: String) {
                reverseGeocode(
                    latitude: $latitude
                    longitude: $longitude
                    zoom: $zoom
                    locale: $locale
                ) {
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
        `
        
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
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

    async createGroup(group) {

        const bannerFormInputName = "b...a...n...n...e...r...m.e.d.i.a.file"
        const logoFormInputName = "l...o...g...o...m.e.d.i.a.file"
        const formData = new FormData()
        formData.append("query", `mutation createGroup(
                $preferredUsername: String!, 
                $name: String!, 
                $summary: String, 
                $avatar: MediaInput, 
                $banner: MediaInput, 
                $physicalAddress: AddressInput, 
                $visibility: GroupVisibility, 
                $openness: Openness, 
                $manuallyApprovesFollowers: Boolean
            ) {
                createGroup(
                    preferredUsername: $preferredUsername
                    name: $name
                    summary: $summary
                    banner: $banner
                    avatar: $avatar
                    physicalAddress: $physicalAddress
                    visibility: $visibility
                    openness: $openness
                    manuallyApprovesFollowers: $manuallyApprovesFollowers
                ) {
                    ...ActorFragment
                    ...GroupFragment
                    banner {
                        uuid
                        url
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
                avatar {
                    uuid
                    url
                }
                type
                preferredUsername
                name
                domain
                summary
                url
            }`         
        )      
        
        const data = {
            "preferredUsername": group.federatedName,
            "name": group.name,
            "summary": group.description,
            "visibility": "PUBLIC",
            "openness": "MODERATED",
            "manuallyApprovesFollowers": false,
            "physicalAddress": group.physicalAddress,
            "avatar": group.logo ? {
                media: {
                    name: group.logo.name,
                    alt: group.logo.name,
                    file: logoFormInputName
                }
            } : null,
            "banner": group.banner ? {
                media: {
                    name: group.banner.name,
                    alt: group.banner.name,
                    file: bannerFormInputName
                }
            } : null,
        }

        formData.append('variables', JSON.stringify(data))

        if (group.banner) {
            formData.append(bannerFormInputName, group.banner, group.banner.name)
        }
        if (group.logo) {
            formData.append(logoFormInputName, group.logo, group.logo.name)
        }     
        
        const response = await fetch(this.getProxyApiUrl('mbz/query'), {
            method: 'POST',
            body: formData,
            credentials: "include"
        })

        return (await this.handleProxyResponse(response)).data.createGroup
    }

    async createEvent(event) {

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
        
        const response = await fetch(this.getProxyApiUrl('mbz/query'), {
            method: 'POST',
            credentials: "include",
            body: formData
        })

        return (await this.handleProxyResponse(response)).data.createEvent.uuid
    }

    async getConfigAndLoggedUser() {
        const query = `
            query Init($membershipName: String, $page: Int, $limit: Int) {
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
                    }
                    defaultPicture {
                        url
                        name
                        metadata {
                            width
                            height
                            blurhash
                        }
                    }
                    eventCategories {
                        id
                        label
                    }
                    anonymous {
                        participation {
                            allowed
                            validation {
                                email {
                                    enabled
                                    confirmationRequired
                                }
                                captcha {
                                    enabled
                                }
                            }
                        }
                        eventCreation {
                            allowed
                            validation {
                                email {
                                    enabled
                                    confirmationRequired
                                }
                                captcha {
                                    enabled
                                }
                            }  
                        }
                        reports {
                            allowed
                        }
                        actorId
                    }
                    location {
                        latitude
                        longitude
                    }
                    maps {
                        tiles {
                            endpoint
                            attribution
                        }
                        routing {
                            type
                        }
                    }
                    geocoding {
                        provider
                        autocomplete
                    }
                    resourceProviders {
                        type
                        endpoint
                        software
                    }
                    features {
                        groups
                        eventCreation
                        eventExternal
                        antispam
                    }
                    restrictions {
                        onlyAdminCanCreateGroups
                        onlyGroupsCanCreateEvents
                    }
                    auth {
                        ldap
                        databaseLogin
                        oauthProviders {
                            id
                            label
                        }
                    }
                    uploadLimits {
                        default
                        avatar
                        banner
                    }
                    instanceFeeds {
                        enabled
                    }
                    webPush {
                        enabled
                        publicKey
                    }
                    analytics {
                        id
                        enabled
                        configuration {
                            key
                            value
                            type
                        }
                    }
                    search {
                        global {
                            isEnabled
                            isDefault
                        }
                    }
                    exportFormats {
                        eventParticipants
                    }
                }

                loggedUser {
                    id
                    memberships(name: $membershipName, page: $page, limit: $limit) {
                        total
                        elements {
                            role
                            actor {
                                id
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
        
        const response = await fetch(this.getProxyApiUrl('mbz/query'), {
            method: 'POST',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: { page: 1, limit: 999 },
            })
        })

        return (await this.handleProxyResponse(response)).data        
    }
}
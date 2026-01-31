export class ScrapperRequestError extends Error {
    
    response = null
    body = null

    constructor(response, body = null) {
        super('Mobilizon request error.')
        this.response = response
        this.body = body
    }
}

export class ScrapperApi {

    endPoint = import.meta.env.VITE_PARSER_API_URI

    getProvider(url) {
        
        let provider = ''
        
        if (url.indexOf('facebook.com') !== -1) {
            provider = 'facebook'
        } else if (url.indexOf('instagram.com') !== -1) {
            provider = 'instagram'
        } else if (url.indexOf('helloasso.com') !== -1) {
            provider = 'helloasso'
        } else if (url.indexOf('shotgun.live') !== -1) {
            provider = 'shotgun'
        } else {
            provider = 'default'
        }

        return provider
    }

    async scrapEvent(url) {
        
        const provider = this.getProvider(url)
        const base64Url = btoa(unescape(encodeURIComponent(url)))
        const response = await fetch(`${this.endPoint}?url=${base64Url}&provider=${provider}&type=event`)
        const body = await response.json()

        if (response.status != 200) {
            throw new ScrapperRequestError(response, body)
        }

        return body.data;
    }

    async scrapGroup(url) {

        const provider = this.getProvider(url)
        const base64Url = btoa(unescape(encodeURIComponent(url)))
        const response = await fetch(`${this.endPoint}?url=${base64Url}&provider=${provider}&type=group`)
        const body = await response.json()    
        
        if (response.status != 200) {
            throw new ScrapperRequestError(response, body)
        }

        return body.data;
    }
}
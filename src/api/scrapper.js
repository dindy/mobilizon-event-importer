export class ScrapperApi {

    endPoint = 'https://parse.import.mobilizon.webworkers.agency/scrap'

    async scrap(url) {
        
        let provider = ''
        if (url.indexOf('facebook.com') !== -1) {
            provider = 'facebook'
        } else if (url.indexOf('instagram.com') !== -1) {
            provider = 'instagram'
        }

        const base64Url = btoa(unescape(encodeURIComponent(url)))
        const response = await fetch(`${this.endPoint}?url=${base64Url}&provider=${provider}`)
        const body = await response.json()

        return body.data;
    }
}
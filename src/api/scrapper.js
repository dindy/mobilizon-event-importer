export class ScrapperApi {

    endPoint = import.meta.env.VITE_PARSER_API_URI

    async scrap(url) {
        
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

        const base64Url = btoa(unescape(encodeURIComponent(url)))
        const response = await fetch(`${this.endPoint}?url=${base64Url}&provider=${provider}`)
        const body = await response.json()

        return body.data;
    }
}
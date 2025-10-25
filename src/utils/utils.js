const convertBytesToMegabytes = (bytes) => {
    const mb = (bytes / 1024 / 1024);
    // Format with up to 4 decimals, remove trailing zeros, replace dot with comma
    return mb.toFixed(4).replace(/\.?0+$/, '').replace('.', ',');
}

const isValidUrl = (testUrl) => {
    try {
        if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) return false 
        testUrl = new URL(testUrl)
        return true
    } catch (_) {
        return false
    }    
} 

export { convertBytesToMegabytes, isValidUrl }
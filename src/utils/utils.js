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

function dataURLtoFile(dataUrl) {
    var arr = dataUrl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[arr.length - 1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    const filename = 'image.' + dataUrl.substring("data:image/".length, dataUrl.indexOf(";base64"))
    
    return new File([u8arr], filename, {type:mime});
}

// Merge date and time into ISO string (local timezone)
function mergeDateTime(date, time) {
  if (!date) return ''
  const t = time || '00:00'
  // submit a Date object in local time
  const [year, month, day] = date.split('-')
  const [hour, minute] = t.split(':')
  const localDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  )
  // Store as seconds since epoch (local time)
  return Math.floor(localDate.getTime() / 1000)
}

const timestampToDate = ts => {
    if (!ts) return ''
    const date = new Date(ts * 1000).toLocaleDateString([], {timeZone: "Europe/Paris"})
    const year = date.substring(6, 10)
    const month = date.substring(3, 5)
    const day = date.substring(0, 2)
    return `${year}-${month}-${day}` 
}

const timestampToTime = ts => ts ? new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : ''

const blobToDataUrl = blob => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)    
})

const getFormattedAddress = (address) => {
    const hasPostalCode = address.postalCode && address.postalCode.trim() != '' 
    const hasLocality = address.locality && address.locality.trim() != ''
    const region = address.region && address.region.trim() !== '' ? address.region : null
    const locality = hasPostalCode && hasLocality ? 
        `${address.postalCode} ${address.locality}` :
        hasPostalCode ? address.postalCode :
        hasLocality ? address.locality :
        null
    const description = address.description && address.description.trim() != '' ? address.description : null
    const street = address.street && address.street.trim() != '' ? address.street : null
    let elements = [street,locality,region].filter(el => el)
    if (description && description !== street) {
        elements.unshift(description)
    }

    return elements.join(', ')
}

export { convertBytesToMegabytes, isValidUrl, dataURLtoFile, mergeDateTime, timestampToDate, timestampToTime, blobToDataUrl, getFormattedAddress }
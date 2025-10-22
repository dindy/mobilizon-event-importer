const convertBytesToMegabytes = (bytes) => {
    const mb = (bytes / 1024 / 1024);
    // Format with up to 4 decimals, remove trailing zeros, replace dot with comma
    return mb.toFixed(4).replace(/\.?0+$/, '').replace('.', ',');
}

export { convertBytesToMegabytes }
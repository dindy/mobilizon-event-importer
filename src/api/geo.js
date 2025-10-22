export class GeoApi { 

    async reverse(coords) {
        const response = await fetch(`https://data.geopf.fr/geocodage/reverse?lon=${coords.lng}&lat=${coords.lat}&type=housenumber`)

        if (response.status == 200) {
            const data = await response.json()

            return data.features
                .map(feature => ({
                    geom: `${feature.geometry.coordinates[0]};${feature.geometry.coordinates[1]}`,
                    description: feature.properties.name,
                    postalCode: feature.properties.postcode,
                    locality: feature.properties.city,
                    type: feature.properties.type,
                    street: (`${feature.properties.housenumber} ${feature.properties.street}`).trim(),
                    country: 'France'
                }))
        }
    }

    async search(addressString) {

        const response = await fetch(`https://data.geopf.fr/geocodage/search?q=${addressString}&type=housenumber`)

        if (response.status == 200) {
            const data = await response.json()

            return data.features
                .map(feature => ({
                    geom: `${feature.geometry.coordinates[0]};${feature.geometry.coordinates[1]}`,
                    description: feature.properties.name,
                    postalCode: feature.properties.postcode,
                    locality: feature.properties.city,
                    type: feature.properties.type,
                    street: (`${feature.properties.housenumber} ${feature.properties.street}`).trim(),
                    country: 'France'
                }))
                .filter(feature => feature.type === 'house' || feature.type === 'housenumber')
        }        
    }
}
const http = require('http');
const axios = require('axios');
const areaDecoder = axios.create({
    baseURL: 'https://nominatim.openstreetmap.org',
});
function overpassRequest(query) {
    return new Promise((resolve, reject) => {
        const request = http.request({
            method: 'POST',
            host: 'www.overpass-api.de',
            path: '/api/interpreter',
        }, response => {
            if (response.statusCode == 200) {
                response.setEncoding('utf8');

                let data = '';

                response.on('data', (chunk) => {
                    data += chunk;
                });

                response.on('end', () => {
                    const parsedData = JSON.parse(data);
                    resolve(parsedData);
                });
            } else {
                reject(`Error ${response.statusCode}`)
            }
        });

        request.on('error', reject);
        request.write(query);
        request.end();
    });
}
function findCityArea(params) {
    return areaDecoder.get('/search', {
        params: params
    }).then((value) => {
        return value.data.features.map(element => {
            return element.properties.geocoding.osm_id
        })
    })
}

function indexElementsById(response) {
    const map = {};
    response.elements.forEach(element => {
        map[element.id] = element;
    });

    return map;
}

function getPossibleOsmTags(city, country) {
    return findCityArea({ "state": city, "country": country, "format": "geocodejson" })
        .then(value => {
            const query = "[out:json];" + value.map(element => {
                return `relation(${element});out tags;`
            }).join("")
            return overpassRequest(query)
        }).then(value => {
            return value.elements.map(value => {
                return value
            }).filter(value => {
                delete value.type
                return value.tags.admin_level == '4'
            })
        })
}
function getTotalRoutes(name) {
    const query = `[out:json];area["admin_level"="4"]["name"="${name}"]->.boundaryarea;(relation["type"="route"]["route"~"trolleybus|minibus|share_taxi|train|light_rail|subway|tram|ferry"](area.boundaryarea););out count;`;
    return overpassRequest(query)
        .then(value => {
            return parseInt(value.elements[0].tags.total)
        })
}

module.exports = {
    getPossibleOsmTags,
    getTotalRoutes
};

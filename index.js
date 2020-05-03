const downloader = require("./downloader")
const input_cities = require('./data/input_cities.json')
const fs = require('fs')
async function main() {
    const allPossibleCities = []
    for (var city of input_cities) {
        city.osm = await downloader.getPossibleOsmTags(city.City, city.Country)
        console.log(city.City + " -> " + city.osm.length + " possible match")
        for (var osm of city.osm) {
            osm.totalRoutes = await downloader.getTotalRoutes(osm.tags.name)
            console.log("\t", `${osm.tags.name}`, " -> ", osm.totalRoutes, " routes ")
            allPossibleCities.push(osm)
        }
    }
    allPossibleCities.sort((a, b) => {
        return b.totalRoutes - a.totalRoutes;
    })
    fs.writeFileSync("./data/all_possible_cities.json", JSON.stringify(allPossibleCities))
    fs.writeFileSync("./data/output_cities.json", JSON.stringify(input_cities))
}
// downloader.getTotalRoute("cochabamba", "bolivia").then((value) => {
//     // console.log(value.elements[0].tags.total)
//     // console.log(value.data.features)
//     console.log(value)
// }).catch(console.log)
main().catch(console.log)
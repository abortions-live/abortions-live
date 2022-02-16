async function mapGeojson() {
    var response = await fetch("assets/json/rates.geojson") 
    var nationsObject = await response.json()
    return nationsObject
}
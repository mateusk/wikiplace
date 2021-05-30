const fetch = require('node-fetch')

async function findWikiPlaces(latitude, longitude, options) {
  const defaults = {
    radius: 1000,
    limit: 10,
    withImage: false,
    getUrl: false,
    description: false,
    maxImageWidth: 500,
  }

  options = Object.assign({}, defaults, options)

  // console.log(options)

  let query = `https://en.wikipedia.org/w/api.php?action=query&generator=geosearch&format=json&ggscoord=${latitude}%7C${longitude}&ggsradius=${options.radius}&ggslimit=${options.limit}&prop=coordinates`
  if (options.withImage) {
    query = query.replace('&prop=coordinates', '&prop=coordinates|pageimages')
    query += `&pithumbsize=${options.maxImageWidth}`
  }
  if (options.description) query.replace('&prop=coordinates', '&prop=coordinates|description')
  if (options.getUrl) {
    query = query.replace('&prop=coordinates', '&prop=coordinates|info')
    query += '&inprop=url'
  }

  // console.log(query)

  try {
    const response = await fetch(query)

    // console.log(response)

    const json = await response.json()

    // console.log(json)

    if (json.query === undefined) return []

    let resultArray = []

    for (const [key, value] of Object.entries(json.query.pages)) {
      const {
        title,
        coordinates: [{ lat, lon }],
        description,
        thumbnail: { source } = { source: undefined },
        fullurl: articleUrl,
      } = value || {}

      resultArray.push({
        title: title,
        description: description,
        coordinates: { latitude: lat, longitude: lon },
        articleUrl,
        imageURL: source,
      })
    }

    // console.log('resultArray: ' + resultArray)

    return resultArray
  } catch (error) {
    throw error
  }
}

module.exports = findWikiPlaces

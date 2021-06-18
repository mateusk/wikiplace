// replace with axios
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

  try {
    const response = await fetch(query)

    const json = await response.json()

    if (json.query === undefined) return []
    // end try-catch here
    let resultArray = []

    for (const [key, value] of Object.entries(json.query.pages)) {
      const {
        title,
        coordinates: [{ lat, lon }],
        description,
        thumbnail: { source: imageUrl } = { source: undefined },
        fullurl: articleUrl,
      } = value || {}
      // use an array map instead
      resultArray.push({
        title,
        description,
        coordinates: { latitude: lat, longitude: lon },
        articleUrl,
        imageUrl,
      })
    }

    return resultArray
  } catch (error) {
    throw error
  }
}

module.exports = findWikiPlaces

const findWikiPlaces = require('../')
const fetch = require('node-fetch')
jest.mock('node-fetch', () => jest.fn())

it('Should return an object containing Mediawiki API results based on given geolocation and query options', async () => {
  const expectedResult = [
    {
      title: '140 New Montgomery',
      description: undefined,
      coordinates: { latitude: 37.78681944, longitude: -122.39990556 },
      articleUrl: 'https://en.wikipedia.org/wiki/140_New_Montgomery',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Location_map_San_Francisco_Central.png',
    },
  ]

  const jsonResult = {
    batchcomplete: '',
    query: {
      pages: {
        9292891: {
          pageid: 9292891,
          ns: 0,
          title: '140 New Montgomery',
          index: -1,
          coordinates: [{ lat: 37.78681944, lon: -122.39990556, primary: '', globe: 'earth' }],
          contentmodel: 'wikitext',
          pagelanguage: 'en',
          pagelanguagehtmlcode: 'en',
          pagelanguagedir: 'ltr',
          touched: '2021-05-30T01:46:18Z',
          lastrevid: 1016069963,
          length: 17904,
          fullurl: 'https://en.wikipedia.org/wiki/140_New_Montgomery',
          editurl: 'https://en.wikipedia.org/w/index.php?title=140_New_Montgomery&action=edit',
          canonicalurl: 'https://en.wikipedia.org/wiki/140_New_Montgomery',
          thumbnail: {
            source: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Location_map_San_Francisco_Central.png',
            width: 780,
            height: 742,
          },
          pageimage: 'Location_map_San_Francisco_Central.png',
        },
      },
    },
  }

  const response = Promise.resolve({
    ok: true,
    status: 200,
    json: () => {
      return jsonResult
    },
  })

  fetch.mockImplementation(() => response)

  const data = await findWikiPlaces(37.786952, -122.399523, {
    limit: 1,
    withImage: true,
    description: true,
    getUrl: true,
    maxImageWidth: 1920,
  })

  expect(data).toMatchObject(expectedResult)
})

it('Should return an empty array if no search results were found', async () => {
  const expectedResult = []

  const jsonResult = {
    batchcomplete: '',
  }

  const response = Promise.resolve({
    ok: true,
    status: 200,
    json: () => {
      return jsonResult
    },
  })

  fetch.mockImplementation(() => response)

  return findWikiPlaces(1, 1).then(data => {
    expect(data).toMatchObject(expectedResult)
  })
})

it('Should throw an error if API call failed', async () => {
  const response = Promise.resolve({
    ok: false,
    status: 400,
    body: {},
  })

  fetch.mockReject(response)

  try {
    await findWikiPlaces(1, 1)
  } catch (e) {
    expect(e).toEqual(response)
    expect(await findWikiPlaces(1, 1)).rejects.toThrow(e)
  }
})

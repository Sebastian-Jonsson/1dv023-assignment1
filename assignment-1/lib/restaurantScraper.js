
const nodeFetch = require('node-fetch')
const fetch = require('fetch-cookie/node-fetch')(nodeFetch)

/**
 * Finds the movies that are available.
 * Googled the fetch-cookie package.
 *
 * @class MovieScraper
 */
class RestaurantScraper {
  constructor () {
    this.reason = 'Class used for general personal structuring preference.'
  }

  /**
   * Gets the information to process finding available booking times.
   *
   * @param {string} url - URL to fetch text.
   * @returns {string} Data2 - Text to go through planningHub.
   * @memberof RestaurantScraper
   */
  async checkRestaurant (url) {
    const data2 = await fetch(url + '/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'username=zeke&password=coys&submit=login'
    }).then(data => {
      return data
    })
    return data2.text()
  }
}

module.exports = RestaurantScraper

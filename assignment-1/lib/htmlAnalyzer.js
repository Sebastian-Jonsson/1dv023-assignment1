const cherio = require('cheerio')
const request = require('request')

/**
 * Analyzes links on designated site link and creates a JSON object file where the links are stored.
 *
 * @class htmlAnalyzer
 */
class htmlAnalyzer {
  constructor () {
    this.nothing = null
  }

  /**
   * Description, chooses which part of the html to gather, in this case for each a tag and every href attribute.
   * Method taken from exercises task web-scraper.
   * Got a tip from slack to inspect link types.
   *
   * @param {string} html - An adress.
   * @returns {Array} Array.
   */
  getLinks (html) {
    const arr = []
    const $ = cherio.load(html)
    $('a').each(function (i, links) {
      if ($(links).attr('href').includes('http') || $(links).attr('href').includes('html')) {
        arr.push($(links).attr('href'))
      }
    })

    const object = [...arr]

    return object
  }

  /**
   * Fetches the information.
   *
   * @param {string} url - The url.
   * @returns {Error} - A status error.
   */
  fetch (url) {
    return new Promise(function (resolve, reject) {
      request(url, function (error, response, html) {
        if (error) {
          return reject(error)
        }

        if (response.statusCode !== 200) {
          return reject(new Error('Bad status code'))
        }
        resolve(html)
      })
    })
  }
}

module.exports = htmlAnalyzer

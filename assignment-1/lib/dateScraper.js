const cherio = require('cheerio')

/**
 * Will provide a date from provided URL's.
 *
 * @class DateScraper
 */
class DateScraper {
  constructor () {
    this.nothing = null
  }

  /**
   * Checks the persons url's and schedule.
   * Got a tip from slack to compare i to i2.
   *
   * @param {string} url - The url provided to check.
   * @returns {Array} Arr - the array with the information to send for sorting.
   * @memberof DateScraper
   */
  daysChecker (url) {
    const arr = []
    const $ = cherio.load(url)
    $('td').each(function (i, text) {
      $('th').each(function (i2, text2) {
        if (i === i2) {
          arr.push({ days: $(text2).text(), check: $(text).text() })
        }
      })
    })

    return arr
  }
}

module.exports = DateScraper

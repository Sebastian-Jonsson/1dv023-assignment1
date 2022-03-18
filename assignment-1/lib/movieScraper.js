const fetch = require('node-fetch')
const cherio = require('cheerio')

/**
 * Finds the movies that are available.
 * Got a tip to download the node-fetch package on stackoverflow.
 *
 * @class MovieScraper
 */
class MovieScraper {
  constructor () {
    this.reason = 'Class used for general personal structuring preference.'
  }

  /**
   * Gathers the possible movies based on which day all persons can go together.
   *
   * @param {string} url - The adress to check and work with from starting point.
   * @param {string} day - The chosen day.
   * @returns {Array} Data3 - Nestled array with objects holding data needed.
   * @memberof MovieScraper
   */
  async movieChecker (url, day) {
    const data3 = []
    let dataMovie2 = []
    // const data4 = []
    this.dayChoice(day)
    for (let i = 0; i < 3; i++) {
      try {
        const data = await fetch(`${url}/check?day=0${this.dayNum}&movie=0${i + 1}`)
        const dataMovie = await fetch(url)
        const data2 = await data.json()
        dataMovie2 = await dataMovie.text()
        data3.push(data2)
      } catch {
        console.log('Error fetching movie.')
      }
    }
    return this.combineData(dataMovie2, data3)
  }

  /**
   * Combining data.
   *
   * @param {string} dataMovie2 - Information sent to process.
   * @param {Array} data3 - Information sent to be processed.
   * @returns {Array} Data3 - Having been processed with proper information.
   * @memberof MovieScraper
   */
  combineData (dataMovie2, data3) {
    const arr = []
    const $ = cherio.load(dataMovie2)
    $('#movie option').each(function (i, alt) {
      if ($(alt).attr('value') && $(alt).attr('value') !== '--- Pick a Movie ---') {
        arr.push($(alt).text())
      }
    })
    for (let k = 0; k < arr.length; k++) {
      data3[k][0].movie = arr[k]
      data3[k][1].movie = arr[k]
      data3[k][2].movie = arr[k]
    }
    // console.log(data3)
    return data3
  }

  /**
   * Chooses which of three days is the designated day.
   *
   * @param {string} day - The decided day.
   * @memberof MovieScraper
   */
  dayChoice (day) {
    switch (day) {
      case 'Friday':
        this.dayNum = 5
        break
      case 'Saturday':
        this.dayNum = 6
        break
      case 'Sunday':
        this.dayNum = 7
        break
    }
  }
}

module.exports = MovieScraper

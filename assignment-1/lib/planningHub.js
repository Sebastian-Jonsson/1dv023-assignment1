const cherio = require('cheerio')
const HtmlAnalyzer = require('./htmlAnalyzer.js')
const DateScraper = require('./dateScraper.js')
const MovieScraper = require('./movieScraper.js')
const RestaurantScraper = require('./restaurantScraper.js')
const htmlAnalyzer = new HtmlAnalyzer()
const dateScraper = new DateScraper()
const movieScraper = new MovieScraper()
const restaurantScraper = new RestaurantScraper()

/**
 * A planner that puts together persons, movies and restaurant times to match up.
 * Information on how to use methods and arrays primarily taken from MDn and W3Schools in a few cases, aswell as Stackoverflow.
 *
 * @class PlanningHub
 */
class PlanningHub {
  constructor () {
    this.url = process.argv[2] || 'http://vhost3.lnu.se:20080/weekend' // http://cscloud304.lnu.se:8080
    this.decidedDay = []
    this.decidedMovie = []
    this.decidedRestaurant = []
    this.movieName = []
  }

  /**
   * Makes the url's available for use to process their data.
   *
   * @memberof PlanningHub
   */
  async makeSiteList () {
    try {
      const page = await htmlAnalyzer.fetch(this.url)
      const links = await htmlAnalyzer.getLinks(page)
      const persons = await htmlAnalyzer.fetch(links[0])
      const personLinks = await htmlAnalyzer.getLinks(persons)

      // Person data part.
      const personDays = []
      for (let i = 0; i < personLinks.length; i++) {
        const person = await htmlAnalyzer.fetch(`${links[0]}${personLinks[i]}`)
        personDays.push(await dateScraper.daysChecker(person))
      }
      this.matchDays(personDays)

      // Restaurant data part.
      const restaurantDay = await restaurantScraper.checkRestaurant(links[2])
      this.checkRestaurant(restaurantDay)

      // Movies data part.
      let movieDay = []
      let movieDay2 = []

      movieDay = await movieScraper.movieChecker(links[1], this.decidedDay[0])
      movieDay2 = await movieScraper.movieChecker(links[1], this.decidedDay[1])

      // Sends all movies combined if required, two days at most, more variables can be made to accomodate for more days.
      const movieDay3 = movieDay.concat(movieDay2)
      this.checkMovie(movieDay3)
      this.setTimeName()
    } catch {
      console.log('Error encountered while fetching URL.')
    }
  }

  /**
   * Compare times of cinema and dinner to match with a 2 hours gap aswell as naming the movie depending on it's ID.
   *
   * @memberof PlanningHub
   */
  setTimeName () {
    const movieTime = []
    const dinnerTime = []
    const movieNames = []

    for (let i = 0; i < this.decidedMovie.length; i++) {
      if ((this.decidedMovie[i].time.includes('16:00') && this.decidedRestaurant.includes('18-20 Free Sunday')) ||
      (this.decidedMovie[i].time.includes('16:00') && this.decidedRestaurant.includes('18-20 Free Saturday')) ||
      (this.decidedMovie[i].time.includes('16:00') && this.decidedRestaurant.includes('18-20 Free Friday'))) {
        // console.log(this.decidedMovie[i].time)
        movieTime.push(this.decidedMovie[i].time)
        dinnerTime.push('18:00-20:00')
      }
      if ((this.decidedMovie[i].time.includes('18:00') && this.decidedRestaurant.includes('20-22 Free Sunday')) ||
      (this.decidedMovie[i].time.includes('18:00') && this.decidedRestaurant.includes('20-22 Free Saturday')) ||
      (this.decidedMovie[i].time.includes('18:00') && this.decidedRestaurant.includes('20-22 Free Friday'))) {
        movieTime.push(this.decidedMovie[i].time)
        dinnerTime.push('20:00-22:00')
      }

      movieNames.push(this.decidedMovie[i].movie)
    }
    this.printSuggestion(dinnerTime, movieNames)
  }

  /**
   * This prints out the suggestion granted from the modified info from the scrapers.
   *
   * @param {Array} dinnerTime - An array with the times when dinner is free, in sorted order.
   * @param {Array} movieNames - An array with the names of the movies, in sorted order.
   * @memberof PlanningHub
   */
  printSuggestion (dinnerTime, movieNames) {
    const halfLength = Math.ceil(this.decidedMovie.length / 2)
    let foodTimeHalf = []
    let halfMovie = []

    const earlyMovie = []
    const earlyMovieName = []
    const earlyFoodTime = []

    const laterMovie = []
    const laterMovieName = []
    const laterFoodTime = []

    // Collection of data on 1 day length is doubled, halfing required.
    if (this.decidedDay.length === 1) {
      halfMovie = this.decidedMovie.slice(0, halfLength)
      foodTimeHalf = dinnerTime.slice(0, halfLength)
      for (let i = 0; i < halfMovie.length; i++) {
        if (halfMovie[i].time === '16:00') {
          earlyMovieName.push(movieNames[i])
          earlyMovie.push(halfMovie[i])

          if (dinnerTime[i].includes('18:00')) {
            earlyFoodTime.push(foodTimeHalf[i])
          }
        }
        if (halfMovie[i].time === '18:00') {
          laterMovieName.push(movieNames[i])
          laterMovie.push(halfMovie[i])

          if (dinnerTime[i].includes('20:00')) {
            laterFoodTime.push(foodTimeHalf[i])
          }
        }
      }
    }

    // Collection of data on 2 days length.
    if (this.decidedDay.length === 2) {
      for (let i = 0; i < this.decidedMovie.length; i++) {
        if (this.decidedMovie[i].time === '16:00') {
          earlyMovieName.push(movieNames[i])
          earlyMovie.push(this.decidedMovie[i])

          if (dinnerTime[i].includes('18:00')) {
            earlyFoodTime.push(dinnerTime[i])
          }
        }
        if (this.decidedMovie[i].time === '18:00') {
          laterMovieName.push(movieNames[i])
          laterMovie.push(this.decidedMovie[i])

          if (dinnerTime[i].includes('20:00')) {
            laterFoodTime.push(dinnerTime[i])
          }
        }
      }
    }

    // Checks the times for 1 day.
    if (this.decidedDay.length === 1 && earlyMovie[0].time === '16:00') {
      console.log('Recommendations')
      console.log('===============')
      console.log(`* On ${this.decidedDay} the movie "${earlyMovieName[0]}" starts at ${earlyMovie[0].time} and there is a free table between ${earlyFoodTime[0]}.`)
      console.log(`* On ${this.decidedDay} the movie "${earlyMovieName[1]}" starts at ${earlyMovie[1].time} and there is a free table between ${earlyFoodTime[1]}.`)
    }

    // Checks the times for 2 days.
    if (this.decidedDay.length === 2 && laterMovie[0].time === '18:00') {
      console.log('Recommendations')
      console.log('===============')
      console.log(`* On ${this.decidedDay[0]} the movie "${laterMovieName[0]}" starts at ${laterMovie[0].time} and there is a free table between ${laterFoodTime[0]}.`)
      console.log(`* On ${this.decidedDay[1]} the movie "${laterMovieName[1]}" starts at ${laterMovie[1].time} and there is a free table between ${laterFoodTime[1]}.`)
    }
  }

  /**
   * Information found on MDN about array.prototype.includes.
   *
   * @param {string} dataText - Text to analyze for times.
   * @returns {Array} FreeDay - The times of the selected day for dinner.
   * @memberof PlanningHub
   */
  checkRestaurant (dataText) {
    const textArray = []
    const setDay = []
    const freeDay = []
    const $ = cherio.load(dataText)

    $('span').each(function (i, text) {
      textArray.push($(text).text())
    })

    // Checks which days contain Free or Fully Booked.
    textArray.forEach((text) => {
      if (text.includes('Free') || text.includes('Fully booked')) {
        setDay.push(text)
      }
    })

    // Places day association with the right day.
    for (let j = 0; j < setDay.length; j++) {
      if (j <= 3) {
        setDay[j] = setDay[j] + ' Friday'
      }
      if (j > 3 && j <= 7) {
        setDay[j] = setDay[j] + ' Saturday'
      }
      if (j > 7 && j <= 11) {
        setDay[j] = setDay[j] + ' Sunday'
      }
      if (setDay[j].includes(this.decidedDay[j]) && setDay[j].includes('Free')) {
        freeDay.push(setDay[j])
      }
    }
    this.decidedRestaurant = setDay
    return freeDay
  }

  /**
   * Checks which movies can be booked.
   *
   * @param {Array} movies - An array of objects with movies.
   * @returns {Array} OkMovies - An array of objects with movies that can be booked.
   * @memberof PlanningHub
   */
  checkMovie (movies) {
    const okMovies = []

    for (let i = 0; i < movies.length; i++) {
      for (let j = 0; j < movies[i].length; j++) {
        if (movies[i][j].status === 1) {
          okMovies.push(movies[i][j])
        }
      }
    }
    this.decidedMovie = okMovies
    return okMovies
  }

  /**
   * Determines which day is going to be the chosen day.
   *
   * @param {object} match - The options to choice between.
   * @returns {string} - DecidedDay - the chosen day all can.
   * @memberof PlanningHub
   */
  matchDays (match) {
    const arr = []
    let friday = 0
    let saturday = 0
    let sunday = 0

    // Checks which days have an ok.
    for (let i = 0; i < match.length; i++) {
      for (let j = 0; j < match[i].length; j++) {
        if (match[i][j].check && !match[i][j].check.includes('-')) {
          arr.push(match[i][j])
        }
      }
    }

    // Checks which day persons can attend.
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].days === 'Friday') {
        friday++
        if (friday === match.length) {
          this.decidedDay.push(arr[i].days)
        }
      }
      if (arr[i].days === 'Saturday') {
        saturday++
        if (saturday === match.length) {
          this.decidedDay.push(arr[i].days)
        }
      }
      if (arr[i].days === 'Sunday') {
        sunday++
        if (sunday === match.length) {
          this.decidedDay.push(arr[i].days)
        }
      }
    }

    return this.decidedDay
  }
}

module.exports = PlanningHub

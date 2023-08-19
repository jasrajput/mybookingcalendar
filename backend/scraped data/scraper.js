import cheerio from 'cheerio'
import request from 'request'
import fs from 'fs'
// const cheerio = require('cheerio')
// const request = require('request')
// const fs = require('fs')


const timeZoneDataExtractor = () => {
    let timeZoneData = []
    request('https://en.wikipedia.org/wiki/List_of_tz_database_time_zones', (error, response, html) => {
        if(!error && response.statusCode === 200) {
            const $ = cheerio.load(html)
    
            const table = $('table')
    
            // selecting first table and then tbody and then table rows and looping through each row
            table.first().children().children().each((idx, tr) => {
                // first two rows are headers
                if(idx >= 2) {
                    // temporary variable to store each row of data
                    let rowData = {}
                    $(tr).children().each((idx1, td) => {
                        if(idx1 === 0) {
                            rowData.CountryCode = $(td).text().trim()
                        }else if(idx1 === 1) {
                            rowData.TZDatabaseName = $(td).text().trim()
                            // console.log($(td).text().trim())
                        } else if(idx1 === 4) {
                            rowData.STDOffset = $(td).text().trim()
                            // console.log($(td).text().trim())
                        } else if(idx1 === 5) {
                            rowData.DSTOffset = $(td).text().trim()
                            // console.log($(td).text().trim())
                        } else if(idx1 === 6) {
                            rowData.STDAbbreviation = $(td).text().trim()
                            // console.log($(td).text().trim())
                        } else if(idx1 === 7) {
                            if($(tr).children().length === 10) {
                                rowData.DSTAbbreviation = $(td).text().trim()
                                // console.log($(td).text().trim())
                            } else {
                                rowData.DSTAbbreviation = ''
                            }
                        }
                    })
                    timeZoneData.push(rowData)
                }
            })
            fs.writeFileSync('timeZoneData.json', JSON.stringify(timeZoneData))
            console.log(timeZoneData);
        }
    })
}

const countryCodeDataExtractor = () => {
    let countryCodeData = []
    request('https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2', (error, response, html) => {
        if(!error && response.statusCode === 200) {
            const $ = cheerio.load(html)

            // select second table and then tbody and then loop through each table row
            $('table').slice(2,3).children().children().each((idx, tr) => {
                if(idx >= 1) {
                    let rowData = {}
                    $(tr).children().each((idx1, td) => {
                        if(idx1 === 0) {
                            rowData.code = $(td).text().trim()
                        } else if(idx1 === 1) {
                            rowData.countryName = $(td).text().trim()
                        }
                    })
                    countryCodeData.push(rowData)
                }
            })
            fs.writeFileSync('countryCodeData.json', JSON.stringify(countryCodeData))
            console.log(JSON.stringify(countryCodeData))
        }
    })
}

timeZoneDataExtractor()
countryCodeDataExtractor()
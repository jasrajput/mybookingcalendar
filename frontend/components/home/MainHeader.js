import { useEffect, useState } from 'react'
import { DateTime } from 'luxon'
import { useSelector, useDispatch } from 'react-redux'
import Image from 'next/image'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css';
import styles from '../../styles/MainHeader.module.css'
import CalendarIcon from '../../public/img/calendar.svg'
import MainNav from './MainNav'
import { setCurrentDate, setTwentyFourHour } from '../../features/timeZone/timeZoneSlice'
import SearchResults from './SearchResults'

const MainHeader = () => {
    // const [date, setDate] = useState(new Date())
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResult, setSearchResult] = useState([])
    
    const { homeTimeZone, twentyFourHourFormat, timeZones, countryCodes } = useSelector(store => store.timeZone)
    
    // this date is used because react-calendar only understands native date of JS
    const [date, setDate] = useState(new Date(new Date().toLocaleString("en-US", {timeZone: `${homeTimeZone}`})))
    // luxon date is used to manipute the logic and UI
    const [luxonDate, setLuxonDate] = useState(DateTime.now(date).setZone(homeTimeZone))
    
    const dispatch = useDispatch()

    // whenever home timezone is changed, then set the date according to that timezone
    useEffect(() => {
        setDate(new Date(new Date().toLocaleString("en-US", {timeZone: `${homeTimeZone}`})))
    }, [homeTimeZone])

    
    // change luxon date when user selects any date from calendar
    useEffect(() => {
        setLuxonDate(DateTime.fromISO(date.toISOString()).setZone(homeTimeZone))
        dispatch(setCurrentDate(DateTime.fromISO(date.toISOString()).setZone(homeTimeZone)))
    }, [date])

    // calender onClick listeners
    useEffect(() => {
        const reactCalendarWrapperEl = document.querySelector('.react-calendar-wrapper')
        // const reactCalendarEl = document.querySelector('.react-calendar')
        const calendarIconEl = document.getElementById('calendarIcon')
        
        const openCalendar = e => {
            reactCalendarWrapperEl.classList.add('calendarActive')
        }

        const closeCalendar = (e) => {
            if(e.target === reactCalendarWrapperEl) {
                reactCalendarWrapperEl.classList.remove('calendarActive')
            }
        }

        // on clicking calendar icon, calendar will open
        calendarIconEl.addEventListener('click', openCalendar)

        // if user clicks anywhere except inside calendar, the calendar will close
        reactCalendarWrapperEl.addEventListener('click', closeCalendar)

        return () => {
            calendarIconEl.removeEventListener('click', openCalendar)
            reactCalendarWrapperEl.removeEventListener('click', closeCalendar)
        }
    }, [])

    // search functionality
    useEffect(() => {
        const searchResults = async () => {
            if(searchTerm === '' || searchTerm.length < 2) {
                setSearchResult([])
            } else {
                if(searchTerm.length >= 2) {
                    const countries = countryCodes.filter(({ countryName }) => countryName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 )

                    let results = []
                    countries.forEach(({ code }) => {
                        const tmpResult = timeZones.filter(({ CountryCode }) => CountryCode.includes(code))
                        results.push(...tmpResult)
                    })

                    setSearchResult(results)
                }
            }
        }
        searchResults()
    }, [searchTerm])

    // array of dates to be shown as a navbar in middle section
    const dates = [
        {
            prev: true,
            next: false,
            date: luxonDate.minus({days: 1}).day
        },
        {
            prev: null,
            next: null,
            date: luxonDate.day
        },
        {
            prev: false,
            next: true,
            date: luxonDate.plus({days: 1}).day
        }
    ]

    // Switch time format between 12h and 24h
    const handleTimeSwitch = () => {
        // adding click event listener on the time conversion toogle button
        var timeSwitch = document.getElementById('timeSwitch')

        timeSwitch.classList.toggle('active')

        dispatch(setTwentyFourHour(!twentyFourHourFormat))
    }

    // close the calendar when a user clicks on the date in the calendar
    const closeCalendarHandler = () => {
        document.querySelector('.react-calendar-wrapper').classList.remove('calendarActive')
    }

  return (
      <>
        {/* search bar and date navbar */}
        <header className={`d-flex pb-05 align-center ${styles.homeMainHeader}`}>
            <div className={`mr-2 ${styles.homeMainHeaderSearchWrapper}`}>
                {/* input for seraching the country name */}
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`p-05 rounded ${styles.homeMainHeaderSearch}`} placeholder="Country" />
            </div>

            <div className={`mr-1 d-flex align-center ${styles.homeMainHeaderCalendar}`}>
                {/* calendar svg icon */}
                <Image id="calendarIcon" src={CalendarIcon} />
                <div className={`react-calendar-wrapper`}>
                    <Calendar onClickDay={closeCalendarHandler} onChange={setDate} value={date} />
                </div>
            </div>

            <ul className={`d-flex`}>
            {
                // nav like component of dates
                dates.map(dt => (
                <MainNav key={dt.date} nextBtn={dt.next ? true : dt.prev ? false : null} date={dt.date} setDate={setDate} nativeDate={date} dateActive={luxonDate} />
                ))
            }
            </ul>

            <div className={`d-flex align-center ml-auto`}>
                <div id="timeSwitch" className={`d-flex align-center justify-between mr-05 homeMainHeaderTimeSwitch`} onClick={handleTimeSwitch}>
                    <span className={`homeMainHeaderTimeSwitchBall`}></span>
                </div>
                <span className={`${styles.homeMainHeaderTimeFormat}`}>
                    {!twentyFourHourFormat ? '12h' : '24h'}
                </span>
            </div>

            <SearchResults results={searchResult} setResults={setSearchResult} setSearchTerm={setSearchTerm} />
        </header>
      </>
  )
}

export default MainHeader
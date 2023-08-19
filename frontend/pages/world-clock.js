import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import useInterval from '../hooks/useInterval'
import styles from '../styles/Home.module.css'
import Layout from '../components/Layout'
import MainHeader from '../components/home/MainHeader'
import MainUserSchedule from '../components/home/MainUserSchedule'
import MetaInfo from '../components/home/MetaInfo'
import MainCountryTimeZone from '../components/home/MainCountryTimeZone'
import { getData, reset, setTimeZonesToShow, setHomeTimeZone, restoreUserTimeZoneState, restoreHomeTimeZoneState } from '../features/timeZone/timeZoneSlice'
import { getCalendars } from '../features/calendar/calendarSlice'
import ToastMessage, { showToastMessage } from '../components/ToastMessage'
import Spinner from '../components/Spinner'
import { editTimeZones, updateUserTimeZonesToShow } from '../features/auth/authSlice'

export default function Home() {
  const [currentHourState, setCurrentHourState] = useState(0)
  // REVISION 2 *************************************************
  const [initialRender, setInitialRender] = useState(true)
  // REVISION 2 END *************************************************

  const { timeZones, homeTimeZone, isLoading, isError, message, timeZonesToShow } = useSelector(store => store.timeZone)
  const { user } = useSelector(store => store.auth)
  const { calendars } = useSelector(store => store.calendar)
  const dispatch = useDispatch()

  // REVISION 1 ****************************************************
  // whenever time zones to show is changed, then make the request to backend to store the updated state
  useEffect(() => {
    if((timeZonesToShow.length !== 0) && user) {
      dispatch(editTimeZones())
      // REVISION 2 **********************************************
      // update the local user state
      dispatch(updateUserTimeZonesToShow(JSON.stringify(timeZonesToShow)))
      // REVISION 2 END **********************************************
    }
  }, [timeZonesToShow])
  // REVISION 1 END****************************************************

  // show error message toast if there is some error on data fetching
  useEffect(() => {
    if(isError) {
      // REVISION 2 ******************************************
      // suppressing inital unwanted already added message
      if((message === 'Already added') && initialRender) {
        setInitialRender(false)
        dispatch(reset())
        return
      }
      // REVISION 2 END ******************************************
      showToastMessage(message, 'error')
      setTimeout(() => {
        dispatch(reset())
      }, 1000)
    }
  }, [isError])

  useEffect(() => {
    if(timeZones.length === 0) {
      dispatch(getData())
    }
  }, [])

  // window functionality in the hourline section
  useEffect(() => {
    const homeMain = document.getElementById('homeMain')
    const windowEl = document.getElementById('window')

    // right side margin space of the country info div
    const marginRight = 2
    // size of each block in hourline in 'rem'
    const blockSize = 2

    const homeMainDimension = homeMain.getBoundingClientRect()
    const windowStart = (0.25 * homeMainDimension.width) + (marginRight*16)
    windowEl.style.left = windowStart + (blockSize*16 * currentHourState) + 'px'

    // create an array of objects containing minimum and maximum pixel value of each window location in horizontal direction
    const windowBlocks = Array.from(Array(24)).map((el, idx) => {
      return {
        "min": windowStart + (idx * (16 * blockSize)),
        "max": windowStart + ((idx+1) * (16 * blockSize))
      }
    })

    // event listener to move window
    homeMain.addEventListener('mousemove', (e) => {
      // if the mouse is in the country/timezone info section, then slide the window to its default position
      if((e.clientX - homeMainDimension.left) < windowStart) {
        windowEl.style.left = windowStart + (blockSize*16 * currentHourState) + 'px'
        return
      }

      // move window in blocks
      windowBlocks.forEach((block, idx) => {
        if((e.clientX - homeMainDimension.left) >= block.min && (e.clientX - homeMainDimension.left) < block.max) {
          windowEl.style.left = windowStart + ((blockSize*16) * idx) + 'px'
        }
      })
    })

    // move the window to its correct position after cursor is out
    homeMain.addEventListener('mouseleave', (e) => {
      windowEl.style.left = windowStart + (blockSize*16 * currentHourState) + 'px'
    })
    

    
    // // re-calculate the window after every 1s
    // let timer = setInterval(() => {
    //   let currentHour = +new Date().toLocaleTimeString("en-US", {timeZone:`${homeTimeZone}`, timestyle:'full',hourCycle:'h23'}).split(':')[0]
      
    //   if(currentHour !== currentHourState) {
    //     setCurrentHourState(currentHour)
    //   }
    // }, 1000)

    // return (() => clearInterval(timer))

  }, [currentHourState])

  // re-calculate the window after every 1s
  useInterval(() => {
    let currentHour = +new Date().toLocaleTimeString("en-US", {timeZone:`${homeTimeZone}`, timestyle:'full',hourCycle:'h23'}).split(':')[0]
    
    if(currentHour !== currentHourState) {
      setCurrentHourState(currentHour)
    }
  })

  // if data is fetched successfully, then check for user's time zone availability in the fetched data. if found, then show the hourline for that timezone. Else, set the user's timezone to random and show hourline for that timezone 
  useEffect(() => {
    if(timeZones.length > 0) {
      const timeZoneFound = timeZones.find(timeZone => timeZone.TZDatabaseName.toLowerCase() === homeTimeZone.toLowerCase())

      if(!timeZoneFound) {
        // this will set the homeTimeZone to the first element of fetched data
        dispatch(setHomeTimeZone(timeZones[0].TZDatabaseName))
        // setCountryList([timeZones[0]])
        dispatch(setTimeZonesToShow(timeZones[0]))
      } else {
        // setCountryList([timeZoneFound])
        dispatch(setTimeZonesToShow(timeZoneFound))
      }
    }
  }, [timeZones])

  // if user is logged in, then get the calendar data for that user
  useEffect(() => {
    if(!calendars) {
      dispatch(getCalendars())
    }
    // REVISION 1 *********************************************
    // if user is logged in, then restore the time zone state of the user
    if(user && (user.timeZonesToShow) && user.homeTimeZone) {
      dispatch(restoreUserTimeZoneState(JSON.parse(user.timeZonesToShow)))
      dispatch(restoreHomeTimeZoneState(user.homeTimeZone))
    }
    // REVISION 1 END *****************************************
  }, [user])

  return (
    <Layout>
      <ToastMessage />
      <div style={{minHeight:'80vh'}}>
        {/* main-timezone section of the home page */}
        <main className={`container rounded my-2 p-1 ${styles.homeMainWrapper}`}>
          <MainHeader />
          {
            user && calendars ? (
              calendars.map((calendar, idx) => {
                // returning only the primary calendar of the user
                if(calendar.id === user.email) {
                  return (
                    <MainUserSchedule key={idx} calendarData={calendar} />
                  ) 
                }
            })
            ) : ''
          }
          <section id="homeMain" className={`p-relative ${styles.homeMainTimeLineSection}`}>
            <span id="window" className={`rounded p-absolute homeMainWindow`}></span>
            {
              isLoading ? (
                <Spinner />
              ) : (
                timeZonesToShow.map((timeZone, idx) => {
                  // only return for first ten timezones
                  if(idx < 10) {
                    return (
                      <MainCountryTimeZone key={idx} timeZoneInfo={timeZone} />
                    )
                  }
                })
              )
            }
          </section>
        </main>

        <MetaInfo />
      </div>
    </Layout>
  )
}

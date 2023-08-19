import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DateTime } from 'luxon'
import styles from '../../styles/MainUserSchedule.module.css'
import { getEvents } from '../../features/calendar/calendarSlice'

const MainUserSchedule = ({ calendarData }) => {

  const dispatch = useDispatch()
  
  const { events, calendarLoading } = useSelector(store => store.calendar)
  const { homeTimeZone, currentDate } = useSelector(store => store.timeZone)

  // fetch the events whenever the currentDate is changed
  useEffect(() => {
    dispatch(getEvents())
  }, [currentDate])


  // generate time difference from GMT in minutes
  const timeDiffGMTMinutes = (timeZone) => {
    return currentDate.setZone(timeZone).set({day: currentDate.day, month: currentDate.month, year: currentDate.year}).startOf('day').offset
  }

  // time difference between home time zone and local time zone in hours
  const generateTimeDiff = (homeTimeZone, localTimeZone) => {
    return -(timeDiffGMTMinutes(homeTimeZone) - timeDiffGMTMinutes(localTimeZone)) / 60
  }

  let hourLineArr = []
  const generateHourLine = timeDiff => {
    for(let i = 0; i < 24; i++){
      let hourVal = currentDate.setZone(events[0]?.start.timeZone).set({day: currentDate.day, month: currentDate.month, year: currentDate.year}).startOf('day').plus({hour: timeDiff + i})

      hourLineArr.push(hourVal)
    }
  }

  // time difference in hours from home time zone
  const timeDiff = generateTimeDiff(homeTimeZone, events[0]?.start.timeZone)
  generateHourLine(timeDiff)

  // showing event markers
  useEffect(() => {
    const eventMarkers = document.querySelectorAll('.eventMark')
    eventMarkers.forEach(marker => marker.remove())

    const userScheduleEl = document.getElementById('userSchedule')

    const width = userScheduleEl.getBoundingClientRect().width
    const margin = 2
    const windowSize = 2
    // number of pixels allocated to each minute duration
    const pixelPerMinute = (windowSize*16)/60
    const startOffset = 0.25 * width + margin*16

    events.forEach(event => {
      const startTime = DateTime.fromISO(event.start.dateTime)
      const endTime = DateTime.fromISO(event.end.dateTime)
      const eventDurationMins = ((endTime - startTime) / 60000)

      const markerEl = document.createElement('span')
      markerEl.className = 'd-flex justify-center align-center text-small3 eventMark'
      markerEl.style.width = eventDurationMins * pixelPerMinute + 'px'

      // event text is dynamic based on the duration of the event
      const numWordsSlice = Math.floor((pixelPerMinute * eventDurationMins) / 8)
      // inlcude '..' in event text if the event duration is greater than 15 minutes
      markerEl.innerText = event.summary?.slice(0,numWordsSlice-1) + (eventDurationMins > 15 ? '..' : '')

      hourLineArr.forEach((hourLine, index) => {
        // for last window, if the event is starting in the last window, then adjust the width of event and show it
        if(index === (hourLineArr.length - 1)) {
          if((startTime.hour === (hourLine.hour + 1)) && (startTime.day === hourLine.day)) {
            const minuteDiff = startTime.minute - hourLine.minute
            // if minuteDiff is zero or more that means the event will be shown on the next day
            if(minuteDiff >= 0) {
              return
            } else {
              markerEl.style.width = Math.abs(minuteDiff) * pixelPerMinute + 'px'
              // event text is dynamic based on the duration of the event
              const numWordsSlice = Math.floor((pixelPerMinute * Math.abs(minuteDiff)) / 8)
              // inlcude '..' in event text if the event duration is greater than 15 minutes
              markerEl.innerText = event.summary.slice(0,numWordsSlice) + (Math.abs(minuteDiff) > 15 ? '..' : '')
              markerEl.style.left = startOffset + ((60 + minuteDiff) * pixelPerMinute) + (windowSize*16) * index + 'px'
              userScheduleEl.appendChild(markerEl)
              return
            }
          }
        }
        if((startTime.hour === hourLine.hour) && (startTime.day === hourLine.day)) {
          const minuteDiff = startTime.minute - hourLine.minute
          markerEl.style.left = startOffset + (minuteDiff * pixelPerMinute) + (windowSize*16) * index + 'px'
          userScheduleEl.appendChild(markerEl)
        }
      })
    })
  }, [events, homeTimeZone, calendarLoading])

  useEffect(() => {
    dispatch(getEvents())
  }, [])

  return (
    <>
        {/* user email address and calendar schedule */}
        <section id="userSchedule" className={`py-1 d-flex align-center ${styles.homeMainUserSection}`}>
            <div className={`mr-2 text-center text-small4 ${styles.homeMainUserEmail}`}>
              {calendarData.summary}
            </div>

            {/* user's calender schedule */}
            <ul className={`d-flex flex-1`}>
              {/* one box for each hour of the day */}
              {
                calendarLoading ? (
                  <span className={`text-center`}>
                    Loading...
                  </span>
                  ) : (
                  Array.from(Array(24)).map((_, idx) => (
                    <li key={idx} className={`${styles.homeMainUserScheduleLi}`}>&nbsp;</li>
                  ))
                )
              }
            </ul>
        </section>
    </>
  )
}

export default MainUserSchedule
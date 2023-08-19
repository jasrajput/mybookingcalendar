import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from '../../styles/MainCountryTimeZone.module.css'
import HomeIcon from '../../public/img/home.svg'
import CloseIcon from '../../public/img/x.svg'
import Image from 'next/image'
import useInterval from '../../hooks/useInterval'
import { removeTimeZoneFromUI, setCurrentDate, setHomeTimeZone } from '../../features/timeZone/timeZoneSlice'
import { DateTime } from 'luxon'
import { saveHomeTimeZone } from '../../features/auth/authSlice'

// here local means the local country for which this component is rendered
const CountryTimeZone = ({ timeZoneInfo }) => {
  const [displayTime, setDisplayTime] = useState('--:-- --')

  const { homeTimeZone, twentyFourHourFormat, currentDate } = useSelector(store => store.timeZone)

  const dispatch = useDispatch()

  // store the home time zone state into DB
  useEffect(() => {
    dispatch(saveHomeTimeZone())
  }, [homeTimeZone])
  
  // https://overreacted.io/making-setinterval-declarative-with-react-hooks/
  // using custom hook as if we use setInterval, then it was not taking the new value of display time therefore, the component was re-rendering ever second
  useInterval(() => {
    const newTime = calculateTime(twentyFourHourFormat)
    if(newTime !== displayTime) {
      setDisplayTime(newTime)
    }
  })

  // calculate time according to the time zone to show in the country info section
  const calculateTime = (twentyFourHourFormat = false) => {
    if(twentyFourHourFormat) {
      const splitTime = new Date().toLocaleTimeString("en-US", {timeZone:`${timeZoneInfo.TZDatabaseName}`,timestyle:'full',hourCycle:'h23'}).split(':')
      return splitTime[0] + ':' + splitTime[1]
    } else {
      const splitTime = new Date().toLocaleTimeString("en-US", {timeZone:`${timeZoneInfo.TZDatabaseName}`,timestyle:'full',hourCycle:'h12'}).split(':')
      return splitTime[0] + ':' + splitTime[1] + ' ' + splitTime[2].split(' ')[1]
    }
  }
  

  // generate time difference from GMT in minutes
  const timeDiffGMTMinutes = (timeZone) => {
    return currentDate.setZone(timeZone).set({day: currentDate.day, month: currentDate.month}).startOf('day').offset
  }

  // time difference between home time zone and local time zone in hours
  const generateTimeDiff = (homeTimeZone, localTimeZone) => {
    return -(timeDiffGMTMinutes(homeTimeZone) - timeDiffGMTMinutes(localTimeZone)) / 60
  }

  let hourLineArr = []
  const generateHourLine = timeDiff => {
    for(let i = 0; i < 24; i++){
      let hourVal = currentDate.setZone(timeZoneInfo.TZDatabaseName).set({day: currentDate.day, month: currentDate.month, year: currentDate.year}).startOf('day').plus({hour: timeDiff + i})

      hourLineArr.push(hourVal)
    }
  }

  // time difference in hours from home time zone
  const timeDiff = generateTimeDiff(homeTimeZone, timeZoneInfo.TZDatabaseName)
  generateHourLine(timeDiff)

  const changeHomeTimeZone = () => {
    dispatch(setHomeTimeZone(timeZoneInfo.TZDatabaseName))
    dispatch(setCurrentDate(DateTime.now().setZone(timeZoneInfo.TZDatabaseName)))
  }

  return (
    <>
        {/* country and timezone info */}
        <section className={`py-05`}>
          {/* one row for each country */}
          <section className={`py-05 d-flex align-center`}>
            {/* country name and its local time */}
            <div className={`d-flex align-center justify-between mr-2 ${styles.homeMainCountryInfo}`}>

              <div className={`p-relative`}>
                {
                  timeDiff === 0 ?
                  (
                    ''
                  ) :
                  (
                    <>
                      <span onClick={() => dispatch(removeTimeZoneFromUI(timeZoneInfo))} className={`p-absolute ${styles.homeMainCountryInfoDeleteIcon}`}>
                        <Image src={CloseIcon} />
                      </span>
                      {/* <span onClick={() => dispatch(setHomeTimeZone(timeZoneInfo.TZDatabaseName))} className={`p-absolute ${styles.homeMainCountryInfoHomeIcon}`}> */}
                      <span onClick={changeHomeTimeZone} className={`p-absolute ${styles.homeMainCountryInfoHomeIcon}`}>
                        <Image src={HomeIcon} />
                      </span>
                    </>

                  )
                }
                <span className={`mr-05 text-light text-small4 ${styles.homeMainCountryInfoTimeDiff}`}>
                  {/* add '+' sign if time diff is greater than zero */}
                  {
                    // if time difference id zero, add the home icon
                    timeDiff === 0 ?
                    (
                      <div className={`${styles.homeMainHomeIcon}`}>
                        <Image src={HomeIcon} />
                      </div>
                    )
                    :
                    (
                      // calculating time difference manually for displaying accurate info rather than calculations where data is not calculated the same
                      (-(currentDate.setZone(homeTimeZone).offset - currentDate.setZone(timeZoneInfo.TZDatabaseName).offset)/60) > 0 ? 
                      '+' + (-(currentDate.setZone(homeTimeZone).offset - currentDate.setZone(timeZoneInfo.TZDatabaseName).offset)/60).toString() : 
                      (-(currentDate.setZone(homeTimeZone).offset - currentDate.setZone(timeZoneInfo.TZDatabaseName).offset)/60)
                    )
                  }
                </span>
                <span className={`fw-500 text-small4`}>{timeZoneInfo.TZDatabaseName.split('/').at(-1)}</span>
                <span className={`text-small3 ml-05 px-03 ml-03 rounded p-absolute ${styles.homeMainTZAbbr}`}>
                  {currentDate.setZone(timeZoneInfo.TZDatabaseName).isInDST ? timeZoneInfo.DSTAbbreviation : timeZoneInfo.STDAbbreviation}
                </span>
              </div>

              <div className={`fw-500 text-small4`}>
                {displayTime.split(' ')[0]}
                <span className={`text-small3`}> {displayTime.split(' ')[1]?.toLowerCase()}</span>
              </div>

            </div>

            {/* list of hours of the day */}
            <ul className={`d-flex flex-1`}>
              {
                hourLineArr.map((time, idx) => (
                  // color classes based on hours and flex direction based on time format(24h or 12h)
                  <li key={idx} className={`d-flex ${twentyFourHourFormat ? 'flex-column' : ''} align-center justify-center ${styles.homeMainTimeLi} ${time.hour >= 0 && time.hour < 1 ? styles.homeMainDayInfo : ''} ${(time.hour < 6 && time.hour >= 1) || (time.hour >= 22) ? styles.homeMainDangerHours : ''} ${(time.hour >= 6 && time.hour < 8) || (time.hour >= 18 && time.hour < 22) ? styles.homeMainOddHours : ''} ${(time.hour >= 23) ? styles.homeMainRightBorderRound : ''} ${(time.hour >= 0 && time.hour < 1) ? styles.homeMainLeftBorderRound : ''} ${(hourLineArr[idx-1]?.hour === time.hour) || (time.hour > hourLineArr[idx-1]?.hour + 1) ? styles.homeMainDSTHour : ''}`} data-test={time.hour}>
                    {
                    // when hour value is between 0 and 1, show date instead of hour
                    time.hour >= 0 && time.hour < 1 ? (
                      <>
                        <span className={`${styles.homeMainTimeLiDay} text-small3`}>
                          {/* if local timezone difference is >0, then add next day of the home timezone else add the current date as per home time zone */}
                          {
                            timeDiff > 0 ?
                            time.weekdayShort
                            :
                            time.weekdayShort
                          }
                        </span>

                        <span className={`text-small3`}>
                          {
                            timeDiff > 0 ? 
                            time.monthShort
                            :
                            time.monthShort
                           }
                          <br />
                          {
                            timeDiff > 0 ? 
                            time.day
                            :
                            time.day
                          }
                        </span>
                      </>
                    ) : (
                      // for showing either 24hour format or 12 hour format
                      time.hour < 13 ? (
                        <>
                          {time.minute ? (
                            <>
                              <span className={`${twentyFourHourFormat ? '' : 'mb-03'}`}>{parseInt(time.hour)}</span>
                              {/* add a space if the format is 12 hours */}
                              {!twentyFourHourFormat ? (<>&nbsp;</>) : ''}
                              <span className='text-small2'>
                                {/* convert 0.5 into 30, like, 6.5 will be converted into 6 30 */}
                                {time.minute}
                              </span>
                            </>
                            ) : (
                              <>
                                <span className={`${twentyFourHourFormat ? '' : 'mb-03'}`}>{time.hour}</span>
                              </>
                            )
                            }
                          {
                            // if format of hourline is 24hours, then don't show am/pm
                            twentyFourHourFormat ? '' : (
                              // if hour is 12, then show pm not am
                              parseInt(time.hour) === 12 
                              ? 
                              <span className={`text-small2 p-absolute ${styles.homeMainTimeLiAmPm}`}>pm</span> 
                              :
                              <span className={`text-small2 p-absolute ${styles.homeMainTimeLiAmPm}`}>am</span>
                            )
                          }
                        </>
                      ) : (
                        <>
                          {time.minute ? (
                            <>
                              {twentyFourHourFormat ? 
                                (
                                  <>
                                    <span className={`${twentyFourHourFormat ? '' : 'mb-03'}`}>{parseInt(time.hour)}</span>
                                  </>
                                )
                                : 
                                (
                                  <>
                                    <span className={`${twentyFourHourFormat ? '' : 'mb-03'}`}>{parseInt(time.hour) - 12}</span>
                                  </>
                                )
                              }
                              {!twentyFourHourFormat ? (<>&nbsp;</>) : ''}
                              <span className='text-small2'>
                                {time.minute}
                              </span>
                            </>
                            ) : 
                            (
                              twentyFourHourFormat ? 
                              (
                                <>
                                  <span className={`${twentyFourHourFormat ? '' : 'mb-03'}`}>
                                    {time.hour}
                                  </span>
                                </>
                              ) 
                              : 
                              (
                                <>
                                  <span className={`${twentyFourHourFormat ? '' : 'mb-03'}`}>
                                    {time.hour - 12}
                                  </span>
                                </>
                              )
                            )
                            }
                          {
                            twentyFourHourFormat ? '' : (
                              <span className={`text-small2 p-absolute ${styles.homeMainTimeLiAmPm}`}>pm</span>
                            )
                          }
                        </>
                      )
                    )
                  }
                  </li>
                ))
              }
            </ul>
          </section>

        </section>
    </>
  )
}

export default CountryTimeZone
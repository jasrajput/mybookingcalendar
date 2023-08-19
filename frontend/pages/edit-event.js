import { useEffect, useState } from 'react'
import { DateTime } from 'luxon'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import styles from '../styles/NewEvent.module.css'
import Layout from '../components/Layout'
import ToastMessage, {showToastMessage} from '../components/ToastMessage'
import { editEvent, eventReset } from '../features/event/eventSlice'
import Spinner from '../components/Spinner'
import { getAllTeams } from '../features/user/userSlice'

const EditEvent = () => {
  const [eventName, setEventName] = useState('')
  // UPDATE 1 ********************************************
  const [redirectURL, setRedirectURL] = useState('')
  // UPDATE 1 END ********************************************
  const [eventDescription, setEventDescription] = useState('')
  const [meetingLocation, setMeetingLocation] = useState('Google meet')
  const [duration, setDuration] = useState('Duration')
  const [daysAdvance, setDaysAdvance] = useState(3)

  // UPDATE 1 *************************************************************
  const [onConfirmation, setOnConfirmation] = useState('Display Mybookingcalendar confirmation page')
  // UPDATE 1 END *************************************************************

  // UPDATE 2 *************************************************************
  const [eventType, setEventType] = useState('Single Event')
  const [teamName, setTeamName] = useState('')
  const [selectOptionsUlEventTypeEl, setSelectOptionsUlEventTypeEl] = useState(null)
  const [filteredTeams, setFilteredTeams] = useState([])
  // UPDATE 2 END *************************************************************

  const [meetingTimeArr, setMeetingTimeArr] = useState([])
  const [selectOptionsUlEl, setSelectOptionsUlEl] = useState(null)
  const [selectOptionsUlTimeEl, setSelectOptionsUlTimeEl] = useState(null)
  const [selectOptionsUlDaysEl, setSelectOptionsUlDaysEl] = useState(null)

  // UPDATE 1 ************************************************************
  const [selectOptionsUlOnConfirmationEl, setSelectOptionsUlOnConfirmationEl] = useState(null)
  // UPDATE 1 END ************************************************************
  const [meetingTime, setMeetingTime] = useState({
    'SUN': 'Unavailable',
    'MON': {
      'from': '09:00am',
      'to': '05:00pm'
    },
    'TUE': {
      'from': '09:00am',
      'to': '05:00pm'
    },
    'WED': {
      'from': '09:00am',
      'to': '05:00pm'
    },
    'THU': {
      'from': '09:00am',
      'to': '05:00pm'
    },
    'FRI': {
      'from': '09:00am',
      'to': '05:00pm'
    },
    'SAT': 'Unavailable'
  })
  const [eventFound, setEventFound] = useState(undefined)

  const dispatch = useDispatch()
  const router = useRouter()

  const { user, isLoading } = useSelector(store => store.auth)
  const { events, eventError, eventMessage, eventLoading, eventSuccess } = useSelector(store => store.event)
  const { allTeams } = useSelector(store => store.user)

  // when 'id' is loaded, then identify the current event from the global event state and update the local input states for hydration
  useEffect(() => {
    // if query parameter is initialized, then update the local input states
    if(router.query.id) {
      // when id is available, but is incorrect or when there are no events in the global state
      if(eventFound === false) {
        router.push('/my-events')
      }

      // loop through global event state 
      events.forEach(evnt => {
        // match the correct event and update the local input states
        if(evnt._id === router.query.id) {
          // UPDATE 2 ***************************************************
          setEventType(evnt.eventType)
          setTeamName(() => {
            if(allTeams.length > 0) {
              return allTeams.filter(team => team._id === evnt.team)[0]?.teamName
            } else {
              return ''
            }
          })
          // UPDATE 2 END ***************************************************
          setEventName(evnt.name)
          setEventDescription(evnt.description)
          setMeetingLocation(evnt.location)
          setDuration(evnt.duration)
          setDaysAdvance(evnt.daysAdvance)
          // UPDATE 1 **************************************************
          setRedirectURL(evnt.redirectURL)
          setOnConfirmation(evnt.onConfirmation)
          // UPDATE 1 END **************************************************
          setMeetingTime(JSON.parse(evnt.meetingHours))
          setEventFound(true)
        }
      })
      
      // check if the event is found, if not, then set the eventfound state to false in order to redirect to my-events page
      const matchedEvent = events.filter(evnt => evnt._id === router.query.id)
      if(matchedEvent.length === 0) {
        setEventFound(false)
      }
      // when there is no id in the query params, then redirect to the my-events page
    } else {
      router.push('/my-events')
    }
  }, [router.query.id, eventFound])

  // close the drop down select on clicking anywhere except the dropdown element
  useEffect(() => {
    const selectWrapperEl = document.getElementById('selectWrapper')
    setSelectOptionsUlEl(document.getElementById('selectOptionsUl'))
    const selectWrapperTimeEl = document.getElementById('selectWrapperTime')
    setSelectOptionsUlTimeEl(document.getElementById('selectOptionsUlTime'))
    const selectWrapperDaysEl = document.getElementById('selectWrapperDaysAdvance')
    setSelectOptionsUlDaysEl(document.getElementById('selectOptionsUlDaysAdvance'))

    // UPDATE 1 ******************************************************************
    const selectWrapperOnConfirmationEl = document.getElementById('selectWrapperOnConfirmation')
    setSelectOptionsUlOnConfirmationEl(document.getElementById('selectOptionsUlOnConfirmation'))
    // UPDATE 1 END ******************************************************************

    // UPDATE 2 ******************************************************************
    const selectWrapperEventTypeEl = document.getElementById('selectWrapperEventType')
    setSelectOptionsUlEventTypeEl(document.getElementById('selectOptionsUlEventType'))
    // UPDATE 2 END ******************************************************************

    const meetingTimeWrapperEl = document.querySelectorAll('.meetingTimeWrapper')

    const hideUl = e => {
      // if(!e.path.includes(selectWrapperEl)) {
      if(!e.composedPath().includes(selectWrapperEl)) {
        selectOptionsUlEl?.classList.remove('selectOptionUlShow')
      } 

      if(!e.composedPath().includes(selectWrapperTimeEl)) {
        selectOptionsUlTimeEl?.classList.remove('selectOptionUlShow')
      }

      if(!e.composedPath().includes(selectWrapperDaysEl)) {
        selectOptionsUlDaysEl?.classList.remove('selectOptionUlShow')
      }

      // UPDATE 1 ********************************************************************
      if(!e.composedPath().includes(selectWrapperOnConfirmationEl)) {
        selectOptionsUlOnConfirmationEl?.classList.remove('selectOptionUlShow')
      }
      // UPDATE 1 END ********************************************************************

      // UPDATE 2 ********************************************************************
      if(!e.composedPath().includes(selectWrapperEventTypeEl)) {
        selectOptionsUlEventTypeEl?.classList.remove('selectOptionUlShow')
      }
      // UPDATE 2 END ********************************************************************

      meetingTimeWrapperEl.forEach(el => {
        if(!e.composedPath().includes(el)) {
          el.lastElementChild.classList.remove('selectOptionUlShow')
        }
      })
    }

    window.addEventListener('click', hideUl)

    return () => window.removeEventListener('click', hideUl)
  }, [selectOptionsUlEl, selectOptionsUlTimeEl, meetingTime, user])

  // generate the list to select the 'from' and 'to' time
  useEffect(() => {
    const generateMeetingTime = () => {
      let meetingTime = []
      for(let i = 0; i < 96; i++) {
        meetingTime.push(DateTime.now().startOf('day').plus({minute: i*15}))
      }
      setMeetingTimeArr(meetingTime)
    }
    generateMeetingTime()
  }, [])

  // if not logged in, then redirect to login page
  useEffect(() => {
    if(!user && !isLoading) {
      router.push('/login')
    }
  }, [user])

  // if there is error or success, then show the appropriate message
  useEffect(() => {
    if(eventError) {
      showToastMessage(eventMessage, 'error')
      dispatch(eventReset())
    }

    if(eventSuccess) {
      setEventName('')
      setEventDescription('')
      setMeetingLocation('Location')
      setDuration('Duration')
      // UPDATE 1 **************************************************************
      setRedirectURL('')
      // UPDATE 1 END **************************************************************
      showToastMessage('Event updated successfully', 'success')
      dispatch(eventReset())
    }
  }, [eventError, eventSuccess])

  // UPDATE 2 ************************************************************************
  // get all teams data
  useEffect(() => {
    dispatch(getAllTeams())
  }, [])

  // filter the teams as soon as the user starts typing in the name of the team
  useEffect(() => {
    if(teamName?.length > 2) {
      document.getElementById('filteredTeamsContainer')?.style.display = 'flex'
      setFilteredTeams(allTeams.filter(team => team.teamName.toLowerCase().includes(teamName.toLowerCase())))
    } else {
      setFilteredTeams([])
    }
  }, [teamName])

  // remove the filteredTeamsContainer on outside click
  useEffect(() => {
    window.addEventListener('click', e => {
      if(e.target === document.getElementById('filteredTeamsContainer')) {
          return
      } else {
          document.getElementById('filteredTeamsContainer')?.style.display = 'none'
      }
    })
  }, [])
  // UPDATE 2 END ******************************************************************************

  // if user is not logged in or being fetched or the 'id' is not loaded in the query params, then show the spinner 
  if(!user || !router.query.id) {
    return <Spinner />
  }

  const toggleListHandler = e => {
    selectOptionsUlEl.classList.toggle('selectOptionUlShow')
  }

  const toggleListHandlerTime = e => {
    selectOptionsUlTimeEl.classList.toggle('selectOptionUlShow')
  }

  const meetingTimeHandler = e => {
    e.currentTarget.lastElementChild.classList.toggle('selectOptionUlShow')
  }

  const toggleListHandlerDays = e => {
    e.currentTarget.lastElementChild.classList.toggle('selectOptionUlShow')
  }

  // UPDATE 1 ****************************************************************
  const toggleListOnConfirmation = e => {
    e.currentTarget.lastElementChild.classList.toggle('selectOptionUlShow')
  }
  // UPDATE 1 END ****************************************************************

  // UPDATE 2 *************************************************************
  const toggleListEventType = e => {
    e.currentTarget.lastElementChild.classList.toggle('selectOptionUlShow')
  }
  // UPDATE 2 END *************************************************************

  const submitHandler = e => {
    e.preventDefault()

    if(!user.googleScopes?.toLowerCase().includes('calendar')) {
      showToastMessage('Please connect with google calendar in the integrations page', 'error')
      return
    }

    const locationErrorEl = document.getElementById('locationError')

    // return from the function if there is some error in the location field 
    if(locationErrorEl.innerText !== '') {
      showToastMessage('Please select correct location', 'error')
      return
    }

    const meetingErrorEl = document.querySelectorAll('.meetingTimeError')

    // if there is error in the meeting times, then do not submit the request to backend
    let meetingError = false
    meetingErrorEl.forEach(el => {
      if(el.classList.contains('show')) {
        meetingError = true
        showToastMessage('Please correct your meeting time errors first', 'error')
        return
      }
    })

    // if there is error in meeting time, then return from this function
    if(meetingError) {
      return
    }

    // UPDATE 1 *****************************************************
    // if there is nothing in the redirect URL field, then return from this function
    if(redirectURL.trim() === '' && onConfirmation === 'Redirect to an external site') {
      showToastMessage('Redirect URL field cannot be empty', 'error')
      return
    }
    // UPDATE 1 END *****************************************************

    // UPDATE 2 ***********************************************************
    // if there are more than one teams in the filtered teams state, then show the appropriate error
    if((eventType === 'Team Event') && (filteredTeams.length !== 1)) {
      showToastMessage('Please select a valid team name', 'error')
      return
    }
    // UPDATE 2 END ***********************************************************

    dispatch(editEvent({ eventId: router.query.id, meetingHours: JSON.stringify(meetingTime), name: eventName, description: eventDescription, location: ((meetingLocation === 'Location') ? 'Google meet' : meetingLocation), duration: ((duration === 'Duration') ? '30 min' : duration), daysAdvance: daysAdvance, onConfirmation, redirectURL, eventType, team: (eventType === 'Team Event') ? filteredTeams[0]._id : null, timeZone: user.homeTimeZone }))
  }

  const deleteButtonHandler = (e) => {
    // set the time to 'Unavailable'
    const dayName = e.currentTarget.parentElement.firstElementChild.innerText
    setMeetingTime(prevMeetingTime => ({...prevMeetingTime, [dayName]: 'Unavailable'}))
  }

  const addButtonHandler = (e) => {
    // set the default 'from' and 'to' time
    const dayName = e.currentTarget.parentElement.firstElementChild.innerText
    setMeetingTime(prevMeetingTime => ({...prevMeetingTime, [dayName]: {
      'from': '09:00am',
      'to': '05:00pm'
    }}))
  }

  return (
    <Layout>
      <ToastMessage />
      <section className="loginForm_wrapper container">
        <div className={`loginForm_container ${styles.newEventFormContainer}`}>
          <h1>Edit Event</h1>
          <form onSubmit={submitHandler}>
            <hr className="loginFormHr" style={{ marginBottom: '2rem' }} />

            {/* UPDATE 2 ******************************************************  */}
            <div className={`p-relative`}>
              <h3 className={`mb-1`}>
                Event Type
              </h3>

              <div id="selectWrapperEventType" onClick={toggleListEventType} className={`mb-2 ${styles.selectWrapper}`}>
                <span>{eventType}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>
                <ul id="selectOptionsUlEventType" className={`${styles.selectOptionsUl}`}>
                  <li className={`d-flex align-center ${styles.selectOptionsLi}`} onClick={(e) => setEventType(e.target.innerHTML)}>
                    Single Event
                  </li>
                  <li className={`d-flex align-center ${styles.selectOptionsLi}`} onClick={(e) => setEventType(e.target.innerHTML)}>
                    Team Event
                  </li>
                </ul>
              </div>

              <input type="text" value={teamName ? teamName : ''} onChange={(e) => setTeamName(e.target.value)} style={{display: `${eventType === 'Team Event' ? 'block' : 'none'}`}} placeholder="Enter Team Name"/>
              {/* drop down list of filtered teams */}
              {
                (filteredTeams.length > 0) ? (
                  <ul id="filteredTeamsContainer" style={{left:'0', bottom:`calc(-2.8rem - ${Math.min((filteredTeams.length - 1) * 40, 5*40)}px)`, width:'100%', backgroundColor:'#fff', maxHeight: '15rem', border:'1px solid var(--secondary-color)', overflowX:'hidden', whiteSpace: 'nowrap', boxShadow:'0px 2px 5px 0px rgba(0,0,0,0.1)', zIndex:'99'}} className={`d-flex flex-column p-absolute rounded`}>
                    {
                      filteredTeams.map((team, index) => (
                        <li onClick={e => setTeamName(e.target.innerText)} key={index} className={`c-pointer p-05 pl-1 ${styles.newEventFilteredTeamLi}`}>
                          {
                            team.teamName
                          }
                        </li>
                      ))
                    }
                  </ul>
                ) : ''
              }
            </div>
            {/* UPDATE 2 END ******************************************************  */}

            <input type="text" value={eventName} onChange={e => setEventName(e.target.value)} placeholder="Event Name" required/>

            {/* select options drop down for location */}
            <div onClick={toggleListHandler} id="selectWrapper" className={`mb-2 ${styles.selectWrapper}`}>
              <span>{meetingLocation}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>

              <ul id="selectOptionsUl" className={`${styles.selectOptionsUl}`}>
                <li onClick={() => setMeetingLocation('Google meet')} className={`d-flex align-center ${styles.selectOptionsLi}`}>
                  <span className={`d-flex align-center mr-05`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 87.5 72">
                      <path fill="#00832d" d="M49.5 36l8.53 9.75 11.47 7.33 2-17.02-2-16.64-11.69 6.44z"/>
                      <path fill="#0066da" d="M0 51.5V66c0 3.315 2.685 6 6 6h14.5l3-10.96-3-9.54-9.95-3z"/>
                      <path fill="#e94235" d="M20.5 0L0 20.5l10.55 3 9.95-3 2.95-9.41z"/>
                      <path fill="#2684fc" d="M20.5 20.5H0v31h20.5z"/>
                      <path fill="#00ac47" d="M82.6 8.68L69.5 19.42v33.66l13.16 10.79c1.97 1.54 4.85.135 4.85-2.37V11c0-2.535-2.945-3.925-4.91-2.32zM49.5 36v15.5h-29V72h43c3.315 0 6-2.685 6-6V53.08z"/>
                      <path fill="#ffba00" d="M63.5 0h-43v20.5h29V36l20-16.57V6c0-3.315-2.685-6-6-6z"/>
                    </svg>
                  </span>
                  Google meet
                </li>
                <li onClick={() => setMeetingLocation('Zoom')} className={`d-flex align-center ${styles.selectOptionsLi}`}>
                  <span className={`d-flex align-center mr-05`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1329.08 1329.08" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd">
                      <defs>
                        <style>
                          {
                            `.fil1{fill:#fff;fill-rule:nonzero}`
                          }
                        </style>
                      </defs>
                      <g id="Layer_x0020_1">
                        <g id="_2116467169744">
                          <path d="M664.54 0c367.02 0 664.54 297.52 664.54 664.54s-297.52 664.54-664.54 664.54S0 1031.56 0 664.54 297.52 0 664.54 0z" fill="#e5e5e4" fillRule="nonzero"/>
                          <path className="fil1" d="M664.54 12.94c359.87 0 651.6 291.73 651.6 651.6s-291.73 651.6-651.6 651.6-651.6-291.73-651.6-651.6 291.74-651.6 651.6-651.6z"/>
                          <path d="M664.54 65.21c331 0 599.33 268.33 599.33 599.33 0 331-268.33 599.33-599.33 599.33-331 0-599.33-268.33-599.33-599.33 0-331 268.33-599.33 599.33-599.33z" fill="#4a8cff" fillRule="nonzero"/>
                          <path className="fil1" d="M273.53 476.77v281.65c.25 63.69 52.27 114.95 115.71 114.69h410.55c11.67 0 21.06-9.39 21.06-20.81V570.65c-.25-63.69-52.27-114.95-115.7-114.69H294.6c-11.67 0-21.06 9.39-21.06 20.81zm573.45 109.87l169.5-123.82c14.72-12.18 26.13-9.14 26.13 12.94v377.56c0 25.12-13.96 22.08-26.13 12.94l-169.5-123.57V586.64z"/>
                        </g>
                      </g>
                    </svg>
                  </span>
                  Zoom
                </li>
              </ul>

              <span id="locationError" className={`${styles.newEventLocationError}`}>
                {
                  meetingLocation === 'Zoom' ? (
                    <>
                      {user.zoomScopes?.toLowerCase().includes('meeting:write') ? '' : `${meetingLocation} is not integrated. Please go to integrations page to connect with ${meetingLocation}`}
                    </>
                  ) : (
                    <>
                      {user.googleScopes?.toLowerCase().includes('calendar') ? '' : `${meetingLocation} is not integrated. Please go to integrations page to connect with ${meetingLocation}`}
                    </>
                  )
                }
              </span>
            </div>

            <textarea value={eventDescription} onChange={e => setEventDescription(e.target.value)} placeholder="Description" required/>

            {/* select options drop down for duration */}
            <div onClick={toggleListHandlerTime} id="selectWrapperTime" className={`mb-2 ${styles.selectWrapper}`}>
              <span>{duration}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>

              <ul id="selectOptionsUlTime" className={`${styles.selectOptionsUl}`}>
                <li onClick={(e) => setDuration(e.target.innerHTML)} className={`d-flex align-center ${styles.selectOptionsLi}`}>
                  15 min
                </li>
                <li onClick={(e) => setDuration(e.target.innerHTML)} className={`d-flex align-center ${styles.selectOptionsLi}`}>
                  30 min
                </li>
                <li onClick={(e) => setDuration(e.target.innerHTML)} className={`d-flex align-center ${styles.selectOptionsLi}`}>
                  45 min
                </li>
                <li onClick={(e) => setDuration(e.target.innerHTML)} className={`d-flex align-center ${styles.selectOptionsLi}`}>
                  60 min
                </li>
              </ul>
            </div>

            <div>
              <h3 className={`mb-1`}>
                Invitees can schedule <span className={`text-small4`}>(days in advance)</span>
              </h3>

              <div id="selectWrapperDaysAdvance" onClick={toggleListHandlerDays} className={`mb-2 ${styles.selectWrapper}`}>
                <span>{daysAdvance}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>
                <ul id="selectOptionsUlDaysAdvance" className={`${styles.selectOptionsUl}`}>
                  <li className={`d-flex align-center ${styles.selectOptionsLi}`} onClick={(e) => setDaysAdvance(e.target.innerHTML)}>3</li>
                  <li className={`d-flex align-center ${styles.selectOptionsLi}`} onClick={(e) => setDaysAdvance(e.target.innerHTML)}>5</li>
                </ul>
              </div>
            </div>

            {/* UPDATE 1 ******************************************************  */}
            <div>
              <h3 className={`mb-1`}>
                On Confirmation
              </h3>

              <div id="selectWrapperOnConfirmation" onClick={toggleListOnConfirmation} className={`mb-2 ${styles.selectWrapper}`}>
                <span>{onConfirmation}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>
                <ul id="selectOptionsUlOnConfirmation" className={`${styles.selectOptionsUl}`}>
                  <li className={`d-flex align-center ${styles.selectOptionsLi}`} onClick={(e) => setOnConfirmation(e.target.innerHTML)}>
                    Display Mybookingcalendar confirmation page
                  </li>
                  <li className={`d-flex align-center ${styles.selectOptionsLi}`} onClick={(e) => setOnConfirmation(e.target.innerHTML)}>
                    Redirect to an external site
                  </li>
                </ul>
              </div>

              <input type="text" value={redirectURL} onChange={(e) => setRedirectURL(e.target.value)} style={{display: `${onConfirmation === 'Redirect to an external site' ? 'block' : 'none'}`}} placeholder="Enter Redirect URL"/>
            </div>
            {/* UPDATE 1 END ******************************************************  */}

            {/* select options drop down for meeting time */}
            <div className={`p-1 mb-1 rounded ${styles.newEventMeetingTimeWrapper}`}>
              <h3 className={`mb-1 ${styles.meetingTimeHeading}`}>Set your weekly hours</h3>
              
              {
                // one block for each day of the week
                Object.keys(meetingTime).map((day, idx) => (
                  <div key={idx} className={`pb-1 mb-1 d-flex align-center justify-evenly ${styles.newEventMeetingTimeDayWrapper}`}>
                    <span className={`mr-1 ${styles.newEventMeetingTimeDay}`}>{day}</span>

                    {
                      meetingTime[day] === `Unavailable` ? (
                        <>
                          <span className={`flex-1 text-center`}>Unavailable</span>
                          {/* add button */}
                          <div className={`d-flex align-center ${styles.meetingTimeAddBtnWrapper}`} onClick={addButtonHandler}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                          </div>
                        </>
                        
                        ) : (
                        <>
                          {/* 'from' time selector */}
                          <div onClick={meetingTimeHandler} className={`rounded mr-05 meetingTimeWrapper ${styles.newEventMeetingTime}`}>
                            <span>{meetingTime[day].from}</span>
      
                            <ul className={`${styles.newEventMeetingTimeUl}`}>
                              {
                                meetingTimeArr.map((time, index) => (
                                  <li onClick={(e) => {
                                    e.target.parentElement.childNodes.forEach(el => el.classList.remove('newEventMeetingTimeLiActive'))

                                    e.target.classList.add('newEventMeetingTimeLiActive')

                                    return setMeetingTime((prev) => ({...prev, [day]: {...prev[day], 'from': `${(time.hour - 12) > 0 ? (String(time.hour - 12).length === 1 ? (`0${time.hour - 12}`) : (time.hour - 12)) : (time.hour.toString().length === 1 ? (`0${time.hour}`) : (`${time.hour}`))}:${String(time.minute).length === 1 ? (`0${time.minute}`) : (time.minute)}${(time.hour-12) >= 0 ? 'pm' : 'am'}`}}))
                                  }} className={`p-05 ${styles.newEventMeetingTimeLi}`} key={index}>
                                    {
                                    (time.hour - 12) > 0 ? 
                                    (String(time.hour - 12).length === 1 ? '0'+(time.hour - 12) : (time.hour - 12)) :
                                    (time.hour.toString().length === 1 ? (
                                      `0${time.hour}`
                                    ) :
                                    (`${time.hour}`))
                                    }:{time.minute.toString().length === 1 ? (
                                      `0${time.minute}`
                                    ) :
                                    (`${time.minute}`)}{(time.hour - 12) >= 0 ? 'pm' : 'am'}
                                  </li>
                                ))
                              }
                            </ul>
                          </div>
      
                          <span className={`mr-05 ${styles.meetingTimeHyphen}`}>-</span>
      
                          {/* 'to' time selector */}
                          <div onClick={meetingTimeHandler} className={`rounded mr-1 meetingTimeWrapper ${styles.newEventMeetingTime}`}>
                            <span>{meetingTime[day].to}</span>
      
                            <ul className={`${styles.newEventMeetingTimeUl}`}>
                              {
                                meetingTimeArr.map((time, index) => (
                                  <li onClick={(e) => {
                                    e.target.parentElement.childNodes.forEach(el => el.classList.remove('newEventMeetingTimeLiActive'))

                                    e.target.classList.add('newEventMeetingTimeLiActive')

                                    return setMeetingTime((prev) => ({...prev, [day]: {...prev[day], 'to': `${(time.hour - 12) > 0 ? (String(time.hour - 12).length === 1 ? (`0${time.hour - 12}`) : (time.hour - 12)) : (time.hour.toString().length === 1 ? (`0${time.hour}`) : (`${time.hour}`))}:${String(time.minute).length === 1 ? (`0${time.minute}`) : (time.minute)}${(time.hour-12) >= 0 ? 'pm' : 'am'}`}}))
                                  }} className={`p-05 ${styles.newEventMeetingTimeLi}`} key={index}>    
                                    {
                                    (time.hour - 12) > 0 ? 
                                    (String(time.hour - 12).length === 1 ? '0'+(time.hour - 12) : (time.hour - 12)) :
                                    (time.hour.toString().length === 1 ? (
                                      `0${time.hour}`
                                    ) :
                                    (`${time.hour}`))
                                    }:{time.minute.toString().length === 1 ? (
                                      `0${time.minute}`
                                    ) :
                                    (`${time.minute}`)}{(time.hour - 12) >= 0 ? 'pm' : 'am'}
                                  </li>
                                ))
                              }
                            </ul>
                          </div>
      
                          {/* delete button */}
                          <div className={`${styles.meetingTimeDeleteBtnWrapper}`} onClick={deleteButtonHandler}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </div>
      
                          {/* meeting time error */}
                          <span className={`text-small3 meetingTimeError ${
                            DateTime.now().set({hour: (meetingTime[day].from.split(':')[1].slice(-2) === 'pm' ? (meetingTime[day].from.split(':')[0] === '12' ? meetingTime[day].from.split(':')[0] : +meetingTime[day].from.split(':')[0] + 12) : (meetingTime[day].from.split(':')[0]))}).set({minute: meetingTime[day].from.split(':')[1].slice(0,2)}) > DateTime.now().set({hour: (meetingTime[day].to.split(':')[1].slice(-2) === 'pm' ? (meetingTime[day].to.split(':')[0] === '12' ? meetingTime[day].to.split(':')[0] : +meetingTime[day].to.split(':')[0] + 12) : (meetingTime[day].to.split(':')[0]))}).set({minute: meetingTime[day].to.split(':')[1].slice(0,2)}) ? ('show') : ('')
                          }`}>
                            Choose an end time later than start time
                          </span>
                        </>
                      )
                    }
                  </div>
                ))
              }
            </div>

            <input id="flashBtn" className={`${styles.eventSubmitBtn}`} type="submit" value={eventLoading ? 'Loading...' : "Update Event"} disabled={eventLoading ? true : false}/>
          </form>
        </div>
      </section>
    </Layout>
  )
}

export default EditEvent
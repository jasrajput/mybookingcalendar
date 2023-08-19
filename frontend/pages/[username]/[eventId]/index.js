import { useEffect, useState } from 'react';
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css';
import { DateTime } from 'luxon'
// UPDATE 1 ******************************************
import Linkify from 'react-linkify'
// UPDATE 1 END ******************************************
import styles from '../../../styles/BookEvent.module.css'
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Spinner from '../../../components/Spinner'
import { getEvent } from '../../../features/event/eventSlice';
import { createEvent, createZoomMeeting, rescheduleEvent, reset} from '../../../features/calendar/calendarSlice';
import { getAllTeamMembers } from '../../../features/user/userSlice';
import ToastMessage, { showToastMessage } from '../../../components/ToastMessage';

const BookEvent = () => {
    const [date, setDate] = useState(new Date())
    const [luxonDate, setLuxonDate] = useState(null)
    const [meetingTimeList, setMeetingTimeList] = useState([])
    const [timeSelected, setTimeSelected] = useState(null)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [question, setQuestion] = useState('')
    // UPDATE 2 **********************************************************************
    const [rescheduleReason, setRescheduleReason] = useState('')
    const [teamEventUser, setTeamEventUser] = useState('')
    // UPDATE 2 END **********************************************************************
    const [submitLoading, setSubmitLoading] = useState(false)
    const [fetchEvent, setFetchEvent] = useState(true)

    const router = useRouter()

    const dispatch = useDispatch()
    const { event, eventLoading } = useSelector((store) => store.event)
    const { eventRes, calendarError, calendarMessage, meetingRes } = useSelector((store) => store.calendar)
    const { allTeamMembers } = useSelector(store => store.user)

    // UPDATE 2 **********************************************************************
    // setting the name, email and question state variables to pre-fill the form
    useEffect(() => {
        if(router.query.reschedule || router.query.scheduleAgain) {
            setName(router.query.name)
            setEmail(router.query.email)
            setQuestion(router.query.question)
        }
    }, [router.query.reschedule, router.query.scheduleAgain])

    // as soon as the event is fetched, check if the event is a team event, if it is, then fetch the team member details to calculate the round robin algorithm
    useEffect(() => {
        if(!router.query.reschedule && !router.query.scheduleAgain) {
            if(event && (event.eventType === 'Team Event') && (allTeamMembers.length === 0)) {
                dispatch(getAllTeamMembers(event.team))
                // if team is deleted, or is not found, then set the event owner as team user
                setTeamEventUser(event.user)
            }
    
            if(allTeamMembers.length > 0) {
                roundRobin(allTeamMembers)
            }
        }
    }, [event, allTeamMembers])

    // round robin algorithm to select the users based on their availability
    const roundRobin = (allMembersData) => {
        
        const calculateTotalHours = (allMembersData, currentEvent) => {
            let membersArr = []

            // iterating through each member
            allMembersData.forEach(member => {
                // variables declaration
                let minutesBooked = 0
    
                member.bookingDetails.forEach(booking => {
                    if(currentEvent) {
                        // check if the eventId matches with the current event
                        if (booking.eventDetails.eventId === event?._id) {
                            // to keep track of the number of hour booked for today
                            let todayHours = 0

                            // checking number of bookings for current date
                            booking.eventDetails.bookedHours.forEach(hour => {
                                if((DateTime.fromISO(hour).setZone(DateTime.now().zoneName) >= DateTime.now().startOf('day')) && (DateTime.fromISO(hour).setZone(DateTime.now().zoneName) <= DateTime.now().endOf('day'))) {
                                    todayHours += 1
                                }
                            })
                            
                            // if current event matches, then check the total number of minutes booked for this event
                            minutesBooked += (+booking.eventDetails.duration.split(' ')[0] * todayHours)
                            
                            // booking.eventDetails.bookedHours.forEach(meetingTime => {
                            //     if(DateTime.fromISO(meetingTime) >= DateTime.now().startOf('day')) {
                            //         // TODO - CHECK HOW FAR THE BOOKED EVENTS ARE FROM THE CURRENT EVENT
                                    
                            //     }
                            // })
                        }
                    } else {
                        // to keep track of the number of hour booked for today
                        let todayHours = 0

                        // checking number of bookings for current date
                        booking.eventDetails.bookedHours.forEach(hour => {
                            if((DateTime.fromISO(hour).setZone(DateTime.now().zoneName) >= DateTime.now().startOf('day')) && (DateTime.fromISO(hour).setZone(DateTime.now().zoneName) <= DateTime.now().endOf('day'))) {
                                todayHours += 1
                            }
                        })

                        minutesBooked += (+booking.eventDetails.duration.split(' ')[0] * todayHours)
                    }
                })

                // check the priority of the user and then recalculate the total minutes booked
                if(member.priority === 'high') {
                    // reduce the minuted booked by 25% so that despite high booking, this user will have chance to be booked again
                    minutesBooked = minutesBooked * 0.75
                } else if(member.priority === 'low') {
                    // increase the booking time be 25% to decrease the chance of booking
                    minutesBooked = minutesBooked * 1.25
                }
    
                membersArr.push({
                    ...member, 
                    totalMinutesBooked: minutesBooked
                })
            })

            // removing the users, who are most booked(minutes)
            // sorting in ascending order
            membersArr.sort((a, b) => (a.totalMinutesBooked - b.totalMinutesBooked))
            return membersArr.slice(0, Math.ceil(membersArr.length * 0.5))
        }

        const filteredListOne = calculateTotalHours(allMembersData, false)
        
        const filteredListTwo = calculateTotalHours(filteredListOne, true)

        setTeamEventUser(filteredListTwo[0].userId)
    }
    // UPDATE 2 END **********************************************************************

    // fetching events details based on eventId
    useEffect(() => {
        if(router.query.eventId) {
            dispatch(getEvent(router.query.eventId))
            setFetchEvent(false)
        }
    }, [router.query.eventId, fetchEvent])

    // disable the back button when form is submitting
    useEffect(() => {
        if(submitLoading) {
            document.getElementById('backButtonSVG').style.pointerEvents = 'none'
        } else  {
            document.getElementById('backButtonSVG')?.style.pointerEvents = 'auto'
        }
    }, [submitLoading])

    // generate meeting time list as soon as the user clicks on any date
    useEffect(() => {
        if(luxonDate) {
            const generateMeetingTime = () => {
                const currentDayMeetingHours = JSON.parse(event.meetingHours)[luxonDate.weekdayShort.toUpperCase()]
                const startTime = luxonDate.setZone(event.timeZone).set({day: luxonDate.day}).set({ hour: (currentDayMeetingHours.from.split(':')[1].slice(2) === 'am' ? currentDayMeetingHours.from.split(':')[0] : (currentDayMeetingHours.from.split(':')[0] === '12' ? currentDayMeetingHours.from.split(':')[0] : +currentDayMeetingHours.from.split(':')[0] + 12)) }).set({ minute: currentDayMeetingHours.from.split(':')[1].slice(0,2) }).setZone(Intl.DateTimeFormat().resolvedOptions().timeZone).set({day: luxonDate.day})

                const endTime = luxonDate.setZone(event.timeZone).set({day: luxonDate.day}).set({ hour: (currentDayMeetingHours.to.split(':')[1].slice(2) === 'am' ? currentDayMeetingHours.to.split(':')[0] : (currentDayMeetingHours.to.split(':')[0] === '12' ? currentDayMeetingHours.to.split(':')[0] : +currentDayMeetingHours.to.split(':')[0] + 12)) }).set({ minute: currentDayMeetingHours.to.split(':')[1].slice(0,2) }).setZone(Intl.DateTimeFormat().resolvedOptions().timeZone).set({day: luxonDate.day})
                // const startTime = luxonDate.set({ hour: (currentDayMeetingHours.from.split(':')[1].slice(2) === 'am' ? currentDayMeetingHours.from.split(':')[0] : (currentDayMeetingHours.from.split(':')[0] === '12' ? currentDayMeetingHours.from.split(':')[0] : +currentDayMeetingHours.from.split(':')[0] + 12)) }).set({ minute: currentDayMeetingHours.from.split(':')[1].slice(0,2) }).setZone(event.timeZone)

                // const endTime = luxonDate.set({ hour: (currentDayMeetingHours.to.split(':')[1].slice(2) === 'am' ? currentDayMeetingHours.to.split(':')[0] : (currentDayMeetingHours.to.split(':')[0] === '12' ? currentDayMeetingHours.to.split(':')[0] : +currentDayMeetingHours.to.split(':')[0] + 12)) }).set({ minute: currentDayMeetingHours.to.split(':')[1].slice(0,2) }).setZone(event.timeZone)
        
                const meetingHourList = []
                let updatedTime = startTime
                const formattedDuration = event.duration.split(' ')[0]
                while(updatedTime < endTime) {
                    if(DateTime.now() < updatedTime) {
                        // check if the event is already booked, then dont show that time slot
                        if(!event.bookedHours.includes(updatedTime.toISO())) {
                            meetingHourList.push(updatedTime)
                        }
                    }
                    updatedTime = updatedTime.plus({minute: formattedDuration})
                }
                setMeetingTimeList(meetingHourList);
            }
            
            generateMeetingTime()
        }
    }, [luxonDate, event])

    // toast message after success or failure
    useEffect(() => {
        if(eventRes) {
            showToastMessage('Event Booked Successfully', 'success')
            setName('')
            setEmail('')
            setQuestion('')
            setSubmitLoading(false)
            dispatch(reset())
            // UPDATE 1 ***********************************************
            if(event.onConfirmation === 'Display Mybookingcalendar confirmation page') {
                // redirect to the default page
                router.push({pathname: `/${router.query.username}/${router.query.eventId}/confirm`,
                query: {
                    userName: router.query.name ? router.query.name : (teamEventUser !== '' ? allTeamMembers.filter(mem => mem.userId === teamEventUser)[0].name : router.query.username),
                    eventName: event.name,
                    meetingStartTime: timeSelected.toLocaleString(DateTime.TIME_SIMPLE),
                    meetingEndTime: timeSelected.plus({ minute: event.duration.split(' ')[0] }).toLocaleString(DateTime.TIME_SIMPLE),
                    meetingDate: timeSelected.toLocaleString(DateTime.DATE_MED),
                    timeZone: timeSelected.offsetNameLong
                    }
                })
            } else {
                // redirect to the user defined link in the parent window
                // window.location.replace(event.redirectURL)
                window.top.location.href = event.redirectURL
                // window.top.location.replace(event.redirectURL)
            }
            // UPDATE 1 END ***********************************************
        }

        // if zoom meeting response is successful, then schedule the google calendar event
        if(meetingRes) {
            if(router.query.reschedule) {
                dispatch(rescheduleEvent({ name: name.trim(), email: email.trim(), question: question.trim(), start: timeSelected.toISO(), end: timeSelected.plus({minute: event.duration.split(' ')[0]}).toISO(), eventName: event.name, userId: router.query.userId, location: event.location, eventId: event._id, eventDescription: event.description, meetingLink: meetingRes.join_url, meetingPassword: meetingRes.password, rescheduleReason: rescheduleReason ? rescheduleReason : 'No reason specified', formerStart: router.query.formerStart, calendarEventId: router.query.calendarEventId }))
            } else {
                dispatch(createEvent({ name: name.trim(), email: email.trim(), question: question.trim(), start: timeSelected.toISO(), end: timeSelected.plus({minute: event.duration.split(' ')[0]}).toISO(), eventName: event.name, userId: router.query.scheduleAgain ? router.query.userId : (event.eventType === 'Team Event' ? teamEventUser : event.user), location: event.location, eventId: event._id, eventDescription: event.description, meetingLink: meetingRes.join_url, meetingPassword: meetingRes.password }))
            }
            dispatch(reset())
        }
        
        if(calendarError) {
            showToastMessage(calendarMessage, 'error')
            setSubmitLoading(false)
            dispatch(reset())
        }
    }, [eventRes, calendarError, meetingRes])

    if(!event && eventLoading) {
        return <Spinner />
    }

    const clickDayHandler = (value, event) => {
        setLuxonDate(DateTime.fromISO(value.toISOString()))
    }

    const meetingTimeClickHandler = (e, time) => {
        setTimeSelected(time);
        // applying default styling to all other list items
        let classNameIdx
        e.target.classList.forEach((el, index) => {
            if(el.match(/_bookEventTimeLi_/gi)) {
                classNameIdx = index
            }
        })
        document.querySelectorAll(`.${e.target.classList[classNameIdx]}`).forEach(item => {
            item.style.width = '100%'
            item.style.padding = '0.8rem 2rem'
            item.style.cursor = 'pointer'
            item.style.color = 'var(--green-color)'
            item.style.backgroundColor = 'unset'
            item.style.borderColor = 'var(--green-color)'
            item.classList.add('bookEventTimeLiHover')
            item.nextElementSibling.style.display = 'none'
        })

        e.target.style.width = '40%'
        e.target.style.padding = '0.5rem'
        e.target.style.cursor = 'default'
        e.target.style.color = '#fff'
        e.target.style.backgroundColor = '#999'
        e.target.style.borderColor = '#999'
        e.target.classList.remove('bookEventTimeLiHover')
        e.target.nextElementSibling.style.display = 'flex'
    }

    const confirmBtnHandler = () => {
        document.getElementById('bookEventFormWrapper').style.display = 'flex'
        document.getElementById('bookEventCalendarWrapper').style.display = 'none'
    }
    
    const backButtonHandler = () => {
        document.getElementById('bookEventFormWrapper').style.display = 'none'
        document.getElementById('bookEventCalendarWrapper').style.display = 'flex'
        setName('')
        setEmail('')
        setQuestion('')
        setFetchEvent(true)
    }

    const submitHandler = e => {
        e.preventDefault()

        // prevent double clicking the submit button
        if(submitLoading) {
            return
        }

        setSubmitLoading(true)

        if(name.trim() === '' || email.trim() === '') {
            showToastMessage('Invalid name or email', 'error')
            setSubmitLoading(false)
            return
        }

        if(event.location === 'Zoom') {
            dispatch(createZoomMeeting({
                eventName: event.name,
                email: email.trim(),
                start: timeSelected.toISO(),
                duration: event.duration.split(' ')[0],
                description: event.description,
                userId: router.query.userId ? router.query.userId : event.user
            }))

            return
        }

        // if the user is not yet selected in case of team event, then don't submit the form
        if((event.eventType === 'Team Event') && (teamEventUser === '') && (!router.query.reschedule) && !router.query.scheduleAgain) {
            showToastMessage('Please wait while we are selecting the user', 'error')
            return
        }

        // if reschedule is true, then make the update request else create a new event
        if(router.query.reschedule) {
            dispatch(rescheduleEvent({ name: name.trim(), email: email.trim(), question: question.trim(), start: timeSelected.toISO(), end: timeSelected.plus({minute: event.duration.split(' ')[0]}).toISO(), eventName: event.name, userId: router.query.userId, location: event.location, eventId: event._id, eventDescription: event.description, rescheduleReason: rescheduleReason ? rescheduleReason : 'No reason specified', formerStart: router.query.formerStart, calendarEventId: router.query.calendarEventId }))
        } else {
            dispatch(createEvent({ name: name.trim(), email: email.trim(), question: question.trim(), start: timeSelected.toISO(), end: timeSelected.plus({minute: event.duration.split(' ')[0]}).toISO(), eventName: event.name, userId: router.query.scheduleAgain ? router.query.userId : (event.eventType === 'Team Event' ? teamEventUser : event.user), location: event.location, eventId: event._id, eventDescription: event.description }))
        }
    }

  return (
    <section className={`m-1`}>
        <ToastMessage />
        <main id="bookEventCalendarWrapper" className={`container rounded d-flex ${styles.bookEventContainer}`}>

            {
                !event ? (
                    !fetchEvent ?
                    'Could not fetch the event. Please refresh the page.' : ''
                ) : (
                    <>
                        <div className={`p-2 flex-1 ${styles.bookEventLeft}`}>
                            <p className={`mb-03`}>{router.query.username}</p>
                            <h3 className={`mb-1`}>{event.name}</h3>
                            <p className={`mb-05 d-flex align-center`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-05 feather feather-clock"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                {event.duration}
                            </p>
                            {/* UPDATE 1 ***************************************************** */}
                            {/* https://github.com/tasti/react-linkify/issues/96#issuecomment-628472955 */}
                            <Linkify componentDecorator={(decoratedHref, decoratedText, key) => (
                                <a target="blank" style={{color: 'var(--pink-color)'}} href={decoratedHref} key={key}>
                                    {decoratedText}
                                </a>
                            )}>
                                <p className={`mb-03`}>{event.description}</p>
                            </Linkify>
                            {/* UPDATE 1 END ***************************************************** */}
                        </div>

                        <div className={`p-2 d-flex flex-column align-center flex-1 ${styles.bookEventCenter}`}>
                            <h2 className={`mb-1 ${styles.bookEventCalendarH2}`}>Select Date and Time</h2>
                            <Calendar className={`${styles.bookEventCalendar}`} onClickDay={clickDayHandler} onChange={setDate} value={date} minDate={DateTime.now().plus({day: 2}).toJSDate()} maxDate={DateTime.now().plus({day: +event.daysAdvance}).toJSDate()} showNeighboringMonth={false} tileDisabled={({ date }) => {
                                const disabledDays = Object.keys(JSON.parse(event.meetingHours)).map((day, index) => (
                                    JSON.parse(event.meetingHours)[day] === "Unavailable" ? index : null
                                ))

                                return (disabledDays.includes(date.getDay()))
                            }} />
                        </div>

                        {
                            luxonDate && !eventLoading && (
                                <div className={`p-2 ${styles.bookEventRight}`}>
                                    <span className={`mb-1 ${styles.bookEventRightDate}`}>
                                        {luxonDate.weekdayLong + ', ' + luxonDate.monthShort + ' ' + luxonDate.day}
                                    </span>
                                    <ul className={`text-center pr-2 ${styles.meetingHourUl}`}>
                                        {
                                            meetingTimeList.map((time, index) => (
                                                <div key={index} className={`mb-1 d-flex justify-evenly ${styles.bookEventTimeContainer}`}>
                                                    <li className={`rounded d-flex align-center justify-center ${styles.bookEventTimeLi}`} onClick={(e) => meetingTimeClickHandler(e, time)}>{time.toLocaleString(DateTime.TIME_SIMPLE)}</li>

                                                    <span className={`rounded c-pointer p-05 d-flex align-center justify-center ${styles.bookEventConfirmBtn}`} onClick={confirmBtnHandler}>Confirm</span>
                                                </div>
                                            ))
                                        }
                                    </ul>
                                </div>
                            )
                        }

                    </>
                )
            }

        </main>

        {
            event && timeSelected && (
                <>
                    <main id="bookEventFormWrapper" className={`container rounded d-flex ${styles.bookEventContainer} ${styles.bookEventLeftContainer}`}>
                        <div className={`p-2 ${styles.bookEventLeft}`}>
                            <svg id="backButtonSVG" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4db5aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mb-1 c-pointer feather feather-arrow-left-circle`} onClick={backButtonHandler}><circle cx="12" cy="12" r="10"></circle><polyline points="12 8 8 12 12 16"></polyline><line x1="16" y1="12" x2="8" y2="12"></line></svg>
            
                            <p className={`mb-03`}>{router.query.username}</p>
                            <h2 className={`mb-1`}>{event.name}</h2>
                            <p className={`mb-05 d-flex align-center`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-05 feather feather-clock"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                {event.duration}
                            </p>
                            <p className={`mb-1`}>{event.description}</p>
            
                            <div className={`d-flex align-center mb-05`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-05 feather feather-calendar"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                <span>
                                    {timeSelected.toLocaleString(DateTime.TIME_SIMPLE)}
                                    &nbsp;-&nbsp;
                                    {timeSelected.plus({minute: event.duration.split(' ')[0]}).toLocaleString(DateTime.TIME_SIMPLE)}
                                    ,&nbsp;
                                    {timeSelected.toLocaleString(DateTime.DATE_MED)}
                                </span>
                            </div>
            
                            <div className={`d-flex align-center mb-1`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-05 feather feather-globe"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            
                                <span>{timeSelected.offsetNameLong}</span>
                            </div>
                        </div>
                        <div className={`p-2 ${styles.bookEventFormRight}`}>
                            <h2 className={`mb-1`}>Enter Details</h2>

                            <form onSubmit={submitHandler}>
                                <input type="text" className={`mb-2 ${styles.bookEventInput}`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required/>

                                <input type="email" className={`mb-2 ${styles.bookEventInput}`} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required/>

                                <textarea className={`mb-2 ${styles.bookEventFormTextarea}`} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask any question"></textarea>

                                {/* UPDATE 2 *************************************************************** */}
                                {
                                    router.query.reschedule && (
                                        <>
                                            <textarea className={`mb-2 ${styles.bookEventFormTextarea}`} value={rescheduleReason} onChange={(e) => setRescheduleReason(e.target.value)} placeholder="Reason for reschedule"></textarea>
                                        </>
                                    )
                                }
                                {/* UPDATE 2 END *************************************************************** */}

                                <input type="submit" className={`p-05 rounded c-pointer ${styles.bookEventSubmitBtn}`} value={`${submitLoading ? 'Loading...' : 'Submit'}`} style={{pointerEvents: submitLoading ? 'none' : 'auto'}} />
                            </form>

                        </div>
                    </main>
                </>
            )
        }
    </section>
  )
}

export default BookEvent
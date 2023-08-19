import { useEffect, useState } from 'react'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import styles from '../../styles/ScheduledEvents.module.css'
import { eventReset, getEvent, getEvents, singleEventReset } from '../../features/event/eventSlice'
import { useDispatch, useSelector } from 'react-redux'
import { rescheduleEvent, reset } from '../../features/calendar/calendarSlice'
import Spinner from '../Spinner'
import ToastMessage, { showToastMessage } from '../ToastMessage'

const EventDetails = ({events, tabSelected}) => {
    const [filteredEvents, setFilteredEvents] = useState([])

    const [eventName, setEventName] = useState('')
    // UPDATE 2 *********************************************************
    const [eventDescription, setEventDescription] = useState('')
    const [rescheduleRREvent, setRescheduleRREvent] = useState(false)
    const [rescheduleRREventData, setRescheduleRREventData] = useState({})
    const [eventNotFound, setEventNotFound] = useState(false)
    // UPDATE 2 END *********************************************************
    const [clientName, setClientName] = useState('')
    const [eventTime, setEventTime] = useState('')
    const [calendarEventClicked, setCalendarEventClicked] = useState('')
    const [cancelMessage, setCancelMessage] = useState('')

    const router = useRouter()

    const dispatch = useDispatch()
    const { events: userEvents, event: userEvent, eventLoading } = useSelector(store => store.event)
    const { eventRes } = useSelector(store => store.calendar)
    const { user } = useSelector((store) => store.auth)

    // redirect if the user clicked on the reschedule/schedule invitee again button for round robin event
    useEffect(() => {
        if(!eventLoading && rescheduleRREvent && (Object.keys(rescheduleRREventData).length > 0) && userEvent && userEvent.length > 0) {
            if(rescheduleRREventData.buttonText === 'Reschedule') {
                router.push(`/${rescheduleRREventData.ownerUserName}/${userEvent[0]._id}?reschedule=true&name=${rescheduleRREventData.clientName}&email=${rescheduleRREventData.clientEmail}&question=${rescheduleRREventData.clientQuestion ? rescheduleRREventData.clientQuestion : ''}&formerStart=${rescheduleRREventData.formerStartTime}&calendarEventId=${rescheduleRREventData.calendarEventId}&userId=${rescheduleRREventData.userId}`)
                dispatch(singleEventReset())
            } else if(rescheduleRREventData.buttonText === 'Schedule Invitee Again') {
                router.push(`/${rescheduleRREventData.ownerUserName}/${userEvent[0]._id}?scheduleAgain=true&name=${rescheduleRREventData.clientName}&email=${rescheduleRREventData.clientEmail}&question=${rescheduleRREventData.clientQuestion ? rescheduleRREventData.clientQuestion : ''}&formerStart=${rescheduleRREventData.formerStartTime}&calendarEventId=${rescheduleRREventData.calendarEventId}&userId=${rescheduleRREventData.userId}`)
                dispatch(singleEventReset())
            }
        } else if(!eventLoading && rescheduleRREvent && (!userEvent || userEvent.length === 0)) {
            // this means that the event has been deleted
            setRescheduleRREvent(false)
            showToastMessage('This event has been deleted', 'error')
            dispatch(eventReset())
        }
    }, [rescheduleRREvent, eventLoading])

    // add event listener on the window object to close the event cancellation modal on outside click
    useEffect(() => {
        window.addEventListener('click', e => (e.target === document.getElementById('cancelModal')) ? (
        (document.getElementById('cancelModal').style.opacity = '2') && (document.getElementById('cancelModal').style.visibility = 'hidden') && (document.body.style.overflow = 'auto')
        ) : false)
    }, [])

    // fetching user created events for rescheduling
    useEffect(() => {
        dispatch(getEvents())
    }, [])

    // UPDATE 2 ***************************************************************************
    // resetting the eventRes in the case of event cancellation so that no error occurs at the booking page, as eventRes is set on cancelation and the booking page will try to redirect if eventRes is set
    useEffect(() => {
        if(eventRes) {
            dispatch(reset())
        }
    }, [eventRes])
    // UPDATE 2 END ***************************************************************************

    // filtering calendar event based on the platform which created it
    useEffect(() => {
        if(tabSelected === 'Upcoming') {
            // make sure that only the events created through mybookingcalendar.co which are yet to come are shown
            setFilteredEvents(events.filter(event => (event.description && event.description?.includes('Powered by Mybookingcalendar.co') && (DateTime.fromISO(event.start.dateTime) >= DateTime.now()) && (event.organizer.email === user.email) )))
        } else if(tabSelected === 'Past') {
            // make sure that only the events created through mybookingcalendar.co which have already happened are shown
            setFilteredEvents(events.filter(event => (event.description && event.description?.includes('Powered by Mybookingcalendar.co') && (DateTime.fromISO(event.start.dateTime) < DateTime.now())) && (event.organizer.email === user.email) ))
        }
    }, [tabSelected])



    // details button handler
    const showDetailsHandler = e => {
        // toggling the event details section
        e.currentTarget.parentElement.parentElement.nextElementSibling.classList.toggle('scheduledEventsDetailsShow')
        // toggling between chevron right and chevron down button
        for(let svgNode of e.currentTarget.children) {
            svgNode.classList.toggle('scheduledEventsDetailsBtnShow')
        }
    }

    // reschedule the event with a patch request or schedule again or cancel the event or edit the event
    const handleRescheduleBtn = (e, clickEvent) => {
        // extracting the event name from the event description
        // console.log(e.currentTarget.parentElement.parentElement.previousElementSibling.children[1].children[1].innerText.split(':')[1].trim())
        const eventName = e.description?.split('Event Description:')[0].trim().split(':')[1].trim()
        
        // extract the organizer/event owner's email id for using it as the unique username
        const ownerUserName = e.organizer.email.split('@')[0]
        
        // extract client's name, email id, question and former event start time to pre-fill into the booking form 
        const clientName = e.summary.split('and')[0].replace('Canceled: ', '').replace('Rescheduled: ', '').trim()
        const clientEmail = e.attendees?.filter(attendee => attendee.organizer !== true)[0]?.email
        const clientQuestion = e.description?.match(/Question: (.*)<br \/>/i) && e.description?.match(/Question: (.*)<br \/>/i)[1]
        const formerStartTime = e.start.dateTime.replace('+', '%2B')
        
        // search in the user events for the unique event name and then redirect the user to booking page
        const clickedEvent = userEvents.filter(usrEvnt => usrEvnt.name === eventName)

        if(clickedEvent.length === 0) {
            const desc = e.description.match(/Event Description: (.*)/i)[1]
            dispatch(getEvent(`eventName=${eventName.replaceAll('/', 'FORWARDSLASH')}&description=${desc.replaceAll('/', 'FORWARDSLASH')}`))
            setRescheduleRREvent(true)
            setRescheduleRREventData({
                ownerUserName,
                clientName,
                clientEmail,
                clientQuestion,
                formerStartTime,
                calendarEventId: e.id,
                userId: user.id,
                buttonText: clickEvent.currentTarget.innerText
            })

            // if first time clicked on reschedule button, then return
            if(!rescheduleRREvent) {
                return
            }
        }

        if(clickEvent.currentTarget.innerText === 'Reschedule') {
            router.push(`/${ownerUserName}/${clickedEvent.length > 0 ? clickedEvent[0]._id : userEvent[0]._id}?reschedule=true&name=${clientName}&email=${clientEmail}&question=${clientQuestion ? clientQuestion : ''}&formerStart=${formerStartTime}&calendarEventId=${e.id}&userId=${user.id}`)
        } else if(clickEvent.currentTarget.innerText === 'Schedule Invitee Again') {
            router.push(`/${ownerUserName}/${clickedEvent.length > 0 ? clickedEvent[0]._id : userEvent[0]._id}?scheduleAgain=true&name=${clientName}&email=${clientEmail}&question=${clientQuestion ? clientQuestion : ''}&formerStart=${formerStartTime}&calendarEventId=${e.id}&userId=${user.id}`)
        } else if(clickEvent.currentTarget.innerText === 'Edit Event Type') {
            router.push(`/edit-event?id=${clickedEvent[0]._id}`)
        }
    }

    // handle event cancellation button
    const handleCancelBtn = (event, clickEvent) => {
        const eventNam = event.description?.split('Event Description:')[0].trim().split(':')[1].trim()
        setEventName(eventNam)
        // UPDATE 2 **************************************************************************
        const desc = event.description.match(/Event Description: (.*)/i)[1]
        setEventDescription(desc)
        // checking if the event clicked is user's own event or not
        const eventMatched = userEvents.filter(evnt => evnt.name === eventNam)[0]
        if(!eventMatched) {
            // forward slash is treated as a new url path, thus creates error
            dispatch(getEvent(`eventName=${eventNam.replaceAll('/', 'FORWARDSLASH')}&description=${desc.replaceAll('/', 'FORWARDSLASH')}`))
            setEventNotFound(true)
        }
        // UPDATE 2 END **************************************************************************
        setClientName(event.summary?.split('and')[0].replace('Canceled: ', '').replace('Rescheduled: ', '').trim())
        setEventTime(
            `
                ${DateTime.fromISO(event.start.dateTime).toLocaleString(DateTime.TIME_SIMPLE)}
                -
                ${DateTime.fromISO(event.end.dateTime).toLocaleString(DateTime.TIME_SIMPLE)}
            `
        )
        setCalendarEventClicked(event)

        // setting the css peoperties of the modal to display it
        document.getElementById('cancelModal').style.visibility = 'visible'
        document.getElementById('cancelModal').style.opacity = '1'
        document.body.style.overflow = 'hidden'
    }
    
    // close the event cancellation modal
    const closeCancelModal = e => {
        if(e.target.innerText === "Yes, cancel") {

            if(eventNotFound && !eventLoading && (!userEvent || userEvent.length === 0)) {
                showToastMessage('Event not Found', 'error')
                dispatch(eventReset())
                return
            }

            // extracting data for sending to server
            const clientEmail = calendarEventClicked.attendees?.filter(attendee => attendee.organizer !== true)[0]?.email
            const clientQuestion = calendarEventClicked.description.match(/Question: (.*)<br \/>/i) && calendarEventClicked.description.match(/Question: (.*)<br \/>/i)[1]
            const startTime = calendarEventClicked.start.dateTime
            const endTime = calendarEventClicked.end.dateTime

            // filtering user event to populate values in rescheduleEvent function
            const event = userEvents.filter(evnt => evnt.name === eventName)[0]
            
            // dispatching the request to cancel the event
            dispatch(rescheduleEvent({ name: clientName, email: clientEmail, question: clientQuestion, start: startTime, end: endTime, eventName: eventName, userId: user.id, location: (event ? event.location : userEvent[0].location), eventId: (event ? event._id : userEvent[0]._id), eventDescription: (event ? event.description : userEvent[0].description), calendarEventId: calendarEventClicked.id, cancellationReason: cancelMessage ? cancelMessage : 'No reason specified' }))
        }

        // setting the css peoperties of the modal to hide it
        document.getElementById('cancelModal').style.opacity = '2'
        document.getElementById('cancelModal').style.visibility = 'hidden'
        document.body.style.overflow = 'auto'
    }

    // show the spinner if data is being fetched
    if(eventLoading && rescheduleRREvent) {
        return <Spinner />
    }
    
  return (
    <>
        <ToastMessage />
        {/* date and events wrapper */}
        <div>
            {
                (filteredEvents.length > 0)
                ?
                filteredEvents.map((event, index) => (
                    <div key={index}>
                        {
                            // make sure that only the events created through mybookingcalendar.co are shown
                            // (event.description && event.description.includes('Powered by Mybookingcalendar.co') && (DateTime.fromISO(event.start.dateTime) >= DateTime.now())) ? (
                                <>
                                    {/* date wrapper */}
                                    <div className={`p-1 px-2 ${styles.scheduledEventsDateContainer}`}>
                                        {
                                            DateTime.fromISO(event.start.dateTime).toLocaleString(DateTime.DATE_HUGE)
                                        }
                                        {
                                            (DateTime.fromISO(event.start.dateTime).day === DateTime.now().day) && (DateTime.fromISO(event.start.dateTime).month === DateTime.now().month) && (DateTime.fromISO(event.start.dateTime).year === DateTime.now().year) && (
                                                <span style={{fontWeight: '600'}} className='ml-1 fw-500'>
                                                    Today
                                                </span>
                                            )
                                        }
                                    </div>

                                    {/* events wrapper */}
                                    <div>
                                        {/* event summary */}
                                        <div className={`p-2 px-2 d-flex justify-between ${styles.scheduledEventsEventContainer}`}>
                                            {/* event timings */}
                                            <div style={{textDecoration: event.summary?.startsWith('Canceled:') ? 'line-through' : 'none'}} className={`${styles.scheduledEventsTimeContainer}`}>
                                                {
                                                    `
                                                        ${DateTime.fromISO(event.start.dateTime).toLocaleString(DateTime.TIME_SIMPLE)}
                                                        -
                                                        ${DateTime.fromISO(event.end.dateTime).toLocaleString(DateTime.TIME_SIMPLE)}
                                                    `
                                                }
                                            </div>

                                            {/* event brief details */}
                                            <div style={{position: 'relative'}} className={`${styles.scheduledEventsTimeContainer}`}>
                                                {/* client name */}
                                                <div className={`mb-05`} style={{color: '#555', fontWeight: '600', textDecoration: event.summary?.startsWith('Canceled:') ? 'line-through' : 'none'}}>
                                                    {
                                                        event.summary ? event.summary?.split('and')[0].replace('Canceled: ', '').replace('Rescheduled: ', '') : '(No title)'
                                                    }
                                                </div>
                                                {/* event title */}
                                                <div style={{textDecoration: event.summary?.startsWith('Canceled:') ? 'line-through' : 'none'}}>
                                                    {
                                                        event.description?.split('Event Description:')[0].trim()
                                                    }
                                                </div>
                                                {/* cancelation/reschedule message */}
                                                {
                                                    event.summary?.startsWith('Canceled:') || event.summary?.startsWith('Rescheduled:') ? (
                                                        <div>
                                                            {
                                                                event.summary?.startsWith('Canceled:') ? (
                                                                    <span style={{color:'var(--pink-color)', fontSize:'0.7rem'}}>Canceled by {event.summary?.split('and')[1].trim()}: {event.description?.match(/cancelled: (.*)<br \/>/i)[1]}</span>
                                                                    ) : (
                                                                    <span style={{color:'var(--pink-color)', fontSize:'0.7rem'}}>Rescheduled by {event.summary?.split('and')[1].trim()}: {event.description?.match(/rescheduled: (.*)<br \/>/i)[1]}</span>
                                                                )
                                                            }
                                                        </div>
                                                    ) : ('')
                                                }
                                            </div>

                                            {/* details button */}
                                            <div className={`${styles.scheduledEventsTimeContainer} ${styles.scheduledEventsTimeContainerBtn}`}>
                                                <span onClick={e => showDetailsHandler(e)} className={`c-pointer d-flex align-center ${styles.scheduledEventsTimeContainerBtnSpan}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" style={{position: 'absolute', left: '-1.5rem', visibility: 'hidden'}} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="scheduledEventsDetailsBtnShow feather feather-chevron-right"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                                    <svg xmlns="http://www.w3.org/2000/svg" style={{position: 'absolute', left: '-1.5rem', visibility: 'hidden'}} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                                    Details
                                                </span>
                                            </div>
                                        </div>

                                        {/* event details */}
                                        <div style={{display:'none'}} className={`p-2 px-2 d-flex ${styles.scheduledEventsEventContainer}`}>
                                            {/* edit event options/buttons wrapper */}
                                            <div className={`d-flex flex-column ${styles.scheduledEventsTimeContainer}`}>
                                                {/* edit buttons */}
                                                <span style={{display:(event.summary?.startsWith('Canceled: ') || (tabSelected === 'Past') || (DateTime.fromISO(event.start.dateTime) < DateTime.now())) ? 'none' : 'flex'}} onClick={e => handleRescheduleBtn(event, e)} className={`c-pointer d-flex align-center ${styles.scheduledEventsEditBtn}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-05 feather feather-refresh-cw"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                                                    Reschedule
                                                </span>
                                                <span style={{display:(event.summary?.startsWith('Canceled: ') || (tabSelected === 'Past') || (DateTime.fromISO(event.start.dateTime) < DateTime.now())) ? 'none' : 'flex'}} onClick={e => handleCancelBtn(event, e)} className={`c-pointer p-relative d-flex align-center ${styles.scheduledEventsEditBtn}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-05 feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                    Cancel
                                                    <span className={`p-absolute ${styles.scheduledEventsEditBorder}`}></span>
                                                </span>

                                                {/* edit event type and book again */}
                                                <div className={`d-flex flex-column`} style={{marginTop: '1.5rem'}}>
                                                    {
                                                        userEvents.filter(userEven => (userEven.name === event.description?.split('Event Description:')[0].trim().split('Event name: ')[1])).length > 0 ? (
                                                            <span onClick={e => handleRescheduleBtn(event, e)} className={`c-pointer d-flex align-center mb-1`}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-05 feather feather-edit"><path c-pointer ="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                                Edit Event Type
                                                            </span>
                                                        ) : ('')
                                                    }
                                                    <span onClick={e => handleRescheduleBtn(event, e)} className={`c-pointer d-flex align-center mb-1`}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-05 feather feather-repeat"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                                                        Schedule Invitee Again
                                                    </span>
                                                </div>
                                            </div>

                                            {/* event details content wrapper */}
                                            <div className={`d-flex flex-column ${styles.scheduledEventsTimeContainer}`}>
                                                <div className={`mb-1`}>
                                                    <span className={`d-block ${styles.scheduledEventsDetailsTitle}`}>
                                                        Email
                                                    </span>
                                                    <span>
                                                        {
                                                            event.attendees?.filter(attendee => attendee.organizer !== true)[0]?.email
                                                        }
                                                    </span>
                                                </div>
                                                <div className={`mb-1`}>
                                                    <span className={`d-block ${styles.scheduledEventsDetailsTitle}`}>
                                                        Location
                                                    </span>
                                                    <span>
                                                        {
                                                            event.location
                                                        }
                                                        <a style={{color: 'var(--pink-color)', marginLeft: '0.5rem'}} target='_blank' href={`${event.location === 'Zoom' ? event.description?.match(/(https?:\/\/[^ ]*)/g).filter(url => url.includes('zoom'))[0]?.replace('<br/>', '') : event.hangoutLink}`}>Join now</a>
                                                    </span>
                                                </div>
                                                <div className={`mb-1`}>
                                                    <span className={`d-block ${styles.scheduledEventsDetailsTitle}`}>
                                                        Invitee Time Zone
                                                    </span>
                                                    <span>
                                                        {
                                                            event.start.timeZone
                                                        }
                                                    </span>
                                                </div>
                                                <div className={`mb-1`}>
                                                    <span className={`d-block text-light`}>
                                                        created&nbsp; 
                                                        {
                                                            DateTime.fromISO(event.created).toLocaleString(DateTime.DATE_FULL)
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            // ) : ''
                        }
                    </div>
                ))
                // if there are no events to show, then show the appropriate message
                :
                (
                    <div className={`p-2 text-center`}>
                        No Events to show.
                    </div>
                )
            }

            {/* cancel event popup modal */}
            <div id="cancelModal" style={{ visibility:'hidden', transition: 'opacity .15s ease', opacity:'0.2', position: 'fixed', left:'0',right:'0',top:'0',bottom:'0',backgroundColor:'rgba(255,255,255,0.5)'}} className={`d-flex justify-center align-center`}>
                {/* modal wrapper */}
                <div style={{backgroundColor:'white', maxWidth:'100%', width:'30rem', border:'1px solid var(--secondary-color)', boxShadow:'0px 0px 7px 0px rgba(0,0,0,0.1)'}} className={`rounded p-2`}>
                    {/* top center text */}
                    <div style={{marginBottom: '1.5rem'}} className={`d-flex flex-column align-center`}>
                        <h3 style={{marginBottom: '1rem'}}>Cancel Event</h3>
                        {
                            <>
                                {/* event name */}
                                <p className={`mb-03`}>
                                    {
                                        eventName
                                    }
                                </p>
                                {/* client name */}
                                <p className={`mb-03`}>
                                    {
                                        clientName
                                    }
                                </p>
                                {/* event time */}
                                <p>
                                    {
                                        eventTime
                                    }
                                </p>
                            </>
                        }
                    </div>

                    {/* middle confirmation text */}
                    <p className={`mb-1`}>
                        Please confirm that you would like to cancel this event. A cancellation email will also go out to the invitee.
                    </p>

                    {/* text area for cancellation reason */}
                    <textarea value={cancelMessage} onChange={e => setCancelMessage(e.target.value)} style={{border:'1px solid var(--secondary-color)', font:'inherit', width:'100%', height:'5rem', resize:'none', marginBottom:'1.5rem'}} className={`rounded p-1 ${styles.cancelModalTextarea}`} placeholder="Add an optional message"></textarea>

                    {/* buttons container */}
                    <div style={{gap: '1rem'}} className={`d-flex`}>
                        <span onClick={e => closeCancelModal(e)} style={{width: '50%', textAlign:'center', cursor:'pointer', padding: '0.7rem 1.5rem', fontSize: '0.8rem', borderRadius: '50px', border: '1px solid var(--text-color)'}}>
                            No, don't cancel
                        </span>
                        <span onClick={e => closeCancelModal(e)} style={{width: '50%', textAlign:'center', cursor:'pointer', backgroundColor:'var(--green-color)', color:'#fff', padding: '0.7rem 1.5rem', fontSize: '0.8rem', borderRadius: '50px', border: '1px solid var(--green-color)'}}>
                            Yes, cancel
                        </span>
                    </div>
                </div>
            </div>

        </div>
    </>
  )
}

export default EventDetails
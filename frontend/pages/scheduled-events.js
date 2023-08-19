import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import ToastMessage, {showToastMessage} from '../components/ToastMessage'
import { getEvents, getEventsByDate, reset } from '../features/calendar/calendarSlice'
import styles from '../styles/ScheduledEvents.module.css'
import EventDetails from '../components/scheduledEvents/EventDetails'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css';
import { DateTime } from 'luxon'

const ScheduledEvents = () => {
    const [tabSelected, setTabSelected] = useState('Upcoming')

    const [calendarValue, setCalendarValue] = useState([new Date(), new Date()])

    const calendarRef = useRef()

    const dispatch = useDispatch()
    const router = useRouter()
    const { events, eventRes, calendarLoading, calendarError, calendarMessage } = useSelector((store) => store.calendar)
    const { user, isLoading } = useSelector((store) => store.auth)

    // fetch events after first render
    useEffect(() => {
        if(DateTime.fromJSDate(calendarValue[0]).hour === DateTime.fromJSDate(calendarValue[1]).hour) {
            dispatch(getEvents())
        } else {
            dispatch(getEventsByDate({from: DateTime.fromJSDate(calendarValue[0]).toISO().replace('+', '%2B'), to: DateTime.fromJSDate(calendarValue[1]).toISO().replace('+', '%2B')}))
        }
    }, [eventRes])

    // whenever calendar loading is set to true, then set the tab selected to 'Upcoming'
    useEffect(() => {
        setTabSelected('Upcoming')
    }, [calendarLoading])

    // if there is some error fetching data, then show the error
    useEffect(() => {
        if(calendarError && user) {
            showToastMessage(calendarMessage, 'error')
            dispatch(reset())
        }
    }, [calendarError])

    // if user is not logged in, then redirect to login page
    useEffect(() => {
        if(!user && !isLoading) {
            router.push('/login')
        }
    }, [user])

    if(calendarLoading) {
        return <Spinner />
    }

    // click handler for navigation buttons
    const navClickHandler = e => {
        // hide the calendar, if it is currently being shown in the UI
        calendarRef.current.style.visibility = 'hidden'

        // removing active class from all 'li' tags
        // e.target.parentElement.children.forEach(node => node.classList.remove('scheduledEventsActive'))
        for(let nodeEl of e.target.parentElement.children) {
            nodeEl.classList.remove('scheduledEventsActive')
        }

        // adding active class on the clicked 'li' element
        e.target.classList.add('scheduledEventsActive')

        setTabSelected(e.target.innerText)

        if(e.target.innerText === 'Date Range') {
            // show the calendar
            calendarRef.current.style.visibility = 'visible'
        }
    }

    // onclick handler for cancel and apply buttons on the calendar
    const calendarBtnHandler = e => {
        // hide the calendar if clicked on the cancel button
        if(e.target.innerText === 'Cancel') {
            calendarRef.current.style.visibility = 'hidden'
        } else {
            // fetching the calendar events based on the dates selected, encoding the '+' character so that it is not removed by browser
            dispatch(getEventsByDate({from: DateTime.fromJSDate(calendarValue[0]).toISO().replace('+', '%2B'), to: DateTime.fromJSDate(calendarValue[1]).toISO().replace('+', '%2B')}))
        }
    }

  return (
    <Layout>
        <ToastMessage />
        <div style={{minHeight: '72vh'}}>
            <section className={`container rounded ${styles.scheduledEventsWrapper}`}>
                {/* navigation menu */}
                <nav className={`${styles.scheduledEventsNavWrapper}`}>
                    <ul className={`d-flex p-relative`}>
                        <li onClick={e => navClickHandler(e)} className={`p-1 p-relative mr-05 c-pointer scheduledEventsActive ${styles.scheduledEventsNavLi}`}>
                            Upcoming
                            <span></span>
                        </li>
                        {/* <li onClick={e => navClickHandler(e)} className={`p-1 p-relative mr-05 c-pointer ${styles.scheduledEventsNavLi}`}>
                            Pending
                            <span></span>
                        </li> */}
                        <li onClick={e => navClickHandler(e)} className={`p-1 p-relative mr-05 c-pointer ${styles.scheduledEventsNavLi}`}>
                            Past
                            <span></span>
                        </li>
                        <li onClick={e => navClickHandler(e)} className={`p-1 p-relative mr-05 c-pointer ${styles.scheduledEventsNavLi}`}>
                            Date Range
                            <span></span>
                        </li>
                        <div style={{ zIndex: '100', top: '4rem', visibility:'hidden', backgroundColor: '#fff', border:'1px solid var(--secondary-color)'}} ref={calendarRef} className={`p-absolute rounded p-1 ${styles.scheduledEventsCalendarWrapper}`}>
                            <Calendar className={`${styles.reactCalendarWrapper}`} onChange={setCalendarValue} value={calendarValue} selectRange={true} />
                            <div style={{gap: '1rem'}} className={`d-flex justify-between p-1`}>
                                <span onClick={e => calendarBtnHandler(e)} style={{ width: '50%', textAlign: 'center', padding: '0.5rem 1.2rem', color: '#fff', border: '1px solid var(--green-color)', borderRadius: '50px', backgroundColor: 'var(--green-color)'}} className={`p-relative d-inline-block mt-1 c-pointer`}>Cancel</span>
                                <span onClick={e => calendarBtnHandler(e)} style={{ width: '50%', textAlign: 'center', padding: '0.5rem 1.2rem', color: '#fff', border: '1px solid var(--green-color)', borderRadius: '50px', backgroundColor: 'var(--green-color)'}} className={`p-relative d-inline-block mt-1 c-pointer`}>Apply</span>
                            </div>
                        </div>

                    </ul>
                </nav>

                <EventDetails events={events} tabSelected={tabSelected} />

                
            </section>

        </div>
    </Layout>
  )
}

export default ScheduledEvents
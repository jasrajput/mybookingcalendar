

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {DateTime} from 'luxon'
import { useDispatch, useSelector } from 'react-redux'
import Layout from '../../../components/Layout'
import Spinner from '../../../components/Spinner'
import { getAllTeamMembers } from '../../../features/user/userSlice'
import { getEventNames } from '../../../features/event/eventSlice'

const MyTeam = () => {
    const [userBookingHours, setUserBookingHours] = useState([])
    const [upcomingAppointmentsData, setUpcomingAppointmentsData] = useState([])

    const router = useRouter()
    const dispatch = useDispatch()

    const { allTeamMembers, userLoading } = useSelector(store => store.user)
    const { user, isLoading } = useSelector(store => store.auth)
    const { eventNames } = useSelector(store => store.event)

    useEffect(() => {
        if(router.query.teamId) {
            dispatch(getAllTeamMembers(router.query.teamId))
        }
    }, [router.query.teamId])

    // fetch the event names after filtering the upcoming events to show in the UI
    useEffect(() => {
        // if team members' data is fetched, then filter the upcoming events for each team member
        if(allTeamMembers.length > 0) {
            const userUpcomingAppointmentsData = calculateUpcomingAppointments(allTeamMembers)
            
            const eventIds = userUpcomingAppointmentsData.map(user => user.bookingData.map(appointment => appointment.eventId))
            
            if(eventIds.flat().length > 0) {
                setUpcomingAppointmentsData(userUpcomingAppointmentsData)
                dispatch(getEventNames(eventIds.flat()))
            }
        }
    }, [allTeamMembers])
    
    // if event names are fetched, then store the name of the event corresponding to its id
    useEffect(() => {
        if(eventNames.length > 0) {
            // making deep copy of the upcoming events data
            const upcomingAppointmentsDataCopy = JSON.parse(JSON.stringify(upcomingAppointmentsData))

            // store the name of the event by matching the eventId
            const updatedUpcomingAppointmentsData = upcomingAppointmentsDataCopy.map(user => {
                user.bookingData = user.bookingData.map(appointment => {
                    eventNames.forEach(eventData => {
                        // if event id is matched, then store the name of the event
                        if(eventData.eventId === appointment.eventId) {
                            appointment.eventName = eventData.eventName.name
                            appointment.duration = eventData.eventName.duration
                        }
                    })
                    return appointment
                })
                return user
            }).flat()

            setUpcomingAppointmentsData(updatedUpcomingAppointmentsData)
        }
    }, [eventNames]) 

    // calculate total time booked for each team member
    const calculateTotalBookedTime = allTeamMembers => {
        let userDetails = []
        allTeamMembers.forEach((member, index) => {
            let totalBookedMinutes = 0
            // check the booked hours for each booking
            member.bookingDetails.forEach(booking => {
                let bookedUnits = 0
                // check if the event exists or is deleted
                if(booking.eventDetails.duration !== '0') {
                    booking.eventDetails.bookedHours.forEach(hour => {
                        // check if the current booking is of current day or not
                        if((DateTime.fromISO(hour) >= DateTime.now().startOf('day')) && (DateTime.fromISO(hour) <= DateTime.now().endOf('day'))) {
                            bookedUnits += 1
                        }
                    })

                    totalBookedMinutes += (bookedUnits * +booking.eventDetails.duration.split(' ')[0])
                }
            })

            userDetails[index] = {
                userId: member.userId,
                totalTimeBooked: totalBookedMinutes
            }
        })

        return userDetails
    }

    // if the user is not logged in, then redirect to the login page 
    useEffect(() => {
        if(!user && !isLoading) {
            router.push('/login')
        }
    }, [user, isLoading])

    // if team members' data is fetched, then calculate their total booking hours
    if((allTeamMembers.length > 0) && userBookingHours.length === 0) {
        setUserBookingHours(calculateTotalBookedTime(allTeamMembers))
    }

    if((!user && isLoading) || userLoading) {
        return <Spinner />
    }

    const calculateUpcomingAppointments = (allTeamMembers) => {
        let userAppointmentData = []
        allTeamMembers.forEach(mem => {
            let upcomingAppointmentsData = []
            mem.bookingDetails.forEach(booking => {
                let upcomingAppointmentsHour = []
                booking.eventDetails.bookedHours.forEach(hour => {
                    // if there are bookings for today or later
                    if(DateTime.fromISO(hour) >= DateTime.now().startOf('day')) {
                        upcomingAppointmentsHour.push(hour)
                    }
                })
                // if upcomings bookings are found, then store them for display
                if(upcomingAppointmentsHour.length > 0) {
                    upcomingAppointmentsData.push({ eventId: booking.eventDetails.eventId, bookedHours: upcomingAppointmentsHour })
                }
            })

            // store the upcoming booking data for each user
            if(upcomingAppointmentsData.length > 0) {
                userAppointmentData.push({
                    userId: mem.userId,
                    bookingData: upcomingAppointmentsData
                })
            }
        })

        return userAppointmentData
    }

  return (
    <Layout>
        <section className={`container`}>
            <main style={{marginTop:'2rem', marginBottom:'2rem', display:'flex', flexDirection:'column', alignItems:'center', minHeight:'70vh', padding:'1rem'}}>
                {
                    allTeamMembers.length === 0 ? (
                        <>
                            Could not fetch team members. Please refresh the page.
                        </>
                    ) : (
                        <>
                            <h3 className={`text-center mb-1`}>{router.query?.teamName}</h3>
                            <h4 className={`mb-05`}>
                                Members:
                            </h4>
                            <ul>
                                {
                                    allTeamMembers.map((mem, idx) => (
                                        <li key={idx} className={`mb-2`}>
                                            <div style={{fontWeight:600}}>
                                                {mem.name}
                                            </div>
                                            {/* total hours booked */}
                                            <div>
                                                <span className={`text-light`}>
                                                    Total booked hours for Today:&nbsp;
                                                </span>
                                                <span style={{fontWeight:500}}>
                                                    {
                                                        userBookingHours.filter(usr => usr.userId === mem.userId)[0]?.totalTimeBooked
                                                    }
                                                    &nbsp;mins
                                                </span>
                                            </div>
                                            {/* priority */}
                                            <div>
                                                <span className='text-light'>
                                                    Priority:&nbsp;    
                                                </span>
                                                <span style={{fontWeight:500}}>
                                                    {mem.priority}
                                                </span>
                                            </div>
                                            {/* upcoming events */}
                                            <div className='mb-05'>
                                                <p className='text-light'>Upcoming Appointments:</p>
                                                <ul>
                                                    {
                                                        (upcomingAppointmentsData.length > 0) ? (
                                                            upcomingAppointmentsData.map((memb, idx) => {
                                                                if(memb.userId === mem.userId) {
                                                                    return (
                                                                        memb.bookingData.map((booking, indx) => (
                                                                            <li key={indx} style={{padding:'1rem', border:'1px solid #eaeaea', borderRadius:'0.5rem', marginTop:'0.5rem'}}>
                                                                                <div style={{display:'flex', flexDirection:'column'}}>
                                                                                    <p>
                                                                                        {booking.eventName}
                                                                                    </p>
                                                                                    <span style={{color:'#999', fontSize:'0.8rem'}}>
                                                                                        {booking.duration}
                                                                                    </span>
                                                                                </div>
                                                                                <div style={{display:'flex', gap:'0.3rem', marginTop:'0.5rem', flexWrap:'wrap'}}>
                                                                                {
                                                                                    booking.bookedHours.map((hour, index) => (
                                                                                        <span key={index} style={{padding:'0.5rem 1rem', borderRadius:'0.5rem', backgroundColor:'#eee', fontSize:'0.8rem'}}>
                                                                                            {
                                                                                                DateTime.fromISO(hour).toLocaleString({ month: 'short', day: 'numeric', hour:'numeric', minute:'2-digit' })
                                                                                            }
                                                                                        </span>
                                                                                    ))
                                                                                }
                                                                                </div>
                                                                            </li>
                                                                        ))
                                                                    )
                                                                } else {
                                                                    return (
                                                                        <span key={idx} style={{fontWeight:500, fontSize:'0.9rem'}}>
                                                                            No Appointments.
                                                                        </span>
                                                                    )
                                                                }
                                                            })
                                                        ) : (
                                                            <span style={{fontWeight:500, fontSize:'0.9rem'}}>
                                                                No Appointments.
                                                            </span>
                                                        )
                                                    }
                                                </ul>
                                            </div>
                                        </li>
                                    ))
                                }
                            </ul>
                        </>
                    )
                }
            </main>
        </section>
    </Layout>
  )
}

export default MyTeam
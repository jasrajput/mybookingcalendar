import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import styles from '../styles/MyEvents.module.css'
import Spinner from '../components/Spinner'
import { getEvents, eventReset, deleteEvent } from '../features/event/eventSlice'
import ToastMessage, { showToastMessage } from '../components/ToastMessage'
import Link from 'next/link'

const MyEvents = () => {

    const router = useRouter()

    const dispatch = useDispatch()
    const { events, eventError, eventSuccess, eventMessage } = useSelector((store) => store.event)
    const { user, isLoading } = useSelector((store) => store.auth)

    // if there is some error in fetching the events, then show the toast message
    useEffect(() => {
        if(eventError && user) {
            showToastMessage(eventMessage, 'error')
            setTimeout(() => {
                dispatch(eventReset())
            }, 2000)
        }
        // REVISION 1 *********************************************************
        if(eventSuccess) {
            dispatch(getEvents())
            showToastMessage(eventMessage, 'success')
            dispatch(eventReset())
        }
        // REVISION 1 END *********************************************************
    }, [eventError, eventSuccess])

    // fetch user events when the user is logged in
    useEffect(() => {
        if(user) {
            dispatch(getEvents())
        }
    }, [user])

    // if user is not logged in, then redirect to login page
    useEffect(() => {
        if(!user && !isLoading) {
            router.push('/login')
        }
    }, [user])

    // if user is not yet fetched, then show the spinner component  
    if(!user) {
        return <Spinner />
    }

    const copyTextHandler = (e) => {
        navigator.clipboard.writeText(`${window.location.origin}/${user.email.split('@')[0]}/${e._id}`)
        showToastMessage('Link copied', 'info')
    }

    const embedCodetHandler = (e) => {
        navigator.clipboard.writeText(`
            <iframe src="${window.location.origin}/${user.email.split('@')[0]}/${e._id}" style="border: 1px solid #eee;border-radius: 0.5rem;margin: 1rem 0" height="470rem" width="100%"></iframe>
        `)
        showToastMessage('Embed code copied', 'info')
    }

    // REVISION 1 ********************************************************
    const handleDeleteBtn = (event) => {
        dispatch(deleteEvent(event._id))
    }
    // REVISION 1 END ********************************************************

    // UPDATE 1 ********************************************************
    const handleEditBtn = (event) => {
        router.push(`/edit-event?id=${event._id}`)
    }
    // UPDATE 1 END ********************************************************

  return (
    <Layout>
        <ToastMessage />
        <section className={`container my-3 ${styles.myEventsWrapper}`}>
            <main className={`d-flex justify-center ${styles.myEventsContainer}`}>
                {
                    events.length === 0 ? (
                        'No events to show'
                    ) : (
                        events.map((event, index) => (
                            <div key={index} className={`shadow rounded p-1 m-1 d-flex flex-column justify-between ${styles.myEventsEventWrapper}`}>
                                {/* REVISION 1 ******************************************************** */}
                                <div className={`d-flex justify-between`}>
                                    <h5 className={`mb-1`} style={{width:'70%'}}>{event.name}</h5>
                                    <div>
                                        {/* UPDATE 1 ******************************************************** */}
                                        <svg onClick={() => handleEditBtn(event)} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 c-pointer feather feather-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        {/* UPDATE 1 END ******************************************************** */}

                                        <svg onClick={() => handleDeleteBtn(event)} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="c-pointer feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                    </div>
                                </div>
                                {/* REVISION 1 END ******************************************************** */}
                                <p className={`mb-05`}>{event.duration}</p>
                                <Link href={`/${user.email.split('@')[0]}/${event._id}`}>
                                    <a target="_blank" className={`pb-1 mb-1 d-block ${styles.myEventsLinks}`}>View Booking Page</a>
                                </Link>
    
                                <div className={`d-flex justify-between align-center ${styles.myEventCopy}`}>
                                    <span className={`c-pointer`} onClick={() => copyTextHandler(event)}>Copy link</span>
                                    <span className={`c-pointer`} onClick={() => embedCodetHandler(event)}>Copy Embed inline code</span>
                                </div>
                            </div>
                        ))
                    )
                }
            </main>
        </section>
    </Layout>
  )
}

export default MyEvents
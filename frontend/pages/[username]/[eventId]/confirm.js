import { useRouter } from 'next/router'
import styles from '../../../styles/BookEvent.module.css'

const Confirm = () => {

    const router = useRouter()
    
    const { userName, eventName, meetingStartTime, meetingEndTime, meetingDate, timeZone } = router.query

  return (
    <section className={`container mt-5 rounded ${styles.meetingConfirmWrapper}`}>
        <main className={`d-flex flex-column align-center px-15 pt-2 pb-10 ${styles.meetingConfirmMain}`}>
            <h2>Confirmed</h2>
            <p className={`mb-1`}>Your meeting is scheduled with {userName}</p>
            <hr className={`mb-1 ${styles.meetingConfirmHr}`}/>

            <div className={`${styles.meetingConfirmInfo}`}>
                <h3 className={`mb-05`}>{eventName}</h3>
                <div className={`d-flex align-center mb-05`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-05 feather feather-calendar"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>
                        {meetingStartTime}
                        &nbsp;-&nbsp;
                        {meetingEndTime}
                        ,&nbsp;
                        {meetingDate}
                    </span>
                </div>
                <div className={`d-flex align-center mb-1`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-05 feather feather-globe"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>

                    <span>{timeZone}</span>
                </div>
            </div>

            <h4>A calendar invitation has been sent to your email address.</h4>
            <hr className={`mt-1 ${styles.meetingConfirmHr}`}/>
        </main>
    </section>
  )
}

export default Confirm
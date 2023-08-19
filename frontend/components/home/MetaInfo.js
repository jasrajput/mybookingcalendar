

import styles from '../../styles/MetaInfo.module.css'

const MetaInfo = () => {
  return (
    <>
        {/* meta data about the application */}
        <section className={`d-flex justify-between container`}>
            {/* left section */}
            <div className={`w-40`}>
            <h3 className={`my-1`}>About this Calendar / Converter</h3>
            <p className={`mb-1 ${styles.homeMetaP}`}>
                My Booking Calendar (MBC) is a convenient world clock, a time zone converter, and an online meeting scheduler. It&apos;s one of the best online productivity tools for those often finding themselves traveling, in flights, in online meetings or just calling friends and family abroad.
            </p>
            <p className={`mb-1 ${styles.homeMetaP}`}>
                Carefully thought out design lets it effortlessly compare multiple time zones at a glance, plan conference calls, webinars, international phone calls and web meetings. It also aids with business travel and tracking of market hours.
            </p>
            <p className={`mb-1 ${styles.homeMetaP}`}>
                MBC was born out of frustration with existing world clock apps, online meeting and time conversion tools. Most of them have given up on providing quality business tools and on delighting their users.
            </p>
            </div>

            {/* right section */}
            <div className={`w-40`}>
                <h3 className={`my-1`}>Getting Started</h3>
                <hr />
                <ol>
                    <li className={`my-1 ${styles.homeMetaP}`}>ADD LOCATIONS (OR REMOVE, SET HOME, ORDER)</li>
                    <li className={`mb-1 ${styles.homeMetaP}`}>MOUSE OVER HOURS TO CONVERT TIME AT A GLANCE</li>
                    <li className={`mb-1 ${styles.homeMetaP}`}>CLICK HOUR TILES TO SCHEDULE AND SHARE</li>
                </ol>

                <hr />
                <h3 className={`my-1`}>Google API Limited Use Disclosure</h3>
                <p className={`mb-1 ${styles.homeMetaP}`}>
                mybookingcalendar's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes" target="_blank" style={{color: '#df8383'}}>
                Google API Services User Data Policy,</a> including the Limited Use requirements.
                </p>

            </div>
        </section>
    </>
  )
}

export default MetaInfo
import React from 'react'
import Layout from '../components/Layout'
import styles from '../styles/Home.module.css'

const Index = () => {
  return (
    <Layout>
        <div className={`container p-1 ${styles.indexContainer}`}>
            <p style={{marginBottom:'2rem', marginTop:'1rem'}}>
                mybookingcalendar (MBC) is your all in one scheduling, world clock software, and helpdesk ticket system.  MBC allows you to schedule meetings, without having to check your emails, calendar and Check any tickets you may have to get back to your clients, plus more Whole lot more!
            </p>

            <h2 style={{marginBottom:'0.3rem'}}>We make it easy to get started</h2>

            <h3 style={{marginBottom:'0.3rem'}}>Step1: Create a new Event</h3>
            <p style={{marginBottom:'1rem'}}>
                Create your coaching event with mybooking calendar 
                Let mybookingcalendar know your availability and you can add to your website or simply send a link to a client
            </p>

            <h3 style={{marginBottom:'0.3rem'}}>Step 2: Share Your Link</h3>
            <p style={{marginBottom:'1rem'}}>
                Share your links to clients or embed it on to your site
            </p>

            <h3 style={{marginBottom:'0.3rem'}}>Step 3: Get Booked</h3>
            <p style={{marginBottom:'3rem'}}>
                Your clients then pick a time in their time zone and in your time zone, so your available when you want to be
            </p>

            <h2 style={{marginBottom:'0.3rem'}}>Schedule Any type of meeting</h2>
            
            <h3 style={{marginBottom:'0.3rem'}}>One on one</h3>
            <p style={{marginBottom:'1rem'}}>
                Let your clients select open meeting types from your schedule
            </p>
            <h3 style={{marginBottom:'0.3rem'}}>Collective</h3>
            <p style={{marginBottom:'1rem'}}>
                Schedule across your team’s calendars for events you can co host with others
            </p>
            <h3 style={{marginBottom:'0.3rem'}}>Round Robin</h3>
            <p style={{marginBottom:'3rem'}}>
                Balance Hosting Responsibilities For Your Team Automatically
            </p>

            <h2 style={{marginBottom:'0.3rem'}}>Other Great Tools</h2>

            <h3 style={{marginBottom:'0.3rem'}}>Word Clock</h3>
            <p style={{marginBottom:'1rem'}}>Check the times your clients are located in to make booking calls easier </p>
            <h3 style={{marginBottom:'0.3rem'}}>HelpDesk System</h3>
            <p style={{marginBottom:'1rem'}}>Easy answer help desk support questions via a graphical user interface easily</p>

            <h2>Google API Limited Use Disclosure</h2>
            <p style={{marginBottom:'1rem'}}>
                Mybookingcalendar's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy?utm_source=devtools#additional_requirements_for_specific_api_scopes" style={{color:'#df8383'}} target="_blank">Google API Services User Data Policy</a>, including the Limited Use requirements.
            </p>
        </div>
    </Layout>
  )
}

export default Index
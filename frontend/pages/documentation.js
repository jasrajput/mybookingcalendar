import Layout from '../components/Layout'
import styles from '../styles/Documentation.module.css'

const Documentation = () => {
  return (
    <Layout>
        <section className={`container p-1 ${styles.documentationWrapper}`}>
            <h2 style={{marginBottom:'0.5rem'}}>Adding the App</h2>
            <ol style={{display:'flex',flexDirection:'column',gap:'0.5rem', marginBottom:'2rem'}}>
                <li>
                    After you log in, click on the integrations link in the navigation menu.
                </li>
                <li>
                    On the integrations page, you will see two integrations, first one is for google calendar and second is for zoom.
                </li>
                <li>
                    On the right side of the zoom integration box, you will see two buttons connect and disconnect.
                </li>
                <li>
                    If you are not already connected with the zoom, the connect button will be clickable otherwise it will be disabled(unclickable). Also, the text of the button will also change to "Connected", if you are already connected with the zoom.
                </li>
                <li>
                    The "Disconnect" button will be disabled if you are not already connected. Once, you are connected, the "Disconnect" button will be enabled(clickable).
                </li>
                <li>
                    In order to connect with zoom, you have to click on the "Connect" button, this will redirect you to zoom's website.
                </li>
                <li>
                    Here, you have to auhorize mybookingcalendar.co to access your meeting data.
                </li>
                <li>
                    Once you authorize the app, you will be redirected to mybookingcalendar's integration page. Now, you will see that the "Connect" button's text is changed to "Connected" and this button will be disabled now. On the other hand "Disconnect" button will be enabled now.
                </li>
            </ol>

            <h2 style={{marginBottom:'0.5rem'}}>App Usage</h2>
            <ol style={{display:'flex',flexDirection:'column',gap:'0.5rem', marginBottom:'2rem'}}>
                <h3 style={{marginBottom:'0.3rem'}}>How to create an event?</h3>
                <li>
                    Click on the Create Event link in the navigation menu.
                </li>
                <li>
                    On the new-event page, fill the form. 
                </li>
                <li>
                    Click 'Create Event' button at the bottom of the page.
                </li>
                <li>
                    A notification message will be shown on the top left side of the page, telling that the event has been created.
                </li>
                <li>
                    You can now go to the my-events page to see the newly created event.
                </li>
            </ol>

            <h3 style={{marginBottom:'0.3rem'}}>How to book an event?</h3>
            <ol style={{display:'flex',flexDirection:'column',gap:'0.5rem', marginBottom:'2rem'}}>
                <li>
                    Click on the my events page.
                </li>
                <li>
                    Here, you will see all the events that you have created. Click on the 'View Booking Page' link on the event for which you want to make the booking. You will be redirected to bookings page.
                </li>
                <li>
                    On the new page, select the date and the time for which you want to book the event.
                </li>
                <li>
                    Click on the confirm button where you have selected the time. You will be redirected to a new page containing the form.
                </li>
                <li>
                    Fill the details of the client that wants to book the event with you. Click on the 'Submit' button.
                </li>
                <li>
                    You will be redirected to confirmation page or the page you have selected while creating the event.
                </li>
                <li>
                    The event is now booked between you and your client. You can check the same in the google calendar.
                </li>
            </ol>

            <h3 style={{marginBottom:'0.3rem'}}>Embedding the book event page in my website</h3>
            <ol style={{display:'flex',flexDirection:'column',gap:'0.5rem', marginBottom:'2rem'}}>
                <li>
                    On the my-events page, click on the 'Copy Embed inline Code'.
                </li>
                <li>
                    Now, paste this copied code in the html on any page of your website.
                </li>
                <li>
                    You can see the booking page embedded in your website now.
                </li>
            </ol>

            <h3 style={{marginBottom:'0.3rem'}}>How to Edit/delete an event?</h3>
            <ol style={{display:'flex',flexDirection:'column',gap:'0.5rem', marginBottom:'2rem'}}>
                <li>
                    In the my-events page, you can see the cards of your events. 
                </li>
                <li>
                    On the top-right corner of the event card, you will see the edit(pencil icon) and delete(trash icon) buttons.
                </li>
                <li>
                    If you click on the delete button, the corresponding event will be deleted.
                </li>
                <li>
                    On clicking on the edit event button, you will be redirected to the edit-event page.
                </li>
                <li>
                    The edit-event page will be pre-filled.
                </li>
                <li>
                    You can make the changes in the form and click on the 'Update Event' button. 
                </li>
                <li>
                    You will get the success message and the event details will be updated.
                </li>
            </ol>

            <h3 style={{marginBottom:'0.3rem'}}>How check my scheduled events?</h3>
            <ol style={{display:'flex',flexDirection:'column',gap:'0.5rem', marginBottom:'2rem'}}>
                <li>
                    Click on the scheduled events link in the navbar.
                </li>
                <li>
                    Here, you will see a box with three(Upcoming, Past and Date Range) navigation tabs.
                </li>
                <li>
                    Upcoming tab will show you the booked events that are yet to happen.
                </li>
                <li>
                    Data in the past tab will show the past events.
                </li>
                <li>
                    On clicking on the Date Range tab, you will see a calendar. You can select the date range for which you want to see the booked events. 
                </li>
                <li>
                    Click on the apply button to fetch the events for the selected date range.
                </li>
            </ol>

            <h3 style={{marginBottom:'0.3rem'}}>Creating a team for team/round-robin event</h3>
            <ol style={{display:'flex',flexDirection:'column',gap:'0.5rem', marginBottom:'2rem'}}>
                <li>
                    On clicking the new-team link in the navigation menu, you will be redirected to the new page.
                </li>
                <li>
                    Fill in the team name
                </li>
                <li>
                    As you start typing in the team members input box, a list of all the users' names containing the letters typed will be shown.
                </li>
                <li>
                    Click on the user you want to select in the team. Similarly, you can add all the team members.
                </li>
                <li>
                    Click on the 'create' button and you will see the success message and the team will be created.
                </li>
                <li>
                    create button will only appear after you add atleast one team member.
                </li>
            </ol>

            <h3 style={{marginBottom:'0.3rem'}}>How to disconnect this app from my zoom account?</h3>
            <ol style={{display:'flex',flexDirection:'column',gap:'0.5rem', marginBottom:'2rem'}}>
                <li>
                    Login to your Zoom Account and navigate to the Zoom App Marketplace.
                </li>
                <li>
                    Click Manage, then Added Apps or search for the "My Booking Calendar" app.
                </li>
                <li>
                    Click the "My Booking Calendar" app.
                </li>
                <li>
                    Click Remove
                </li>
                <li>
                    Alternatively, you can remove the app from the integrations page as well.
                </li>
                <li>
                    Click on the 'Disconnect' button in the zoom integration box.
                </li>
                <li>
                    The app will be disconnected from your zoom account.
                </li>
            </ol>
        </section>
    </Layout>
  )
}

export default Documentation
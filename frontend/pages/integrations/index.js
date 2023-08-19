import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Layout from '../../components/Layout'
import styles from '../../styles/integrations.module.css'
import Spinner from '../../components/Spinner'
import ToastMessage, { showToastMessage } from '../../components/ToastMessage'
import { useRouter } from 'next/router'
import { checkUserLoggedIn, disconnectAccount, reset } from '../../features/auth/authSlice'

const Integrations = () => {

  const router = useRouter()
  const dispatch = useDispatch()

  const { user, isLoading, isSuccess, isError, message } = useSelector(store => store.auth)

  // REVISION 1 ************************************************************
  useEffect(() => {
    if(isSuccess) {
      showToastMessage(message, 'success')
      dispatch(checkUserLoggedIn())
      dispatch(reset())
    }
    if(isError) {
      showToastMessage(message, 'error')
      dispatch(reset())
    }
  }, [isSuccess, isError])
  // REVISION 1 END ************************************************************

  // if the user is not logged in, then redirect to the home page
  useEffect(() => {
    if(!user && !isLoading) {
      router.push('/')
    }
  }, [user, isLoading])

  // // if error in api integration, then show the toast message
  // useEffect(() => {
  //   if(router.query.api_integration_error) {
  //     showToastMessage(router.query.api_integration_error, 'error')
  //   }
  // }, [router.query.api_integration_error])

  // if successful in api integration, then fetch the user to update the user state
  useEffect(() => {
    if(router.query.success) {
      dispatch(checkUserLoggedIn())
    }
  }, [router.query.success])

  if(!user && isLoading) {
    return <Spinner />
  }

  const connectBtnHandler = e => {
    if(e.target.parentElement.attributes['data-service'].value === 'google') {
      window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, '_self')
    }

    if(e.target.parentElement.attributes['data-service'].value === 'zoom') {
      window.open(`${process.env.NEXT_PUBLIC_ZOOM_API_URL}`, "_self")
    }
  }

  // REVISION 1 **************************************************************
  const disconnectBtnHandler = e => {
    dispatch(disconnectAccount(e.target.parentElement.attributes['data-service'].value))
  }
  // REVISION 1 END ***********************************************************

  return (
    <Layout>
      <ToastMessage />
      {
        !user ? (
          <Spinner />
        ) : (
          <>
            <main className={`container my-2 p-1 ${styles.integrationsWrapper}`}>
                <section className={`py-2 px-2 d-flex mb-2 align-center rounded shadow ${styles.integrationsServices}`} data-service="google">
                  <div className={` mr-4 ${styles.integrationsLogoWrapper}`}>
                    <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_4055_7940)">
                        <path d="M38.1556 11.8423H11.8398V38.1581H38.1556V11.8423Z" fill="white"/>
                        <path d="M38.1602 49.9998L50.0023 38.1577H38.1602V49.9998Z" fill="#EA4335"/>
                        <path d="M50.0023 11.8423H38.1602V38.1581H50.0023V11.8423Z" fill="#FBBC04"/>
                        <path d="M38.1556 38.1577H11.8398V49.9998H38.1556V38.1577Z" fill="#34A853"/>
                        <path d="M0 38.1577V46.0525C0 48.2235 1.77632 49.9998 3.94737 49.9998H11.8421V38.1577H0Z" fill="#188038"/>
                        <path d="M50.0023 11.8421V3.94737C50.0023 1.77632 48.2259 0 46.0549 0H38.1602V11.8421H50.0023Z" fill="#1967D2"/>
                        <path d="M38.1579 0H3.94737C1.77632 0 0 1.77632 0 3.94737V38.1579H11.8421V11.8421H38.1579V0Z" fill="#4285F4"/>
                        <path d="M17.2367 32.2371C16.2499 31.5792 15.592 30.5923 15.1973 29.3423L17.4999 28.4213C17.6973 29.2108 18.092 29.8029 18.5525 30.2634C19.0788 30.7239 19.671 30.9213 20.3946 30.9213C21.1183 30.9213 21.7762 30.7239 22.3025 30.2634C22.8288 29.8029 23.092 29.2108 23.092 28.5529C23.092 27.8292 22.8288 27.2371 22.2367 26.7765C21.6446 26.316 20.9867 26.1187 20.1315 26.1187H18.8157V23.8818H19.9999C20.7236 23.8818 21.3157 23.6844 21.842 23.2897C22.3683 22.895 22.5657 22.3687 22.5657 21.645C22.5657 21.0529 22.3683 20.5265 21.9078 20.1976C21.4473 19.8029 20.921 19.6713 20.1973 19.6713C19.5394 19.6713 19.0131 19.8687 18.6183 20.1976C18.2236 20.5265 17.8946 20.9871 17.7631 21.5134L15.5262 20.5923C15.8552 19.7371 16.3815 19.0134 17.171 18.3555C17.9604 17.6976 19.0131 17.3687 20.2631 17.3687C21.1841 17.3687 22.0394 17.566 22.7631 17.895C23.4867 18.2239 24.0788 18.7502 24.4736 19.4081C24.8683 20.066 25.0657 20.7239 25.0657 21.5134C25.0657 22.3029 24.8683 23.0265 24.4736 23.5529C24.0788 24.0792 23.6183 24.5397 23.0262 24.8687V25.0002C23.7499 25.3292 24.4078 25.7897 24.8683 26.4476C25.3288 27.1055 25.592 27.8292 25.592 28.7502C25.592 29.6713 25.3946 30.4608 24.9341 31.1187C24.4736 31.7765 23.8815 32.3687 23.0262 32.7634C22.2367 33.1581 21.3157 33.3555 20.3288 33.3555C19.2762 33.2239 18.2236 32.895 17.2367 32.2371ZM31.2499 20.9213L28.7499 22.7634L27.4999 20.8555L31.9736 17.6318H33.6841V32.895H31.2499V20.9213Z" fill="#4285F4"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_4055_7940">
                          <rect width="50" height="50" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  <div className={`d-flex flex-column flex-1 ${styles.integrationsMeta}`}>
                    <p>Connected with</p>
                    <p>{user.email}</p>
                  </div>

                  <button onClick={(e) => connectBtnHandler(e)} className={`c-pointer mr-1 ${styles.integrationsConnectBtn}`} disabled={user.googleScopes?.toLowerCase().includes('calendar') ? true : false}>
                    {user.googleScopes?.toLowerCase().includes('calendar') ? 'Connected' : 'Connect'}
                  </button>

                  {/* REVISION 1 ************************************************************** */}
                  <button onClick={(e) => disconnectBtnHandler(e)} className={`c-pointer ${styles.integrationsConnectBtn}`} disabled={user.googleScopes?.toLowerCase().includes('calendar') ? false : true}>
                    Disconnect
                  </button>
                  {/* REVISION 1 END ************************************************************** */}
                </section>

                <section className={`py-2 px-2 mb-2 d-flex align-center rounded shadow ${styles.integrationsServices}`} data-service="zoom">
                  <div className={` mr-4 ${styles.integrationsLogoWrapper}`}>
                    <svg width="50" height="50" viewBox="23 23 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M48 74C62.3594 74 74 62.3594 74 48C74 33.6406 62.3594 22 48 22C33.6406 22 22 33.6406 22 48C22 62.3594 33.6406 74 48 74Z" fill="#E5E5E4"/>
                      <path d="M47.998 73.482C62.0724 73.482 73.482 62.0724 73.482 47.998C73.482 33.9235 62.0724 22.5139 47.998 22.5139C33.9235 22.5139 22.5139 33.9235 22.5139 47.998C22.5139 62.0724 33.9235 73.482 47.998 73.482Z" fill="white"/>
                      <path d="M48.0021 71.4448C60.9492 71.4448 71.4448 60.9492 71.4448 48.0021C71.4448 35.055 60.9492 24.5593 48.0021 24.5593C35.055 24.5593 24.5593 35.055 24.5593 48.0021C24.5593 60.9492 35.055 71.4448 48.0021 71.4448Z" fill="#4A8CFF"/>
                      <path d="M61.7626 40.1139L55.1338 44.9592V51.0507L61.7626 55.8959C62.2353 56.2611 62.7836 56.3686 62.7836 55.391V40.6189C62.7836 39.7488 62.3427 39.6413 61.7626 40.1139Z" fill="white"/>
                      <path d="M53.2967 56.1543C53.748 56.1543 54.1131 55.7891 54.1241 55.3379V44.3255C54.1131 41.8329 52.0828 39.824 49.5903 39.8344H33.5281C33.0768 39.8454 32.7117 40.1995 32.7007 40.6618V51.6632C32.7117 54.1558 34.742 56.1647 37.2345 56.1543H53.2967Z" fill="white"/>
                    </svg>

                  </div>
                  <div className={`d-flex flex-column flex-1 ${styles.integrationsMeta}`}>
                    <p>Connected with</p>
                    <p>{user.email}</p>
                  </div>

                  <button onClick={(e) => connectBtnHandler(e)} className={`c-pointer mr-1 ${styles.integrationsConnectBtn}`} disabled={user.zoomScopes?.toLowerCase().includes('meeting:write') ? true : false}>
                    {user.zoomScopes?.toLowerCase().includes('meeting:write') ? 'Connected' : 'Connect'}
                  </button>

                  {/* REVISION 1 ************************************************************** */}
                  <button onClick={(e) => disconnectBtnHandler(e)} className={`c-pointer ${styles.integrationsConnectBtn}`} disabled={user.zoomScopes?.toLowerCase().includes('meeting:write') ? false : true}>
                    Disconnect
                  </button>
                  {/* REVISION 1 END ************************************************************** */}
                </section>
            </main>
          </>
        )
      }
    </Layout>
  )
}

export default Integrations
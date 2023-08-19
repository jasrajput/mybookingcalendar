import Layout from '../../components/Layout'
import styles from '../../styles/MyEvents.module.css'
import ToastMessage, { showToastMessage } from '../../components/ToastMessage'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from '../../components/Spinner'
import { deleteTeam, getAllTeams, userReset } from '../../features/user/userSlice'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

const MyTeams = () => {

  const dispatch = useDispatch()
  const router = useRouter()

  const { user, isLoading } = useSelector((store) => store.auth)
  const { allTeams, userError, userSuccess, userMessage, userLoading } = useSelector(state => state.user)

  // if there is some error in fetching the teams, then show the toast message
  useEffect(() => {
    if(userError && user) {
        showToastMessage(userMessage, 'error')
        setTimeout(() => {
            dispatch(userReset())
        }, 2000)
    }
    // REVISION 1 *********************************************************
    if(userSuccess) {
        // refresh the list of teams
        dispatch(getAllTeams())
        showToastMessage(userMessage, 'success')
        dispatch(userReset())
    }
    // REVISION 1 END *********************************************************
}, [userError, userSuccess])

  // fetch user events when the user is logged in
  useEffect(() => {
    if(user) {
        dispatch(getAllTeams())
    }
  }, [user])

  // if user is not logged in, then redirect to login page
  useEffect(() => {
    if(!user && !isLoading) {
        router.push('/login')
    }
  }, [user])

  // if user is not yet fetched, then show the spinner component  
  if(!user || userLoading) {
      return <Spinner />
  }

  // delete the team on clicking the delete button
  const handleDeleteBtn = team => {
    dispatch(deleteTeam(team._id))
  }

  // redirect to the edit team page on clicking the edit button
  const handleEditBtn = team => {
    router.push(`/edit-team?teamName=${team.teamName}&teamId=${team._id}`)
  }

  // redirect to the single team page
  const teamClickHandler = (e, team) => {
    router.push(`/my-teams/${team._id}?teamName=${team.teamName}`)
  }

  return (
    <Layout>
      <ToastMessage />
      <section className={`container my-3 ${styles.myEventsWrapper}`}>
            <main className={`d-flex justify-center ${styles.myEventsContainer}`}>
              {
                allTeams.length === 0 ? (
                  'No teams to show'
                ) : (
                  allTeams.map((team, index) => (
                    <div key={index} className={`shadow rounded p-1 m-1 d-flex flex-column justify-between ${styles.myEventsEventWrapper}`}>
                      <div className={`d-flex justify-between`}>
                          <h5 className={`mb-1`} style={{width:'70%'}}>{team.teamName}</h5>
                          <div>
                              <svg onClick={() => handleEditBtn(team)} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 c-pointer feather feather-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>

                              <svg onClick={() => handleDeleteBtn(team)} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="c-pointer feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          </div>
                      </div>

                      <p style={{width:'fit-content'}} className={`mb-05 c-pointer text-light`} onClick={(e) => teamClickHandler(e, team)}>Members: <span style={{fontWeight:'500'}}>{team.teamMembers.length}</span></p>
                    </div>
                  ))
                )
              }
            </main>
      </section>
    </Layout>
  )
}

export default MyTeams
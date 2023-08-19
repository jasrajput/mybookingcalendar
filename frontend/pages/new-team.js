
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import ToastMessage, { showToastMessage } from '../components/ToastMessage'
import { getAllUsers, createNewTeam, userReset } from '../features/user/userSlice'
import styles from '../styles/NewTeam.module.css'

const NewTeam = () => {
    const [teamName, setTeamName] = useState('')
    const [teamMemberName, setTeamMemberName] = useState('')
    const [filteredResults, setFilteredResults] = useState([])
    const [teamMembers, setTeamMembers] = useState([])
    const [priorityVal, setPriorityVal] = useState([])

    const router = useRouter()
    const dispatch = useDispatch()
    const { allUsers, userLoading, userError, userSuccess, userMessage } = useSelector(store => store.user)
    const { user, isLoading } = useSelector(store => store.auth)

    // fetch the data after loading the component
    useEffect(() => {
        // fetch all the users from the database
        dispatch(getAllUsers())
    }, [])

    // redirect to login page if the user is not logged in
    useEffect(() => {
        if(!user && !isLoading) {
            router.push('/login?from=new-team')
        }
    }, [user, isLoading])

    // show the appropriate message, when the team is created or an error is generated
    useEffect(() => {
        if(userError && user && userMessage) {
            showToastMessage(userMessage, 'error')
            dispatch(userReset())
        } else if(userSuccess && user && userMessage) {
            showToastMessage(userMessage, 'success')
            // set all the fields to empty
            setTeamName('')
            setTeamMemberName('')
            setTeamMembers([])
            setPriorityVal([])
            dispatch(userReset())
        }
    }, [userError, userSuccess, userMessage])

    // remove the filteredResultsContainer on outside click
    useEffect(() => {
        window.addEventListener('click', e => {
            if(e.target === document.getElementById('filteredResultsContainer')) {
                return
            } else {
                document.getElementById('filteredResultsContainer')?.style.display = 'none'
            }
        })
    }, [])

    // as the user types in, then start searching the allUsers List and add the filtered results to the local state variable
    useEffect(() => {
        if(teamMemberName.length > 2) {
            document.getElementById('filteredResultsContainer')?.style.display = 'flex'
            setFilteredResults(allUsers.filter(user => ((user.name.toLowerCase().includes(teamMemberName.toLowerCase()) || user.email.includes(teamMemberName)) && user.googleScopes?.toLowerCase().includes('calendar'))))
        } else {
            setFilteredResults([])
        }
    }, [teamMemberName])

    // show the loading screen when data is being fetched
    if(userLoading || isLoading || !user) {
        return <Spinner />
    }

    // add team member to component's local state on clicking on the team member's name
    const addTeamMember = user => {
        setTeamMembers(prevState => [...prevState, user])
    }

    // remove team member onclicking the remove button
    const removeMember = member => {
        // filtering out the member on which remove button is clicked
        setTeamMembers(prev => prev.filter(el => el.email !== member.email))
        // removing the user from the priority value state
        setPriorityVal(prev => prev.filter(el => el.userId !== member._id))
    }

    // create new team by making request to API
    const createNewTeamHandler = e => {

        // check if the team name is empty
        if(teamName.trim() === '') {
            showToastMessage('Team name cannot be empty', 'error')
            return
        } else if(teamName.trim().length < 3) {
            showToastMessage('Team name should be 3 characters or more', 'error')
            return
        }

        // storing userIds of all the users for which the priority has been set/clicked
        const priorityArrUserIds = priorityVal.map(val => val.userId)
        dispatch(createNewTeam({teamName, teamMembers: teamMembers.map(mem => mem._id), teamOwner: user.id, priorityVal: teamMembers.map(mem => {
            // checking if this team member's priority has been set/clicked
            if(priorityArrUserIds.includes(mem._id)) {
                return priorityVal.filter(obj => obj.userId === mem._id)[0]
                // if priority is not set/clicked, then return this user's id and default priority value
            } else {
                return {
                    userId: mem._id,
                    priorityVal: 'auto'
                }
            }
        }) }))
    }

    // change the classes in the DOM and set the priority state
    const handlePrioritySelection = (e, member) => {
        if(e.target.innerText !== 'Remove') {
            setPriorityVal(prev => {
                if(prev.length === 0) {
                    return [{ userId: member._id, priorityVal: e.target.innerText }]
                }

                const filteredResult = prev.filter(obj => obj.userId !== member._id)

                return [...filteredResult, { userId: member._id, priorityVal: e.target.innerText }]
            })

            // removing active class from all priority buttons and adding the active class to the selected one
            for(let node of e.currentTarget.children) {
                node.classList.remove('priorityActive')
            }
            e.target.classList.add('priorityActive')
        }
    }

  return (
    <Layout>
        <ToastMessage />
        {/* only load the form when the user data is available otherwise show the message */}
        {
            (allUsers.length > 0) ? (
                <div style={{minHeight: '80vh'}} className={`container p-1 d-flex justify-center mb-1`}>
                    <div className={`mt-1 ${styles.newTeamFormContainer}`}>
                        <div className={`mb-1 d-flex flex-column`}>
                            <label>Team Name</label>
                            <input type="text" className={`rounded p-1 ${styles.newTeamInput}`} minLength='3' placeholder="Enter team name" value={teamName} onChange={e => setTeamName(e.target.value)}/>
                        </div>
                        <div className={`mb-1 d-flex flex-column p-relative`}>
                            <label>Team Members</label>
                            <input type="text" className={`rounded p-1 ${styles.newTeamInput}`} placeholder="Enter team member's name" value={teamMemberName} onChange={e => setTeamMemberName(e.target.value)}/>
                            {/* drop down list of filtered users */}
                            {
                                (filteredResults.length > 0) ? (
                                    <ul id="filteredResultsContainer" style={{bottom:`calc(-2.8rem - ${Math.min((filteredResults.length - 1) * 40, 5*40)}px)`, left:'0', backgroundColor:'#fff', maxHeight: '15rem', border:'1px solid var(--secondary-color)', width: '100%', overflowX:'hidden', whiteSpace: 'nowrap'}} className={`d-flex flex-column p-absolute rounded`}>
                                    {
                                        filteredResults.map((user, index) => (
                                            <li onClick={e => addTeamMember(user)} key={index} className={`c-pointer p-05 pl-1 ${styles.newTeamFilteredListWrapper}`}>
                                                {
                                                    `${user.name} (${user.email})`
                                                }
                                            </li>
                                        ))
                                    }
                                    </ul>
                                ) : ''
                            }
                        </div>

                        {/* team members' list */}
                        {
                            (teamMembers.length > 0) ? (
                                <>
                                    {
                                        teamMembers.map((member, index) => (
                                            <div key={member._id} style={{marginTop: '0.5rem', borderBottom: '1px solid var(--secondary-color)'}} className={`d-flex align-center pb-05`}>
                                                <span style={{width:'1rem', height:'1rem', border:'1px solid var(--secondary-color)', borderRadius:'50%', padding:'1.5rem', marginRight: '0.7rem', backgroundColor:'#fff'}} className={`d-flex align-center justify-center`}>
                                                    {
                                                        member.name.charAt(0).toUpperCase()
                                                    }
                                                </span>
                                                <span style={{overflow:'hidden'}} className={`d-flex flex-column`}>
                                                    <span className={`mb-03 mt-1`}>
                                                        {member.name} ({member.email})
                                                    </span>
                                                    <div onClick={e => handlePrioritySelection(e, member)}>
                                                        <span onClick={e => removeMember(member)} style={{color:'var(--green-color)', width: 'fit-content'}} className={`text-small3 c-pointer`}>
                                                            Remove
                                                        </span>
                                                        <span className={`priorityActive`} style={{padding:'0.05rem 0.4rem', cursor:'pointer', border:'1px solid #eee', borderRadius:'8px', backgroundColor:'var(--secondary-color)', fontSize:'0.8rem', marginLeft:'0.5rem'}}>
                                                            auto
                                                        </span>
                                                        <span style={{padding:'0.05rem 0.4rem', cursor:'pointer', border:'1px solid #eee', borderRadius:'8px', backgroundColor:'var(--secondary-color)', fontSize:'0.8rem', marginLeft:'0.5rem'}}>
                                                            low
                                                        </span>
                                                        <span style={{padding:'0.05rem 0.4rem', cursor:'pointer', border:'1px solid #eee', borderRadius:'8px', backgroundColor:'var(--secondary-color)', fontSize:'0.8rem', marginLeft:'0.5rem'}}>
                                                            high
                                                        </span>
                                                    </div>
                                                </span>

                                            </div>
                                        ))
                                    }
                                    {/* create or cancel button */}
                                    <div style={{gap:'1rem', marginTop:'1.5rem'}} className={`d-flex`}>
                                        <span onClick={e => createNewTeamHandler()} style={{borderRadius:'50px', padding:'0.5rem 1.4rem', color:'#fff', backgroundColor:'var(--green-color)'}} className={`c-pointer`}>
                                            Create
                                        </span>
                                        <span onClick={e => {
                                            setTeamMembers([])
                                            setPriorityVal([])
                                        }} style={{borderRadius:'50px', border:'1px solid var(--secondary-color)', padding:'0.5rem 1.4rem'}} className={`c-pointer`}>
                                            Cancel
                                        </span>
                                    </div>
                                </>
                            ) : ('No team members added')
                        }
                    </div>
                </div>
            ) : (
                <>
                    <span>No Users Available</span>
                </>
            )
        }
    </Layout>
  )
}

export default NewTeam
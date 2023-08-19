import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Spinner from '../../components/Spinner'
import Layout from '../../components/Layout'
import ToastMessage, { showToastMessage } from '../../components/ToastMessage'
import { useDispatch, useSelector } from 'react-redux'
import { getTokens, reset } from '../../features/auth/authSlice'

const Redirect = () => {
    const router = useRouter()
    const dispatch = useDispatch()
    const { user, isLoading, isSuccess, isError } = useSelector(store => store.auth)

    // if there is error or success message, then show the toast and redirect
    useEffect(() => {
        if(isSuccess) {
            dispatch(reset())
            router.push(`/integrations?success=true`)
        }
        if(isError) {
            dispatch(reset())
            router.push(`/integrations`)
        }
    }, [isSuccess, isError])

    // if router is initialized with the code in the query params, then make the request to backend to fetch the zoom API access and refresh tokens
    useEffect(() => {
        if(router.query.code) {
            dispatch(getTokens(router.query.code))
        }
    }, [router.query.code])


    // if the user is not logged in, then redirect to the homepage
    useEffect(() => {
        if(!user && !isLoading) {
            router.push('/')
        }
    }, [user, isLoading])

  return (
    <Layout>
        <ToastMessage />
        <div style={{minHeight: '84vh'}}></div>
        <Spinner />
    </Layout>
  )
}

export default Redirect
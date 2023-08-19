 import { store } from '../store/store'
import { Provider, useDispatch } from 'react-redux'
import '../styles/globals.css'
import { useEffect } from 'react'
import { checkUserLoggedIn } from '../features/auth/authSlice'

const CheckUser = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(checkUserLoggedIn())
  }, [])
  return <></>
}

function MyApp({ Component, pageProps }) {
  return <>
    <Provider store={store}>
      <CheckUser />
      <Component {...pageProps} />
    </Provider>
  </> 
}

export default MyApp

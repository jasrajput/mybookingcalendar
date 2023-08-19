import { useState, useEffect } from 'react'
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/dist/client/link';
import { register, reset } from '../features/auth/authSlice';
import Layout from "../components/Layout";
import ToastMessage, {showToastMessage} from '../components/ToastMessage';

export default function SignupPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [cpassword, setCpassword] = useState('')

    const router = useRouter()

    const dispatch = useDispatch()

    const {user, isLoading, isError, message} = useSelector(store => store.auth)

    // flash effect on clicking button
    useEffect(() => {
        const flashEffect = () => {
            document.getElementById('flashBtn')?.addEventListener('click', (e) => {
                e.target.classList.add('flashEffect')
                setTimeout(() => {
                    e.target.classList.remove('flashEffect')
                }, 100)
            })
        }

        // initially, there can be isLoading and form button element is not rendered in the DOM
        if(!isLoading) {
            flashEffect()
        }
    }, [isLoading])

    useEffect(() => {
        if(isError){
            showToastMessage(message, 'error')
            dispatch(reset())
        }
    }, [isError])

    if(user){
        router.push('/')
        return <></>
    }

    const googleLoginHandler = async (e) => {
        e.preventDefault()

        window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, '_self')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if(name.trim() === ''){
            showToastMessage('Name field cannot be empty', 'error')
            return
        }
        else if(email.trim() === ''){
            showToastMessage('Email field cannot be empty', 'error')
            return
        }else if(password.trim() === ''){
            showToastMessage('Password cannot be empty', 'error')
            return
        }

        if(password !== cpassword){
            showToastMessage('passwords do not match', 'error')
            return
        }
        dispatch(register({name, email, password}))
    }

    return (
        <Layout>
            <ToastMessage />
            <div className="loginForm_wrapper container">
                <div className="loginForm_container">
                    {
                        isLoading ? (
                            <>
                                    <h1 className='animate_bg animate_bg_text'>&nbsp;</h1>
                                    <form>
                                        <p className='animate_bg animate_bg_text p-1rem mb-1rem'>&nbsp;</p>

                                        <p className='animate_bg animate_bg_text p-1rem mb-1rem'>&nbsp;</p>

                                        <p className='animate_bg animate_bg_text p-1rem mb-1rem'>&nbsp;</p>

                                        <p className='animate_bg animate_bg_text p-1rem mb-1rem'>&nbsp;</p>

                                        <p className='animate_bg animate_bg_text w-100 p-1rem mb-1rem'>&nbsp;</p>
                                    </form>
                            </>
                        ) : (
                            <>
                                <h1>Sign Up</h1>
                                <form onSubmit={handleSubmit}>
                                    <button className="googleLoginBtn" onClick={googleLoginHandler}>
                                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="LgbsSe-Bz112c"><g><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></g></svg>
                                        <span className="googleLoginBtnText">Sign Up with Google</span>
                                    </button>
                                    <hr className="loginFormHr" style={{ marginBottom: '2rem' }} />

                                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Username" required/>

                                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required/>

                                    <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required/>

                                    <input type="password" id="cpassword" value={cpassword} onChange={e => setCpassword(e.target.value)} placeholder="Confirm password" required/>

                                    <input id="flashBtn" type="submit" value="Register" />
                                </form>
                            </>
                        )
                    }
                        

                    {
                        isLoading ? (
                            <p className='animate_bg animate_bg_text'>&nbsp;</p>
                        ) : (
                            <p>
                                Already have an account? <Link href='/login'>
                                    <a>
                                        &nbsp;Login
                                    </a>
                                </Link>
                            </p>
                        )
                    }
                </div>
            </div>
        </Layout>
    )
}

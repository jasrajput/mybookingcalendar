import styles from '../../styles/MainNav.module.css'

const MainNav = ({ date, dateActive, nativeDate, setDate, nextBtn }) => {

    // set next or previous date depending on the date selected by the user
    const handleDateChange = () => {
        if(nextBtn === true) {
            setDate(new Date(nativeDate.setDate(nativeDate.getDate() + 1)))
        } else if(nextBtn === false) {
            setDate(new Date(nativeDate.setDate(nativeDate.getDate() - 1)))
        } else {
            return
        }
    }
  return (
    <>
        <li className={`mr-02 rounded text-center ${styles.mainNavLi}`}>
            <span onClick={handleDateChange} className={`p-05 d-block cursor-pointer ${(dateActive.day === date) ? `${styles.mainNavActive} rounded` : ''}`}>
                {
                    dateActive.day === date ? (dateActive.monthShort + ' ' + date) : ('' + date)
                }
            </span>
        </li>
    </>
  )
}

export default MainNav
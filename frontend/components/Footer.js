import Link from 'next/link'
import styles from '../styles/Footer.module.css'

const Footer = () => {
  return (
    <footer className={`container p-1 text-center ${styles.footerWrapper}`}>
      <div className={`mb-1 ${styles.footerDiv}`}>
        <Link href="/privacy">
          <a style={{color:'var(--green-color)'}}>Privacy Policy &nbsp;</a>
        </Link>
        |
        <Link href="/terms">
          <a style={{color:'var(--green-color)'}}>&nbsp; Terms and Conditions</a>
        </Link>
      </div>

      <div className={`mb-1 ${styles.footerDiv}`}>
        <span>
          &copy; 2022 Anthony Rousek &nbsp;|
        </span>
        <span>
          &nbsp; AJR MARKETING 903/50 Clarence Street, Sydney NSW 2000, Australia
        </span>
      </div>

      <div>
        Phone +61436375984&nbsp; |&nbsp; <a href="mailto:support@mybookingcalendar.co" style={{color:'var(--green-color)'}}>support@mybookingcalendar.co</a>
      </div>
    </footer>
  )
}

export default Footer
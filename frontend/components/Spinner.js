import styles from '../styles/Spinner.module.css'

function Spinner() {
    return (
      <div className={`${styles.loadingSpinnerContainer}`}>
        <div className={`${styles.loadingSpinner}`}></div>
      </div>
    )
  }
  
  export default Spinner
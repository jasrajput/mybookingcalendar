import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { DateTime } from 'luxon'
import { setTimeZonesToShow } from '../../features/timeZone/timeZoneSlice'
import styles from '../../styles/MainSearchResults.module.css'

const SearchResults = ({ results, setResults, setSearchTerm }) => {

  const dispatch = useDispatch()

  // remove the search results if the user clicks anywhere
  useEffect(() => {
    const removeSearchResults = (e) => {
      setResults([])
    }

    window.addEventListener('click', removeSearchResults)
  }, [])

  if(results.length === 0) {
    return <></>
  }

  // show the selected timezone in the UI and clear the search box
  const selectTimeZone = (timeZone) => {
    dispatch(setTimeZonesToShow(timeZone))
    setSearchTerm('')
  }

  return (
    <div className={`p-absolute p-05 rounded ${styles.mainSearchResultsWrapper}`}>
        <h6 className={`mb-03 ${styles.mainSearchResultsh6}`}>{results.length} Results</h6>
        <hr className='mb-03' />
        {
          results.map((timeZone, index) => (
            // <div onClick={((e,timeZone) => selectTimeZone(e,timeZone))} className={`d-flex justify-between align-center c-pointer ${styles.mainSearchResultsDiv}`} key={index}>
            <div onClick={() => selectTimeZone(timeZone)} className={`d-flex justify-between align-center c-pointer ${styles.mainSearchResultsDiv}`} key={index}>
              <span>
                {timeZone.TZDatabaseName.split('/').at(-1)}
              </span>
              <span className='text-small4'>
                {
                DateTime.now().setZone(timeZone.TZDatabaseName).hour + ':' + (DateTime.now().setZone(timeZone.TZDatabaseName).minute.toString().length === 1 ?
                '0' + DateTime.now().setZone(timeZone.TZDatabaseName).minute :
                DateTime.now().setZone(timeZone.TZDatabaseName).minute)
                }
              </span>
            </div>
          ))
        }
    </div>
  )
}

export default SearchResults
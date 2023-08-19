
export const showToastMessage = (message, type='success') => {
    const toastContainer = document.getElementById('toastContainer')

    // check if already a toast message is displayed
    if(toastContainer?.childElementCount === 1){
        toastContainer.firstElementChild.remove()
    }

    const toastEl = document.createElement('div')
    toastEl.className = `toast ${type}`
    toastEl.innerText = message

    toastContainer.appendChild(toastEl)

    setTimeout(() => {
        toastEl.remove()
    }, 4000)
}

export default function ToastMessage() {
    return (
        <div id="toastContainer"></div>
    )
}
let notyf; // Define notyf globally

document.addEventListener('DOMContentLoaded', () => {
    notyf = new Notyf({
        position: {
            x: 'right',
            y: 'top',
        },
        types: [
            {
                type: 'warning',
                background: 'orange',
                duration: 2000,
                dismissible: true
            },
            {
                type: 'error',
                background: 'indianred',
                duration: 2000,
                dismissible: true
            },
            {
                type: 'loading',
                background: 'brown',
                duration: 2000,
                dismissible: false
            },
        ]
    });
});

export default function showMessage(type, message, time, isloading = false) {
    const loadingNotification = notyf.open({
        type: type,
        message: message + (!isloading ? '' : `<div class="d-flex justify-content-end">
  <div class="spinner-border text-primary" style="height: 1rem; width: 1rem;" role="status">
    <span class="sr-only">Loading...</span>
  </div>
</div>
`),
        duration: time,
    });
}

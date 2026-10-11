// Select all elements with the data-service attribute
const serviceButtons = document.querySelectorAll('[data-service]');
// Select the service select element    
const serviceSelect = document.querySelector('#requested-service');
// Select the element to display the selected service
const selectedService = document.querySelector('#selected-service');
// Select the appointment form
const appointmentForm = document.querySelector('#appointment-form');
// Find the paragraph where submission feedback will appear.
const formMessage = document.querySelector('#form-message');


//-------------------------------------------------------------------------//

// Function to handle button click events
function buttonClick(event) {
    const serviceName = event.currentTarget.dataset.service;
    
    serviceSelect.value = serviceName;
    selectedService.textContent = `Slected service: ${serviceName}`;

    appointmentForm.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

serviceButtons.forEach(button => {
    button.addEventListener('click', buttonClick);
});


//-------------------------------------------------------------------------//

// Run when the form is submitted.
// async allows us to wait for the backend using await.
appointmentForm.addEventListener('submit', async function (event) {
    // Prevent the browser from reloading the page.
    event.preventDefault();

    // Read the form's input values.
    const formData = new FormData(appointmentForm);

    // Group the values into one object.
    const appointment = {
        service: formData.get('service'),
        name: formData.get('customerName'),
        email: formData.get('customerEmail'),
        phone: formData.get('customerPhone'),
        date: formData.get('appointmentDate'),
        time: formData.get('appointmentTime'),
        notes: formData.get('appointmentNotes')
    };

    // Combine the selected date and time.
    const appointmentDateTime = new Date(
        `${appointment.date}T${appointment.time}`
    );

    // Stop if the selected appointment has already passed.
    if (appointmentDateTime <= new Date()) {
        formMessage.textContent =
            'Please choose a future appointment date and time.';
        return;
    }

    // Show feedback while waiting for the server.
    formMessage.textContent = 'Sending your details…';

    try {
        // Send the details to our FastAPI endpoint.
        const response = await fetch(
            'http://127.0.0.1:8000/appointments',
            {
                method: 'POST',

                // Identify the data format as JSON.
                headers: {
                    'Content-Type': 'application/json'
                },

                // Convert the appointment object into JSON text.
                body: JSON.stringify(appointment)
            }
        );

        // Read the JSON response from FastAPI.
        const result = await response.json();

        // Handle a rejection from the backend.
        if (!response.ok) {
            // Show its error message when it is plain text.
            // Otherwise, show a simple fallback message.
            formMessage.textContent =
                typeof result.detail === 'string'
                    ? result.detail
                    : 'Please check your appointment details.';
            return;
        }

        // Show the backend's message when the request succeeds.
        formMessage.textContent = result.message;
    } catch (error) {
        // Handle connection failures, such as an offline server.
        formMessage.textContent =
            'Could not reach the server. Please try again.';
    }
});

//-------------------------------------------------------------------------//

// Find the appointment date input.
const dateInput = document.querySelector('#appointment-date');

// Get the current date and time.
const today = new Date();

// Extract the year, month, and day.
// Months start at 0 in JavaScript, so we add 1.
// padStart ensures single-digit values become "01", "02", etc.
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');

// Date inputs require the format YYYY-MM-DD.
// Setting min makes earlier dates invalid.
dateInput.min = `${year}-${month}-${day}`;



//-------------------------------------------------------------------------//


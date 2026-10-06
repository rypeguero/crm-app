const bookingButtons = document.querySelectorAll("button[data-service]");
console.log(bookingButtons);

const selectedService = document.querySelector("#selected-service");

for (const button of bookingButtons) {
    button.addEventListener("click", function () {
        const serviceName = button.dataset.service
        selectedService.textContent = "You selected " + serviceName;
    });
}

//appointment form funtion

const requestForm = document.querySelector("form");

requestForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const nameInput = document.querySelector("#customer-name");
    const customerName = nameInput.value
    console.log(customerName);

});

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import date, time, datetime
from fastapi.middleware.cors import CORSMiddleware


# Create our application.
app = FastAPI()


# Allow our local frontend to send requests to the backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)


# This describes the data an appointment request must contain.
class AppointmentRequest(BaseModel):
    service: str
    name: str
    email: str
    phone: str
    date: date
    time: time
    notes: str = ""



@app.post("/appointments")
def create_appointment(appointment: AppointmentRequest):
    # Combine the requested day and time into one moment.
    # Our booking times use the server's local time.
    if appointment.time.tzinfo is not None:
        raise HTTPException(
            status_code=400,
            detail="Enter a local time like 14:30, without a timezone."
        )
    requested_datetime = datetime.combine(
        appointment.date,
        appointment.time
    )

    # Get the current moment using the server's local clock.
    now = datetime.now()

    # Reject an appointment if its time has already passed.
    if requested_datetime <= now:
        raise HTTPException(
            status_code=400,
            detail="Please choose a future appointment date and time."
        )

    # Return the details when the appointment is in the future.
    return {
        "message": "Appointment details received.",
        "appointment": appointment
    }



# When someone visits "/", run the function below.
@app.get("/")
def home():
    return {"message": "The backend is working"}
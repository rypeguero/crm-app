from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import date, time, datetime
from fastapi.middleware.cors import CORSMiddleware
import psycopg

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
    # Connect using the environment variables from your terminal.
    # The connection commits on success and closes when this block ends.
    with psycopg.connect("") as connection:

        # A cursor lets us send SQL commands to the database.
        with connection.cursor() as cursor:

            # Insert one appointment.
            # %s placeholders keep the values separate from the SQL.
            cursor.execute(
                """
                INSERT INTO appointments (
                    service,
                    customer_name,
                    customer_email,
                    customer_phone,
                    appointment_date,
                    appointment_time,
                    notes
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id;
                """,
                (
                    appointment.service,
                    appointment.name,
                    appointment.email,
                    appointment.phone,
                    appointment.date,
                    appointment.time,
                    appointment.notes
                )
            )

            # Read the ID PostgreSQL assigned to the new appointment.
            appointment_id = cursor.fetchone()[0]

    # This runs after the database has committed the saved appointment.
    return {
        "message": "Appointment request saved. Awaiting confirmation.",
        "id": appointment_id
    }



# When someone visits "/", run the function below.
@app.get("/")
def home():
    return {"message": "The backend is working"}
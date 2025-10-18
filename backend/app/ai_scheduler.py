from openai import OpenAI
from pydantic import BaseModel

client = OpenAI() 
class CalendarEvent(BaseModel):
    name: str
    day: str
    start_time: str
    end_time: str
    participants: list[str]

# def suggest_meeting_time(rank1, pref1, new_event1, calender_event1, rank2, pref2, new_event2, calender_event2):
def suggest_meeting_time():
    response = client.responses.parse(
        model="gpt-5-mini",
        input=[
            {"role": "system", "content": "Extract the best time to meet, look for event information. write date in 2025-10-20T09:00:00 "},
            {
                "role": "user",
                "content": "Alice and Bob want to going to a science fair for 6 hour, alice is busy everyday after 4pm"
            },
        ],
        text_format = CalendarEvent,
    )
    return(response.output_parsed)


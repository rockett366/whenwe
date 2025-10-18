from openai import OpenAI
from pydantic import BaseModel

client = OpenAI() 
class CalendarEvent(BaseModel):
    name: str
    start_time: str
    end_time: str
    participants: list[str]

# def suggest_meeting_time(rank1, pref1, new_event1, calender_event1, rank2, pref2, new_event2, calender_event2):
def suggest_meeting_time():
    response = client.responses.parse(
        model="gpt-5-mini",
        input=[
            {"role": "system", "content": "Extract the event information."},
            {
                "role": "user",
                "content": "Alice and Bob are going to a science fair on friday at 5pm, events an hour"
            },
        ],
        text_format = CalendarEvent,
    )
    return(response.output_parsed)


from asyncio import events
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
def suggest_meeting_time(user_name, friend_name, preferences, _events_to_compact_json, family_rank_me, family_rank_friend, friend_rank_me, friend_rank_friend, school_rank_me, school_rank_friend, work_rank_me, work_rank_friend, self_rank_me, self_rank_friend, time = "1", desired_title = "WhenWe Connect", earliest_start: str = None, latest_end: str = None):
    system_msg = (
        "You are a scheduling planner. Find ONE best meeting time that satisfies both people’s "
        "constraints and avoids busy intervals from Google calendar events.\n"
        "Output must match the CalendarEvent schema exactly.\n"
        "Rules:\n"
        "1) Return a single slot only, not alternatives.\n"
        "2) Use ISO 8601 without timezone like 2025-10-20T09:00:00 for start/end.\n"
        "3) Respect ranks: higher rank = higher priority when conflicts arise.\n"
        "4) Apply textual preferences as soft constraints unless they conflict with ranks.\n"
        "5) Never overlap with any provided GoogleEvent busy intervals for either attendee.\n"
        "6) If earliest_start/latest_end are provided, keep the recommendation within that window."
    )
    user_msg = (
        f"Find the best {time}-time meeting window for {user_name} and "
        f"{friend_name}. Use the busy intervals in 'calendar_data'. Apply ranks and preferences. "
        "Return exactly one CalendarEvent."
    )
    # User content bundles all structured inputs the model needs.
    user_payload = {
        "user_name": user_name,
        "friend_name": friend_name,
        "desired_title": desired_title,
        "desired_duration": time,
        "ranks": {
            "family_rank": family_rank_me,
            "family_rank_friend": family_rank_friend,
            "friend_rank": friend_rank_me,
            "friend_rank_friend": friend_rank_friend,
            "school_rank": school_rank_me,
            "school_rank_friend": school_rank_friend,
            "work_rank": work_rank_me,
            "work_rank_friend": work_rank_friend,
            "self_rank": self_rank_me,
            "self_rank_friend": self_rank_friend

        },
        "preferences": preferences,
        "bounds": {
            "earliest_start": earliest_start,  # may be None
            "latest_end": latest_end          # may be None
        },
        "calendar_data": {
            "user_events": _events_to_compact_json([e for e in events if True]),   # all passed events are considered the user's by default; customize if you also pass friend events separately
            "friend_events": []  # if you have the friend's Google events, include them here in same shape
        }
    }
    input_messages = [
        {"role": "system", "content": system_msg},
        {"role": "user", "content": user_msg},
        {"role": "user", "content": user_payload},
    ]
    response = client.responses.parse(
        model="gpt-5-mini",
        input=input_messages,
        text_format = CalendarEvent,
    )
    return(response.output_parsed)


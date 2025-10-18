from openai import OpenAI

client = OpenAI() 


def suggest_meeting_time():
    response = client.responses.create(
        model="gpt-5-mini",
        input="Write hi"
    )
    return(response.output_text)


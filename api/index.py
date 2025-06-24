import os
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse
from openai import OpenAI


load_dotenv(".env.local")

app = FastAPI()

# client = OpenAI(
#     api_key=os.environ.get("OPENAI_API_KEY"),
# )

@app.get("/api/hello")
async def hello_world():
    return "Hello"

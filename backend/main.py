import os
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import AsyncOpenAI

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Manim Univ API")

# Allow requests from our Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI Client (Requires OPENAI_API_KEY in .env)
client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url="https://factchat-cloud.mindlogic.ai/v1/gateway"
)

class ProblemRequest(BaseModel):
    problem_text: str

@app.post("/api/generate")
async def generate_manim(request: ProblemRequest):
    # Check if API key is set
    if not os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY") == "your_openai_api_key_here":
        raise HTTPException(status_code=500, detail="OpenAI API Key is not configured in the backend.")

    try:
        # 1. Ask GPT-4o to analyze the math problem and generate a storyboard
        prompt = f"""
        You are an expert mathematics tutor and Manim animation director.
        The student has provided the following math problem/equation:
        "{request.problem_text}"

        Please analyze this and provide a step-by-step storyboard for a Manim animation.
        Output your response as a numbered list of steps (e.g., "1. 양변을 미분합니다.", "2. ...").
        Keep the steps concise, focusing on the mathematical logic and visual changes.
        IMPORTANT: For all mathematical formulas, use standard markdown math delimiters: $ for inline math (e.g., $x^2$) and $$ for block math. Do NOT use \( or \).
        Respond in Korean.
        """
        
        response = await client.chat.completions.create(
            model="gpt-5.2",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )
        
        # Parse the response into a list of strings
        raw_storyboard = response.choices[0].message.content
        storyboard = [line.strip() for line in raw_storyboard.split('\n') if line.strip()]

        # 2. Mock Manim Rendering Delay (In real app, we would run Manim here)
        await asyncio.sleep(2)
        video_url = "https://example.com/mock_video.mp4" # Placeholder
        
        return {
            "status": "success",
            "storyboard": storyboard,
            "video_url": video_url
        }
        
    except Exception as e:
        print(f"Error calling OpenAI: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze problem using AI.")

@app.get("/")
def read_root():
    return {"message": "Welcome to Manim Univ Backend"}

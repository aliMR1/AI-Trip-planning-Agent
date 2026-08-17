import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Default to groq to avoid gpt-5-mini image processing issues
os.environ.setdefault("MODEL_PROVIDER", "groq")

# If using OpenAI, uncomment and set your key:
# os.environ.setdefault("OPENAI_API_KEY", "your-openai-key-here")

# If using Groq, set your key:
# os.environ.setdefault("GROQ_API_KEY", "your-groq-key-here")

from main import app
import uvicorn

if __name__ == "__main__":
    uvicorn.run(app, host='0.0.0.0', port=8000)
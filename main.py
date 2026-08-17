from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
import os
from dotenv import load_dotenv
from pydantic import BaseModel
load_dotenv()

from agent.agentic_workflow import GraphBuilder

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # set specific origins in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str

# Default to groq to avoid gpt-5-mini image processing issues
MODEL_PROVIDER = os.getenv("MODEL_PROVIDER", "groq")

@app.post("/query")
async def query_travel_agent(query:QueryRequest):
    try:
        graph = GraphBuilder(model_provider=MODEL_PROVIDER)
        react_app = graph()
        
        messages = {"messages": [query.question]}
        output = react_app.invoke(messages)
        
        # If result is dict with messages:
        if isinstance(output, dict) and "messages" in output:
            final_output = output["messages"][-1].content  # Last AI response
        else:
            final_output = str(output)
        
        return {"answer": final_output}
    except Exception as e:
        error_msg = str(e)
        # Handle the specific "Cannot read image.png" error
        if "image.png" in error_msg or "image input" in error_msg:
            return JSONResponse(
                status_code=500, 
                content={"error": "Graph visualization failed. This model doesn't support image processing. Set MODEL_PROVIDER=groq in environment."}
            )
        return JSONResponse(status_code=500, content={"error": error_msg})
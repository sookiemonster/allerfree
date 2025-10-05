from fastapi import FastAPI
from .routers import DetectionRouter

app = FastAPI()
app.include_router(DetectionRouter)


@app.get("/")
async def root():
    return {"message": "Live!"}

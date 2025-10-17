from fastapi import FastAPI
from . import models
from .database import engine
from .routers import user

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="WhenWe Backend")

# include routers
app.include_router(user.router)

@app.get("/")
def root():
    return {"message": "Backend running successfully!"}
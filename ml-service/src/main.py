from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.enhanced_api import app

# Create FastAPI app instance
main_app = FastAPI(
    title="NeerSetu ML Service",
    description="Machine Learning Service for Water Quality Monitoring and Disease Prediction",
    version="2.0.0"
)

# Add CORS middleware
main_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the enhanced API routes
main_app.include_router(app.router)

# Health check endpoint
@main_app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ml-service", "version": "2.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(main_app, host="0.0.0.0", port=8001)


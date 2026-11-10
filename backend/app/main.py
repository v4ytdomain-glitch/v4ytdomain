from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from app.core.config import get_settings
from app.db import engine
from app.routers.api import router

settings=get_settings()  # Fail fast when required secrets or URLs are missing.

@asynccontextmanager
async def lifespan(app:FastAPI):
    yield
    await engine.dispose()

app=FastAPI(title="V4YT OFFICIAL API",version="1.0.0",description="Backend API for the V4YT esports and gaming community. The browser must access data only through this service.",lifespan=lifespan,openapi_tags=[{"name":"auth","description":"Password form auth, refresh rotation, and account settings."},{"name":"players","description":"Public profiles and derived player statistics."},{"name":"tournaments","description":"Tournament discovery, registration, and results."},{"name":"community","description":"Teams, announcements, videos, achievements, notifications, and rewards."},{"name":"admin","description":"Privileged management operations; all mutations are audited."}])
app.add_middleware(CORSMiddleware,allow_origins=settings.cors_origins,allow_credentials=True,allow_methods=["GET","POST","PUT","PATCH","DELETE","OPTIONS"],allow_headers=["Authorization","Content-Type"])

@app.middleware("http")
async def security_headers(request:Request,call_next):
    response=await call_next(request)
    response.headers["X-Content-Type-Options"]="nosniff"
    response.headers["X-Frame-Options"]="DENY"
    response.headers["Referrer-Policy"]="strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"]="camera=(), microphone=(), geolocation=()"
    return response

@app.exception_handler(RequestValidationError)
async def validation_error(request,exc):
    return JSONResponse(status_code=422,content={"error":{"code":"validation_error","message":"Request validation failed","details":exc.errors()}})

@app.exception_handler(HTTPException)
async def http_error(request,exc):
    detail=exc.detail
    if isinstance(detail,dict):
        code=detail.get("code","request_error"); message=detail.get("message",str(detail)); extra=detail.get("details")
    else:
        code="request_error"; message=str(detail); extra=None
    return JSONResponse(status_code=exc.status_code,content={"error":{"code":code,"message":message,"details":extra}},headers=exc.headers)

@app.exception_handler(Exception)
async def unhandled_error(request,exc):
    # No exception or credential contents are logged or sent to clients.
    return JSONResponse(status_code=500,content={"error":{"code":"internal_error","message":"An internal error occurred","details":None}})

@app.get("/health",tags=["system"],description="Checks application and database connectivity.")
async def health():
    async with engine.connect() as conn: await conn.execute(text("SELECT 1"))
    return {"status":"ok","database":"ok"}

app.include_router(router,tags=["community"])

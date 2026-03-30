from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import schemas
from database import get_db_cursor

app = FastAPI(title="Soil Moisture Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Soil Moisture Tracker API"}

# Users
@app.get("/api/users", response_model=List[schemas.User])
def get_users(cursor = Depends(get_db_cursor)):
    cursor.execute("CALL proc_ManageUsers('SELECT_ALL', NULL, NULL, NULL, NULL)")
    rows = cursor.fetchall()
    return [{"user_id": r["UserID"], "username": r["Username"], "role": r["Role"]} for r in rows]

@app.post("/api/users")
def create_user(user: schemas.UserCreate, cursor = Depends(get_db_cursor)):
    cursor.execute("CALL proc_ManageUsers('INSERT', NULL, %s, %s, %s)",
                   (user.username, user.password, user.role))
    row = cursor.fetchone()
    if row:
        return {"user_id": row["UserID"]}
    raise HTTPException(status_code=400, detail="Could not create user")

@app.delete("/api/users/{user_id}")
def delete_user(user_id: int, cursor = Depends(get_db_cursor)):
    cursor.execute("CALL proc_ManageUsers('DELETE', %s, NULL, NULL, NULL)", (user_id,))
    return {"message": "User deleted"}

# Fields
@app.get("/api/fields", response_model=List[schemas.Field])
def get_fields(cursor = Depends(get_db_cursor)):
    cursor.execute("CALL proc_ManageFields('SELECT_ALL', NULL, NULL, NULL)")
    rows = cursor.fetchall()
    return [{"field_id": r["FieldID"], "field_name": r["FieldName"], "description": r["Description"]} for r in rows]

@app.post("/api/fields")
def create_field(field: schemas.FieldCreate, cursor = Depends(get_db_cursor)):
    cursor.execute("CALL proc_ManageFields('INSERT', NULL, %s, %s)",
                   (field.field_name, field.description))
    row = cursor.fetchone()
    if row:
        return {"field_id": row["FieldID"]}
    raise HTTPException(status_code=400, detail="Could not create field")

@app.delete("/api/fields/{field_id}")
def delete_field(field_id: int, cursor = Depends(get_db_cursor)):
    cursor.execute("CALL proc_ManageFields('DELETE', %s, NULL, NULL)", (field_id,))
    return {"message": "Field deleted"}

# Moisture Logs
@app.get("/api/moisture", response_model=List[schemas.MoistureLog])
def get_moisture_by_date(log_date: str, cursor = Depends(get_db_cursor)):
    cursor.execute("CALL proc_ManageMoistureLogs('SELECT_BY_DATE', NULL, NULL, %s, NULL, NULL)", (log_date,))
    rows = cursor.fetchall()
    results = []
    for r in rows:
        # Pydantic validation fails if LogDate is None so we fallback to the queried log_date
        results.append({
            "log_id": r["LogID"],
            "field_id": r["FieldID"],
            "field_name": r["FieldName"],
            "log_date": r["LogDate"] if r["LogDate"] is not None else log_date,
            "moisture_level": float(r["MoistureLevel"]) if r["MoistureLevel"] is not None else 0.0,
            "user_id": r["UserID"] if r["UserID"] is not None else 0
        })
    return results

@app.post("/api/moisture")
def upsert_moisture(log: schemas.MoistureLogCreate, cursor = Depends(get_db_cursor)):
    cursor.execute("CALL proc_ManageMoistureLogs('UPSERT', NULL, %s, %s, %s, %s)",
                   (log.field_id, log.log_date, log.moisture_level, log.user_id))
    row = cursor.fetchone()
    if row:
        return {"log_id": row["LogID"]}
    raise HTTPException(status_code=400, detail="Could not save moisture log")

@app.get("/api/moisture/all", response_model=List[schemas.MoistureLog])
def get_all_moisture(cursor = Depends(get_db_cursor)):
    query = """
        SELECT 
            m.LogID, 
            m.LogDate, 
            f.FieldID, 
            f.FieldName, 
            m.MoistureLevel, 
            m.UserID
        FROM MoistureLogs m
        JOIN Fields f ON m.FieldID = f.FieldID
        ORDER BY m.LogDate DESC, f.FieldName ASC
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    results = []
    for r in rows:
        results.append({
            "log_id": r["LogID"],
            "field_id": r["FieldID"],
            "field_name": r["FieldName"],
            "log_date": r["LogDate"],
            "moisture_level": float(r["MoistureLevel"]),
            "user_id": r["UserID"]
        })
    return results

# Analytics
@app.get("/api/analytics", response_model=List[schemas.AnalyticsReport])
def get_analytics(start_date: Optional[str] = None, end_date: Optional[str] = None, cursor = Depends(get_db_cursor)):
    if start_date and end_date:
        query = """
            SELECT 
                f.FieldID,
                f.FieldName,
                IFNULL(AVG(m.MoistureLevel), 0) AS AverageMoisture,
                COUNT(m.LogID) AS TotalLogs
            FROM Fields f
            LEFT JOIN MoistureLogs m ON f.FieldID = m.FieldID AND m.LogDate >= %s AND m.LogDate <= %s
            GROUP BY f.FieldID, f.FieldName;
        """
        cursor.execute(query, (start_date, end_date))
    else:
        query = """
            SELECT 
                f.FieldID,
                f.FieldName,
                IFNULL(AVG(m.MoistureLevel), 0) AS AverageMoisture,
                COUNT(m.LogID) AS TotalLogs
            FROM Fields f
            LEFT JOIN MoistureLogs m ON f.FieldID = m.FieldID
            GROUP BY f.FieldID, f.FieldName;
        """
        cursor.execute(query)
        
    rows = cursor.fetchall()
    return [{"field_id": r["FieldID"], "field_name": r["FieldName"], "average_moisture": float(r["AverageMoisture"]), "total_logs": r["TotalLogs"]} for r in rows]

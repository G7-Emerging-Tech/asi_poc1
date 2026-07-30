"""
ASI POC1 Backend — FastAPI with Prisma ORM
Complete API for all aircraft structural integrity data tables.
"""
from fastapi import FastAPI, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
import json
import os
import re

app = FastAPI(title="ASI POC1 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===================== PRISMA DATABASE CLIENT =====================
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from prisma import Prisma

prisma = Prisma()

@app.on_event("startup")
async def startup():
    await prisma.connect()
    print("✅ Connected to MySQL database")

@app.on_event("shutdown")
async def shutdown():
    await prisma.disconnect()

# ===================== PYDANTIC SCHEMAS =====================

# ---- 1. AIRCRAFT REGISTRY ----
class AircraftCreate(BaseModel):
    tailId: str
    buno: Optional[str] = None
    acType: str = "F/A-18D"
    status: str = "operational"
    totalAfh: float = 0
    afhPrevPeriod: Optional[float] = None
    afhAnnualIncrement: Optional[float] = None
    designLifeLimitAfh: int = 6000
    pwdYear: Optional[int] = None
    lpm12yCompleted: bool = False
    lpm12yInductionAfh: Optional[float] = None
    lpm12yDateIn: Optional[str] = None
    lpm12yDateOut: Optional[str] = None
    nextServicingPmi2: Optional[str] = None
    engineLhSn: Optional[str] = None
    engineLhAfh: Optional[float] = None
    engineRhSn: Optional[str] = None
    engineRhAfh: Optional[float] = None
    yearsInService: Optional[int] = None
    strainGaugeStatus: Optional[str] = None
    totalDefectsCum: int = 0
    defectsLatestCycle: int = 0
    corrosionsLatestCycle: int = 0
    lifePercentConsumed: Optional[float] = None
    slepLimitAfh: Optional[float] = None
    notes: Optional[str] = None

class AircraftResponse(AircraftCreate):
    id: int

    class Config:
        from_attributes = True

# ---- 2. FLIGHT DATA ----
class FlightDataCreate(BaseModel):
    stripNumber: str
    aircraftId: str
    flightDate: str  # ISO date
    missionType: Optional[str] = None
    profile: Optional[str] = None
    maxG: Optional[float] = None
    maxWingBending: Optional[float] = None
    gOcc4to5: Optional[int] = 0
    gOcc5to6: Optional[int] = 0
    gOcc6to7: Optional[int] = 0
    gOcc7to8: Optional[int] = 0
    strainWingRt: Optional[int] = None
    strainWingFold: Optional[int] = None
    strainFwdFuse: Optional[int] = None
    strainLHorz: Optional[int] = None
    strainRHorz: Optional[int] = None
    strainLVert: Optional[int] = None
    strainRVert: Optional[int] = None
    maxTrueAirSpeed: Optional[float] = None
    flightHours: Optional[float] = None

class FlightDataResponse(FlightDataCreate):
    id: int

    class Config:
        from_attributes = True

# ---- 3. FATIGUE LIFE INDEX ----
class FatigueCreate(BaseModel):
    aircraftId: str
    periodStart: Optional[str] = None
    periodEnd: Optional[str] = None
    wrFleiCurrent: Optional[float] = None
    wfFleiCurrent: Optional[float] = None
    wrFleiAnnualDelta: Optional[float] = None
    usageGradient: Optional[float] = None
    estFleiAt6000Afh: Optional[float] = None
    estYearFlei1: Optional[int] = None
    estAfhAtFlei1: Optional[float] = None

class FatigueResponse(FatigueCreate):
    id: int

    class Config:
        from_attributes = True

# ---- 4. MISSION SEVERITY ----
class MissionSevCreate(BaseModel):
    aircraftId: str
    opcCode: str
    missionTypeName: Optional[str] = None
    missionsCount: Optional[int] = None
    avgFleiPerMission: Optional[float] = None
    wrFleiSum: Optional[float] = None
    percentOfTotal: Optional[str] = None

# ---- 5. DEFECT NCRD ----
class DefectCreate(BaseModel):
    ncrdRef: str
    aircraftId: str
    title: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    partNumber: Optional[str] = None
    dateFound: Optional[str] = None
    severity: str = "major"
    status: Optional[str] = None
    asdrNumber: Optional[str] = None
    description: Optional[str] = None
    fleetWide: str = "No"
    criticalStructure: bool = False
    isBlackLineEntry: bool = False
    blackLineWarning: Optional[str] = None
    engineeringOrder: Optional[str] = None
    draft: bool = False
    verified: bool = False
    approved: bool = False

class DefectResponse(DefectCreate):
    id: int

    class Config:
        from_attributes = True

# ---- 6. CORROSION ----
class CorrosionCreate(BaseModel):
    corrosionId: str
    aircraftId: str
    location: Optional[str] = None
    description: Optional[str] = None
    asdrNumber: Optional[str] = None
    dateFound: Optional[str] = None
    grade: Optional[str] = None

# ---- 7. CONDITION REPORT ----
class ConditionReportCreate(BaseModel):
    reportId: str
    aircraftId: str
    reportType: Optional[str] = None
    reportDate: Optional[str] = None
    programme: Optional[str] = None
    dateIn: Optional[str] = None
    dateOut: Optional[str] = None
    totalTaskCards: Optional[int] = None
    surfaceFindingsTotal: Optional[int] = None
    surfaceTreatmentCount: Optional[int] = None
    repairCount: Optional[int] = None
    partReplacementCount: Optional[int] = None
    ncrdTotal: Optional[int] = None
    ncrdIncorporated: Optional[int] = None
    ncrdOnHold: Optional[int] = None
    ncrdSignificant: Optional[int] = None
    ncrdBlackLine: Optional[int] = None
    ewisFindings: Optional[str] = None
    mlgNote: Optional[str] = None
    fuelLeaksStatus: Optional[str] = None
    hydraulicLeaksStatus: Optional[str] = None
    weighingStatus: Optional[str] = None
    recommendations: Optional[str] = None

# ---- 8. ENGINEERING REPORT ----
class EngReportCreate(BaseModel):
    reportRef: str
    title: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    reportDate: Optional[str] = None
    docHeader: Optional[str] = None
    sections: Optional[str] = None
    docFooter: Optional[str] = None

# ---- 9. SLEP ----
class SlepCreate(BaseModel):
    aircraftId: str
    slepRef: str
    originalLimit: Optional[float] = None
    extendedLimit: Optional[float] = None
    approvalDate: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

# ---- 10. AUDIT ----
class AuditCreate(BaseModel):
    userName: Optional[str] = None
    userRole: Optional[str] = None
    action: Optional[str] = None
    record: Optional[str] = None
    changeDesc: Optional[str] = None

# ---- 11. INGESTED DOC ----
class IngestDocCreate(BaseModel):
    docId: str
    filename: Optional[str] = None
    fileType: Optional[str] = None
    fileSize: Optional[str] = None
    uploadDate: Optional[str] = None
    pageCount: Optional[int] = None
    entityCount: Optional[int] = None
    status: str = "unindexed"
    extractedEntities: Optional[str] = None

# ---- 12. USER ----
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "viewer"

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str

    class Config:
        from_attributes = True


# ===================== IN-MEMORY STORES (Backward Compatibility) =====================
# These are kept for endpoints not yet migrated to Prisma
aircraft_db = {}
flight_data_db = {}
fatigue_db = {}
mission_sev_db = {}
defect_db = {}
corrosion_db = {}
condition_report_db = {}
eng_report_db = {}
slep_db = {}
audit_db = {}
ingested_doc_db = {}
user_db = {}
user_id_seq = 1
flight_id_seq = 1
fatigue_id_seq = 1
mission_sev_id_seq = 1
defect_id_seq = 1
corrosion_id_seq = 1
condition_id_seq = 1
eng_report_id_seq = 1
slep_id_seq = 1
audit_id_seq = 1
ingest_id_seq = 1
aircraft_id_seq = 1

# ===================== DATABASE HELPERS =====================

async def upsert_aircraft(data: dict) -> dict:
    """Upsert aircraft by tailId (unique) and buno (unique)."""
    existing = await prisma.aircraftregistry.find_unique(
        where={"tailId": data["tailId"]}
    )
    if existing:
        # Update existing record
        updated = await prisma.aircraftregistry.update(
            where={"tailId": data["tailId"]},
            data=data
        )
        return {"id": updated.id, "action": "updated", **data}
    else:
        # Create new record
        created = await prisma.aircraftregistry.create(data=data)
        return {"id": created.id, "action": "created", **data}

def _build_prisma_data(data: dict) -> dict:
    """Convert aircraftId to Prisma relation connect syntax."""
    prisma_data = {k: v for k, v in data.items() if k != "aircraftId"}
    if "aircraftId" in data:
        prisma_data["aircraft"] = {"connect": {"tailId": data["aircraftId"]}}
    return prisma_data

async def upsert_flight(data: dict) -> dict:
    """Upsert flight by stripNumber (unique) + aircraftId."""
    # Ensure required flightDate field is present (datetime object, not string)
    if "flightDate" not in data or not data["flightDate"]:
        data["flightDate"] = datetime.now()
    elif isinstance(data["flightDate"], str):
        data["flightDate"] = datetime.now()
    
    # Build Prisma data with relation connect syntax
    prisma_data = _build_prisma_data(data)
    
    existing = await prisma.flightdata.find_unique(
        where={"stripNumber": data["stripNumber"]}
    )
    if existing:
        updated = await prisma.flightdata.update(
            where={"stripNumber": data["stripNumber"]},
            data=prisma_data
        )
        return {"id": updated.id, "action": "updated", **data}
    else:
        created = await prisma.flightdata.create(data=prisma_data)
        return {"id": created.id, "action": "created", **data}

async def upsert_fatigue(data: dict) -> dict:
    """Upsert fatigue by aircraftId + periodStart + periodEnd (composite unique)."""
    # Convert periodStart and periodEnd to datetime objects
    if "periodStart" in data and isinstance(data["periodStart"], str):
        try:
            data["periodStart"] = datetime.fromisoformat(data["periodStart"])
        except (ValueError, TypeError):
            data["periodStart"] = None
    
    if "periodEnd" in data and isinstance(data["periodEnd"], str):
        try:
            data["periodEnd"] = datetime.fromisoformat(data["periodEnd"])
        except (ValueError, TypeError):
            data["periodEnd"] = None
    
    # Build Prisma data with relation connect syntax
    prisma_data = _build_prisma_data(data)
    
    existing = await prisma.fatiguelifeindex.find_first(
        where={"aircraftId": data["aircraftId"]}
    )
    if existing:
        updated = await prisma.fatiguelifeindex.update(
            where={"id": existing.id},
            data=prisma_data
        )
        return {"id": updated.id, "action": "updated", **data}
    else:
        created = await prisma.fatiguelifeindex.create(data=prisma_data)
        return {"id": created.id, "action": "created", **data}

async def upsert_mission_severity(data: dict) -> dict:
    """Upsert mission severity by aircraftId + opcCode (composite unique)."""
    # Build Prisma data with relation connect syntax
    prisma_data = _build_prisma_data(data)
    
    existing = await prisma.missionseveritycontribution.find_first(
        where={"aircraftId": data["aircraftId"], "opcCode": data["opcCode"]}
    )
    if existing:
        updated = await prisma.missionseveritycontribution.update(
            where={"id": existing.id},
            data=prisma_data
        )
        return {"id": updated.id, "action": "updated", **data}
    else:
        created = await prisma.missionseveritycontribution.create(data=prisma_data)
        return {"id": created.id, "action": "created", **data}

async def upsert_defect(data: dict) -> dict:
    """Upsert defect by ncrdRef (unique)."""
    # Build Prisma data with relation connect syntax
    prisma_data = _build_prisma_data(data)
    
    existing = await prisma.defectncrd.find_unique(
        where={"ncrdRef": data["ncrdRef"]}
    )
    if existing:
        updated = await prisma.defectncrd.update(
            where={"ncrdRef": data["ncrdRef"]},
            data=prisma_data
        )
        return {"id": updated.id, "action": "updated", **data}
    else:
        created = await prisma.defectncrd.create(data=prisma_data)
        return {"id": created.id, "action": "created", **data}

async def upsert_corrosion(data: dict) -> dict:
    """Upsert corrosion by corrosionId (unique)."""
    # Build Prisma data with relation connect syntax
    prisma_data = _build_prisma_data(data)
    
    existing = await prisma.corrosionfinding.find_unique(
        where={"corrosionId": data["corrosionId"]}
    )
    if existing:
        updated = await prisma.corrosionfinding.update(
            where={"corrosionId": data["corrosionId"]},
            data=prisma_data
        )
        return {"id": updated.id, "action": "updated", **data}
    else:
        created = await prisma.corrosionfinding.create(data=prisma_data)
        return {"id": created.id, "action": "created", **data}


# ===================== API ENDPOINTS =====================

# Helper to serialize Prisma records (convert datetime to string)
def _serialize_record(record) -> dict:
    """Convert a Prisma record to a JSON-serializable dict."""
    if record is None:
        return None
    d = record.model_dump()
    for k, v in d.items():
        if isinstance(v, datetime):
            d[k] = v.isoformat()
    return d

async def _ensure_connected():
    """Ensure Prisma is connected."""
    try:
        await prisma.connect()
    except Exception:
        pass

# ---- HEALTH CHECK ----
@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}

# ========== 1. AIRCRAFT REGISTRY ==========
@app.get("/api/aircraft")
async def list_aircraft():
    await _ensure_connected()
    records = await prisma.aircraftregistry.find_many()
    return [_serialize_record(r) for r in records]

@app.get("/api/aircraft/{tail_id}")
async def get_aircraft(tail_id: str):
    await _ensure_connected()
    record = await prisma.aircraftregistry.find_unique(where={"tailId": tail_id})
    if not record:
        raise HTTPException(404, "Aircraft not found")
    return _serialize_record(record)

@app.post("/api/aircraft", response_model=AircraftResponse)
def create_aircraft(data: AircraftCreate):
    global aircraft_id_seq
    record = data.model_dump()
    record["id"] = aircraft_id_seq
    aircraft_id_seq += 1
    aircraft_db[data.tailId] = record
    # Auto audit
    add_audit("AIIMS System", "AI Ingest", "IMPORT", f"Aircraft {data.tailId}", "Created")
    return record

@app.put("/api/aircraft/{tail_id}", response_model=AircraftResponse)
def update_aircraft(tail_id: str, data: AircraftCreate):
    if tail_id not in aircraft_db:
        raise HTTPException(404, "Aircraft not found")
    record = data.model_dump()
    record["id"] = aircraft_db[tail_id]["id"]
    aircraft_db[tail_id] = record
    add_audit("System", "Admin", "UPDATE", f"Aircraft {tail_id}", "Updated")
    return record

@app.delete("/api/aircraft/{tail_id}")
def delete_aircraft(tail_id: str):
    if tail_id not in aircraft_db:
        raise HTTPException(404, "Aircraft not found")
    del aircraft_db[tail_id]
    return {"ok": True}

# ========== 2. FLIGHT DATA ==========
@app.get("/api/flights")
async def list_flights(aircraft_id: Optional[str] = None):
    await _ensure_connected()
    if aircraft_id:
        records = await prisma.flightdata.find_many(where={"aircraftId": aircraft_id})
    else:
        records = await prisma.flightdata.find_many()
    return [_serialize_record(r) for r in records]

@app.get("/api/flights/{strip_number}")
async def get_flight(strip_number: str):
    await _ensure_connected()
    record = await prisma.flightdata.find_unique(where={"stripNumber": strip_number})
    if not record:
        raise HTTPException(404, "Flight not found")
    return _serialize_record(record)

@app.post("/api/flights", response_model=FlightDataResponse)
def create_flight(data: FlightDataCreate):
    global flight_id_seq
    record = data.model_dump()
    record["id"] = flight_id_seq
    try:
        record["flightDate"] = datetime.fromisoformat(data.flightDate)
    except:
        record["flightDate"] = datetime.now()
    flight_id_seq += 1
    flight_data_db[data.stripNumber] = record
    return record

@app.post("/api/flights/batch")
def create_flights_batch(data: List[FlightDataCreate]):
    results = []
    for d in data:
        results.append(create_flight(d))
    return results

# ========== 3. FATIGUE LIFE INDEX ==========
@app.get("/api/fatigue")
async def list_fatigue(aircraft_id: Optional[str] = None):
    await _ensure_connected()
    if aircraft_id:
        records = await prisma.fatiguelifeindex.find_many(where={"aircraftId": aircraft_id})
    else:
        records = await prisma.fatiguelifeindex.find_many()
    return [_serialize_record(r) for r in records]

@app.post("/api/fatigue")
def create_fatigue(data: FatigueCreate):
    global fatigue_id_seq
    record = data.model_dump()
    record["id"] = fatigue_id_seq
    fatigue_id_seq += 1
    key = f"{data.aircraftId}_{fatigue_id_seq}"
    fatigue_db[key] = record
    return record

# ========== 4. MISSION SEVERITY ==========
@app.get("/api/mission-severity")
async def list_mission_severity(aircraft_id: Optional[str] = None):
    await _ensure_connected()
    if aircraft_id:
        records = await prisma.missionseveritycontribution.find_many(where={"aircraftId": aircraft_id})
    else:
        records = await prisma.missionseveritycontribution.find_many()
    return [_serialize_record(r) for r in records]

@app.post("/api/mission-severity")
def create_mission_severity(data: MissionSevCreate):
    global mission_sev_id_seq
    record = data.model_dump()
    record["id"] = mission_sev_id_seq
    mission_sev_id_seq += 1
    key = f"{data.aircraftId}_{data.opcCode}"
    mission_sev_db[key] = record
    return record

# ========== 5. DEFECTS / NCRD ==========
@app.get("/api/defects")
async def list_defects(aircraft_id: Optional[str] = None, severity: Optional[str] = None, black_line: Optional[bool] = None):
    await _ensure_connected()
    where_clause = {}
    if aircraft_id:
        where_clause["aircraftId"] = aircraft_id
    if severity:
        where_clause["severity"] = severity
    if black_line is not None:
        where_clause["isBlackLineEntry"] = black_line
    records = await prisma.defectncrd.find_many(where=where_clause)
    return [_serialize_record(r) for r in records]

@app.get("/api/defects/{ncrd_ref}")
async def get_defect(ncrd_ref: str):
    await _ensure_connected()
    record = await prisma.defectncrd.find_unique(where={"ncrdRef": ncrd_ref})
    if not record:
        raise HTTPException(404, "Defect not found")
    return _serialize_record(record)

@app.post("/api/defects", response_model=DefectResponse)
def create_defect(data: DefectCreate):
    global defect_id_seq
    record = data.model_dump()
    record["id"] = defect_id_seq
    defect_id_seq += 1
    defect_db[data.ncrdRef] = record
    return record

@app.put("/api/defects/{ncrd_ref}", response_model=DefectResponse)
def update_defect(ncrd_ref: str, data: DefectCreate):
    if ncrd_ref not in defect_db:
        raise HTTPException(404, "Defect not found")
    record = data.model_dump()
    record["id"] = defect_db[ncrd_ref]["id"]
    defect_db[ncrd_ref] = record
    return record

# ========== 6. CORROSION ==========
@app.get("/api/corrosion")
async def list_corrosion(aircraft_id: Optional[str] = None):
    await _ensure_connected()
    if aircraft_id:
        records = await prisma.corrosionfinding.find_many(where={"aircraftId": aircraft_id})
    else:
        records = await prisma.corrosionfinding.find_many()
    return [_serialize_record(r) for r in records]

@app.post("/api/corrosion")
def create_corrosion(data: CorrosionCreate):
    global corrosion_id_seq
    record = data.model_dump()
    record["id"] = corrosion_id_seq
    corrosion_id_seq += 1
    corrosion_db[data.corrosionId] = record
    return record

# ========== 7. CONDITION REPORTS ==========
@app.get("/api/condition-reports")
async def list_condition_reports(aircraft_id: Optional[str] = None):
    await _ensure_connected()
    if aircraft_id:
        records = await prisma.aircraftconditionreport.find_many(where={"aircraftId": aircraft_id})
    else:
        records = await prisma.aircraftconditionreport.find_many()
    return [_serialize_record(r) for r in records]

@app.post("/api/condition-reports")
def create_condition_report(data: ConditionReportCreate):
    global condition_id_seq
    record = data.model_dump()
    record["id"] = condition_id_seq
    condition_id_seq += 1
    condition_report_db[data.reportId] = record
    return record

# ========== 8. ENGINEERING REPORTS ==========
@app.get("/api/engineering-reports")
async def list_eng_reports():
    await _ensure_connected()
    records = await prisma.engineeringreport.find_many()
    return [_serialize_record(r) for r in records]

@app.post("/api/engineering-reports")
def create_eng_report(data: EngReportCreate):
    global eng_report_id_seq
    record = data.model_dump()
    record["id"] = eng_report_id_seq
    eng_report_id_seq += 1
    eng_report_db[data.reportRef] = record
    return record

# ========== 9. SLEP ==========
@app.get("/api/slep")
async def list_slep(aircraft_id: Optional[str] = None):
    await _ensure_connected()
    if aircraft_id:
        records = await prisma.sleprecord.find_many(where={"aircraftId": aircraft_id})
    else:
        records = await prisma.sleprecord.find_many()
    return [_serialize_record(r) for r in records]

@app.post("/api/slep")
def create_slep(data: SlepCreate):
    global slep_id_seq
    record = data.model_dump()
    record["id"] = slep_id_seq
    slep_id_seq += 1
    slep_db[data.slepRef] = record
    return record

# ========== 10. AUDIT TRAIL ==========
def add_audit(user: str, role: str, action: str, record: str, change: str):
    global audit_id_seq
    entry = {
        "id": audit_id_seq,
        "timestamp": datetime.now().isoformat(),
        "userName": user,
        "userRole": role,
        "action": action,
        "record": record,
        "changeDesc": change,
    }
    audit_id_seq += 1
    audit_db[audit_id_seq] = entry
    return entry

@app.get("/api/audit")
async def list_audit(action: Optional[str] = None, limit: int = 100):
    await _ensure_connected()
    where_clause = {}
    if action:
        where_clause["action"] = action
    records = await prisma.audittrail.find_many(
        where=where_clause,
        order={"timestamp": "desc"},
        take=limit
    )
    return [_serialize_record(r) for r in records]

@app.post("/api/audit")
def create_audit(data: AuditCreate):
    return add_audit(data.userName or "System", data.userRole or "System", 
                     data.action or "UPDATE", data.record or "", data.changeDesc or "")

# ========== 11. INGESTED DOCUMENTS ==========
@app.get("/api/ingested-docs")
async def list_ingested_docs():
    await _ensure_connected()
    records = await prisma.ingesteddocument.find_many()
    return [_serialize_record(r) for r in records]

@app.post("/api/ingested-docs")
def create_ingested_doc(data: IngestDocCreate):
    global ingest_id_seq
    record = data.model_dump()
    record["id"] = ingest_id_seq
    ingest_id_seq += 1
    ingested_doc_db[data.docId] = record
    return record

# ========== 12. USERS ==========
@app.post("/api/users", response_model=UserResponse)
def create_user(data: UserCreate):
    global user_id_seq
    if data.username in user_db:
        raise HTTPException(400, "User already exists")
    record = data.model_dump()
    record["id"] = user_id_seq
    user_id_seq += 1
    user_db[data.username] = record
    return record

@app.get("/api/users", response_model=List[UserResponse])
def list_users():
    return list(user_db.values())

# ========== 13. DASHBOARD STATS ==========
@app.get("/api/dashboard/stats")
async def dashboard_stats():
    await _ensure_connected()
    # Get all aircraft from MySQL
    all_aircraft = await prisma.aircraftregistry.find_many()
    fleet_size = len(all_aircraft)
    operational = len([a for a in all_aircraft if a.status == "operational"])
    maint = len([a for a in all_aircraft if a.status == "maintenance"])
    total_defects = sum(a.totalDefectsCum for a in all_aircraft)
    total_corrosions = sum(a.corrosionsLatestCycle for a in all_aircraft)
    
    # Get highest WR FLEI from MySQL
    all_fatigue = await prisma.fatiguelifeindex.find_many()
    max_flei = None
    max_flei_ac = None
    for f in all_fatigue:
        if f.wrFleiCurrent and (max_flei is None or f.wrFleiCurrent > max_flei):
            max_flei = f.wrFleiCurrent
            max_flei_ac = f.aircraftId
    
    return {
        "fleetSize": fleet_size,
        "operational": operational,
        "maintenance": maint,
        "totalDefects": total_defects,
        "totalCorrosions": total_corrosions,
        "highestWrFlei": max_flei,
        "highestWrFleiAircraft": max_flei_ac,
    }

# ========== 14. SEED ENDPOINT ==========
@app.post("/api/seed")
def seed_database():
    """Populate database with initial reference data from FA-18D report."""
    
    # --- AIRCRAFT ---
    ac_data = [
        {"tailId": "AC-01", "buno": "165207", "status": "operational", "totalAfh": 5448.82, "afhPrevPeriod": 5210.63, "afhAnnualIncrement": 228.19, "designLifeLimitAfh": 6000, "pwdYear": 2025, "lpm12yCompleted": True, "lpm12yInductionAfh": 5943.8, "lpm12yDateIn": "26/07/2021", "lpm12yDateOut": "31/12/2022", "nextServicingPmi2": "2028", "engineLhSn": "E946016", "engineLhAfh": 3585.7, "engineRhSn": "E946011", "engineRhAfh": 4025.2, "yearsInService": 25, "strainGaugeStatus": "Error — replaced (resolved)", "totalDefectsCum": 108, "defectsLatestCycle": 3, "corrosionsLatestCycle": 0, "lifePercentConsumed": 91, "notes": "Highest AFH and FLEI in fleet. Requires close monitoring."},
        {"tailId": "AC-02", "buno": "165208", "status": "operational", "totalAfh": 3985.01, "afhPrevPeriod": 3985.01, "afhAnnualIncrement": 0, "designLifeLimitAfh": 6000, "pwdYear": 2030, "lpm12yCompleted": True, "lpm12yInductionAfh": 3985.01, "lpm12yDateIn": "2024-02-20", "lpm12yDateOut": "", "nextServicingPmi2": "2028", "engineLhSn": "E946017", "engineLhAfh": 1985.4, "engineRhSn": "E946012", "engineRhAfh": 1985.4, "yearsInService": 24, "strainGaugeStatus": "Normal", "totalDefectsCum": 44, "defectsLatestCycle": 0, "corrosionsLatestCycle": 0, "lifePercentConsumed": 66, "notes": "Newly inducted with LPM12Y data, showing good initial condition."},
        {"tailId": "AC-03", "buno": "165209", "status": "operational", "totalAfh": 4116.79, "afhPrevPeriod": 3939.89, "afhAnnualIncrement": 176.90, "designLifeLimitAfh": 5134, "pwdYear": 2029, "lpm12yCompleted": False, "lpm12yInductionAfh": None, "lpm12yDateIn": "", "lpm12yDateOut": "", "nextServicingPmi2": "2027", "engineLhSn": "E946018", "engineLhAfh": 2116.8, "engineRhSn": "E946013", "engineRhAfh": 2000.0, "yearsInService": 23, "strainGaugeStatus": "Normal", "totalDefectsCum": 29, "defectsLatestCycle": 3, "corrosionsLatestCycle": 0, "lifePercentConsumed": 80, "slepLimitAfh": 5134.2, "notes": "SLEP available. Reduced life limit per Ref F."},
        {"tailId": "AC-04", "buno": "165210", "status": "maintenance", "totalAfh": 4029.42, "afhPrevPeriod": 4029.42, "afhAnnualIncrement": 0, "designLifeLimitAfh": 5549, "pwdYear": 2028, "lpm12yCompleted": False, "nextServicingPmi2": "2027", "engineLhSn": "E946019", "engineLhAfh": 2029.4, "engineRhSn": "E946014", "engineRhAfh": 2000.0, "yearsInService": 23, "strainGaugeStatus": "Warning — scheduled for replacement", "totalDefectsCum": 48, "defectsLatestCycle": 0, "corrosionsLatestCycle": 0, "lifePercentConsumed": 73, "slepLimitAfh": 5549.0, "notes": "Currently under maintenance. SLEP available."},
        {"tailId": "AC-05", "buno": "165211", "status": "operational", "totalAfh": 3960.20, "afhPrevPeriod": 3794.60, "afhAnnualIncrement": 165.60, "designLifeLimitAfh": 6000, "pwdYear": 2032, "lpm12yCompleted": False, "notes": "Highest annual usage in fleet. Only aircraft achieving UE 360 hr/yr."},
        {"tailId": "AC-06", "buno": "165212", "status": "operational", "totalAfh": 3600.00, "afhPrevPeriod": 3449.75, "afhAnnualIncrement": 150.25, "designLifeLimitAfh": 6000, "pwdYear": 2035, "lpm12yCompleted": False, "notes": "Moderate usage profile."},
        {"tailId": "AC-07", "buno": "165219", "status": "operational", "totalAfh": 4142.5, "afhPrevPeriod": 4010.73, "afhAnnualIncrement": 0, "designLifeLimitAfh": 6000, "pwdYear": 2028, "lpm12yCompleted": True, "lpm12yInductionAfh": 4142.5, "lpm12yDateIn": "02/02/2023", "lpm12yDateOut": "30/04/2024", "nextServicingPmi2": "2028", "yearsInService": 25, "strainGaugeStatus": "Normal", "totalDefectsCum": 68, "defectsLatestCycle": 53, "corrosionsLatestCycle": 7, "lifePercentConsumed": 69, "notes": "2008 fire damage history. Higher defect count. Corrosion issues."},
        {"tailId": "AC-08", "buno": "165221", "status": "operational", "totalAfh": 4104.7, "designLifeLimitAfh": 6000, "lpm12yCompleted": True, "lpm12yInductionAfh": 4104.7, "lpm12yDateIn": "01/07/2024", "lpm12yDateOut": "06/03/2026", "nextServicingPmi2": "2031", "yearsInService": 29, "strainGaugeStatus": "Normal", "totalDefectsCum": 35, "notes": "Cleanest surface in fleet. First SPD implementation on this type."},
    ]
    for a in ac_data:
        create_aircraft(AircraftCreate(**a))
    
    # --- FATIGUE DATA ---
    fatigue_records = [
        {"aircraftId": "AC-01", "wrFleiCurrent": 0.4387, "wfFleiCurrent": 0.0968, "wrFleiAnnualDelta": 0.01882, "usageGradient": 8.249e-5, "estFleiAt6000Afh": 0.495, "estYearFlei1": 2043, "estAfhAtFlei1": 12122.42},
        {"aircraftId": "AC-02", "wrFleiCurrent": 0.3418, "wfFleiCurrent": 0.0926, "wrFleiAnnualDelta": 0.0, "usageGradient": 8.469e-5, "estFleiAt6000Afh": 0.508, "estYearFlei1": 2046, "estAfhAtFlei1": 11808.38},
        {"aircraftId": "AC-03", "wrFleiCurrent": 0.2867, "wfFleiCurrent": 0.0724, "wrFleiAnnualDelta": 0.01315, "usageGradient": 7.431e-5, "estFleiAt6000Afh": 0.446, "estYearFlei1": 2050, "estAfhAtFlei1": 13455.55},
        {"aircraftId": "AC-04", "wrFleiCurrent": 0.3085, "wfFleiCurrent": 0.1120, "wrFleiAnnualDelta": 0.0, "usageGradient": 7.8e-5, "estFleiAt6000Afh": 0.42, "estYearFlei1": 2032, "estAfhAtFlei1": 11900},
        {"aircraftId": "AC-05", "wrFleiCurrent": 0.1900, "wfFleiCurrent": 0.0450, "wrFleiAnnualDelta": 0.0085, "usageGradient": 6.5e-5, "estFleiAt6000Afh": 0.39, "estYearFlei1": 2053, "estAfhAtFlei1": 13600},
        {"aircraftId": "AC-06", "wrFleiCurrent": 0.2600, "wfFleiCurrent": 0.0550, "usageGradient": 7.0e-5, "estFleiAt6000Afh": 0.42, "estYearFlei1": 2050, "estAfhAtFlei1": 13000},
        {"aircraftId": "AC-07", "wrFleiCurrent": 0.2550, "wfFleiCurrent": 0.0520, "usageGradient": 7.2e-5, "estFleiAt6000Afh": 0.44, "estYearFlei1": 2048, "estAfhAtFlei1": 12800},
        {"aircraftId": "AC-08", "wrFleiCurrent": 0.2640, "wfFleiCurrent": 0.0510, "usageGradient": 7.1e-5, "estFleiAt6000Afh": 0.43, "estYearFlei1": 2049, "estAfhAtFlei1": 12900},
    ]
    for f in fatigue_records:
        create_fatigue(FatigueCreate(**f))
    
    # --- MISSION SEVERITY ---
    mission_data = [
        {"aircraftId": "AC-01", "opcCode": "01", "missionTypeName": "FAM/Ferry/Navigation", "missionsCount": 198, "avgFleiPerMission": 2.307e-5, "wrFleiSum": 0.004726, "percentOfTotal": "12%"},
        {"aircraftId": "AC-01", "opcCode": "02", "missionTypeName": "Air-to-Air Engagement", "missionsCount": 312, "avgFleiPerMission": 2.387e-5, "wrFleiSum": 0.007199, "percentOfTotal": "18%"},
        {"aircraftId": "AC-01", "opcCode": "03", "missionTypeName": "Air-to-Ground Training", "missionsCount": 420, "avgFleiPerMission": 6.3e-5, "wrFleiSum": 0.02645, "percentOfTotal": "68%"},
        {"aircraftId": "AC-01", "opcCode": "04", "missionTypeName": "Aerobatics (LLA/LAT)", "missionsCount": 12, "avgFleiPerMission": 6.732e-5, "wrFleiSum": 0.0008079, "percentOfTotal": "2%"},
    ]
    for m in mission_data:
        create_mission_severity(MissionSevCreate(**m))
    
    # --- DEFECTS / NCRD ---
    defect_data = [
        {"ncrdRef": "G7GA/NCRD/2022/0012", "aircraftId": "AC-01", "title": "Crack on RH Inner Wing Rib", "location": "RH Inner Wing Upper Rib", "type": "Crack", "dateFound": "2022-01-15", "severity": "critical", "status": "Repair Completed", "fleetWide": "Yes", "criticalStructure": True, "approved": True, "verified": True},
        {"ncrdRef": "G7GA/NCRD/2022/0015", "aircraftId": "AC-01", "title": "Crack on LH Inner Wing Rib", "location": "LH Inner Wing Rib", "type": "Crack", "dateFound": "2022-03-10", "severity": "critical", "status": "Repair Completed", "fleetWide": "Yes", "criticalStructure": True, "approved": True, "verified": True},
        {"ncrdRef": "M4501/0001/2022", "aircraftId": "AC-01", "title": "Crack on RH Inner Wing Rib (Black Line Entry)", "location": "RH Inner Wing Rib — Critical Structure", "type": "Crack", "dateFound": "2022-06-01", "severity": "critical", "status": "Black Line Entry — Under Investigation", "fleetWide": "Yes", "criticalStructure": True, "isBlackLineEntry": True, "blackLineWarning": "Investigation ongoing by engineering authority.", "draft": True, "verified": True, "approved": False},
        {"ncrdRef": "G7GA/NCRD/2022/0001", "aircraftId": "AC-01", "title": "Longeron Bracket — Elongated Hole", "location": "Longeron Bracket Attaching Structure", "severity": "major", "status": "Repair Completed", "engineeringOrder": "G7GA-ER-2108-002(R0)", "fleetWide": "Yes", "criticalStructure": True, "approved": True, "verified": True},
        {"ncrdRef": "G7GA/NCRD/M4507/0004", "aircraftId": "AC-07", "title": "LH Inner Wing Intercostal Cracked", "location": "LH Inner Wing", "type": "Crack", "severity": "critical", "status": "Repair Completed", "criticalStructure": True, "approved": True, "verified": True},
        {"ncrdRef": "G7GA/NCRD/M4507/0013", "aircraftId": "AC-07", "title": "Former Y664.50 Deformed & Patch Replacement", "location": "Forward Fuselage Structure", "severity": "critical", "status": "Repair by Local Engineering Order", "criticalStructure": True, "approved": True, "verified": True},
        {"ncrdRef": "G7GA/NCRD/M4507/0030", "aircraftId": "AC-07", "title": "Corrosion on LH Vertical Fin Cap — Black Line Entry", "location": "LH Vertical Fin Cap — Critical Structure", "type": "Corrosion", "severity": "major", "status": "Black Line Entry — Under Investigation", "fleetWide": "Possible", "isBlackLineEntry": True, "blackLineWarning": "LH Vertical Fin Cap corrosion — BLACK LINE ENTRY. Investigation ongoing.", "draft": True, "verified": True, "approved": False},
        {"ncrdRef": "G7GA/NCRD/M4507/0031", "aircraftId": "AC-07", "title": "Corrosion on RH Vertical Fin Cap — Black Line Entry", "location": "RH Vertical Fin Cap — Critical Structure", "type": "Corrosion", "severity": "major", "status": "Black Line Entry — Under Investigation", "fleetWide": "Possible", "isBlackLineEntry": True, "blackLineWarning": "RH Vertical Fin Cap corrosion — BLACK LINE ENTRY. Investigation ongoing.", "draft": True, "verified": True, "approved": False},
        {"ncrdRef": "G7GA/NCRD/4508/0044", "aircraftId": "AC-08", "title": "Bulkhead Y557.500 Heat Damage (APU Fire)", "location": "Aft Fuselage Bulkhead", "severity": "critical", "status": "SBI + BLE Issued", "criticalStructure": True, "isBlackLineEntry": True, "blackLineWarning": "Heat damage from APU fire. Maintenance Critical item."},
        {"ncrdRef": "G7GA/NCRD/4508/0037", "aircraftId": "AC-08", "title": "LH Inner Wing Aft Spar Cracks and Gouges", "location": "LH Inner Wing Aft Spar", "severity": "critical", "status": "Repair Completed", "criticalStructure": True, "notes": "Scallop repair + bushing. MOS 122.06 @ 7.5G"},
    ]
    for d in defect_data:
        create_defect(DefectCreate(**d))
    
    # --- CORROSION ---
    corrosion_data = [
        {"corrosionId": "C001", "aircraftId": "AC-07", "location": "Horizontal Stabiliser — AFT Tip RH", "description": "Sign of corrosion at tip, AFT Horizontal Stabiliser (RH).", "asdrNumber": "ASDR-31052023-0001", "dateFound": "31/5/2023", "grade": "Grade 2"},
        {"corrosionId": "C002", "aircraftId": "AC-07", "location": "Inner Wing — Pylon Attach Stn 8 AFT", "description": "Corrosion RH inner wing, station 8 AFT Pylon attachment point.", "asdrNumber": "ASDR-06062023-0009", "dateFound": "6/6/2023", "grade": "Grade 2"},
        {"corrosionId": "C003", "aircraftId": "AC-07", "location": "Door 14L — Lower Sills Structure", "description": "Door 14L lower sills — suspected corrosion structure.", "asdrNumber": "ASDR-14062023-0004", "dateFound": "14/6/2023", "grade": "Grade 3"},
        {"corrosionId": "C004", "aircraftId": "AC-07", "location": "RH Centre Wing — AFT Mating Angle", "description": "RH centre wing to fuselage AFT mating angle.", "asdrNumber": "ASDR-14062023-0008", "dateFound": "14/6/2023", "grade": "Grade 2"},
        {"corrosionId": "C005", "aircraftId": "AC-07", "location": "RH Vertical Tail — Fin Cap Rib", "description": "Corrosion found at RH Vertical Stabiliser Fin Cap Rib area.", "dateFound": "8/11/2023", "grade": "Grade 2"},
        {"corrosionId": "C006", "aircraftId": "AC-07", "location": "LH Vertical Tail — Fin Cap (CRITICAL)", "description": "Corrosion LH Vertical Tail Fin Cap. BELOW structural limit 0.0040 in.", "asdrNumber": "RUAGE29112023-0005", "dateFound": "8/12/2023", "grade": "Grade 4"},
        {"corrosionId": "C007", "aircraftId": "AC-07", "location": "LH Vertical Tail — Leading Edge", "description": "Corrosion at LH Vertical Tail leading edge.", "dateFound": "29/11/2023", "grade": "Grade 3"},
    ]
    for c in corrosion_data:
        create_corrosion(CorrosionCreate(**c))
    
    # --- FLIGHT DATA (from CSV sample) ---
    flight_samples = [
        {"stripNumber": "B4504D20200520T1514", "aircraftId": "AC-01", "flightDate": "2020-05-20", "missionType": "FFRM", "profile": "A1450", "maxG": 4.61, "maxWingBending": 4289408, "gOcc4to5": 24, "gOcc5to6": 58, "gOcc6to7": 12, "gOcc7to8": 0, "strainWingRt": 1232, "strainWingFold": 216, "strainFwdFuse": 8, "strainLHorz": 512, "strainRHorz": 1224, "strainLVert": 632, "strainRVert": 1104, "maxTrueAirSpeed": 480.06, "flightHours": 1.45},
        {"stripNumber": "B4504D20200520T1515", "aircraftId": "AC-01", "flightDate": "2020-05-20", "missionType": "GAT / JDAM / ATG", "profile": "A1450", "maxG": 6.48, "maxWingBending": 5572096, "gOcc4to5": 24, "gOcc5to6": 58, "gOcc6to7": 12, "gOcc7to8": 0, "strainWingRt": 1584, "strainWingFold": 376, "strainFwdFuse": -56, "strainLHorz": 936, "strainRHorz": 1456, "strainLVert": 176, "strainRVert": 560, "maxTrueAirSpeed": 543.06, "flightHours": 1.45},
    ]
    for fl in flight_samples:
        create_flight(FlightDataCreate(**fl))
    
    # --- ENGINEERING REPORTS ---
    eng_reports = [
        {"reportRef": "LPM12Y/ACR/AC-08", "title": "LPM12Y Aircraft Condition Report — AC-08 (First SPD Implementation)", "type": "LPM12Y ACR", "status": "Approved", "reportDate": "27 Mar 2026", "docHeader": "Engineering Report · Issue 01 · Rev 00 · RESTRICTED"},
        {"reportRef": "F-A-18D/ASI/YER", "title": "F/A-18D Annual Structural Integrity Report", "type": "Annual", "status": "Submitted", "reportDate": "Jan 2024", "docHeader": "Engineering Report · Issue 01 · Rev 00 · RESTRICTED"},
    ]
    for er in eng_reports:
        create_eng_report(EngReportCreate(**er))
    
    # --- AUDIT ---
    audit_entries = [
        {"userName": "AIIMS System", "userRole": "AI Ingest", "action": "IMPORT", "record": "LPM12Y ACR — AC-08", "changeDesc": "null -> extracted · 6 NCRDs · 44 total NCRDs · SPD first implementation"},
        {"userName": "[Redacted] Approver", "userRole": "ASI Manager", "action": "APPROVE", "record": "F-A-18D Annual Structural Integrity Report", "changeDesc": "reviewed -> approved"},
        {"userName": "[Redacted] Reviewer", "userRole": "Design Engineer", "action": "VERIFY", "record": "F-A-18D Annual Structural Integrity Report", "changeDesc": "draft -> reviewed"},
        {"userName": "[Redacted] Author", "userRole": "Design Engineer", "action": "CREATE", "record": "F-A-18D Annual Structural Integrity Report", "changeDesc": "null -> draft"},
    ]
    for a in audit_entries:
        create_audit(AuditCreate(**a))
    
    # --- SLEP ---
    slep_entries = [
        {"aircraftId": "AC-03", "slepRef": "SLEP-AC-03-001", "originalLimit": 6000, "extendedLimit": 5134.2, "approvalDate": "2023-06-15", "status": "Approved", "notes": "Reduced limit per Ref F. SLEP available."},
        {"aircraftId": "AC-04", "slepRef": "SLEP-AC-04-001", "originalLimit": 6000, "extendedLimit": 5549.0, "approvalDate": "2023-08-20", "status": "Approved", "notes": "Reduced limit per Ref F. SLEP available."},
    ]
    for s in slep_entries:
        create_slep(SlepCreate(**s))
    
    # --- CONDITION REPORTS ---
    condition_reports = [
        {"reportId": "G7GA/ENG/ACR/2022/M45-01(R0)", "aircraftId": "AC-01", "reportType": "LPM12Y ACR", "reportDate": "11 Jan 2023", "programme": "LPM12Y", "dateIn": "26/07/2021", "dateOut": "31/12/2022", "totalTaskCards": 1381, "surfaceFindingsTotal": 163, "surfaceTreatmentCount": 78, "repairCount": 66, "partReplacementCount": 19, "ncrdTotal": 39, "ncrdIncorporated": 30, "ncrdOnHold": 9, "ncrdSignificant": 7, "ncrdBlackLine": 1, "ewisFindings": "17 (9 shielding)", "mlgNote": "MLG L/H and R/H — both recommended for overhaul at depot", "fuelLeaksStatus": "Completed", "hydraulicLeaksStatus": "Completed — 12 components identified", "weighingStatus": "Completed", "recommendations": '[{"id":"R1","text":"Monitor defects for fleet evaluation."},{"id":"R2","text":"Develop local disposition for RH Inner Wing Rib crack."},{"id":"R3","text":"Expand IFD inspections."}]'},
        {"reportId": "M45-07-CR", "aircraftId": "AC-07", "reportType": "LPM12Y ACR", "reportDate": "28 May 2024", "programme": "LPM12Y", "dateIn": "02/02/2023", "dateOut": "30/04/2024", "totalTaskCards": 1350, "surfaceFindingsTotal": 68, "surfaceTreatmentCount": 32, "repairCount": 25, "partReplacementCount": 11, "ncrdTotal": 36, "ncrdIncorporated": 28, "ncrdOnHold": 0, "ncrdSignificant": 5, "ncrdBlackLine": 2, "ewisFindings": "13 (0 shielding)", "mlgNote": "MLG overhauled at depot. Fuel Tank No.2 re-lifed from AC-01 via Rosebank Engineering.", "fuelLeaksStatus": "Completed", "hydraulicLeaksStatus": "Completed", "weighingStatus": "Completed"},
    ]
    for cr in condition_reports:
        create_condition_report(ConditionReportCreate(**cr))
    
    # --- USERS ---
    users = [
        {"username": "admin", "email": "admin@asi.com", "password": "admin123", "role": "admin"},
        {"username": "engineer", "email": "engineer@asi.com", "password": "eng123", "role": "engineer"},
        {"username": "viewer", "email": "viewer@asi.com", "password": "view123", "role": "viewer"},
    ]
    for u in users:
        create_user(UserCreate(**u))
    
    return {"ok": True, "message": "Database seeded with FA-18D report data"}


# ========== 15. DOCUMENT INGESTION ENDPOINTS ==========

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/ingest/upload")
async def upload_document(
    file: UploadFile = File(...),
    sheet_name: Optional[str] = Query(None)
):
    """Upload a document for AI ingestion. Supports PDF, Excel, CSV, Word, TIFF.
    
    Parameters:
    - sheet_name: For Excel files, specify which sheet to parse. Use "ALL" to parse all sheets.
    
    NOTE: Data is now automatically approved and persisted to MySQL database.
    """
    global ingest_id_seq
    from ingestion import ingest_document, route_to_api
    
    content = await file.read()
    
    # Run ingestion pipeline using content in memory
    try:
        # Treat empty string as None
        sheet = sheet_name if sheet_name else None
        result = await ingest_document(content, file.filename, sheet_name=sheet)
        
        # Add to ingested docs registry
        doc_id = f"DOC-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        ingested_doc_db[doc_id] = {
            "id": ingest_id_seq,
            "docId": doc_id,
            "filename": file.filename,
            "fileType": os.path.splitext(file.filename)[1].lstrip('.') if '.' in file.filename else 'unknown',
            "fileSize": f"{len(content) / 1024:.1f} KB",
            "uploadDate": datetime.now().isoformat(),
            "pageCount": result.get("row_count", 0),
            "entityCount": len(result.get("entities", [])),
            "status": "indexed",  # Auto-approve
            "extractedEntities": json.dumps(result.get("entities", [])),
        }
        ingest_id_seq += 1
        result["docId"] = doc_id
        
        # Auto-approve: route data to database immediately
        entities = result.get("entities", [])
        detected_types = result.get("detected_types", [])
        
        # Parse Excel into complete records if it's an Excel file
        parsed_records = None
        ext = os.path.splitext(file.filename)[1].lower()
        if ext in ['.xls', '.xlsx']:
            from ingestion import parse_excel_all_sheets, parse_sheet_to_records, SHEET_TO_TABLE
            import tempfile
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                tmp.write(content)
                tmp_path = tmp.name
            try:
                sheets_data = parse_excel_all_sheets(tmp_path)
                parsed_records = {}
                for sheet_name, (h, r) in sheets_data.items():
                    records = parse_sheet_to_records(sheet_name, h, r)
                    if records:
                        table_name = SHEET_TO_TABLE.get(sheet_name, sheet_name)
                        parsed_records[table_name] = records
            finally:
                os.unlink(tmp_path)
        
        routing_result = await route_to_api(entities, detected_types, parsed_records)
        result["routing"] = routing_result
        result["status"] = "indexed"
        
        return result
    except Exception as e:
        # Log the full error with traceback
        import traceback
        error_detail = f"Ingestion failed: {str(e)}\n{traceback.format_exc()}"
        print(f"ERROR: {error_detail}")  # Print to console
        raise HTTPException(500, f"Ingestion failed: {str(e)}")


@app.post("/api/ingest/approve/{doc_id}")
async def approve_ingestion(doc_id: str):
    """Approve the ingestion and route data to correct API endpoints.
    
    NOTE: This endpoint is deprecated. Data is now auto-approved on upload.
    Kept for backward compatibility.
    """
    from ingestion import route_to_api
    
    if doc_id not in ingested_doc_db:
        raise HTTPException(404, "Document not found")
    
    doc = ingested_doc_db[doc_id]
    entities = json.loads(doc.get("extractedEntities", "[]"))
    detected_types = []  # would need to re-detect or store
    
    # Route to correct tables
    result = await route_to_api(entities, detected_types)
    
    # Mark as indexed
    doc["status"] = "indexed"
    ingested_doc_db[doc_id] = doc
    
    # Log audit
    add_audit("AIIMS System", "AI Ingest", "IMPORT", 
              f"Document: {doc.get('filename', '')}", 
              f"Entities ingested into {len(result)} tables")
    
    return {"ok": True, "routing": result, "docId": doc_id}


@app.post("/api/ingest/reject/{doc_id}")
async def reject_ingestion(doc_id: str):
    """Reject an ingestion."""
    if doc_id not in ingested_doc_db:
        raise HTTPException(404, "Document not found")
    
    ingested_doc_db[doc_id]["status"] = "rejected"
    add_audit("User", "Engineer", "REJECT", f"Document: {doc_id}", "Ingestion rejected")
    
    return {"ok": True, "message": "Ingestion rejected"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

"""
Document Ingestion Engine
Parses uploaded documents (PDF, Excel, CSV, Word, TIFF) and routes
extracted data to the correct database tables/API endpoints.

Supported data types detected:
- aircraft_registry: Aircraft ID, AFH, status, engines, LPM12Y dates
- flight_data: Strip data with G exceedances, strains, speeds
- fatigue_life_index: WR/WF FLEI, life projections
- mission_severity: OPC codes, mission type, FLEI distribution
- defect_ncrd: NCRD records, cracks, repairs, black line entries
- corrosion_finding: Corrosion grades, locations
- condition_report: LPM12Y programme data
- engineering_report: Generated report content
"""
import csv
import io
import json
import re
import os
import tempfile
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple

# Try optional dependencies
try:
    import openpyxl
    HAS_OPENPYXL = True
except ImportError:
    HAS_OPENPYXL = False

try:
    from pdfminer.high_level import extract_text
    HAS_PDFMINER = False  # set to True if installed
except ImportError:
    HAS_PDFMINER = False

try:
    from PIL import Image
    import pytesseract
    HAS_TESSERACT = False  # set to True if installed
except ImportError:
    HAS_TESSERACT = False

# For Word docs
try:
    import docx
    HAS_DOCX = False
except ImportError:
    HAS_DOCX = False

API_BASE = "http://localhost:8000/api"


# ================== COLUMN NAME MAPPING ==================
# Maps Excel column headers to database field names for each sheet

COLUMN_MAPPING = {
    "Aircraft Registry": {
        "Tail ID": "tailId",
        "BUNO": "buno",
        "AC Type": "acType",
        "Status": "status",
        "Total AFH": "totalAfh",
        "AFH Previous Period": "afhPrevPeriod",
        "AFH Annual Increment": "afhAnnualIncrement",
        "Design Life Limit AFH": "designLifeLimitAfh",
        "PWD Year": "pwdYear",
        "LPM12Y Completed": "lpm12yCompleted",
        "LPM12Y Induction AFH": "lpm12yInductionAfh",
        "LPM12Y Date In": "lpm12yDateIn",
        "LPM12Y Date Out": "lpm12yDateOut",
        "Next Servicing PMI2": "nextServicingPmi2",
        "Engine LH SN": "engineLhSn",
        "Engine LH AFH": "engineLhAfh",
        "Engine RH SN": "engineRhSn",
        "Engine RH AFH": "engineRhAfh",
        "Years in Service": "yearsInService",
        "Strain Gauge Status": "strainGaugeStatus",
        "Total Defects Cumulative": "totalDefectsCum",
        "Defects Latest Cycle": "defectsLatestCycle",
        "Corrosions Latest Cycle": "corrosionsLatestCycle",
        "Life Percent Consumed": "lifePercentConsumed",
        "SLEP Limit AFH": "slepLimitAfh",
        "Notes": "notes",
    },
    "Flight Data": {
        "Strip Number": "stripNumber",
        "Aircraft ID": "aircraftId",
        "Flight Date": "flightDate",
        "Mission Type": "missionType",
        "Profile": "profile",
        "Max G": "maxG",
        "Max Wing Bending (in-lb)": "maxWingBending",
        "G Occurrence 4-5": "gOcc4to5",
        "G Occurrence 5-6": "gOcc5to6",
        "G Occurrence 6-7": "gOcc6to7",
        "G Occurrence 7-8": "gOcc7to8",
        "Strain Wing Rt (µε)": "strainWingRt",
        "Strain Wing Fold (µε)": "strainWingFold",
        "Strain Fwd Fuse (µε)": "strainFwdFuse",
        "Strain L Horz (µε)": "strainLHorz",
        "Strain R Horz (µε)": "strainRHorz",
        "Strain L Vert (µε)": "strainLVert",
        "Strain R Vert (µε)": "strainRVert",
        "Max True Air Speed (kts)": "maxTrueAirSpeed",
        "Flight Hours": "flightHours",
    },
    "Fatigue FLEI": {
        "Aircraft ID": "aircraftId",
        "Period Start": "periodStart",
        "Period End": "periodEnd",
        "WR FLEI Current": "wrFleiCurrent",
        "WF FLEI Current": "wfFleiCurrent",
        "WR FLEI Annual Delta": "wrFleiAnnualDelta",
        "Usage Gradient": "usageGradient",
        "Est FLEI at 6000 AFH": "estFleiAt6000Afh",
        "Est Year FLEI=1.0": "estYearFlei1",
        "Est AFH at FLEI=1.0": "estAfhAtFlei1",
    },
    "Mission Severity": {
        "Aircraft ID": "aircraftId",
        "OPC Code": "opcCode",
        "Mission Type Name": "missionTypeName",
        "Missions Count": "missionsCount",
        "Avg FLEI per Mission": "avgFleiPerMission",
        "WR FLEI Sum": "wrFleiSum",
        "Percent of Total": "percentOfTotal",
    },
    "Defects NCRD": {
        "NCRD Ref": "ncrdRef",
        "Aircraft ID": "aircraftId",
        "Title": "title",
        "Location": "location",
        "Type": "type",
        "Part Number": "partNumber",
        "Date Found": "dateFound",
        "Severity": "severity",
        "Status": "status",
        "ASDR Number": "asdrNumber",
        "Description": "description",
        "Fleet Wide": "fleetWide",
        "Critical Structure": "criticalStructure",
        "Is Black Line Entry": "isBlackLineEntry",
        "Engineering Order": "engineeringOrder",
        "Draft": "draft",
        "Verified": "verified",
        "Approved": "approved",
    },
    "Corrosion": {
        "Corrosion ID": "corrosionId",
        "Aircraft ID": "aircraftId",
        "Location": "location",
        "Description": "description",
        "ASDR Number": "asdrNumber",
        "Date Found": "dateFound",
        "Grade": "grade",
    },
}

# Map sheet names to table names
SHEET_TO_TABLE = {
    "Aircraft Registry": "aircraft_registry",
    "Flight Data": "flight_data",
    "Fatigue FLEI": "fatigue_life_index",
    "Mission Severity": "mission_severity_contribution",
    "Defects NCRD": "defect_ncrd",
    "Corrosion": "corrosion_finding",
}


def parse_sheet_to_records(sheet_name: str, headers: List[str], rows: List[List[str]]) -> List[Dict]:
    """Parse a sheet's rows into complete records using column mapping."""
    if sheet_name not in COLUMN_MAPPING:
        return []
    
    mapping = COLUMN_MAPPING[sheet_name]
    records = []
    
    for row in rows:
        record = {}
        for idx, header in enumerate(headers):
            # Clean header (remove sheet name prefix if present)
            clean_header = header
            if header.startswith(f"[{sheet_name}] "):
                clean_header = header[len(f"[{sheet_name}] "):]
            
            # Also try without the prefix
            if clean_header not in mapping:
                # Try to find a match by checking if any mapping key is in the header
                for map_key, map_val in mapping.items():
                    if map_key.lower() in clean_header.lower() or clean_header.lower() in map_key.lower():
                        clean_header = map_key
                        break
            
            if clean_header in mapping:
                field_name = mapping[clean_header]
                value = row[idx] if idx < len(row) else ""
                
                # Skip empty values
                if value is None or value == "" or value == "None":
                    continue
                
                # Convert string values to appropriate types
                if field_name in ["totalAfh", "afhPrevPeriod", "afhAnnualIncrement", 
                                  "lpm12yInductionAfh", "engineLhAfh", "engineRhAfh",
                                  "lifePercentConsumed", "slepLimitAfh",
                                  "maxG", "maxWingBending", "maxTrueAirSpeed", "flightHours",
                                  "wrFleiCurrent", "wfFleiCurrent", "wrFleiAnnualDelta",
                                  "usageGradient", "estFleiAt6000Afh", "estAfhAtFlei1",
                                  "avgFleiPerMission", "wrFleiSum",
                                  "originalLimit", "extendedLimit"]:
                    try:
                        record[field_name] = float(value)
                    except (ValueError, TypeError):
                        pass
                elif field_name in ["designLifeLimitAfh", "pwdYear", "yearsInService",
                                    "totalDefectsCum", "defectsLatestCycle", "corrosionsLatestCycle",
                                    "gOcc4to5", "gOcc5to6", "gOcc6to7", "gOcc7to8",
                                    "strainWingRt", "strainWingFold", "strainFwdFuse",
                                    "strainLHorz", "strainRHorz", "strainLVert", "strainRVert",
                                    "missionsCount", "estYearFlei1"]:
                    try:
                        record[field_name] = int(float(value))
                    except (ValueError, TypeError):
                        pass
                elif field_name in ["lpm12yCompleted", "criticalStructure", 
                                    "isBlackLineEntry", "draft", "verified", "approved"]:
                    if isinstance(value, bool):
                        record[field_name] = value
                    elif str(value).lower() in ["true", "1", "yes"]:
                        record[field_name] = True
                    elif str(value).lower() in ["false", "0", "no"]:
                        record[field_name] = False
                else:
                    record[field_name] = str(value)
        
        if record:  # Only add non-empty records
            records.append(record)
    
    return records


# ================== DETECTION PATTERNS ==================

# Patterns to classify what type of data a document contains
PATTERNS = {
    "aircraft_registry": {
        "keywords": ["AC-0", "tail number", "BUNO", "AFH", "flight hours", "engine"],
        "columns": ["tail", "afh", "status", "engine", "buno"],
    },
    "flight_data": {
        "keywords": ["strip", "max g", "wing bending", "strain", "exceedance", "g occurrence"],
        "columns": ["strip", "g", "strain", "speed", "flight hours", "mission"],
    },
    "fatigue": {
        "keywords": ["flei", "fatigue", "wr flei", "wf flei", "life index", "pwd"],
        "columns": ["flei", "wr", "wf", "usage", "gradient", "fatigue life"],
    },
    "mission_severity": {
        "keywords": ["opc", "mission", "severity", "air-to-ground", "aerobatics"],
        "columns": ["opc", "mission type", "fleimission", "percent"],
    },
    "defect": {
        "keywords": ["ncrd", "defect", "crack", "repair", "black line", "asdr"],
        "columns": ["ref", "defect", "crack", "location", "severity", "part"],
    },
    "corrosion": {
        "keywords": ["corrosion", "grade", "corr", "fin cap", "vertical tail"],
        "columns": ["corrosion", "grade", "location"],
    },
    "condition_report": {
        "keywords": ["condition report", "lpm12y", "task card", "surface finding", "ncrd total"],
        "columns": ["report", "lpm", "task card", "surface"],
    },
    "engineering_report": {
        "keywords": ["engineering report", "structural integrity", "annual report"],
        "columns": ["report reference", "title", "status"],
    },
}


def detect_document_type(text: str, headers: List[str]) -> List[str]:
    """Detect what types of data are present in the document."""
    text_lower = text.lower()
    headers_lower = [h.lower() for h in headers]
    detected = []
    
    for dtype, patterns in PATTERNS.items():
        score = 0
        for kw in patterns["keywords"]:
            if kw in text_lower:
                score += 1
        for col in patterns["columns"]:
            for h in headers_lower:
                if col in h:
                    score += 2
        if score >= 2:
            detected.append(dtype)
    
    return detected if detected else ["unknown"]


def parse_csv(text: str) -> Tuple[List[str], List[List[str]]]:
    """Parse CSV text content into headers and rows."""
    reader = csv.reader(io.StringIO(text))
    rows = list(reader)
    if not rows:
        return [], []
    return rows[0], rows[1:]


def parse_excel(file_path: str, sheet_name: Optional[str] = None) -> Tuple[List[str], List[List[str]]]:
    """Parse Excel file. If sheet_name is provided, parse that specific sheet.
    If sheet_name is None, parse the active sheet (default behavior)."""
    if not HAS_OPENPYXL:
        return [], []
    wb = None
    try:
        wb = openpyxl.load_workbook(file_path, read_only=True, data_only=True)
        
        # If sheet_name is specified, try to get that sheet
        if sheet_name:
            if sheet_name in wb.sheetnames:
                ws = wb[sheet_name]
            else:
                # Fall back to active sheet if specified sheet not found
                ws = wb.active
        else:
            ws = wb.active
        
        rows = list(ws.iter_rows(values_only=True))
        if not rows:
            return [], []
        headers = [str(c or "") for c in rows[0]]
        data = [[str(c or "") for c in row] for row in rows[1:]]
        return headers, data
    finally:
        # Explicitly close workbook to release file handle on Windows
        if wb:
            wb.close()


def parse_excel_all_sheets(file_path: str) -> Dict[str, Tuple[List[str], List[List[str]]]]:
    """Parse all sheets in an Excel file. Returns dict of {sheet_name: (headers, rows)}."""
    if not HAS_OPENPYXL:
        return {}
    wb = None
    try:
        wb = openpyxl.load_workbook(file_path, read_only=True, data_only=True)
        result = {}
        for sheet_name in wb.sheetnames:
            ws = wb[sheet_name]
            rows = list(ws.iter_rows(values_only=True))
            if rows:
                headers = [str(c or "") for c in rows[0]]
                data = [[str(c or "") for c in row] for row in rows[1:]]
                result[sheet_name] = (headers, data)
        return result
    finally:
        # Explicitly close workbook to release file handle on Windows
        if wb:
            wb.close()


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF."""
    if HAS_PDFMINER:
        return extract_text(file_path)
    return ""


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from Word document."""
    if HAS_DOCX:
        doc = docx.Document(file_path)
        return "\n".join([p.text for p in doc.paragraphs])
    return ""


# ================== ENTITY EXTRACTION ==================

def extract_entities(text: str, headers: List[str], rows: List[List[str]]) -> List[Dict]:
    """Extract structured entities from document content."""
    entities = []
    
    # Aircraft IDs
    ac_matches = re.findall(r'AC-0[1-8]', text)
    seen_ac = set()
    for ac in ac_matches:
        if ac not in seen_ac:
            seen_ac.add(ac)
            entities.append({
                "type": "Aircraft ID",
                "value": ac,
                "confidence": "99%",
                "action": "link",
                "target_table": "aircraft_registry",
                "target_field": "tailId"
            })
    
    # Flight / Strip data
    strip_matches = re.findall(r'[A-Z0-9]{4,}T\d{4}', text)
    for s in strip_matches[:5]:
        entities.append({
            "type": "Flight Strip",
            "value": s,
            "confidence": "97%",
            "action": "create",
            "target_table": "flight_data",
            "target_field": "stripNumber"
        })
    
    # G values
    g_matches = re.findall(r'Max G[:\s]+([\d.]+)', text)
    for g in g_matches[:3]:
        entities.append({
            "type": "Max G",
            "value": g,
            "confidence": "95%",
            "action": "update",
            "target_table": "flight_data",
            "target_field": "maxG"
        })
    
    # FLEI values
    flei_matches = re.findall(r'(?:WR|WF)?\s*FLEI[:\s]+([\d.]+)', text)
    for f in flei_matches[:3]:
        entities.append({
            "type": "FLEI",
            "value": f,
            "confidence": "99%",
            "action": "update",
            "target_table": "fatigue_life_index",
            "target_field": "wrFleiCurrent"
        })
    
    # AFH values
    afh_matches = re.findall(r'(\d{3,4}\.\d{1,2})\s*(?:hr|FH|flight hours)', text)
    for a in afh_matches[:3]:
        entities.append({
            "type": "AFH",
            "value": f"{a} hr",
            "confidence": "97%",
            "action": "update",
            "target_table": "aircraft_registry",
            "target_field": "totalAfh"
        })
    
    # NCRD references
    ncrd_matches = re.findall(r'(?:G7GA|G7)/NCRD/[\w/]+', text)
    for n in ncrd_matches[:5]:
        entities.append({
            "type": "NCRD Reference",
            "value": n,
            "confidence": "99%",
            "action": "create",
            "target_table": "defect_ncrd",
            "target_field": "ncrdRef"
        })
    
    # Defect types
    defect_types = ["Crack", "Corrosion", "Repair", "Gouge", "Deformation", "Scratch"]
    for dt in defect_types:
        if dt.lower() in text.lower():
            entities.append({
                "type": "Defect Type",
                "value": dt,
                "confidence": "96%",
                "action": "create",
                "target_table": "defect_ncrd",
                "target_field": "type"
            })
            break
    
    # Corrosion grades
    grade_matches = re.findall(r'Grade\s*[234]', text)
    for g in grade_matches[:3]:
        entities.append({
            "type": "Corrosion Grade",
            "value": g,
            "confidence": "94%",
            "action": "create",
            "target_table": "corrosion_finding",
            "target_field": "grade"
        })
    
    # Part numbers
    part_matches = re.findall(r'74A\d{2}-\d{2}-\d{4}', text)
    for p in part_matches[:3]:
        entities.append({
            "type": "Part No",
            "value": p,
            "confidence": "99%",
            "action": "link",
            "target_table": "defect_ncrd",
            "target_field": "partNumber"
        })
    
    # Locations
    location_keywords = ["Wing", "Fuselage", "Stabiliser", "Vertical Tail", "Fin Cap", "Rib", "Spar"]
    for loc in location_keywords:
        if loc.lower() in text.lower():
            entities.append({
                "type": "Location",
                "value": loc,
                "confidence": "91%",
                "action": "create",
                "target_table": "defect_ncrd",
                "target_field": "location"
            })
            break
    
    # PII check
    pii_patterns = [
        r'\b[A-Z][a-z]+ [A-Z][a-z]+\b',  # Name Surname
        r'\b\d{12}\b',  # 12-digit numbers
    ]
    for pattern in pii_patterns:
        if re.search(pattern, text):
            entities.append({
                "type": "[PII REMOVED]",
                "value": "Authority redacted",
                "confidence": "99%",
                "action": "anonymised",
                "target_table": None,
                "target_field": None
            })
            break
    
    # Extract from structured rows if CSV/Excel
    if headers and rows:
        for header_idx, header in enumerate(headers):
            h = header.lower()
            if "tail" in h or "aircraft" in h or "ac" == h.strip().lower():
                for row in rows[:10]:
                    if header_idx < len(row) and row[header_idx].startswith("AC-"):
                        val = row[header_idx]
                        if val not in seen_ac:
                            seen_ac.add(val)
                            entities.append({
                                "type": "Aircraft ID (table)",
                                "value": val,
                                "confidence": "99%",
                                "action": "link",
                                "target_table": "aircraft_registry",
                                "target_field": "tailId"
                            })
    
    return entities


def build_proposed_updates(entities: List[Dict]) -> List[Dict]:
    """Summarize what database updates are proposed based on extracted entities."""
    updates = []
    tables_seen = set()
    for e in entities:
        table = e.get("target_table")
        if table and table not in tables_seen:
            tables_seen.add(table)
    
    table_labels = {
        "aircraft_registry": "Aircraft records",
        "flight_data": "Flight data",
        "fatigue_life_index": "FLEI updates",
        "mission_severity_contribution": "Mission severity",
        "defect_ncrd": "Defect records",
        "corrosion_finding": "Corrosion",
        "condition_report": "Condition reports",
        "engineering_report": "Engineering reports",
    }
    for table in tables_seen:
        updates.append({
            "label": table_labels.get(table, table),
            "value": f"{len([e for e in entities if e.get('target_table') == table])} entities"
        })
    return updates


def build_header_tags(detected_types: List[str]) -> List[Dict]:
    """Build UI tags showing what data was found."""
    tag_map = {
        "aircraft_registry": "Aircraft data",
        "flight_data": "Flight records",
        "fatigue": "FLEI data",
        "mission_severity": "Mission severity",
        "defect": "Defect/NCRD entries",
        "corrosion": "Corrosion findings",
        "condition_report": "Condition report data",
        "engineering_report": "Engineering report content",
    }
    tags = []
    for dt in detected_types:
        if dt in tag_map:
            tags.append({"label": tag_map[dt]})
    return tags


# ================== MAIN INGEST FUNCTION ==================

async def ingest_document(file_content_or_path: Any, filename: str, sheet_name: Optional[str] = None) -> Dict[str, Any]:
    """
    Main ingestion pipeline.
    Accepts either:
    - A file path string (for backward compatibility)
    - Raw bytes content (from API upload)
    
    Parameters:
    - sheet_name: For Excel files, optionally specify which sheet to parse.
                  If None, parses the active sheet (default).
                  Use "ALL" to parse all sheets and combine results.
    
    1. Extract text content based on file type
    2. Detect document type(s)
    3. Extract entities
    4. Build proposed updates
    5. Return everything for user review
    """
    from io import BytesIO
    
    ext = os.path.splitext(filename)[1].lower()
    text = ""
    headers = []
    rows = []
    is_bytes = isinstance(file_content_or_path, bytes)
    
    # Extract text based on file type
    if ext in ['.csv']:
        if is_bytes:
            content_str = file_content_or_path.decode('utf-8', errors='ignore')
        else:
            with open(file_content_or_path, 'r', encoding='utf-8', errors='ignore') as f:
                content_str = f.read()
        headers, rows = parse_csv(content_str)
        text = content_str
    elif ext in ['.xls', '.xlsx']:
        if is_bytes:
            import tempfile
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                tmp.write(file_content_or_path)
                tmp_path = tmp.name
            try:
                # Support multi-sheet Excel
                if sheet_name == "ALL":
                    sheets_data = parse_excel_all_sheets(tmp_path)
                    # Combine all sheets
                    all_headers = []
                    all_rows = []
                    for sheet, (h, r) in sheets_data.items():
                        all_headers.extend([f"[{sheet}] {col}" for col in h])
                        all_rows.extend(r)
                    headers = all_headers
                    rows = all_rows
                    text = "\n".join(headers) + "\n" + "\n".join(["\t".join(r) for r in rows])
                else:
                    headers, rows = parse_excel(tmp_path, sheet_name)
                    text = "\n".join(headers) + "\n" + "\n".join(["\t".join(r) for r in rows])
            finally:
                os.unlink(tmp_path)
        else:
            # Support multi-sheet Excel
            if sheet_name == "ALL":
                sheets_data = parse_excel_all_sheets(file_content_or_path)
                all_headers = []
                all_rows = []
                for sheet, (h, r) in sheets_data.items():
                    all_headers.extend([f"[{sheet}] {col}" for col in h])
                    all_rows.extend(r)
                headers = all_headers
                rows = all_rows
                text = "\n".join(headers) + "\n" + "\n".join(["\t".join(r) for r in rows])
            else:
                headers, rows = parse_excel(file_content_or_path, sheet_name)
                text = "\n".join(headers) + "\n" + "\n".join(["\t".join(r) for r in rows])
    elif ext in ['.pdf']:
        if is_bytes:
            import tempfile
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
                tmp.write(file_content_or_path)
                tmp_path = tmp.name
            try:
                text = extract_text_from_pdf(tmp_path)
            finally:
                os.unlink(tmp_path)
        else:
            text = extract_text_from_pdf(file_content_or_path)
    elif ext in ['.doc', '.docx']:
        if is_bytes:
            import tempfile
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                tmp.write(file_content_or_path)
                tmp_path = tmp.name
            try:
                text = extract_text_from_docx(tmp_path)
            finally:
                os.unlink(tmp_path)
        else:
            text = extract_text_from_docx(file_content_or_path)
    elif ext in ['.tiff', '.tif', '.png', '.jpg', '.jpeg']:
        if is_bytes:
            img = Image.open(BytesIO(file_content_or_path))
        else:
            img = Image.open(file_content_or_path)
        if HAS_TESSERACT:
            text = pytesseract.image_to_string(img)
    else:
        # Try as plain text
        if is_bytes:
            text = file_content_or_path.decode('utf-8', errors='ignore')
        else:
            try:
                with open(file_content_or_path, 'r', encoding='utf-8', errors='ignore') as f:
                    text = f.read()
            except:
                pass
    
    # Detect document types
    detected_types = detect_document_type(text, headers)
    
    # Extract entities
    entities = extract_entities(text, headers, rows)
    
    # Build proposed updates
    updates = build_proposed_updates(entities)
    tags = build_header_tags(detected_types)
    
    return {
        "filename": filename,
        "text_length": len(text),
        "detected_types": detected_types,
        "entities": entities,
        "proposed_updates": updates,
        "header_tags": tags,
        "row_count": len(rows),
        "column_count": len(headers),
        "sheet_parsed": sheet_name if sheet_name else "active",
    }


def get_create_payloads(entities: List[Dict], detected_types: List[str]) -> Dict[str, List[Dict]]:
    """Group entities by target table and build create/update payloads."""
    payloads: Dict[str, List[Dict]] = {}
    
    for e in entities:
        table = e.get("target_table")
        if not table:
            continue
        if table not in payloads:
            payloads[table] = []
        
        # Build a minimal record based on what we know
        payloads[table].append({
            "field": e.get("target_field"),
            "value": e.get("value"),
            "confidence": e.get("confidence"),
        })
    
    return payloads


async def route_to_api(entities: List[Dict], detected_types: List[str], parsed_records: Dict[str, List[Dict]] = None) -> Dict[str, Any]:
    """
    Route extracted data to the correct database tables using Prisma upsert.
    If parsed_records is provided, uses complete records from Excel parsing.
    Otherwise, falls back to entity-based approach (for PDFs, etc.).
    """
    from main import upsert_aircraft, upsert_flight, upsert_fatigue, upsert_mission_severity, upsert_defect, upsert_corrosion, prisma
    
    # Ensure Prisma is connected before using it
    try:
        await prisma.connect()
    except Exception:
        # Already connected, ignore error
        pass
    
    results = {}
    
    # If parsed_records is provided, use complete records from Excel parsing
    if parsed_records:
        # Route to aircraft_registry
        if "aircraft_registry" in parsed_records:
            created_count = 0
            updated_count = 0
            for record in parsed_records["aircraft_registry"]:
                result = await upsert_aircraft(record)
                if result.get("action") == "created":
                    created_count += 1
                else:
                    updated_count += 1
            results["aircraft_registry"] = {
                "created": created_count,
                "updated": updated_count,
                "note": "Aircraft records upserted by tailId"
            }
        
        # Route to flight_data
        if "flight_data" in parsed_records:
            created_count = 0
            updated_count = 0
            for record in parsed_records["flight_data"]:
                # Ensure flightDate is a datetime object
                if "flightDate" not in record or not record["flightDate"]:
                    record["flightDate"] = datetime.now()
                elif isinstance(record["flightDate"], str):
                    record["flightDate"] = datetime.now()
                result = await upsert_flight(record)
                if result.get("action") == "created":
                    created_count += 1
                else:
                    updated_count += 1
            results["flight_data"] = {
                "created": created_count,
                "updated": updated_count,
                "note": "Flight records upserted by stripNumber"
            }
        
        # Route to fatigue_life_index
        if "fatigue_life_index" in parsed_records:
            created_count = 0
            updated_count = 0
            for record in parsed_records["fatigue_life_index"]:
                result = await upsert_fatigue(record)
                if result.get("action") == "created":
                    created_count += 1
                else:
                    updated_count += 1
            results["fatigue_life_index"] = {
                "created": created_count,
                "updated": updated_count,
                "note": "FLEI records upserted by aircraftId"
            }
        
        # Route to mission_severity_contribution
        if "mission_severity_contribution" in parsed_records:
            created_count = 0
            updated_count = 0
            for record in parsed_records["mission_severity_contribution"]:
                result = await upsert_mission_severity(record)
                if result.get("action") == "created":
                    created_count += 1
                else:
                    updated_count += 1
            results["mission_severity_contribution"] = {
                "created": created_count,
                "updated": updated_count,
                "note": "Mission severity records upserted by aircraftId + opcCode"
            }
        
        # Route to defect_ncrd
        if "defect_ncrd" in parsed_records:
            created_count = 0
            updated_count = 0
            for record in parsed_records["defect_ncrd"]:
                result = await upsert_defect(record)
                if result.get("action") == "created":
                    created_count += 1
                else:
                    updated_count += 1
            results["defect_ncrd"] = {
                "created": created_count,
                "updated": updated_count,
                "note": "Defect records upserted by ncrdRef"
            }
        
        # Route to corrosion_finding
        if "corrosion_finding" in parsed_records:
            created_count = 0
            updated_count = 0
            for record in parsed_records["corrosion_finding"]:
                result = await upsert_corrosion(record)
                if result.get("action") == "created":
                    created_count += 1
                else:
                    updated_count += 1
            results["corrosion_finding"] = {
                "created": created_count,
                "updated": updated_count,
                "note": "Corrosion records upserted by corrosionId"
            }
        
        return results
    
    # Fall back to entity-based approach (for PDFs, etc.)
    # Group entities by target table
    entities_by_table: Dict[str, List[Dict]] = {}
    for e in entities:
        table = e.get("target_table")
        if table:
            if table not in entities_by_table:
                entities_by_table[table] = []
            entities_by_table[table].append(e)
    
    # Route to aircraft_registry
    if "aircraft_registry" in entities_by_table:
        ac_entities = entities_by_table["aircraft_registry"]
        created_count = 0
        updated_count = 0
        for e in ac_entities:
            if e.get("target_field") == "tailId" and e.get("value", "").startswith("AC-"):
                ac_data = {"tailId": e["value"]}
                result = await upsert_aircraft(ac_data)
                if result.get("action") == "created":
                    created_count += 1
                else:
                    updated_count += 1
        results["aircraft_registry"] = {
            "created": created_count,
            "updated": updated_count,
            "note": "Aircraft records upserted by tailId"
        }
    
    # Route to flight_data
    if "flight_data" in entities_by_table:
        flight_entities = entities_by_table["flight_data"]
        created_count = 0
        updated_count = 0
        for e in flight_entities:
            if e.get("target_field") == "stripNumber":
                flight_data = {
                    "stripNumber": e["value"], 
                    "aircraftId": "AC-01",
                    "flightDate": datetime.now()
                }
                result = await upsert_flight(flight_data)
                if result.get("action") == "created":
                    created_count += 1
                else:
                    updated_count += 1
        results["flight_data"] = {
            "created": created_count,
            "updated": updated_count,
            "note": "Flight records upserted by stripNumber"
        }
    
    # Route to defect_ncrd
    if "defect_ncrd" in entities_by_table:
        defect_entities = entities_by_table["defect_ncrd"]
        created_count = 0
        updated_count = 0
        for e in defect_entities:
            if e.get("target_field") == "ncrdRef":
                defect_data = {"ncrdRef": e["value"], "aircraftId": "AC-01"}
                result = await upsert_defect(defect_data)
                if result.get("action") == "created":
                    created_count += 1
                else:
                    updated_count += 1
        results["defect_ncrd"] = {
            "created": created_count,
            "updated": updated_count,
            "note": "Defect records upserted by ncrdRef"
        }
    
    # Route to corrosion_finding
    if "corrosion_finding" in entities_by_table:
        corrosion_entities = entities_by_table["corrosion_finding"]
        created_count = 0
        updated_count = 0
        import uuid
        for e in corrosion_entities:
            corrosion_id = f"CORR-{uuid.uuid4().hex[:8].upper()}"
            corrosion_data = {
                "corrosionId": corrosion_id,
                "aircraftId": "AC-01",
                "grade": e.get("value", "") if e.get("target_field") == "grade" else None,
                "location": e.get("value", "") if e.get("target_field") == "location" else None,
            }
            corrosion_data = {k: v for k, v in corrosion_data.items() if v is not None}
            result = await upsert_corrosion(corrosion_data)
            if result.get("action") == "created":
                created_count += 1
            else:
                updated_count += 1
        results["corrosion_finding"] = {
            "created": created_count,
            "updated": updated_count,
            "note": "Corrosion records upserted by corrosionId"
        }
    
    # Route to fatigue_life_index
    if "fatigue_life_index" in entities_by_table:
        fatigue_entities = entities_by_table["fatigue_life_index"]
        created_count = 0
        updated_count = 0
        for e in fatigue_entities:
            fatigue_data = {"aircraftId": "AC-01"}
            if e.get("target_field") == "wrFleiCurrent":
                try:
                    fatigue_data["wrFleiCurrent"] = float(e.get("value", "0"))
                except (ValueError, TypeError):
                    pass
            result = await upsert_fatigue(fatigue_data)
            if result.get("action") == "created":
                created_count += 1
            else:
                updated_count += 1
        results["fatigue_life_index"] = {
            "created": created_count,
            "updated": updated_count,
            "note": "FLEI records upserted by aircraftId"
        }
    
    # Route to mission_severity_contribution
    if "mission_severity_contribution" in entities_by_table:
        mission_entities = entities_by_table["mission_severity_contribution"]
        created_count = 0
        updated_count = 0
        for e in mission_entities:
            opc_code = e.get("value", "01") if e.get("target_field") == "opcCode" else "01"
            mission_data = {"aircraftId": "AC-01", "opcCode": opc_code}
            result = await upsert_mission_severity(mission_data)
            if result.get("action") == "created":
                created_count += 1
            else:
                updated_count += 1
        results["mission_severity_contribution"] = {
            "created": created_count,
            "updated": updated_count,
            "note": "Mission severity records upserted by aircraftId + opcCode"
        }
    
    return results

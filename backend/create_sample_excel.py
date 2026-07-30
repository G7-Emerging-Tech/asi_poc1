"""
Create a sample Excel template with 6 sheets for Document Intelligence ingestion.
Run this script to generate: uploads/ASI_Master_Data_Template.xlsx

The column names in this file MUST match the COLUMN_MAPPING in ingestion.py
so that the ingestion engine can correctly map Excel columns to database fields.
"""
import openpyxl
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
import os

# Create output directory
os.makedirs("uploads", exist_ok=True)

wb = Workbook()

# Common styles
header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
header_font = Font(color="FFFFFF", bold=True, size=11)
border = Border(
    left=Side(style='thin'),
    right=Side(style='thin'),
    top=Side(style='thin'),
    bottom=Side(style='thin')
)

# ==================== SHEET 1: Aircraft Registry ====================
ws1 = wb.active
ws1.title = "Aircraft Registry"

# Column names MUST match COLUMN_MAPPING in ingestion.py
headers1 = [
    "Tail ID", "BUNO", "AC Type", "Status", "Total AFH", "AFH Previous Period",
    "AFH Annual Increment", "Design Life Limit AFH", "PWD Year", "LPM12Y Completed",
    "LPM12Y Induction AFH", "LPM12Y Date In", "LPM12Y Date Out", "Next Servicing PMI2",
    "Engine LH SN", "Engine LH AFH", "Engine RH SN", "Engine RH AFH",
    "Years in Service", "Strain Gauge Status", "Total Defects Cumulative",
    "Defects Latest Cycle", "Corrosions Latest Cycle", "Life Percent Consumed",
    "SLEP Limit AFH", "Notes"
]

ws1.append(headers1)
for cell in ws1[1]:
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    cell.border = border

# Sample data - 3 aircraft
aircraft_data = [
    ["AC-01", "165207", "F/A-18D", "operational", 5448.82, 5210.63,
     228.19, 6000, 2025, True,
     5943.8, "26/07/2021", "31/12/2022", "2028",
     "E946016", 3585.7, "E946011", 4025.2,
     25, "Error - replaced", 108,
     60, 7, 91.0,
     None, "Due for SLEP assessment"],
    
    ["AC-02", "165219", "F/A-18D", "maintenance", 5210.63, 4982.44,
     228.19, 6000, 2026, False,
     None, None, None, "2029",
     "E946017", 3700.2, "E946012", 3890.5,
     24, "OK", 95,
     52, 5, 87.0,
     5134.2, None],
    
    ["AC-03", "165221", "F/A-18D", "operational", 4104.7, 3980.5,
     124.2, 6000, 2028, True,
     4104.7, "01/07/2024", "06/03/2026", "2031",
     "E946019", 2100.0, "E946014", 2050.0,
     29, "Normal", 35,
     12, 0, 68.0,
     None, "Cleanest surface in fleet"],
]

for row in aircraft_data:
    ws1.append(row)

# Adjust column widths
for col in ws1.columns:
    max_length = 0
    column = col[0].column_letter
    for cell in col:
        try:
            if cell.value:
                max_length = max(max_length, len(str(cell.value)))
        except:
            pass
    adjusted_width = min(max_length + 2, 40)
    ws1.column_dimensions[column].width = adjusted_width

# ==================== SHEET 2: Flight Data ====================
ws2 = wb.create_sheet("Flight Data")

# Column names MUST match COLUMN_MAPPING in ingestion.py
headers2 = [
    "Strip Number", "Aircraft ID", "Flight Date", "Mission Type", "Profile",
    "Max G", "Max Wing Bending (in-lb)", "G Occurrence 4-5", "G Occurrence 5-6",
    "G Occurrence 6-7", "G Occurrence 7-8", "Strain Wing Rt",
    "Strain Wing Fold", "Strain Fwd Fuse", "Strain L Horz",
    "Strain R Horz", "Strain L Vert", "Strain R Vert",
    "Max True Air Speed (kts)", "Flight Hours"
]

ws2.append(headers2)
for cell in ws2[1]:
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    cell.border = border

# Sample data - 4 flights with DIFFERENT strip numbers
flight_data = [
    ["B4504D20200520T1514", "AC-01", "20/5/2020", "FFRM", "A1450",
     4.61, 4289408, 24, 58,
     12, 0, 1232,
     216, 8, 512,
     1224, 632, 1104,
     480.06, 1.45],
    
    ["B4504D20200520T1515", "AC-01", "20/5/2020", "GAT/JDAM/ATG", "A1450",
     6.48, 5572096, 24, 58,
     12, 0, 1584,
     376, -56, 936,
     1456, 176, 560,
     543.06, 1.45],
    
    ["B4504D20200615T0930", "AC-02", "15/6/2020", "FFRM", "A1450",
     5.23, 4892000, 18, 42,
     8, 0, 1340,
     280, 12, 580,
     1180, 590, 1020,
     510.5, 1.8],
    
    ["B4504D20200722T1410", "AC-03", "22/7/2020", "Air-to-Air", "B2200",
     7.12, 6234000, 30, 65,
     15, 2, 1680,
     420, -20, 1050,
     1620, 210, 680,
     580.2, 2.1],
]

for row in flight_data:
    ws2.append(row)

for col in ws2.columns:
    max_length = 0
    column = col[0].column_letter
    for cell in col:
        try:
            if cell.value:
                max_length = max(max_length, len(str(cell.value)))
        except:
            pass
    adjusted_width = min(max_length + 2, 40)
    ws2.column_dimensions[column].width = adjusted_width

# ==================== SHEET 3: Fatigue FLEI ====================
ws3 = wb.create_sheet("Fatigue FLEI")

# Column names MUST match COLUMN_MAPPING in ingestion.py
headers3 = [
    "Aircraft ID", "Period Start", "Period End", "WR FLEI Current", "WF FLEI Current",
    "WR FLEI Annual Delta", "Usage Gradient", "Est FLEI at 6000 AFH",
    "Est Year FLEI=1.0", "Est AFH at FLEI=1.0"
]

ws3.append(headers3)
for cell in ws3[1]:
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    cell.border = border

# Sample data - 3 fatigue records
fatigue_data = [
    ["AC-01", "2024-01-01", "2024-12-31", 0.4387, 0.0968,
     0.01882, 8.249e-5, 0.495,
     2043, 12122.42],
    
    ["AC-02", "2024-01-01", "2024-12-31", 0.3952, 0.0854,
     0.01654, 7.123e-5, 0.462,
     2046, 12850.75],
    
    ["AC-03", "2024-01-01", "2024-12-31", 0.2640, 0.0510,
     0.01200, 7.100e-5, 0.430,
     2049, 12900.00],
]

for row in fatigue_data:
    ws3.append(row)

for col in ws3.columns:
    max_length = 0
    column = col[0].column_letter
    for cell in col:
        try:
            if cell.value:
                max_length = max(max_length, len(str(cell.value)))
        except:
            pass
    adjusted_width = min(max_length + 2, 40)
    ws3.column_dimensions[column].width = adjusted_width

# ==================== SHEET 4: Mission Severity ====================
ws4 = wb.create_sheet("Mission Severity")

# Column names MUST match COLUMN_MAPPING in ingestion.py
headers4 = [
    "Aircraft ID", "OPC Code", "Mission Type Name", "Missions Count",
    "Avg FLEI per Mission", "WR FLEI Sum", "Percent of Total"
]

ws4.append(headers4)
for cell in ws4[1]:
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    cell.border = border

# Sample data - 4 mission severity records
mission_data = [
    ["AC-01", "01", "FAM/Ferry/Navigation", 198,
     2.307e-5, 0.004726, "12%"],
    
    ["AC-01", "02", "Air-to-Air Engagement", 312,
     2.387e-5, 0.007199, "18%"],
    
    ["AC-01", "03", "Air-to-Ground Training", 420,
     6.3e-5, 0.02645, "68%"],
    
    ["AC-01", "04", "Aerobatics (LLA/LAT)", 12,
     6.732e-5, 0.0008079, "2%"],
]

for row in mission_data:
    ws4.append(row)

for col in ws4.columns:
    max_length = 0
    column = col[0].column_letter
    for cell in col:
        try:
            if cell.value:
                max_length = max(max_length, len(str(cell.value)))
        except:
            pass
    adjusted_width = min(max_length + 2, 40)
    ws4.column_dimensions[column].width = adjusted_width

# ==================== SHEET 5: Defects NCRD ====================
ws5 = wb.create_sheet("Defects NCRD")

# Column names MUST match COLUMN_MAPPING in ingestion.py
headers5 = [
    "NCRD Ref", "Aircraft ID", "Title", "Location", "Type", "Part Number",
    "Date Found", "Severity", "Status", "ASDR Number", "Description",
    "Fleet Wide", "Critical Structure", "Is Black Line Entry",
    "Engineering Order", "Draft", "Verified", "Approved"
]

ws5.append(headers5)
for cell in ws5[1]:
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    cell.border = border

# Sample data - 3 defect records
defect_data = [
    ["G7GA/NCRD/2022/0012", "AC-01", "Crack on RH Inner Wing Rib", "RH Inner Wing",
     "Crack", "74A23-78-1001", "17/1/2023", "major", "Repair Completed",
     "S18DF-06072023-0009", "Full text description of the defect",
     "No", True, False,
     "G7GA-ER-2108-002(R0)", False, True, True],
    
    ["G7GA/NCRD/2022/0013", "AC-03", "Corrosion on LH Vertical Tail", "LH Vertical Tail",
     "Corrosion", "74A45-82-2003", "22/2/2023", "critical", "Open",
     "S18DF-08072023-0011", "Full text description of the corrosion",
     "Possible", True, True,
     None, False, False, False],
    
    ["G7GA/NCRD/2022/0014", "AC-02", "Deformed Former", "Forward Fuselage",
     "Deformation", "74A55-91-3005", "15/3/2023", "minor", "Repair Completed",
     "S18DF-10072023-0015", "Former deformed during maintenance",
     "No", False, False,
     "G7GA-ER-2108-003(R0)", False, True, True],
]

for row in defect_data:
    ws5.append(row)

for col in ws5.columns:
    max_length = 0
    column = col[0].column_letter
    for cell in col:
        try:
            if cell.value:
                max_length = max(max_length, len(str(cell.value)))
        except:
            pass
    adjusted_width = min(max_length + 2, 40)
    ws5.column_dimensions[column].width = adjusted_width

# ==================== SHEET 6: Corrosion ====================
ws6 = wb.create_sheet("Corrosion")

# Column names MUST match COLUMN_MAPPING in ingestion.py
headers6 = [
    "Corrosion ID", "Aircraft ID", "Location", "Description",
    "ASDR Number", "Date Found", "Grade"
]

ws6.append(headers6)
for cell in ws6[1]:
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    cell.border = border

# Sample data - 3 corrosion records
corrosion_data = [
    ["C001", "AC-02", "Horizontal Stabiliser", "Sign of corrosion at tip",
     "ASDR-31052023-0001", "31/5/2023", "Grade 2"],
    
    ["C002", "AC-03", "Fin Cap", "Grade 3 corrosion found",
     "ASDR-31052023-0002", "15/6/2023", "Grade 3"],
    
    ["C003", "AC-01", "Door 14L Lower Sills", "Corrosion on lower sills",
     "ASDR-20062023-0005", "20/6/2023", "Grade 2"],
]

for row in corrosion_data:
    ws6.append(row)

for col in ws6.columns:
    max_length = 0
    column = col[0].column_letter
    for cell in col:
        try:
            if cell.value:
                max_length = max(max_length, len(str(cell.value)))
        except:
            pass
    adjusted_width = min(max_length + 2, 40)
    ws6.column_dimensions[column].width = adjusted_width

# Save the workbook
output_path = "uploads/ASI_Master_Data_Template.xlsx"
wb.save(output_path)

print(f"✅ Sample Excel template created: {output_path}")
print(f"   Sheets: {wb.sheetnames}")
print(f"   Total sheets: {len(wb.sheetnames)}")
print(f"   Aircraft Registry: {len(aircraft_data)} rows")
print(f"   Flight Data: {len(flight_data)} rows")
print(f"   Fatigue FLEI: {len(fatigue_data)} rows")
print(f"   Mission Severity: {len(mission_data)} rows")
print(f"   Defects NCRD: {len(defect_data)} rows")
print(f"   Corrosion: {len(corrosion_data)} rows")
print("\nYou can now upload this file to Document Intelligence.")
print("The ingestion engine will parse all 6 sheets and detect the data types.")
print("All fields will be populated in the database (not just unique IDs).")
# ASI POC1 — Master Data Architecture & Requirements Matrix

## Overview

This document maps all frontend pages to their required database tables and FA-18D report data fields. It defines the complete data architecture for the Aircraft Structural Integrity (ASI) system.

---

## 1. Complete List of Frontend Pages (10 Existing + 5 New = 15 Total)

| # | Page | Route | Category | Status |
|---|---|---|---|---|
| 1 | Fleet Dashboard | `/` | Overview | Existing |
| 2 | Fleet Register | `/fleet-register` | Fleet | Existing |
| 3 | Fleet Utilization | `/fleet-utilization` | Fleet | **NEW** |
| 4 | Condition Data | `/condition-data` | Fleet | Existing |
| 5 | Flight Data / Mission Log | `/flight-data` | Flight Data | **NEW** |
| 6 | Strain Gauge Monitoring | `/strain-monitoring` | Flight Data | **NEW** |
| 7 | Fatigue Management | `/fatigue-management` | Structural | Existing |
| 8 | Defect Analytics | `/defect-analytics` | Structural | **NEW** |
| 9 | SLEP (Life Extension) | `/slep` | Structural | **NEW** |
| 10 | Document Intelligence | `/document-intelligence` | Intelligence | Existing |
| 11 | AI Assistant | `/ai-assistant` | Intelligence | Existing |
| 12 | Engineering Reports | `/engineering-reports` | Compliance | Existing |
| 13 | Audit Trail | `/audit-trail` | Compliance | Existing |
| 14 | Admin Roles | `/admin-roles` | System | Existing |
| 15 | Login | `/login` | System | Existing |

---

## 2. Master Database Tables (Prisma Schema — 12 Tables)

### Table 1: `aircraft_registry` — Aircraft Identity & Status
| Column | Type | Source Pages | FA-18D Report Ref |
|---|---|---|---|
| tailId | VARCHAR PK | All pages | AC-01 through AC-08 |
| buno | VARCHAR | Condition, AI Assistant | 165207, 165219, 165221 |
| acType | VARCHAR | Fleet Register | F/A-18D |
| status | ENUM | Fleet Register, Dashboard, Utilization | operational/maintenance/restricted |
| totalAfh | DECIMAL | Fleet Register, Dashboard, Utilization, SLEP | 5,448.82 (AC-01) |
| afhPrevPeriod | DECIMAL | Fleet Register, Utilization | 5,210.63 (AC-01) |
| afhAnnualIncrement | DECIMAL | Fleet Register, Dashboard, Utilization | 228.19 (AC-01) |
| designLifeLimitAfh | INTEGER | Fleet Register, SLEP | 6,000 hr |
| pwdYear | INTEGER | Fleet Register | 2025 (AC-01) |
| lpm12yCompleted | BOOLEAN | Fleet Register, Condition | AC-01/02/07/08 |
| lpm12yInductionAfh | DECIMAL | Condition Data | 5,943.8 (AC-01) |
| lpm12yDateIn | DATE | Condition Data | 26/07/2021 |
| lpm12yDateOut | DATE | Condition Data | 31/12/2022 |
| nextServicingPmi2 | DATE | Condition Data | 2028 |
| engineLhSn | VARCHAR | Fleet Register, Condition | E946016 |
| engineLhAfh | DECIMAL | Condition Data | 3,585.7 FH |
| engineRhSn | VARCHAR | Fleet Register, Condition | E946011 |
| engineRhAfh | DECIMAL | Condition Data | 4,025.2 FH |
| yearsInService | INTEGER | Condition Data | 25 years |
| strainGaugeStatus | VARCHAR | Fleet Register, Strain Monitor | "Error — replaced (resolved)" |
| totalDefectsCum | INTEGER | Fleet Register, Dashboard, Defect Analytics | 108 (AC-01) |
| defectsLatestCycle | INTEGER | Fleet Register, Dashboard, Defect Analytics | 60 |
| corrosionsLatestCycle | INTEGER | Fleet Register, Dashboard | 7 |
| lifePercentConsumed | DECIMAL | Fleet Register, SLEP, Utilization | 91% (AC-01) |
| slepLimitAfh | DECIMAL | SLEP (NEW) | 5,134.2 (AC-03) |
| notes | TEXT | Fleet Register, Utilization | Free text |

### Table 2: `flight_data` — Per-Mission Recorded Data (from CSV)
| Column | Type | Source Pages | FA-18D Report Usage |
|---|---|---|---|
| stripNumber | VARCHAR PK | Flight Data (NEW), Fatigue Mgmt | B4504D20200520T1514 |
| aircraftId | VARCHAR FK | All pages | B4504D → AC association |
| flightDate | DATE | Flight Data (NEW) | 20/5/2020 |
| missionType | VARCHAR | Flight Data, Fatigue Mgmt | FFRM, GAT/JDAM/ATG |
| profile | VARCHAR | Flight Data, Fatigue Mgmt | A1450 |
| maxG | DECIMAL | Flight Data, Fatigue, Dashboard | 4.61, 6.48 |
| maxWingBending | DECIMAL | Flight Data, Fatigue, Dashboard | 4,289,408 / 5,572,096 |
| gOcc4to5 | INTEGER | Flight Data, Fatigue Mgmt | 24 |
| gOcc5to6 | INTEGER | Flight Data, Fatigue Mgmt | 58 |
| gOcc6to7 | INTEGER | Flight Data, Fatigue Mgmt | 12 |
| gOcc7to8 | INTEGER | Flight Data, Fatigue Mgmt | 0 |
| strainWingRt | INTEGER | Flight Data, Strain Monitor, Fatigue | 1232 µε |
| strainWingFold | INTEGER | Flight Data, Strain Monitor, Fatigue | 216 µε |
| strainFwdFuse | INTEGER | Flight Data, Strain Monitor, Fatigue | 8 µε |
| strainLHorz | INTEGER | Flight Data, Strain Monitor, Fatigue | 512 µε |
| strainRHorz | INTEGER | Flight Data, Strain Monitor, Fatigue | 1224 µε |
| strainLVert | INTEGER | Flight Data, Strain Monitor, Fatigue | 632 µε |
| strainRVert | INTEGER | Flight Data, Strain Monitor, Fatigue | 1104 µε |
| maxTrueAirSpeed | DECIMAL | Flight Data | 480.06 kts |
| flightHours | DECIMAL | Flight Data, Dashboard, Utilization | 1.45 |

### Table 3: `fatigue_life_index` — FLEI Computations
| Column | Type | Source Pages | Usage |
|---|---|---|---|
| aircraftId | VARCHAR FK | Fatigue Mgmt, Fleet Register | AC-01 |
| periodStart | DATE | Fatigue Mgmt | Annual |
| periodEnd | DATE | Fatigue Mgmt | Annual |
| wrFleiCurrent | DECIMAL | Fleet Register, Fatigue, Dashboard | 0.4387 |
| wfFleiCurrent | DECIMAL | Fleet Register | 0.0968 |
| wrFleiAnnualDelta | DECIMAL | Fatigue Mgmt | 1.882e-2 |
| usageGradient | DECIMAL | Fatigue Mgmt | 8.249e-5 |
| estFleiAt6000Afh | DECIMAL | Fleet Register, Fatigue, SLEP | 0.495 |
| estYearFlei1 | INTEGER | Fleet Register, Fatigue, SLEP, Utilization | 2043 |
| estAfhAtFlei1 | DECIMAL | Fleet Register, Fatigue | 12,122.42 |

### Table 4: `mission_severity_contribution` — OPC Mission Types
| Column | Type | Source Pages | FA-18D Ref |
|---|---|---|---|
| aircraftId | VARCHAR FK | Fatigue Mgmt, Utilization | AC-01 |
| opcCode | VARCHAR | Fatigue Mgmt, Utilization | 01-04 |
| missionTypeName | VARCHAR | Fatigue Mgmt | Air-to-Ground Training |
| missionsCount | INTEGER | Fatigue Mgmt, Utilization | 420 (OPC 03) |
| avgFleiPerMission | DECIMAL | Fatigue Mgmt | 6.3e-5 |
| wrFleiSum | DECIMAL | Fatigue Mgmt | 2.645e-2 |
| percentOfTotal | VARCHAR | Fatigue Mgmt | 68% |

### Table 5: `defect_ncrd` — Non-Conformance / Defect Records
| Column | Type | Source Pages | Usage |
|---|---|---|---|
| ncrdRef | VARCHAR PK | Condition, Defect Analytics, AI Assistant | G7GA/NCRD/2022/0012 |
| aircraftId | VARCHAR FK | Condition, Defect Analytics | AC-01 |
| title | TEXT | Condition, Defect Analytics | Crack on RH Inner Wing Rib |
| location | VARCHAR | Condition, Dashboard, Defect Analytics | RH Inner Wing |
| type | VARCHAR | Condition, Defect Analytics | Crack / Corrosion |
| partNumber | VARCHAR | Condition | 74A23-78-1001 |
| dateFound | DATE | Condition, Defect Analytics | 17/1/2023 |
| severity | ENUM | Condition, Defect Analytics | critical/major/minor |
| status | VARCHAR | Condition, Defect Analytics | Repair Completed |
| asdrNumber | VARCHAR | Condition | S18DF-06072023-0009 |
| description | TEXT | Condition, AI Assistant | Full text |
| fleetWide | ENUM | Condition | Yes/No/Possible |
| criticalStructure | BOOLEAN | Condition | true/false |
| isBlackLineEntry | BOOLEAN | Condition, Defect Analytics | true/false |
| engineeringOrder | VARCHAR | Condition | G7GA-ER-2108-002(R0) |
| draft/verified/approved | BOOLEAN | Condition | Approval workflow |

### Table 6: `corrosion_finding` — Corrosion Records
| Column | Type | Source Pages | Usage |
|---|---|---|---|
| corrosionId | VARCHAR PK | Condition | C001-C007 |
| aircraftId | VARCHAR FK | Condition | AC-07 |
| location | TEXT | Condition | Horizontal Stabiliser |
| description | TEXT | Condition | Sign of corrosion |
| asdrNumber | VARCHAR | Condition | ASDR-31052023-0001 |
| dateFound | DATE | Condition | 31/5/2023 |
| grade | VARCHAR | Condition | Grade 2/3/4 |

### Table 7: `aircraft_condition_report` — LPM12Y Reports
| Column | Type | Source Pages | Usage |
|---|---|---|---|
| reportId | VARCHAR PK | Condition, AI Assistant | G7GA/ENG/ACR/2022/M45-01(R0) |
| aircraftId | VARCHAR FK | Condition | AC-01 |
| reportType | VARCHAR | Engineering Reports | LPM12Y ACR |
| reportDate | DATE | Condition, Eng Reports | 11 Jan 2023 |
| totalTaskCards | INTEGER | Condition | 1,381 |
| surfaceTreatment/Repair/Replacement | INTEGER | Condition | 78/66/19 |
| ncrdTotal/Incorporated/OnHold | INTEGER | Condition | 39/30/9 |
| ewisFindings | VARCHAR | Condition | 17 (9 shielding) |
| mlgNote | TEXT | Condition | MLG overhaul notes |
| recommendations | JSON | Condition | R1, R2, R3 |

### Table 8: `engineering_report` — Generated Reports
| Column | Type | Source Pages |
|---|---|---|
| reportRef | VARCHAR PK | Engineering Reports |
| title | TEXT | Engineering Reports |
| type | VARCHAR | Engineering Reports |
| status | ENUM | Engineering Reports |
| reportDate | DATE | Engineering Reports |
| docHeader | TEXT | Engineering Reports |
| sections | JSON | Engineering Reports |
| docFooter | TEXT | Engineering Reports |

### Table 9: `slep_record` — Service Life Extension
| Column | Type | Source Pages |
|---|---|---|
| aircraftId | VARCHAR FK | SLEP (NEW) |
| slepRef | VARCHAR PK | SLEP (NEW) |
| originalLimit | DECIMAL | SLEP (NEW) |
| extendedLimit | DECIMAL | SLEP (NEW) |
| approvalDate | DATE | SLEP (NEW) |
| status | VARCHAR | SLEP (NEW) |
| notes | TEXT | SLEP (NEW) |

### Table 10: `audit_trail` — All Data Changes
| Column | Type | Source Pages |
|---|---|---|
| id | BIGINT PK | Audit Trail |
| timestamp | DATETIME | Audit Trail |
| userName | VARCHAR | Audit Trail |
| userRole | VARCHAR | Audit Trail |
| action | ENUM | Audit Trail |
| record | VARCHAR | Audit Trail |
| changeDesc | TEXT | Audit Trail |

### Table 11: `ingested_document` — Document Intelligence
| Column | Type | Source Pages |
|---|---|---|
| docId | VARCHAR PK | Document Intelligence |
| filename | VARCHAR | Document Intelligence |
| fileType | ENUM | Document Intelligence |
| fileSize | VARCHAR | Document Intelligence |
| uploadDate | DATE | Document Intelligence |
| pageCount/entityCount | INTEGER | Document Intelligence |
| status | ENUM | Document Intelligence |
| extractedEntities | JSON | Document Intelligence |

### Table 12: `users`
| Column | Type | Source Pages |
|---|---|---|
| id | INT PK | Admin Roles, Login |
| username | VARCHAR | Admin Roles |
| email | VARCHAR | Admin Roles |
| password | VARCHAR (hashed) | Login |
| role | ENUM | Admin Roles |

---

## 3. Data Requirements Matrix (Pages × Tables)

| Page \ Table | Aircraft Registry | Flight Data | Fatigue FLEI | Mission Severity | Defects NCRD | Corrosion | Condition Reports | Engineering Reports | SLEP | Audit Trail | Ingested Docs | Users |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Fleet Dashboard** | ✅ | ✅ | ✅ | — | ✅ | ✅ | — | — | — | — | — | — |
| **Fleet Register** | ✅ | ✅ | ✅ | — | ✅ | ✅ | — | — | — | — | — | — |
| **Fleet Utilization** | ✅ | ✅ | ✅ | ✅ | — | — | — | — | ✅ | — | — | — |
| **Condition Data** | ✅ | ✅ | — | — | ✅ | ✅ | ✅ | — | — | — | — | — |
| **Flight Data** | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — |
| **Strain Monitoring** | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — |
| **Fatigue Management** | ✅ | ✅ | ✅ | ✅ | — | — | — | — | ✅ | — | — | — |
| **Defect Analytics** | ✅ | — | — | — | ✅ | ✅ | — | — | — | — | — | — |
| **SLEP** | ✅ | — | ✅ | — | — | — | — | — | ✅ | — | — | — |
| **Document Intelligence** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| **AI Assistant** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | ✅ | — |
| **Engineering Reports** | — | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — | — |
| **Audit Trail** | — | — | — | — | — | — | — | — | — | ✅ | — | — |
| **Admin Roles** | — | — | — | — | — | — | — | — | — | — | — | ✅ |
| **Login** | — | — | — | — | — | — | — | — | — | — | — | ✅ |

---

## 4. Aircraft CSV Data → Frontend Page Mapping

The aircraft mission CSV data (Strip Number, Aircraft, Date, Mission Type, Profile, Max G, Max Wing Bending, G bands, Strains, TAS, FH) is **foundational data** that feeds into multiple pages:

| CSV Field | Primary Page | Secondary Pages | Computed Output |
|---|---|---|---|
| Strip Number | Flight Data (NEW) | Audit Trail | Unique flight identifier |
| Aircraft ID | Flight Data (NEW) | All pages | FK to aircraft_registry |
| Date | Flight Data (NEW) | Fatigue Mgmt | Period-based analysis |
| Mission Type | Fatigue Mgmt | Fleet Utilization | OPC code classification |
| Profile | Fatigue Mgmt | Flight Data (NEW) | Profile severity scoring |
| **Max G** | **Fatigue Mgmt (PRIMARY)** | Fleet Dashboard, Flight Data | FLEI computation per mission |
| **Max Wing Bending** | **Fatigue Mgmt (PRIMARY)** | Fleet Dashboard | Structural load modeling |
| **G 4-5, 5-6, 6-7, 7-8** | **Fatigue Mgmt (PRIMARY)** | Flight Data (NEW) | Fatigue spectrum definition |
| **Strains (7 positions)** | **Strain Monitoring (NEW)** | Fatigue Mgmt, Flight Data | Gauge health, load validation |
| Max True Air Speed | Flight Data (NEW) | — | Mission envelope |
| **Flight Hours** | **All pages** | Dashboard, Register, Utilization | AFH accumulation |

---

## 5. FA-18D Report Data Domain Coverage

| Report Section | Data Domain | Pages That Use It | Status |
|---|---|---|---|
| Usage Monitoring (AFH) | Aircraft flight hours | Dashboard, Register, Utilization, SLEP, Condition | ✅ Covered |
| Condition Monitoring (Defects) | NCRD, defects, cracks | Condition, Defect Analytics, Dashboard | ✅ Covered |
| Corrosion (Grades 2-4) | Corrosion findings | Condition, Dashboard | ✅ Covered |
| Fatigue Management (FLEI) | WR FLEI, WF FLEI, life projections | Fatigue Mgmt, Register, SLEP | ✅ Covered |
| Mission Severity (OPC) | Per-mission fatigue contribution | Fatigue Mgmt, Utilization | ✅ Covered |
| Strain Gauge Status | Gauge health, errors | Fleet Register, Strain Monitoring | ✅ Covered (NEW) |
| SLEP / Life Limits | Reduced limits, SLEP refs | SLEP (NEW) | ✅ Covered (NEW) |
| Flight-Level Data | Per-mission G/strain/load | Flight Data (NEW) | ✅ Covered (NEW) |
| Defect Trending | Analytics by type/location | Defect Analytics (NEW) | ✅ Covered (NEW) |
| Fleet Utilization | UE, distribution, planning | Fleet Utilization (NEW) | ✅ Covered (NEW) |
| Engineering Reports | Generated reports | Engineering Reports | ✅ Covered |
| Audit Trail | Data change tracking | Audit Trail | ✅ Covered |
| Document Intelligence | AI ingestion pipeline | Document Intelligence | ✅ Covered |
| AI Assistant | RAG query on indexed data | AI Assistant | ✅ Covered |

---

## 6. API Endpoints Summary

| Method | Endpoint | Purpose |
|---|---|---|
| GET/POST | `/api/aircraft` | List/Create aircraft |
| GET/PUT/DELETE | `/api/aircraft/{tail_id}` | Single aircraft CRUD |
| GET/POST | `/api/flights` | List/Create flight records |
| GET | `/api/flights/{strip_no}` | Single flight detail |
| POST | `/api/flights/batch` | Bulk flight data upload |
| GET/POST | `/api/fatigue` | Fatigue FLEI data |
| GET/POST | `/api/mission-severity` | Mission severity data |
| GET/POST/PUT | `/api/defects` | Defect NCRD records |
| GET/POST | `/api/corrosion` | Corrosion findings |
| GET/POST | `/api/condition-reports` | LPM12Y condition reports |
| GET/POST | `/api/engineering-reports` | Engineering reports |
| GET/POST | `/api/slep` | SLEP records |
| GET/POST | `/api/audit` | Audit trail |
| GET/POST | `/api/ingested-docs` | Document intelligence |
| GET/POST | `/api/users` | User management |
| GET | `/api/dashboard/stats` | Fleet dashboard aggregate stats |
| POST | `/api/seed` | Seed database with FA-18D data |

---

## 7. How to Run

```bash
# 1. Start the backend
cd backend
python main.py
# Runs on http://localhost:8000

# 2. Seed the database
curl -X POST http://localhost:8000/api/seed

# 3. Start the frontend
cd frontend
npm run dev
# Runs on http://localhost:3000

# 4. Upload CSV flight data
curl -X POST http://localhost:8000/api/flights/batch \
  -H "Content-Type: application/json" \
  -d '[{
    "stripNumber": "B4504D20200520T1514",
    "aircraftId": "AC-01",
    "flightDate": "2020-05-20",
    "missionType": "FFRM",
    "profile": "A1450",
    "maxG": 4.61,
    "maxWingBending": 4289408,
    "gOcc4to5": 24,
    "gOcc5to6": 58,
    "gOcc6to7": 12,
    "gOcc7to8": 0,
    "strainWingRt": 1232,
    "strainWingFold": 216,
    "strainFwdFuse": 8,
    "strainLHorz": 512,
    "strainRHorz": 1224,
    "strainLVert": 632,
    "strainRVert": 1104,
    "maxTrueAirSpeed": 480.06,
    "flightHours": 1.45
  }]'
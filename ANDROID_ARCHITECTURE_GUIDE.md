# CyrusCRM_ext - Application Architecture & Android Flow Guide

This document serves as a reference for the architecture, component hierarchy, layer division, data flow, and background execution model of **CyrusCRM_ext**, focusing on the native **Android** implementation and its integration with React Native / Expo.

---

## 1. Executive Summary & Stack Overview

**CyrusCRM_ext** is a hybrid mobile application built with **Expo SDK 57** and **React Native 0.86**, enhanced with a custom **Native Android Subsystem** written in **Kotlin**. 

The app features three core native subsystems:
1. **CallLog Subsystem**: Automatic, background call log detection and call recording file matching, persisting call records locally in SQLite (`cyrus_crm_calls.db`).
2. **LeadAction Subsystem**: Manages lead actions (`lead_id`, `number`, `date`), persisting records locally in SQLite (`cyrus_crm_lead_actions.db`).
3. **CallActionLinker Subsystem**: Matches received calls with lead actions by phone number and call time window `[callStartTime - 5min .. callEndTime + 5min]`, populates the `ref` column in `calls` table, and automatically clears lead actions after sync.
4. **CallUpload Queue Subsystem**: Sweeps all calls with `upload_status IN ('PENDING', 'FAILED')` (oldest first) and POSTs payload JSON to `http://82.29.168.80:3000/api/data`, updating SQLite status to `UPLOADED` or `FAILED`.

### Core Technology Stack
- **Framework**: Expo SDK `~57.0.15` (Expo Router `~57.0.15`)
- **UI & Runtime**: React Native `0.86.2` (React 19, Reanimated 4.5)
- **Native Language**: Kotlin (Android Target SDK 34/35)
- **Background Orchestration**: Android `WorkManager` (`androidx.work:work-runtime-ktx`)
- **Event Listeners**: Android `BroadcastReceiver` (`TelephonyManager.ACTION_PHONE_STATE_CHANGED`)
- **Persistence**: Android Native SQLite (`SQLiteOpenHelper`)
- **Native Bridge**: React Native Legacy/New Architecture Bridge (`ReactContextBaseJavaModule` & `ReactPackage`)

---

## 2. Navigation & UI Structure

The custom navigation bar uses vector icons (`Ionicons`) with 4 main bottom tabs:
1. **Home** (`index.tsx`)
2. **Calls** (`calls.tsx`) - Displays call records with linked lead reference tags (`ref`) and upload status.
3. **Leads** (`leads.tsx`) - Displays customer leads with unique ref codes & dummy phone numbers (`+20 12 25609831`, `01550552371`, `0114588203`). Allows calling and auto-logging actions.
4. **Actions** (`lead-actions.tsx`) - Displays live lead action records fetched from SQLite via `LeadActionService.getAllActions()`.

---

## 3. Subsystem Breakdown

### Subsystem 1: CallLog Subsystem & CallActionLinker
- **Trigger**: [CallStateReceiver.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/receiver/CallStateReceiver.kt) & [CallRecordingWorkScheduler.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/work/CallRecordingWorkScheduler.kt)
- **Worker & Logic**: 
  - [CallSyncWorker.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/work/CallSyncWorker.kt)
  - [CallActionLinker.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/callsync/CallActionLinker.kt) (5 minutes MAX interval matching & post-sync cleanup)
  - [CallDetailsEvaluator.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/callsync/CallDetailsEvaluator.kt)
  - [RecordingFileLocator.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/callsync/RecordingFileLocator.kt)
- **Data & DB**: [CallContract.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/data/db/CallContract.kt) (v3, added `upload_status` column), [CallDatabaseHelper.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/data/db/CallDatabaseHelper.kt), [SqliteCallRepository.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/data/repository/SqliteCallRepository.kt)
- **Bridge & Service**: [CallLogModule.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/bridge/CallLogModule.kt) $\rightarrow$ [CallLogService.ts](file:///d:/projects/cyrus-crm/CyrusCRM_ext/src/services/CallLogService.ts)

### Subsystem 2: LeadAction Subsystem
- **Model**: [LeadAction.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/data/model/LeadAction.kt) (`id`, `leadId`, `number`, `date`)
- **Data & DB**: [LeadActionContract.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/data/db/LeadActionContract.kt) (`cyrus_crm_lead_actions.db`), [LeadActionDatabaseHelper.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/data/db/LeadActionDatabaseHelper.kt), [SqliteLeadActionRepository.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/data/repository/SqliteLeadActionRepository.kt)
- **Bridge & Package**: [LeadActionMapper.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/bridge/LeadActionMapper.kt), [LeadActionModule.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/bridge/LeadActionModule.kt), [LeadActionPackage.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/bridge/LeadActionPackage.kt)
- **TypeScript Service**: [LeadActionService.ts](file:///d:/projects/cyrus-crm/CyrusCRM_ext/src/services/LeadActionService.ts)

### Subsystem 3: CallUpload Queue Subsystem
- **Mapper**: [CallUploadPayloadMapper.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/upload/CallUploadPayloadMapper.kt) (Converts `CallRecord` to `JSONObject`)
- **API Client**: [CallUploadApiClient.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/upload/CallUploadApiClient.kt) (HTTP POST to `http://82.29.168.80:3000/api/data`)
- **Queue Service**: [CallUploadService.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/upload/CallUploadService.kt) (Processes all `PENDING`/`FAILED` calls sequentially)
- **Worker & Scheduler**: [CallUploadWorker.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/work/CallUploadWorker.kt) & `CallRecordingWorkScheduler.scheduleUploadQueueNow(context)` (Unique Work with `ExistingWorkPolicy.APPEND_OR_REPLACE`)

---

## 4. How Call Upload Queue Works

```
CallSyncWorker.doWork()
   ├─ insert CallRecord (upload_status = PENDING, DB default)
   └─ CallRecordingWorkScheduler.scheduleUploadQueueNow(context)
                │
                ▼
        CallUploadWorker.doWork()   (CoroutineWorker, unique work "CallUploadQueueWork")
                │
                ▼
        CallUploadService.processQueue()
                │  fetches ALL calls where upload_status IN (PENDING, FAILED)
                │  ordered by date ASC (oldest first), uploads sequentially
                ▼
        CallUploadService.uploadOne(call)
                │
                ├─ CallUploadPayloadMapper.toJson(call)
                ├─ CallUploadApiClient.post(json)
                └─ on success -> repository.updateUploadStatus(id, UPLOADED)
                   on failure -> repository.updateUploadStatus(id, FAILED)
```

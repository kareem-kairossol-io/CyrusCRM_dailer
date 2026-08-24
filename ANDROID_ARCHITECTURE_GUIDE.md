# CyrusCRM_ext - Application Architecture & Android Flow Guide

This document serves as a reference for the architecture, component hierarchy, layer division, data flow, and background execution model of **CyrusCRM_ext**, focusing on the native **Android** implementation and its integration with React Native / Expo.

---

## 1. Executive Summary & Stack Overview

**CyrusCRM_ext** is a hybrid mobile application built with **Expo SDK 57** and **React Native 0.86**, enhanced with a custom **Native Android Subsystem** written in **Kotlin**. 

The core feature of this custom Android native layer is **automatic, background call log detection and call recording file matching**, persisting call records locally in SQLite and exposing them to the TypeScript UI layer via a native React Native bridge module.

### Core Technology Stack
- **Framework**: Expo SDK `~57.0.15` (Expo Router `~57.0.15`)
- **UI & Runtime**: React Native `0.86.2` (React 19, Reanimated 4.5)
- **Native Language**: Kotlin (Android Target SDK 34/35)
- **Background Orchestration**: Android `WorkManager` (`androidx.work:work-runtime-ktx`)
- **Event Listeners**: Android `BroadcastReceiver` (`TelephonyManager.ACTION_PHONE_STATE_CHANGED`)
- **Persistence**: Android Native SQLite (`SQLiteOpenHelper`)
- **Native Bridge**: React Native Legacy/New Architecture Bridge (`ReactContextBaseJavaModule` & `ReactPackage`)

---

## 2. Layer Division

The codebase follows a 6-layer architecture with strict separation of concerns:

```
 ┌─────────────────────────────────────────────────────────┐
 │                   Layer 6: Expo UI Layer                │
 │       (src/app/index.tsx, explore.tsx, _layout.tsx)     │
 └────────────────────────────┬────────────────────────────┘
                              │
 ┌────────────────────────────▼────────────────────────────┐
 │               Layer 5: TS Service Layer                 │
 │                (src/services/CallLogService.ts)         │
 └────────────────────────────┬────────────────────────────┘
                              │  (Native Module Bridge Calls)
 ┌────────────────────────────▼────────────────────────────┐
 │              Layer 4: RN Native Bridge Layer            │
 │   (CallLogModule, CallLogPackage, CallRecordMapper)     │
 └────────────────────────────┬────────────────────────────┘
                              │  (Dispatchers.IO Async Query)
 ┌────────────────────────────▼────────────────────────────┐
 │               Layer 3: Data & Storage Layer             │
 │   (CallRepository, SqliteCallRepository, DB Helper)     │
 └────────────────────────────▲────────────────────────────┘
                              │  (Insert CallRecord)
 ┌────────────────────────────┴────────────────────────────┐
 │        Layer 2: Background Processing & Logic           │
 │  (CallSyncWorker, CallDetailsEvaluator, FileLocator)    │
 └────────────────────────────▲────────────────────────────┘
                              │  (Enqueue Work)
 ┌────────────────────────────┴────────────────────────────┐
 │              Layer 1: Native Trigger Layer              │
 │  (CallStateReceiver, CallRecordingWorkScheduler)        │
 └─────────────────────────────────────────────────────────┘
```

---

## 3. Layer Breakdown & File Mapping

### Layer 1: Native Trigger Layer
- **[CallStateReceiver.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/receiver/CallStateReceiver.kt)**: `BroadcastReceiver` listening to `PHONE_STATE` and `NEW_OUTGOING_CALL`. Detects transitions (`OFFHOOK`/`RINGING` -> `IDLE`) and triggers background sync.
- **[CallRecordingWorkScheduler.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/work/CallRecordingWorkScheduler.kt)**: Enqueues `CallSyncWorker` immediately via `WorkManager` or uses `addContentUriTrigger` as an OS fallback.

### Layer 2: Background Processing & Business Logic Layer
- **[CallSyncWorker.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/work/CallSyncWorker.kt)**: `CoroutineWorker` that orchestrates reading system call logs, preventing duplicate syncs, evaluating call details, matching recording files, and writing to SQLite.
- **[CallDetailsEvaluator.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/callsync/CallDetailsEvaluator.kt)**: Pure Kotlin evaluator mapping raw telephony types to `INCOMING`/`OUTGOING` and `ANSWERED`/`NO_ANSWER`.
- **[RecordingFileLocator.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/callsync/RecordingFileLocator.kt)**: Locates recording audio files (`.m4a`, `.amr`, `.mp3`) by scanning vendor folders (e.g., Samsung `/Call`, `/Recordings/Call`, `/Sounds/CallRecord`) and `MediaStore.Audio`.

### Layer 3: Native Data & Persistence Layer
- **[CallRecord.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/data/model/CallRecord.kt)**: Immutable domain model.
- **[CallContract.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/data/db/CallContract.kt)**: Database constants (`cyrus_crm_calls.db`, table `calls`).
- **[CallDatabaseHelper.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/data/db/CallDatabaseHelper.kt)**: `SQLiteOpenHelper` schema definition.
- **[SqliteCallRepository.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/data/repository/SqliteCallRepository.kt)**: Implementation of `CallRepository` interface for CRUD operations.

### Layer 4: React Native Native Bridge Layer
- **[CallRecordMapper.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/bridge/CallRecordMapper.kt)**: Maps Kotlin domain models to `WritableMap`/`WritableArray`.
- **[CallLogModule.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/bridge/CallLogModule.kt)**: Native module exposing async promise methods (`getCalls`, `getCallsSince`, `getCallById`, `deleteCall`, `deleteAllCalls`) running queries on `Dispatchers.IO`.
- **[CallLogPackage.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/bridge/CallLogPackage.kt)**: Registers the module in React Native context.
- **[MainApplication.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/MainApplication.kt)**: Registers `CallLogPackage` into Expo's React Host.

### Layer 5: TypeScript Service Layer
- **[CallLogService.ts](file:///d:/projects/cyrus-crm/CyrusCRM_ext/src/services/CallLogService.ts)**: TypeScript interface and API wrapper for JS code.

### Layer 6: React Native / Expo UI Layer
- **[index.tsx](file:///d:/projects/cyrus-crm/CyrusCRM_ext/src/app/index.tsx)**, **[explore.tsx](file:///d:/projects/cyrus-crm/CyrusCRM_ext/src/app/explore.tsx)**, **[_layout.tsx](file:///d:/projects/cyrus-crm/CyrusCRM_ext/src/app/_layout.tsx)**: Expo Router pages and components.

---

## 4. Call Sync End-to-End Sequence

1. Phone call ends -> Android OS broadcasts `TelephonyManager.ACTION_PHONE_STATE_CHANGED`.
2. `CallStateReceiver` receives broadcast, filters state transitions (`RINGING`/`OFFHOOK` -> `IDLE`), and calls `CallRecordingWorkScheduler.scheduleCallSyncNow(context)`.
3. `WorkManager` starts `CallSyncWorker` on a background thread.
4. `CallSyncWorker` sleeps 2000ms to allow OS call logs to update.
5. Queries system call log via `ContentResolver` for `CallLog.Calls.CONTENT_URI`.
6. Checks `SharedPreferences` to ensure call timestamp has not already been processed.
7. Evaluates call direction and status via `CallDetailsEvaluator`.
8. Finds matching call recording file via `RecordingFileLocator`.
9. Inserts complete `CallRecord` into SQLite database `cyrus_crm_calls.db`.
10. When user opens app or triggers refresh, React Native UI calls `CallLogService.getCalls()`.
11. `CallLogModule` fetches records on `Dispatchers.IO` thread and returns array promise to JS.

---

## 5. Standard Guidelines & Extension Points

- **Expo 57 Versioning**: Ensure any React Native / Expo additions strictly follow Expo v57.0.0 standards.
- **Async Thread Safety**: All database interactions in `CallLogModule` MUST execute on `Dispatchers.IO` via Kotlin Coroutines.
- **Duplicate Prevention**: `SharedPreferences` key `last_processed_call_date` avoids double inserts when both state receiver and content trigger fire.

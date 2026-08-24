# CyrusCRM_ext - Application Architecture & Android Flow Guide

This document serves as a reference for the architecture, component hierarchy, layer division, data flow, and background execution model of **CyrusCRM_ext**, focusing on the native **Android** implementation and its integration with React Native / Expo.

---

## 1. Executive Summary & Stack Overview

**CyrusCRM_ext** is a hybrid mobile application built with **Expo SDK 57** and **React Native 0.86**, enhanced with a custom **Native Android Subsystem** written in **Kotlin**. 

The app features two core native subsystems:
1. **CallLog Subsystem**: Automatic, background call log detection and call recording file matching, persisting call records locally in SQLite (`cyrus_crm_calls.db`).
2. **LeadAction Subsystem**: Manages lead actions (`lead_id`, `number`, `date`), persisting records locally in SQLite (`cyrus_crm_lead_actions.db`).

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
2. **Calls** (`calls.tsx`)
3. **Leads** (`leads.tsx`) - Displays customer leads with unique ref codes & dummy phone numbers (`+20 12 25609831`, `01550552371`, `0114588203`). Allows calling and logging actions.
4. **Actions** (`lead-actions.tsx`) - Displays live lead action records fetched from SQLite via `LeadActionService.getAllActions()`.

---

## 3. Subsystem Breakdown

### Subsystem 1: CallLog Subsystem
- **Trigger**: [CallStateReceiver.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/receiver/CallStateReceiver.kt) & [CallRecordingWorkScheduler.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/work/CallRecordingWorkScheduler.kt)
- **Worker & Logic**: [CallSyncWorker.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/work/CallSyncWorker.kt), [CallDetailsEvaluator.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/callsync/CallDetailsEvaluator.kt), [RecordingFileLocator.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/callsync/RecordingFileLocator.kt)
- **Data & DB**: [CallContract.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/data/db/CallContract.kt), [CallDatabaseHelper.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/data/db/CallDatabaseHelper.kt), [SqliteCallRepository.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/data/repository/SqliteCallRepository.kt)
- **Bridge & Service**: [CallLogModule.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/bridge/CallLogModule.kt) $\rightarrow$ [CallLogService.ts](file:///d:/projects/cyrus-crm/CyrusCRM_ext/src/services/CallLogService.ts)

### Subsystem 2: LeadAction Subsystem
- **Model**: [LeadAction.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/data/model/LeadAction.kt) (`id`, `leadId`, `number`, `date`)
- **Data & DB**: [LeadActionContract.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/data/db/LeadActionContract.kt) (`cyrus_crm_lead_actions.db`), [LeadActionDatabaseHelper.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/data/db/LeadActionDatabaseHelper.kt), [SqliteLeadActionRepository.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/data/repository/SqliteLeadActionRepository.kt)
- **Bridge & Package**: [LeadActionMapper.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/bridge/LeadActionMapper.kt), [LeadActionModule.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/bridge/LeadActionModule.kt), [LeadActionPackage.kt](file:///d:/projects/cyrus-crm/CyrusCRM_ext/android/app/src/main/java/com/sphinxtravel/CyrusCRM_ext/bridge/LeadActionPackage.kt)
- **TypeScript Service**: [LeadActionService.ts](file:///d:/projects/cyrus-crm/CyrusCRM_ext/src/services/LeadActionService.ts)

---

## 4. Usage Example in React Native

```typescript
import { LeadActionService } from '@/services/LeadActionService';

// Create a new action for a lead
const rowId = await LeadActionService.createAction(101, '+20 12 25609831');

// Fetch all actions stored in SQLite
const actions = await LeadActionService.getAllActions();
```

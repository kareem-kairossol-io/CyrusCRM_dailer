import { NativeModules } from 'react-native';

export interface CallRecord {
  id: number;
  contactName: string;
  phoneNumber: string;
  direction: 'INCOMING' | 'OUTGOING' | 'UNKNOWN';
  status: 'ANSWERED' | 'NO_ANSWER';
  duration: number; // seconds
  date: number;     // epoch millis
  recordingPath: string;
}

const { CallLogModule } = NativeModules;

if (!CallLogModule) {
  // Helps catch a missing/failed native module registration early in dev.
  console.warn(
    'CallLogModule is not available — check that CallLogPackage is registered in MainApplication.kt'
  );
}

export const CallLogService = {
  /** All stored calls, most recent first. */
  getCalls(): Promise<CallRecord[]> {
    return CallLogModule.getCalls();
  },

  /** Calls at/after the given epoch-millis timestamp — for incremental sync. */
  getCallsSince(timestamp: number): Promise<CallRecord[]> {
    return CallLogModule.getCallsSince(timestamp);
  },

  getCallById(id: number): Promise<CallRecord | null> {
    return CallLogModule.getCallById(id);
  },

  deleteCall(id: number): Promise<boolean> {
    return CallLogModule.deleteCall(id);
  },

  deleteAllCalls(): Promise<boolean> {
    return CallLogModule.deleteAllCalls();
  },
};

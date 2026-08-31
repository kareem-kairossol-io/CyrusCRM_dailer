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
  ref?: string | null; // Nullable reference code linked from lead_actions
  uploadStatus?: 'PENDING' | 'UPLOADED' | 'FAILED' | string;
  googleDriveFileId?: string | null;
  googleDriveFileUrl?: string | null;
}

const { CallLogModule } = NativeModules;

if (!CallLogModule) {
  console.warn(
    'CallLogModule is not available — check that CallLogPackage is registered in MainApplication.kt'
  );
}

export const CallLogService = {
  /** All stored calls, most recent first. */
  getCalls(): Promise<CallRecord[]> {
    return CallLogModule.getCalls();
  },

  /** Calls at/after the given epoch-millis timestamp — for incremental sync from JS. */
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

  /** Wakes the upload queue to retry any PENDING or FAILED uploads. */
  retryFailedUploads(): Promise<boolean> {
    return CallLogModule.retryFailedUploads();
  },

  /**
   * Directly places a call (triggers system SIM picker on dual SIM devices)
   * instead of opening the dialer keypad screen.
   */
  makeDirectCall(number: string): Promise<boolean> {
    return CallLogModule.makeDirectCall(number);
  },
};

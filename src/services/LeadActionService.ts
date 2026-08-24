import { NativeModules } from 'react-native';

export interface LeadAction {
  id: number;
  leadId: number;
  number: string;
  date: number; // epoch millis
}

const { LeadActionModule } = NativeModules;

if (!LeadActionModule) {
  console.warn(
    'LeadActionModule is not available — check that LeadActionPackage is registered in MainApplication.kt'
  );
}

export const LeadActionService = {
  /**
   * Creates a new action for a lead in SQLite.
   * @param leadId Numerical ID of the lead
   * @param number Phone number
   * @param date Optional epoch-millis timestamp (defaults to Date.now() if omitted or <= 0)
   * @returns Promise resolving to the created row ID
   */
  createAction(leadId: number, number: string, date: number = Date.now()): Promise<number> {
    return LeadActionModule.createAction(leadId, number, date);
  },

  /** All stored lead actions, most recent first. */
  getAllActions(): Promise<LeadAction[]> {
    return LeadActionModule.getAllActions();
  },

  /** Actions associated with a specific lead ID. */
  getActionsByLead(leadId: number): Promise<LeadAction[]> {
    return LeadActionModule.getActionsByLead(leadId);
  },

  /** A single action by ID, or null if not found. */
  getActionById(id: number): Promise<LeadAction | null> {
    return LeadActionModule.getActionById(id);
  },

  deleteAction(id: number): Promise<boolean> {
    return LeadActionModule.deleteAction(id);
  },

  deleteAllActions(): Promise<boolean> {
    return LeadActionModule.deleteAllActions();
  },
};

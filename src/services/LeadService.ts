import { AuthService } from '@/services/AuthService';

export interface LeadStatus {
  Value: number;
  Code: string;
  Name: string;
}

export interface ClientInfo {
  Id: number;
  Name: string;
  TaxCard: string;
  Phone1: string | null;
  Phone2: string | null;
  Phone3: string | null;
  Email: string | null;
  Governate: string | null;
  District: string | null;
  Address: string | null;
  Domain: string | null;
  BranchesCount: number;
  FollowUp: boolean;
  IsTaxableClient: boolean;
  Status: number;
}

export interface LeadHistory {
  Id: number;
  Comment: string;
  CommentDateTime: string;
  AudioRecordPath: string | null;
  CallDurationSeconds: number;
  CreatedBy: string;
  AnalysisStatus: string | null;
}

export interface LeadInfo {
  LeadId: number;
  LeadStatusValue: number;
  LeadStatusName: string;
  LeadType: number;
  LeadTypeName: string;
  FollowUpDateTime: string | null;
  MeetingDateTime: string | null;
  AssignedUserName: string | null;
  TechnicalUserName: string | null;
  ProductId: number;
  ProductName: string | null;
  LastChangeUserName: string | null;
  Seen: boolean;
  LastHistory: LeadHistory | null;
  HistoryCount: number;
}

export interface ClientLeadItem {
  Client: ClientInfo;
  Lead: LeadInfo;
}

export interface ClientsResponse {
  Items: ClientLeadItem[];
  PageNumber: number;
  PageSize: number;
  TotalPages: number;
  TotalCount: number;
  HasPreviousPage: boolean;
  HasNextPage: boolean;
}

const BASE_URL = 'http://69.169.103.92:9000/api/mobile/leads';

async function getAuthToken(): Promise<string> {
  try {
    const session = await AuthService.getStoredSession();
    return session?.token || '';
  } catch (e) {
    return '';
  }
}

export const LeadService = {
  /**
   * Fetches all lead statuses from GET /api/mobile/leads/statuses
   */
  async getStatuses(): Promise<LeadStatus[]> {
    const token = await getAuthToken();
    const response = await fetch(`${BASE_URL}/statuses`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch statuses: HTTP ${response.status}`);
    }

    const json = await response.json();
    if (json.Success && Array.isArray(json.Data)) {
      return json.Data;
    }
    return [];
  },

  /**
   * Fetches paginated clients & leads list from GET /api/mobile/leads/clients
   */
  async getClients(params: {
    search?: string;
    status?: number | null;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<ClientsResponse> {
    const token = await getAuthToken();
    const queryParts: string[] = [];

    queryParts.push(`search=${encodeURIComponent(params.search || '')}`);
    if (params.status !== undefined && params.status !== null) {
      queryParts.push(`status=${params.status}`);
    }
    queryParts.push(`pageNumber=${params.pageNumber || 1}`);
    queryParts.push(`pageSize=${params.pageSize || 20}`);

    const url = `${BASE_URL}/clients?${queryParts.join('&')}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch clients: HTTP ${response.status}`);
    }

    const json = await response.json();
    if (json.Success && json.Data) {
      return json.Data as ClientsResponse;
    }

    return {
      Items: [],
      PageNumber: 1,
      PageSize: 20,
      TotalPages: 0,
      TotalCount: 0,
      HasPreviousPage: false,
      HasNextPage: false,
    };
  },

  /**
   * Fetches single client & lead details from GET /api/mobile/leads/clients/{id}
   */
  async getClientById(id: number): Promise<ClientLeadItem | null> {
    const token = await getAuthToken();
    const response = await fetch(`${BASE_URL}/clients/${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch client details: HTTP ${response.status}`);
    }

    const json = await response.json();
    if (json.Success && json.Data) {
      return json.Data as ClientLeadItem;
    }
    return null;
  },
};

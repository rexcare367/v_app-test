// Clearout Email Finder API Types

export interface EmailFinderRequest {
  name: string;
  domain: string;
  timeout?: number;
  queue?: boolean;
}

export interface EmailResult {
  email_address: string;
  role: "yes" | "no";
  business: "yes" | "no";
}

export interface Company {
  name: string;
}

export interface EmailFinderData {
  emails: EmailResult[];
  first_name: string;
  last_name: string;
  full_name: string;
  domain: string;
  confidence_score: number;
  total: number;
  company: Company;
  found_on: string;
}

export interface EmailFinderSuccessResponse {
  status: "success";
  data: EmailFinderData;
}

export interface EmailFinderErrorResponse {
  status: "error";
  error: {
    code: string;
    message: string;
  };
}

export type EmailFinderResponse = EmailFinderSuccessResponse | EmailFinderErrorResponse;


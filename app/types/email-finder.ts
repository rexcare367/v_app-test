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

// API Error Response Types
export interface ValidationError {
  field: string[];
  location: string;
  messages: string[];
  types: string[];
}

export interface TimeoutAdditionalInfo {
  resource_name: string;
  resource_value: string;
  queue_id: string;
}

export interface EmailFinderFailedResponse {
  status: "failed";
  error: {
    code?: number;
    message: string;
    reasons?: ValidationError[];
    additional_info?: TimeoutAdditionalInfo;
  };
}

export interface EmailFinderErrorResponse {
  status: "error";
  error: {
    code: string;
    message: string;
  };
}

export type EmailFinderResponse = 
  | EmailFinderSuccessResponse 
  | EmailFinderFailedResponse 
  | EmailFinderErrorResponse;

// Email Verify API Types

export interface EmailVerifyRequest {
  email: string;
  timeout?: number;
}

export interface SubStatus {
  code: number;
  desc: string;
}

export interface DetailInfo {
  account: string;
  domain: string;
  mx_record: string;
  smtp_provider: string;
}

export interface EmailVerifyData {
  ai_verdict: string;
  email_address: string;
  safe_to_send: "yes" | "no";
  status: string;
  verified_on: string;
  time_taken: number;
  sub_status: SubStatus;
  detail_info: DetailInfo;
  blacklist_info: string[];
  disposable: "yes" | "no";
  free: "yes" | "no";
  role: "yes" | "no";
  gibberish: "yes" | "no";
  suggested_email_address: string;
  profile: any;
  bounce_type: string;
}

export interface EmailVerifySuccessResponse {
  status: "success";
  data: EmailVerifyData;
}

export interface EmailVerifyFailedResponse {
  status: "failed";
  error: {
    code?: number;
    message: string;
    reasons?: ValidationError[];
    additional_info?: TimeoutAdditionalInfo;
  };
}

export interface EmailVerifyErrorResponse {
  status: "error";
  error: {
    code: string;
    message: string;
  };
}

export type EmailVerifyResponse = 
  | EmailVerifySuccessResponse 
  | EmailVerifyFailedResponse 
  | EmailVerifyErrorResponse;


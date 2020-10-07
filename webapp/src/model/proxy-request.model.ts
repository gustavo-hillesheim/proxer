export interface RequestDetails {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
}

export interface ResponseDetails {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export interface ProxyRequestInfo {
  requestId: number;
  requestDetails: RequestDetails;
  responseDetails?: ResponseDetails;
}

export interface RequestDetailsMessage {
  requestId: number;
  request: RequestDetails;
}

export interface ResponseDetailsMessage {
  requestId: number;
  response: ResponseDetails;
}

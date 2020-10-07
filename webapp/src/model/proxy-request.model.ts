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
  id: number;
  requestDetails: RequestDetails;
  responseDetails?: ResponseDetails;
}

export interface RequestDetailsMessage {
  id: number;
  request: RequestDetails;
}

export interface ResponseDetailsMessage {
  id: number;
  response: ResponseDetails;
}

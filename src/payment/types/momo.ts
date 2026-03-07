export interface MomoConfig {
  partnerCode: string;
  accessKey: string;
  secretKey: string;
  apiEndpoint: string;
  redirectUrl?: string;
  ipnUrl: string;
  isSandbox: boolean;
}

export interface MomoCreatePaymentUrlRequest {
  partnerCode: string;
  storeId?: string;
  requestId: string;
  amount: number;
  orderId: string;
  orderInfo: string;
  redirectUrl: string;
  ipnUrl: string;
  requestType: string;
  extraData: string;
  items?: Item[];
  userInfo?: UserInfo;
  autoCapture?: boolean;
  lang: string;
  signature: string;
}

interface Item {
  id: string;
  name: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  manufacturer?: string;
  price: number;
  currency: string;
  quantity: number;
  unit?: string;
  totalPrice: number;
  taxAmount?: number;
}

interface UserInfo {
  name?: string;
  phoneNumber?: string;
  email?: string;
}

export interface MomoCreatePaymentUrlResponse {
  partnerCode: string;
  requestId: string;
  orderId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl: string;
  shortLink: string;
}

export interface MomoReturnQuery {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  partnerUserId?: string;
  orderType: string;
  transId: string;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
}

export type MomoCallback = MomoReturnQuery;

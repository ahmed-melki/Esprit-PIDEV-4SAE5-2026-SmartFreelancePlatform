export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';

export interface Message {
  id?: number;
  conversationId: number;
  senderId: number;
  receiverId: number;
  content: string;
  status?: MessageStatus;
  urgent?: boolean;
  isLocation?: boolean;
  locationLat?: number;
  locationLng?: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  sentiment?: string;
  inappropriate?: boolean;
  deleted?: boolean;
  createdAt?: string;
  readAt?: string;
}

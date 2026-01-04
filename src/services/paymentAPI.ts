// Payment API Service - Using native fetch
import { API_BASE_URL } from './api';

const getAuthToken = () => {
  return sessionStorage.getItem('token');
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export interface CreatePaymentData {
  packageName: string;
  packageType: 'pro';
  amount: number;
  durationMonths: number;
}

export interface Payment {
  _id: string;
  packageName: string;
  packageType: string;
  amount: number;
  durationMonths: number;
  status: 'pending_payment' | 'pending_verification' | 'approved' | 'rejected';
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  paymentProofUrl?: string;
  paymentProofUploadedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Create new payment
export const createPayment = async (data: CreatePaymentData) => {
  const response = await fetch(`${API_BASE_URL}/payments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const jsonData = await response.json();

  if (!response.ok) {
    throw jsonData;
  }

  return jsonData;
};

// Upload payment proof
export const uploadPaymentProof = async (paymentId: string, file: File) => {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append('paymentProof', file);
  formData.append('paymentId', paymentId);

  const response = await fetch(`${API_BASE_URL}/payments/upload-proof`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      // Don't set Content-Type for FormData - browser will auto-set with boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return response.json();
};

// Cancel pending payment
export const cancelPayment = async (paymentId: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/cancel`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const jsonData = await response.json();

  if (!response.ok) {
    throw jsonData;
  }

  return jsonData;
};

// Get user's payments
export const getUserPayments = async () => {
  const response = await fetch(`${API_BASE_URL}/payments`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return response.json();
};

// Admin: Get all payments
export const getAdminPayments = async (status?: string, page = 1, limit = 20) => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await fetch(`${API_BASE_URL}/admin/payments?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return response.json();
};

// Admin: Approve payment
export const approvePayment = async (paymentId: string, adminNotes?: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/payments/${paymentId}/approve`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ adminNotes }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return response.json();
};

// Admin: Reject payment
export const rejectPayment = async (paymentId: string, rejectionReason: string, adminNotes?: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/payments/${paymentId}/reject`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ rejectionReason, adminNotes }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return response.json();
};

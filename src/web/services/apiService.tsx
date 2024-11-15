import axios from 'axios';

interface ApiResponse<T> {
  data: T;
  error?: string;
}

export class ApiService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.REACT_APP_API_URL || '/api'; 
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await axios.get(`${this.apiUrl}${endpoint}`);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch data' };
    }
  }

  async post<T, U>(endpoint: string, data: T): Promise<ApiResponse<U>> {
    try {
      const response = await axios.post(`${this.apiUrl}${endpoint}`, data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.message || 'Failed to post data' };
    }
  }

  async put<T, U>(endpoint: string, data: T): Promise<ApiResponse<U>> {
    try {
      const response = await axios.put(`${this.apiUrl}${endpoint}`, data);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.message || 'Failed to update data' };
    }
  }

  async delete(endpoint: string): Promise<ApiResponse<any>> {
    try {
      const response = await axios.delete(`${this.apiUrl}${endpoint}`);
      return { data: response.data };
    } catch (error: any) {
      return { error: error.message || 'Failed to delete data' };
    }
  }
}

export const apiService = new ApiService();
```
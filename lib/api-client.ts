const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>
}

export class APIClient {
  private static getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token')
    }
    return null
  }

  private static getHeaders(options?: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers,
    }

    const token = this.getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  static async request<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const headers = this.getHeaders(options)

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Clear auth token and redirect to login
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API Request Error:', error)
      throw error
    }
  }

  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  static async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  static async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  static async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Auth API methods
export const authAPI = {
  login: (email: string, password: string) =>
    APIClient.post('/token/', { email, password }),
  
  refreshToken: (refresh: string) =>
    APIClient.post('/token/refresh/', { refresh }),
}

// Task API methods
export const taskAPI = {
  getTasks: () => APIClient.get('/tasks/'),
  
  getTaskById: (id: string) => APIClient.get(`/tasks/${id}/`),
  
  createTask: (data: unknown) => APIClient.post('/tasks/', data),
  
  updateTask: (id: string, data: unknown) => APIClient.put(`/tasks/${id}/`, data),
  
  deleteTask: (id: string) => APIClient.delete(`/tasks/${id}/`),
}

// Client API methods
export const clientAPI = {
  getClients: () => APIClient.get('/clients/'),
  
  getClientById: (id: string) => APIClient.get(`/clients/${id}/`),
  
  createClient: (data: unknown) => APIClient.post('/clients/', data),
  
  updateClient: (id: string, data: unknown) => APIClient.put(`/clients/${id}/`, data),
  
  deleteClient: (id: string) => APIClient.delete(`/clients/${id}/`),
}

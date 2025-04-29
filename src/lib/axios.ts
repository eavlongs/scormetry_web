// lib/axios.js
import axios, { InternalAxiosRequestConfig } from 'axios'
import { getSession } from './session'

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

const apiWithAuth = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

apiWithAuth.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const session = await getSession()
        if (session && session.isAuthenticated) {
            config.headers['Authorization'] = `Bearer ${session.accessToken}`
        }
        return config
    }
)

// add interceptors to add token to request, if on frontend, it can be extracted from getSession(), if on server, it can be extracted from the cookie in the request

export { api, apiWithAuth }

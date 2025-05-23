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

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    console.log(config.url)
    return config
})

api.interceptors.response.use((response) => {
    try {
        const data = response.data
        return data
    } catch (error) {
        console.error('Error parsing response data:', error)
        throw error
    }
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
        console.log(config.url)
        const session = await getSession()
        if (session && session.isAuthenticated) {
            config.headers['Authorization'] = `Bearer ${session.accessToken}`
        }
        return config
    }
)

apiWithAuth.interceptors.response.use((response) => {
    try {
        const data = response.data
        return data
    } catch (error) {
        console.error('Error parsing response data:', error)
        throw error
    }
})

// add interceptors to add token to request, if on frontend, it can be extracted from getSession(), if on server, it can be extracted from the cookie in the request

export { api, apiWithAuth }

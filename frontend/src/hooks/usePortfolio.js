import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { useEffect, useRef, useState } from 'react'
import { normalizePortfolio } from '../lib/portfolio'

const HUB_URL = import.meta.env.VITE_PORTFOLIO_HUB_URL || 'http://localhost:5182/portfolioHub'
const HUB_EVENTS = [
  'PortfolioUpdated',
  'PortfolioStateChanged',
  'ReceivePortfolio',
  'portfolioUpdated',
]

const initialState = {
  status: 'connecting',
  portfolio: [],
  lastUpdatedAt: null,
  error: null,
}

export function usePortfolio() {
  const [state, setState] = useState(initialState)
  const connectionRef = useRef(null)

  useEffect(() => {
    let isActive = true
    let retryDelay = 1000
    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect([0, 1000, 2000, 4000, 8000])
      .configureLogging(LogLevel.Information)
      .build()

    connectionRef.current = connection

    const handlePortfolioPayload = (payload) => {
      if (!isActive) {
        return
      }

      const candidate = Array.isArray(payload)
        ? payload
        : payload?.portfolio ?? payload?.positions ?? payload?.data ?? []

      setState((current) => ({
        ...current,
        portfolio: normalizePortfolio(candidate),
        lastUpdatedAt: new Date().toISOString(),
        error: null,
      }))
    }

    HUB_EVENTS.forEach((eventName) => connection.on(eventName, handlePortfolioPayload))

    connection.onreconnecting(() => {
      if (!isActive) {
        return
      }

      setState((current) => ({
        ...current,
        status: 'reconnecting',
      }))
    })

    connection.onreconnected(() => {
      if (!isActive) {
        return
      }

      setState((current) => ({
        ...current,
        status: 'connected',
        error: null,
      }))
    })

    connection.onclose((error) => {
      if (!isActive) {
        return
      }

      setState((current) => ({
        ...current,
        status: 'disconnected',
        error: error?.message ?? null,
      }))
    })

    const startConnection = async () => {
      while (isActive) {
        try {
          setState((current) => ({
            ...current,
            status: 'connecting',
          }))
          await connection.start()
          if (!isActive) {
            return
          }
          setState((current) => ({
            ...current,
            status: 'connected',
            error: null,
          }))
          return
        } catch (error) {
          if (!isActive) {
            return
          }

          setState((current) => ({
            ...current,
            status: 'disconnected',
            error: error?.message ?? 'Unable to connect to the portfolio hub.',
          }))

          await new Promise((resolve) => setTimeout(resolve, retryDelay))
          retryDelay = Math.min(retryDelay * 1.5, 8000)
        }
      }
    }

    startConnection()

    return () => {
      isActive = false
      HUB_EVENTS.forEach((eventName) => connection.off(eventName, handlePortfolioPayload))
      connection.stop()
    }
  }, [])

  return {
    connection: connectionRef.current,
    portfolio: state.portfolio,
    status: state.status,
    lastUpdatedAt: state.lastUpdatedAt,
    error: state.error,
  }
}

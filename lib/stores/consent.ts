'use client'

import { create } from 'zustand'
import {
  getConsentStatus,
  setConsentStatus,
  type ConsentStatus,
} from '@/lib/consent/consent'

type ConsentState = {
  status: ConsentStatus
  accept: () => void
  reject: () => void
}

export const useConsentStore = create<ConsentState>()((set) => ({
  status: globalThis.window == null ? 'pending' : getConsentStatus(),
  accept: () => {
    setConsentStatus('accepted')
    set({ status: 'accepted' })
  },
  reject: () => {
    setConsentStatus('rejected')
    set({ status: 'rejected' })
  },
}))

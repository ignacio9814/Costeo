import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db } from '@/shared/services/db'
import { generateId } from '@/shared/utils/id'
import type { GastronomicEvent } from './types'

interface EventsState {
  events: GastronomicEvent[]
  loading: boolean
  loaded: boolean
  load: () => Promise<void>
  addEvent: (data: Omit<GastronomicEvent, 'id' | 'createdAt'>) => GastronomicEvent
  updateEvent: (id: string, data: Partial<Omit<GastronomicEvent, 'id' | 'createdAt'>>) => void
  deleteEvent: (id: string) => void
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
  events: [],
  loading: false,
  loaded: false,

  load: async () => {
    if (get().loaded || get().loading) return
    set({ loading: true })
    try {
      const events = await db.events.getAll()
      set({ events, loading: false, loaded: true })
    } catch (err) {
      console.error('[Events] Error loading:', err)
      set({ loading: false })
    }
  },

  addEvent: (data) => {
    const event: GastronomicEvent = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    set((s) => ({ events: [event, ...s.events] }))
    db.events.upsert(event).catch((err) => console.error('[Events] Error saving:', err))
    return event
  },

  updateEvent: (id, data) => {
    set((s) => ({ events: s.events.map((e) => e.id === id ? { ...e, ...data } : e) }))
    const updated = get().events.find((e) => e.id === id)
    if (updated) db.events.upsert(updated).catch((err) => console.error('[Events] Error updating:', err))
  },

  deleteEvent: (id) => {
    set((s) => ({ events: s.events.filter((e) => e.id !== id) }))
    db.events.delete(id).catch((err) => console.error('[Events] Error deleting:', err))
  },
    }),
    { name: 'kitchen-erp-events', partialize: (s) => ({ events: s.events }) }
  )
)

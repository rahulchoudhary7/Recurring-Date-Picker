import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const useEventStore = create(
  persist(
    (set) => ({
      events: [],

      addEvent: (eventData) => set((state) => ({
        events: [...state.events, { id: uuidv4(), ...eventData }]
      })),

      updateEvent: (id, updatedData) => set((state) => ({
        events: state.events.map(event => 
          event.id === id ? { ...event, ...updatedData } : event
        )
      })),

      deleteEvent: (id) => set((state) => ({
        events: state.events.filter(event => event.id !== id)
      })),

      clearEvents: () => set({ events: [] }),
    }),
    {
      name: 'event-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useEventStore;
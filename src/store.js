import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const useEventStore = create(
  persist(
    (set) => ({
      calendarEvents: [],

      addEvent: (eventData) => set((state) => ({
        calendarEvents: [...state.calendarEvents, { id: uuidv4(), ...eventData }]
      })),

      updateEvent: (id, updatedData) => set((state) => ({
        calendarEvents: state.calendarEvents.map(event => 
          event.id === id ? { ...event, ...updatedData } : event
        )
      })),

      deleteEvent: (id) => set((state) => ({
        calendarEvents: state.calendarEvents.filter(event => event.id !== id)
      })),

      clearEvents: () => set({ calendarEvents: [] }),
    }),
    {
      name: 'event-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useEventStore;
'use client'

import React, { useState } from 'react'

import {
  Calendar,
  Repeat,
  Clock,
  ChevronRight,
  ChevronLeft,
  CircleX,
} from 'lucide-react'
import { Button } from './ui/button'
import {
  Calendar as CalendarComponent,
  momentLocalizer,
  Views,
} from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isAfter,
} from 'date-fns'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useEventStore from '@/store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

const localizer = momentLocalizer(moment)

const CustomToolbar = ({ date, onNavigate, onView, view }) => {
  const goToBack = () => {
    onNavigate('PREV');
  };

  const goToNext = () => {
    onNavigate('NEXT');
  };

  const goToCurrent = () => {
    onNavigate('TODAY');
  };

  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  const handleMonthChange = (value) => {
    const newDate = new Date(date);
    newDate.setMonth(parseInt(value));
    onNavigate('DATE', newDate);
  };

  const handleYearChange = (value) => {
    const newDate = new Date(date);
    newDate.setFullYear(parseInt(value));
    onNavigate('DATE', newDate);
  };

  const handleViewChange = (newView) => {
    onView(newView);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-4 md:space-y-0">
      <div className="flex">
        <Button onClick={goToBack} className="mr-2">
          <ChevronLeft size={20} />
        </Button>
        <Button onClick={goToNext}>
          <ChevronRight size={20} />
        </Button>
      </div>

      <Select
          onValueChange={handleViewChange}
          value={view}
        >
          <SelectTrigger className="w-full md:w-32 mt-2 md:mt-0 md:ml-2">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="week">Week</SelectItem>
          </SelectContent>
        </Select>

      <div className="text-lg font-bold">
        {format(date, 'MMMM yyyy')}
      </div>



      <div className="flex flex-col md:flex-row items-center">
        <Select
          onValueChange={handleMonthChange}
          value={currentMonth.toString()}
        >
          <SelectTrigger className="w-full md:w-32">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent className="max-h-56 overflow-y-auto">
            <SelectGroup>
              {moment.months().map((month, index) => (
                <SelectItem
                  key={index}
                  value={index.toString()}
                >
                  {month}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          onValueChange={handleYearChange}
          value={currentYear.toString()}
        >
          <SelectTrigger className="w-full md:w-32 mt-2 md:mt-0 md:ml-2">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="max-h-56 overflow-y-auto">
            <SelectGroup>
              {Array.from({ length: 110 }, (_, i) => {
                const year = 1990 + i;
                return (
                  <SelectItem
                    key={year}
                    value={year.toString()}
                  >
                    {year}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>


        <Button
          onClick={goToCurrent}
          className="mt-2 md:mt-0 md:ml-2"
        >
          Today
        </Button>
      </div>
    </div>
  );
};

const RecurringDatePicker = () => {
  const { events, addEvent, clearEvents, deleteEvent } =
    useEventStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState(
    Views.MONTH,
  )
  const [eventTitle, setEventTitle] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  const [recurrenceType, setRecurrenceType] =
    useState('daily')
  const [recurrenceInterval, setRecurrenceInterval] =
    useState(1)
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(null)
  const [selectedWeekdays, setSelectedWeekdays] = useState(
    [],
  )
  const [selectedMonthDay, setSelectedMonthDay] =
    useState(1)
  const [selectedWeekday, setSelectedWeekday] =
    useState(null)
  const [nthWeek, setNthWeek] = useState(1)

  const handleEventSelect = event => {
    const eventWithDateObjects = {
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }
    setSelectedEvent(eventWithDateObjects)
    setIsDialogOpen(true)
  }



  const generateRecurringDates = () => {
    if (endDate && startDate > endDate) {
      alert('End date can not be before start date')
      return
    }
    if (recurrenceInterval < 1) {
      alert('Recurrence Interval cannot be less than 1')
      return
    }
    if (nthWeek < 1 || nthWeek > 5) {
      alert('Week number not correct')
      return
    }

    let currentDate = new Date(startDate)
    const endDateValue = endDate || new Date('2030-12-31')
    const dates = []

    while (currentDate <= endDateValue) {
      switch (recurrenceType) {
        case 'daily':
          if (!isAfter(currentDate, endDateValue)) {
            dates.push(new Date(currentDate))
          }
          currentDate = addDays(
            currentDate,
            recurrenceInterval,
          )
          break

        case 'weekly':
          if (selectedWeekdays.length > 0) {
            const weekEndDate = addWeeks(
              currentDate,
              recurrenceInterval,
            )
            while (
              currentDate < weekEndDate &&
              !isAfter(currentDate, endDateValue)
            ) {
              const currentDayOfWeek = currentDate.getDay()
              if (
                selectedWeekdays.includes(currentDayOfWeek)
              ) {
                dates.push(new Date(currentDate))
              }
              currentDate = addDays(currentDate, 1)
            }
          } else {
            if (!isAfter(currentDate, endDateValue)) {
              dates.push(new Date(currentDate))
            }
            currentDate = addWeeks(
              currentDate,
              recurrenceInterval,
            )
          }
          break

        case 'monthly':
          if (selectedWeekday !== null) {
            const nthWeekday = getNthWeekdayOfMonth(
              currentDate,
              nthWeek,
              [selectedWeekday],
            )
            if (
              nthWeekday &&
              !isAfter(nthWeekday, endDateValue)
            ) {
              dates.push(new Date(nthWeekday))
            }
          } else {
            const monthDate = new Date(currentDate)
            monthDate.setDate(
              selectedMonthDay || monthDate.getDate(),
            )
            if (!isAfter(monthDate, endDateValue)) {
              dates.push(new Date(monthDate))
            }
          }
          currentDate = addMonths(
            currentDate,
            recurrenceInterval,
          )
          break

        case 'yearly':
          const yearDate = new Date(currentDate)
          yearDate.setDate(
            selectedMonthDay || yearDate.getDate(),
          )
          if (!isAfter(yearDate, endDateValue)) {
            dates.push(new Date(yearDate))
          }
          currentDate = addYears(
            currentDate,
            recurrenceInterval,
          )
          break

        default:
          break
      }
    }

    addEvent({
      title: eventTitle
        ? '🚀' + eventTitle
        : `${
            recurrenceType.charAt(0).toUpperCase() +
            recurrenceType.slice(1)
          } Event`,
      dates: dates,
      recurrenceType,
      recurrenceInterval,
      startDate,
      endDate: endDate ? endDate : new Date('2030-12-31'),
      selectedWeekdays,
      selectedMonthDay,
      selectedWeekday,
      nthWeek,
    })
    setEventTitle('')
    alert('Event added successfully')
  }

  const getNthWeekdayOfMonth = (
    date,
    nthWeek,
    weekdays,
  ) => {
    let weekdayCount = 0
    for (let day = 1; day <= 31; day++) {
      const currentDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        day,
      )
      if (currentDate.getMonth() !== date.getMonth()) break
      if (weekdays.includes(currentDate.getDay())) {
        weekdayCount++
        if (weekdayCount === nthWeek) {
          return currentDate
        }
      }
    }
    return null
  }

  const calendarEvents = events.flatMap(event =>
    event.dates.map(date => ({
      id: `${event.id}-${format(
        new Date(date),
        'yyyy-MM-dd',
      )}`,
      title: event.title,
      start: new Date(date),
      end: new Date(date),
      allDay: true,
      resource: event,
    })),
  )

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }

  const eventStyleGetter = (
    event,
    start,
    end,
    isSelected,
  ) => {
    const backgroundColor = getRandomColor()

    const style = {
      backgroundColor: backgroundColor,
      borderRadius: '8px',
      opacity: isSelected ? 1 : 0.85,
      color: '#FFFFFF',
      border: isSelected
        ? '2px solid #000000'
        : '1px solid #E0E0E0',
      boxShadow: isSelected
        ? '0 4px 12px rgba(0, 0, 0, 0.15)'
        : '0 2px 8px rgba(0, 0, 0, 0.1)',
      padding: '2px 12px',
      fontSize: '14px',
      fontWeight: '500',
      display: 'block',
      transition:
        'background-color 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer',
    }

    return {
      style: style,
    }
  }

  return (
    <div className='p-6 rounded-lg shadow-lg bg-white text-gray-800 '>
      <h2 className='text-2xl font-bold mb-6 flex items-center'>
        <Repeat className='mr-2' /> Recurring Date Picker
      </h2>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div className='col-span-1'>
          <RecurrenceTypeSelect
            recurrenceType={recurrenceType}
            setRecurrenceType={setRecurrenceType}
          />
        </div>

        <div className='col-span-1'>
          <RecurrenceIntervalInput
            recurrenceInterval={recurrenceInterval}
            handleRecurrenceIntervalChange={
              setRecurrenceInterval
            }
          />
        </div>

        <div className='col-span-1'>
          <label className='font-medium mb-2 flex items-center'>
            <Calendar className='mr-2' /> Start Date
          </label>
          <input
            type='date'
            value={format(startDate, 'yyyy-MM-dd')}
            onChange={e =>
              setStartDate(new Date(e.target.value))
            }
            className='border border-gray-300 rounded-md px-4 py-3 w-full bg-white text-gray-800 dark:bg-gray-700 dark:text-white'
          />
        </div>

        <div className='col-span-1'>
          <label className='font-medium mb-2 flex items-center'>
            <Calendar className='mr-2' /> End Date
          </label>
          <input
            type='date'
            value={
              endDate ? format(endDate, 'yyyy-MM-dd') : ''
            }
            onChange={e =>
              setEndDate(new Date(e.target.value))
            }
            className='border border-gray-300 rounded-md px-4 py-3 w-full bg-white text-gray-800 dark:bg-gray-700 dark:text-white'
          />
        </div>

        {recurrenceType === 'weekly' && (
          <div className='col-span-1'>
            <WeekdaySelector
              selectedWeekdays={selectedWeekdays}
              handleWeekdaySelect={day =>
                setSelectedWeekdays(prev =>
                  prev.includes(day)
                    ? prev.filter(d => d !== day)
                    : [...prev, day],
                )
              }
            />
          </div>
        )}

        {recurrenceType === 'monthly' && (
          <div className='col-span-1'>
            <MonthlySelector
              selectedWeekday={selectedWeekday}
              setSelectedWeekday={setSelectedWeekday}
              nthWeek={nthWeek}
              setNthWeek={setNthWeek}
            />
          </div>
        )}

        <div className='col-span-1 md:col-span-2'>
          <label
            htmlFor='event-title'
            className='font-medium mb-2 flex items-center'
          >
            <ChevronRight className='mr-2' /> Event Title
          </label>
          <input
            id='event-title'
            type='text'
            value={eventTitle}
            onChange={e => setEventTitle(e.target.value)}
            placeholder='Enter event title'
            className='w-full border border-gray-300 rounded-md px-4 py-3 bg-white text-gray-800 dark:bg-gray-700 dark:text-white'
          />
        </div>
      </div>

      <div className='flex justify-center mt-6 space-x-4'>
        <Button
          onClick={generateRecurringDates}
          className='bg-blue-500 hover:bg-blue-600 text-white'
        >
          Add Event
        </Button>

        <Button
          onClick={clearEvents}
          className='bg-red-500 hover:bg-red-600 text-white'
        >
          Clear All Events
        </Button>
      </div>

      <div className='mt-8 border-t p-2 md:p-4 rounded-md shadow-md'>
        <CalendarComponent
          localizer={localizer}
          events={calendarEvents}
          startAccessor='start'
          endAccessor='end'
          style={{ height: 500 }}
          views={[Views.MONTH, Views.WEEK]}
          view={currentView}
          onView={setCurrentView}
          date={currentDate}
          onNavigate={setCurrentDate}
          components={{
            toolbar: CustomToolbar,
          }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleEventSelect}
        />
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription>
              Event details and actions
            </DialogDescription>
          </DialogHeader>
          
          <div className='mt-4 flex justify-center'>
            <Button
              onClick={()=>setIsDialogOpen(false)}
              className='bg-indigo-700 hover:bg-indigo-900 text-white text-left'
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const RecurrenceTypeSelect = ({
  recurrenceType,
  setRecurrenceType,
}) => (
  <div className='w-full'>
    <label
      htmlFor='recurrence-type'
      className='font-medium flex items-center mb-2'
    >
      <Clock className='mr-2' /> Recurrence Type
    </label>
    <Select
      value={recurrenceType}
      onValueChange={setRecurrenceType}
    >
      <SelectTrigger className='w-full h-12 rounded-md'>
        <SelectValue placeholder='Select a Recurrence Type' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value='daily'>Daily</SelectItem>
          <SelectItem value='weekly'>Weekly</SelectItem>
          <SelectItem value='monthly'>Monthly</SelectItem>
          <SelectItem value='yearly'>Yearly</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
)

const RecurrenceIntervalInput = ({
  recurrenceInterval,
  handleRecurrenceIntervalChange,
}) => (
  <div>
    <label
      htmlFor='recurrence-interval'
      className='font-medium mb-2 flex items-center'
    >
      <ChevronRight className='mr-2' /> Recurrence Interval
    </label>
    <input
      id='recurrence-interval'
      type='number'
      min='1'
      value={recurrenceInterval}
      onChange={e =>
        handleRecurrenceIntervalChange(e.target.value)
      }
      className='border border-gray-300 rounded-md px-4 py-3 w-full bg-white text-gray-800 dark:bg-gray-700 dark:text-white'
    />
  </div>
)

const WeekdaySelector = ({
  selectedWeekdays,
  handleWeekdaySelect,
}) => (
  <div className='col-span-2'>
    <label className='font-medium mb-2 flex items-center'>
      <ChevronRight className='mr-2' /> Select Weekdays
    </label>
    <div className='flex flex-wrap gap-2'>
      {[
        'Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat',
      ].map((day, index) => (
        <Button
          key={index}
          variant={
            selectedWeekdays.includes(index)
              ? 'primary'
              : 'outline'
          }
          className={`px-4 py-2 rounded-md ${
            selectedWeekdays.includes(index)
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-800 dark:bg-gray-700 dark:text-white'
          } shadow-sm`}
          onClick={() => handleWeekdaySelect(index)}
        >
          {day}
        </Button>
      ))}
    </div>
  </div>
)

const MonthlySelector = ({
  selectedWeekday,
  setSelectedWeekday,
  nthWeek,
  setNthWeek,
}) => (
  <div className='col-span-2'>
    <label
      htmlFor='weekday-select'
      className='font-medium mb-2 flex items-center'
    >
      <ChevronRight className='mr-2' /> Select Weekday of
      Month
    </label>
    <Select
      value={selectedWeekday?.toString()}
      onValueChange={value =>
        setSelectedWeekday(parseInt(value))
      }
    >
      <SelectTrigger className='w-full h-12 rounded-md'>
        <SelectValue placeholder='Select a Day' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={null}>Select a day</SelectItem>
        {[
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ].map((day, index) => (
          <SelectItem key={index} value={index.toString()}>
            {day}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    <label
      htmlFor='nth-weekday'
      className='font-medium mb-2 flex items-center mt-4'
    >
      <ChevronRight className='mr-2' /> Select Occurrence
    </label>
    <input
      type='number'
      id='nth-weekday'
      min='1'
      max='5'
      value={nthWeek}
      onChange={e => setNthWeek(parseInt(e.target.value))}
      className='border border-gray-300 rounded-md px-4 py-3 w-full bg-white text-gray-800 dark:bg-gray-700 dark:text-white'
    />
  </div>
)

export default RecurringDatePicker


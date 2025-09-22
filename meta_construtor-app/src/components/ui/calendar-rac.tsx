"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Calendar as AriaCalendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Button,
  Heading,
} from "react-aria-components";
import type { CalendarProps, DateValue } from "react-aria-components";
import { cn } from "@/lib/utils";

function Calendar({ className, ...props }: CalendarProps<DateValue>) {
  return (
    <AriaCalendar
      aria-label="Calendário de Atividades"
      className={cn("rac-calendar w-full", className)}
      {...props}
    >
      <div className="flex items-center justify-between px-2 py-2">
        <Button slot="previous" className="icon-btn">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Heading className="text-base font-semibold" />
        <Button slot="next" className="icon-btn">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <CalendarGrid className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
        <CalendarGridHeader>
          {(day) => (
            <CalendarHeaderCell className="grid place-items-center text-center text-xs text-muted-foreground h-8">
              {day}
            </CalendarHeaderCell>
          )}
        </CalendarGridHeader>

        <CalendarGridBody className="grid gap-1 px-2 pb-2" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
          {(date) => (
            <CalendarCell
              date={date}
              className="day-btn"
            >
              {/* Activity indicator */}
              <div className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-primary opacity-0 data-[has-activities]:opacity-100 shadow-sm" />
            </CalendarCell>
          )}
        </CalendarGridBody>
      </CalendarGrid>
    </AriaCalendar>
  );
}

export { Calendar };
import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { EventStyleArgs, KENDO_SCHEDULER, SchedulerEvent } from '@progress/kendo-angular-scheduler';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { CalendarService, GoogleEvent } from './calendar.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [KENDO_SCHEDULER, MatListModule, MatButtonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  encapsulation: ViewEncapsulation.None,
})
export class Dashboard implements OnInit {
  public selectedDate: Date = new Date("2025-10-22T00:00:00");

  // Start with your hardcoded events; we’ll replace/merge with Google events
  public events: SchedulerEvent[] = [
    { id: 1, title: "Breakfast", start: new Date("2025-10-20T09:00:00"), end: new Date("2025-10-20T09:30:00") },
    { id: 2, title: "Team Meeting", start: new Date("2025-10-22T10:00:00"), end: new Date("2025-10-22T11:00:00") },
    { id: 3, title: "Lunch", start: new Date("2025-10-22T12:30:00"), end: new Date("2025-10-22T13:30:00") },
  ];

  public loading = false;
  public error?: string;

  constructor(private cal: CalendarService) {}

  async ngOnInit() {
    // Choose a window to display — e.g., the current week around selectedDate
    const startOfWindow = new Date(this.selectedDate);
    startOfWindow.setDate(startOfWindow.getDate() - 4);
    startOfWindow.setHours(0,0,0,0);

    const endOfWindow = new Date(this.selectedDate);
    endOfWindow.setDate(endOfWindow.getDate() + 4);
    endOfWindow.setHours(23,59,59,999);

    try {
      this.loading = true;
      const googleEvents = await this.cal.listAllPrimaryEvents(
        startOfWindow.toISOString(),
        endOfWindow.toISOString()
      );
      const schedulerEvents = this.mapGoogleToScheduler(googleEvents);

      // Replace your local events with Google events (or merge if you prefer)
      this.events = schedulerEvents;
    } catch (e: any) {
      if (e?.message === 'unauthorized') {
        this.error = 'Your Google session expired. Please sign in again.';
      } else {
        this.error = e?.message ?? 'Failed to load Google Calendar events.';
      }
    } finally {
      this.loading = false;
    }
  }

  private mapGoogleToScheduler(gEvents: GoogleEvent[]): SchedulerEvent[] {
    return gEvents.map((g, idx) => {
      // Google all-day: uses `date` (no time). Timed: uses `dateTime`.
      const startStr = g.start?.dateTime ?? g.start?.date; // ISO or YYYY-MM-DD
      const endStr   = g.end?.dateTime ?? g.end?.date;

      // Safeguard: skip malformed events
      if (!startStr || !endStr) return undefined as unknown as SchedulerEvent;

      // For all-day events Google’s end is exclusive; Kendo expects real Date
      const isAllDay = !!g.start?.date && !!g.end?.date;
      const start = new Date(startStr);
      const end = new Date(endStr);

      return {
        id: g.id ?? idx,
        title: g.summary ?? '(no title)',
        start,
        end,
        isAllDay,
      } as SchedulerEvent;
    }).filter(Boolean);
  }

  public getEventClass = (args: EventStyleArgs) => {
    const eventId = (args.event.dataItem as any).id;
    return Number.isFinite(+eventId) && (+eventId % 2 === 0) ? "even-id" : "odd-id";
  };
}

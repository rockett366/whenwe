import { Component, ViewEncapsulation } from '@angular/core';
import { EventStyleArgs, KENDO_SCHEDULER, SchedulerEvent } from '@progress/kendo-angular-scheduler';
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [KENDO_SCHEDULER, MatListModule, MatButtonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'], // <-- fixed
  encapsulation: ViewEncapsulation.None,
})
export class Dashboard {
  public selectedDate: Date = new Date("2025-10-22T00:00:00");

  public events: SchedulerEvent[] = [
    { id: 1, title: "Breakfast", start: new Date("2025-10-20T09:00:00"), end: new Date("2025-10-20T09:30:00") },
    { id: 2, title: "Team Meeting", start: new Date("2025-10-22T10:00:00"), end: new Date("2025-10-22T11:00:00") },
    { id: 3, title: "Lunch", start: new Date("2025-10-22T12:30:00"), end: new Date("2025-10-22T13:30:00") },
  ];

  public getEventClass = (args: EventStyleArgs) => {
    const eventId = args.event.dataItem.id;
    return eventId % 2 === 0 ? "even-id" : "odd-id";
  };

  get upcomingEvents(): SchedulerEvent[] {
    const now = new Date();
    return this.events
      .filter(e => e.start > now)       // Future events only
      .sort((a, b) => a.start.getTime() - b.start.getTime()) // Sort by soonest
      .slice(0, 5);                      // Max 5 events
  }
}

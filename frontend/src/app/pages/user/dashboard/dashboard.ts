import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { EventStyleArgs, KENDO_SCHEDULER, SchedulerEvent } from '@progress/kendo-angular-scheduler';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CalendarService, GoogleEvent } from './calendar.service';
import { ChangeDetectorRef } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    KENDO_SCHEDULER,
    MatListModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    CommonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  encapsulation: ViewEncapsulation.None,
})
export class Dashboard implements OnInit {
  public selectedDate: Date = new Date('2025-10-22T00:00:00');

  // Start with your hardcoded events; we’ll replace/merge with Google events
  public events: SchedulerEvent[] = [
    {
      id: 1,
      title: 'Breakfast',
      start: new Date('2025-10-20T09:00:00'),
      end: new Date('2025-10-20T09:30:00'),
    },
    {
      id: 2,
      title: 'Team Meeting',
      start: new Date('2025-10-22T10:00:00'),
      end: new Date('2025-10-22T11:00:00'),
    },
    {
      id: 3,
      title: 'Lunch',
      start: new Date('2025-10-22T12:30:00'),
      end: new Date('2025-10-22T13:30:00'),
    },
  ];

  public friendUsername: string = '';
  public friends: string[] = [];
  public message: string = '';
  public error: string = '';
  public loading = false;
  public username: string = '';

  private startOfWindow!: Date;
  private endOfWindow!: Date;
  private _prevForSep: SchedulerEvent | null = null;

  constructor(
    private http: HttpClient,
    private cal: CalendarService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  async ngOnInit() {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;
    } else {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          this.username = decoded?.sub || '';
        } catch {
          this.username = '';
        }
      }
    }

    this.loadFriends();

    // define the visible window around the selected date
    this.startOfWindow = new Date(this.selectedDate);
    this.startOfWindow.setDate(this.startOfWindow.getDate() - 4);
    this.startOfWindow.setHours(0, 0, 0, 0);

    this.endOfWindow = new Date(this.selectedDate);
    this.endOfWindow.setDate(this.endOfWindow.getDate() + 4);
    this.endOfWindow.setHours(23, 59, 59, 999);

    await this.refreshEvents();
  }

  private mapGoogleToScheduler(gEvents: GoogleEvent[]): SchedulerEvent[] {
    return gEvents
      .map((g, idx) => {
        // Google all-day: uses `date` (no time). Timed: uses `dateTime`.
        const startStr = g.start?.dateTime ?? g.start?.date; // ISO or YYYY-MM-DD
        const endStr = g.end?.dateTime ?? g.end?.date;

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
      })
      .filter(Boolean);
  }

  public getEventClass = (args: EventStyleArgs) => {
    const eventId = (args.event.dataItem as any).id;
    return Number.isFinite(+eventId) && +eventId % 2 === 0 ? 'even-id' : 'odd-id';
  };

  get upcomingEvents(): SchedulerEvent[] {
    const now = new Date();
    return this.events
      .filter((e) => e.start > now) // Future events only
      .sort((a, b) => a.start.getTime() - b.start.getTime()) // Sort by soonest
      .slice(0, 5); // Max 5 events
  }

  logout() {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('username');
      this.router.navigate(['/login']);
    }
  }
  // Add friend
  addFriend() {
    if (!this.friendUsername.trim()) {
      this.error = 'Please enter a username.';
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.error = 'You must be logged in to add friends.';
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http
      .post(`http://localhost:8000/users/me/add_friend/${this.friendUsername}`, {}, { headers })
      .subscribe({
        next: (res: any) => {
          this.message = `✅ ${this.friendUsername} added successfully!`;
          this.error = '';
          this.friendUsername = '';
          this.loadFriends();
        },
        error: (err) => {
          console.error(err);
          if (err.status === 404) this.error = 'User not found.';
          else if (err.status === 400) this.error = 'You are already friends.';
          else this.error = 'Something went wrong.';
        },
      });
  }

  // --- Fetch Friends from backend ---
  loadFriends() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.error = 'Please log in first.';
      return;
    }

    this.http
      .get<string[]>('http://localhost:8000/users/me/friends', {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      })
      .subscribe({
        next: (res) => {
          this.friends = res;
          this.error = '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching friends:', err);
          this.error = 'Failed to load friends list.';
        },
      });
  }

  // --- Confirm & Remove Friend ---
  confirmRemoveFriend(friend: string) {
    const confirmDelete = confirm(`Are you sure you want to remove ${friend} as a friend?`);
    if (confirmDelete) {
      this.removeFriend(friend);
    }
  }

  removeFriend(friend: string) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.error = 'You must be logged in to remove friends.';
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.http.delete(`http://localhost:8000/users/me/friends/${friend}`, { headers }).subscribe({
      next: (res: any) => {
        this.message = `❌ ${friend} has been removed.`;
        this.error = '';
        this.loadFriends();
      },
      error: (err) => {
        console.error('Error removing friend:', err);
        this.error = err.error?.detail ?? 'Failed to remove friend.';
      },
    });
  }

  requestHangout(friend: string) {
  if (!this.username) {
    this.error = 'You must be logged in.';
    return;
  }

  const ok = confirm(`Request a hangout with ${friend}?`);
  if (!ok) return;

  const token = localStorage.getItem('access_token');
  if (!token) {
    this.error = 'You must be logged in.';
    return;
  }

  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

  // Minimal payload — expand as you like (duration/title/time window are optional here)
  const payload = {
    user_name: this.username,
    friend_user_name: friend,
    duration: "60",                 // minutes (example)
    desired_title: 'WhenWe Connect',
    // earliest_start / latest_end can be ISO strings or omitted; backend handles defaults
    // earliest_start: new Date().toISOString(),
    // latest_end: new Date(Date.now() + 14*86400000).toISOString(),
  };

  this.loading = true;
  this.http.put('http://localhost:8000/users/me/request', payload, { headers })
    .subscribe({
      next: (res: any) => {
        this.message = `🎉 Requested a hangout with ${friend}.`;
        this.error = '';
      },
      error: (err) => {
        console.error('Request error:', err);
        this.error = err?.error?.detail || err?.message || 'Failed to send request.';
      }
    }).add(() => this.loading = false);
}


  async refreshEvents() {
    await this.loadGoogleEvents(this.startOfWindow, this.endOfWindow);
  }

  private async loadGoogleEvents(start: Date, end: Date) {
    try {
      this.loading = true;
      const googleEvents = await this.cal.listAllPrimaryEvents(
        start.toISOString(),
        end.toISOString()
      );
      const schedulerEvents = this.mapGoogleToScheduler(googleEvents);

      // Replace (or merge if you prefer)
      this.events = schedulerEvents;
      this.error = '';
      // reset date separator helper
      this._prevForSep = null;
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

  // Left panel uses a sorted, in-window view of events
  get sidebarEvents(): SchedulerEvent[] {
    const inWindow = (e: SchedulerEvent) =>
      e.start >= this.startOfWindow && e.end <= this.endOfWindow;

    return (this.events ?? [])
      .filter(inWindow)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  jumpTo(e: SchedulerEvent) {
    // Kendo binds to selectedDate — updating it moves the view
    this.selectedDate = new Date(e.start);
  }

  // Parity class reused from your getEventClass logic (for list bullets)
  getEventParity(e: SchedulerEvent): 'even-id' | 'odd-id' {
    const id = Number((e as any).id);
    return Number.isFinite(id) && id % 2 === 0 ? 'even-id' : 'odd-id';
  }

  // Human-ish relative time (e.g., "in 2h", "tomorrow")
  timeUntil(e: SchedulerEvent): string {
    const now = new Date().getTime();
    const diff = e.start.getTime() - now;

    const abs = Math.abs(diff);
    const mins = Math.round(abs / 60000);
    const hours = Math.round(abs / 3600000);
    const days = Math.round(abs / 86400000);

    const prefix = diff >= 0 ? 'in ' : '';
    const suffix = diff < 0 ? 'ago' : '';

    if (mins < 60) return `${prefix}${mins}m${suffix ? ' ' + suffix : ''}`;
    if (hours < 24) return `${prefix}${hours}h${suffix ? ' ' + suffix : ''}`;
    if (days === 1) return diff >= 0 ? 'tomorrow' : 'yesterday';
    return `${prefix}${days}d${suffix ? ' ' + suffix : ''}`;
  }

  // Date separator logic
  private sameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
  showDateSeparator(curr: SchedulerEvent, prev: SchedulerEvent | null): boolean {
    if (!prev) return true;
    return !this.sameDay(curr.start, prev.start);
  }
  // store previous in *ngFor without extra stateful pipes
  setPrevious(e: SchedulerEvent): boolean {
    (this as any).previousEvent = e; // expose for template
    return true;
  }
  get previousEvent(): SchedulerEvent | null {
    return (this as any)._prevForSep ?? null;
  }
  set previousEvent(e: SchedulerEvent | null) {
    this._prevForSep = e;
  }

  // TrackBy for performance
  trackByEventId = (_: number, e: SchedulerEvent) => (e as any).id ?? e.title;

  // Open Google Calendar quickly
  openGoogleCalendar() {
    window.open('https://calendar.google.com/calendar/u/0/r', '_blank');
  }
}

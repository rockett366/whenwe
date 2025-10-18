import { Injectable } from '@angular/core';

export interface GoogleEvent {
  id: string;
  summary?: string;
  start?: { date?: string; dateTime?: string; timeZone?: string };
  end?: { date?: string; dateTime?: string; timeZone?: string };
}

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly base = 'https://www.googleapis.com/calendar/v3';

  private get token(): string | null {
    return sessionStorage.getItem('google_access_token');
  }

  /**
   * Fetch events for a date range from the user's primary calendar
   */
  async listPrimaryEvents(opts: { timeMin: string; timeMax: string; pageToken?: string; }) {
  if (!this.token) throw new Error('Missing Google access token.');

  const params = new URLSearchParams({
    timeMin: opts.timeMin,
    timeMax: opts.timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '2500',
  });
  if (opts.pageToken) params.set('pageToken', opts.pageToken);

  const res = await fetch(`${this.base}/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${this.token}` },
  });


  let errBody: any = null;
  if (!res.ok) {
    try { errBody = await res.json(); } catch { errBody = await res.text(); }
    console.error('Google API error body:', errBody);
  }

  if (res.status === 401) throw new Error('unauthorized');
  if (!res.ok) {
    const code = errBody?.error?.code ?? res.status;
    const reason =
      errBody?.error?.errors?.[0]?.reason ??
      errBody?.error_description ??
      errBody?.error ??
      errBody;
    throw new Error(`Google API error ${code}: ${reason}`);
  }

  const data = await res.json();
  return { events: (data.items ?? []) as GoogleEvent[], nextPageToken: data.nextPageToken };
}


  /**
   * Convenience: fetch everything between timeMin/timeMax, following pages
   */
  async listAllPrimaryEvents(timeMinISO: string, timeMaxISO: string): Promise<GoogleEvent[]> {
    const all: GoogleEvent[] = [];
    let pageToken: string | undefined;
    do {
      const { events, nextPageToken } = await this.listPrimaryEvents({
        timeMin: timeMinISO,
        timeMax: timeMaxISO,
        pageToken,
      });
      all.push(...events);
      pageToken = nextPageToken;
    } while (pageToken);
    return all;
  }
}

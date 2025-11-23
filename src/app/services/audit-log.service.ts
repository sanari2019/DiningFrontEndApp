import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { EnvironmentUrlService } from '../shared/services/environment-url.service';

export interface AuditLogEntry {
  event: 'login' | 'logout' | 'login_failed' | 'login_success';
  userName: string;
  success: boolean;
  detail?: string;
  statusCode?: number;
  timestamp: string;
  source?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private readonly storageKey = 'auditLogs';
  private readonly maxEntries = 200;

  constructor(private http: HttpClient, private envUrl: EnvironmentUrlService) {}

  logEvent(entry: AuditLogEntry): void {
    this.persistLocally(entry);
    this.sendToServer(entry);
  }

  private persistLocally(entry: AuditLogEntry): void {
    try {
      const current = this.getStored();
      current.unshift(entry);
      if (current.length > this.maxEntries) {
        current.pop();
      }
      localStorage.setItem(this.storageKey, JSON.stringify(current));
    } catch (err) {
      console.warn('Audit log local persistence failed:', err);
    }
  }

  private getStored(): AuditLogEntry[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as AuditLogEntry[]) : [];
    } catch {
      return [];
    }
  }

  private sendToServer(entry: AuditLogEntry): void {
    const url = `${this.envUrl.urlAddress}/audit/logs`;
    this.http.post(url, entry).pipe(
      catchError((err) => {
        console.warn('Audit log send failed (non-blocking):', err);
        return of(null);
      })
    ).subscribe();
  }
}

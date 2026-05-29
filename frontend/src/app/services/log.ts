import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private storageKey = 'app_historique_logs';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // Récupérer tout l'historique
  getLogs(): any[] {
    if (isPlatformBrowser(this.platformId)) {
      const logs = localStorage.getItem(this.storageKey);
      return logs ? JSON.parse(logs) : []; 
    }
    return [];
  }

  ajouterLog(action: string, detail: string, icon: string, color: string) {
    if (isPlatformBrowser(this.platformId)) {
      const logs = this.getLogs();
      
      const nouveauLog = {
        action: action,
        detail: detail,
        date: new Date().toLocaleDateString('fr-FR'),
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        icon: icon,
        color: color
      };

      logs.unshift(nouveauLog);

      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    }
  }

  viderLogs() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.storageKey);
    }
  }
}
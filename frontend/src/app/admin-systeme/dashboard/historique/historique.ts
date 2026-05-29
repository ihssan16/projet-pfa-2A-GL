import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LogService } from '../../../services/log'; 

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './historique.html',
  styleUrls: ['./historique.css']
})
export class HistoriqueComponent implements OnInit {
  
  historiqueComplet: any[] = [];
  chargement = true;

  constructor(private logService: LogService) {}

  ngOnInit() {
    this.chargerHistorique();
  }

  chargerHistorique() {
    this.historiqueComplet = this.logService.getLogs();
    this.chargement = false;
  }
}
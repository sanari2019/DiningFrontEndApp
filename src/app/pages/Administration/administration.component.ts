import { Component, OnInit, VERSION } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss']
})
export class AdministrationComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

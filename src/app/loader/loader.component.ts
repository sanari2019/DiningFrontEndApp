import { Component, OnInit, ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-loader',
  template: `
  <div class="loader">
    <span class="loader__element"></span>
    <span class="loader__element"></span>
    <span class="loader__element"></span>
  </div>
`,
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {

  constructor(private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    // this.init();
  }




}

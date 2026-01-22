import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-junk-leads',
  templateUrl: './junk-leads.component.html',
  styleUrls: ['./junk-leads.component.scss'],
})
export class JunkLeadsComponent  implements OnInit {
  data=true;

  constructor() { }

  ngOnInit() {
    this.data=false
  }

}

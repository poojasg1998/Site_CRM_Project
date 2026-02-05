import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { IonRangeCalendarModule } from '@googlproxer/ion-range-calendar';
import { JunkLeadsComponent } from './junk-leads.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: JunkLeadsComponent
      }
    ]), 

    IonicModule, 
    DropdownModule, 
    IonRangeCalendarModule,  
    FormsModule  
],

declarations: [JunkLeadsComponent]
})
export class JunkLeadsModule {

}

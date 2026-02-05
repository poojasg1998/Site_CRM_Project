import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CalendarModal, IonRangeCalendarModule } from '@googlproxer/ion-range-calendar';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { LeadsComponent } from './leads.component';
import { SharedModule } from "../shared.module";
import { CalendarModule } from 'primeng/calendar';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
        {
            path: '',
            component: LeadsComponent
        }
    ]),
    IonicModule,
    CalendarModule,
    DropdownModule,
    MultiSelectModule,
    IonRangeCalendarModule,
    FormsModule,
    SharedModule
],

declarations: [LeadsComponent ]
})
export class LeadsModule {

}
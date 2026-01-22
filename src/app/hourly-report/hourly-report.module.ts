import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IonRangeCalendarModule } from '@googlproxer/ion-range-calendar';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { HourlyReportComponent } from './hourly-report.component';
import { SharedModule } from '../shared.module';
import { CalendarModule } from 'primeng/calendar';
import { AutoCompleteModule } from 'primeng/autocomplete';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: HourlyReportComponent,
      },
    ]),
    IonicModule,
    DropdownModule,
    MultiSelectModule,
    CalendarModule,
    IonRangeCalendarModule,
    SharedModule,
    AutoCompleteModule,
    FormsModule,
  ],

  declarations: [HourlyReportComponent],
})
export class HourlyReportModule {}

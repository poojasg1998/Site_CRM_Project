import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IonRangeCalendarModule } from '@googlproxer/ion-range-calendar';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { SharedModule } from '../shared.module';
import { HourlyReportListingComponent } from './hourly-report-listing.component';
import { CalendarModule } from 'primeng/calendar';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: HourlyReportListingComponent,
      },
    ]),
    IonicModule,
    DropdownModule,
    CalendarModule,
    MultiSelectModule,
    IonRangeCalendarModule,
    SharedModule,
    FormsModule,
  ],

  declarations: [HourlyReportListingComponent],
})
export class HourlyReportListingModule {}

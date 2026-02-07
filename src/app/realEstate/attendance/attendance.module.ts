import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IonRangeCalendarModule } from '@googlproxer/ion-range-calendar';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { SharedModule } from '../shared.module';
import { CalendarModule } from 'primeng/calendar';
import { AttendanceComponent } from './attendance.component';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: AttendanceComponent,
      },
    ]),
    IonicModule,
    DropdownModule,
    MultiSelectModule,
    SharedModule,
    CalendarModule,
    IonRangeCalendarModule,
    FormsModule,
  ],
  declarations: [AttendanceComponent],
})
export class AttendanceModule {}

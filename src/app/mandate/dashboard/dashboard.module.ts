import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IonRangeCalendarModule } from '@googlproxer/ion-range-calendar';
import { DropdownModule } from 'primeng/dropdown';
import { SharedModule } from '../../shared.module';
import { CalendarModule } from 'primeng/calendar';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DashboardComponent,
      },
    ]),
    IonicModule,
    DropdownModule,
    NgxDaterangepickerMd,
    SharedModule,
    CalendarModule,
    IonRangeCalendarModule,
    FormsModule,
    ProgressBarModule,
    DialogModule,
  ],

  declarations: [DashboardComponent],
})
export class DashboardModule {}

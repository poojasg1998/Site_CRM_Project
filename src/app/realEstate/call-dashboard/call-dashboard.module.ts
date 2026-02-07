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
import { CallDashboardComponent } from './call-dashboard.component';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: CallDashboardComponent,
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
  declarations: [CallDashboardComponent],
})
export class CallDashboardModule {}

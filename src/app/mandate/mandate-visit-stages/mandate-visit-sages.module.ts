import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgOtpInputModule } from 'ng-otp-input';
import { IonRangeCalendarModule } from '@googlproxer/ion-range-calendar';
import { MandateVisitStagesComponent } from './mandate-visit-stages.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { SharedModule } from 'src/app/shared.module';
import { CalendarModule } from 'primeng/calendar';

@NgModule({
  imports: [
    CommonModule,
    NgOtpInputModule,
    RouterModule.forChild([
      {
        path: '',
        component: MandateVisitStagesComponent,
      },
    ]),
    IonicModule,
    MultiSelectModule,
    CalendarModule,
    SharedModule,
    DropdownModule,
    ReactiveFormsModule,
    IonRangeCalendarModule,
    FormsModule,
  ],

  declarations: [MandateVisitStagesComponent],
})
export class MaMandateVisitStagesModule {}

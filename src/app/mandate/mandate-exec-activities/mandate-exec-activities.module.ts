import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgOtpInputModule } from 'ng-otp-input';
import { MandateExecActivitiesComponent } from './mandate-exec-activities.component';
import { IonRangeCalendarModule } from '@googlproxer/ion-range-calendar';
import { SharedModule } from 'src/app/shared.module';
import { CalendarModule } from 'primeng/calendar';


@NgModule({
  imports: [
    CommonModule,
    NgOtpInputModule,
    RouterModule.forChild([
      {
        path: '',
        component: MandateExecActivitiesComponent
      }
    ]), 

    IonicModule,
    SharedModule,
    ReactiveFormsModule,
    CalendarModule,
    IonRangeCalendarModule,
    FormsModule  
],

declarations: [MandateExecActivitiesComponent ]
})
export class MandateExecActivitiesModule {

}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgOtpInputModule } from 'ng-otp-input';
import { IonRangeCalendarModule } from '@googlproxer/ion-range-calendar';
import { SharedModule } from 'src/app/shared.module';
import { MandateInactiveJunkComponent } from './mandate-inactive-junk.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';


@NgModule({
  imports: [
    CommonModule,
    NgOtpInputModule,
    RouterModule.forChild([
      {
        path: '',
        component: MandateInactiveJunkComponent
      }
    ]), 

    IonicModule,
    SharedModule,
    DropdownModule,
    ReactiveFormsModule,
    MultiSelectModule,
    IonRangeCalendarModule,
    FormsModule  
],

declarations: [MandateInactiveJunkComponent ]
})
export class MandateInactiveJunkModule {

}

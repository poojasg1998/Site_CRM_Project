import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgOtpInputModule } from 'ng-otp-input';
import { IonRangeCalendarModule } from '@googlproxer/ion-range-calendar';
import { MandateLeadStagesComponent } from './mandate-lead-stages.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { SharedModule } from 'src/app/shared.module';
import { CalendarModule } from 'primeng/calendar';
import { PhotoGalleryModule } from '@twogate/ngx-photo-gallery';


@NgModule({
  imports: [
    CommonModule,
    NgOtpInputModule,
    RouterModule.forChild([
      {
        path: '',
        component: MandateLeadStagesComponent
      }
    ]), 
    MultiSelectModule,
    DropdownModule,
    CalendarModule,
    IonicModule,
    ReactiveFormsModule,
    SharedModule,
    IonRangeCalendarModule,
    PhotoGalleryModule,
    FormsModule  
],

declarations: [MandateLeadStagesComponent ]
})
export class MandateLeadStagesModule {

}

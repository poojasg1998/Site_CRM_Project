import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MandateOverduesComponent } from './mandate-overdues.component';
import { IonRangeCalendarModule } from '@googlproxer/ion-range-calendar';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { SharedModule } from '../../shared.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: MandateOverduesComponent,
      },
    ]),
    MultiSelectModule,
    IonicModule,
    DropdownModule,
    SharedModule,
    CalendarModule,
    IonRangeCalendarModule,
    FormsModule,
  ],

  declarations: [MandateOverduesComponent],
})
export class MandateOverduesModule {}

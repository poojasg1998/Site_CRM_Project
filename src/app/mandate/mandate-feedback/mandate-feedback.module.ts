import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared.module';
import { MandateFeedbackComponent } from './mandate-feedback.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: MandateFeedbackComponent
      }
    ]), 
    SharedModule,
    IonicModule,
    FormsModule,
    CalendarModule,
    DropdownModule,
    MultiSelectModule
],

declarations: [MandateFeedbackComponent]
})
export class MandateFeedbackModule {

}

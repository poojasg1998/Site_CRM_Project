import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MandatePlansComponent } from './mandate-plans.component';
import { SharedModule } from 'src/app/shared.module';
import { CalendarModule } from 'primeng/calendar';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: MandatePlansComponent
      }
    ]), 
    IonicModule ,
    SharedModule,
    CalendarModule,
    FormsModule  
],

declarations: [MandatePlansComponent]
})
export class MandatePlanModule {

}

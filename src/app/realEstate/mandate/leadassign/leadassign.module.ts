import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { LeadassignComponent } from './leadassign.component';
import { CalendarModule } from 'primeng/calendar';
import { SharedModule } from '../../shared.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: LeadassignComponent,
      },
    ]),
    CalendarModule,
    SharedModule,
    IonicModule,
    FormsModule,
  ],

  declarations: [LeadassignComponent],
})
export class LeadassignModule {}

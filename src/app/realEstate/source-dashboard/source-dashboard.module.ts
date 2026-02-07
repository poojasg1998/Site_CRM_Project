import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared.module';
import { SourceDashboardComponent } from './source-dashboard.component';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: SourceDashboardComponent,
      },
    ]),
    IonicModule,
    SharedModule,
    DropdownModule,
    CalendarModule,
    FormsModule,
    ButtonModule
  ],
  declarations: [SourceDashboardComponent],
})
export class SourceDashboardModule {}

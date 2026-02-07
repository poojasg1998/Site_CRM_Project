import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { PhotoGalleryModule } from '@twogate/ngx-photo-gallery';
import { CalendarModule } from 'primeng/calendar';
import { TodayDashboardComponent } from './today-dashboard.component';
import { SharedModule } from '../shared.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: TodayDashboardComponent,
      },
    ]),
    DropdownModule,
    IonicModule,
    SharedModule,
    CalendarModule,
    FormsModule,
    PhotoGalleryModule,
  ],
  declarations: [TodayDashboardComponent],
})
export class TodayDashboardModule {}

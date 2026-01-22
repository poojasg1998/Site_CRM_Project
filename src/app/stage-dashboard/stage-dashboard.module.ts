import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared.module';
import { DropdownModule } from 'primeng/dropdown';
import { PhotoGalleryModule } from '@twogate/ngx-photo-gallery';
import { CalendarModule } from 'primeng/calendar';
import { StageDashboardComponent } from './stage-dashboard.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: StageDashboardComponent,
      },
    ]),
    DropdownModule,
    IonicModule,
    SharedModule,
    CalendarModule,
    FormsModule,
    PhotoGalleryModule,
  ],
  declarations: [StageDashboardComponent],
})
export class StageDashboardModule {}

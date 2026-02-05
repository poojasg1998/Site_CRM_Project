import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared.module';
import { DropdownModule } from 'primeng/dropdown';
import { NotificationComponent } from './notification.component';
import { Chat1Component } from '../chat1/chat1.component';
import { PhotoGalleryModule } from '@twogate/ngx-photo-gallery';
import { CallLogsComponent } from '../call-logs/call-logs.component';
import { CalendarModule } from 'primeng/calendar';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: NotificationComponent,
      },
    ]),
    DropdownModule,
    IonicModule,
    SharedModule,
    CalendarModule,
    FormsModule,
    PhotoGalleryModule,
  ],

  declarations: [NotificationComponent, Chat1Component, CallLogsComponent],
})
export class NotificationModule {}

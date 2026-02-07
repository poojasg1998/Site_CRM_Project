import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { PhotoGalleryModule } from '@twogate/ngx-photo-gallery';
import { Media } from '@ionic-native/media/ngx';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmployeeAttendanceComponent } from './employee-attendance.component';
import { SharedModule } from '../shared.module';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: EmployeeAttendanceComponent,
      },
    ]),
    SharedModule,
    IonicModule,
    FormsModule,
    CalendarModule,
    DropdownModule,
    PhotoGalleryModule,
    PickerModule,
    MultiSelectModule,
  ],

  declarations: [EmployeeAttendanceComponent],
})
export class EmployeeAttendanceModule {}

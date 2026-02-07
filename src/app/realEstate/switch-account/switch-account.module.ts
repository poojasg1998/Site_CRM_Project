import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { PhotoGalleryModule } from '@twogate/ngx-photo-gallery';
import { CalendarModule } from 'primeng/calendar';
import { SwitchAccountComponent } from './switch-account.component';
import { SharedModule } from '../shared.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: SwitchAccountComponent,
      },
    ]),
    DropdownModule,
    IonicModule,
    SharedModule,
    CalendarModule,
    FormsModule,
    PhotoGalleryModule,
  ],
  declarations: [SwitchAccountComponent],
})
export class SwitchAccountdModule {}

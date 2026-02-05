import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared.module';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ClientsChatsComponent } from './clients-chats.component';
import { PhotoGalleryModule } from '@twogate/ngx-photo-gallery';
import { Media } from '@ionic-native/media/ngx';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ClientsChatsComponent,
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

  declarations: [ClientsChatsComponent],
  providers: [Media],
})
export class ClientsChatsModule {}

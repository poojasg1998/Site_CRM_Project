import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IonRangeCalendarModule } from '@googlproxer/ion-range-calendar';
import { DropdownModule } from 'primeng/dropdown';
import { SharedModule } from '../shared.module';
import { ChatComponent } from './chat.component';
import { PhotoGalleryModule } from '@twogate/ngx-photo-gallery';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { Clipboard } from '@ionic-native/clipboard/ngx';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ChatComponent,
      },
    ]),
    IonicModule,
    PdfViewerModule,
    DropdownModule,
    PhotoGalleryModule,
    SharedModule,
    IonRangeCalendarModule,
    FormsModule,
  ],
  providers: [Clipboard],

  declarations: [ChatComponent],
})
export class ChatModule {}

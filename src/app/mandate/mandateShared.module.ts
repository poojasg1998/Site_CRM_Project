import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { JunkformComponent } from './junkform/junkform.component';
import { FollowUpFormComponent } from './follow-up-form/follow-up-form.component';
import { MandateRsvFormComponent } from './mandate-rsv-form/mandate-rsv-form.component';
import { MandateUsvFormComponent } from './mandate-usv-form/mandate-usv-form.component';
import { MandateNegoformComponent } from './mandate-negoform/mandate-negoform.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DropdownModule } from 'primeng/dropdown';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { PhotoGalleryModule } from '@twogate/ngx-photo-gallery';
import { MandateCloseFormComponent } from './mandate-close-form/mandate-close-form.component';

@NgModule({
  declarations: [
    JunkformComponent,
    FollowUpFormComponent,
    MandateRsvFormComponent,
    MandateUsvFormComponent,
    MandateNegoformComponent,
    MandateCloseFormComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    PdfViewerModule,
    DropdownModule,
    NgxExtendedPdfViewerModule,
    NgxMaterialTimepickerModule,
    PhotoGalleryModule,
  ],
  exports: [
    JunkformComponent,
    FollowUpFormComponent,
    MandateRsvFormComponent,
    MandateUsvFormComponent,
    MandateNegoformComponent,
    MandateCloseFormComponent,
  ],
})
export class MandateSharedModule {}

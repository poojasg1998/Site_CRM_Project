import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MandateCustomerDetailsComponent } from './mandate-customer-details.component';
// import { FollowUpFormComponent } from '../follow-up-form/follow-up-form.component';
// import { MandateRsvFormComponent } from '../mandate-rsv-form/mandate-rsv-form.component';
// import { MandateUsvFormComponent } from '../mandate-usv-form/mandate-usv-form.component';
// import { MandateNegoformComponent } from '../mandate-negoform/mandate-negoform.component';
// import { ClosedformComponent } from '../closedform/closedform.component';
// import { JunkformComponent } from '../junkform/junkform.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { PhotoGalleryModule } from '@twogate/ngx-photo-gallery';
import { DropdownModule } from 'primeng/dropdown';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SharedModule } from '../../shared.module';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: MandateCustomerDetailsComponent,
      },
    ]),
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    PdfViewerModule,
    NgMultiSelectDropDownModule,
    DropdownModule,
    NgxExtendedPdfViewerModule,
    NgxMaterialTimepickerModule,
    PhotoGalleryModule,
    SharedModule,
  ],
  providers: [LocalNotifications],
  declarations: [MandateCustomerDetailsComponent],
})
export class MandateCustomerdetailsModule {}

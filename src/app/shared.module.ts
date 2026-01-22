import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CenterActiveButtonDirective } from './center-active-button.directive';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MenuComponent } from './menu/menu.component';
import { RouterModule } from '@angular/router';
import { CommonFooterComponent } from './common-footer/common-footer.component';
import { CheckInOutPhotoCaptureComponent } from './check-in-out-photo-capture/check-in-out-photo-capture.component';
import { HeaderComponent } from './header/header.component';
import { PhotoGalleryModule } from '@twogate/ngx-photo-gallery';
import { MandateSharedModule } from './mandate/mandateShared.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { OnCallLeadUpdateComponent } from './mandate/on-call-lead-update/on-call-lead-update.component';
import { DropdownModule } from 'primeng/dropdown';
import { HighlightPipe } from './highlight.pipe';
import { LineBreaksPipe } from './lineBreaks.pipe';
import { LongPressDirective } from './long-press.directive';
@NgModule({
  declarations: [
    CenterActiveButtonDirective,
    MenuComponent,
    CommonFooterComponent,
    CheckInOutPhotoCaptureComponent,
    HeaderComponent,
    OnCallLeadUpdateComponent,
    HighlightPipe,
    LongPressDirective,
    LineBreaksPipe,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule,
    PhotoGalleryModule,
    MandateSharedModule,
    NgMultiSelectDropDownModule,
    DropdownModule,
  ],
  exports: [
    CenterActiveButtonDirective,
    LongPressDirective,
    MenuComponent,
    CommonFooterComponent,
    CheckInOutPhotoCaptureComponent,
    HeaderComponent,
    OnCallLeadUpdateComponent,
    MandateSharedModule,
    HighlightPipe,
    LineBreaksPipe,
  ],
})
export class SharedModule {}

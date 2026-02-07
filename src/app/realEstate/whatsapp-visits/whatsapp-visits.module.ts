import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgOtpInputModule } from 'ng-otp-input';
import { SharedModule } from '../shared.module';
import { WhatsappVisitsComponent } from './whatsapp-visits.component';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';

@NgModule({
  imports: [
    CommonModule,
    NgOtpInputModule,
    MultiSelectModule,
    RouterModule.forChild([
      {
        path: '',
        component: WhatsappVisitsComponent,
      },
    ]),
    IonicModule,
    SharedModule,
    DropdownModule,
    FormsModule,
  ],

  declarations: [WhatsappVisitsComponent],
})
export class WhatsappVisitsModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { SharedModule } from '../../shared.module';
import { MandatePricingListComponent } from './mandate-pricing-list.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: MandatePricingListComponent,
      },
    ]),
    DropdownModule,
    IonicModule,
    SharedModule,
    FormsModule,
  ],

  declarations: [MandatePricingListComponent],
})
export class MandatePricingListModule {}

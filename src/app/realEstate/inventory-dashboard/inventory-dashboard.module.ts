import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { IonRangeCalendarModule } from '@googlproxer/ion-range-calendar';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { SharedModule } from '../shared.module';
import { InventoryDashboardComponent } from './inventory-dashboard.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: InventoryDashboardComponent,
      },
    ]),
    IonicModule,
    DropdownModule,
    MultiSelectModule,
    IonRangeCalendarModule,
    SharedModule,
    FormsModule,
  ],
  declarations: [InventoryDashboardComponent],
})
export class InventoryDashboardModule {}

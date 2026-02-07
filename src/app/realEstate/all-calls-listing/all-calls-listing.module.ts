import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared.module';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CalendarModule } from 'primeng/calendar';
import { AllCallsListingComponent } from './all-calls-listing.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: AllCallsListingComponent,
      },
    ]),
    SharedModule,
    IonicModule,
    FormsModule,
    DropdownModule,
    MultiSelectModule,
    CalendarModule,
    NgMultiSelectDropDownModule,
  ],

  declarations: [AllCallsListingComponent],
})
export class AllCallsListingModule {}

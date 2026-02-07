import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { VisitUpdatesComponent } from './visit-updates.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { SharedModule } from '../shared.module';


@NgModule({
  imports: [
    CommonModule,
    NgOtpInputModule,
    RouterModule.forChild([
      {
        path: '',
        component: VisitUpdatesComponent
      }
    ]), 
    IonicModule,
    SharedModule,
    FormsModule  
],

declarations: [VisitUpdatesComponent]
})
export class VisitUpdatesModule {

}

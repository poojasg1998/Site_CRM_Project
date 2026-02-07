import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RemindersComponent } from './reminders.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: RemindersComponent
      }
    ]), 
    IonicModule ,
    FormsModule  
],

declarations: [RemindersComponent]
})
export class RemindersModule {

}

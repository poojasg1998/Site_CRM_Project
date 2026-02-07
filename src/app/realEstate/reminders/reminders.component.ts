import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MandateService } from '../mandate-service.service';
import { IonDatetime } from '@ionic/angular';
import Swal from 'sweetalert2';
import {Location} from '@angular/common';

@Component({
  selector: 'app-reminders',
  templateUrl: './reminders.component.html',
  styleUrls: ['./reminders.component.scss'],
})

export class RemindersComponent  implements OnInit {
  //  to display the upcoming, completed and cancelled section
  isUpComing:boolean=false;
  isCompleted:boolean=false;
  isCancelled:boolean=false;

  //to hold date in the formate of yyyy-mm-dd
  todaysdateforcompare: string;
  yesterdaysdateforcompare: string;
  tomorrowsdateforcompare: string;  
  currentdateforcompare = new Date();//to hold the today's date
  callerLeads: any;//hold to all leads data  

  param = {
    fromDate:'',
    toDate:'',
    loginid:'',
    limit:'',
    limitrows:'',
    datefrom: '',
    dateto: '',
    status: '',
    stage: '',
    stagestatus:'',
    propid:'',
    executid:'',
    loginuser:'',
    team: '',
  }

  isAdmin
  totalData: any;//to store total leads
  showSpinner=true; // to display loader symbol
  id;// to hold the leadId value

  // while selecting option, the value should store in one variable and displaying by another variable
  otherReason=''
  otherReason1=''
  selectedReason
  selectedReason1='';

  isTimePickerOpen=false
  date: String = new Date().toISOString();
  @ViewChild('edit_reminder') edit_Reminder:any;
  @ViewChild('datetime') datePicker: IonDatetime;
  @ViewChild('cancel_reminder') cancel_reminder;
  @ViewChild('edit_date') edit_date;

  constructor(private _location: Location,private activeRoute:ActivatedRoute,private router:Router,private mandateService:MandateService) { }

  ngOnInit() {
    this.getDateTime('1022','')
    this.isUpComing = true;
    this.isCompleted=false;
    this.isCancelled=false;

    if(localStorage.getItem('Role')=='1'){
      this.isAdmin=true;
      this.param.executid="";
    }else{
      this.isAdmin=false;
      this.param.loginuser = localStorage.getItem('UserId');
      this.param.executid = localStorage.getItem('UserId');
      if(localStorage.getItem('Role') == '50002'){
        this.param.executid = localStorage.getItem('UserId');    
      }
    }

    this.isUpComing = true;
    this.isCompleted=false;
    this.isCancelled=false;
    this.showSpinner=true; 
    setTimeout(() => {   
      const idsToMatch = JSON.parse(localStorage.getItem('ReminderLeadId'));
      if (idsToMatch) {        
        this.callerLeads = this.totalData.filter(record => { 
          return idsToMatch.includes(record.LeadID);
        });  
        this.showSpinner=false;          
      } else {
      }
      }, 1000); 

    // to featch total leads
    this.mandateService.completeassignedRMLeads(this.param).subscribe(compleads => {   
      this.totalData = compleads['RMLeads'];   
    })   
      
    // to get the yedterday and tomorrow Date for compare
    this.getTodayYesterdayTomorrowDate();
  }

  // // this called when navigate from one component to another
  // ngOnInit() {   
  //   this.isUpComing = true;
  //   this.isCompleted=false;
  //   this.isCancelled=false;
  //   this.showSpinner=true; 
  //   setTimeout(() => {   
  //     const idsToMatch = JSON.parse(localStorage.getItem('ReminderLeadId'));
  //     if (idsToMatch) {        
  //       this.callerLeads = this.totalData.filter(record => { 
  //         return idsToMatch.includes(record.LeadID);
  //       });  
  //       this.showSpinner=false;          
  //     } else {
  //     }
  //     }, 1000);   
  // }

  //To get perticular lead id, reminder date and time
  reminderInfo(leadID: string): string {
    let reminder;
    let formattedDate = '';
    
    if (this.isUpComing) {
        const upComingDateTime = JSON.parse(localStorage.getItem('reminderDateTime'));
        reminder = upComingDateTime.find(time => time.id === leadID);

    } else if (this.isCompleted) {
        const completedDateTime = JSON.parse(localStorage.getItem('completedDateTime'));
        reminder = completedDateTime.find(time => time.id === leadID);
   
    } else if (this.isCancelled) {
        const cancelledDateTime = JSON.parse(localStorage.getItem('cancelledDateTime'));   
        reminder = cancelledDateTime.find(time => time.id === leadID);
    }

    if (reminder) {
        formattedDate = this.getFormattedDate(reminder.date);
        this.selectedReason1 = reminder.reason
        this.otherReason1 = reminder.otherReason
        return formattedDate + " " + reminder.time;
    } else {
        return '';
    }  
  }

  //convert date in fomate of (yyyy-mm-dd) to (06-Apr-2024)
  getFormattedDate(dateString: string): string {
    const dateObj = new Date(dateString);
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Handles the click event for changing the reminder heading.
  handleReminderView(value){
    this.isUpComing = value === 'upcoming';
    this.isCompleted = value === 'completed';
    this.isCancelled = value === 'cancelled';

    let localStorageKey: string;
    switch (value) {
      case 'upcoming':
        localStorageKey = 'ReminderLeadId';
        break;
      case 'completed':
        localStorageKey = 'CompletedLeadId';
        break;
      case 'cancelled':
        localStorageKey = 'CancelledLeadId';
        break;
      default:
        return;
    }

    if (localStorageKey in localStorage) {
      const idsToMatch = JSON.parse(localStorage.getItem(localStorageKey));  
      if (idsToMatch) {
        this.callerLeads = this.totalData.filter(record => {
          this.showSpinner = false;
          return idsToMatch.includes(record.LeadID);
        });       
      } else {
        this.callerLeads = [];
      }
    } else {
      this.callerLeads = [];
    }
  }

  //to get the today's, yesterday and tomorrow date
  getTodayYesterdayTomorrowDate(){
    var curmonth = this.currentdateforcompare.getMonth()+1;
    var curmonthwithzero = curmonth.toString().padStart(2, "0");
    // Todays Date
    var curday = this.currentdateforcompare.getDate();
    var curdaywithzero = curday.toString().padStart(2, "0");
    this.todaysdateforcompare = this.currentdateforcompare.getFullYear()  + "-" + curmonthwithzero + "-" + curdaywithzero;
    // Todays Date
    // Yesterdays Date
    var yesterday = this.currentdateforcompare.getDate()-1;
    var yesterdaywithzero = yesterday.toString().padStart(2, "0");
    this.yesterdaysdateforcompare = this.currentdateforcompare.getFullYear()  + "-" + curmonthwithzero + "-" + yesterdaywithzero;
    // Yesterdays Date
    // Tomorrows Date
    var tomorrow = this.currentdateforcompare.getDate()+1;
    var tomorrowwithzero = tomorrow.toString().padStart(2, "0");
    this.tomorrowsdateforcompare = this.currentdateforcompare.getFullYear()  + "-" + curmonthwithzero + "-" + tomorrowwithzero;
    // Tomorrows Date
  }

  //Function to open the edit Reminder modal 
  editReminder(id){
    this.id=id;
    this.edit_Reminder.present();
  }

  rescheduledDate
  rescheduledTime
  // Function to display the time picker or date picker based on the provided value
  showTimePicker(event,value) {  
    const parsedTime = new Date(event.detail.value);
    // Check if the value is 'time' to display the time picker, otherwise display the date picker
    if(value=='time'){
      this.datePicker.presentation = 'time'
      this.isTimePickerOpen=true //to change background color      
      const hours = parsedTime.getHours() % 12 || 12; // Get hours in 12-hour format
      const minutes = parsedTime.getMinutes().toString().padStart(2, '0'); // Ensure two digits for minutes
      const ampm = parsedTime.getHours() >= 12 ? 'PM' : 'AM'; // Determine AM/PM
      this.rescheduledTime = `${hours}:${minutes} ${ampm}`; 
    }else{
      this.datePicker.presentation = 'date'
      this.isTimePickerOpen=false 
      this.rescheduledDate= parsedTime.toLocaleDateString('en-CA')
    }

    //by default date picker displaying if user wish to cahnge time picker
    if (event.detail.value && !this.isTimePickerOpen) {
      this.datePicker.presentation = 'time'
      this.isTimePickerOpen=true 
      const hours = parsedTime.getHours() % 12 || 12; // Get hours in 12-hour format
      const minutes = parsedTime.getMinutes().toString().padStart(2, '0'); // Ensure two digits for minutes
      const ampm = parsedTime.getHours() >= 12 ? 'PM' : 'AM'; // Determine AM/PM
      this.rescheduledTime = `${hours}:${minutes} ${ampm}`; 
    }else{
    }
  }

  //Function to open the cancel reminder modal
  onCancelReminder(){
    this.selectedReason='';
    this.otherReason = '';
    this.cancel_reminder.present();
  }

 // Function to open the rescheduled date modal
  onResheduleReminder(){
    this.edit_date.present();
    this.isTimePickerOpen=false
  }

  // Function to save the rescheduled date and time
  saveDate(){
    this.datePicker.confirm();
    this.edit_date.dismiss();
    const rescheduledReminder =  JSON.parse(localStorage.getItem("reminderDateTime"))
    if (rescheduledReminder.some(item => item.id === this.id)) {
      var rescheduledReminder1 = rescheduledReminder.map(item => {
       setTimeout(()=>{
        if (item.id === this.id) {
          item.time = this.rescheduledTime;
          item.date = this.rescheduledDate;
        }
       },1000)
        return item;
      });
    }
    localStorage.setItem("reminderDateTime", JSON.stringify(rescheduledReminder1));
  }


  // Function to clear the 'otherReason' value when the radio button checked.
  updateOtherReason(event){
    event.detail.value != ''? this.otherReason='':'';
  }

  // Function to uncheck the radio button if 'otherReason' value present
  checkRadio(event: any) {
    (event.target.value && this.selectedReason)? this.selectedReason = '':'';
  }

  // Function to get todays date and time seperatly and store to localstorage
  getDateTime(id,value){
    const currentDate = new Date();
    const date = currentDate.toLocaleDateString('en-CA');
    const time = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let reminders: any[] = [];
    if (value === 'completedDateTime') {
      reminders = JSON.parse(localStorage.getItem('completedDateTime') || '[]');
    } else if (value === 'cancelledDateTime') {
      reminders = JSON.parse(localStorage.getItem('cancelledDateTime') || '[]');
    }
    const newReminder = { id, date, time };
    if (value === 'cancelledDateTime') {
      newReminder['reason'] = this.selectedReason;
      newReminder['otherReason'] = this.otherReason;
    }
    reminders.push(newReminder);  
    localStorage.setItem(value, JSON.stringify(reminders));  
  }








  



























  


  // to get records of mark to completed reminders
  markToCompleted(id){ 
    this.getDateTime(id,'completedDateTime');
    Swal.fire({
      text: 'Your reminder has been',
      showCloseButton: true,
      showConfirmButton: false,
      timer: 1500,
      html: `  <div style="border-radius:4px; background:linear-gradient(  to right,#29A71A 0%,#29A71A 50%,#29A71A 57%, #29A71A 71%,#29A71A 100%); color: #ffffff; ;padding: 8px; display:flex;justify-content:center;font-size:12px">
      <img src="../../assets/CRMimages/reminder-icon.png"> 
      <span style="font-weight: bold;margin-left:5px">28-Mar-2024 at 11:00 AM</span>
      </div>
      <div style="font-size:16px;font-family:'Poppins';margin-top:5px">
        <p style="color:#000">Your reminder has been</p>
        <p style="color:#29A71A">Completed Successfully</p>
      </div>
      `,
      imageUrl:'../../assets/CRMimages/completedReminder.png',
      imageAlt: 'Alternate Text for Image',
      heightAuto:false
    }).then((result) => {
      // set leadId to localstorage  
      let existingCancelledLeadIdInReminderLeadId = JSON.parse(localStorage.getItem("ReminderLeadId")) || [];
      let existingCompletedDateTimeInReminder = JSON.parse(localStorage.getItem("reminderDateTime")) || [];
      let existingCompletedLeadId = JSON.parse(localStorage.getItem("CompletedLeadId")) || [];

      // to store comleted leadId to localstorage
      if (!existingCompletedLeadId.includes(id)) {
        existingCompletedLeadId.push(id);
        localStorage.setItem("CompletedLeadId", JSON.stringify(existingCompletedLeadId)); // Update the localStorage
      }
      // end

      // to remove complete reminder lead details from the "reminderDateTime" and from the ReminderLeadId
      if(existingCancelledLeadIdInReminderLeadId.includes(id) || existingCompletedDateTimeInReminder.includes(id)){
        existingCancelledLeadIdInReminderLeadId = existingCancelledLeadIdInReminderLeadId.filter(item => item !== id);
        existingCompletedDateTimeInReminder = existingCompletedDateTimeInReminder.filter(item => item.id !== id);
      }
      
      localStorage.setItem("ReminderLeadId", JSON.stringify(existingCancelledLeadIdInReminderLeadId));
      localStorage.setItem("reminderDateTime", JSON.stringify(existingCompletedDateTimeInReminder));//update localstorage

      window.location.reload();
      this.showSpinner=false;      
    });
  }


  // get records of cancelled reminder data
    cancelReminder(){

      this.getDateTime(this.id,'cancelledDateTime');
        
      let CancelledLeadId = JSON.parse(localStorage.getItem("CancelledLeadId")) || [];
      let existingCancelledDateTimeInReminder = JSON.parse(localStorage.getItem("reminderDateTime")) || [];
      if (!CancelledLeadId.includes(this.id)) {
        CancelledLeadId.push(this.id); // Add the new ID to the existing array
        localStorage.setItem("CancelledLeadId", JSON.stringify(CancelledLeadId)); // Update the localStorage
      }

      let existingCancelledDataInReminder = JSON.parse(localStorage.getItem("ReminderLeadId")) || [];
      if(existingCancelledDataInReminder.includes(this.id)|| existingCancelledDateTimeInReminder.includes(this.id)){
        existingCancelledDataInReminder = existingCancelledDataInReminder.filter(item => item !== this.id);
        existingCancelledDateTimeInReminder = existingCancelledDateTimeInReminder.filter(item => item.id !== this.id);
      }
      localStorage.setItem("ReminderLeadId", JSON.stringify(existingCancelledDataInReminder));
      localStorage.setItem("reminderDateTime", JSON.stringify(existingCancelledDateTimeInReminder));

      window.location.reload();
  }

  onBackButton(){
    this._location.back();
    }
  
}

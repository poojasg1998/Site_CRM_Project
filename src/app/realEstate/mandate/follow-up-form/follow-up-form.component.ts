import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { IonPopover, LoadingController } from '@ionic/angular';
import { of, switchMap } from 'rxjs';
import { NgxMaterialTimepickerComponent } from 'ngx-material-timepicker';
import { MandateService } from '../../mandate-service.service';
declare var $: any;

@Component({
  selector: 'app-follow-up-form',
  templateUrl: './follow-up-form.component.html',
  styleUrls: ['./follow-up-form.component.scss'],
})
export class FollowUpFormComponent implements OnInit {
  showSiteVisitDate;
  @Input() selectedExecId: any;
  @Input() selectedSuggestedProp: any;
  @Input() onCallLeadDetails: any;
  showSpinner = true;
  followupsections: any;
  id: any;
  userid: string;
  currentstage: any;
  stagestatusapi: any;
  stagestatus: string;
  executeid: any;
  suggestchecked: any;
  autoremarks: string;
  status: any;
  visitUpdate: any;

  followupTime: any;
  followupDate: any;
  followUpRemark: any; //to store property remark
  followsectiondata: any = ''; //to hold dropdown selected id
  followsectionname: any; //to hold dropdown selected name
  date: String = new Date().toISOString();

  currentdateforcompare = new Date();
  todaysdateforcompare: any;
  currenttime: any;
  isFreshLead: boolean = false;
  followupExecutiveId: any;

  feedbackId = '0';
  maxDate: string;
  buildernamereg: any;
  mails: any;
  regitrationData: any;

  constructor(
    private mandateService: MandateService,
    private activeroute: ActivatedRoute,
    public loadingController: LoadingController,
    private router: Router
  ) {}

  ngOnInit() {
    this.userid = localStorage.getItem('UserId');
    this.activeroute.queryParamMap.subscribe((params) => {
      const paramMap = params.get('leadId');
      this.id = params.get('leadId')
        ? params.get('leadId')
        : this.onCallLeadDetails.customer_IDPK;
      this.feedbackId = params.get('feedback') ? params.get('feedback') : '0';

      const isEmpty = !paramMap;
      var curmonth = this.currentdateforcompare.getMonth() + 1;
      var curmonthwithzero = curmonth.toString().padStart(2, '0');
      var curday = this.currentdateforcompare.getDate();
      var curdaywithzero = curday.toString().padStart(2, '0');
      this.todaysdateforcompare =
        this.currentdateforcompare.getFullYear() +
        '-' +
        curmonthwithzero +
        '-' +
        curdaywithzero;
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
      };
      const timeString = new Date().toLocaleTimeString([], options);
      this.currenttime = timeString;

      // const today = new Date();
      // const nextMonth = new Date(today);
      // nextMonth.setMonth(today.getMonth() + 1);
      // this.maxDate = nextMonth.toISOString().split('T')[0];

      const today = new Date();
      const next7Days = new Date(today);
      next7Days.setDate(today.getDate() + 7);

      this.maxDate = next7Days.toISOString().split('T')[0]; // format YYYY-MM-DD
      this.date = today.toISOString().split('T')[0];

      // if (!isEmpty) {
      // TO GET DROPDOWN OPTIONS FOR FOLLOW UP RESONS
      this.mandateService.getfollowupsections().subscribe((followupsection) => {
        // this.followupsections = followupsection.followupCategories;
        this.followupsections = followupsection.followupCategories.filter(
          (foll) => {
            return (
              foll.followup_categories == 'Callback' ||
              foll.followup_categories == 'NC'
            );
          }
        );
      });

      // to get exceId
      this.mandateService
        .getassignedrm(
          this.id,
          this.userid,
          this.selectedExecId,
          this.feedbackId
        )
        .pipe(
          switchMap((cust) => {
            this.showSpinner = false;
            if (cust && cust['RMname'] && cust['RMname'][0]) {
              this.executeid = cust['RMname'][0].executiveid;
              if (this.userid == '1') {
                this.followupExecutiveId = this.selectedExecId;
              } else {
                this.followupExecutiveId = this.selectedExecId;
              }
              let filteredInfo;
              filteredInfo = cust['RMname'].filter(
                (da) => da.executiveid == this.selectedExecId
              );
              this.getselectedLeadExec = filteredInfo[0];

              if (this.getselectedLeadExec.suggestedprop.length > 1) {
                this.suggestchecked = this.selectedSuggestedProp['propid'];
                this.regitrationData = this.selectedSuggestedProp.registered;
              } else {
                this.suggestchecked =
                  this.getselectedLeadExec?.suggestedprop[0]['propid'];
                this.regitrationData = this.selectedSuggestedProp.registered;
              }

              if (
                this.regitrationData == undefined ||
                this.regitrationData == null ||
                this.regitrationData == ''
              ) {
                this.fetchmails();
              }

              // this.suggestchecked = cust['RMname'][0]['suggestedprop']?.propid;
              this.followupExecutiveId = this.selectedExecId;
            }
            // Return an observable for the second API call
            return this.followupExecutiveId
              ? this.mandateService.getactiveleadsstatus(
                  this.id,
                  this.userid,
                  this.followupExecutiveId,
                  this.suggestchecked,
                  this.feedbackId
                )
              : of(null);
          })
        )
        .subscribe((stagestatus) => {
          if (stagestatus['status'] == 'True') {
            this.currentstage = stagestatus['activeleadsstatus'][0].stage;
            this.stagestatusapi =
              stagestatus['activeleadsstatus'][0].stagestatus;
            if (this.currentstage == null) {
              this.currentstage = 'Fresh';
              this.stagestatus = '0';
            }
            if (stagestatus['activeleadsstatus'][0].stage == 'Fresh') {
              this.isFreshLead = false;
            } else {
              this.isFreshLead = true;
              this.followsectiondata = '1';
              this.followupactionclick(0, '1', 'Callback');
            }
          } else {
            this.currentstage = 'Fresh';
            this.stagestatus = '0';
          }
        });
      // }
    });
  }

  // to display date in the format of YYYY-MM-DD
  onDateChange(event: CustomEvent) {
    const selectedDate = new Date(event.detail.value);
    this.followupDate = selectedDate.toLocaleDateString('en-CA');
  }

  @ViewChild('timepopover') timePopover: IonPopover;
  // TO DISPLAY TIME IN THE FORMAT OF 01:34 PM
  onTimeChange(event: CustomEvent, timepopover: IonPopover) {
    const parsedTime = new Date(event.detail.value);
    const hours = parsedTime.getHours() % 12 || 12; // Get hours in 12-hour format
    const minutes = parsedTime.getMinutes().toString().padStart(2, '0'); // Ensure two digits for minutes
    const ampm = parsedTime.getHours() >= 12 ? 'PM' : 'AM'; // Determine AM/PM
    this.followupTime = `${hours}:${minutes} ${ampm}`;
    setTimeout(() => {
      if (this.isSelectionComplete(this.followupTime)) {
        this.timePopover.dismiss();
      }
    }, 1500);
  }

  isSelectionComplete(time: string): boolean {
    // Implement your logic to check if the time selection is complete
    // For example, check if the time string includes both hour and minute
    const timeParts = time.split(':');
    return timeParts.length === 2 && timeParts[1].length >= 2; // Basic check for HH:mm format
  }

  @ViewChild('popover') popover: IonPopover;
  //when click on date, popup of datepicker closed after selecting date
  closePopover() {
    if (this.popover) {
      this.popover.dismiss();
    }
  }
  getselectedLeadExec;
  //follow up form submisssion
  addfollowupdata() {
    var followdate = $('#folloupdate').val();
    var followtime = $('#followuptime').val();
    var leadstage = $('#sectionselector').val();

    var followuptextarearemarks = $('#followuptextarearemarks').val();
    if (
      followuptextarearemarks == '' ||
      followuptextarearemarks == undefined ||
      followuptextarearemarks == null
    ) {
      followuptextarearemarks = this.followsectionname;
    } else {
      followuptextarearemarks = $('#followuptextarearemarks').val();
    }
    var leadid = this.id;
    var userid = localStorage.getItem('UserId');
    var username = localStorage.getItem('Name');
    var dateformatchange = new Date(followdate).toDateString();

    if (this.currentstage !== 'Fresh') {
      if (this.stagestatusapi == '1') {
        this.stagestatus = '1';
      } else if (this.stagestatusapi == '2') {
        this.stagestatus = '2';
      } else if (this.stagestatusapi == '3') {
        this.stagestatus = '3';
      }
    } else {
      if (this.stagestatusapi == null) {
        this.stagestatus = '0';
      } else {
        this.stagestatus = this.stagestatusapi;
      }
    }

    var followupscommon = {
      leadid: leadid,
      actiondate: followdate,
      actiontime: followtime,
      leadstatus: leadstage,
      stagestatus: '3',
      followupsection: this.followsectiondata,
      followupremarks: followuptextarearemarks,
      userid: userid,
      assignid: this.followupExecutiveId,
      property: this.suggestchecked,
      autoremarks:
        ' Set the next followup on - ' + dateformatchange + ' ' + followtime,
      feedbackid: this.feedbackId,
    };
    if (localStorage.getItem('Name') == 'demo') {
      Swal.fire({
        title: 'Followup fixed restricted for demo accounts',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      }).then(() => {
        this.showSpinner = false;
      });
    } else {
      if ($('#sectionselector').val() == 'USV') {
        // if ($('#USVvisiteddate').val() == "") {
        //   $('#USVvisiteddate').focus().addClass("border_colorRed").attr('placeholder', 'Please Select One Date');
        // }else if($('#USVvisitedtime').val() == ""){
        //   $('#USVvisiteddate').removeClass("border_colorRed");
        //   $('#USVvisitedtime').focus().addClass("border_colorRed").attr('placeholder', 'Please Select One Date');
        // }else

        if (
          !(
            this.getselectedLeadExec?.walkintime != null ||
            this.showSiteVisitDate == true
          ) &&
          $('#USVvisiteddate').val() == ''
        ) {
          $('#USVvisiteddate')
            .focus()
            .addClass('border_colorRed')
            .attr('placeholder', 'Please Select One Date');
        } else if (
          !(
            this.getselectedLeadExec?.walkintime != null ||
            this.showSiteVisitDate == true
          ) &&
          $('#USVvisitedtime').val() == ''
        ) {
          $('#USVvisiteddate').removeClass('border_colorRed');
          $('#USVvisitedtime')
            .focus()
            .addClass('border_colorRed')
            .attr('placeholder', 'Please Select The Time');
        } else if (
          this.followsectionname == '' ||
          this.followsectionname == undefined
        ) {
          $('#USVvisitedtime').removeClass('border_colorRed');
          Swal.fire({
            text: 'Please Select any Followup Actions',
            icon: 'error',
            timer: 2000,
            heightAuto: false,
            confirmButtonText: 'OK',
          });
        } else if ($('#folloupdate').val() == '') {
          $('#followupsection').removeClass('border_colorRed');
          $('#folloupdate')
            .focus()
            .addClass('border_colorRed')
            .attr('placeholder', 'Please Select One Date');
        } else if ($('#followuptime').val() == '') {
          $('#folloupdate').removeClass('border_colorRed');
          $('#followuptime')
            .focus()
            .addClass('border_colorRed')
            .attr('placeholder', 'Please Select The Time');
        } else {
          $('#visitupdate').removeClass('border_colorRed');
          $('#propertyremarks').removeClass('border_colorRed');
          if (this.followsectionname == 'Callback') {
            this.autoremarks =
              ' set the status as Followup after the USV, because client need a callback.';
          } else if (this.followsectionname == 'RNR') {
            this.autoremarks =
              ' tried to contact the client after the USV but, client didnt pick the call. So its set as Followup.';
          } else if (this.followsectionname == 'Switch Off') {
            this.autoremarks =
              ' tried to contact the client after the USV but, number is swtiched off. So its set as Followup.';
          } else if (this.followsectionname == 'Not Connected') {
            this.autoremarks =
              ' tried to contact the client after the USV but, number is not connecting. So its set as Followup.';
          } else if (this.followsectionname == 'Number Busy') {
            this.autoremarks =
              ' tried to contact the client after the USV but, number is busy. So its set as Followup.';
          } else if (this.followsectionname == 'Not Answered') {
            this.autoremarks =
              ' tried to contact the client after the USV but, client is not answering the call. So its set as Followup.';
          } else if (this.followsectionname == 'Not Reachable') {
            this.autoremarks =
              ' tried to contact the client after the USV but, number is in out of coverage area. So its set as Followup.';
          } else if (this.followsectionname == 'NC') {
            this.autoremarks =
              ' set the status as Followup for fixing the next sitevisit.';
          } else {
            this.autoremarks =
              ' Changed the status to Followup after the USV - ' +
              this.followsectionname;
          }

          // parameters & API Submissions for the property sitevisit update
          var visitparam = {
            leadid: this.id,
            propid: this.suggestchecked,
            execid: this.userid,
            visitupdate: 1,
            remarks: 'Interested',
            stage: 'USV',
            assignid: this.followupExecutiveId,
            feedbackid: this.feedbackId,
          };
          this.showSpinner = true;
          var visiteddate = $('#USVvisiteddate').val();
          var visitedtime = $('#USVvisitedtime').val();
          var usvfinalremarks = 'USV Done';

          var leadusvdoneparam = {
            leadid: this.id,
            closedate: visiteddate,
            closetime: visitedtime,
            leadstage: 'USV',
            stagestatus: '3',
            textarearemarks: usvfinalremarks,
            userid: userid,
            assignid: this.followupExecutiveId,
            autoremarks: this.autoremarks,
            property: this.suggestchecked,
            feedbackid: this.feedbackId,
          };

          this.mandateService.addpropertyvisitupdate(visitparam).subscribe(
            (success) => {
              this.status = success['status'];
              if (this.status == 'True') {
                $('#visitupdate').val('4');
                this.mandateService.addleadhistory(leadusvdoneparam).subscribe(
                  (success) => {
                    this.status = success['status'];
                    if (this.status == 'True') {
                      this.mandateService
                        .addfollowuphistory(followupscommon)
                        .subscribe(
                          (success) => {
                            this.status = success['status'];
                            if (this.status == 'True') {
                              this.showSpinner = false;
                              Swal.fire({
                                title: 'Followup Fixed Successfully',
                                text: 'Please check your followup bucket for the Lead reminders',
                                icon: 'success',
                                allowOutsideClick: false,
                                heightAuto: false,
                                confirmButtonText: 'OK!',
                              }).then((result) => {
                                if (result.value) {
                                  location.reload();
                                  // const currentParams = this.activeroute.snapshot.queryParams;
                                  // this.router.navigate([], {
                                  // relativeTo: this.activeroute,
                                  // queryParams: {
                                  //   ...currentParams,
                                  //   stageForm: 'onleadStatus'
                                  // },
                                  // queryParamsHandling: 'merge'
                                  // });
                                }
                              });
                            }
                          },
                          (err) => {
                            console.log('Failed to Update');
                          }
                        );
                    }
                  },
                  (err) => {
                    console.log('Failed to Update');
                  }
                );
              }
            },
            (err) => {
              console.log('Failed to Update');
            }
          );
        }
      }
      // USV DONE with Followup Fixing

      // RSV DONE with Followup Fixing
      else if ($('#sectionselector').val() == 'RSV') {
        // if ($('#RSVvisiteddate').val() == "") {
        //   $('#RSVvisiteddate').focus().addClass("border_colorRed").attr('placeholder', 'Please Select One Date');
        // }else if($('#RSVvisitedtime').val() == ""){
        //   $('#RSVvisiteddate').removeClass("border_colorRed");
        //   $('#RSVvisitedtime').focus().addClass("border_colorRed").attr('placeholder', 'Please Select One Date');
        // }else
        if (
          this.followsectionname == '' ||
          this.followsectionname == undefined
        ) {
          Swal.fire({
            text: 'Please Select any Followup Actions',
            icon: 'error',
            heightAuto: false,
            timer: 2000,
            confirmButtonText: 'OK',
          });
        } else if ($('#folloupdate').val() == '') {
          $('#followupsection').removeClass('border_colorRed');
          $('#folloupdate')
            .focus()
            .addClass('border_colorRed')
            .attr('placeholder', 'Please Select One Date');
        } else if ($('#followuptime').val() == '') {
          $('#folloupdate').removeClass('border_colorRed');
          $('#followuptime')
            .focus()
            .addClass('border_colorRed')
            .attr('placeholder', 'Please Select The Time');
        } else {
          $('#followuptime').removeClass('border_colorRed');
          $('#visitupdate').removeClass('border_colorRed');
          $('#propertyremarks').removeClass('border_colorRed');

          if (this.followsectionname == 'Callback') {
            this.autoremarks =
              ' set the status as Followup after the RSV, because client need a callback.';
          } else if (this.followsectionname == 'RNR') {
            this.autoremarks =
              ' tried to contact the client after the RSV but, client didnt pick the call. So its set as Followup.';
          } else if (this.followsectionname == 'Switch Off') {
            this.autoremarks =
              ' tried to contact the client after the RSV but, number is swtiched off. So its set as Followup.';
          } else if (this.followsectionname == 'Not Connected') {
            this.autoremarks =
              ' tried to contact the client after the RSV but, number is not connecting. So its set as Followup.';
          } else if (this.followsectionname == 'Number Busy') {
            this.autoremarks =
              ' tried to contact the client after the RSV but, number is busy. So its set as Followup.';
          } else if (this.followsectionname == 'Not Answered') {
            this.autoremarks =
              ' tried to contact the client after the RSV but, client is not answering the call. So its set as Followup.';
          } else if (this.followsectionname == 'Not Reachable') {
            this.autoremarks =
              ' tried to contact the client after the RSV but, number is in out of coverage area. So its set as Followup.';
          } else if (this.followsectionname == 'NC') {
            this.autoremarks =
              ' set the status as Followup for fixing the next sitevisit.';
          } else {
            this.autoremarks =
              ' Changed the status to Followup after the RSV - ' +
              this.followsectionname;
          }

          // parameters & API Submissions for the property sitevisit update
          var visitedparam = {
            leadid: this.id,
            propid: this.suggestchecked,
            execid: this.userid,
            visitupdate: 1,
            remarks: 'Interested',
            stage: 'RSV',
            assignid: this.followupExecutiveId,
            feedbackid: this.feedbackId,
          };
          // parameters & API Submissions for the property sitevisit update

          var visiteddate = $('#RSVvisiteddate').val();
          var visitedtime = $('#RSVvisitedtime').val();
          var rsvfinalremarks = 'RSV Done';

          var leadrsvdoneparam = {
            leadid: this.id,
            closedate: visiteddate,
            closetime: visitedtime,
            leadstage: 'RSV',
            stagestatus: '3',
            textarearemarks: rsvfinalremarks,
            userid: userid,
            assignid: this.followupExecutiveId,
            autoremarks: this.autoremarks,
            property: this.suggestchecked,
            feedbackid: this.feedbackId,
          };
          this.showSpinner = true;
          this.mandateService.addpropertyvisitupdate(visitedparam).subscribe(
            (success) => {
              this.status = success['status'];
              if (this.status == 'True') {
                this.mandateService.addleadhistory(leadrsvdoneparam).subscribe(
                  (success) => {
                    this.status = success['status'];
                    if (this.status == 'True') {
                      this.mandateService
                        .addfollowuphistory(followupscommon)
                        .subscribe(
                          (success) => {
                            this.status = success['status'];
                            if (this.status == 'True') {
                              this.showSpinner = false;
                              Swal.fire({
                                title: 'Followup Updated Successfully',
                                text: 'Please check your followup bucket for the Lead reminders',
                                icon: 'success',
                                heightAuto: false,
                                allowOutsideClick: false,
                                confirmButtonText: 'OK!',
                              }).then((result) => {
                                if (result.value) {
                                  location.reload();
                                  // const currentParams = this.activeroute.snapshot.queryParams;
                                  // this.router.navigate([], {
                                  // relativeTo: this.activeroute,
                                  // queryParams: {
                                  //   ...currentParams,
                                  //   stageForm: 'onleadStatus'
                                  // },
                                  // queryParamsHandling: 'merge'
                                  // });
                                }
                              });
                            }
                          },
                          (err) => {
                            console.log('Failed to Update');
                          }
                        );
                    }
                  },
                  (err) => {
                    console.log('Failed to Update');
                  }
                );
              }
            },
            (err) => {
              console.log('Failed to Update');
            }
          );
        }
      }
      // RSV DONE with Followup Fixing

      // NEGOTIATION DONE with Followup Fixing
      else if ($('#sectionselector').val() == 'Final Negotiation') {
        // if ($('#negovisiteddate').val() == "") {
        //   $('#negovisiteddate').focus().addClass("border_colorRed").attr('placeholder', 'Please Select One Date');
        // } else if ($('#negovisitedtime').val() == "") {
        // $('#negovisiteddate').removeClass("border_colorRed");
        //   $('#negovisitedtime').focus().addClass("border_colorRed").attr('placeholder', 'Please Select The Time');
        // }else
        if (
          this.followsectionname == '' ||
          this.followsectionname == undefined
        ) {
          $('#negovisitedtime').removeClass('border_colorRed');
          Swal.fire({
            title: 'Please Select any Followup Actions',
            icon: 'error',
            heightAuto: false,
            timer: 2000,
            showConfirmButton: false,
          });
        } else if ($('#folloupdate').val() == '') {
          $('#followupsection').removeClass('border_colorRed');
          $('#folloupdate')
            .focus()
            .addClass('border_colorRed')
            .attr('placeholder', 'Please Select One Date');
        } else if ($('#followuptime').val() == '') {
          $('#followuptime').removeClass('border_colorRed');
          $('#followuptime')
            .focus()
            .addClass('border_colorRed')
            .attr('placeholder', 'Please Select The Time');
        } else {
          if (this.followsectionname == 'Callback') {
            this.autoremarks =
              ' set the status as Followup after the Finalnegotiation, because client need a callback.';
          } else if (this.followsectionname == 'RNR') {
            this.autoremarks =
              ' tried to contact the client after the Finalnegotiation but, client didnt pick the call. So its set as Followup.';
          } else if (this.followsectionname == 'Switch Off') {
            this.autoremarks =
              ' tried to contact the client after the Finalnegotiation but, number is swtiched off. So its set as Followup.';
          } else if (this.followsectionname == 'Not Connected') {
            this.autoremarks =
              ' tried to contact the client after the Finalnegotiation but, number is not connecting. So its set as Followup.';
          } else if (this.followsectionname == 'Number Busy') {
            this.autoremarks =
              ' tried to contact the client after the Finalnegotiation but, number is busy. So its set as Followup.';
          } else if (this.followsectionname == 'Not Answered') {
            this.autoremarks =
              ' tried to contact the client after the Finalnegotiation but, client is not answering the call. So its set as Followup.';
          } else if (this.followsectionname == 'Not Reachable') {
            this.autoremarks =
              ' tried to contact the client after the Finalnegotiation but, number is in out of coverage area. So its set as Followup.';
          } else if (this.followsectionname == 'NC') {
            this.autoremarks =
              ' set the status as Followup for fixing the next sitevisit.';
          } else {
            this.autoremarks =
              ' Changed the status to Followup after the Finalnegotiation - ' +
              this.followsectionname;
          }

          $('#propertyremarks').removeClass('border_colorRed');
          var visiteddate = $('#negovisiteddate').val();
          var visitedtime = $('#negovisitedtime').val();
          var negofinalremarks = 'Final Negotiation Finished';

          var negovisitparam = {
            leadid: this.id,
            propid: this.suggestchecked,
            execid: this.userid,
            visitupdate: 1,
            remarks: 'Interested',
            stage: 'Final Negotiation',
            assignid: this.followupExecutiveId,
            feedbackid: this.feedbackId,
          };

          var visiteddate = $('#negovisiteddate').val();
          var visitedtime = $('#negovisitedtime').val();
          var negofinalremarks = 'Final Negotiation Finished';

          var leadnegodoneparam = {
            leadid: this.id,
            closedate: visiteddate,
            closetime: visitedtime,
            leadstage: 'Final Negotiation',
            stagestatus: '3',
            textarearemarks: negofinalremarks,
            userid: userid,
            assignid: this.followupExecutiveId,
            autoremarks: this.autoremarks,
            property: this.suggestchecked,
            feedbackid: this.feedbackId,
          };
          this.showSpinner = true;
          this.mandateService.addpropertyvisitupdate(negovisitparam).subscribe(
            (success) => {
              this.status = success['status'];
              if (this.status == 'True') {
                this.mandateService.addleadhistory(leadnegodoneparam).subscribe(
                  (success) => {
                    this.status = success['status'];
                    if (this.status == 'True') {
                      this.mandateService
                        .addfollowuphistory(followupscommon)
                        .subscribe(
                          (success) => {
                            this.status = success['status'];
                            if (this.status == 'True') {
                              this.showSpinner = false;
                              Swal.fire({
                                title: 'Followup Updated Successfully',
                                text: 'Please check your followup bucket for the Lead reminders',
                                icon: 'success',
                                allowOutsideClick: false,
                                heightAuto: false,
                                confirmButtonText: 'OK!',
                              }).then((result) => {
                                if (result.value) {
                                  // const currentParams = this.activeroute.snapshot.queryParams;
                                  // this.router.navigate([], {
                                  // relativeTo: this.activeroute,
                                  // queryParams: {
                                  //   ...currentParams,
                                  //   stageForm: 'onleadStatus'
                                  // },
                                  // queryParamsHandling: 'merge'
                                  // });
                                  location.reload();
                                }
                              });
                            }
                          },
                          (err) => {
                            console.log('Failed to Update');
                          }
                        );
                    }
                  },
                  (err) => {
                    console.log('Failed to Update');
                  }
                );
              }
            },
            (err) => {
              console.log('Failed to Update');
            }
          );
        }
      }
      // NEGOTIATION DONE with Followup Fixing

      // Direct Followup Fixing
      else {
        if (
          this.followsectionname == '' ||
          this.followsectionname == undefined
        ) {
          Swal.fire({
            title: 'Please Select any Followup Actions',
            icon: 'error',
            heightAuto: false,
            timer: 2000,
            showConfirmButton: false,
          });
        } else if ($('#folloupdate').val() == '') {
          $('#followupsection').removeClass('border_colorRed');
          $('#folloupdate')
            .focus()
            .addClass('border_colorRed')
            .attr('placeholder', 'Please Select One Date');
        } else if ($('#followuptime').val() == '') {
          $('#folloupdate').removeClass('border_colorRed');
          $('#followuptime')
            .focus()
            .addClass('border_colorRed')
            .attr('placeholder', 'Please Select The Time');
        } else {
          $('#followuptime').removeClass('border_colorRed');
          var followleadstage = this.currentstage;
          if (this.followsectionname == 'Callback') {
            this.autoremarks =
              ' Changed the status to Followup, because client need a callback.';
          } else if (this.followsectionname == 'RNR') {
            this.autoremarks =
              ' tried to contact the client but, client didnt pick the call. So Changed the status to Followup.';
          } else if (this.followsectionname == 'Switch Off') {
            this.autoremarks =
              ' tried to contact the client but, number is swtiched off. So Changed the status to Followup.';
          } else if (this.followsectionname == 'Not Connected') {
            this.autoremarks =
              ' tried to contact the client but, number is not connecting. So Changed the status to Followup.';
          } else if (this.followsectionname == 'Number Busy') {
            this.autoremarks =
              ' tried to contact the client but, number is busy. So Changed the status to Followup.';
          } else if (this.followsectionname == 'Not Answered') {
            this.autoremarks =
              ' tried to contact the client but, client is not answering the call. So Changed the status to Followup.';
          } else if (this.followsectionname == 'Not Reachable') {
            this.autoremarks =
              ' tried to contact the client but, number is in out of coverage area. So Changed the status to Followup.';
          } else if (this.followsectionname == 'NC') {
            this.autoremarks =
              ' Changed the status to Followup, Need to callback the client for fix the sitevisit.';
          } else {
            this.autoremarks =
              ' Changed the status to Followup - ' + this.followsectionname;
          }

          var followups = {
            leadid: leadid,
            actiondate: followdate,
            actiontime: followtime,
            leadstatus: this.currentstage,
            stagestatus: this.stagestatus,
            followupsection: this.followsectiondata,
            followupremarks: followuptextarearemarks,
            userid: userid,
            assignid: this.followupExecutiveId,
            autoremarks: this.autoremarks,
            property: this.suggestchecked,
            feedbackid: this.feedbackId,
          };

          this.showSpinner = true;
          this.mandateService
            .addfollowuphistory(followups)
            .subscribe((success) => {
              this.status = success['status'];
              if (this.status == 'True') {
                this.showSpinner = false;
                Swal.fire({
                  title: 'Followup Updated Successfully',
                  text: 'Please check your followup bucket for the Lead reminders',
                  icon: 'success',
                  allowOutsideClick: false,
                  heightAuto: false,
                  confirmButtonText: 'OK!',
                }).then((result) => {
                  if (result.value) {
                    if (
                      this.followsectiondata == 8 &&
                      (this.regitrationData == null ||
                        this.regitrationData == undefined ||
                        this.regitrationData == '')
                    ) {
                      let registrationremarks =
                        'Registration Successfully Done';
                      this.showSpinner = true;
                      var param = {
                        leadid: this.id,
                        propid: this.selectedSuggestedProp.propid,
                        customer: this.getselectedLeadExec.customer_name,
                        customernum: this.getselectedLeadExec.customer_number,
                        customermail: this.getselectedLeadExec.customer_mail,
                        rmname: localStorage.getItem('Name'),
                        rmid: localStorage.getItem('UserId'),
                        rmmail: localStorage.getItem('Mail'),
                        execid: this.followupExecutiveId,
                        builder: this.buildernamereg,
                        property: this.selectedSuggestedProp.name,
                        sendto: this.mails[0].builder_mail,
                        sendcc: this.mails[1].builder_mail,
                        remarks: registrationremarks,
                      };

                      this.mandateService.clientregistration(param).subscribe(
                        (success: any) => {
                          var status = success.status;
                          var data = success.success;

                          if (status == '1') {
                            this.showSpinner = false;

                            Swal.fire({
                              title: 'Mail Sent Successfully!',
                              text: 'This Data registered on 30 Days before so Re-registered Successfully',
                              icon: 'success',
                              allowOutsideClick: false,
                              timer: 2000,
                              showConfirmButton: false,
                              heightAuto: false,
                            }).then(() => {
                              location.reload();
                            });
                          } else if (status == '0') {
                            this.showSpinner = false;
                            Swal.fire({
                              title: 'Mail Sent Successfully!',
                              text: 'Registered Successfully',
                              icon: 'success',
                              allowOutsideClick: false,
                              timer: 2000,
                              showConfirmButton: false,
                              heightAuto: false,
                            }).then(() => {
                              location.reload();
                            });
                          } else {
                            this.showSpinner = false;
                            Swal.fire({
                              title: 'Already Registered Data Found.!',
                              text:
                                data[0].registered_property +
                                ' is registered by ' +
                                data[0].registered_RM +
                                ' on ' +
                                data[0].registered_date +
                                '. Please Unselect this Property If it is a group Submission.',
                              icon: 'error',
                              allowOutsideClick: false,
                              timer: 2000,
                              showConfirmButton: false,
                              heightAuto: false,
                            });
                          }
                        },
                        (err) => {
                          console.log('Failed to Update');
                        }
                      );
                    } else {
                      location.reload();
                    }
                  }
                });
              }
            });
        }
      }
    }
  }

  //  ASSIGN LEAD SECTION
  fetchmails() {
    this.showSpinner = true;
    this.mandateService
      .getfetchmail(this.selectedSuggestedProp.propid)
      .subscribe((mails: any) => {
        this.showSpinner = false;
        this.mails = mails.Buildermail;
        this.buildernamereg = mails.Buildermail[0]['builderInfo_name'];
      });
  }

  // to test whether the text earea input contain only space
  hasOnlySpaces;
  checkAlphanumericSpaces() {
    // this.hasOnlySpaces = !/^(?!\s*$).+$/.test(this.followUpRemark);
    this.hasOnlySpaces = !/^(?![\s\n\r]*$)[\s\S]+$/.test(this.followUpRemark);
  }

  // to diaplay loader
  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Loading...',
      duration: 3500,
      cssClass: 'custom-loading-class',
    });
    loading.present();
  }

  followupactionclick(i, id, name) {
    if (
      (id == 1 && name == 'Callback') ||
      (id == 8 && name == 'NC' && this.currentstage == 'Fresh')
    ) {
      this.isFreshLead = true;
      $('#folloupdate').val('');
      $('#followuptime').val('');
      this.followupDate = '';
      this.followupTime = '';
      $('#followuptextarearemarks').val('');
    } else if (this.currentstage == 'Fresh') {
      this.isFreshLead = false;
      $('#folloupdate').val(this.todaysdateforcompare);
      $('#followuptime').val(this.currenttime);
      $('#followuptextarearemarks').val(this.followsectionname);
    }

    $('.actions').addClass('actionbtns');
    $('.selectMark').addClass('iconmark');
    $('.actionbtns').removeClass('actions');
    $('.iconmark').removeClass('selectMark');

    $('.actions' + i).removeClass('actionbtns');
    $('.actions' + i).addClass('actions');
    $('.selectMark' + i).removeClass('iconmark');
    $('.selectMark' + i).addClass('selectMark');

    this.followsectiondata = id;
    this.followsectionname = name;

    const today = new Date();
    const next7Days = new Date(today);

    //  this.followsectionname == 'Callback'
    //    ? new Date(new Date().setDate(this.date.getDate() + 1))
    //    : new Date(new Date().setDate(this.date.getDate() + 3)),

    if (this.followsectionname == 'Callback') {
      next7Days.setDate(today.getDate() + 1);
    } else {
      next7Days.setDate(today.getDate() + 3);
    }
    this.maxDate =
      this.followsectionname == 'Callback'
        ? next7Days.toISOString().split('T')[0]
        : next7Days.toISOString().split('T')[0];
    this.date = today.toISOString().split('T')[0];
  }

  timeError: boolean = false;
  validateTime(): void {
    if (this.followupTime) {
      const [time, modifier] = this.followupTime.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) {
        hours += 12;
      }
      if (modifier === 'AM' && hours === 12) {
        hours = 0;
      }
      const selectedTime = new Date(
        `1970-01-01T${String(hours).padStart(2, '0')}:${String(
          minutes
        ).padStart(2, '0')}:00`
      );
      const startLimit = new Date(`1970-01-01T20:00:00`);
      const endLimit = new Date(`1970-01-01T08:00:00`);
      this.timeError = selectedTime >= startLimit || selectedTime < endLimit;
    } else {
      this.timeError = false;
    }
  }
  @ViewChild('default') timePicker: NgxMaterialTimepickerComponent;

  closeTimePicker() {
    if (this.timePicker) {
      this.timePicker.close();
    }
  }

  ngOnDestroy() {
    this.closeAlert();
  }

  closeAlert() {
    Swal.close();
  }
}

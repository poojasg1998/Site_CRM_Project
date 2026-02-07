import { Component, Input, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { IonPopover, LoadingController } from '@ionic/angular';
import { of, Subject, switchMap, takeUntil } from 'rxjs';
import { MandateService } from '../../mandate-service.service';
declare var $: any;

@Component({
  selector: 'app-mandate-usv-form',
  templateUrl: './mandate-usv-form.component.html',
  styleUrls: ['./mandate-usv-form.component.scss'],
})
export class MandateUsvFormComponent implements OnInit {
  feedbackId = '';
  localStorage = localStorage;
  @Input() selectedExecId: any;
  @Input() selectedSuggestedProp: any;
  @Input() onCallLeadDetails: any;
  showSpinner = true;
  leadid: any = ''; //to store lead id
  userid: string;
  username: string;
  executeid: any;
  suggestchecked: any;
  selectedlists: Object;
  suggestedpropertylists: any;
  nonsuggestedpropertylists: any;
  visitedremarks: any;
  showSiteVisitDate: boolean = false;
  //to store remark for usv fix true
  textarearemarks: any;
  USVvisiteddate;
  USVvisitedtime;

  //to disable past date
  date: String = new Date().toISOString();

  //to hold USV date and time
  usvTime: any;
  usvDate: any;

  isUsvFixedForm: boolean = true;
  isUsvReFixForm: boolean = false;
  isUsvDone: boolean = false;
  isFollowupForm: boolean = false;
  isJunkForm: boolean = false;

  // TO DISPLAY SUB FORM WHEN RSV DONE WITH STATUS NOT UPDATED
  isFollowUpSubForm = false;
  isRsvFixSubForm = false;
  isLeadCloseSubForm = false;
  isFnSubForm = false;

  // to display the STAGES
  hideafterfixed: boolean = true;
  hidebeforefixed: boolean = false;
  hiderefixed: boolean = false;
  leadclose: boolean = false;
  junkmove: boolean = false;

  selectedpropertylists: any;
  visitedpropertylists: any;
  visitstatusupdate: boolean;
  cancelledpropertylists: any;
  properties: any;
  isInterested: boolean = false;
  isNotinterested: boolean = false;
  status: any;
  selectedproperty_commaseperated: any;
  autoremarks: string;
  buttonhiders: boolean;
  activestagestatus: any;
  visitupdate: any;
  propertyremarks: any;
  usvExecutiveId: any;
  leadDetails: any;
  getselectedLeadExec: any;
  maxDate: string;
  minDate: string;
  isCS = false;
  mandateExecList: any;
  selectedExec: any;
  propid: string;
  isAdmin = false;
  buildernamereg: any;
  mails: any;
  regitrationData: any;

  constructor(
    private mandateService: MandateService,
    private activeroute: ActivatedRoute,
    public loadingController: LoadingController,
    private router: Router
  ) {}
  private destroy$ = new Subject<void>();
  ngOnInit() {
    console.log(this.selectedSuggestedProp);
    if (this.isInterested) {
      // Note: It's better to avoid jQuery/ID manipulation in Angular if possible
      $('#visitupdate').val('1');
    }

    this.activeroute.queryParamMap
      .pipe(
        // Use switchMap to chain the route parameters directly to the API call
        switchMap((params) => {
          // 1. **Local Variable Setup (must be done BEFORE returning the Observable)**
          this.isCS =
            localStorage.getItem('Role') == '50014' ||
            localStorage.getItem('Role') == '50013';

          const today = new Date();
          const nextMonth = new Date(today);
          nextMonth.setMonth(today.getMonth() + 1); // add 1 month
          this.maxDate = nextMonth.toISOString().split('T')[0];
          this.minDate = today.toISOString().split('T')[0];

          this.usvDate = '';
          this.usvTime = '';
          this.textarearemarks = '';

          const paramMap = params.get('leadId');

          this.leadid = params.get('leadId')
            ? params.get('leadId')
            : this.onCallLeadDetails.customer_IDPK;
          this.feedbackId = params.get('feedback')
            ? params.get('feedback')
            : '';

          this.propid = params.get('propid');
          this.executeid = params.get('execid');

          this.mandateService
            .fetchmandateexecutives1(params.get('propid'), '', '', '50002')
            .subscribe((response) => {
              this.mandateExecList = response['mandateexecutives'];
            });

          this.userid = localStorage.getItem('UserId');
          this.username = localStorage.getItem('Name');
          this.isAdmin = localStorage.getItem('Role') == '1';

          // 2. **Return the API Observable**
          // The switchMap automatically handles the inner subscription and cleanup.
          return this.mandateService.getassignedrm(
            this.leadid,
            this.userid,
            this.selectedExecId,
            this.feedbackId
          );
        }),
        // 3. **Apply the single cleanup operator**
        takeUntil(this.destroy$)
      )
      .subscribe(
        // 4. **Unified subscription block for the API result**
        (cust) => {
          this.leadDetails = cust['RMname']?.filter((item) => {
            return item.RMID == this.executeid;
          });
          this.leadDetails = this.leadDetails[0];
          this.executeid = this.leadDetails.executiveid;

          if (this.userid == '1') {
            this.usvExecutiveId = this.selectedExecId;
          } else {
            this.usvExecutiveId = this.selectedExecId;
          }

          this.loadimportantapi(); // **NOTE: If this calls an API, it needs its own cleanup!**

          let filteredInfo;
          filteredInfo = cust['RMname'].filter(
            (da) => da.executiveid == this.selectedExecId
          );
          this.getselectedLeadExec = filteredInfo[0];

          if (this.getselectedLeadExec.walkintime) {
            var date = this.getselectedLeadExec.walkintime.split(' ')[0];
            var time = this.getselectedLeadExec.walkintime.split(' ').pop();
            $('#USVvisiteddate').val(date);
            $('#USVvisitedtime').val(time);
          } else {
            $('#USVvisiteddate').val('');
            $('#USVvisitedtime').val('');
          }

          if (
            this.getselectedLeadExec &&
            this.getselectedLeadExec.suggestedprop
          ) {
            this.regitrationData = this.selectedSuggestedProp.registered;
          }

          if (
            this.regitrationData == undefined ||
            this.regitrationData == null ||
            this.regitrationData == ''
          ) {
            this.fetchmails();
          }

          this.showSpinner = false;
        }
      );
  }
  @ViewChild('followupform') followupform;
  onusvFixed() {
    this.isUsvFixedForm = true;
    this.isUsvReFixForm = false;
    this.isUsvDone = false;
    this.isFollowupForm = false;
    this.isJunkForm = false;
  }

  onusvreFix() {
    this.isUsvFixedForm = false;
    this.isUsvReFixForm = true;
    this.isUsvDone = false;
    this.isFollowupForm = false;
    this.isJunkForm = false;
  }

  onusvDone() {
    this.isUsvFixedForm = false;
    this.isUsvReFixForm = false;
    this.isUsvDone = true;
    this.isFollowupForm = false;
    this.isJunkForm = false;
    this.isInterested = true;
    $('#sectionselector').val('USV');
  }

  onfollowup() {
    this.isUsvFixedForm = false;
    this.isUsvReFixForm = false;
    this.isUsvDone = false;
    this.isFollowupForm = false;
    this.isJunkForm = false;
    $('#sectionselector').val('');
  }

  onjunk() {
    this.isUsvFixedForm = false;
    this.isUsvReFixForm = false;
    this.isUsvDone = false;
    this.isFollowupForm = false;
    this.isJunkForm = true;
  }

  // to load important api
  loadimportantapi() {
    var param = {
      leadid: this.leadid,
      userid: this.userid,
      stage: $('#customer_phase4').val(),
      executeid: this.usvExecutiveId,
      feedbackid: this.feedbackId,
    };
    this.mandateService.getsuggestedproperties(param).subscribe((suggested) => {
      this.suggestedpropertylists = suggested['suggestedlists'];
      this.selectedpropertylists = this.selectedpropertylists?.filter(
        (da) => da.propid == this.propid
      );
    });

    this.mandateService
      .getnonselectedproperties(
        this.leadid,
        this.userid,
        this.usvExecutiveId,
        this.feedbackId
      )
      .subscribe((suggested) => {
        this.nonsuggestedpropertylists = suggested['nonselectedlists'];
      });

    this.mandateService
      .getmandateselectedsuggestproperties(
        this.leadid,
        this.userid,
        this.usvExecutiveId,
        this.feedbackId
      )
      .subscribe((selectsuggested) => {
        // if(selectsuggested['status']){
        this.selectedpropertylists = selectsuggested['selectedlists'];
        this.selectedpropertylists = this.selectedpropertylists?.filter(
          (da) => da.propid == this.propid
        );
        this.selectedlists = selectsuggested['selectedlists'];
        this.suggestchecked = this.selectedpropertylists
          ?.map((item) => {
            return item.propid;
          })
          .join(',');
        // }
      });

    this.mandateService
      .getactiveleadsstatus(
        this.leadid,
        this.userid,
        this.usvExecutiveId,
        this.propid,
        this.feedbackId
      )
      .subscribe((stagestatus) => {
        this.showSpinner = false;
        this.activestagestatus = stagestatus['activeleadsstatus'];
        if (
          this.activestagestatus[0].stage == 'USV' &&
          this.activestagestatus[0].stagestatus == '1'
        ) {
          this.hideafterfixed = false;
          this.isUsvFixedForm = false;
          this.hidebeforefixed = true;
          this.hiderefixed = true;
          this.isUsvReFixForm = true;
          $('#sectionselector').val('USV');
        } else if (
          this.activestagestatus[0].stage == 'USV' &&
          this.activestagestatus[0].stagestatus == '2'
        ) {
          this.hideafterfixed = false;
          this.isUsvFixedForm = false;
          this.hidebeforefixed = true;
          this.hiderefixed = true;
          this.isUsvReFixForm = true;
          $('#sectionselector').val('USV');
        } else if (
          this.activestagestatus[0].stage == 'USV' &&
          this.activestagestatus[0].stagestatus == '3' &&
          this.activestagestatus[0].visitstatus == '0'
        ) {
          this.hideafterfixed = false;
          this.hiderefixed = false;
          this.hidebeforefixed = false;
          this.isUsvFixedForm = false;
          this.isUsvReFixForm = false;
          this.isUsvDone = true;
          $('#sectionselector').val('USV');
        } else {
          this.hideafterfixed = true;
        }
      });
    this.mandateService
      .getvisitedsuggestproperties(param)
      .subscribe((visitsuggested) => {
        this.visitedpropertylists = visitsuggested['visitedlists'];
        if (visitsuggested['status'] == 'True') {
          this.visitedremarks = this.visitedpropertylists[0].remarks;
          $('#visitupdate').val('4');
          this.visitstatusupdate = true;
        } else {
        }
      });

    this.mandateService
      .getcancelledsuggestproperties(param)
      .subscribe((cancelsuggested) => {
        this.cancelledpropertylists = cancelsuggested['cancelledlists'];
      });

    let rmid;
    if (this.feedbackId == '1') {
      rmid = this.usvExecutiveId;
    } else {
      rmid = this.userid;
    }

    var params = {
      leadid: this.leadid,
      execid: rmid,
      feedbackid: this.feedbackId,
    };

    this.mandateService.propertylist(params).subscribe((propertylist) => {
      this.properties = propertylist;
    });
  }

  @ViewChild('timepopover') timePopover: IonPopover;
  // TO DISPLAY TIME IN THE FORMAT OF 01:34 PM
  onTimeChange(event: CustomEvent, timepopover) {
    const parsedTime = new Date(event.detail.value);
    const hours = parsedTime.getHours() % 12 || 12; // Get hours in 12-hour format
    const minutes = parsedTime.getMinutes().toString().padStart(2, '0'); // Ensure two digits for minutes
    const ampm = parsedTime.getHours() >= 12 ? 'PM' : 'AM'; // Determine AM/PM
    this.usvTime = `${hours}:${minutes} ${ampm}`;
    setTimeout(() => {
      if (this.isSelectionComplete(this.usvTime)) {
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

  // to display date in the format of YYYY-MM-DD
  onDateChange(event: CustomEvent) {
    const selectedDate = new Date(event.detail.value);
    this.usvDate = selectedDate.toLocaleDateString('en-CA');
  }

  onVisitdateChange(event: CustomEvent) {
    const selectedDate = new Date(event.detail.value);
    this.USVvisiteddate = selectedDate.toLocaleDateString('en-CA');
  }

  // to display interested section
  visitclick() {
    this.textarearemarks && !this.isInterested
      ? (this.textarearemarks = '')
      : '';
    this.isInterested = true;
    this.isNotinterested = false;
    $('#visitupdate').val('1');
    $('.nextactionmaindiv').removeAttr('style');
    $('.visitupdatebtn').attr('style', 'display:none;');
    if (this.getselectedLeadExec.walkintime != null) {
      this.showSiteVisitDate = true;
    } else {
      this.showSiteVisitDate = false;
    }
  }

  // to display not interested section
  cancelclick() {
    this.textarearemarks && !this.isNotinterested
      ? (this.textarearemarks = '')
      : '';
    this.isInterested = false;
    this.isNotinterested = true;
    $('#visitupdate').val('3');
    $('.visitupdatebtn').removeAttr('style');
    $('.nextactionmaindiv').attr('style', 'display:none;');
    this.isFollowUpSubForm = false;
    this.isRsvFixSubForm = false;
    this.isLeadCloseSubForm = false;
    this.isFnSubForm = false;
  }

  // to display sub form for USV Done
  followupdownbtn() {
    this.isFollowUpSubForm = true;
    this.isRsvFixSubForm = false;
    this.isLeadCloseSubForm = false;
    this.isFnSubForm = false;
  }

  onrsvFixedsubbtn() {
    this.isFollowUpSubForm = false;
    this.isRsvFixSubForm = true;
    this.isLeadCloseSubForm = false;
    this.isFnSubForm = false;
  }

  onnegofixed() {
    this.isFollowUpSubForm = false;
    this.isRsvFixSubForm = false;
    this.isLeadCloseSubForm = false;
    this.isFnSubForm = true;
  }

  onleadclosed() {
    this.isFollowUpSubForm = false;
    this.isRsvFixSubForm = false;
    this.isLeadCloseSubForm = true;
    this.isFnSubForm = false;
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

  //USV fixing
  usvfixing() {
    var nextdate = $('#nextactiondate').val();
    var nexttime = $('#nextactiontime').val();
    var textarearemarks = $('#textarearemarks').val();
    var dateformatchange = new Date(nextdate).toDateString();

    if (this.getselectedLeadExec.suggestedprop.length > 1) {
      this.suggestchecked = this.propid;
    } else {
      this.suggestchecked = this.getselectedLeadExec.suggestedprop[0].propid;
    }

    // if($('#priorityhiddeninput').val() == ""){
    //   Swal.fire({
    //     title: 'Priority Level Required',
    //     text: 'Please select priority level',
    //     icon: 'error',
    //     heightAuto: false,
    //     confirmButtonText: 'OK'
    //   })
    // }else{

    var param = {
      leadid: this.leadid,
      nextdate: nextdate,
      nexttime: nexttime,
      suggestproperties: this.suggestchecked,
      execid: this.userid,
      assignid: this.usvExecutiveId,
    };
    this.showSpinner = true;

    if (localStorage.getItem('Name') == 'demo') {
      Swal.fire({
        title: 'Fixing USV is restricted for demo accounts',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      }).then(() => {
        this.showSpinner = false;
      });
    } else {
      this.mandateService
        .addselectedsuggestedproperties(param)
        .subscribe((success) => {
          this.mandateService
            .getmandateselectedsuggestproperties(
              this.leadid,
              this.userid,
              this.usvExecutiveId,
              this.feedbackId
            )
            .subscribe((selectsuggested) => {
              if (selectsuggested['status'] == 'True') {
                this.selectedpropertylists = selectsuggested['selectedlists'];
                this.selectedlists = selectsuggested;
                // Joining the object values as comma seperated when add the property for the history storing
                this.selectedproperty_commaseperated =
                  this.selectedpropertylists
                    .map((item) => {
                      return item.name;
                    })
                    .join(',');
              }
              // Joining the object values as comma seperated when add the property for the history storing
              this.autoremarks =
                'Scheduled the USV for ' +
                this.selectedproperty_commaseperated +
                ' On ' +
                dateformatchange +
                ' ' +
                nexttime;

              var leadusvhistparam = {
                leadid: this.leadid,
                closedate: nextdate,
                closetime: nexttime,
                leadstage: 'USV',
                stagestatus: '1',
                textarearemarks: textarearemarks,
                userid: this.userid,
                assignid: this.usvExecutiveId,
                autoremarks: this.autoremarks,
                property: this.suggestchecked,
                feedbackid: this.feedbackId,
              };
              this.mandateService.addleadhistory(leadusvhistparam).subscribe(
                (success) => {
                  this.status = success['status'];
                  if (this.status == 'True') {
                    $('#nextactiondate').val('');
                    $('#nextactiontime').val('');
                    $('#customer_phase4').val('');
                    $('#textarearemarks').val('');
                    Swal.fire({
                      title: 'USV Fixed Successfully',
                      icon: 'success',
                      heightAuto: false,
                      allowOutsideClick: false,
                      confirmButtonText: 'OK!',
                    }).then((result) => {
                      if (result.value) {
                        if (
                          this.regitrationData == null ||
                          this.regitrationData == undefined ||
                          this.regitrationData == ''
                        ) {
                          let registrationremarks =
                            'Registration Successfully Done';
                          this.showSpinner = true;
                          var param = {
                            leadid: this.leadid,
                            propid: this.selectedSuggestedProp.propid,
                            customer: this.getselectedLeadExec.customer_name,
                            customernum:
                              this.getselectedLeadExec.customer_number,
                            customermail:
                              this.getselectedLeadExec.customer_mail,
                            rmname: localStorage.getItem('Name'),
                            rmid: localStorage.getItem('UserId'),
                            rmmail: localStorage.getItem('Mail'),
                            execid: this.usvExecutiveId,
                            builder: this.buildernamereg,
                            property: this.selectedSuggestedProp.name,
                            sendto: this.mails[0].builder_mail,
                            sendcc: this.mails[1].builder_mail,
                            remarks: registrationremarks,
                          };

                          this.mandateService
                            .clientregistration(param)
                            .subscribe(
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
                                    heightAuto: false,
                                    timer: 2000,
                                    showConfirmButton: false,
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
                                    heightAuto: false,
                                    timer: 2000,
                                    showConfirmButton: false,
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
                                    heightAuto: false,
                                    timer: 2000,
                                    showConfirmButton: false,
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
                  } else if (this.status == 'False' && success['data']) {
                    Swal.fire({
                      title: `USV already fixed by ${success['data'][0].name}`,
                      text: `Please Contact Admin to assign this visit`,
                      icon: 'error',
                      heightAuto: false,
                      showConfirmButton: true,
                    }).then(() => {
                      location.reload();
                    });
                  }
                },
                (err) => {
                  console.log('Failed to Update');
                }
              );
            });
        });
    }
    // }
  }

  // USV reFixing
  usvrefixing() {
    var nextdate = $('#refixdate').val();
    var nexttime = $('#refixtime').val();
    var textarearemarks = $('#refixtextarearemarks').val();
    var dateformatchange = new Date(nextdate).toDateString();
    if (this.getselectedLeadExec.suggestedprop.length > 1) {
      this.suggestchecked = this.propid;
    } else {
      this.suggestchecked = this.leadDetails.suggestedprop[0].propid;
    }

    var param = {
      leadid: this.leadid,
      nextdate: nextdate,
      nexttime: nexttime,
      suggestproperties: this.suggestchecked,
      execid: this.userid,
      assignedId: this.usvExecutiveId,
    };

    this.showSpinner = true;
    if (this.suggestchecked == '') {
      Swal.fire({
        title: 'Property Not Selected',
        text: 'Please select atleast one property for the Sitevisit',
        icon: 'error',
        heightAuto: false,
        timer: 2000,
        showConfirmButton: false,
      });
      this.showSpinner = false;
    } else {
      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'Re-Fixing USV is restricted for demo accounts',
          icon: 'error',
          heightAuto: false,
          confirmButtonText: 'ok',
        }).then(() => {
          this.showSpinner = false;
        });
      } else {
        this.mandateService
          .addselectedsuggestedpropertiesrefix(param)
          .subscribe(
            (success) => {
              this.status = success['status'];
              this.mandateService
                .getselectedsuggestproperties(
                  this.leadid,
                  this.userid,
                  this.usvExecutiveId
                )
                .subscribe((selectsuggested) => {
                  this.selectedpropertylists = selectsuggested['selectedlists'];
                  this.selectedlists = selectsuggested;
                  // Joining the object values as comma seperated when add the property for the history storing
                  this.selectedproperty_commaseperated =
                    this.selectedpropertylists
                      .map((item) => {
                        return item.name;
                      })
                      .join(',');
                  // Joining the object values as comma seperated when add the property for the history storing
                  this.autoremarks =
                    ' ReFixed the USV for ' +
                    this.selectedproperty_commaseperated +
                    ' On ' +
                    dateformatchange +
                    ' ' +
                    nexttime;

                  var leadusvhistparam = {
                    leadid: this.leadid,
                    closedate: nextdate,
                    closetime: nexttime,
                    leadstage: 'USV',
                    stagestatus: '2',
                    textarearemarks: textarearemarks,
                    userid: this.userid,
                    assignid: this.usvExecutiveId,
                    autoremarks: this.autoremarks,
                    property: this.suggestchecked,
                    feedbackid: this.feedbackId,
                  };

                  this.mandateService
                    .addleadhistory(leadusvhistparam)
                    .subscribe(
                      (success) => {
                        this.status = success['status'];
                        if (this.status == 'True') {
                          this.showSpinner = false;
                          Swal.fire({
                            title: 'USV Refixed Successfully',
                            icon: 'success',
                            heightAuto: false,
                            allowOutsideClick: false,
                            confirmButtonText: 'OK!',
                          }).then((result) => {
                            if (result.value) {
                              // const currentParams = this.activeroute.snapshot.queryParams;
                              //       this.router.navigate([], {
                              //       relativeTo: this.activeroute,
                              //       queryParams: {
                              //         ...currentParams,
                              //         stageForm: 'onleadStatus'
                              //       },
                              //       queryParamsHandling: 'merge'
                              //       });
                              location.reload();
                            }
                          });
                        } else if (this.status == 'False' && success['data']) {
                          Swal.fire({
                            title: `USV already fixed by ${success['data'][0].name}`,
                            text: `Please Contact Admin to assign this visit`,
                            icon: 'error',
                            heightAuto: false,
                            showConfirmButton: true,
                          }).then(() => {
                            location.reload();
                          });
                        }
                      },
                      (err) => {
                        console.log('Failed to Update');
                      }
                    );
                });
            },
            (err) => {
              console.log('Failed to Update');
            }
          );
      }
    }
  }

  //not interested form submission
  updatepropertyvisit(propertyid, propertyname) {
    if ($('#visitupdate').val() == '1') {
      this.visitupdate = 'Visited';
    } else if ($('#visitupdate').val() == '3') {
      this.visitupdate = 'Visited but not interested';
    } else {
      this.visitupdate = 'Not Visited';
    }
    this.propertyremarks = $('#propertyremarks').val();

    if ($('#visitupdate').val() == '') {
      Swal.fire({
        title: 'Action Not Took',
        text: 'Please Confirm Property Revisited or Not',
        heightAuto: false,
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } else if (
      $('#propertyremarks').val() == '' ||
      $('#propertyremarks').val().match(/^\s+$/) !== null
    ) {
      Swal.fire({
        title: 'Site Visit Remarks Not Provided',
        text: 'Please add some remarks about the Sitevisit',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      });
      $('#propertyremarks')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please add some remarks about the Sitevisit');
    } else {
      $('#propertyremarks').removeAttr('style');
      $('#visitupdate').removeAttr('style');

      this.autoremarks =
        ' Marked the ' +
        propertyname +
        ' as ' +
        this.visitupdate +
        '. Here is the property remarks - ' +
        this.propertyremarks;

      var param = {
        leadid: this.leadid,
        propid: propertyid,
        execid: this.userid,
        visitupdate: $('#visitupdate').val(),
        remarks: $('#propertyremarks').val(),
        stage: 'USV',
        assignid: this.usvExecutiveId,
        feedbackid: this.feedbackId,
      };

      this.showSpinner = true;
      this.mandateService.addpropertyvisitupdate(param).subscribe(
        (success) => {
          this.status = success['status'];
          if (this.status == 'True') {
            var userid = localStorage.getItem('UserId');
            this.autoremarks =
              ' Moved the lead to Junk, Because of ' + 'Not Interested';
            var leadjunkparam = {
              leadid: this.leadid,
              closedate: '',
              closetime: '',
              leadstage: 'Move to Junk',
              stagestatus: '46',
              textarearemarks: 'Not Interested',
              userid: userid,
              assignid: this.usvExecutiveId,
              autoremarks: this.autoremarks,
              property: propertyid,
              feedbackid: this.feedbackId,
            };

            this.mandateService.addleadhistory(leadjunkparam).subscribe(
              (success) => {
                this.status = success['status'];
              },
              (err) => {
                console.log('Failed to Update');
              }
            );
            $('#visitupdate').val('3');
            Swal.fire({
              title: 'Data Updated Successfully',
              icon: 'success',
              heightAuto: false,
              confirmButtonText: 'OK!',
            }).then((result) => {
              if (result.value) {
                location.reload();
                //  const currentParams = this.activeroute.snapshot.queryParams;
                //             this.router.navigate([], {
                //             relativeTo: this.activeroute,
                //             queryParams: {
                //               ...currentParams,
                //               stageForm: 'onleadStatus'
                //             },
                //             queryParamsHandling: 'merge'
                //             });
              }
            });
          }
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    }
  }

  @ViewChild('popover') popover: IonPopover;
  closePopover() {
    if (this.popover) {
      this.popover.dismiss();
    }
  }

  sitevisitRemark;
  // to test whether the text earea input contain only space
  hasOnlySpaces;
  checkAlphanumericSpaces() {
    // this.hasOnlySpaces = !/^(?!\s*$).+$/.test(this.textarearemarks);
    this.hasOnlySpaces = !/^(?![\s\n\r]*$)[\s\S]+$/.test(this.textarearemarks);
  }
  checkAlphanumericSpaces1() {
    // this.hasOnlySpaces = !/^(?!\s*$).+$/.test(this.sitevisitRemark);
    this.hasOnlySpaces = !/^(?![\s\n\r]*$)[\s\S]+$/.test(this.sitevisitRemark);
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

  isHot;
  isWarm;
  isCold;
  onHotWarmCold(priority) {
    this.isHot = priority === 'hot' ? !this.isHot : false;
    this.isWarm = priority === 'warm' ? !this.isWarm : false;
    this.isCold = priority === 'cold' ? !this.isCold : false;
  }

  timeError: boolean = false;
  validateTime(): void {
    if (this.usvTime) {
      const [time, modifier] = this.usvTime.split(' ');
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

    if (this.timeError) {
      this.usvTime = '';
      $('#nextactiontime').val('');
      $('#refixtime').val('');
    }
  }

  validateVisitTime() {
    if (this.USVvisitedtime) {
      const [time, modifier] = this.USVvisitedtime.split(' ');
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
    if (this.timeError) {
      this.USVvisitedtime = '';
      $('#USVvisitedtime').val('');
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.closeAlert();
  }

  closeAlert() {
    Swal.close();
  }

  assignFixedLead() {
    let param = {
      leadid: this.leadid,
      propid: this.propid,
      loginid: localStorage.getItem('UserId'),
      fromExecid: localStorage.getItem('UserId'),
      toExecid: this.selectedExec.id,
      crmType: '1',
    };

    this.mandateService.assignfixedvisitlead(param).subscribe((resp) => {
      Swal.fire({
        title: 'Visit Assigned Successfully',
        icon: 'success',
        heightAuto: false,
        confirmButtonText: 'OK!',
      }).then((result) => {
        location.reload();
      });
    });
  }
}

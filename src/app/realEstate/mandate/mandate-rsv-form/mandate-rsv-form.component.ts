import { Component, Input, OnInit, ViewChild } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { IonPopover, LoadingController, ModalController } from '@ionic/angular';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { MandateService } from '../../mandate-service.service';
declare var $: any;

@Component({
  selector: 'app-mandate-rsv-form',
  templateUrl: './mandate-rsv-form.component.html',
  styleUrls: ['./mandate-rsv-form.component.scss'],
})
export class MandateRsvFormComponent implements OnInit {
  @Input() selectedExecId: any;
  @Input() selectedSuggestedProp: any;
  @Input() onCallLeadDetails: any;
  feedbackId = '';
  showSpinner = true;

  //To DISPLAY THE FORM FOR INITIAL LOAD
  isRsvFixedForm: boolean = true;
  isRsvReFixForm: boolean = false;
  isRsvDone: boolean = false;
  isFollowupForm: boolean = false;
  isJunkForm: boolean = false;

  // TO DISPLAY SUB FORM WHEN RSV DONE WITH STATUS NOT UPDATED
  isFollowUpSubForm = false;
  isRsvFixSubForm = false;
  isLeadCloseSubForm = false;
  isFnSubForm = false;

  isInterested = false;
  assigedrm: any;
  rsvExecutiveId: any;
  getselectedLeadExec: any;
  propertybasedFilter: any;
  maxDate: string; //TO DISPPLAY INTERESTED OR NOT INTERESTED SECTION
  isNotInterested = false;

  //TO STORE RSV DATE AND TIME
  rsvDate: any;
  rsvTime: any;
  selectedpropertylists: any; //TO STORE SELECTED PROPERTY LIST
  visitstatusupdate: boolean;
  selectedlists: any;
  suggestchecked: any;
  visitedpropertylists: any;
  cancelledpropertylists: any;

  //to disable past date
  date: String = new Date().toISOString();
  id: any; //to store lead id
  userid: string;
  username: string;

  //to store remarks
  textarearemarks: any;
  textarearemarks1: any;
  rsvtextarearemarks: any;
  subrsvtextarearemarks: any;
  refixtextarearemarks: any;

  buttonhiders: boolean = true; //to display stages

  hideafterfixed: boolean = true;
  hidebeforefixed: boolean = false;
  commonhide: boolean = true;
  status: any;
  selectedproperty_commaseperated: any;
  autoremarks: string;
  executeid: any;
  activestagestatus: any;
  visitupdate: any;
  propertyremarks: any;
  propertyId;
  minDate: string;
  isCS;
  private destroy$ = new Subject<void>();
  propid: string;
  mandateExecList: any;
  selectedExec: any;
  roleid = '';
  constructor(
    private mandateService: MandateService,
    private activeroute: ActivatedRoute,
    public loadingController: LoadingController,
    private router: Router,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.propertyId = $('#property').val();
    $('#visitupdate').val('1');

    this.activeroute.queryParamMap
      .pipe(
        // Use switchMap to chain the route parameters directly to the API call
        switchMap((params) => {
          this.isCS =
            localStorage.getItem('Role') == '50014' ||
            localStorage.getItem('Role') == '50013';
          const today = new Date();
          const nextMonth = new Date(today);
          nextMonth.setMonth(today.getMonth() + 1); // add 1 month

          this.maxDate = nextMonth.toISOString().split('T')[0]; // format YYYY-MM-DD for ion-datetime
          this.minDate = today.toISOString().split('T')[0];

          const paramMap = params.get('leadId');
          this.id = params.get('leadId')
            ? params.get('leadId')
            : this.onCallLeadDetails.customer_IDPK;
          this.feedbackId = params.get('feedback')
            ? params.get('feedback')
            : '';
          const isEmpty = !paramMap;
          this.roleid = localStorage.getItem('RoleId');
          this.userid = localStorage.getItem('UserId');
          this.username = localStorage.getItem('Name');

          this.propid = params.get('propid');

          this.mandateService
            .fetchmandateexecutives1(params.get('propid'), '', '', '50002')
            .subscribe((response) => {
              this.mandateExecList = response['mandateexecutives'];
            });
          return this.mandateService.getassignedrm(
            this.id,
            this.userid,
            this.selectedExecId,
            this.feedbackId
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((cust) => {
        this.assigedrm = cust['RMname'];
        this.executeid = cust['RMname'][0].executiveid;
        if (this.userid == '1') {
          this.rsvExecutiveId = this.selectedExecId;
        } else {
          this.rsvExecutiveId = this.selectedExecId;
        }

        let filteredInfo;
        filteredInfo = cust['RMname'].filter(
          (da) => da.executiveid == this.selectedExecId
        );
        this.getselectedLeadExec = filteredInfo[0];

        if (this.getselectedLeadExec.suggestedprop) {
          this.propertybasedFilter = this.getselectedLeadExec.suggestedprop;
          this.propertybasedFilter = this.propertybasedFilter.filter(
            (da) => da.propid == this.propid
          );
          $('#RSVvisiteddate').val(this.propertybasedFilter[0].followupdate);
          $('#RSVvisitedtime').val(this.propertybasedFilter[0].followuptime);
        } else {
          $('#RSVvisiteddate').val('');
          $('#RSVvisitedtime').val('');
        }
        this.loadimportantapi();
      });

    // this.activeroute.queryParamMap.subscribe((params) => {
    //   this.isCS =
    //     localStorage.getItem('Role') == '50001' ||
    //     localStorage.getItem('Role') == '50002' ||
    //     localStorage.getItem('Role') == '50009' ||
    //     localStorage.getItem('Role') == '50010' ||
    //     localStorage.getItem('Role') == '50014';
    //   const today = new Date();
    //   const nextMonth = new Date(today);
    //   nextMonth.setMonth(today.getMonth() + 1); // add 1 month

    //   this.maxDate = nextMonth.toISOString().split('T')[0]; // format YYYY-MM-DD for ion-datetime
    //   this.minDate = today.toISOString().split('T')[0];

    //   const paramMap = params.get('leadId');
    //   this.id = params.get('leadId')
    //     ? params.get('leadId')
    //     : this.onCallLeadDetails.customer_IDPK;
    //   this.feedbackId = params.get('feedback') ? params.get('feedback') : '';
    //   const isEmpty = !paramMap;
    //   this.userid = localStorage.getItem('UserId');
    //   this.username = localStorage.getItem('Name');
    //   // if (!isEmpty) {
    //   this.mandateService
    //     .getassignedrm(
    //       this.id,
    //       this.userid,
    //       this.selectedExecId,
    //       this.feedbackId
    //     )
    //     .subscribe((cust) => {
    //       this.assigedrm = cust['RMname'];
    //       this.executeid = cust['RMname'][0].executiveid;
    //       if (this.userid == '1') {
    //         this.rsvExecutiveId = this.selectedExecId;
    //       } else {
    //         this.rsvExecutiveId = this.selectedExecId;
    //       }

    //       let filteredInfo;
    //       filteredInfo = cust['RMname'].filter(
    //         (da) => da.executiveid == this.selectedExecId
    //       );
    //       this.getselectedLeadExec = filteredInfo[0];

    //       if (this.getselectedLeadExec.suggestedprop) {
    //         this.propertybasedFilter = this.getselectedLeadExec.suggestedprop;
    //         this.propertybasedFilter = this.propertybasedFilter.filter(
    //           (da) => da.propid == this.selectedSuggestedProp.propid
    //         );
    //         $('#RSVvisiteddate').val(this.propertybasedFilter[0].followupdate);
    //         $('#RSVvisitedtime').val(this.propertybasedFilter[0].followuptime);
    //       } else {
    //         $('#RSVvisiteddate').val('');
    //         $('#RSVvisitedtime').val('');
    //       }
    //       this.loadimportantapi();
    //     });
    //   // }
    // });

    if (
      $('#sectionselector').val() == 'SV' ||
      $('#sectionselector').val() == 'USV' ||
      $('#sectionselector').val() == 'Final Negotiation'
    ) {
      this.buttonhiders = false;
    } else {
      this.buttonhiders = true;
    }
  }

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

  //TO GET STAGES
  getStages() {
    this.mandateService
      .getactiveleadsstatus(
        this.id,
        this.userid,
        this.rsvExecutiveId,
        this.propid,
        this.feedbackId
      )
      .subscribe((stagestatus) => {
        this.showSpinner = false;
        this.activestagestatus = stagestatus['activeleadsstatus'];
        if (
          this.activestagestatus[0].stage == 'RSV' &&
          this.activestagestatus[0].stagestatus == '1'
        ) {
          this.hideafterfixed = false;
          this.isRsvFixedForm = false;
          this.hidebeforefixed = true;
          this.isRsvReFixForm = true;
          $('#sectionselector').val('RSV');
        } else if (
          this.activestagestatus[0].stage == 'RSV' &&
          this.activestagestatus[0].stagestatus == '2'
        ) {
          this.hideafterfixed = false;
          this.isRsvFixedForm = false;
          this.hidebeforefixed = true;
          this.isRsvReFixForm = true;
          $('#sectionselector').val('RSV');
        } else if (
          this.activestagestatus[0].stage == 'RSV' &&
          this.activestagestatus[0].stagestatus == '3' &&
          this.activestagestatus[0].visitstatus == '0'
        ) {
          this.hideafterfixed = false;
          this.hidebeforefixed = false;
          this.isRsvDone = true;
          this.isRsvFixedForm = false;
          this.commonhide = false;
          $('#sectionselector').val('RSV');
        } else if (
          this.activestagestatus[0].stage == 'RSV' &&
          this.activestagestatus[0].stagestatus == '3' &&
          this.activestagestatus[0].visitstatus == '1'
        ) {
          this.hideafterfixed = true;
          this.hidebeforefixed = false;
          this.isRsvDone = false;
          this.isRsvFixedForm = true;
          $('#sectionselector').val('RSV');
        } else {
          this.hideafterfixed = true;
        }
      });
  }

  //to get important api
  loadimportantapi() {
    var param = {
      leadid: this.id,
      execid: this.userid,
      stage: 'RSV',
      assignid: this.rsvExecutiveId,
      feedbackid: this.feedbackId,
    };

    this.mandateService
      .rsvselectproperties(param)
      .subscribe((selectsuggested) => {
        if (selectsuggested['status'] == 'True') {
          this.selectedpropertylists = selectsuggested['selectedrsvlists'];
          this.selectedpropertylists = this.selectedpropertylists.filter(
            (da) => da.propid == this.propid
          );
          this.selectedlists = selectsuggested['selectedrsvlists'];
        } else {
          this.selectedpropertylists = selectsuggested['selectedrsvlists'];
          this.selectedpropertylists = this.selectedpropertylists?.filter(
            (da) => da.propid == this.propid
          );
          this.selectedlists = selectsuggested['selectedrsvlists'];
          this.visitstatusupdate = true;
          this.showSpinner = false;
        }
        this.getStages();
      });

    var param1 = {
      leadid: this.id,
      userid: this.userid,
      stage: 'RSV',
      executeid: this.rsvExecutiveId,
      feedbackid: this.feedbackId,
    };

    this.mandateService
      .getvisitedsuggestproperties(param1)
      .subscribe((visitsuggested) => {
        this.visitedpropertylists = visitsuggested['visitedlists'];
        if (this.visitedpropertylists) {
          this.suggestchecked = this.visitedpropertylists
            .map((item) => {
              return item.propid;
            })
            .join(',');
        }
      });

    var param2 = {
      leadid: this.id,
      userid: this.userid,
      stage: 'RSV',
      executeid: this.rsvExecutiveId,
      feedbackid: this.feedbackId,
    };

    //   .set('LeadID',  param.leadid)
    // .set('Stage',  param.stage)
    // .set('ExecId',  param.userid)
    // .set('assignID', param.executeid)
    //   .set('feedback',  param.feedbackid)

    this.mandateService
      .getcancelledsuggestproperties(param2)
      .subscribe((cancelsuggested) => {
        this.cancelledpropertylists = cancelsuggested['cancelledlists'];
      });

    //   this.mandateService.getassignedrm(this.id,this.userid).subscribe(cust => {
    //     this.executeid = cust['RMname'][0].executiveid;
    //     // Adding RSV Visit date time to RSV Submission Section
    //     $('#RSVvisiteddate').val(cust['RMname'][0]['suggestedprop'][0].followupdate);
    //     $('#RSVvisitedtime').val(cust['RMname'][0]['suggestedprop'][0].followuptime);
    //    // Adding RSV Visit date time to RSV Submission Section
    //    var param = {
    //     leadid: this.id,
    //     userid: this.userid,
    //     stage:  "RSV",
    //     executeid:this.executeid
    //   }
    //   this.mandateService.rsvselectproperties(param).subscribe(selectsuggested => {
    //     if(selectsuggested['status'] == 'True'){
    //       this.selectedpropertylists = selectsuggested['selectedrsvlists'];
    //       this.selectedlists = selectsuggested;
    //     }else{
    //       this.selectedpropertylists = selectsuggested['selectedrsvlists'];
    //       this.selectedlists = selectsuggested;
    //       this.visitstatusupdate = true;
    //     }
    //   });

    //   this.mandateService.getvisitedsuggestproperties(param).subscribe(visitsuggested => {
    //       if(visitsuggested['status']=='True'){
    //       this.visitedpropertylists = visitsuggested['visitedlists'];
    //       this.suggestchecked = this.visitedpropertylists.map((item) => { return item.propid }).join(',');
    //     }
    //   });

    //   this.mandateService.getcancelledsuggestproperties(param).subscribe(cancelsuggested => {
    //     this.cancelledpropertylists = cancelsuggested['cancelledlists'];
    //   });
    // })
  }

  //RSV Done with RSV form submition
  rsvdonewithfixing() {
    if (this.getselectedLeadExec.suggestedprop.length > 1) {
      this.suggestchecked = this.propid;
    } else {
      this.suggestchecked = this.getselectedLeadExec.suggestedprop[0].propid;
    }
    if ($('#RSVvisiteddate').val() == '') {
      $('#RSVvisiteddate')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Select One Date');
    } else {
      $('#RSVvisiteddate').removeAttr('style');
    }

    if ($('#RSVvisitedtime').val() == '') {
      $('#RSVvisitedtime')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Select One Date');
    } else {
      $('#RSVvisitedtime').removeAttr('style');
    }

    {
      var visitedparam = {
        leadid: this.id,
        propid: this.suggestchecked,
        execid: this.userid,
        visitupdate: 1,
        remarks: 'Interested',
        stage: $('#customer_phase4').val(),
        assignid: this.rsvExecutiveId,
        feedbackid: this.feedbackId,
      };

      const inputDate = new Date($('#subrsvnextactiondate').val());
      const nextactiondate =
        inputDate.getFullYear() +
        '-' +
        (inputDate.getMonth() + 1) +
        '-' +
        inputDate.getDate();
      var nextactiontime = $('#subrsvnextactiontime').val();
      var priority = $('#priorityhiddeninput').val();

      var param = {
        leadid: this.id,
        nextdate: nextactiondate,
        nexttime: nextactiontime,
        suggestproperties: this.suggestchecked,
        execid: this.userid,
        assignid: this.rsvExecutiveId,
        feedbackid: this.feedbackId,
      };
      this.showSpinner = true;

      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'Fixing RSV is restricted for demo accounts',
          icon: 'error',
          heightAuto: false,
          confirmButtonText: 'ok',
        }).then(() => {
          this.showSpinner = false;
        });
      } else {
        let visitupdateremarks = $('#propertyremarks').val().trim();
        if (visitupdateremarks == '' || visitupdateremarks == undefined) {
          Swal.fire({
            title: 'Please add some remarks about the Sitevisit',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          }).then(() => {
            this.showSpinner = false;
          });
          $('#USVvisitedtime').removeClass('border_colorRed');
        } else {
          this.autoremarks =
            ' Scheduled the RSV for ' +
            this.selectedproperty_commaseperated +
            ' On ' +
            new Date($('#subrsvnextactiontime').val()).toDateString() +
            ' ' +
            $('#subrsvnextactiontime').val();
          var leadrsvfixparam = {
            leadid: this.id,
            closedate: $('#subrsvnextactiondate').val(),
            closetime: $('#subrsvnextactiontime').val(),
            leadstage: 'RSV',
            stagestatus: '1',
            textarearemarks: $('#subrsvtextarearemarks').val(),
            userid: this.userid,
            assignid: this.rsvExecutiveId,
            autoremarks: this.autoremarks,
            property: this.suggestchecked,
            feedbackid: this.feedbackId,
          };
          this.mandateService
            .addleadhistory(leadrsvfixparam)
            .subscribe((success) => {
              this.status = success['status'];
              if (this.status == 'True') {
                this.mandateService
                  .addpropertyvisitupdate(visitedparam)
                  .subscribe(
                    (success) => {
                      this.status = success['status'];
                      if (this.status == 'True') {
                        this.mandateService.addrsvselected(param).subscribe(
                          (success) => {
                            var param = {
                              leadid: this.id,
                              execid: this.userid,
                              stage: 'RSV',
                              assignid: this.rsvExecutiveId,
                              feedbackid: this.feedbackId,
                            };
                            this.mandateService
                              .rsvselectproperties(param)
                              .subscribe((selectsuggested) => {
                                this.selectedpropertylists =
                                  selectsuggested['selectedrsvlists'];
                                // Joining the object values as comma seperated when remove the property for the history storing
                                this.selectedproperty_commaseperated =
                                  this.selectedpropertylists
                                    .map((item) => {
                                      return item.name;
                                    })
                                    .join(',');
                                // Joining the object values as comma seperated when remove the property for the history storing

                                var rsvvisiteddate = $('#RSVvisiteddate').val();
                                var rsvvisitedtime = $('#RSVvisitedtime').val();
                                var rsvfinalremarks = 'RSV Done';
                                this.autoremarks =
                                  ' Completed the RSV Successfully';
                                var leadrsvdoneparam = {
                                  leadid: this.id,
                                  closedate: rsvvisiteddate,
                                  closetime: rsvvisitedtime,
                                  leadstage: 'RSV',
                                  stagestatus: '3',
                                  textarearemarks: rsvfinalremarks,
                                  userid: this.userid,
                                  assignid: this.rsvExecutiveId,
                                  autoremarks: this.autoremarks,
                                  property: this.suggestchecked,
                                  feedbackid: this.feedbackId,
                                };
                                this.mandateService
                                  .addleadhistory(leadrsvdoneparam)
                                  .subscribe(
                                    (success) => {
                                      this.status = success['status'];
                                      if (this.status == 'True') {
                                        const inputDate = new Date(
                                          $('#subrsvnextactiondate').val()
                                        );
                                        const nextdate =
                                          inputDate.getFullYear() +
                                          '-' +
                                          (inputDate.getMonth() + 1) +
                                          '-' +
                                          inputDate.getDate();
                                        var nexttime = $(
                                          '#subrsvnextactiontime'
                                        ).val();
                                        var textarearemarks = $(
                                          '#subrsvtextarearemarks'
                                        ).val();
                                        this.autoremarks =
                                          ' again scheduled the RSV';
                                        var dateformatchange = new Date(
                                          nextdate
                                        ).toDateString();
                                        this.autoremarks =
                                          'Scheduled the RSV again for ' +
                                          this.selectedproperty_commaseperated +
                                          ' On ' +
                                          dateformatchange +
                                          ' ' +
                                          nexttime;
                                        var leadrsvfixparam = {
                                          leadid: this.id,
                                          closedate: nextdate,
                                          closetime: nexttime,
                                          leadstage: 'RSV',
                                          stagestatus: '1',
                                          textarearemarks: textarearemarks,
                                          userid: this.userid,
                                          assignid: this.rsvExecutiveId,
                                          autoremarks: this.autoremarks,
                                          property: this.suggestchecked,
                                          feedbackid: this.feedbackId,
                                        };
                                        this.mandateService
                                          .addleadhistory(leadrsvfixparam)
                                          .subscribe(
                                            (success) => {
                                              this.status = success['status'];
                                              if (this.status == 'True') {
                                                $('#nextactiondate').val('');
                                                $('#nextactiontime').val('');
                                                $('#customer_phase4').val('');
                                                $('#rsvtextarearemarks').val(
                                                  ''
                                                );
                                                Swal.fire({
                                                  title:
                                                    'RSV Fixed Successfully',
                                                  icon: 'success',
                                                  heightAuto: false,
                                                  allowOutsideClick: false,
                                                  confirmButtonText: 'OK!',
                                                }).then((result) => {
                                                  this.showSpinner = false;
                                                  const currentParams =
                                                    this.activeroute.snapshot
                                                      .queryParams;
                                                  // this.router.navigate([], {
                                                  // relativeTo: this.activeroute,
                                                  // queryParams: {
                                                  //   ...currentParams,
                                                  //   stageForm: 'onleadStatus'
                                                  // },
                                                  // queryParamsHandling: 'merge'
                                                  // });
                                                  location.reload();
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
                              });
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
              } else if (this.status == 'False' && success['data']) {
                this.showSpinner = false;
                Swal.fire({
                  title: `RSV already fixed by ${success['data'][0].name}`,
                  text: `Please Contact Admin to assign this visit`,
                  icon: 'error',
                  heightAuto: false,
                  showConfirmButton: true,
                }).then(() => {
                  location.reload();
                });
              }
            });
        }
      }
    }
  }

  // RSV REFIXING
  rsvrefixing() {
    var nextdate = $('#refixdate').val();
    var nexttime = $('#refixtime').val();
    var textarearemarks = $('#refixtextarearemarks').val();
    var dateformatchange = new Date(nextdate).toDateString();
    var priority = $('#priorityhiddeninput').val();

    if (this.getselectedLeadExec.suggestedprop.length > 1) {
      this.suggestchecked = this.propid;
    } else {
      this.suggestchecked = this.getselectedLeadExec.suggestedprop[0].propid;
    }

    var param = {
      leadid: this.id,
      nextdate: nextdate,
      nexttime: nexttime,
      suggestproperties: this.suggestchecked,
      execid: this.userid,
      assignedId: this.rsvExecutiveId,
      feedbackid: this.feedbackId,
    };

    //  if($('#priorityhiddeninput').val() == ""){
    //     Swal.fire({
    //       title: 'Priority Level Required',
    //       text: 'Please select priority level',
    //       icon: 'error',
    //       heightAuto: false,
    //       confirmButtonText: 'OK'
    //     })
    //   }else
    // {

    if (localStorage.getItem('Name') == 'demo') {
      Swal.fire({
        title: 'Re-Fixing RSV is restricted for demo accounts',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      }).then(() => {
        this.showSpinner = false;
      });
    } else {
      this.showSpinner = true;
      this.mandateService.addrsvselectedrefix(param).subscribe(
        (success) => {
          this.status = success['status'];
          if (this.status == 'True') {
            var param = {
              leadid: this.id,
              execid: this.userid,
              stage: 'RSV',
              assignid: this.rsvExecutiveId,
              feedbackid: this.feedbackId,
            };
            this.mandateService
              .rsvselectproperties(param)
              .subscribe((selectsuggested) => {
                this.selectedpropertylists =
                  selectsuggested['selectedrsvlists'];
                // Joining the object values as comma seperated when remove the property for the history storing
                this.selectedproperty_commaseperated =
                  this.selectedpropertylists
                    .map((item) => {
                      return item.name;
                    })
                    .join(',');
                // Joining the object values as comma seperated when remove the property for the history storing
                this.autoremarks =
                  ' ReFixed the RSV for ' +
                  this.selectedproperty_commaseperated +
                  ' On ' +
                  dateformatchange +
                  ' ' +
                  nexttime;

                var leadrsvrefixparam = {
                  leadid: this.id,
                  closedate: nextdate,
                  closetime: nexttime,
                  leadstage: 'RSV',
                  stagestatus: '2',
                  textarearemarks: textarearemarks,
                  userid: this.userid,
                  assignid: this.rsvExecutiveId,
                  autoremarks: this.autoremarks,
                  property: this.suggestchecked,
                  feedbackid: this.feedbackId,
                };
                this.mandateService.addleadhistory(leadrsvrefixparam).subscribe(
                  (success) => {
                    this.showSpinner = false;
                    this.status = success['status'];
                    if (this.status == 'True') {
                      Swal.fire({
                        title: 'RSV Refixed Successfully',
                        icon: 'success',
                        heightAuto: false,
                        allowOutsideClick: false,
                        confirmButtonText: 'OK!',
                      }).then((result) => {
                        if (result.value) {
                          // const currentParams = this.activeroute.snapshot.queryParams;
                          //   this.router.navigate([], {
                          //   relativeTo: this.activeroute,
                          //   queryParams: {
                          //     ...currentParams,
                          //     stageForm: 'onleadStatus'
                          //   },
                          //   queryParamsHandling: 'merge'
                          //   });
                          location.reload();
                        }
                      });
                    } else if (this.status == 'False' && success['data']) {
                      this.showSpinner = false;
                      Swal.fire({
                        title: `RSV already fixed by ${success['data'][0].name}`,
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
          }
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    }
    // }
  }

  // RSV FIXING
  rsvfixing() {
    var nextdate = $('#rsvnextactiondate').val();
    var nexttime = $('#rsvnextactiontime').val();
    var textarearemarks = $('#rsvtextarearemarks').val();
    var dateformatchange = new Date(nextdate).toDateString();
    var priority = $('#priorityhiddeninput').val();
    if (this.getselectedLeadExec.suggestedprop.length > 1) {
      this.suggestchecked = this.propid;
    } else {
      this.suggestchecked = this.getselectedLeadExec.suggestedprop[0].propid;
    }

    if (localStorage.getItem('Name') == 'demo') {
      Swal.fire({
        title: 'Fixing RSV is restricted for demo accounts',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      }).then(() => {
        this.showSpinner = false;
      });
    } else {
      // USV DONE with RSV Fixing
      if ($('#sectionselector').val() == 'USV') {
        {
          let visitupdateremarks = $('#propertyremarks').val().trim();
          $('#propertyremarks').removeAttr('style');
          $('#visitupdate').removeAttr('style');
          var visitedparam = {
            leadid: this.id,
            propid: this.suggestchecked,
            execid: this.userid,
            visitupdate: 1,
            remarks: $('#propertyremarks').val(),
            stage: 'USV',
            assignid: this.rsvExecutiveId,
            feedbackid: this.feedbackId,
          };
          var usvdate = $('#USVvisiteddate').val();
          var usvtime = $('#USVvisitedtime').val();

          // var usvfinalremarks = "USV Done";
          var usvfinalremarks = $('#propertyremarks').val();
          var param = {
            leadid: this.id,
            nextdate: nextdate,
            nexttime: nexttime,
            suggestproperties: this.suggestchecked,
            execid: this.userid,
            assignid: this.rsvExecutiveId,
            feedbackid: this.feedbackId,
          };

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
            visitupdateremarks == '' ||
            visitupdateremarks == undefined
          ) {
            Swal.fire({
              title: 'Please add some remarks about the Sitevisit',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            }).then(() => {});
            $('#USVvisitedtime').removeClass('border_colorRed');
          } else {
            this.showSpinner = true;

            this.autoremarks =
              ' Scheduled the RSV for ' +
              this.selectedproperty_commaseperated +
              ' On ' +
              dateformatchange +
              ' ' +
              nexttime;
            var leadrsvfixparam = {
              leadid: this.id,
              closedate: nextdate,
              closetime: nexttime,
              leadstage: 'RSV',
              stagestatus: '1',
              textarearemarks: textarearemarks,
              userid: this.userid,
              assignid: this.rsvExecutiveId,
              autoremarks: this.autoremarks,
              property: this.suggestchecked,
              feedbackid: this.feedbackId,
            };
            this.mandateService
              .addleadhistory(leadrsvfixparam)
              .subscribe((success) => {
                this.status = success['status'];
                if (this.status == 'True') {
                  this.mandateService
                    .addpropertyvisitupdate(visitedparam)
                    .subscribe(
                      (success) => {
                        this.status = success['status'];
                        if (this.status == 'True') {
                          this.mandateService.addrsvselected(param).subscribe(
                            (success) => {
                              this.status = success['status'];
                              if (this.status == 'True') {
                                var param = {
                                  leadid: this.id,
                                  execid: this.userid,
                                  stage: 'RSV',
                                  assignid: this.rsvExecutiveId,
                                  feedbackid: this.feedbackId,
                                };
                                this.mandateService
                                  .rsvselectproperties(param)
                                  .subscribe((selectsuggested) => {
                                    this.selectedpropertylists =
                                      selectsuggested['selectedrsvlists'];
                                    // Joining the object values as comma seperated when remove the property for the history storing
                                    this.selectedproperty_commaseperated =
                                      this.selectedpropertylists
                                        .map((item) => {
                                          return item.name;
                                        })
                                        .join(',');
                                    // Joining the object values as comma seperated when remove the property for the history storing
                                    this.autoremarks =
                                      ' Changed the status to RSV after Successfully completed USV';
                                    var leadusvdoneparam = {
                                      leadid: this.id,
                                      closedate: nextdate,
                                      closetime: nexttime,
                                      leadstage: 'USV',
                                      stagestatus: '3',
                                      textarearemarks: usvfinalremarks,
                                      userid: this.userid,
                                      assignid: this.rsvExecutiveId,
                                      autoremarks: this.autoremarks,
                                      property: this.suggestchecked,
                                      feedbackid: this.feedbackId,
                                    };
                                    this.mandateService
                                      .addleadhistory(leadusvdoneparam)
                                      .subscribe(
                                        (success) => {
                                          this.status = success['status'];
                                          if (this.status == 'True') {
                                            this.autoremarks =
                                              ' Scheduled the RSV for ' +
                                              this
                                                .selectedproperty_commaseperated +
                                              ' On ' +
                                              dateformatchange +
                                              ' ' +
                                              nexttime;
                                            var leadrsvfixparam = {
                                              leadid: this.id,
                                              closedate: nextdate,
                                              closetime: nexttime,
                                              leadstage: 'RSV',
                                              stagestatus: '1',
                                              textarearemarks: textarearemarks,
                                              userid: this.userid,
                                              assignid: this.rsvExecutiveId,
                                              autoremarks: this.autoremarks,
                                              property: this.suggestchecked,
                                              feedbackid: this.feedbackId,
                                            };
                                            this.mandateService
                                              .addleadhistory(leadrsvfixparam)
                                              .subscribe(
                                                (success) => {
                                                  this.status =
                                                    success['status'];
                                                  this.showSpinner = false;
                                                  if (this.status == 'True') {
                                                    $('#nextactiondate').val(
                                                      ''
                                                    );
                                                    $('#nextactiontime').val(
                                                      ''
                                                    );
                                                    $('#customer_phase4').val(
                                                      ''
                                                    );
                                                    $(
                                                      '#rsvtextarearemarks'
                                                    ).val('');
                                                    Swal.fire({
                                                      title:
                                                        'RSV Fixed Successfully',
                                                      icon: 'success',
                                                      heightAuto: false,
                                                      allowOutsideClick: false,
                                                      confirmButtonText: 'OK!',
                                                    }).then((result) => {
                                                      if (result.value) {
                                                        location.reload();
                                                        //  location.reload()
                                                        //         const currentParams = this.activeroute.snapshot.queryParams;
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
                                                  console.log(
                                                    'Failed to Update'
                                                  );
                                                }
                                              );
                                          }
                                        },
                                        (err) => {
                                          console.log('Failed to Update');
                                        }
                                      );
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
                } else if (this.status == 'False' && success['data']) {
                  this.showSpinner = false;
                  Swal.fire({
                    title: `RSV already fixed by ${success['data'][0].name}`,
                    text: `Please Contact Admin to assign this visit`,
                    icon: 'error',
                    heightAuto: false,
                    showConfirmButton: true,
                  }).then(() => {
                    location.reload();
                  });
                }
              });
          }
        }
      }
      // USV DONE with RSV Fixing
      // DIRECT RSV Fixing - Wrong Condition - Need to Check Later
      else if ($('#sectionselector').val() == 'RSV') {
        var nextactiondate = $('#rsvnextactiondate').val();
        var nextactiontime = $('#rsvnextactiontime').val();
        if (this.getselectedLeadExec.suggestedprop.length > 1) {
          this.suggestchecked = this.propid;
        } else {
          this.suggestchecked =
            this.getselectedLeadExec.suggestedprop[0].propid;
        }

        var param = {
          leadid: this.id,
          nextdate: nextactiondate,
          nexttime: nextactiontime,
          suggestproperties: this.suggestchecked,
          execid: this.userid,
          assignid: this.rsvExecutiveId,
          feedbackid: this.feedbackId,
        };

        //  if($('#priorityhiddeninput').val() == ""){
        //     Swal.fire({
        //       title: 'Priority Level Required',
        //       text: 'Please select priority level',
        //       icon: 'error',
        //       heightAuto: false,
        //       confirmButtonText: 'OK'
        //     })
        //   }else{

        this.showSpinner = true;
        this.mandateService.addrsvselected(param).subscribe(
          (success) => {
            this.status = success['status'];
            if (this.status == 'True') {
              var param = {
                leadid: this.id,
                execid: this.userid,
                stage: 'RSV',
                assignid: this.rsvExecutiveId,
                feedbackid: this.feedbackId,
              };

              this.mandateService
                .rsvselectproperties(param)
                .subscribe((selectsuggested) => {
                  this.selectedpropertylists =
                    selectsuggested['selectedrsvlists'];
                  // Joining the object values as comma seperated when remove the property for the history storing
                  this.selectedproperty_commaseperated =
                    this.selectedpropertylists
                      ?.map((item) => {
                        return item.name;
                      })
                      .join(',');
                  // Joining the object values as comma seperated when remove the property for the history storing
                  this.autoremarks =
                    ' Scheduled the RSV for ' +
                    this.selectedproperty_commaseperated +
                    ' On ' +
                    dateformatchange +
                    ' ' +
                    nexttime;
                  var leadrsvfixparam = {
                    leadid: this.id,
                    closedate: nextdate,
                    closetime: nexttime,
                    leadstage: 'RSV',
                    stagestatus: '1',
                    textarearemarks: textarearemarks,
                    userid: this.userid,
                    assignid: this.rsvExecutiveId,
                    autoremarks: this.autoremarks,
                    property: this.suggestchecked,
                    feedbackid: this.feedbackId,
                  };
                  this.mandateService.addleadhistory(leadrsvfixparam).subscribe(
                    (success) => {
                      this.status = success['status'];
                      this.showSpinner = true;
                      if (this.status == 'True') {
                        $('#nextactiondate').val('');
                        $('#nextactiontime').val('');
                        $('#customer_phase4').val('');
                        $('#rsvtextarearemarks').val('');
                        Swal.fire({
                          title: 'RSV Fixed Successfully',
                          icon: 'success',
                          heightAuto: false,
                          allowOutsideClick: false,
                          confirmButtonText: 'OK!',
                        }).then((result) => {
                          if (result.value) {
                            location.reload();
                            //     const currentParams = this.activeroute.snapshot.queryParams;
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
                      } else if (this.status == 'False' && success['data']) {
                        this.showSpinner = false;
                        Swal.fire({
                          title: `RSV already fixed by ${success['data'][0].name}`,
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
            }
          },
          (err) => {
            console.log('Failed to Update');
          }
        );

        // }
      }
      // DIRECT RSV Fixing - Wrong Condition - Need to Check Later
      // NEGOTIATION DONE with RSV Fixing
      else if ($('#sectionselector').val() == 'Final Negotiation') {
        let visitupdateremarks = $('#propertyremarks').val().trim();
        if (this.suggestchecked == '') {
          Swal.fire({
            title: 'Property Not Selected',
            text: 'Please select atleast one property for the RSV',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if (
          visitupdateremarks == '' ||
          visitupdateremarks == undefined
        ) {
          Swal.fire({
            title: 'Please add some remarks about the Sitevisit',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          }).then(() => {});
        } else {
          $('#visitupdate').removeAttr('style');
          $('#propertyremarks').removeAttr('style');
          var negovisitparam = {
            leadid: this.id,
            propid: this.suggestchecked,
            execid: this.userid,
            visitupdate: 1,
            remarks: $('#propertyremarks').val(),
            stage: 'Final Negotiation',
            assignid: this.rsvExecutiveId,
          };
          var visiteddate = $('#negovisiteddate').val();
          var visitedtime = $('#negovisitedtime').val();
          var negofinalremarks = 'Final Negotiation Finished';

          var nextactiondate = $('#rsvnextactiondate').val();
          var nextactiontime = $('#rsvnextactiontime').val();

          var param = {
            leadid: this.id,
            nextdate: nextactiondate,
            nexttime: nextactiontime,
            suggestproperties: this.suggestchecked,
            execid: this.userid,
            assignid: this.rsvExecutiveId,
            feedbackid: this.feedbackId,
          };
          this.showSpinner = true;

          this.autoremarks =
            ' Scheduled the RSV for ' +
            this.selectedproperty_commaseperated +
            ' On ' +
            dateformatchange +
            ' ' +
            nexttime;
          let leadrsvfixparam = {
            leadid: this.id,
            closedate: nextdate,
            closetime: nexttime,
            leadstage: 'RSV',
            stagestatus: '1',
            textarearemarks: textarearemarks,
            userid: this.userid,
            assignid: this.rsvExecutiveId,
            autoremarks: this.autoremarks,
            property: this.suggestchecked,
            feedbackid: this.feedbackId,
          };

          this.mandateService
            .addleadhistory(leadrsvfixparam)
            .subscribe((success) => {
              this.status = success['status'];
              if (this.status == 'True') {
                this.mandateService
                  .addpropertyvisitupdate(negovisitparam)
                  .subscribe(
                    (success) => {
                      this.mandateService.addrsvselected(param).subscribe(
                        (success) => {
                          this.status = success['status'];
                          if (this.status == 'True') {
                            var param = {
                              leadid: this.id,
                              execid: this.userid,
                              stage: 'RSV',
                              assignid: this.rsvExecutiveId,
                              feedbackid: this.feedbackId,
                            };

                            this.mandateService
                              .rsvselectproperties(param)
                              .subscribe((selectsuggested) => {
                                this.selectedpropertylists =
                                  selectsuggested['selectedrsvlists'];
                                // Joining the object values as comma seperated when remove the property for the history storing
                                this.selectedproperty_commaseperated =
                                  this.selectedpropertylists
                                    .map((item) => {
                                      return item.name;
                                    })
                                    .join(',');
                                // Joining the object values as comma seperated when remove the property for the history storing

                                this.autoremarks =
                                  ' Scheduled the RSV after Successfully completed Final negotiation';
                                var leadnegodoneparam = {
                                  leadid: this.id,
                                  closedate: visiteddate,
                                  closetime: visitedtime,
                                  leadstage: 'Final Negotiation',
                                  stagestatus: '3',
                                  textarearemarks: negofinalremarks,
                                  userid: this.userid,
                                  assignid: this.rsvExecutiveId,
                                  autoremarks: this.autoremarks,
                                  property: this.suggestchecked,
                                  feedbackid: this.feedbackId,
                                };

                                console.log(leadnegodoneparam);

                                this.mandateService
                                  .addleadhistory(leadnegodoneparam)
                                  .subscribe(
                                    (success) => {
                                      this.status = success['status'];
                                      if (this.status == 'True') {
                                        this.autoremarks =
                                          ' Scheduled the RSV for ' +
                                          this.selectedproperty_commaseperated +
                                          ' On ' +
                                          dateformatchange +
                                          ' ' +
                                          nexttime;
                                        var leadrsvfixparam = {
                                          leadid: this.id,
                                          closedate: nextdate,
                                          closetime: nexttime,
                                          leadstage: 'RSV',
                                          stagestatus: '1',
                                          textarearemarks: textarearemarks,
                                          userid: this.userid,
                                          assignid: this.rsvExecutiveId,
                                          autoremarks: this.autoremarks,
                                          property: this.suggestchecked,
                                          feedbackid: this.feedbackId,
                                        };
                                        this.mandateService
                                          .addleadhistory(leadrsvfixparam)
                                          .subscribe(
                                            (success) => {
                                              this.status = success['status'];
                                              this.showSpinner = false;
                                              if (this.status == 'True') {
                                                $('#nextactiondate').val('');
                                                $('#nextactiontime').val('');
                                                $('#customer_phase4').val('');
                                                $('#rsvtextarearemarks').val(
                                                  ''
                                                );
                                                Swal.fire({
                                                  title:
                                                    'RSV Fixed Successfully',
                                                  icon: 'success',
                                                  heightAuto: false,
                                                  allowOutsideClick: false,
                                                  confirmButtonText: 'OK!',
                                                }).then((result) => {
                                                  if (result.value) {
                                                    location.reload();
                                                    //            const currentParams = this.activeroute.snapshot.queryParams;
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
                              });
                          }
                        },
                        (err) => {
                          console.log('Failed to Update');
                        }
                      );
                    },
                    (err) => {
                      console.log('Failed to Update');
                    }
                  );
              } else if (this.status == 'False' && success['data']) {
                this.showSpinner = false;
                Swal.fire({
                  title: `RSV already fixed by ${success['data'][0].name}`,
                  text: `Please Contact Admin to assign this visit`,
                  icon: 'error',
                  heightAuto: false,
                  showConfirmButton: true,
                }).then(() => {
                  location.reload();
                });
              }
            });
        }
      } else {
        const nextactiondate = $('#rsvnextactiondate').val();
        const nextactiontime = $('#rsvnextactiontime').val();

        var param3 = {
          leadid: this.id,
          nextdate: nextactiondate,
          nexttime: nextactiontime,
          suggestproperties: this.suggestchecked,
          execid: this.userid,
          assignid: this.rsvExecutiveId,
          feedbackid: this.feedbackId,
        };

        // if($('#priorityhiddeninput').val() == ""){
        //   Swal.fire({
        //     title: 'Priority Level Required',
        //     text: 'Please select priority level',
        //     icon: 'error',
        //     heightAuto: false,
        //     confirmButtonText: 'OK'
        //   })
        // }else{
        this.showSpinner = true;
        this.mandateService.addrsvselected(param3).subscribe(
          (success) => {
            this.status = success['status'];
            if (this.status == 'True') {
              var param = {
                leadid: this.id,
                execid: this.userid,
                stage: 'RSV',
                assignid: this.rsvExecutiveId,
                feedbackid: this.feedbackId,
              };

              this.mandateService
                .rsvselectproperties(param)
                .subscribe((selectsuggested) => {
                  this.selectedpropertylists =
                    selectsuggested['selectedrsvlists'];
                  // Joining the object values as comma seperated when remove the property for the history storing
                  this.selectedproperty_commaseperated =
                    this.selectedpropertylists
                      .map((item) => {
                        return item.name;
                      })
                      .join(',');
                  // Joining the object values as comma seperated when remove the property for the history storing

                  this.autoremarks =
                    ' Scheduled the RSV for ' +
                    this.selectedproperty_commaseperated +
                    ' On ' +
                    dateformatchange +
                    ' ' +
                    nexttime;
                  var leadrsvfixparam = {
                    leadid: this.id,
                    closedate: nextdate,
                    closetime: nexttime,
                    leadstage: 'RSV',
                    stagestatus: '1',
                    textarearemarks: textarearemarks,
                    userid: this.userid,
                    assignid: this.rsvExecutiveId,
                    autoremarks: this.autoremarks,
                    property: this.suggestchecked,
                    feedbackid: this.feedbackId,
                  };

                  this.mandateService.addleadhistory(leadrsvfixparam).subscribe(
                    (success) => {
                      this.status = success['status'];
                      this.showSpinner = false;
                      if (this.status == 'True') {
                        $('#nextactiondate').val('');
                        $('#nextactiontime').val('');
                        $('#customer_phase4').val('');
                        $('#rsvtextarearemarks').val('');
                        Swal.fire({
                          title: 'RSV Fixed Successfully',
                          icon: 'success',
                          heightAuto: false,
                          allowOutsideClick: false,
                          confirmButtonText: 'OK!',
                        }).then((result) => {
                          if (result.value) {
                            location.reload();
                            //    const currentParams = this.activeroute.snapshot.queryParams;
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
                      } else if (this.status == 'False' && success['data']) {
                        this.showSpinner = false;
                        Swal.fire({
                          title: `RSV already fixed by ${success['data'][0].name}`,
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
            }
          },
          (err) => {
            console.log('Failed to Update');
          }
        );
        // }
      }
    }
  }

  //TO DISPLAY RSV FIXED FORM
  onrsvFixed() {
    this.isRsvFixedForm = true;
    this.isRsvReFixForm = false;
    this.isRsvDone = false;
    this.isFollowupForm = false;
    this.isJunkForm = false;

    this.isFollowUpSubForm = false;
    this.isRsvFixSubForm = false;
    this.isLeadCloseSubForm = false;
    this.isFnSubForm = false;
    $('#sectionselector').val('RSV');
  }

  //TO DISPLAY RSV RE-FIXED FORM
  onrsvreFix() {
    this.isRsvFixedForm = false;
    this.isRsvReFixForm = true;
    this.isRsvDone = false;
    this.isFollowupForm = false;
    this.isJunkForm = false;

    this.isFollowUpSubForm = false;
    this.isRsvFixSubForm = false;
    this.isLeadCloseSubForm = false;
    this.isFnSubForm = false;
    $('#sectionselector').val('RSV');
  }

  //TO DISPLAY RSV DONE FORM
  onrsvDone() {
    this.isRsvFixedForm = false;
    this.isRsvReFixForm = false;
    this.isRsvDone = true;
    this.isFollowupForm = false;
    this.isJunkForm = false;
    this.isInterested = true;

    this.isFollowUpSubForm = false;
    this.isRsvFixSubForm = false;
    this.isLeadCloseSubForm = false;
    this.isFnSubForm = false;
    $('#sectionselector').val('RSV');
    // Loading this API again only for fetching the walkin date & time and write to the html view hidden visited date and time input boxes after the usvform in true condition
    this.mandateService
      .getassignedrm(
        this.id,
        this.userid,
        localStorage.getItem('Role'),
        this.feedbackId
      )
      .subscribe((cust) => {
        // Adding RSV Visit date time to RSV Submission Section
        $('#RSVvisiteddate').val(
          cust['RMname']?.[0]?.['suggestedprop']?.[0]?.followupdate
        );
        $('#RSVvisitedtime').val(
          cust['RMname']?.[0]?.['suggestedprop']?.[0]?.followuptime
        );
        // Adding RSV Visit date time to RSV Submission Section
      });
    // Loading this API again only for fetching the walkin date & time and write to the html view hidden visited date and time input boxes after the usvform in true condition
  }

  //TO DISPLAY RSV FOLLOW-UP FORM
  onfollowup() {
    this.isRsvFixedForm = false;
    this.isRsvReFixForm = false;
    this.isRsvDone = false;
    this.isFollowupForm = true;
    this.isJunkForm = false;

    this.isFollowUpSubForm = false;
    this.isRsvFixSubForm = false;
    this.isLeadCloseSubForm = false;
    this.isFnSubForm = false;
    $('#sectionselector').val('');
  }

  //TO DISPLAY RSV JUNK FORM
  onjunk() {
    this.isRsvFixedForm = false;
    this.isRsvReFixForm = false;
    this.isRsvDone = false;
    this.isFollowupForm = false;
    this.isJunkForm = true;

    this.isFollowUpSubForm = false;
    this.isRsvFixSubForm = false;
    this.isLeadCloseSubForm = false;
    this.isFnSubForm = false;
  }
  showSiteVisitDate;
  //TO DISPLAY INTERESTED SECTION
  visitclick() {
    this.textarearemarks && !this.isInterested
      ? (this.textarearemarks = '')
      : '';

    this.isInterested = true;
    this.isNotInterested = false;
    $('#visitupdate').val('1');
    $('.nextactionmaindiv').removeAttr('style');
    $('.visitupdatebtn').attr('style', 'display:none;');
    if (this.getselectedLeadExec.walkintime != null) {
      this.showSiteVisitDate = true;
    } else {
      this.showSiteVisitDate = false;
    }
  }

  //TO DISPLAY NOT INTERESTED SECTION
  cancelclick() {
    this.textarearemarks && !this.isNotInterested
      ? (this.textarearemarks = '')
      : '';
    this.isInterested = false;
    this.isNotInterested = true;

    $('#visitupdate').val('3');
    $('.visitupdatebtn').removeAttr('style');
    $('.nextactionmaindiv').attr('style', 'display:none;');
    this.isFollowUpSubForm = false;
    this.isRsvFixSubForm = false;
    this.isLeadCloseSubForm = false;
    this.isFnSubForm = false;
  }

  // TO DISPLAY TIME IN THE FORMAT OF 01:34 PM
  onTimeChange(event: CustomEvent) {
    const parsedTime = new Date(event.detail.value);
    const hours = parsedTime.getHours() % 12 || 12; // Get hours in 12-hour format
    const minutes = parsedTime.getMinutes().toString().padStart(2, '0'); // Ensure two digits for minutes
    const ampm = parsedTime.getHours() >= 12 ? 'PM' : 'AM'; // Determine AM/PM
    this.rsvTime = `${hours}:${minutes} ${ampm}`;
  }

  // to display date in the format of YYYY-MM-DD
  onDateChange(event: CustomEvent) {
    const selectedDate = new Date(event.detail.value);
    this.rsvDate = selectedDate.toLocaleDateString('en-CA');
  }

  updatepropertyvisit(propertyid, propertyname) {
    if ($('#visitupdate').val() == '1') {
      this.visitupdate = 'Visited';
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
      var param = {
        leadid: this.id,
        propid: propertyid,
        execid: this.userid,
        visitupdate: $('#visitupdate').val(),
        remarks: $('#propertyremarks').val(),
        stage: 'RSV',
        assignid: this.rsvExecutiveId,
        feedbackid: this.feedbackId,
      };
      this.showSpinner = true;
      this.autoremarks =
        ' Marked the ' +
        propertyname +
        ' as ' +
        this.visitupdate +
        '. Here is the property remarks - ' +
        this.propertyremarks;
      this.mandateService.addpropertyvisitupdate(param).subscribe(
        (success) => {
          this.status = success['status'];
          if (this.status == 'True') {
            var userid = localStorage.getItem('UserId');
            this.autoremarks =
              ' Moved the lead to Junk, Because of' + 'Not Interested';
            var leadjunkparam = {
              leadid: this.id,
              closedate: '',
              closetime: '',
              leadstage: 'Move to Junk',
              stagestatus: '46',
              textarearemarks: 'Not Interested',
              userid: userid,
              assignid: this.rsvExecutiveId,
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

            Swal.fire({
              title: 'Data Updated Successfully',
              icon: 'success',
              heightAuto: false,
              confirmButtonText: 'OK!',
            }).then((result) => {
              if (result.value) {
                // this.router.navigate(['/mandate-assigned-leads'],{
                //   queryParams:{
                //     status:'junk'
                //   }
                // })
                //  const currentParams = this.activeroute.snapshot.queryParams;
                //           this.router.navigate([], {
                //           relativeTo: this.activeroute,
                //           queryParams: {
                //             ...currentParams,
                //             stageForm: 'onleadStatus'
                //           },
                //           queryParamsHandling: 'merge'
                //           });

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
  }

  @ViewChild('popover') popover: IonPopover;
  @ViewChild('popover1') popover1: IonPopover;
  closePopover() {
    if (this.popover || this.popover1) {
      this.popover.dismiss();
    }
  }

  // to test whether the text earea input contain only space
  hasOnlySpaces;
  checkAlphanumericSpaces() {
    // this.hasOnlySpaces = !/^(?!\s*$).+$/.test(this.textarearemarks);
    this.hasOnlySpaces = !/^(?![\s\n\r]*$)[\s\S]+$/.test(this.textarearemarks);
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
    if (this.rsvTime) {
      const [time, modifier] = this.rsvTime.split(' ');
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
      this.rsvTime = '';
      $('#refixtime').val('');
      $('#subrsvnextactiontime').val('');
      $('#rsvnextactiontime').val('');
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
    console.log(this.selectedExec);

    let param = {
      leadid: this.id,
      propid: this.propid,
      loginid: localStorage.getItem('UserId'),
      fromExecid: localStorage.getItem('UserId'),
      toExecid: this.selectedExec.id,
      crmType: '1',
    };

    this.mandateService.assignfixedvisitlead(param).subscribe((resp) => {
      console.log(resp);
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

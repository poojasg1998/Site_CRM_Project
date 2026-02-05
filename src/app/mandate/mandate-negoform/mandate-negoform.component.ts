import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { IonPopover, LoadingController } from '@ionic/angular';
import { MandateService } from 'src/app/mandate-service.service';
declare var $: any;

@Component({
  selector: 'app-mandate-negoform',
  templateUrl: './mandate-negoform.component.html',
  styleUrls: ['./mandate-negoform.component.scss'],
})
export class MandateNegoformComponent implements OnInit {
  @Input() selectedExecId: any;
  @Input() selectedSuggestedProp: any;
  @Input() onCallLeadDetails: any;

  feedbackId = '';

  showSpinner = true;

  hideafterfixed = true;
  hidebeforefixed = false;
  commonhide = true;

  //to disable past date
  minDate = new Date().toISOString();
  propertyremarks: any;

  // to display stages initialy
  isNegoFixed: boolean = true;
  isNegoReFix: boolean = false;
  isNegoDone: boolean = false;
  isFollowform: boolean = false;
  isJunk: boolean = false;

  //to display subform for negotiation done
  isFollowUpSubForm: boolean = false;
  isRsvSubForm: boolean = false;
  isFnSubForm: boolean = false;
  isLeadCloseSubForm: boolean = false;

  negoDate: any; //to store date
  negoTime: any; //to store time
  isInterested = false;
  isNotInterested = false;
  buttonhiders: boolean = true;

  userid: string;
  username: string;
  executeid: any;
  leadid: any;
  csid: any;
  activestagestatus: any;
  selectedpropertylists: any;
  selectedlists: Object;
  visitstatusupdate: boolean;
  negotiatedproperty: any;
  visitedpropertylists: any;
  suggestchecked: any;
  cancelledpropertylists: any;
  textarearemarks: any;
  status: any;
  selectedproperty_commaseperated: any;
  autoremarks: string;
  visitupdate: string;
  negoExecutiveId: any;
  getselectedLeadExec: any;
  propertybasedFilter: any;
  maxDate: any;

  constructor(
    private mandateService: MandateService,
    private activeroute: ActivatedRoute,
    public loadingController: LoadingController,
    private router: Router
  ) {}

  ngOnInit() {
    $('#visitupdate').val('4');
    this.activeroute.queryParamMap.subscribe((params) => {
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1); // add 1 month

      this.maxDate = nextMonth.toISOString().split('T')[0]; // format YYYY-MM-DD for ion-datetime
      this.minDate = today.toISOString().split('T')[0];

      const paramMap = params.get('leadId');
      this.leadid = params.get('leadId')
        ? params.get('leadId')
        : this.onCallLeadDetails.LeadID;
      this.feedbackId = params.get('feedback') ? params.get('feedback') : '';
      const isEmpty = !paramMap;

      this.userid = localStorage.getItem('UserId');
      this.username = localStorage.getItem('Name');

      // if (!isEmpty) {
      this.mandateService
        .getassignedrm(
          this.leadid,
          this.userid,
          this.selectedExecId,
          this.feedbackId
        )
        .subscribe((cust) => {
          this.executeid = cust['RMname'][0].executiveid;
          let filteredInfo;
          filteredInfo = cust['RMname'].filter(
            (da) => da.executiveid == this.selectedExecId
          );
          this.getselectedLeadExec = filteredInfo[0];
          if (this.userid == '1') {
            this.negoExecutiveId = this.selectedExecId;
          } else {
            this.negoExecutiveId = this.selectedExecId;
          }

          if (this.getselectedLeadExec) {
            this.propertybasedFilter = this.getselectedLeadExec.suggestedprop;
            this.propertybasedFilter = this.propertybasedFilter.filter(
              (da) => da.propid == this.selectedSuggestedProp.propid
            );
            $('#negovisiteddate').val(this.propertybasedFilter[0].followupdate);
            $('#negovisitedtime').val(this.propertybasedFilter[0].followuptime);
            this.negovisitedtime = this.propertybasedFilter[0].followuptime;
            this.negovisiteddate = this.propertybasedFilter[0].followupdate;
          } else {
            $('#negovisiteddate').val('');
            $('#negovisitedtime').val('');
            this.negovisitedtime = '';
            this.negovisiteddate = '';
          }
          this.loadimportantapi();
          this.getStages();
        });

      // }
    });

    this.mandateService.getassignedcs(this.leadid).subscribe((cust) => {
      this.csid = cust['CSname'][0].executiveid;
    });

    if (
      $('#sectionselector').val() == 'SV' ||
      $('#sectionselector').val() == 'USV' ||
      $('#sectionselector').val() == 'RSV'
    ) {
      this.buttonhiders = false;
    } else {
      this.buttonhiders = true;
    }
  }

  getStages() {
    this.mandateService
      .getactiveleadsstatus(
        this.leadid,
        this.userid,
        this.negoExecutiveId,
        this.selectedSuggestedProp.propid,
        this.feedbackId
      )
      .subscribe((stagestatus) => {
        this.showSpinner = false;
        this.activestagestatus = stagestatus['activeleadsstatus'];
        if (
          this.activestagestatus[0].stage == 'Final Negotiation' &&
          this.activestagestatus[0].stagestatus == '1'
        ) {
          this.hideafterfixed = false;
          this.isNegoFixed = false;
          this.hidebeforefixed = true;
          this.isNegoReFix = true;
          $('#sectionselector').val('Final Negotiation');
        } else if (
          this.activestagestatus[0].stage == 'Final Negotiation' &&
          this.activestagestatus[0].stagestatus == '2'
        ) {
          this.hideafterfixed = false;
          this.isNegoFixed = false;
          this.hidebeforefixed = true;
          this.isNegoReFix = true;
          $('#sectionselector').val('Final Negotiation');
        } else if (
          this.activestagestatus[0].stage == 'Final Negotiation' &&
          this.activestagestatus[0].stagestatus == '3' &&
          this.activestagestatus[0].visitstatus == '0'
        ) {
          this.hideafterfixed = false;
          this.hidebeforefixed = false;
          this.isNegoDone = false;
          this.isNegoFixed = false;
          this.isNegoDone = true;
          this.commonhide = false;
          $('#sectionselector').val('Final Negotiation');
        } else if (
          this.activestagestatus[0].stage == 'Final Negotiation' &&
          this.activestagestatus[0].stagestatus == '3' &&
          this.activestagestatus[0].visitstatus == '1'
        ) {
          this.hideafterfixed = true;
          this.hidebeforefixed = false;
          this.isNegoDone = false;
          this.isNegoFixed = true;
          $('#sectionselector').val('Final Negotiation');
        } else {
          this.hideafterfixed = true;
        }
      });
  }

  loadimportantapi() {
    var param = {
      leadid: this.leadid,
      userid: this.userid,
      stage: $('#customer_phase4').val(),
      executeid: this.negoExecutiveId,
      feedbackid: this.feedbackId,
    };

    this.mandateService
      .negoselectproperties(
        this.leadid,
        this.userid,
        this.negoExecutiveId,
        this.feedbackId
      )
      .subscribe((selectsuggested) => {
        if (selectsuggested['status'] == 'True') {
          this.selectedpropertylists = selectsuggested['selectednegolists'];
          this.selectedpropertylists = this.selectedpropertylists.filter(
            (da) => da.propid == this.selectedSuggestedProp.propid
          );
          this.selectedlists = selectsuggested['selectednegolists'];
        } else {
          this.selectedpropertylists = selectsuggested['selectednegolists'];
          this.selectedpropertylists = this.selectedpropertylists?.filter(
            (da) => da.propid == this.selectedSuggestedProp.propid
          );
          this.selectedlists = selectsuggested['selectednegolists'];
          this.visitstatusupdate = true;
        }
      });

    this.mandateService
      .getnegotiatedproperties(param)
      .subscribe((negotiated) => {
        this.negotiatedproperty = negotiated['negotiatedlists'];
      });

    this.mandateService
      .getvisitedsuggestproperties(param)
      .subscribe((visitsuggested) => {
        this.visitedpropertylists = visitsuggested['visitedlists'];
        this.suggestchecked = this.visitedpropertylists
          .map((item) => {
            return item.propid;
          })
          .join(',');
      });

    this.mandateService
      .getcancelledsuggestproperties(param)
      .subscribe((cancelsuggested) => {
        this.cancelledpropertylists = cancelsuggested['cancelledlists'];
      });
  }
  Refixtextarearemarks;
  showSiteVisitDate;
  //to display interested section
  visitclick() {
    this.textarearemarks && !this.isInterested
      ? (this.textarearemarks = '')
      : '';
    this.isInterested = true;
    this.isNotInterested = false;
    $('#visitupdate').val('4');
    $('.nextactionmaindiv').removeAttr('style');
    $('.visitupdatebtn').attr('style', 'display:none;');
    if (this.getselectedLeadExec.walkintime != null) {
      this.showSiteVisitDate = true;
    } else {
      this.showSiteVisitDate = false;
    }
  }

  //to display not interested section
  cancelclick() {
    this.textarearemarks && !this.isNotInterested
      ? (this.textarearemarks = '')
      : '';
    this.isInterested = false;
    this.isNotInterested = true;
    this.isFollowUpSubForm = false;
    this.isRsvSubForm = false;
    this.isFnSubForm = false;
    this.isLeadCloseSubForm = false;
    $('#visitupdate').val('2');
    $('.visitupdatebtn').removeAttr('style');
    $('.nextactionmaindiv').attr('style', 'display:none;');
  }

  // TO DISPLAY TIME IN THE FORMAT OF 01:34 PM
  onTimeChange(event: CustomEvent) {
    const parsedTime = new Date(event.detail.value);
    const hours = parsedTime.getHours() % 12 || 12; // Get hours in 12-hour format
    const minutes = parsedTime.getMinutes().toString().padStart(2, '0'); // Ensure two digits for minutes
    const ampm = parsedTime.getHours() >= 12 ? 'PM' : 'AM'; // Determine AM/PM
    this.negoTime = `${hours}:${minutes} ${ampm}`;
  }
  negovisiteddate;
  negovisitedtime;
  // to display date in the format of YYYY-MM-DD
  onDateChange(event: CustomEvent) {
    const selectedDate = new Date(event.detail.value);

    this.negovisiteddate = selectedDate.toLocaleDateString('en-CA');

    this.negoDate = selectedDate.toLocaleDateString('en-CA');
  }

  //To display stages initialy
  onnegoFixed() {
    this.isNegoFixed = true;
    this.isNegoReFix = false;
    this.isNegoDone = false;
    this.isFollowform = false;
    this.isJunk = false;
  }

  onnegoreFix() {
    this.isNegoFixed = false;
    this.isNegoReFix = true;
    this.isNegoDone = false;
    this.isFollowform = false;
    this.isJunk = false;
  }

  onnegoDone() {
    this.isNegoFixed = false;
    this.isNegoReFix = false;
    this.isNegoDone = true;
    this.isFollowform = false;
    this.isJunk = false;
    $('#sectionselector').val('Final Negotiation');
  }

  onfollowup() {
    this.isNegoFixed = false;
    this.isNegoReFix = false;
    this.isNegoDone = false;
    this.isFollowform = true;
    this.isJunk = false;
    $('#sectionselector').val('');
  }

  onjunk() {
    this.isNegoFixed = false;
    this.isNegoReFix = false;
    this.isNegoDone = false;
    this.isFollowform = false;
    this.isJunk = true;
  }

  //to display subForm for FN done
  followupdownbtn() {
    this.isFollowUpSubForm = true;
    this.isRsvSubForm = false;
    this.isFnSubForm = false;
    this.isLeadCloseSubForm = false;
  }

  onrsvFixed() {
    this.isFollowUpSubForm = false;
    this.isRsvSubForm = true;
    this.isFnSubForm = false;
    this.isLeadCloseSubForm = false;
  }

  onsubnegofixed() {
    this.isFollowUpSubForm = false;
    this.isRsvSubForm = false;
    this.isFnSubForm = true;
    this.isLeadCloseSubForm = false;
  }

  onleadclosed() {
    this.isFollowUpSubForm = false;
    this.isRsvSubForm = false;
    this.isFnSubForm = false;
    this.isLeadCloseSubForm = true;
  }

  // to display custom error message
  setCustomValidity(dateTime, event) {
    const input = event.target;
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const timePattern = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
    if (dateTime == 'date') {
      if (!datePattern.test(this.negoDate)) {
        input.setCustomValidity(
          'Please select a date in the format YYYY-MM-DD (e.g., 2021-05-26)'
        );
      } else {
        input.setCustomValidity('');
      }
    } else if (dateTime == 'time') {
      if (!timePattern.test(this.negoTime)) {
        input.setCustomValidity(
          'Please enter time in the formate of HH:mm a (ex: 15:30)'
        );
      } else {
        input.setCustomValidity('');
      }
    }
  }

  //Negotiation Done with fixing
  negodonewithfixing() {
    if ($('#negovisiteddate').val() == '') {
      $('#negovisiteddate')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Select One Date');
    } else {
      $('#negovisiteddate').removeAttr('style');
    }

    if ($('#negovisitedtime').val() == '') {
      $('#negovisitedtime')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Select One Date');
    } else {
      $('#negovisitedtime').removeAttr('style');
    }

    {
      $('#visitupdate').removeAttr('style');
      $('#propertyremarks').removeAttr('style');
      var visitedparam = {
        leadid: this.leadid,
        propid: this.suggestchecked,
        execid: this.userid,
        visitupdate: 1,
        remarks: 'Final Negotiation Done',
        stage: 'Final Negotiation',
        assignid: this.negoExecutiveId,
        feedbackid: this.feedbackId,
      };

      var nextactiondate = $('#subnegonextactionDate').val();
      var nextactiontime = $('#subnegonextactiontime').val();
      var priority = $('#priorityhiddeninput').val();

      var param = {
        leadid: this.leadid,
        nextdate: nextactiondate,
        nexttime: nextactiontime,
        suggestproperties: this.suggestchecked,
        execid: this.userid,
        assignedId: this.negoExecutiveId,
        feedbackid: this.feedbackId,
      };

      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'Fixing FN is restricted for demo accounts',
          icon: 'error',
          heightAuto: false,
          confirmButtonText: 'ok',
        }).then(() => {
          this.showSpinner = false;
        });
      } else {
        let visitremarks = $('#propertyremarks').val().trim();
        if (visitremarks == '' || visitremarks == undefined) {
          $('#propertyremarks')
            .focus()
            .addClass('border_colorRed')
            .attr('placeholder', 'Please add some remarks about the Sitevisit');
        } else {
          $('#propertyremarks').removeClass('border_colorRed');

          this.autoremarks =
            'Again Scheduled the Final Negotiation for ' +
            this.selectedproperty_commaseperated +
            ' On ' +
            new Date($('#subnegonextactiondate').val()).toDateString() +
            ' ' +
            $('#subnegonextactiontime').val();
          var leadnegofixparam = {
            leadid: this.leadid,
            closedate: nextactiondate,
            closetime: nextactiontime,
            leadstage: 'Final Negotiation',
            stagestatus: '1',
            textarearemarks: $('#subnegotextarearemarks').val(),
            userid: this.userid,
            assignid: this.negoExecutiveId,
            autoremarks: this.autoremarks,
            property: this.suggestchecked,
            feedbackid: this.feedbackId,
          };
          this.mandateService
            .addleadhistory(leadnegofixparam)
            .subscribe((success) => {
              this.status = success['status'];
              if (this.status == 'True') {
                this.mandateService
                  .addpropertyvisitupdate(visitedparam)
                  .subscribe(
                    (success) => {
                      this.status = success['status'];
                      if (this.status == 'True') {
                        this.mandateService.addnegoselected(param).subscribe(
                          (success) => {
                            this.status = success['status'];
                            this.mandateService
                              .negoselectproperties(
                                this.leadid,
                                this.userid,
                                this.negoExecutiveId,
                                this.feedbackId
                              )
                              .subscribe((selectsuggested) => {
                                this.selectedpropertylists =
                                  selectsuggested['selectednegolists'];
                                this.selectedlists = selectsuggested;
                                // Joining the object values as comma seperated when add the property for the history storing
                                this.selectedproperty_commaseperated =
                                  this.selectedpropertylists
                                    .map((item) => {
                                      return item.name;
                                    })
                                    .join(',');
                                // Joining the object values as comma seperated when add the property for the history storing
                                var visiteddate = $('#negovisiteddate').val();
                                var visitedtime = $('#negovisitedtime').val();
                                var negofinalremarks =
                                  'Final Negotiation Finished';
                                this.autoremarks =
                                  ' Changed the status again to Final Negotiation after Successfully completed one negotiation Meeting';
                                var leadnegodoneparam = {
                                  leadid: this.leadid,
                                  closedate: visiteddate,
                                  closetime: visitedtime,
                                  leadstage: 'Final Negotiation',
                                  stagestatus: '3',
                                  textarearemarks: negofinalremarks,
                                  userid: this.userid,
                                  assignid: this.negoExecutiveId,
                                  autoremarks: this.autoremarks,
                                  property: this.suggestchecked,
                                  feedbackid: this.feedbackId,
                                };
                                this.mandateService
                                  .addleadhistory(leadnegodoneparam)
                                  .subscribe(
                                    (success) => {
                                      this.status = success['status'];
                                      if (this.status == 'True') {
                                        var nextdate = $(
                                          '#subnegonextactionDate'
                                        ).val();
                                        var nexttime = $(
                                          '#subnegonextactiontime'
                                        ).val();
                                        var textarearemarks = $(
                                          '#subnegotextarearemarks'
                                        ).val();
                                        var dateformatchange = new Date(
                                          nextdate
                                        ).toDateString();
                                        this.autoremarks =
                                          'Again Scheduled the Final Negotiation for ' +
                                          this.selectedproperty_commaseperated +
                                          ' On ' +
                                          dateformatchange +
                                          ' ' +
                                          nexttime;
                                        var leadnegofixparam = {
                                          leadid: this.leadid,
                                          closedate: nextdate,
                                          closetime: nexttime,
                                          leadstage: 'Final Negotiation',
                                          stagestatus: '1',
                                          textarearemarks: textarearemarks,
                                          userid: this.userid,
                                          assignid: this.negoExecutiveId,
                                          autoremarks: this.autoremarks,
                                          property: this.suggestchecked,
                                          feedbackid: this.feedbackId,
                                        };
                                        this.mandateService
                                          .addleadhistory(leadnegofixparam)
                                          .subscribe(
                                            (success) => {
                                              this.status = success['status'];
                                              if (this.status == 'True') {
                                                Swal.fire({
                                                  title:
                                                    'Negotiation Fixed Successfully',
                                                  icon: 'success',
                                                  heightAuto: false,
                                                  allowOutsideClick: false,
                                                  confirmButtonText: 'OK!',
                                                }).then((result) => {
                                                  if (result.value) {
                                                    //            const currentParams = this.activeroute.snapshot.queryParams;
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
                  title: `Final Negotiation already fixed by ${success['data'][0].name}`,
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

    var param = {
      leadid: this.leadid,
      nextdate: nextactiondate,
      nexttime: nextactiontime,
      suggestproperties: this.suggestchecked,
      execid: this.userid,
      assignedId: this.negoExecutiveId,
      feedbackid: this.feedbackId,
    };

    this.mandateService.addnegoselected(param).subscribe(
      (success) => {
        this.status = success['status'];
      },
      (err) => {
        console.log('Failed to Update');
      }
    );
  }
  subnegotextarearemarks;
  // to fix negotiaton with direct, USV and RSV done
  negofixing() {
    var nextdate = $('#negonextactiondate').val();
    var nexttime = $('#negonextactiontime').val();
    var textarearemarks = $('#negotextarearemarks').val();
    var assignid = this.executeid;
    var dateformatchange = new Date(nextdate).toDateString();
    var priority = $('#priorityhiddeninput').val();
    if (this.getselectedLeadExec.suggestedprop.length > 1) {
      this.suggestchecked = this.selectedSuggestedProp.propid;
    } else {
      this.suggestchecked = this.getselectedLeadExec.suggestedprop[0].propid;
    }

    if (localStorage.getItem('Name') == 'demo') {
      Swal.fire({
        title: 'Fixing FN is restricted for demo accounts',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      }).then(() => {
        this.showSpinner = false;
      });
    } else {
      // USV DONE with NEGOTIATION Fixing
      if ($('#sectionselector').val() == 'USV') {
        {
          $('#propertyremarks').removeAttr('style');
          $('#visitupdate').removeAttr('style');

          var visitedparam = {
            leadid: this.leadid,
            propid: this.suggestchecked,
            execid: this.userid,
            visitupdate: 1,
            remarks: $('#propertyremarks').val(),
            stage: 'USV',
            assignid: this.negoExecutiveId,
            feedbackid: this.feedbackId,
          };

          var visiteddate = $('#USVvisiteddate').val();
          var visitedtime = $('#USVvisitedtime').val();
          var nextactiondate = $('#negonextactiondate').val();
          var nextactiontime = $('#negonextactiontime').val();
          var usvfinalremarks = 'USV Done';

          var param = {
            leadid: this.leadid,
            nextdate: nextactiondate,
            nexttime: nextactiontime,
            suggestproperties: this.suggestchecked,
            execid: this.userid,
            assignedId: this.negoExecutiveId,
            feedbackid: this.feedbackId,
          };

          let visitupdateremarks = $('#propertyremarks').val().trim();
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
          } else {
            this.showSpinner = true;

            var leadnegofixparam = {
              leadid: this.leadid,
              closedate: nextdate,
              closetime: nexttime,
              leadstage: 'Final Negotiation',
              stagestatus: '1',
              textarearemarks: textarearemarks,
              userid: this.userid,
              assignid: this.negoExecutiveId,
              autoremarks:
                'Scheduled the Final Negotiation for ' +
                this.selectedproperty_commaseperated +
                ' On ' +
                dateformatchange +
                ' ' +
                nexttime,
              property: this.suggestchecked,
              feedbackid: this.feedbackId,
            };

            this.mandateService
              .addleadhistory(leadnegofixparam)
              .subscribe((success) => {
                this.status = success['status'];
                if (this.status == 'True') {
                  this.mandateService
                    .addpropertyvisitupdate(visitedparam)
                    .subscribe(
                      (success) => {
                        this.status = success['status'];
                        if (this.status == 'True') {
                          this.mandateService.addnegoselected(param).subscribe(
                            (success) => {
                              this.status = success['status'];
                              this.mandateService
                                .negoselectproperties(
                                  this.leadid,
                                  this.userid,
                                  this.negoExecutiveId,
                                  this.feedbackId
                                )
                                .subscribe((selectsuggested) => {
                                  this.selectedpropertylists =
                                    selectsuggested['selectednegolists'];
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
                                    ' Changed the status to Final Negotiation after Successfully completed USV';

                                  var leadusvdoneparam = {
                                    leadid: this.leadid,
                                    closedate: visiteddate,
                                    closetime: visitedtime,
                                    leadstage: 'USV',
                                    stagestatus: '3',
                                    textarearemarks: usvfinalremarks,
                                    userid: this.userid,
                                    assignid: this.negoExecutiveId,
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
                                            'Scheduled the Final Negotiation for ' +
                                            this
                                              .selectedproperty_commaseperated +
                                            ' On ' +
                                            dateformatchange +
                                            ' ' +
                                            nexttime;
                                          var leadnegofixparam = {
                                            leadid: this.leadid,
                                            closedate: nextdate,
                                            closetime: nexttime,
                                            leadstage: 'Final Negotiation',
                                            stagestatus: '1',
                                            textarearemarks: textarearemarks,
                                            userid: this.userid,
                                            assignid: this.negoExecutiveId,
                                            autoremarks: this.autoremarks,
                                            property: this.suggestchecked,
                                            feedbackid: this.feedbackId,
                                          };
                                          this.mandateService
                                            .addleadhistory(leadnegofixparam)
                                            .subscribe(
                                              (success) => {
                                                this.status = success['status'];
                                                this.showSpinner = false;
                                                if (this.status == 'True') {
                                                  Swal.fire({
                                                    title:
                                                      'Negotiation Fixed Successfully',
                                                    icon: 'success',
                                                    heightAuto: false,
                                                    allowOutsideClick: false,
                                                    confirmButtonText: 'OK!',
                                                  }).then((result) => {
                                                    if (result.value) {
                                                      //           const currentParams = this.activeroute.snapshot.queryParams;
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
                    title: `Final Negotiation already fixed by ${success['data'][0].name}`,
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
      } // USV DONE with NEGOTIATION Fixing

      // RSV DONE with NEGOTIATION Fixing
      else if ($('#sectionselector').val() == 'RSV') {
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
          $('#visitupdate').removeAttr('style');
          $('#propertyremarks').removeAttr('style');

          var visitedparam = {
            leadid: this.leadid,
            propid: this.suggestchecked,
            execid: this.userid,
            visitupdate: 1,
            remarks: $('#propertyremarks').val(),
            stage: 'RSV',
            assignid: this.negoExecutiveId,
            feedbackid: this.feedbackId,
          };

          var visiteddate = $('#RSVvisiteddate').val();
          var visitedtime = $('#RSVvisitedtime').val();
          var nextactiondate = $('#negonextactiondate').val();
          var nextactiontime = $('#negonextactiontime').val();
          var rsvfinalremarks = 'RSV Finished';

          var param = {
            leadid: this.leadid,
            nextdate: nextactiondate,
            nexttime: nextactiontime,
            suggestproperties: this.suggestchecked,
            execid: this.userid,
            assignedId: this.negoExecutiveId,
            feedbackid: this.feedbackId,
          };

          let visitupdateremarks = $('#propertyremarks').val().trim();
          if (visitupdateremarks == '' || visitupdateremarks == undefined) {
            Swal.fire({
              title: 'Please add some remarks about the Sitevisit',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            }).then(() => {});
          } else {
            var leadnegofixparam = {
              leadid: this.leadid,
              closedate: nextdate,
              closetime: nexttime,
              leadstage: 'Final Negotiation',
              stagestatus: '1',
              textarearemarks: textarearemarks,
              userid: this.userid,
              assignid: this.negoExecutiveId,
              autoremarks:
                'Scheduled the Final Negotiation for ' +
                this.selectedproperty_commaseperated +
                ' On ' +
                dateformatchange +
                ' ' +
                nexttime,
              property: this.suggestchecked,
              feedbackid: this.feedbackId,
            };

            this.mandateService
              .addleadhistory(leadnegofixparam)
              .subscribe((success) => {
                this.status = success['status'];
                if (this.status == 'True') {
                  this.showSpinner = true;
                  this.mandateService
                    .addpropertyvisitupdate(visitedparam)
                    .subscribe(
                      (success) => {
                        this.status = success['status'];
                        if (this.status == 'True') {
                          this.mandateService.addnegoselected(param).subscribe(
                            (success) => {
                              this.status = success['status'];
                              this.mandateService
                                .negoselectproperties(
                                  this.leadid,
                                  this.userid,
                                  this.negoExecutiveId,
                                  this.feedbackId
                                )
                                .subscribe((selectsuggested) => {
                                  this.selectedpropertylists =
                                    selectsuggested['selectednegolists'];
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
                                    ' Changed the status to Final Negotiation after Successfully completed RSV';

                                  var leadrsvdoneparam = {
                                    leadid: this.leadid,
                                    closedate: visiteddate,
                                    closetime: visitedtime,
                                    leadstage: 'RSV',
                                    stagestatus: '3',
                                    textarearemarks: rsvfinalremarks,
                                    userid: this.userid,
                                    assignid: this.negoExecutiveId,
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
                                          this.autoremarks =
                                            'Scheduled the Final Negotiation for ' +
                                            this
                                              .selectedproperty_commaseperated +
                                            ' On ' +
                                            dateformatchange +
                                            ' ' +
                                            nexttime;
                                          var leadnegofixparam = {
                                            leadid: this.leadid,
                                            closedate: nextdate,
                                            closetime: nexttime,
                                            leadstage: 'Final Negotiation',
                                            stagestatus: '1',
                                            textarearemarks: textarearemarks,
                                            userid: this.userid,
                                            assignid: this.negoExecutiveId,
                                            autoremarks: this.autoremarks,
                                            property: this.suggestchecked,
                                            feedbackid: this.feedbackId,
                                          };
                                          this.mandateService
                                            .addleadhistory(leadnegofixparam)
                                            .subscribe(
                                              (success) => {
                                                this.status = success['status'];
                                                this.showSpinner = false;
                                                if (this.status == 'True') {
                                                  Swal.fire({
                                                    title:
                                                      'Negotiation Fixed Successfully',
                                                    icon: 'success',
                                                    heightAuto: false,
                                                    allowOutsideClick: false,
                                                    confirmButtonText: 'OK!',
                                                  }).then((result) => {
                                                    if (result.value) {
                                                      //           const currentParams = this.activeroute.snapshot.queryParams;
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
                    title: `Final Negotiation already fixed by ${success['data'][0].name}`,
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
      // RSV DONE with NEGOTIATION Fixing

      // DIRECT Negotiation Fixing
      else if ($('#sectionselector').val() == 'Final Negotiation') {
        var nextdate = $('#negonextactiondate').val();
        var nexttime = $('#negonextactiontime').val();
        var textarearemarks = $('#negotextarearemarks').val();
        this.autoremarks = ' Scheduled the Finalnegotiation';

        var param = {
          leadid: this.leadid,
          nextdate: nextdate,
          nexttime: nexttime,
          suggestproperties: this.suggestchecked,
          execid: this.userid,
          assignedId: this.negoExecutiveId,
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
        this.mandateService.addnegoselected(param).subscribe(
          (success) => {
            this.status = success['status'];
            this.mandateService
              .negoselectproperties(
                this.leadid,
                this.userid,
                this.negoExecutiveId,
                this.feedbackId
              )
              .subscribe((selectsuggested) => {
                this.selectedpropertylists =
                  selectsuggested['selectednegolists'];
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
                  'Scheduled the Final Negotiation for ' +
                  this.selectedproperty_commaseperated +
                  ' On ' +
                  dateformatchange +
                  ' ' +
                  nexttime;

                var leadnegofixparam = {
                  leadid: this.leadid,
                  closedate: nextdate,
                  closetime: nexttime,
                  leadstage: 'Final Negotiation',
                  stagestatus: '1',
                  textarearemarks: textarearemarks,
                  userid: this.userid,
                  assignid: this.negoExecutiveId,
                  autoremarks: this.autoremarks,
                  property: this.suggestchecked,
                  feedbackid: this.feedbackId,
                };

                this.mandateService.addleadhistory(leadnegofixparam).subscribe(
                  (success) => {
                    this.status = success['status'];
                    this.showSpinner = false;
                    if (this.status == 'True') {
                      Swal.fire({
                        title: 'Final Negotiation Fixed Successfully',
                        icon: 'success',
                        heightAuto: false,
                        allowOutsideClick: false,
                        confirmButtonText: 'OK!',
                      }).then((result) => {
                        if (result.value) {
                          //   const currentParams = this.activeroute.snapshot.queryParams;
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
                    } else if (this.status == 'False' && success['data']) {
                      this.showSpinner = false;
                      Swal.fire({
                        title: `Final Negotiation already fixed by ${success['data'][0].name}`,
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
        // }
      } else {
        var nextdate = $('#negonextactiondate').val();
        var nexttime = $('#negonextactiontime').val();
        var textarearemarks = $('#negotextarearemarks').val();
        this.autoremarks = ' Scheduled the Finalnegotiation';

        var param = {
          leadid: this.leadid,
          nextdate: nextdate,
          nexttime: nexttime,
          suggestproperties: this.suggestchecked,
          execid: this.userid,
          assignedId: this.negoExecutiveId,
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
        this.mandateService.addnegoselected(param).subscribe(
          (success) => {
            this.status = success['status'];
            this.mandateService
              .negoselectproperties(
                this.leadid,
                this.userid,
                this.negoExecutiveId,
                this.feedbackId
              )
              .subscribe((selectsuggested) => {
                this.selectedpropertylists =
                  selectsuggested['selectednegolists'];
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
                  'Scheduled the Final Negotiation for ' +
                  this.selectedproperty_commaseperated +
                  ' On ' +
                  dateformatchange +
                  ' ' +
                  nexttime;
                var leadnegofixparam = {
                  leadid: this.leadid,
                  closedate: nextdate,
                  closetime: nexttime,
                  leadstage: 'Final Negotiation',
                  stagestatus: '1',
                  textarearemarks: textarearemarks,
                  userid: this.userid,
                  assignid: this.negoExecutiveId,
                  autoremarks: this.autoremarks,
                  property: this.suggestchecked,
                  feedbackid: this.feedbackId,
                };
                this.mandateService.addleadhistory(leadnegofixparam).subscribe(
                  (success) => {
                    this.showSpinner = false;
                    this.status = success['status'];
                    if (this.status == 'True') {
                      Swal.fire({
                        title: 'Final Negotiation Fixed Successfully',
                        icon: 'success',
                        heightAuto: false,
                        allowOutsideClick: false,
                        confirmButtonText: 'OK!',
                      }).then((result) => {
                        if (result.value) {
                          //  const currentParams = this.activeroute.snapshot.queryParams;
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
                    } else if (this.status == 'False' && success['data']) {
                      this.showSpinner = false;
                      Swal.fire({
                        title: `Final Negotiation already fixed by ${success['data'][0].name}`,
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
        // }
      }
    }
  }

  // REFIXING FINAL NEGOTIATION
  negorefixing() {
    var nextdate = $('#refixdate').val();
    var nexttime = $('#refixtime').val();
    var textarearemarks = $('#refixtextarearemarks').val();
    var dateformatchange = new Date(nextdate).toDateString();
    var priority = $('#priorityhiddeninput').val();
    if (this.getselectedLeadExec.suggestedprop.length > 1) {
      this.suggestchecked = this.selectedSuggestedProp.propid;
    } else {
      this.suggestchecked = this.getselectedLeadExec.suggestedprop[0].propid;
    }
    var param = {
      leadid: this.leadid,
      nextdate: nextdate,
      nexttime: nexttime,
      suggestproperties: this.suggestchecked,
      execid: this.userid,
      assignedId: this.negoExecutiveId,
      feedback: this.feedbackId,
    };
    //  if($('#priorityhiddeninput').val() == ""){
    //       Swal.fire({
    //         title: 'Priority Level Required',
    //         text: 'Please select priority level',
    //         icon: 'error',
    //         heightAuto: false,
    //         confirmButtonText: 'OK'
    //       })
    // }else{
    this.showSpinner = true;
    if (localStorage.getItem('Name') == 'demo') {
      Swal.fire({
        title: 'Re-Fixing FN is restricted for demo accounts',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      }).then(() => {
        this.showSpinner = false;
      });
    } else {
      this.mandateService.addnegoselectedrefix(param).subscribe(
        (success) => {
          this.status = success['status'];
          this.mandateService
            .negoselectproperties(
              this.leadid,
              this.userid,
              this.negoExecutiveId,
              this.feedbackId
            )
            .subscribe((selectsuggested) => {
              this.selectedpropertylists = selectsuggested['selectednegolists'];
              this.selectedlists = selectsuggested;
              // Joining the object values as comma seperated when add the property for the history storing
              this.selectedproperty_commaseperated = this.selectedpropertylists
                .map((item) => {
                  return item.name;
                })
                .join(',');
              // Joining the object values as comma seperated when add the property for the history storing
              this.autoremarks =
                ' ReFixed the Final Negotiation for ' +
                this.selectedproperty_commaseperated +
                ' On ' +
                dateformatchange +
                ' ' +
                nexttime;
              var leadnegorefixparam = {
                leadid: this.leadid,
                closedate: nextdate,
                closetime: nexttime,
                leadstage: 'Final Negotiation',
                stagestatus: '2',
                textarearemarks: textarearemarks,
                userid: this.userid,
                assignid: this.negoExecutiveId,
                autoremarks: this.autoremarks,
                property: this.suggestchecked,
                feedback: this.feedbackId,
              };
              this.mandateService.addleadhistory(leadnegorefixparam).subscribe(
                (success) => {
                  this.status = success['status'];
                  this.showSpinner = false;
                  if (this.status == 'True') {
                    Swal.fire({
                      title: 'Refixed Final Negotiation Successfully',
                      icon: 'success',
                      heightAuto: false,
                      allowOutsideClick: false,
                      confirmButtonText: 'OK!',
                    }).then((result) => {
                      //  const currentParams = this.activeroute.snapshot.queryParams;
                      //   this.router.navigate([], {
                      //   relativeTo: this.activeroute,
                      //   queryParams: {
                      //     ...currentParams,
                      //     stageForm: 'onleadStatus'
                      //   },
                      //   queryParamsHandling: 'merge'
                      //   });
                      location.reload();
                    });
                  } else if (this.status == 'False' && success['data']) {
                    this.showSpinner = false;
                    Swal.fire({
                      title: `Final Negotiation already fixed by ${success['data'][0].name}`,
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
    // }
  }

  //to submit form for not interested in Fn done
  updatepropertyvisit(propertyid, propertyname, i) {
    if ($('#visitupdate').val() == '1') {
      this.visitupdate = 'Negotiation Done';
    } else {
      this.visitupdate = 'Negotiation Cancelled';
    }
    this.propertyremarks = $('#propertyremarks' + i).val();

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
        leadid: this.leadid,
        propid: propertyid,
        execid: this.userid,
        visitupdate: $('#visitupdate').val(),
        remarks: $('#propertyremarks').val(),
        stage: 'Final Negotiation',
        assignid: this.negoExecutiveId,
      };
      this.showSpinner = true;
      this.mandateService.addpropertyvisitupdate(param).subscribe(
        (success) => {
          this.status = success['status'];
          if (this.status == 'True') {
            this.showSpinner = false;
            var userid = localStorage.getItem('UserId');
            this.autoremarks =
              ' Moved the lead to Junk, Because of' + 'Not Interested';
            var leadjunkparam = {
              leadid: this.leadid,
              closedate: '',
              closetime: '',
              leadstage: 'Move to Junk',
              stagestatus: '46',
              textarearemarks: 'Not Interested',
              userid: userid,
              assignid: this.negoExecutiveId,
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

  // to test whether the text earea input contain only space
  hasOnlySpaces;
  checkAlphanumericSpaces() {
    // this.hasOnlySpaces = !/^(?!\s*$).+$/.test(this.textarearemarks);
    this.hasOnlySpaces = !/^(?![\s\n\r]*$)[\s\S]+$/.test(this.textarearemarks);
  }

  checkAlphanumericSpaces1() {
    // this.hasOnlySpaces = !/^(?!\s*$).+$/.test(this.subnegotextarearemarks);
    this.hasOnlySpaces = !/^(?![\s\n\r]*$)[\s\S]+$/.test(
      this.subnegotextarearemarks
    );
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
    if (this.negoTime) {
      const [time, modifier] = this.negoTime.split(' ');
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
      this.negoTime = '';
      $('#refixtime').val('');
      $('#negonextactiontime').val('');
      $('#subnegonextactiontime').val('');
    }
  }

  ngOnDestroy() {
    this.closeAlert();
  }

  closeAlert() {
    Swal.close();
  }
}

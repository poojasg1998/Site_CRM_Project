import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonPopover, LoadingController } from '@ionic/angular';
import { DateTime } from 'luxon';
import { MandateService } from 'src/app/mandate-service.service';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-mandate-close-form',
  templateUrl: './mandate-close-form.component.html',
  styleUrls: ['./mandate-close-form.component.scss'],
})
export class MandateCloseFormComponent implements OnInit {
  @Input() selectedExecId: any;
  @Input() selectedSuggestedProp: any;
  @Input() onCallLeadDetails: any;

  closedTime;

  feedbackId = '';

  minTime = DateTime.fromObject({ hour: 8, minute: 0 });
  maxTime = DateTime.fromObject({ hour: 20, minute: 0 });
  closeddate: string;
  closedtime: string;
  visitedpropertylists: any;
  userid;
  leadid;
  adminview: boolean;
  executeid: any;
  suggestchecked: any;
  setActive: (buttonName: any) => void;
  isActive: (buttonName: any) => boolean;
  minDate = new Date().toISOString();
  date = new Date();
  priorDate = new Date(new Date().setDate(this.date.getDate() + 30));
  selectedFileName: string;
  status: any;
  closurefiles: any = [];
  uploads: any = [];
  autoremarks: string;
  textarearemarks: any;
  dimension;
  rate;
  selectedItem = 0;
  propertyId;

  unitSelected = [];
  isSelect_1_BHK = false;
  isSelect_2_BHK = false;
  isSelect_3_BHK = false;
  isSelect_4_BHK = false;
  isSelect_5_BHK = false;
  getselectedLeadExec: any;
  closedExecutiveId: any;
  execview: boolean;
  showSpinner = true;

  constructor(
    private router: Router,
    public loadingController: LoadingController,
    private activeroute: ActivatedRoute,
    private mandateService: MandateService
  ) {}

  onDateChange(event: CustomEvent) {
    const selectedDate = new Date(event.detail.value);
    this.closeddate = selectedDate.toLocaleDateString('en-CA');
  }

  isCS = false;

  ngOnInit() {
    this.userid = localStorage.getItem('UserId');
    this.activeroute.queryParamMap.subscribe((params) => {
      this.isCS =
        localStorage.getItem('Role') == '50009' ||
        localStorage.getItem('Role') == '50010' ||
        localStorage.getItem('Role') == '50003' ||
        localStorage.getItem('Role') == '50004' ||
        localStorage.getItem('Role') == '50014' ||
        localStorage.getItem('Role') == '50013';
      const paramMap = params.get('leadId');
      this.leadid = params.get('leadId');
      this.selectedExecId = params.get('execid');
      const isEmpty = !paramMap;
      // if (!isEmpty) {
      this.leadid = params['params']['leadId']
        ? params['params']['leadId']
        : this.onCallLeadDetails.customer_IDPK;
      this.feedbackId = params.get('feedback') ? params.get('feedback') : '';
      // }
      this.mandateService
        .getassignedrm(
          this.leadid,
          this.userid,
          this.selectedExecId,
          this.feedbackId
        )
        .subscribe((cust) => {
          this.executeid = cust['RMname']?.[0]?.executiveid;
          let filteredInfo;
          filteredInfo = cust['RMname'].filter(
            (da) => da.executiveid == this.selectedExecId
          );
          this.getselectedLeadExec = filteredInfo[0];
          if (this.userid == '1') {
            this.closedExecutiveId = this.selectedExecId;
          } else {
            this.closedExecutiveId = this.selectedExecId;
          }
          this.loadimportantapi();
        });
    });

    if (localStorage.getItem('Role') == null) {
      this.router.navigateByUrl('/login');
    } else if (localStorage.getItem('Role') == '1') {
      this.adminview = true;
      this.execview = false;
    } else {
      this.adminview = false;
      this.execview = true;
    }
    // this.scriptfunctions();

    if (localStorage.getItem('Role') == null) {
      this.router.navigateByUrl('/login');
    } else if (localStorage.getItem('Role') == '1') {
      this.adminview = true;
    } else {
      this.adminview = false;
    }
  }

  loadimportantapi() {
    var param = {
      leadid: this.leadid,
      userid: this.userid,
      stage: $('#customer_phase4').val(),
      executeid: this.closedExecutiveId,
      feedbackid: this.feedbackId,
    };

    this.mandateService
      .getvisitedsuggestproperties(param)
      .subscribe((visitsuggested) => {
        this.visitedpropertylists = visitsuggested['visitedlists'];
        this.visitedpropertylists = this.visitedpropertylists?.filter(
          (da) => da.propid == this.selectedSuggestedProp?.propid
        );
        this.suggestchecked = this.visitedpropertylists
          .map((item) => {
            return item.propid;
          })
          .join(',');
        this.showSpinner = false;
      });
  }

  onFileSelected(i, event: any) {
    const files = event.target.files;
    if (files) {
      let allFilesValid = true;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 1110000) {
          allFilesValid = false;
          Swal.fire({
            title: 'File Size Exceeded',
            text: 'File Size limit is 1MB',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK!',
          }).then((result) => {
            if (result.value) {
              $('#customFile' + i).val('');
              this.closurefiles = [];
            }
          });
          break;
        }
      }

      if (allFilesValid) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileName = file.name;
          this.selectedFileName = fileName;
          $('#customFile' + i)
            .siblings('.file-label-' + i)
            .addClass('selected')
            .html(fileName);
          // Push the file to closurefiles and read the file
          this.closurefiles.push(file);
          const reader = new FileReader();
          reader.onload = (event: any) => {
            this.uploads.push(event.target.result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  browseFiles(i) {
    const fileInput = document.getElementById(
      'customFile' + i
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  //UNIT SELECTION METHOD
  unitselection(data) {
    if (data == '1BHK') {
      if (!this.unitSelected.includes(data)) {
        this.unitSelected.push('1BHK');
        this.isSelect_1_BHK = !this.isSelect_1_BHK;
      } else {
        const index = this.unitSelected.indexOf(data);
        this.unitSelected.splice(index, 1);
        this.isSelect_1_BHK = !this.isSelect_1_BHK;
      }
    } else if (data == '2BHK') {
      if (!this.unitSelected.includes(data)) {
        this.unitSelected.push('2BHK');
        this.isSelect_2_BHK = !this.isSelect_2_BHK;
      } else {
        const index = this.unitSelected.indexOf(data);
        this.unitSelected.splice(index, 1);
        this.isSelect_2_BHK = !this.isSelect_2_BHK;
      }
    } else if (data == '3BHK') {
      if (!this.unitSelected.includes(data)) {
        this.unitSelected.push('3BHK');
        this.isSelect_3_BHK = !this.isSelect_3_BHK;
      } else {
        const index = this.unitSelected.indexOf(data);
        this.unitSelected.splice(index, 1);
        this.isSelect_3_BHK = !this.isSelect_3_BHK;
      }
    } else if (data == '4BHK') {
      if (!this.unitSelected.includes(data)) {
        this.unitSelected.push('4BHK');
        this.isSelect_4_BHK = !this.isSelect_4_BHK;
      } else {
        const index = this.unitSelected.indexOf(data);
        this.unitSelected.splice(index, 1);
        this.isSelect_4_BHK = !this.isSelect_4_BHK;
      }
    } else if (data == '5BHK') {
      if (!this.unitSelected.includes(data)) {
        this.unitSelected.push('5BHK');
        this.isSelect_5_BHK = !this.isSelect_5_BHK;
      } else {
        const index = this.unitSelected.indexOf(data);
        this.unitSelected.splice(index, 1);
        this.isSelect_5_BHK = !this.isSelect_5_BHK;
      }
    }
  }
  showSiteVisitDate;
  closingrequest(i, propid, propname) {
    // USV DONE with Lead Closing
    let closeLeadStage: any;
    if (this.userid == 1) {
      closeLeadStage = 'Admin Lead Closed';
    } else {
      closeLeadStage = 'Deal Closing Request';
    }

    if (localStorage.getItem('Name') == 'demo') {
      Swal.fire({
        title: 'Deal Closing Request restricted for demo accounts',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      }).then(() => {
        this.showSpinner = false;
      });
    } else {
      // USV DONE with Lead Closing
      if ($('#sectionselector').val() == 'USV') {
        if ($('#USVvisiteddate').val() == '') {
          $('#USVvisiteddate')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select One Date');
        } else {
          $('#USVvisiteddate').removeAttr('style');
        }

        if ($('#USVvisitedtime').val() == '') {
          $('#USVvisitedtime')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select One Date');
        } else {
          $('#USVvisitedtime').removeAttr('style');
        }

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
        } else if (this.unitSelected.length == 0) {
          Swal.fire({
            title: 'Units Not Selected',
            text: 'Select any Unit for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if (
          $('#unitnum-' + i).val() == '' ||
          $('#unitnum-' + i)
            .val()
            .match(/^\s+$/) !== null
        ) {
          $('#unitnum-' + i)
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Unit Number');
        } else if (
          $('#dimension-' + i).val() == '' ||
          $('#dimension-' + i)
            .val()
            .match(/^\s+$/) !== null
        ) {
          $('#unitnum-' + i).removeAttr('style');
          $('#dimension-' + i)
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Dimension');
        } else if (
          $('#ratepersquarfeet-' + i).val() == '' ||
          $('#ratepersquarfeet-' + i)
            .val()
            .match(/^\s+$/) !== null
        ) {
          $('#dimension-' + i).removeAttr('style');
          $('#ratepersquarfeet-' + i)
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Rate Per Squarefeet');
        } else if (
          $('#remarks-' + i).val() == '' ||
          $('#remarks-' + i)
            .val()
            .match(/^\s+$/) !== null
        ) {
          $('#ratepersquarfeet-' + i).removeAttr('style');
          $('#remarks-' + i)
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type some comments/remarks');
        } else if ($('#customFile' + i).val() == '') {
          $('#remarks-' + i).removeAttr('style');
          Swal.fire({
            title: 'No Files Uploaded',
            text: 'Upload atleast one file for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
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
          // }
          // else  if ($('#visitupdate').val() == "") {
          //   Swal.fire({
          //     title: 'Action Not Took',
          //     text: 'Please select any actions',
          //     icon: 'error',
          //     heightAuto: false,
          //     confirmButtonText: 'OK'
          //   })
        } else if ($('#closeddate').val() == '') {
          $('#closeddate')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select closed Date');
        } else if ($('#closedtime').val() == '') {
          $('#closedtime')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select closed Time');
        } else {
          $('#unitnum-' + i).removeAttr('style');
          $('#dimension-' + i).removeAttr('style');
          $('#ratepersquarfeet-' + i).removeAttr('style');
          $('#remarks-' + i).removeAttr('style');
          $('#propertyremarks').removeAttr('style');
          $('#visitupdate').removeAttr('style');
          var totalunitscount = this.unitSelected.length;
          var unitnumbers = $('#unitnum-' + i).val();
          var lastuninumber = unitnumbers.replace(/,\s*$/, '');
          var totalunitnumbers = lastuninumber.split(',').length;

          var dimensions = $('#dimension-' + i).val();
          var lastdimension = dimensions.replace(/,\s*$/, '');
          var totaldimensions = lastdimension.split(',').length;

          var rpsft = $('#ratepersquarfeet-' + i).val();
          var lastsqft = rpsft.replace(/,\s*$/, '');
          var totalrpsft = lastsqft.split(',').length;

          // Condition of selected only one unit or less than one & enetered more unit numbers
          if (totalunitscount <= 1 && totalunitnumbers > 1) {
            if (totalunitnumbers != totaldimensions) {
              if (totaldimensions == 1) {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimension Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimensions Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else if (totaldimensions != totalrpsft) {
              if (totalrpsft == 1) {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Price Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Prices Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else {
              // parameters & API Submissions for the property sitevisit update
              var visitparam = {
                leadid: this.leadid,
                propid: this.suggestchecked,
                execid: this.userid,
                visitupdate: '1',
                remarks: $('#propertyremarks').val(),
                stage: 'USV',
                assignid: this.closedExecutiveId,
                feedbackid: this.feedbackId,
              };
              // parameters & API Submissions for the property sitevisit update
              this.showSpinner = true;
              this.mandateService.addpropertyvisitupdate(visitparam).subscribe(
                (success) => {
                  this.status = success['status'];
                  if (this['status'] == 'True') {
                    const formData = new FormData();
                    formData.append('PropID', propid);
                    formData.append('LeadID', this.leadid);
                    formData.append('ExecID', this.userid);
                    formData.append('assignID', this.closedExecutiveId);
                    for (var k = 0; k < this.closurefiles.length; k++) {
                      formData.append('file[]', this.closurefiles[k]);
                    }
                    this.mandateService.uploadFile(formData).subscribe(
                      (res) => {
                        if (res['status'] === 'True') {
                          var visiteddate = $('#USVvisiteddate').val();
                          var visitedtime = $('#USVvisitedtime').val();
                          // var usvfinalremarks = $('#usvfinalremarks').val();
                          var usvfinalremarks = 'USV Done';
                          this.autoremarks =
                            ' Changed the status to Deal Closing Request after Successfully completed the USV';
                          var leadusvparam = {
                            leadid: this.leadid,
                            closedate: visiteddate,
                            closetime: visitedtime,
                            leadstage: 'USV',
                            stagestatus: '3',
                            textarearemarks: usvfinalremarks,
                            userid: this.userid,
                            assignid: this.executeid,
                            autoremarks: this.autoremarks,
                            property: propid,
                            feedbackid: this.feedbackId,
                          };

                          this.mandateService
                            .addleadhistory(leadusvparam)
                            .subscribe(
                              (success) => {
                                this.status = success['status'];
                                if (this.status == 'True') {
                                  const closedate = $('#closeddate').val();
                                  var closetime = $('#closedtime').val();
                                  var textarearemarks = $(
                                    '#remarks-' + i
                                  ).val();
                                  var dateformatchange = new Date(
                                    closedate
                                  ).toDateString();
                                  this.autoremarks =
                                    ' Send the Deal Closing Request for ' +
                                    propname +
                                    ' On ' +
                                    dateformatchange +
                                    ' ' +
                                    closetime;
                                  var bhk = this.unitSelected.join(', ');
                                  var leadhistparam = {
                                    leadid: this.leadid,
                                    closedate: closedate,
                                    closetime: closetime,
                                    leadstage: closeLeadStage,
                                    stagestatus: '0',
                                    textarearemarks: textarearemarks,
                                    userid: this.userid,
                                    assignid: this.executeid,
                                    property: propid,
                                    bhk: bhk,
                                    bhkunit: unitnumbers,
                                    dimension: dimensions,
                                    ratepersft: rpsft,
                                    autoremarks: this.autoremarks,
                                    feedbackid: this.feedbackId,
                                  };
                                  this.mandateService
                                    .addleadhistory(leadhistparam)
                                    .subscribe(
                                      (success) => {
                                        this.status = success['status'];
                                        this.showSpinner = false;
                                        if (this.status == 'True') {
                                          success['status'];
                                          Swal.fire({
                                            title:
                                              this.userid == 1
                                                ? 'Deal Closed Successfully'
                                                : 'Deal Closing Request Send Successfully',
                                            icon: 'success',
                                            heightAuto: false,
                                            allowOutsideClick: false,
                                            confirmButtonText: 'OK!',
                                          }).then((result) => {
                                            if (result.value) {
                                              //         const currentParams = this.activeroute.snapshot.queryParams;
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
                                        } else if (
                                          this.status == 'Duplicate Request'
                                        ) {
                                          Swal.fire({
                                            title:
                                              'Already got the request for this same Unit number',
                                            icon: 'error',
                                            allowOutsideClick: false,
                                            heightAuto: false,
                                            confirmButtonText: 'OK!',
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
                        } else if (res['status'] === 'Duplicate Request') {
                          this.showSpinner = false;
                          Swal.fire({
                            title:
                              'Already found the same property and same unit Closing request',
                            icon: 'error',
                            allowOutsideClick: false,
                            heightAuto: false,
                            confirmButtonText: 'ok',
                          });
                        }
                      },
                      (err) => {
                        console.log(err);
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
          // Condition of selected unit more & entered less unit numbers
          else if (totalunitscount > totalunitnumbers) {
            if (totalunitnumbers == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Number',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Numbers',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#unitnum-' + i)
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Unit Number');
          }
          // Condition of selected unit less and not equal one & entered more unit numbers
          else if (totalunitscount < totalunitnumbers) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalunitnumbers +
                ' Unit Numbers Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less dimensions
          else if (totalunitscount > totaldimensions) {
            if (totaldimensions == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimension',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimensions',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#dimension-' + i)
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Dimension');
          }
          // Condition of selected unit less & entered more dimensions
          else if (totalunitscount < totaldimensions) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totaldimensions +
                ' Dimensions Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less ratepersqfeets
          else if (totalunitscount > totalrpsft) {
            if (totalrpsft == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Price Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Prices Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#ratepersquarfeet-' + i)
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Rate Per Squarefeet');
          }
          // Condition of selected unit less & entered more ratepersqfeets
          else if (totalunitscount < totalrpsft) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalrpsft +
                ' Prices Found',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          } else {
            // parameters & API Submissions for the property sitevisit update
            var visitparam = {
              leadid: this.leadid,
              propid: this.suggestchecked,
              execid: this.userid,
              visitupdate: '1',
              remarks: $('#propertyremarks').val(),
              stage: 'USV',
              assignid: this.closedExecutiveId,
              feedbackid: this.feedbackId,
            };

            this.mandateService.addpropertyvisitupdate(visitparam).subscribe(
              (success) => {
                this.status = success['status'];
                if (this.status == 'True') {
                  const formData = new FormData();
                  formData.append('PropID', propid);
                  formData.append('LeadID', this.leadid);
                  formData.append('ExecID', this.userid);
                  formData.append('assignID', this.closedExecutiveId);
                  for (var k = 0; k < this.closurefiles.length; k++) {
                    formData.append('file[]', this.closurefiles[k]);
                  }
                  this.mandateService.uploadFile(formData).subscribe(
                    (res) => {
                      if (res['status'] === 'True') {
                        var visiteddate = $('#USVvisiteddate').val();
                        var visitedtime = $('#USVvisitedtime').val();
                        var usvfinalremarks = 'USV Done';
                        this.autoremarks =
                          ' Changed the status to Deal Closing Request after Successfully completed the USV';
                        var leadusvparam = {
                          leadid: this.leadid,
                          closedate: visiteddate,
                          closetime: visitedtime,
                          leadstage: 'USV',
                          stagestatus: '3',
                          textarearemarks: usvfinalremarks,
                          userid: this.userid,
                          assignid: this.closedExecutiveId,
                          autoremarks: this.autoremarks,
                          property: propid,
                          feedbackid: this.feedbackId,
                        };

                        this.mandateService
                          .addleadhistory(leadusvparam)
                          .subscribe(
                            (success) => {
                              this.status = success['status'];
                              if (this.status == 'True') {
                                const inputDate = new Date(
                                  $('#closeddate').val()
                                );
                                const closedate =
                                  inputDate.getFullYear() +
                                  '-' +
                                  (inputDate.getMonth() + 1) +
                                  '-' +
                                  inputDate.getDate();
                                var closetime = $('#closedtime').val();
                                var textarearemarks = $('#remarks-' + i).val();
                                var dateformatchange = new Date(
                                  closedate
                                ).toDateString();
                                this.autoremarks =
                                  ' Send the Deal Closing Request for ' +
                                  propname +
                                  ' On ' +
                                  dateformatchange +
                                  ' ' +
                                  closetime;
                                var bhk = this.unitSelected.join(', ');
                                var leadhistparam = {
                                  leadid: this.leadid,
                                  closedate: closedate,
                                  closetime: closetime,
                                  leadstage: closeLeadStage,
                                  stagestatus: '0',
                                  textarearemarks: textarearemarks,
                                  userid: this.userid,
                                  assignid: this.closedExecutiveId,
                                  property: propid,
                                  bhk: bhk,
                                  bhkunit: unitnumbers,
                                  dimension: dimensions,
                                  ratepersft: rpsft,
                                  autoremarks: this.autoremarks,
                                  feedbackid: this.feedbackId,
                                };

                                this.mandateService
                                  .addleadhistory(leadhistparam)
                                  .subscribe(
                                    (success) => {
                                      this.status = success['status'];
                                      this.showSpinner = false;
                                      if (this.status == 'True') {
                                        success['status'];
                                        Swal.fire({
                                          title:
                                            this.userid == 1
                                              ? 'Deal Closed Successfully'
                                              : 'Deal Closing Request Send Successfully',
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
                                      } else if (
                                        this.status == 'Duplicate Request'
                                      ) {
                                        Swal.fire({
                                          title:
                                            'Already got the request for this same Unit number',
                                          icon: 'error',
                                          allowOutsideClick: false,
                                          heightAuto: false,
                                          confirmButtonText: 'OK!',
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
                      } else if (res['status'] === 'Duplicate Request') {
                        this.showSpinner = false;
                        Swal.fire({
                          title:
                            'Already found the same property and same unit Closing request',
                          icon: 'error',
                          heightAuto: false,
                          allowOutsideClick: false,
                          confirmButtonText: 'ok',
                        });
                      }
                    },
                    (err) => {
                      console.log(err);
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
      }
      // USV DONE with Lead Closing

      // RSV DONE with Lead Closing
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

        if (this.unitSelected.length == 0) {
          Swal.fire({
            title: 'Units Not Selected',
            text: 'Select any Unit for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if (
          $('#unitnum-' + i).val() == '' ||
          $('#unitnum-' + i)
            .val()
            .match(/^\s+$/) !== null
        ) {
          $('#unitnum-' + i)
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Unit Number');
        } else if (
          $('#dimension-' + i).val() == '' ||
          $('#dimension-' + i)
            .val()
            .match(/^\s+$/) !== null
        ) {
          $('#unitnum-' + i).removeAttr('style');
          $('#dimension-' + i)
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Dimension');
        } else if (
          $('#ratepersquarfeet-' + i).val() == '' ||
          $('#ratepersquarfeet-' + i)
            .val()
            .match(/^\s+$/) !== null
        ) {
          $('#dimension-' + i).removeAttr('style');
          $('#ratepersquarfeet-' + i)
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Rate Per Squarefeet');
        } else if (
          $('#remarks-' + i).val() == '' ||
          $('#remarks-' + i)
            .val()
            .match(/^\s+$/) !== null
        ) {
          $('#ratepersquarfeet-' + i).removeAttr('style');
          $('#remarks-' + i)
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type some comments/remarks');
        } else if ($('#customFile' + i).val() == '') {
          $('#remarks-' + i).removeAttr('style');
          Swal.fire({
            title: 'No Files Uploaded',
            text: 'Upload atleast one file for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          }) || $('#propertyremarks').val().match(/^\s+$/) !== null;
        } else if ($('#propertyremarks').val() == '') {
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
        }
        //  else if ($('#visitupdate').val() == "") {
        //   Swal.fire({
        //     title: 'Action Not Took',
        //     text: 'Please select any actions',
        //     icon: 'error',
        //     heightAuto: false,
        //     confirmButtonText: 'OK'
        //   })
        // }
        else {
          $('#unitnum-' + i).removeAttr('style');
          $('#dimension-' + i).removeAttr('style');
          $('#ratepersquarfeet-' + i).removeAttr('style');
          $('#remarks-' + i).removeAttr('style');
          $('#visitupdate').removeAttr('style');
          $('#propertyremarks').removeAttr('style');

          var totalunitscount = this.unitSelected.length;
          var unitnumbers = $('#unitnum-' + i).val();
          var lastuninumber = unitnumbers.replace(/,\s*$/, '');
          var totalunitnumbers = lastuninumber.split(',').length;
          var dimensions = $('#dimension-' + i).val();
          var lastdimension = dimensions.replace(/,\s*$/, '');
          var totaldimensions = lastdimension.split(',').length;
          var rpsft = $('#ratepersquarfeet-' + i).val();
          var lastsqft = rpsft.replace(/,\s*$/, '');
          var totalrpsft = lastsqft.split(',').length;

          // Condition of selected only one unit or less than one & enetered more unit numbers
          if (totalunitscount <= 1 && totalunitnumbers > 1) {
            if (totalunitnumbers != totaldimensions) {
              if (totaldimensions == 1) {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimension Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimensions Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else if (totaldimensions != totalrpsft) {
              if (totalrpsft == 1) {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Price Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Prices Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else {
              // parameters & API Submissions for the property sitevisit update
              var visitedparam = {
                leadid: this.leadid,
                propid: this.suggestchecked,
                execid: this.userid,
                visitupdate: 1,
                remarks: $('#propertyremarks').val(),
                stage: 'RSV',
                assignid: this.closedExecutiveId,
                feedbackid: this.feedbackId,
              };
              // parameters & API Submissions for the property sitevisit update
              this.showSpinner = true;
              this.mandateService
                .addpropertyvisitupdate(visitedparam)
                .subscribe(
                  (success) => {
                    this.status = success['status'];
                    if (this.status == 'True') {
                      const formData = new FormData();
                      formData.append('PropID', propid);
                      formData.append('LeadID', this.leadid);
                      formData.append('ExecID', this.userid);
                      formData.append('assignID', this.closedExecutiveId);
                      for (var k = 0; k < this.closurefiles.length; k++) {
                        formData.append('file[]', this.closurefiles[k]);
                      }
                      this.mandateService.uploadFile(formData).subscribe(
                        (res) => {
                          if (res['status'] === 'True') {
                            var visiteddate = $('#RSVvisiteddate').val();
                            var visitedtime = $('#RSVvisitedtime').val();
                            // var rsvfinalremarks = $('#rsvfinalremarks').val();
                            var rsvfinalremarks = 'RSV Done';
                            this.autoremarks =
                              ' Changed the status to Deal Closing Request after Successfully completed the RSV';
                            var leadrsvparam = {
                              leadid: this.leadid,
                              closedate: visiteddate,
                              closetime: visitedtime,
                              leadstage: 'RSV',
                              stagestatus: '3',
                              textarearemarks: rsvfinalremarks,
                              userid: this.userid,
                              assignid: this.closedExecutiveId,
                              autoremarks: this.autoremarks,
                              property: propid,
                              feedbackid: this.feedbackId,
                            };

                            this.mandateService
                              .addleadhistory(leadrsvparam)
                              .subscribe(
                                (success) => {
                                  this.status = success['status'];
                                  if (this.status == 'True') {
                                    var closedate = $('#closeddate').val();
                                    var closetime = $('#closedtime').val();
                                    var textarearemarks = $(
                                      '#remarks-' + i
                                    ).val();
                                    var dateformatchange = new Date(
                                      closedate
                                    ).toDateString();
                                    var bhk = this.unitSelected.join(', ');
                                    this.autoremarks =
                                      ' Send the Deal Closing Request for ' +
                                      propname +
                                      ' On ' +
                                      dateformatchange +
                                      ' ' +
                                      closetime;
                                    var leadhistparam = {
                                      leadid: this.leadid,
                                      closedate: closedate,
                                      closetime: closetime,
                                      leadstage: closeLeadStage,
                                      stagestatus: '0',
                                      textarearemarks: textarearemarks,
                                      userid: this.userid,
                                      assignid: this.closedExecutiveId,
                                      property: propid,
                                      bhk: bhk,
                                      bhkunit: unitnumbers,
                                      dimension: dimensions,
                                      ratepersft: rpsft,
                                      autoremarks: this.autoremarks,
                                      feedbackid: this.feedbackId,
                                    };
                                    this.mandateService
                                      .addleadhistory(leadhistparam)
                                      .subscribe(
                                        (success) => {
                                          this.status = success['status'];
                                          this.showSpinner = false;
                                          if (this.status == 'True') {
                                            success['status'];
                                            Swal.fire({
                                              title:
                                                this.userid == 1
                                                  ? 'Deal Closed Successfully'
                                                  : 'Deal Closing Requested Successfully',
                                              icon: 'success',
                                              heightAuto: false,
                                              allowOutsideClick: false,
                                              confirmButtonText: 'OK!',
                                            }).then((result) => {
                                              if (result.value) {
                                                //          const currentParams = this.activeroute.snapshot.queryParams;
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
                                          } else if (
                                            this.status == 'Duplicate Request'
                                          ) {
                                            Swal.fire({
                                              title:
                                                'Already got the request for this same Unit number',
                                              icon: 'error',
                                              heightAuto: false,
                                              allowOutsideClick: false,
                                              confirmButtonText: 'OK!',
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
                          } else if (res['status'] === 'Duplicate Request') {
                            this.showSpinner = false;
                            Swal.fire({
                              title:
                                'Already found the same property and same unit Closing request',
                              icon: 'error',
                              heightAuto: false,
                              allowOutsideClick: false,
                              confirmButtonText: 'ok',
                            });
                          }
                        },
                        (err) => {
                          console.log(err);
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
          // Condition of selected unit more & entered less unit numbers
          else if (totalunitscount > totalunitnumbers) {
            if (totalunitnumbers == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Number',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Numbers',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#unitnum-' + i)
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Unit Number');
          }
          // Condition of selected unit less and not equal one & entered more unit numbers
          else if (totalunitscount < totalunitnumbers) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalunitnumbers +
                ' Unit Numbers Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less dimensions
          else if (totalunitscount > totaldimensions) {
            if (totaldimensions == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimension',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimensions',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#dimension-' + i)
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Dimension');
          }
          // Condition of selected unit less & entered more dimensions
          else if (totalunitscount < totaldimensions) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totaldimensions +
                ' Dimensions Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less ratepersqfeets
          else if (totalunitscount > totalrpsft) {
            if (totalrpsft == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Price Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Prices Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#ratepersquarfeet-' + i)
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Rate Per Squarefeet');
          }
          // Condition of selected unit less & entered more ratepersqfeets
          else if (totalunitscount < totalrpsft) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalrpsft +
                ' Prices Found',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          } else {
            // parameters & API Submissions for the property sitevisit update
            var visitedparam2 = {
              leadid: this.leadid,
              propid: this.suggestchecked,
              execid: this.userid,
              visitupdate: 1,
              remarks: $('#propertyremarks').val(),
              stage: 'RSV',
              assignid: this.closedExecutiveId,
              feedbackid: this.feedbackId,
            };

            // parameters & API Submissions for the property sitevisit update

            this.mandateService.addpropertyvisitupdate(visitedparam2).subscribe(
              (success) => {
                this.status = success['status'];
                if (this.status == 'True') {
                  const formData = new FormData();
                  formData.append('PropID', propid);
                  formData.append('LeadID', this.leadid);
                  formData.append('ExecID', this.userid);
                  formData.append('assignID', this.closedExecutiveId);
                  for (var k = 0; k < this.closurefiles.length; k++) {
                    formData.append('file[]', this.closurefiles[k]);
                  }

                  this.mandateService.uploadFile(formData).subscribe(
                    (res) => {
                      if (res['status'] === 'True') {
                        var visiteddate = $('#RSVvisiteddate').val();
                        var visitedtime = $('#RSVvisitedtime').val();
                        var rsvfinalremarks = $('#propertyremarks').val();
                        this.autoremarks =
                          ' Changed the status to Deal Closing Request after Successfully completed the RSV';
                        var leadrsvparam = {
                          leadid: this.leadid,
                          closedate: visiteddate,
                          closetime: visitedtime,
                          leadstage: 'RSV',
                          stagestatus: '3',
                          textarearemarks: rsvfinalremarks,
                          userid: this.userid,
                          assignid: this.closedExecutiveId,
                          autoremarks: this.autoremarks,
                          property: propid,
                          feedbackid: this.feedbackId,
                        };

                        this.mandateService
                          .addleadhistory(leadrsvparam)
                          .subscribe(
                            (success) => {
                              this.status = success['status'];
                              if (this.status == 'True') {
                                var closedate = $('#closeddate').val();
                                var closetime = $('#closedtime').val();
                                var textarearemarks = $('#remarks-' + i).val();
                                var dateformatchange = new Date(
                                  closedate
                                ).toDateString();
                                var bhk = this.unitSelected.join(', ');
                                this.autoremarks =
                                  ' Send the Deal Closing Request for ' +
                                  propname +
                                  ' On ' +
                                  dateformatchange +
                                  ' ' +
                                  closetime;
                                var leadhistparam = {
                                  leadid: this.leadid,
                                  closedate: closedate,
                                  closetime: closetime,
                                  leadstage: closeLeadStage,
                                  stagestatus: '0',
                                  textarearemarks: textarearemarks,
                                  userid: this.userid,
                                  assignid: this.closedExecutiveId,
                                  property: propid,
                                  bhk: bhk,
                                  bhkunit: unitnumbers,
                                  dimension: dimensions,
                                  ratepersft: rpsft,
                                  autoremarks: this.autoremarks,
                                  feedbackid: this.feedbackId,
                                };
                                this.mandateService
                                  .addleadhistory(leadhistparam)
                                  .subscribe(
                                    (success) => {
                                      this.status = success['status'];
                                      this.showSpinner = false;
                                      if (this.status == 'True') {
                                        success['status'];
                                        Swal.fire({
                                          title:
                                            this.userid == 1
                                              ? 'Deal Closed Successfully'
                                              : 'Deal Closing Requested Successfully',
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
                                      } else if (
                                        this.status == 'Duplicate Request'
                                      ) {
                                        Swal.fire({
                                          title:
                                            'Already got the request for this same Unit number',
                                          icon: 'error',
                                          heightAuto: false,
                                          allowOutsideClick: false,
                                          confirmButtonText: 'OK!',
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
                      } else if (res['status'] === 'Duplicate Request') {
                        this.showSpinner = false;
                        Swal.fire({
                          title:
                            'Already found the same property and same unit Closing request',
                          icon: 'error',
                          heightAuto: false,
                          allowOutsideClick: false,
                          confirmButtonText: 'ok',
                        });
                      }
                    },
                    (err) => {
                      console.log(err);
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
      }
      // RSV DONE with Lead Closing

      // NEGOTIATION DONE with Lead Closing
      else if ($('#sectionselector').val() == 'Final Negotiation') {
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

        if ($('#selectedunits-' + i).val() == '') {
          Swal.fire({
            title: 'Units Not Selected',
            text: 'Select any Unit for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if (
          $('#unitnum-' + i).val() == '' ||
          $('#unitnum-' + i)
            .val()
            .match(/^\s+$/) !== null
        ) {
          $('#unitnum-' + i)
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Unit Number');
        } else if (
          $('#dimension-' + i).val() == '' ||
          $('#dimension-' + i)
            .val()
            .match(/^\s+$/) !== null
        ) {
          $('#unitnum-' + i).removeAttr('style');
          $('#dimension-' + i)
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Dimension');
        } else if (
          $('#ratepersquarfeet-' + i).val() == '' ||
          $('#ratepersquarfeet-' + i)
            .val()
            .match(/^\s+$/) !== null
        ) {
          $('#dimension-' + i).removeAttr('style');
          $('#ratepersquarfeet-' + i)
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Rate Per Squarefeet');
        } else if (
          $('#remarks-' + i).val() == '' ||
          $('#remarks-' + i)
            .val()
            .match(/^\s+$/) !== null
        ) {
          $('#ratepersquarfeet-' + i).removeAttr('style');
          $('#remarks-' + i)
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type some comments/remarks');
        } else if (
          $('#customFile' + i).val() == '' &&
          this.selectedFileName !== ' '
        ) {
          $('#remarks-' + i).removeAttr('style');
          Swal.fire({
            title: 'No Files Uploaded',
            text: 'Upload atleast one file for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
          // }else if ($('#visitupdate').val() == "") {
          //   Swal.fire({
          //     title: 'Action Not Took',
          //     text: 'Please select any acti ons',
          //     icon: 'error',
          //     heightAuto: false,
          //     confirmButtonText: 'OK'
          //   })
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
          $('#visitupdate').removeAttr('style');
          $('#propertyremarks').removeAttr('style');
          $('#unitnum-' + i).removeAttr('style');
          $('#dimension-' + i).removeAttr('style');
          $('#ratepersquarfeet-' + i).removeAttr('style');
          $('#remarks-' + i).removeAttr('style');

          var totalunitscount = this.unitSelected.length;

          var unitnumbers = $('#unitnum-' + i).val();
          var lastuninumber = unitnumbers.replace(/,\s*$/, '');
          var totalunitnumbers = lastuninumber.split(',').length;

          var dimensions = $('#dimension-' + i).val();
          var lastdimension = dimensions.replace(/,\s*$/, '');
          var totaldimensions = lastdimension.split(',').length;

          var rpsft = $('#ratepersquarfeet-' + i).val();
          var lastsqft = rpsft.replace(/,\s*$/, '');
          var totalrpsft = lastsqft.split(',').length;

          // Condition of selected only one unit or less than one & enetered more unit numbers
          if (totalunitscount <= 1 && totalunitnumbers > 1) {
            if (totalunitnumbers != totaldimensions) {
              if (totaldimensions == 1) {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimension Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimensions Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else if (totaldimensions != totalrpsft) {
              if (totalrpsft == 1) {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Price Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Prices Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else {
              var visitedparamnego = {
                leadid: this.leadid,
                propid: this.suggestchecked,
                execid: this.userid,
                visitupdate: 1,
                remarks: $('#propertyremarks').val(),
                stage: 'Final Negotiation',
                assignid: this.closedExecutiveId,
                feedbackid: this.feedbackId,
              };
              this.showSpinner = true;
              this.mandateService
                .addpropertyvisitupdate(visitedparamnego)
                .subscribe(
                  (success) => {
                    this.status = success['status'];
                    if (this.status == 'True') {
                      const formData = new FormData();
                      formData.append('PropID', propid);
                      formData.append('LeadID', this.leadid);
                      formData.append('ExecID', this.userid);
                      formData.append('assignID', this.closedExecutiveId);
                      for (var k = 0; k < this.closurefiles.length; k++) {
                        formData.append('file[]', this.closurefiles[k]);
                      }
                      this.mandateService.uploadFile(formData).subscribe(
                        (res) => {
                          if (res['status'] === 'True') {
                            var visiteddate = $('#negovisiteddate').val();
                            var visitedtime = $('#negovisitedtime').val();
                            var negofinalremarks = 'Final Negotiation Done';
                            this.autoremarks =
                              ' Changed the status to Deal Closing Request after Successfully completed the Final Negotiation';
                            var leadnegoparam = {
                              leadid: this.leadid,
                              closedate: visiteddate,
                              closetime: visitedtime,
                              leadstage: 'Final Negotiation',
                              stagestatus: '3',
                              textarearemarks: negofinalremarks,
                              userid: this.userid,
                              assignid: this.closedExecutiveId,
                              autoremarks: this.autoremarks,
                              property: propid,
                              feedbackid: this.feedbackId,
                            };

                            this.mandateService
                              .addleadhistory(leadnegoparam)
                              .subscribe(
                                (success) => {
                                  this.status = success['status'];
                                  if (this.status == 'True') {
                                    var closedate = $('#closeddate').val();
                                    var closetime = $('#closedtime').val();
                                    var textarearemarks = $(
                                      '#remarks-' + i
                                    ).val();
                                    var dateformatchange = new Date(
                                      closedate
                                    ).toDateString();
                                    var bhk = this.unitSelected.join(', ');
                                    this.autoremarks =
                                      ' Send the Deal Closing Request for ' +
                                      propname +
                                      ' On ' +
                                      dateformatchange +
                                      ' ' +
                                      closetime;
                                    var leadhistparam = {
                                      leadid: this.leadid,
                                      closedate: closedate,
                                      closetime: closetime,
                                      leadstage: closeLeadStage,
                                      stagestatus: '0',
                                      textarearemarks: textarearemarks,
                                      userid: this.userid,
                                      assignid: this.closedExecutiveId,
                                      property: propid,
                                      bhk: bhk,
                                      bhkunit: unitnumbers,
                                      dimension: dimensions,
                                      ratepersft: rpsft,
                                      autoremarks: this.autoremarks,
                                      feedbackid: this.feedbackId,
                                    };
                                    this.mandateService
                                      .addleadhistory(leadhistparam)
                                      .subscribe(
                                        (success) => {
                                          this.status = success['status'];
                                          this.showSpinner = false;
                                          if (this.status == 'True') {
                                            success['status'];
                                            Swal.fire({
                                              title:
                                                this.userid == 1
                                                  ? 'Deal Closed Successfully'
                                                  : 'Deal Closing Requested Successfully',
                                              icon: 'success',
                                              heightAuto: false,
                                              allowOutsideClick: false,
                                              confirmButtonText: 'OK!',
                                            }).then((result) => {
                                              if (result.value) {
                                                //      const currentParams = this.activeroute.snapshot.queryParams;
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
                                          } else if (
                                            this.status == 'Duplicate Request'
                                          ) {
                                            Swal.fire({
                                              title:
                                                'Already got the request for this same Unit number',
                                              icon: 'error',
                                              heightAuto: false,
                                              allowOutsideClick: false,
                                              confirmButtonText: 'OK!',
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
                          } else if (res['status'] === 'Duplicate Request') {
                            this.showSpinner = false;
                            Swal.fire({
                              title:
                                'Already found the same property and same unit Closing request',
                              icon: 'error',
                              heightAuto: false,
                              allowOutsideClick: false,
                              confirmButtonText: 'ok',
                            });
                          }
                        },
                        (err) => {
                          console.log(err);
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
          // Condition of selected unit more & entered less unit numbers
          else if (totalunitscount > totalunitnumbers) {
            if (totalunitnumbers == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Number',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Numbers',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#unitnum-' + i)
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Unit Number');
          }
          // Condition of selected unit less and not equal one & entered more unit numbers
          else if (totalunitscount < totalunitnumbers) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalunitnumbers +
                ' Unit Numbers Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less dimensions
          else if (totalunitscount > totaldimensions) {
            if (totaldimensions == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimension',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimensions',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#dimension-' + i)
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Dimension');
          }
          // Condition of selected unit less & entered more dimensions
          else if (totalunitscount < totaldimensions) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totaldimensions +
                ' Dimensions Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less ratepersqfeets
          else if (totalunitscount > totalrpsft) {
            if (totalrpsft == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Price Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Prices Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#ratepersquarfeet-' + i)
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Rate Per Squarefeet');
          }
          // Condition of selected unit less & entered more ratepersqfeets
          else if (totalunitscount < totalrpsft) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalrpsft +
                ' Prices Found',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          } else {
            var visitedparamnego2 = {
              leadid: this.leadid,
              propid: this.suggestchecked,
              execid: this.userid,
              visitupdate: 1,
              remarks: $('#propertyremarks').val(),
              stage: 'Final Negotiation',
              assignid: this.closedExecutiveId,
              feedbackid: this.feedbackId,
            };
            this.showSpinner = true;
            this.mandateService
              .addpropertyvisitupdate(visitedparamnego2)
              .subscribe(
                (success) => {
                  this.status = success['status'];
                  if (this.status == 'True') {
                    const formData = new FormData();
                    formData.append('PropID', propid);
                    formData.append('LeadID', this.leadid);
                    formData.append('ExecID', this.userid);
                    formData.append('assignID', this.closedExecutiveId);
                    for (var k = 0; k < this.closurefiles.length; k++) {
                      formData.append('file[]', this.closurefiles[k]);
                    }

                    this.mandateService.uploadFile(formData).subscribe(
                      (res) => {
                        if (res['status'] === 'True') {
                          var visiteddate = $('#negovisiteddate').val();
                          var visitedtime = $('#negovisitedtime').val();
                          var negofinalremarks = 'Final Negotiation Done';
                          this.autoremarks =
                            ' Changed the status to Deal Closing Request after Successfully completed the Final Negotiation';
                          var leadnegoparam = {
                            leadid: this.leadid,
                            closedate: visiteddate,
                            closetime: visitedtime,
                            leadstage: 'Final Negotiation',
                            stagestatus: '3',
                            textarearemarks: negofinalremarks,
                            userid: this.userid,
                            assignid: this.closedExecutiveId,
                            autoremarks: this.autoremarks,
                            property: propid,
                            feedbackid: this.feedbackId,
                          };

                          this.mandateService
                            .addleadhistory(leadnegoparam)
                            .subscribe(
                              (success) => {
                                this.status = success['status'];
                                if (this.status == 'True') {
                                  var closedate = $('#closeddate').val();
                                  var closetime = $('#closedtime').val();
                                  var textarearemarks = $(
                                    '#remarks-' + i
                                  ).val();
                                  var dateformatchange = new Date(
                                    closedate
                                  ).toDateString();
                                  var bhk = this.unitSelected.join(', ');
                                  this.autoremarks =
                                    ' Send the Deal Closing Request for ' +
                                    propname +
                                    ' On ' +
                                    dateformatchange +
                                    ' ' +
                                    closetime;
                                  var leadhistparam = {
                                    leadid: this.leadid,
                                    closedate: closedate,
                                    closetime: closetime,
                                    leadstage: closeLeadStage,
                                    stagestatus: '0',
                                    textarearemarks: textarearemarks,
                                    userid: this.userid,
                                    assignid: this.closedExecutiveId,
                                    property: propid,
                                    bhk: bhk,
                                    bhkunit: unitnumbers,
                                    dimension: dimensions,
                                    ratepersft: rpsft,
                                    autoremarks: this.autoremarks,
                                    feedbackid: this.feedbackId,
                                  };
                                  this.mandateService
                                    .addleadhistory(leadhistparam)
                                    .subscribe(
                                      (success) => {
                                        this.status = success['status'];
                                        this.showSpinner = false;
                                        if (this.status == 'True') {
                                          success['status'];
                                          Swal.fire({
                                            title:
                                              this.userid == 1
                                                ? 'Deal Closed Successfully'
                                                : 'Deal Closing Requested Successfully',
                                            icon: 'success',
                                            heightAuto: false,
                                            allowOutsideClick: false,
                                            confirmButtonText: 'OK!',
                                          }).then((result) => {
                                            if (result.value) {
                                              //      const currentParams = this.activeroute.snapshot.queryParams;
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
                                        } else if (
                                          this.status == 'Duplicate Request'
                                        ) {
                                          Swal.fire({
                                            title:
                                              'Already got the request for this same Unit number',
                                            icon: 'error',
                                            allowOutsideClick: false,
                                            heightAuto: false,
                                            confirmButtonText: 'OK!',
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
                        } else if (res['status'] === 'Duplicate Request') {
                          this.showSpinner = false;
                          Swal.fire({
                            title:
                              'Already found the same property and same unit Closing request',
                            icon: 'error',
                            allowOutsideClick: false,
                            heightAuto: false,
                            confirmButtonText: 'ok',
                          });
                        }
                      },
                      (err) => {
                        console.log(err);
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
      }
      // NEGOTIATION DONE with Lead Closing
      // Direct Lead Closing
      else {
        if ($('#closeddate').val() == '') {
          $('#closeddate')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select closed Date');
        } else {
          $('#closeddate').removeAttr('style');
        }
        if ($('#closedtime').val() == '') {
          $('#closedtime')
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please Select closed Time');
        } else {
          $('#closedtime').removeAttr('style');
        }
        if ($('#selectedunits-' + i).val() == '') {
          Swal.fire({
            title: 'Units Not Selected',
            text: 'Select any Unit for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else if (
          $('#unitnum-' + i).val() == '' ||
          $('#unitnum-' + i)
            .val()
            .match(/^\s+$/) !== null
        ) {
          $('#unitnum-' + i)
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Unit Number');
        } else if (
          $('#dimension-' + i).val() == '' ||
          $('#dimension-' + i)
            .val()
            .match(/^\s+$/) !== null
        ) {
          $('#unitnum-' + i).removeAttr('style');
          $('#dimension-' + i)
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Dimension');
        } else if (
          $('#ratepersquarfeet-' + i).val() == '' ||
          $('#ratepersquarfeet-' + i)
            .val()
            .match(/^\s+$/) !== null
        ) {
          $('#dimension-' + i).removeAttr('style');
          $('#ratepersquarfeet-' + i)
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type the Rate Per Squarefeet');
        } else if (
          $('#remarks-' + i).val() == '' ||
          $('#remarks-' + i)
            .val()
            .match(/^\s+$/) !== null
        ) {
          $('#ratepersquarfeet-' + i).removeAttr('style');
          $('#remarks-' + i)
            .focus()
            .css('border-color', 'red')
            .attr('placeholder', 'Please type some comments/remarks');
        } else if ($('#customFile' + i).val() == '') {
          $('#remarks-' + i).removeAttr('style');
          Swal.fire({
            title: 'No Files Uploaded',
            text: 'Upload atleast one file for ' + propname,
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'ok',
          });
        } else {
          $('#unitnum-' + i).removeAttr('style');
          $('#dimension-' + i).removeAttr('style');
          $('#ratepersquarfeet-' + i).removeAttr('style');
          $('#remarks-' + i).removeAttr('style');

          var unitsselected = $('#selectedunits-' + i).val();
          // var lastunit = unitsselected.replace(/,\s*$/, "");
          var totalunitscount = this.unitSelected.length;

          var unitnumbers = $('#unitnum-' + i).val();
          var lastuninumber = unitnumbers.replace(/,\s*$/, '');
          var totalunitnumbers = lastuninumber.split(',').length;

          var dimensions = $('#dimension-' + i).val();
          var lastdimension = dimensions.replace(/,\s*$/, '');
          var totaldimensions = lastdimension.split(',').length;

          var rpsft = $('#ratepersquarfeet-' + i).val();
          var lastsqft = rpsft.replace(/,\s*$/, '');
          var totalrpsft = lastsqft.split(',').length;

          // Condition of selected only one unit or less than one & enetered more unit numbers
          if (totalunitscount <= 1 && totalunitnumbers > 1) {
            if (totalunitnumbers != totaldimensions) {
              if (totaldimensions == 1) {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimension Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totalunitnumbers +
                    ' Unit Numbers & ' +
                    totaldimensions +
                    ' Dimensions Detected',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else if (totaldimensions != totalrpsft) {
              if (totalrpsft == 1) {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Price Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              } else {
                Swal.fire({
                  title:
                    totaldimensions +
                    ' Dimensions & ' +
                    totalrpsft +
                    ' Prices Found',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'ok',
                });
              }
            } else {
              const formData = new FormData();
              formData.append('PropID', propid);
              formData.append('LeadID', this.leadid);
              formData.append('ExecID', this.userid);
              formData.append('assignID', this.closedExecutiveId);
              for (var k = 0; k < this.closurefiles.length; k++) {
                formData.append('file[]', this.closurefiles[k]);
              }
              this.mandateService.uploadFile(formData).subscribe(
                (res) => {
                  if (res['status'] === 'Duplicate Request') {
                    this.presentLoading();
                    Swal.fire({
                      title:
                        'Already found the same property and same unit Closing request',
                      icon: 'error',
                      heightAuto: false,
                      confirmButtonText: 'ok',
                    });
                  }
                },
                (err) => {
                  console.log(err);
                }
              );
              const inputDate = new Date($('#closeddate').val());
              const closedate =
                inputDate.getFullYear() +
                '-' +
                (inputDate.getMonth() + 1) +
                '-' +
                inputDate.getDate();
              var closetime = $('#closedtime').val();
              var textarearemarks = $('#remarks-' + i).val();
              this.autoremarks = ' Send the Deal Closing Request successfully.';
              var bhk = this.unitSelected.join(', ');
              var leadhistparam1 = {
                leadid: this.leadid,
                closedate: closedate,
                closetime: closetime,
                leadstage: closeLeadStage,
                stagestatus: '0',
                textarearemarks: textarearemarks,
                userid: this.userid,
                assignid: this.closedExecutiveId,
                property: propid,
                bhk: bhk,
                bhkunit: unitnumbers,
                dimension: dimensions,
                ratepersft: rpsft,
                autoremarks: this.autoremarks,
                feedbackid: this.feedbackId,
              };
              this.showSpinner = true;
              this.mandateService.addleadhistory(leadhistparam1).subscribe(
                (success) => {
                  this.status = success['status'];
                  this.showSpinner = false;
                  if (this.status == 'True') {
                    success['status'];
                    Swal.fire({
                      title:
                        this.userid == 1
                          ? 'Deal closed Successfuly'
                          : 'Deal Closing Requested Successfuly',
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
                  } else if (this.status == 'Duplicate Request') {
                    Swal.fire({
                      title:
                        'Already got the request for this same Unit number',
                      icon: 'error',
                      heightAuto: false,
                      allowOutsideClick: false,
                      confirmButtonText: 'OK!',
                    });
                  }
                },
                (err) => {
                  console.log('Failed to Update');
                }
              );
            }
          }
          // Condition of selected unit more & entered less unit numbers
          else if (totalunitscount > totalunitnumbers) {
            if (totalunitnumbers == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Number',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalunitnumbers +
                  ' Unit Numbers',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#unitnum-' + i)
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Unit Number');
          }
          // Condition of selected unit less and not equal one & entered more unit numbers
          else if (totalunitscount < totalunitnumbers) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalunitnumbers +
                ' Unit Numbers Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less dimensions
          else if (totalunitscount > totaldimensions) {
            if (totaldimensions == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimension',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totaldimensions +
                  ' Dimensions',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#dimension-' + i)
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Dimension');
          }
          // Condition of selected unit less & entered more dimensions
          else if (totalunitscount < totaldimensions) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totaldimensions +
                ' Dimensions Detected',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          }
          // Condition of selected unit more & entered less ratepersqfeets
          else if (totalunitscount > totalrpsft) {
            if (totalrpsft == 1) {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Price Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            } else {
              Swal.fire({
                title:
                  totalunitscount +
                  ' Units Selected & Found only ' +
                  totalrpsft +
                  ' Prices Found',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              });
            }
            $('#ratepersquarfeet-' + i)
              .focus()
              .css('border-color', 'red')
              .attr('placeholder', 'Please type the Rate Per Squarefeet');
          }
          // Condition of selected unit less & entered more ratepersqfeets
          else if (totalunitscount < totalrpsft) {
            Swal.fire({
              title:
                totalunitscount +
                ' Units Selected & ' +
                totalrpsft +
                ' Prices Found',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'ok',
            });
          } else {
            const formData = new FormData();
            formData.append('PropID', propid);
            formData.append('LeadID', this.leadid);
            formData.append('ExecID', this.userid);
            formData.append('assignID', this.closedExecutiveId);
            for (var k = 0; k < this.closurefiles.length; k++) {
              formData.append('file[]', this.closurefiles[k]);
            }
            this.showSpinner = true;
            this.mandateService.uploadFile(formData).subscribe(
              (res) => {
                if (res['status'] === 'True') {
                  var closedate = $('#closeddate').val();
                  var closetime = $('#closedtime').val();
                  var textarearemarks = $('#remarks-' + i).val();
                  this.autoremarks =
                    ' Send the Deal Closing Request successfully.';
                  var bhk = this.unitSelected.join(', ');
                  var leadhistparam = {
                    leadid: this.leadid,
                    closedate: closedate,
                    closetime: closetime,
                    leadstage: 'Deal Closing Request',
                    stagestatus: '0',
                    textarearemarks: textarearemarks,
                    userid: this.userid,
                    assignid: this.closedExecutiveId,
                    property: propid,
                    bhk: bhk,
                    bhkunit: unitnumbers,
                    dimension: dimensions,
                    ratepersft: rpsft,
                    autoremarks: this.autoremarks,
                    feedbackid: this.feedbackId,
                  };

                  this.mandateService.addleadhistory(leadhistparam).subscribe(
                    (success) => {
                      this.status = success['status'];
                      this.showSpinner = false;
                      if (this.status == 'True') {
                        success['status'];
                        Swal.fire({
                          title: 'Deal Closing Requested Successfully',
                          icon: 'success',
                          heightAuto: false,
                          confirmButtonText: 'OK!',
                        }).then((result) => {
                          if (result.value) {
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
                      } else if (this.status == 'Duplicate Request') {
                        Swal.fire({
                          title:
                            'Already got the request for this same Unit number',
                          icon: 'error',
                          heightAuto: false,
                          confirmButtonText: 'OK!',
                        });
                      }
                    },
                    (err) => {
                      console.log('Failed to Update');
                    }
                  );
                } else if (res['status'] === 'False') {
                  this.showSpinner = false;
                  Swal.fire({
                    title: 'Some error Occured in Image upload',
                    icon: 'error',
                    heightAuto: false,
                    confirmButtonText: 'ok',
                  });
                }
              },
              (err) => {
                console.log(err);
              }
            );
          }
        }
      }
      // Direct Lead Closing
    }
  }

  // to remove selected image
  removeImage(i) {
    this.uploads.splice(i, 1);
    this.closurefiles.splice(i, 1);
    if (this.uploads.length == 0) {
      $('#customFile' + i).val('');
      $('.file-label-' + i).html('Choose file ');
      this.selectedFileName = '';
    } else {
    }
  }

  @ViewChild('popover') popover: IonPopover;
  closePopover() {
    if (this.popover) {
      this.popover.dismiss();
    }
  }

  // to display custom error message
  setCustomValidity(value, i, event) {
    const input = event.target;
    const numericPattern = /^\d+(,\d+)*$/;
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const timePattern = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;

    if (value == 'dimension') {
      if (!numericPattern.test($('#dimension-' + i).val())) {
        input.setCustomValidity('Accept only numeric value');
      } else {
        input.setCustomValidity('');
      }
    }
    if (value == 'rate') {
      if (!numericPattern.test($('#ratepersquarfeet-' + i).val())) {
        input.setCustomValidity('Accept only numeric value');
      } else {
        input.setCustomValidity('');
      }
    }

    if (value == 'date') {
      if (!datePattern.test(this.closeddate)) {
        input.setCustomValidity(
          'Please select a date in the format YYYY-MM-DD (e.g., 2021-05-26)'
        );
      } else {
        input.setCustomValidity('');
      }
    }

    if (value == 'time') {
      if (!timePattern.test(this.closedtime)) {
        input.setCustomValidity(
          'Please enter time in the formate of HH:mm a (ex: 15:30)'
        );
      } else {
        input.setCustomValidity('');
      }
    }
  }

  // To reset all fields in the form
  resetAll() {
    this.closeddate = '';
    this.closedtime = '';
    this.unitSelected = [];
    this.closurefiles = [];
    this.isSelect_1_BHK = false;
    this.isSelect_2_BHK = false;
    this.isSelect_3_BHK = false;
    this.isSelect_4_BHK = false;
    this.isSelect_5_BHK = false;
    this.uploads = [];
    $('#propertyremarks').val(' ');
  }

  // TO DISPLAY TIME IN THE FORMAT OF 01:34 PM
  onTimeChange(event: CustomEvent) {
    const parsedTime = new Date(event.detail.value);
    const hours = parsedTime.getHours() % 12 || 12; // Get hours in 12-hour format
    const minutes = parsedTime.getMinutes().toString().padStart(2, '0'); // Ensure two digits for minutes
    const ampm = parsedTime.getHours() >= 12 ? 'PM' : 'AM'; // Determine AM/PM
    this.closedtime = `${hours}:${minutes} ${ampm}`;
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

  timeError: boolean = false;
  validateTime(): void {
    if (this.closedtime) {
      const [time, modifier] = this.closedtime.split(' ');
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
      this.closedtime = '';
      $('#closedtime').val('');
    }
  }

  ngOnDestroy() {
    this.closeAlert();
  }

  closeAlert() {
    Swal.close();
  }

  csClosingrequest() {
    let propid = this.selectedSuggestedProp.propid;
    let propname = this.selectedSuggestedProp.name;
    let closeLeadStage = 'Deal Closing Pending';

    if ($('#sectionselector').val() == 'USV') {
      if ($('#USVvisiteddate').val().trim() == '') {
        $('#USVvisiteddate')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select One Date');
        return;
      }

      if ($('#USVvisitedtime').val().trim() == '') {
        $('#USVvisitedtime')
          .focus()
          .addClass('border_colorRed')
          .attr('placeholder', 'Please Select One Date');
        return;
      }

      if ($('#propertyremarks').val().trim() == '') {
        Swal.fire({
          title: 'Please add some remarks about the Sitevisit',
          icon: 'warning',
          heightAuto: false,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        var visitparam = {
          leadid: this.leadid,
          propid: propid,
          execid: this.userid,
          visitupdate: 1,
          remarks: $('#propertyremarks').val(),
          stage: 'USV',
          assignid: this.closedExecutiveId,
          feedbackid: this.feedbackId,
        };

        this.mandateService.addpropertyvisitupdate(visitparam).subscribe(
          (success) => {
            if (success['status'] == 'True') {
              var visiteddate = $('#USVvisiteddate').val();
              var visitedtime = $('#USVvisitedtime').val();
              var usvfinalremarks = 'USV Done';
              this.autoremarks =
                ' Changed the status to Deal Closing Pending after Successfully completed the USV';
              var leadusvparam = {
                leadid: this.leadid,
                closedate: visiteddate,
                closetime: visitedtime,
                leadstage: 'USV',
                stagestatus: '3',
                textarearemarks: usvfinalremarks,
                userid: this.userid,
                assignid: this.closedExecutiveId,
                autoremarks: this.autoremarks,
                property: propid,
                feedbackid: this.feedbackId,
              };
              this.mandateService
                .addleadhistory(leadusvparam)
                .subscribe((success) => {
                  if (success['status'] == 'True') {
                    var closedate = $('#closeddate').val();
                    var closetime = $('#closedtime').val();
                    var textarearemarks = `${this.getselectedLeadExec.customer_assign_name} sent a Deal Closing Request for ${this.getselectedLeadExec.accompany}`;
                    var dateformatchange = new Date(closedate).toDateString();

                    this.autoremarks =
                      ' Send the Deal Closing Pending for ' +
                      propname +
                      ' On ' +
                      dateformatchange +
                      ' ' +
                      closetime;
                    var leadhistparam = {
                      leadid: this.leadid,
                      closedate: closedate,
                      closetime: closetime,
                      leadstage: closeLeadStage,
                      stagestatus: '0',
                      textarearemarks: textarearemarks,
                      userid: this.userid,
                      assignid: this.closedExecutiveId,
                      property: propid,
                      bhk: '',
                      bhkunit: '',
                      dimension: '',
                      ratepersft: '',
                      autoremarks: this.autoremarks,
                      feedbackid: this.feedbackId,
                    };

                    this.mandateService
                      .addleadhistory(leadhistparam)
                      .subscribe((success) => {
                        if (success['status'] == 'True') {
                          this.showSpinner = false;
                          Swal.fire({
                            title: 'Deal Closing Pending Updated Successfully',
                            icon: 'success',
                            heightAuto: false,
                            timer: 2000,
                            showConfirmButton: false,
                          }).then(() => {
                            // let currentUrl = this.router.url;
                            // this.router
                            //   .navigateByUrl('/', { skipLocationChange: true })
                            //   .then(() => {
                            //     this.router.navigate([currentUrl]);
                            //   });
                            location.reload();
                          });
                        } else if (success['status'] == 'Duplicate Request') {
                          this.showSpinner = false;
                          Swal.fire({
                            title:
                              'Already got the request for this same Unit number',
                            icon: 'error',
                            heightAuto: false,
                            timer: 2000,
                            showConfirmButton: false,
                          });
                        }
                      });
                  }
                });
            }
          },
          (err) => {
            console.log('Failed to Update');
          }
        );
      }
    } else if ($('#sectionselector').val() == 'RSV') {
      if ($('#propertyremarks').val().trim() == '') {
        Swal.fire({
          title: 'Please add some remarks about the Sitevisit',
          icon: 'warning',
          heightAuto: false,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        if ($('#propertyremarks').val().trim() == '') {
          $('#propertyremarks')
            .focus()
            .addClass('border_colorRed')
            .attr('placeholder', 'Please add some remarks about the Sitevisit');
          return;
        }

        if ($('#RSVvisiteddate').val().trim() == '') {
          $('#RSVvisiteddate')
            .focus()
            .addClass('border_colorRed')
            .attr('placeholder', 'Please Select One Date');
          return;
        }

        if ($('#RSVvisitedtime').val().trim() == '') {
          $('#RSVvisitedtime')
            .focus()
            .addClass('border_colorRed')
            .attr('placeholder', 'Please Select One Date');
          return;
        }
        var visitedparam = {
          leadid: this.leadid,
          propid: propid,
          execid: this.userid,
          visitupdate: 1,
          remarks: $('#propertyremarks').val(),
          stage: 'RSV',
          assignid: this.closedExecutiveId,
          feedbackid: this.feedbackId,
        };
        this.mandateService
          .addpropertyvisitupdate(visitedparam)
          .subscribe((success) => {
            if (success['status'] == 'True') {
              var visiteddate = $('#RSVvisiteddate').val();
              var visitedtime = $('#RSVvisitedtime').val();
              var rsvfinalremarks = $('#propertyremarks').val();
              this.autoremarks =
                ' Changed the status to Deal Closing Pending after Successfully completed the RSV';
              var leadrsvparam = {
                leadid: this.leadid,
                closedate: visiteddate,
                closetime: visitedtime,
                leadstage: 'RSV',
                stagestatus: '3',
                textarearemarks: rsvfinalremarks,
                userid: this.userid,
                assignid: this.closedExecutiveId,
                autoremarks: this.autoremarks,
                property: propid,
                feedbackid: this.feedbackId,
              };

              this.mandateService
                .addleadhistory(leadrsvparam)
                .subscribe((success) => {
                  if (success['status'] == 'True') {
                    var closedate = $('#closeddate').val();
                    var closetime = $('#closedtime').val();
                    var textarearemarks = '';
                    var dateformatchange = new Date(closedate).toDateString();

                    this.autoremarks =
                      ' Send the Deal Closing Pending for ' +
                      propname +
                      ' On ' +
                      dateformatchange +
                      ' ' +
                      closetime;
                    var leadhistparam = {
                      leadid: this.leadid,
                      closedate: closedate,
                      closetime: closetime,
                      leadstage: closeLeadStage,
                      stagestatus: '0',
                      textarearemarks: textarearemarks,
                      userid: this.userid,
                      assignid: this.closedExecutiveId,
                      property: propid,
                      bhk: '',
                      bhkunit: '',
                      dimension: '',
                      ratepersft: '',
                      autoremarks: this.autoremarks,
                      feedbackid: this.feedbackId,
                    };
                    this.mandateService
                      .addleadhistory(leadhistparam)
                      .subscribe((success) => {
                        if (success['status'] == 'True') {
                          this.showSpinner = false;
                          Swal.fire({
                            title: 'Deal Closing Pending Updated Successfully',
                            icon: 'success',
                            heightAuto: false,
                            timer: 2000,
                            showConfirmButton: false,
                          }).then(() => {
                            location.reload();
                          });
                        } else if (success['status'] == 'Duplicate Request') {
                          this.showSpinner = false;
                          Swal.fire({
                            title:
                              'Already got the request for this same Unit number',
                            icon: 'error',
                            heightAuto: false,
                            timer: 2000,
                            showConfirmButton: false,
                          }).then(() => {
                            location.reload();
                          });
                        }
                      });
                  }
                });
            }
          });
      }
    } else if ($('#sectionselector').val() == 'Final Negotiation') {
      if ($('#propertyremarks').val().trim() == '') {
        Swal.fire({
          title: 'Please add some remarks about the Sitevisit',
          icon: 'warning',
          heightAuto: false,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        if ($('#propertyremarks').val().trim() == '') {
          $('#propertyremarks')
            .focus()
            .addClass('border_colorRed')
            .attr('placeholder', 'Please add some remarks about the Sitevisit');
          return;
        }

        if ($('#negovisiteddate').val().trim() == '') {
          $('#negovisiteddate')
            .focus()
            .addClass('border_colorRed')
            .attr('placeholder', 'Please Select One Date');
          return;
        }

        if ($('#negovisitedtime').val().trim() == '') {
          $('#negovisitedtime')
            .focus()
            .addClass('border_colorRed')
            .attr('placeholder', 'Please Select One Date');
          return;
        }

        var visitedparamnego1 = {
          leadid: this.leadid,
          propid: propid,
          execid: this.userid,
          visitupdate: 1,
          remarks: $('#propertyremarks').val(),
          stage: 'Final Negotiation',
          assignid: this.closedExecutiveId,
          feedbackid: this.feedbackId,
        };
        this.mandateService
          .addpropertyvisitupdate(visitedparamnego1)
          .subscribe((success) => {
            if (success['status'] == 'True') {
              var visiteddate = $('#negovisiteddate').val();
              var visitedtime = $('#negovisitedtime').val();
              var negofinalremarks = 'Final Negotiation Done';
              this.autoremarks =
                ' Changed the status to Deal Closing Pending after Successfully completed the Final Negotiation';
              var leadnegoparam = {
                leadid: this.leadid,
                closedate: visiteddate,
                closetime: visitedtime,
                leadstage: 'Final Negotiation',
                stagestatus: '3',
                textarearemarks: negofinalremarks,
                userid: this.userid,
                assignid: this.closedExecutiveId,
                autoremarks: this.autoremarks,
                property: propid,
                feedbackid: this.feedbackId,
              };
              this.mandateService
                .addleadhistory(leadnegoparam)
                .subscribe((success) => {
                  if (success['status'] == 'True') {
                    var closedate = $('#closeddate').val();
                    var closetime = $('#closedtime').val();
                    var textarearemarks = '';
                    var dateformatchange = new Date(closedate).toDateString();

                    this.autoremarks =
                      ' Send the Deal Closing Pending for ' +
                      propname +
                      ' On ' +
                      dateformatchange +
                      ' ' +
                      closetime;
                    var leadhistparam = {
                      leadid: this.leadid,
                      closedate: closedate,
                      closetime: closetime,
                      leadstage: closeLeadStage,
                      stagestatus: '0',
                      textarearemarks: textarearemarks,
                      userid: this.userid,
                      assignid: this.closedExecutiveId,
                      property: propid,
                      bhk: '',
                      bhkunit: '',
                      dimension: '',
                      ratepersft: '',
                      autoremarks: this.autoremarks,
                      feedbackid: this.feedbackId,
                    };
                    this.mandateService
                      .addleadhistory(leadhistparam)
                      .subscribe((success) => {
                        if (success['status'] == 'True') {
                          Swal.fire({
                            title: 'Deal Closing Pending Updated Successfully',
                            icon: 'success',
                            heightAuto: false,
                            timer: 2000,
                            showConfirmButton: false,
                          }).then(() => {
                            location.reload();
                          });
                        } else if (this.status == 'Duplicate Request') {
                          this.showSpinner = false;
                          Swal.fire({
                            title:
                              'Already got the request for this same Unit number',
                            icon: 'error',
                            heightAuto: false,
                            timer: 2000,
                            showConfirmButton: false,
                          });
                        }
                      });
                  }
                });
            }
          });
      }
    } else {
      var closedate = $('#closeddate').val();
      var closetime = $('#closedtime').val();
      var textarearemarks = '';
      this.autoremarks = ' Send the Deal Closing Pending successfully.';
      var leadhistparam = {
        leadid: this.leadid,
        closedate: closedate,
        closetime: closetime,
        leadstage: closeLeadStage,
        stagestatus: '0',
        textarearemarks: textarearemarks,
        userid: this.userid,
        assignid: this.closedExecutiveId,
        property: propid,
        bhk: '',
        bhkunit: '',
        dimension: '',
        ratepersft: '',
        autoremarks: this.autoremarks,
        feedbackid: this.feedbackId,
      };
      this.mandateService.addleadhistory(leadhistparam).subscribe((success) => {
        if (success['status'] == 'True') {
          Swal.fire({
            title: 'Deal Closing Pending Updated Successfully',
            icon: 'success',
            heightAuto: false,
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            location.reload();
          });
        } else if (this.status == 'Duplicate Request') {
          this.showSpinner = false;
          Swal.fire({
            title: 'Already got the request for this same Unit number',
            icon: 'error',
            heightAuto: false,
            timer: 2000,
            showConfirmButton: false,
          });
        }
      });
    }
  }
}

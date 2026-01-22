import {
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MandateService } from 'src/app/mandate-service.service';
import Swal from 'sweetalert2';
import { AnimationController, IonModal } from '@ionic/angular';
import { EchoService } from 'src/app/echo.service';
import { SharedService } from 'src/app/shared.service';
import { RetailServiceService } from 'src/app/retail-service.service';
import { NgModel } from '@angular/forms';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-on-call-lead-update',
  templateUrl: 'on-call-lead-update.component.html',
  styleUrls: ['on-call-lead-update.component.scss'],
})
export class OnCallLeadUpdateComponent implements OnInit {
  filteredParams = {
    leadTabData: '',
    leadId: '',
    execid: '',
    headerType: '',
    feedbackId: '0',
    htype: '',
    callStatus: '',
    isCallHistory: '',
  };

  selectedExecId;
  selectedSuggestedProp: any;
  activestagestatus: any;
  isShowStages: boolean;
  USV: boolean;
  isAdmin: any;
  showRejectionForm: boolean = false;
  RSV: boolean;
  Negotiation: boolean;
  followup: boolean;
  junkmove: boolean;
  SV: boolean;
  leadclose: boolean;
  usvform: boolean;
  svform: boolean;
  finalnegoform: boolean;
  leadMoveJunkExec: boolean;
  roleid: string;
  currentstage: string;
  followform: any;
  rsvform: any;
  leadclosedform: any;
  junkform: any;
  assignedrm: any;
  requestedunits: any;
  userid: string;
  closurefiles: any[] = [];
  uploads: any;
  remark: any;
  showSpinner: boolean;
  autoremarks: string;
  leadtrack: any;
  username: string;
  callStatus: any;
  liveCallData: any;
  leadsDetailsInfo: any;
  @ViewChild('remarkInput1') remarkInput1: NgModel;
  isAfterOneminute;
  isAfterTwominute = false;
  direction = '';

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private _mandateService: MandateService,
    private animationCtrl: AnimationController,
    private _echoService: EchoService,
    private _sharedservice: SharedService,
    private _location: Location,
    private _retailservice: RetailServiceService
  ) {}

  subscription: Subscription;
  echoListenerAdded = false;
  isRM = false;
  isUpdateStatus = false;
  isCallHistory: any = '';
  execid = '';

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params) => {
      this.execid = params['execid'];
      if (params['callStatus']) {
        this.callStatus = params['callStatus'];
      } else {
        this.callStatus = '';
      }
      this.selectedExecId = params['execid'];

      if (params['direction']) {
        this.direction = params['direction'];
      } else {
        this.direction = '';
      }
      this.isUpdateStatus = false;
      this.isRM =
        localStorage.getItem('Role') == '50001' ||
        localStorage.getItem('Role') == '50002' ||
        localStorage.getItem('Role') == '50009' ||
        localStorage.getItem('Role') == '50010';
      this.showSpinner1 = true;
      this.roleid = localStorage.getItem('Role');
      this.userid = localStorage.getItem('UserId');
      this.username = localStorage.getItem('Name');
      this.isCallHistory = params['isCallHistory'];
      this.isAdmin = localStorage.getItem('Role') === '1';
      this.getQueryParams();

      this.dropdownSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'name',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        enableCheckAll: false,
        allowSearchFilter: true,
      };
      setTimeout(() => {
        this.getcustomerview();
        this.getLiveCallsData();
      }, 100);
    });

    // if (!this.echoListenerAdded) {
    this.showSpinner1 = true;
    this.echoListenerAdded = true;

    this._echoService.listenToChannel(
      'database-changes',
      '.DatabaseNotification',
      (message) => {
        if (localStorage.getItem('UserId') == message.Executive) {
          this.callStatus = message.Call_status_new;

          if (
            message.Call_status_new == 'BUSY' ||
            message.Call_status_new == 'Executive Busy'
          ) {
            this.updateStatus(message.Call_status_new);
          }

          if (message.Call_status_new != 'Call Disconnected') {
            this._sharedservice.isMenuOpen = false;
          } else {
            this.stopTimer();
            this._sharedservice.isMenuOpen = true;
          }

          if (message.Call_status_new == 'Call Disconnected') {
            this.timer = '00h:00m:00s';
            this.stopTimer();
            setTimeout(() => {
              this.router.navigate([], {
                queryParams: { callStatus: null },
                queryParamsHandling: 'merge',
              });
            }, 1000);
          }

          // if (
          //   message.Call_status_new == 'Answered' ||
          //   message.Call_status_new == 'Call Disconnected'
          // ) {
          //   this.showSpinner1 = false;
          // } else {
          //   this.showSpinner1 = true;
          // }
          // setTimeout(() => {
          // if (localStorage.getItem('UserId') == message.Executive) {
          this.getLiveCallsData();

          // }
          // }, 100);
        }
      }
    );
    // }
  }

  showSpinner1;
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.echoListenerAdded = false;
    // this._echoService.stopListening(
    //   'database-changes',
    //   '.DatabaseNotification'
    // );
    location.reload();
  }
  // getLiveCallsData() {
  //   this._sharedservice
  //     .fetchLiveCall(localStorage.getItem('UserId'))
  //     .subscribe({
  //       next: (resp) => {
  //         console.log(resp['status']);
  //         this.showSpinner1 = false;
  //         if (resp['status'] == 'success') {
  //           this._sharedservice.isMenuOpen = false;
  //           this.liveCallData = resp.success[0];
  //           this.callStatus = resp['success'][0].dialstatus;
  //           console.log(this.callStatus);
  //           // const now = new Date(resp.success[0].starttime);
  //           // this.startTimer(now);

  //           this.startTimer(resp.success[0].starttime);
  //         } else if (resp['status'] == 'False') {
  //           this._sharedservice.isMenuOpen = true;
  //           this.stopTimer();
  //         }
  //       },
  //       error: () => {
  //         this.showSpinner1 = false;
  //         this.showSpinner = false;
  //       },
  //     });
  // }

  getLiveCallsData() {
    this._sharedservice
      .fetchLiveCall(localStorage.getItem('UserId'))
      .subscribe({
        next: (resp) => {
          this.showSpinner1 = false;
          if (resp['status'] == 'success') {
            this._sharedservice.isMenuOpen = false;
            this.liveCallData = resp.success[0];
            this.callStatus = resp['success'][0].dialstatus;
            this.startTimer(resp.success[0].starttime);
          } else if (resp['status'] == 'False') {
            this._sharedservice.isMenuOpen = true;
            this.stopTimer();
          }
        },
        error: () => {
          this.showSpinner1 = false;
          this.showSpinner = false;
        },
      });
  }

  public getExstendsion(image) {
    if (
      image.endsWith('jpg') ||
      image.endsWith('jpeg') ||
      image.endsWith('png')
    ) {
      return 'jpg';
    }
    if (image.endsWith('pdf')) {
      return 'pdf';
    }
    return false;
  }

  //to remove uploaded image
  removeImage(file) {
    this._mandateService
      .removeUploadedImage(file.files_IDPK, file.file_name, file.lead_IDFK)
      .subscribe(() => {
        this.requestedunits?.forEach((element) => {
          element.images = element.images.filter((ele) => {
            return !(ele.file_name == file.file_name);
          });
        });
        this.closurefiles = [];
      });
  }

  onFileSelected(event: any, leadid, execid, propid) {
    let myFile = event.target.files;
    let allFilesValid = true;
    for (let i = 0; i < myFile.length; i++) {
      const file = myFile[i];
      if (file.size > 1110000) {
        allFilesValid = false;
        Swal.fire({
          title: 'File Size Exceeded',
          text: 'File Size limit is 1MB',
          icon: 'error',
          heightAuto: false,
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          // input.value = '';
          this.closurefiles = [];
        });
        break;
      }
    }

    if (allFilesValid) {
      for (let i = 0; i < myFile.length; i++) {
        const file = myFile[i];
        const fileName = file.name;
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
        // this.uploadFile(leadid,execid,propid);
        reader.readAsDataURL(file);
      }
    }
    this.uploadFile(leadid, execid, propid);
  }

  uploadFile(leadid, execid, propid) {
    const formData = new FormData();
    formData.append('PropID', propid);
    formData.append('LeadID', leadid);
    formData.append('ExecID', localStorage.getItem('UserId'));

    if (
      this.filteredParams.headerType == 'mandate' ||
      this.filteredParams.htype == 'mandate'
    ) {
      formData.append('assignID', execid);
    }

    for (var k = 0; k < this.closurefiles.length; k++) {
      formData.append('file[]', this.closurefiles[k]);
    }

    if (
      this.filteredParams.headerType == 'mandate' ||
      this.filteredParams.htype == 'mandate'
    ) {
      this._mandateService.uploadFile(formData).subscribe((res) => {
        if (res['status'] == 'True') {
          this._mandateService
            .getassignedrm(
              leadid,
              this.userid,
              execid,
              this.filteredParams.feedbackId
            )
            .subscribe((cust) => {
              this.assignedrm = cust['RMname'];

              this.assignedrm = this.assignedrm?.filter((exec) => {
                return exec.RMID == this.filteredParams.execid;
              });
              this.verifyrequest(
                this.assignedrm?.[0]?.customer_IDPK,
                this.assignedrm?.[0]?.suggestedprop[0]?.propid,
                this.assignedrm?.[0]?.RMID,
                this.assignedrm?.[0]?.suggestedprop[0]?.name
              );
            });
          this.uploads = [];
          this.closurefiles = [];
        }
      });
    } else {
      this._retailservice.uploadFile(formData).subscribe((res) => {
        if (res['status'] == 'True') {
          this._retailservice
            .getassignedrmretail(
              this.filteredParams.leadId,
              this.filteredParams.execid,
              this.filteredParams.feedbackId
            )
            .subscribe((cust) => {
              this.assignedrm = cust['RMname'];
              this.leadsDetailsInfo = cust['RMname'];

              this.assignedrm = this.assignedrm.filter((exec) => {
                return exec.RMID == this.filteredParams.execid;
              });
              this.verifyrequest(
                this.assignedrm?.[0]?.customer_IDPK,
                this.assignedrm?.[0]?.suggestedprop[0]?.propid,
                this.filteredParams.execid,
                this.assignedrm?.[0]?.suggestedprop[0]?.name
              );
            });
          this.uploads = [];
          this.closurefiles = [];
        }
      });
    }
  }

  getStages() {
    // if (
    //   this.filteredParams.headerType == 'mandate' ||
    //   this.filteredParams.htype == 'mandate'
    // ) {
    this._mandateService
      .getactiveleadsstatus(
        this.assignedrm?.[0]?.customer_IDPK,
        localStorage.getItem('UserId'),
        this.assignedrm?.[0]?.RMID,
        this.selectedSuggestedProp?.['propid'],
        this.filteredParams.feedbackId
      )
      .subscribe((stagestatus) => {
        if (stagestatus['status'] == 'True') {
          this.activestagestatus = stagestatus['activeleadsstatus'];

          if (
            this.activestagestatus?.[0]?.stage == 'Closing Request Rejected' ||
            this.activestagestatus?.[0]?.stage == 'Lead Closed'
          ) {
            this.isShowStages = false;
          } else {
            this.isShowStages = true;
          }

          if (
            this.activestagestatus?.[0]?.stage == 'Lead Closed' ||
            this.activestagestatus?.[0]?.stage == 'Move to Junk'
          ) {
            this.USV = false;
          } else if (this.activestagestatus?.[0]?.stage == 'Deal Closed') {
            this.showRejectionForm = true;
          } else if (
            this.activestagestatus?.[0]?.stage == 'Deal Closing Requested' &&
            (this.activestagestatus?.[0]?.followupstatus == '0 ' ||
              this.activestagestatus?.[0]?.followupstatus == null ||
              this.activestagestatus?.[0]?.followupstatus == '4')
          ) {
            this.RSV = false;
            this.Negotiation = false;
            this.USV = false;
          } else if (
            this.activestagestatus?.[0]?.stage == 'Closing Request Rejected' &&
            (this.activestagestatus?.[0]?.followupstatus == '0 ' ||
              this.activestagestatus?.[0]?.followupstatus == null ||
              this.activestagestatus?.[0]?.followupstatus == '4')
          ) {
            this.RSV = false;
            this.Negotiation = false;
            this.USV = false;
          } else if (
            this.activestagestatus?.[0]?.stage == 'Fresh' &&
            this.activestagestatus?.[0]?.followupstatus == '4'
          ) {
            this.USV = true;
            this.followup = true;
            this.junkmove = true;
            this.SV = false;
            this.RSV = false;
            this.Negotiation = false;
            this.leadclose = false;
          } else if (
            (this.activestagestatus?.[0]?.stage == 'USV' &&
              this.activestagestatus?.[0]?.stagestatus == '1') ||
            (this.activestagestatus?.[0]?.stage == 'USV' &&
              this.activestagestatus?.[0]?.stagestatus == '2') ||
            (this.activestagestatus?.[0]?.stage == 'USV' &&
              this.activestagestatus?.[0]?.stagestatus == '4') ||
            (this.activestagestatus[0].stage == 'USV' &&
              this.activestagestatus[0].stagestatus == null &&
              this.activestagestatus[0].visitstatus == '0')
          ) {
            this.followup = true;
            this.USV = true;
            this.SV = false;
            this.RSV = false;
            this.Negotiation = false;
            this.leadclose = false;
            this.junkmove = true;
          } else if (
            this.activestagestatus?.[0]?.stage == 'USV' &&
            this.activestagestatus?.[0]?.stagestatus == '3' &&
            this.activestagestatus?.[0]?.visitstatus == '1'
          ) {
            this.USV = false;
            this.followup = true;
            this.RSV = true;
            this.Negotiation = true;
            this.leadclose = true;
            this.junkmove = true;
          } else if (
            this.activestagestatus?.[0]?.stage == 'USV' &&
            this.activestagestatus?.[0]?.stagestatus == '3' &&
            this.activestagestatus?.[0]?.visitstatus == '0'
          ) {
            this.followup = true;
            this.SV = false;
            this.RSV = false;
            this.Negotiation = false;
            this.leadclose = false;
            this.junkmove = true;
            this.USV = true;
            this.usvform = true;
            // Loading this API again only for fetching the walkin date & time and write to the html view hidden visited date and time input boxes after the usvform in true condition
            this._mandateService
              .getassignedrm(
                this.filteredParams.leadId,
                localStorage.getItem('UserId'),
                this.filteredParams.execid,
                this.filteredParams.feedbackId
              )
              .subscribe((cust) => {
                // Adding First Visit date time to USV Submission Section
                var date = cust[0]?.walkintime.split(' ')[0];
                var time = cust[0]?.walkintime.split(' ').pop();
                $('#USVvisiteddate').val(date);
                $('#USVvisitedtime').val(time);
                // Adding First Visit date time to USV Submission Section
              });
            // Loading this API again only for fetching the walkin date & time and write to the html view hidden visited date and time input boxes after the usvform in true condition
          } else if (
            (this.activestagestatus?.[0]?.stage == 'RSV' &&
              this.activestagestatus?.[0]?.stagestatus == '1') ||
            (this.activestagestatus?.[0]?.stage == 'RSV' &&
              this.activestagestatus?.[0]?.stagestatus == '2') ||
            (this.activestagestatus?.[0]?.stage == 'RSV' &&
              this.activestagestatus?.[0]?.stagestatus == '4')
          ) {
            this.USV = false;
            this.SV = false;
            this.Negotiation = false;
            this.leadclose = false;
            this.RSV = true;
            this.junkmove = true;
            this.followup = true;
          } else if (
            this.activestagestatus?.[0]?.stage == 'RSV' &&
            this.activestagestatus?.[0]?.stagestatus == '3' &&
            this.activestagestatus?.[0]?.visitstatus == '1'
          ) {
            this.USV = false;
            this.RSV = true;
            this.Negotiation = true;
            this.leadclose = true;
            this.followup = true;
            this.junkmove = true;
          } else if (
            this.activestagestatus?.[0]?.stage == 'RSV' &&
            this.activestagestatus?.[0]?.stagestatus == '3' &&
            this.activestagestatus?.[0]?.visitstatus == '0'
          ) {
            this.followup = true;
            this.SV = false;
            this.USV = false;
            this.RSV = true;
            this.Negotiation = false;
            this.leadclose = false;
            this.junkmove = true;
            this.usvform = false;
            this.usvform = true;
          } else if (
            (this.activestagestatus?.[0]?.stage == 'Final Negotiation' &&
              this.activestagestatus?.[0]?.stagestatus == '1') ||
            (this.activestagestatus?.[0]?.stage == 'Final Negotiation' &&
              this.activestagestatus?.[0]?.stagestatus == '2') ||
            (this.activestagestatus?.[0]?.stage == 'Final Negotiation' &&
              this.activestagestatus?.[0]?.stagestatus == '4')
          ) {
            this.USV = false;
            this.SV = false;
            this.RSV = false;
            this.leadclose = false;
            // this.finalnegoform = true;
            this.Negotiation = true;
            this.followup = true;
            this.junkmove = true;
          } else if (
            this.activestagestatus?.[0]?.stage == 'Final Negotiation' &&
            this.activestagestatus?.[0]?.stagestatus == '3' &&
            this.activestagestatus?.[0]?.visitstatus == '1'
          ) {
            this.USV = false;
            this.RSV = true;
            this.leadclose = true;
            this.Negotiation = true;
            this.followup = true;
            this.junkmove = true;
          } else if (
            this.activestagestatus?.[0]?.stage == 'Final Negotiation' &&
            this.activestagestatus?.[0]?.stagestatus == '3' &&
            this.activestagestatus?.[0]?.visitstatus == '0'
          ) {
            this.followup = false;
            this.SV = false;
            this.USV = false;
            this.RSV = false;
            this.leadclose = false;
            this.junkmove = false;
            this.usvform = false;
            this.finalnegoform = true;
            this.Negotiation = true;
          } else if (this.activestagestatus?.[0]?.stage == 'Junk') {
            if (this.roleid == '1') {
              this.USV = false;
              this.RSV = false;
              this.Negotiation = false;
              this.leadclose = false;
              this.followup = false;
              this.junkmove = false;
              this.leadMoveJunkExec = true;
            } else if (this.roleid != '1' && this.roleid != '2') {
              if (this.filteredParams.feedbackId == '0') {
                this.followup = false;
                this.junkmove = false;
                this.USV = false;
                this.RSV = false;
                this.Negotiation = false;
                this.leadclose = false;
                this.leadMoveJunkExec = false;
              } else {
                this.followup = true;
                this.junkmove = true;
                this.USV = true;
                this.RSV = true;
                this.Negotiation = true;
                this.leadclose = true;
                this.leadMoveJunkExec = true;
              }
            }
          } else {
            if (
              this.activestagestatus?.[0]?.stage == 'Fresh' &&
              this.activestagestatus?.[0]?.followupstatus == null
            ) {
              this.showRejectionForm = false;
              this.followup = true;
              this.USV = true;
              this.SV = false;
              this.RSV = false;
              this.Negotiation = false;
              this.leadclose = false;
              this.junkmove = true;
            }
          }
          if (this.activestagestatus?.[0]?.stage == 'Fresh') {
            this.usvform = false;
          }
        } else if (stagestatus['status'] == 'False') {
          this.currentstage = 'Fresh';
          this.SV = false;
          this.RSV = false;
          this.Negotiation = false;
          this.leadclose = false;
        }
      });
    // }
    // else {
    //   this._retailservice
    //     .getactiveleadsstatus(
    //       this.assignedrm?.[0]?.customer_IDPK,
    //       localStorage.getItem('UserId'),
    //       this.assignedrm?.[0]?.RMID,
    //       this.filteredParams.feedbackId
    //     )
    //     .subscribe((stagestatus) => {
    //       if (stagestatus['status'] == 'True') {
    //         this.activestagestatus = stagestatus['activeleadsstatus'];
    //         this.currentstage = this.activestagestatus?.[0]?.stage;

    //         if (
    //           this.activestagestatus?.[0]?.stage == 'Lead Closed' ||
    //           this.activestagestatus?.[0]?.stage == 'Move to Junk'
    //         ) {
    //           this.USV = false;
    //         } else if (
    //           this.activestagestatus?.[0]?.stage == 'Fresh' &&
    //           this.activestagestatus?.[0]?.followupstatus == '4'
    //         ) {
    //           this.SV = false;
    //           this.RSV = false;
    //           this.Negotiation = false;
    //           this.leadclose = false;
    //           this.USV = true;
    //           this.followup = true;
    //           this.junkmove = true;
    //         } else if (
    //           (this.activestagestatus?.[0]?.stage == 'USV' &&
    //             this.activestagestatus?.[0]?.stagestatus == '1') ||
    //           (this.activestagestatus?.[0]?.stage == 'USV' &&
    //             this.activestagestatus?.[0]?.stagestatus == '2') ||
    //           (this.activestagestatus?.[0]?.stage == 'USV' &&
    //             this.activestagestatus?.[0]?.stagestatus == '4')
    //         ) {
    //           this.USV = true;
    //           this.SV = false;
    //           this.RSV = false;
    //           this.Negotiation = false;
    //           this.leadclose = false;
    //           this.followup = true;
    //           this.junkmove = true;
    //         } else if (
    //           this.activestagestatus?.[0]?.stage == 'USV' &&
    //           this.activestagestatus?.[0]?.stagestatus == '3'
    //         ) {
    //           this.USV = false;
    //           this.SV = true;
    //           this.RSV = true;
    //           this.Negotiation = true;
    //           this.leadclose = true;
    //           this.followup = true;
    //           this.junkmove = true;
    //         } else if (
    //           (this.activestagestatus?.[0]?.stage == 'SV' &&
    //             this.activestagestatus?.[0]?.stagestatus == '1') ||
    //           (this.activestagestatus?.[0]?.stage == 'SV' &&
    //             this.activestagestatus?.[0]?.stagestatus == '2') ||
    //           (this.activestagestatus?.[0]?.stage == 'SV' &&
    //             this.activestagestatus?.[0]?.stagestatus == '4')
    //         ) {
    //           this.USV = false;
    //           this.SV = true;
    //           this.RSV = false;
    //           this.Negotiation = false;
    //           this.leadclose = false;
    //           this.followup = true;
    //           this.junkmove = true;
    //         } else if (
    //           this.activestagestatus?.[0]?.stage == 'SV' &&
    //           this.activestagestatus?.[0]?.stagestatus == '3'
    //         ) {
    //           this.USV = false;
    //           this.SV = true;
    //           this.RSV = true;
    //           this.Negotiation = true;
    //           this.leadclose = true;
    //           this.followup = true;
    //           this.junkmove = true;
    //         } else if (
    //           (this.activestagestatus?.[0]?.stage == 'RSV' &&
    //             this.activestagestatus?.[0]?.stagestatus == '1') ||
    //           (this.activestagestatus?.[0]?.stage == 'RSV' &&
    //             this.activestagestatus?.[0]?.stagestatus == '2') ||
    //           (this.activestagestatus?.[0]?.stage == 'RSV' &&
    //             this.activestagestatus?.[0]?.stagestatus == '4')
    //         ) {
    //           this.USV = false;
    //           this.SV = false;
    //           this.RSV = true;
    //           this.Negotiation = false;
    //           this.leadclose = false;
    //           this.junkmove = true;
    //           this.followup = true;
    //         } else if (
    //           this.activestagestatus?.[0]?.stage == 'RSV' &&
    //           this.activestagestatus?.[0]?.stagestatus == '3'
    //         ) {
    //           this.USV = false;
    //           this.SV = true;
    //           this.RSV = true;
    //           this.Negotiation = true;
    //           this.leadclose = true;
    //           this.followup = true;
    //           this.junkmove = true;
    //         } else if (
    //           (this.activestagestatus?.[0]?.stage == 'Final Negotiation' &&
    //             this.activestagestatus?.[0]?.stagestatus == '1') ||
    //           (this.activestagestatus?.[0]?.stage == 'Final Negotiation' &&
    //             this.activestagestatus?.[0]?.stagestatus == '2') ||
    //           (this.activestagestatus?.[0]?.stage == 'Final Negotiation' &&
    //             this.activestagestatus?.[0]?.stagestatus == '4')
    //         ) {
    //           this.USV = false;
    //           this.SV = false;
    //           this.RSV = false;
    //           this.Negotiation = true;
    //           this.leadclose = false;
    //           this.junkmove = true;
    //           this.followup = true;
    //         } else if (
    //           this.activestagestatus?.[0]?.stage == 'Final Negotiation' &&
    //           this.activestagestatus?.[0]?.stagestatus == '3'
    //         ) {
    //           this.USV = false;
    //           this.SV = true;
    //           this.RSV = true;
    //           this.Negotiation = true;
    //           this.leadclose = true;
    //           this.followup = true;
    //           this.junkmove = true;
    //         } else if (this.activestagestatus?.[0]?.stage == 'Fresh') {
    //           this.USV = true;
    //           this.SV = false;
    //           this.RSV = false;
    //           this.Negotiation = false;
    //           this.leadclose = false;
    //           this.followup = true;
    //           this.junkmove = true;
    //         } else if (this.activestagestatus?.[0]?.stage == 'Deal Closed') {
    //           if (this.roleid == '1') {
    //             this.USV = false;
    //             this.SV = true;
    //             this.RSV = true;
    //             this.Negotiation = true;
    //             this.leadclose = true;
    //             this.junkmove = true;
    //             this.followup = true;
    //           } else {
    //             this.USV = false;
    //             this.SV = false;
    //             this.RSV = false;
    //             this.Negotiation = false;
    //             this.leadclose = false;
    //           }
    //         } else if (this.activestagestatus?.[0]?.stage == 'Junk') {
    //           if (this.roleid == '1' || this.roleid == '2') {
    //             this.USV = false;
    //             this.SV = true;
    //             this.RSV = true;
    //             this.Negotiation = true;
    //             this.leadclose = true;
    //             this.junkmove = true;
    //             this.followup = true;
    //           } else if (this.roleid != '1' && this.roleid != '2') {
    //             if (this.filteredParams.feedbackId == '0') {
    //               this.USV = false;
    //               this.SV = false;
    //               this.RSV = false;
    //               this.Negotiation = false;
    //               this.leadclose = false;
    //             } else {
    //               this.USV = false;
    //               this.SV = true;
    //               this.RSV = true;
    //               this.Negotiation = true;
    //               this.leadclose = true;
    //               this.junkmove = true;
    //               this.followup = true;
    //             }
    //           }
    //         } else {
    //           this.SV = false;
    //           this.RSV = false;
    //           this.Negotiation = false;
    //           this.leadclose = false;
    //         }
    //       } else if (stagestatus['status'] == 'False') {
    //         this.USV = true;
    //         this.SV = false;
    //         this.RSV = false;
    //         this.Negotiation = false;
    //         this.leadclose = false;
    //         this.followup = true;
    //         this.junkmove = true;
    //       }
    //     });
    // }
  }

  getcustomerview() {
    if (
      this.filteredParams.headerType == 'mandate' ||
      this.filteredParams.htype == 'mandate'
    ) {
      this._mandateService
        .getassignedrm(
          this.filteredParams.leadId,
          localStorage.getItem('UserId'),
          this.filteredParams.execid,
          this.filteredParams.feedbackId
        )
        .subscribe((cust) => {
          this.showSpinner1 = false;
          this.assignedrm = cust['RMname']?.filter(
            (item) => item.RMID == this.filteredParams.execid
          );
          this.selectedSuggestedProp =
            this.assignedrm?.[0]?.['suggestedprop']?.length == 1
              ? this.assignedrm?.[0]?.['suggestedprop']?.[0]
              : '';

          this.verifyrequest(
            this.assignedrm?.[0]?.customer_IDPK,
            this.selectedSuggestedProp?.['propid'],
            this.assignedrm?.[0]?.RMID,
            this.selectedSuggestedProp?.['name']
          );
          this.getStages();
          this.triggerhistory();
        });
    } else {
      this._retailservice
        .getassignedrmretail(
          this.filteredParams.leadId,
          this.filteredParams.execid,
          this.filteredParams.feedbackId
        )
        .subscribe((cust) => {
          this.assignedrm = cust['RMname']?.filter(
            (item) => item.RMID == this.filteredParams.execid
          );
          this.leadsDetailsInfo = this.assignedrm;
          this.leadsDetailsInfo = this.assignedrm;
          this.verifyrequest(
            this.assignedrm?.[0]?.customer_IDPK,
            this.assignedrm?.[0]?.suggestedprop?.[0]?.propid,
            this.filteredParams.execid,
            this.assignedrm?.[0]?.suggestedprop?.[0]?.name
          );
          this.getStages();
          this.triggerhistory();
        });
    }
  }

  verifyrequest(leadid, propid, execid, propname) {
    var param = {
      leadid: leadid,
      propid: propid,
      execid: execid,
    };
    if (
      this.filteredParams.headerType == 'mandate' ||
      this.filteredParams.htype == 'mandate'
    ) {
      this._mandateService
        .fetchrequestedvalues(param)
        .subscribe((requested) => {
          this.requestedunits = requested?.['requestedvals']?.map(
            (request: any) => {
              request.bhk = request.bhk.trim();
              return request;
            }
          );
        });
    } else {
      this._retailservice.fetchrequestedvalues(param).subscribe((requested) => {
        this.requestedunits = requested['requestedvals'];
      });
    }
  }

  onleadTabData(leadTabData) {
    this.filteredParams.leadTabData = leadTabData;
    if (leadTabData == 'activity') {
      this.filteredParams.isCallHistory = 'leads';
    } else {
      this.filteredParams.isCallHistory = '';
    }
    this.addQueryParams();
  }

  onBackButton() {
    this.onleadTabData('status');
    // this.leadDetailsModalCloseEvent.emit('true');
    // this.location.back();

    this.router.navigate([], {
      queryParams: {
        isOnCallDetailsPage: null,
        callStatus: null,
        leadId: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  getQueryParams() {
    const queryString = window.location.search;
    const queryParams = {};
    new URLSearchParams(queryString).forEach((value, key) => {
      queryParams[key] = value;
    });

    Object.keys(this.filteredParams).forEach((key) => {
      if (queryParams.hasOwnProperty(key)) {
        this.filteredParams[key] = queryParams[key];
      } else if (key == 'propid' && 'ranavPropId' in localStorage) {
        this.filteredParams[key] = '28773';
      } else if (
        key !== 'loginid' &&
        key !== 'limit' &&
        key !== 'limitrows' &&
        key !== 'feedbackId'
      ) {
        this.filteredParams[key] = '';
      }
    });
  }

  addQueryParams() {
    // this.resetInfiniteScroll();
    const queryParams = {};
    let paramsChanged = false;
    for (const key in this.filteredParams) {
      if (this.filteredParams.hasOwnProperty(key)) {
        // Set the param if it's not empty, otherwise set to null
        const newParamValue =
          this.filteredParams[key] !== '' ? this.filteredParams[key] : null;
        // Check if query parameters have changed
        if (this.activeRoute.snapshot.queryParams[key] !== newParamValue) {
          paramsChanged = true;
        }
        queryParams[key] = newParamValue;
      }
    }
    this.router
      .navigate([], { queryParams, queryParamsHandling: 'merge' })
      .then(() => {});
  }

  actionChange(val) {
    $('#sectionselector').val('');
    if (val == 'Follow Up') {
      this.followform = true;
      this.usvform = false;
      this.svform = false;
      this.rsvform = false;
      this.finalnegoform = false;
      this.leadclosedform = false;
      this.junkform = false;
      $('#customer_phase4').val('Follow Up');
      $('#sectionselector').val('Follow Up');
      localStorage.removeItem('visitedprop');
      localStorage.removeItem('propertyloops');
    } else if (val == 'USV') {
      this.followform = false;
      this.usvform = true;
      this.svform = false;
      this.rsvform = false;
      this.finalnegoform = false;
      this.leadclosedform = false;
      this.junkform = false;
      $('#customer_phase4').val('USV');
      $('#sectionselector').val('USV');
      localStorage.removeItem('visitedprop');
      localStorage.removeItem('propertyloops');
    } else if (val == 'SV') {
      this.followform = false;
      this.svform = true;
      this.usvform = false;
      this.rsvform = false;
      this.finalnegoform = false;
      this.leadclosedform = false;
      this.junkform = false;
      $('#customer_phase4').val('SV');
      localStorage.removeItem('visitedprop');
      localStorage.removeItem('propertyloops');
    } else if (val == 'RSV') {
      this.followform = false;
      this.rsvform = true;
      this.usvform = false;
      this.svform = false;
      this.finalnegoform = false;
      this.leadclosedform = false;
      this.junkform = false;
      $('#customer_phase4').val('RSV');
      $('#sectionselector').val('RSV');
      localStorage.removeItem('visitedprop');
      localStorage.removeItem('propertyloops');
    } else if (val == 'Final Negotiation') {
      this.followform = false;
      this.finalnegoform = true;
      this.rsvform = false;
      this.svform = false;
      this.usvform = false;
      this.leadclosedform = false;
      this.junkform = false;
      $('#customer_phase4').val('Final Negotiation');
      $('#sectionselector').val('Final Negotiation');
      localStorage.removeItem('visitedprop');
      localStorage.removeItem('propertyloops');
    } else if (val == 'Lead Closed') {
      this.leadclosedform = true;
      this.followform = false;
      this.finalnegoform = false;
      this.svform = false;
      this.rsvform = false;
      this.usvform = false;
      this.junkform = false;
      $('#customer_phase4').val('Lead Closed');
      $('#sectionselector').val('Lead Closed');
      localStorage.removeItem('visitedprop');
      localStorage.removeItem('propertyloops');
    } else if (val == 'Move to Junk') {
      this.junkform = true;
      this.followform = false;
      this.rsvform = false;
      this.svform = false;
      this.usvform = false;
      this.finalnegoform = false;
      this.leadclosedform = false;
      $('#customer_phase4').val('Move to Junk');
      $('#sectionselector').val('Move to Junk');
      localStorage.removeItem('visitedprop');
      localStorage.removeItem('propertyloops');
    } else {
      this.junkform = false;
    }
  }

  // method to reject lead close request
  requestrejection(leadid, execid, propid) {
    if (
      this.requestedunits?.[0]?.images.length == 0 &&
      (this.filteredParams.headerType == 'mandate' ||
        this.filteredParams.htype == 'mandate')
    ) {
      Swal.fire({
        title: 'No Files Uploaded',
        text: 'Upload atleast one file',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      });
    } else if ($('.rejectedtextarea').val() == '') {
      $('.rejectedtextarea')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please add the reason for rejection');
    } else if (!/^(?!\s*$).+$/.test(String($('.rejectedtextarea').val()))) {
      $('.rejectedtextarea')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please add the reason for rejection');
    } else {
      $('.rejectedtextarea').removeAttr('style');
      var remarkscontent = $('.rejectedtextarea').val();
      var param = {
        leadid: leadid,
        propid: propid,
        execid: this.userid,
        statusid: '2',
        remarks: remarkscontent,
        assignid: execid,
      };

      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'This feature is restricted for demo accounts.',
          icon: 'error',
          heightAuto: false,
          confirmButtonText: 'ok',
        }).then(() => {
          this.showSpinner = false;
        });
      } else {
        if (
          this.filteredParams.headerType == 'mandate' ||
          this.filteredParams.htype == 'mandate'
        ) {
          this._mandateService
            .closingrequestresponse(param)
            .subscribe((requestresponse) => {
              if (requestresponse['status'] == 'True-1') {
                Swal.fire({
                  title: 'Request Rejected',
                  icon: 'success',
                  heightAuto: false,
                  confirmButtonText: 'OK!',
                }).then((result) => {
                  this.router
                    .navigate([], {
                      queryParams: {
                        editRejectedLead: null,
                      },
                      queryParamsHandling: 'merge',
                    })
                    .then(() => {
                      location.reload();
                    });
                });
              } else {
                Swal.fire({
                  title: 'Some Error Occured',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'OK!',
                }).then((result) => {
                  location.reload();
                });
              }
            });
        } else {
          this._retailservice
            .closingrequestresponse(param)
            .subscribe((requestresponse) => {
              if (requestresponse['status'] == 'True-1') {
                Swal.fire({
                  title: 'Request Rejected',
                  icon: 'success',
                  heightAuto: false,
                  confirmButtonText: 'OK!',
                }).then((result) => {
                  this.router
                    .navigate([], {
                      queryParams: {
                        editRejectedLead: null,
                      },
                      queryParamsHandling: 'merge',
                    })
                    .then(() => {
                      setTimeout(() => {
                        location.reload();
                      }, 100);
                    });
                });
              } else {
                Swal.fire({
                  title: 'Some Error Occured',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'OK!',
                }).then((result) => {
                  location.reload();
                });
              }
            });
        }
      }
    }
  }

  requestapproval(leadid, execid, propid) {
    // this.verifyrequest(leadid, propid, this.selectedExecId, this.selectedSuggestedProp.name);

    if (
      this.requestedunits?.[0]?.images.length == 0 &&
      (this.filteredParams.headerType == 'mandate' ||
        this.filteredParams.htype == 'mandate')
    ) {
      Swal.fire({
        title: 'No Files Uploaded',
        text: 'Upload atleast one file',
        icon: 'error',
        heightAuto: false,
        allowOutsideClick: false,
        confirmButtonText: 'ok',
      });
    } else {
      var param = {
        leadid: leadid,
        propid: propid,
        execid: this.userid,
        statusid: '1',
        remarks: 'No Comments',
        assignid: this.filteredParams.execid,
      };

      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'This feature is restricted for demo accounts.',
          icon: 'error',
          heightAuto: false,
          confirmButtonText: 'ok',
        }).then(() => {
          this.showSpinner = false;
        });
      } else {
        if (
          this.filteredParams.headerType == 'mandate' ||
          this.filteredParams.htype == 'mandate'
        ) {
          this._mandateService
            .closingrequestresponse(param)
            .subscribe((requestresponse) => {
              if (requestresponse['status'] == 'True-0') {
                this.autoremarks =
                  ' Send the Deal Closing Request successfully.';
                var leadhistparam = {
                  leadid: leadid,
                  closedate: this.requestedunits[0].closed_date,
                  closetime: this.requestedunits[0].closed_time,
                  textarearemarks: 'Deal closed Request Approved',
                  leadstage: 'Lead Closed',
                  stagestatus: '0',
                  userid: this.userid,
                  assignid: this.filteredParams.execid,
                  property: propid,
                  autoremarks: this.autoremarks,
                  feedbackid: this.filteredParams.feedbackId,
                };
                this._mandateService.addleadhistory(leadhistparam).subscribe(
                  (success) => {
                    if (success['status'] == 'True') {
                      this.showSpinner = false;
                      Swal.fire({
                        title: 'Request Approved Successfully',
                        icon: 'success',
                        heightAuto: false,
                        timer: 2000,
                        allowOutsideClick: false,
                        showConfirmButton: false,
                      }).then(() => {
                        this.showRejectionForm = false;
                        this.showSpinner = false;
                        location.reload();
                        // location.reload();
                        // $('.modal-backdrop').closest('div').remove();
                        // let currentUrl = this.router.url;
                        // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                        //   this.router.navigate([currentUrl]);
                        // });
                      });
                    } else if (success['status'] == 'Duplicate Request') {
                      Swal.fire({
                        title:
                          'Already got the request for this same Unit number',
                        icon: 'error',
                        heightAuto: false,
                        timer: 2000,
                        allowOutsideClick: false,
                        showConfirmButton: false,
                      }).then(() => {
                        location.reload();
                      });
                    }
                  },
                  (err) => {
                    console.log('Failed to Update');
                  }
                );
              } else {
                Swal.fire({
                  title: 'Some Error Occured',
                  icon: 'error',
                  heightAuto: false,
                  timer: 2000,
                  allowOutsideClick: false,
                  showConfirmButton: false,
                }).then(() => {
                  location.reload();
                  // let currentUrl = this.router.url;
                  // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                  //   this.router.navigate([currentUrl]);
                  // });
                });
              }
            });
        } else {
          this._retailservice
            .closingrequestresponse(param)
            .subscribe((requestresponse) => {
              if (requestresponse['status'] == 'True-0') {
                this.autoremarks =
                  ' Send the Deal Closing Request successfully.';
                var leadhistparam = {
                  leadid: leadid,
                  closedate: this.requestedunits?.[0]?.closed_date,
                  closetime: this.requestedunits?.[0]?.closed_time,
                  textarearemarks: 'Deal closed Request Approved',
                  leadstage: 'Lead Closed',
                  stagestatus: '0',
                  userid: this.userid,
                  assignid: this.filteredParams.execid,
                  property: propid,
                  autoremarks: this.autoremarks,
                  feedback: this.filteredParams.feedbackId,
                };

                this._retailservice
                  .addleadhistoryretail(leadhistparam)
                  .subscribe(
                    (success) => {
                      if (success['status'] == 'True') {
                        this.showSpinner = false;
                        Swal.fire({
                          title: 'Deal Closing Requested Successfully',
                          icon: 'success',
                          heightAuto: false,
                          confirmButtonText: 'OK!',
                        }).then((result) => {
                          if (result.value) {
                            location.reload();
                          }
                        });
                        if (this.userid == '1') {
                          var param = {
                            leadid: leadid,
                            propid: propid,
                            execid: this.userid,
                            assignid: this.filteredParams.execid,
                            statusid: '1',
                            remarks: 'No Comments',
                          };
                          this._retailservice
                            .closingrequestresponse(param)
                            .subscribe((requestresponse) => {
                              if (requestresponse['status'] == 'True-0') {
                                Swal.fire({
                                  title: 'Request Approved Successfully',
                                  icon: 'success',
                                  heightAuto: false,
                                  confirmButtonText: 'OK!',
                                }).then((result) => {
                                  $('.modal-backdrop').closest('div').remove();
                                  if (result.value) {
                                    location.reload();
                                  }
                                });
                              } else {
                                Swal.fire({
                                  title: 'Some Error Occured',
                                  icon: 'error',
                                  heightAuto: false,
                                  confirmButtonText: 'OK!',
                                }).then((result) => {
                                  if (result.value) {
                                    location.reload();
                                  }
                                });
                              }
                            });
                        }
                      } else if (success['status'] == 'Duplicate Request') {
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
                Swal.fire({
                  title: 'Request Approved Successfully',
                  icon: 'success',
                  heightAuto: false,
                  confirmButtonText: 'OK!',
                }).then((result) => {
                  $('.modal-backdrop').closest('div').remove();
                  if (result.value) {
                    location.reload();
                  }
                });
              } else {
                Swal.fire({
                  title: 'Some Error Occured',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'OK!',
                }).then((result) => {
                  if (result.value) {
                    location.reload();
                  }
                });
              }
            });
        }
      }
    }
  }

  isAdminEditClosedDetails = false;
  @ViewChild('reSubmitLead') reSubmitLead: any;
  @ViewChild('closeddeal') closeddeal: any;
  @ViewChild('processLeadClosure') processLeadClosure: any;
  // to trigger modal
  async openModal(modalId, closedleadid, propid, execid, propname) {
    if (
      this.filteredParams.headerType == 'mandate' ||
      this.filteredParams.htype == 'mandate'
    ) {
      if (closedleadid) {
        this.requestedunits = this.requestedunits?.filter((id) => {
          return id.closedlead_id == closedleadid;
        });
      }
      if (modalId == 'resubmit') {
        this.reSubmitLead.present();
      } else if (modalId == 'closeddeal') {
        this.closeddeal.present();
      }
    } else {
      if (modalId == 'processLeadClosure') {
        this.processLeadClosure.present();
      } else if (modalId == 'closeddeal') {
        this.closeddeal.present();
      }

      this.verifyrequest(closedleadid, propid, execid, propname);
    }
  }
  // Modal animation
  enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' },
      ]);

    return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(500)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  leaveAnimation = (baseEl: HTMLElement) => {
    return this.enterAnimation(baseEl).direction('reverse');
  };
  // method to update data for booking form
  resubmitdata(leadid, execid, propid, i) {
    var bhk = $('#unit').val();
    var bhkunit = $('#unit_number').val();
    var dimension = $('#dimension').val();
    var ratepersqft = $('#rate_per_sqft').val();

    let isCs =
      localStorage.getItem('Role') == '50003' ||
      localStorage.getItem('Role') == '50004';

    if ($('#unit').val() == '' && !isCs) {
      $('#unit')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please type the Unit Size');
    } else if ($('#unit_number').val() == '' && !isCs) {
      $('#unit_number')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please type the unit number');
    } else if ($('#dimension').val() == '' && !isCs) {
      $('#dimension')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please type the Dimension');
    } else if ($('#rate_per_sqft').val() == '' && !isCs) {
      $('#rate_per_sqft')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please type the Rate Per Squarefeet');
    } else if (this.requestedunits[0].images.length == 0 && !isCs) {
      $('#remarks-' + i).removeAttr('style');
      Swal.fire({
        title: 'No Files Uploaded',
        text: 'Upload atleast one file',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'ok',
      });
    } else {
      var param = {
        leadid: leadid,
        propid: propid,
        execid: this.userid,
        bhk: bhk,
        bhkunit: bhkunit,
        dimension: dimension,
        ratepersqft: ratepersqft,
        assignid: this.filteredParams.execid,
      };
      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'This feature is restricted for demo accounts.',
          icon: 'error',
          heightAuto: false,
          confirmButtonText: 'ok',
        }).then(() => {
          this.showSpinner = false;
        });
      } else {
        if (
          this.filteredParams.headerType == 'mandate' ||
          this.filteredParams.htype == 'mandate'
        ) {
          this._mandateService
            .requestresubmition(param)
            .subscribe((requestsubmition) => {
              if (requestsubmition['status'] == 'True') {
                Swal.fire({
                  title: 'Resubmited Successfully',
                  icon: 'success',
                  heightAuto: false,
                  confirmButtonText: 'OK!',
                }).then((result) => {
                  // window.location.reload();
                  location.reload();
                });
              } else {
                Swal.fire({
                  title: 'Some Error Occured',
                  icon: 'error',
                  timer: 2000,
                  heightAuto: false,
                  showConfirmButton: false,
                }).then(() => {
                  // window.location.reload();
                  location.reload();
                });
              }
            });
        } else {
          this._retailservice
            .requestresubmition(param)
            .subscribe((requestsubmition) => {
              if (requestsubmition['status'] == 'True') {
                Swal.fire({
                  title: 'Resubmited Successfully',
                  icon: 'success',
                  heightAuto: false,
                  confirmButtonText: 'OK!',
                }).then((result) => {
                  location.reload();
                });
              } else {
                Swal.fire({
                  title: 'Some Error Occured',
                  icon: 'error',
                  heightAuto: false,
                  confirmButtonText: 'OK!',
                }).then((result) => {
                  location.reload();
                });
              }
            });
        }
      }
    }
  }

  //to get activity of leads
  triggerhistory() {
    this.roleid = localStorage.getItem('Role');
    let execId;
    if (this.isCallHistory == 'executive') {
      execId = this.assignedrm?.[0]?.RMID;
    } else {
      execId = '';
    }

    if (
      this.filteredParams.headerType == 'mandate' ||
      this.filteredParams.htype == 'mandate'
    ) {
      var param1 = {
        leadid: this.assignedrm?.[0]?.customer_IDPK,
        roleid: this.roleid,
        userid: this.userid,
        execid: execId,
        feedbackid: this.filteredParams.feedbackId,
      };
      this._mandateService.gethistory(param1).subscribe((history) => {
        this.showSpinner = false;
        const uniquehistory = history?.['Leadhistory']?.filter(
          (val, i, self) => {
            return (
              i ===
              self.findIndex((t) => {
                return t.autoremarks == val.autoremarks;
              })
            );
          }
        );
        this.leadtrack = uniquehistory;
      });
    } else {
      var param2 = {
        leadid: this.assignedrm?.[0]?.customer_IDPK,
        roleid: this.roleid,
        userid: this.userid,
        execid: this.filteredParams.execid,
        feedback: '',
      };
      this._retailservice.getretailhistory(param2).subscribe((history) => {
        this.showSpinner = false;
        const uniquehistory = history?.['Leadhistory']?.filter(
          (val, i, self) => {
            return (
              i ===
              self.findIndex((t) => {
                return t.autoremarks == val.autoremarks;
              })
            );
          }
        );
        this.leadtrack = uniquehistory;
      });
    }
  }

  onCallLeadHistory(isCall: any) {
    this.router.navigate([], {
      queryParams: {
        isCallHistory: isCall,
      },
      queryParamsHandling: 'merge',
    });
  }

  timer: string = '00h:00m:00s';
  private intervalId: any;
  // startTimer(checkInTime: Date) {
  //   this.stopTimer();
  //   this.intervalId = setInterval(() => {
  //     const now = new Date();
  //     const diff = Math.floor((now.getTime() - checkInTime.getTime()) / 1000); // in seconds
  //     this.timer = this.formatTime(diff);

  //     if (diff >= 60) {
  //       this.isAfterOneminute = true;
  //     }
  //   }, 1000);
  // }

  // startTimer(checkInTime: Date) {
  //   this.stopTimer();
  //   this.intervalId = setInterval(() => {
  //     const now = new Date();
  //     const diff = Math.floor((now.getTime() - checkInTime.getTime()) / 1000);

  //     this.ngZone.run(() => {
  //       this.timer = this.formatTime(diff);
  //       if (diff >= 60) {
  //         this.isAfterOneminute = true;
  //       }
  //     });
  //   }, 1000);
  // }

  startTimer(checkInTime) {
    this.stopTimer();
    const start =
      typeof checkInTime === 'string'
        ? new Date(checkInTime.replace(' ', 'T'))
        : checkInTime;

    this.intervalId = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - start.getTime()) / 1000); // in seconds
      this.timer = this.formatTime(diff);

      if (diff >= 60 && this.callStatus == 'Answered') {
        this.isAfterOneminute = true;
      } else if (
        diff >= 120 &&
        (this.callStatus == 'CONNECTING' || this.callStatus == 'Call Connected')
      ) {
        this.isAfterTwominute = true;
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0') + 'h'}:${
      mins.toString().padStart(2, '0') + 'm'
    }:${secs.toString().padStart(2, '0') + 's'}`;
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  leadDetailsPageNavigation() {
    this.onleadTabData('status');
    if (
      this.filteredParams.headerType == 'mandate' ||
      this.filteredParams.htype == 'mandate'
    ) {
      this.router.navigate(['../mandate-customers'], {
        queryParams: {
          leadId: this.assignedrm?.[0]?.customer_IDPK,
          execid: this.assignedrm?.[0]?.RMID,
          status: 'info',
          propid: this.selectedSuggestedProp['propid'],
          htype: this.filteredParams.headerType,
          fromOnCallModal: true,
          teamlead:
            localStorage.getItem('RoleType') == '1'
              ? localStorage.getItem('UserId')
              : null,
        },
      });
    } else {
      this.router.navigate(['../assigned-leads-detail'], {
        queryParams: {
          allVisits: null,
          leadId: this.assignedrm?.[0]?.customer_IDPK,
          execid: this.assignedrm?.[0]?.RMID,
          htype: this.filteredParams.headerType,
          fromOnCallModal: true,
        },
      });
    }
  }

  editNow(leadId, execid, propid, closeid) {
    if ($('#unit').val() == '') {
      Swal.fire({
        title: 'Units Not Selected',
        text: 'Select any Unit for ',
        icon: 'error',
        heightAuto: false,
        timer: 2000,
        showConfirmButton: false,
      });
      // return false;
    } else if (String($('#unit_number').val()).trim() == '') {
      $('#unit_number').val('');
      $('#unit_number')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please type the Unit Number');
      // return false;
    } else if (
      String($('#dimension').val()).trim() == '' ||
      !/^[0-9]+$/.test(String($('#dimension').val()))
    ) {
      $('#dimension').val('');
      $('#dimension')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please type the Dimension');
      // return false;
    } else if (
      String($('#rate_per_sqft').val()).trim() == '' ||
      !/^[0-9]+$/.test(String($('#rate_per_sqft').val()))
    ) {
      $('#rate_per_sqft').val('');
      $('#rate_per_sqft')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please type the Rate Per Squarefeet');
      // return false;
    } else if ($('#customFile').val() == '') {
      Swal.fire({
        title: 'No Files Uploaded',
        text: 'Upload atleast one file for ',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false,
      });
      // return false;
    } else {
      $('#unit_number').removeAttr('style');
      $('#dimension').removeAttr('style');
      $('#rate_per_sqft').removeAttr('style');

      var unitsselected = $('#unit').val();
      var unitnumbers = $('#unit_number').val();
      var dimensions = $('#dimension').val();
      var rpsft = $('#rate_per_sqft').val();

      var closedate = this.requestedunits[0].closed_date;
      var closetime = this.requestedunits[0].closed_time;
      var textarearemarks = this.requestedunits[0].suggested[0].remarks;
      this.autoremarks = 'The Deal Closed has been edited successfully.';
      var leadhistparam = {
        leadid: this.assignedrm?.[0]?.customer_IDPK,
        closedate: closedate,
        closetime: closetime,
        leadstage: 'Edit Closed Lead',
        stagestatus: '0',
        textarearemarks: textarearemarks,
        userid: this.userid,
        assignid: this.assignedrm?.[0]?.RMID,
        property: propid,
        bhk: unitsselected,
        bhkunit: unitnumbers,
        dimension: dimensions,
        ratepersft: rpsft,
        autoremarks: this.autoremarks,
        closedleadID: closeid,
        feedbackid: this.filteredParams.feedbackId,
      };

      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'This feature is restricted for demo accounts.',
          icon: 'error',
          heightAuto: false,
          confirmButtonText: 'ok',
        }).then(() => {
          this.showSpinner = false;
        });
      } else {
        this._mandateService.addleadhistory(leadhistparam).subscribe(
          (success) => {
            if (success['status'] == 'True') {
              Swal.fire({
                title: 'Deal Closed Successfully',
                icon: 'success',
                heightAuto: false,
                timer: 2000,
                showConfirmButton: false,
              }).then(() => {
                window.location.reload();
                // let currentUrl = this.router.url;
                // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                //   this.router.navigate([currentUrl]);
                // });
              });
            } else if (success['status'] == 'Duplicate Request') {
              Swal.fire({
                title: 'Already got the request for this same Unit number',
                icon: 'error',
                heightAuto: false,
                timer: 2000,
                showConfirmButton: false,
              }).then(() => {
                window.location.reload();
              });
            }
          },
          (err) => {
            console.log('Failed to Update');
          }
        );
      }
    }
  }

  //here the we can revert the lead that is pushed to junk
  revertStage() {
    Swal.fire({
      title: `Do you want to Revert the lead for ${this.assignedrm?.[0].customer_assign_name}`,
      icon: 'question',
      heightAuto: false,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        let param = {
          leadid: this.assignedrm?.[0]?.customer_IDPK,
          propid: this.selectedSuggestedProp['propid'],
          executid: this.assignedrm?.[0]?.RMID,
        };
        this._mandateService
          .revertBackToPreStage(param)
          .subscribe((resposne) => {
            if (resposne['status'] == 'True') {
              this.getStages();
              location.reload();
            }
          });
      }
    });
  }

  suggestedproperties = [];
  properties;
  dropdownSettings = {};
  @ViewChild('suggModal', { static: true }) suggModal: IonModal;
  displaySuggProperty() {
    this.getProperty();
    this.suggestedproperties = [];
    this.suggModal.present();
  }

  //called when we click on multiselect suggProp dropdown
  onSelectSuggProp(item) {
    this.suggestedproperties.push(item.id);
  }

  // when we click on close icon pesent inside the multiselect suggProp dropdown
  deSelectSuggProp(item) {
    this.suggestedproperties = this.suggestedproperties.filter((id) => {
      return id != item.id;
    });
  }

  getProperty() {
    var param = {
      leadid: this.filteredParams.leadId,
      execid: this.userid,
    };
    this._retailservice.propertylist(param).subscribe((propertylist) => {
      this.properties = propertylist['Properties'];
      if (propertylist['status'] === 'True') {
        this.properties = propertylist['Properties'];
        const param1 = {
          leadid: this.filteredParams.leadId,
          execid: this.userid,
          assignid: this.isAdmin
            ? this.filteredParams.execid
            : this.assignedrm?.[0]?.RMID,
          stage: $('#customer_phase4').val(),
          feedback: this.filteredParams.feedbackId,
        };

        // Fetch suggested properties
        this._retailservice
          .getsuggestedproperties(param1)
          .subscribe((suggested) => {
            this.properties = this.properties?.filter(
              (prop) =>
                !suggested['suggestedlists']?.some((sugprop) => {
                  return prop.id == sugprop.propid;
                })
            );
          });

        this._retailservice
          .getvisitedsuggestpropertiesretail(param1)
          .subscribe((suggested) => {
            const suggestedIds = suggested['visitedlists']?.map(
              (s) => s.propid
            );
            this.properties = propertylist['Properties']?.filter((property) => {
              return !suggestedIds?.includes(property.id);
            });
          });
      }
    });
  }

  // this called when we click on suggetsed prop button
  addpropertiestolist() {
    let stage;

    if (this.svform) {
      stage = 'SV';
    } else if (this.usvform) {
      stage = 'USV';
    } else {
      stage = 'Common Area';
    }

    var param = {
      leadid: this.filteredParams.leadId,
      suggestproperties: this.suggestedproperties,
      execid: this.userid,
      assignid: this.isAdmin
        ? this.filteredParams.execid
        : this.assignedrm?.[0]?.RMID,
      stage: 'Common Area',
    };
    if (this.suggestedproperties.length != 0) {
      this._retailservice.addsuggestedproperties(param).subscribe((success) => {
        if (success['status'] == 'True') {
          Swal.fire({
            title: 'Suggested Successfully Added',
            icon: 'success',
            heightAuto: false,
            confirmButtonText: 'OK!',
          }).then((result) => {
            this.getAssignedRM();
            this.suggModal.dismiss();
            // this.getProperty();
            // $('body').removeClass('modal-open');
            // $('.modal-backdrop').closest('div').remove();
            // setTimeout(() => {
            //   let currentUrl = this.router.url;
            //   let pathWithoutQueryParams = currentUrl.split('?')[0];
            //   let currentQueryparams = this.activeroute.snapshot.queryParams;
            //   this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            //     this.router.navigate([pathWithoutQueryParams], { queryParams: currentQueryparams });
            //   });
            // }, 0)
            this._retailservice.isCloseSuggModal = true;
            // location.reload();
          });
        }
      });
    }
  }

  getAssignedRM() {
    const leadId =
      this.filteredParams.leadId || this.filteredParams.leadId != undefined
        ? this.filteredParams.leadId
        : this.filteredParams.leadId;
    const execid =
      this.filteredParams.execid || this.filteredParams.execid != undefined
        ? this.filteredParams.execid
        : this.filteredParams.execid;
    this._retailservice
      .getassignedrmretail(leadId, execid, this.filteredParams.feedbackId)
      .subscribe((cust) => {
        this.assignedrm = cust['RMname'].filter((item) => item.RMID == execid);
        this.verifyrequest(
          this.assignedrm?.[0]?.customer_IDPK,
          this.assignedrm?.[0]?.suggestedprop?.[0]?.propid,
          execid,
          this.assignedrm?.[0]?.suggestedprop?.[0]?.name
        );
        this.getStages();
        this.triggerhistory();
      });
  }

  openAccordion: string | null = null;
  openedAccordionIndex = 0;
  currentOpenAccordion;
  onAccordionToggle(event: any, leadid, propid, execid, propname, i) {
    const isOpen = event.detail;
    if (isOpen) {
      this.verifyrequest(leadid, propid, execid, propname);
      this.requestedunits?.forEach((data) => {
        this.currentOpenAccordion = data.property == i ? null : i;
      });
    }

    if (this.openedAccordionIndex === i) {
      // Close the accordion if it's already open
      this.openedAccordionIndex = null;
    } else {
      // Open the clicked accordion
      this.openedAccordionIndex = i;
    }
  }

  forceToCallDisconnect() {
    const number = localStorage.getItem('Number');
    const cleanedNumber =
      number.startsWith('91') && number.length > 10 ? number.slice(2) : number;

    Swal.fire({
      title: 'Disconnect Call?',
      text: 'Are you sure you want to disconnect this call?',
      icon: 'warning',
      showCancelButton: true,
      heightAuto: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        this._sharedservice
          .onCallDisconnected(cleanedNumber)
          .subscribe((response) => {
            this.onBackButton();
          });
      }
    });
  }

  updateStatus(callStatus) {
    const today = new Date();
    const date = today.toISOString().split('T')[0];

    const time = today.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    let stagestatus;

    if (this.activestagestatus?.[0]?.stage !== 'Fresh') {
      if (this.activestagestatus?.[0]?.stagestatus == '1') {
        stagestatus = '1';
      } else if (this.activestagestatus?.[0]?.stagestatus == '2') {
        stagestatus = '2';
      } else if (this.activestagestatus?.[0]?.stagestatus == '3') {
        stagestatus = '3';
      }
    } else {
      if (this.activestagestatus?.[0]?.stagestatus == null) {
        stagestatus = '0';
      } else {
        stagestatus = this.activestagestatus?.[0]?.stagestatus;
      }
    }

    let followups;
    if (callStatus == 'BUSY') {
      followups = {
        leadid: this.assignedrm?.[0]?.customer_IDPK,
        actiondate: date,
        actiontime: time,
        leadstatus: this.activestagestatus?.[0]?.stage,
        stagestatus: stagestatus,
        followupsection: '2',
        followupremarks: 'remark',
        userid: localStorage.getItem('UserId'),
        // assignid: this.liveCallData?.assignee
        //   ? this.liveCallData?.assignee
        //   : this.liveCallData?.Exec_IDFK,
        assignid: this.execid,
        autoremarks:
          'Status changed to RNR, because the client did not answer the call.',
        property: this.selectedSuggestedProp?.['propid'],
        feedbackid: 0,
      };
    } else if (callStatus == 'Executive Busy') {
      followups = {
        leadid: this.assignedrm?.[0]?.customer_IDPK,
        actiondate: date,
        actiontime: time,
        leadstatus: this.activestagestatus?.[0]?.stage,
        stagestatus: stagestatus,
        followupsection: '100',
        followupremarks: localStorage.getItem('Name') + ' was busy',
        userid: localStorage.getItem('UserId'),
        // assignid: this.liveCallData?.assignee
        //   ? this.liveCallData?.assignee
        //   : this.liveCallData?.Exec_IDFK,
        assignid: this.execid,
        autoremarks: localStorage.getItem('Name') + ' did not pick the Call.',
        property: this.selectedSuggestedProp?.['propid'],
        feedbackid: 0,
      };
    }

    this._mandateService.addfollowuphistory(followups).subscribe((success) => {
      if (success['status'] == 'True') {
        this.showSpinner = false;
        if (callStatus == 'Executive Busy') {
          this.executiveBusyAlert();
        } else if (callStatus == 'BUSY') {
          this.clientBusyAlert();
        }
      }
    });
    // if (
    //   this.filteredParams.htype == 'mandate' ||
    //   this.filteredParams.headerType == 'mandate'
    // ) {
    //   this._mandateService
    //     .addfollowuphistory(followups)
    //     .subscribe((success) => {
    //       if (success['status'] == 'True') {
    //         this.showSpinner = false;
    //         if (callStatus == 'Executive Busy') {
    //           this.executiveBusyAlert();
    //         } else if (callStatus == 'BUSY') {
    //           this.clientBusyAlert();
    //         }
    //       }
    //     });
    // } else if (
    //   this.filteredParams.htype == 'retail' ||
    //   this.filteredParams.headerType == 'retail'
    // ) {
    //   this._retailservice.addfollowuphistory(followups).subscribe({
    //     next: (success) => {
    //       if (success['status'] == 'True') {
    //         if (callStatus == 'Executive Busy') {
    //           this.executiveBusyAlert();
    //         } else if (callStatus == 'BUSY') {
    //           this.clientBusyAlert();
    //         }
    //       }
    //     },
    //     error: () => {
    //       this.showSpinner1 = false;
    //     },
    //   });
    // }
  }

  clientBusyAlert() {
    Swal.fire({
      title: 'Follow-up Updated Successfully',
      text: 'Client did not answer the call. A new reminder has been set as RNR',
      icon: 'success',
      heightAuto: false,
      showConfirmButton: true,
      allowOutsideClick: false,
    }).then((val) => {
      this.showSpinner1 = false;
      if (val.value == true) {
        this._location.back();
        // let currentUrl = this.router.url;
        // let pathWithoutQueryParams = currentUrl.split('?')[0];
        // let currentQueryparams = this.activeRoute.snapshot.queryParams;
        // this.router
        //   .navigateByUrl('/', { skipLocationChange: true })
        //   .then(() => {
        //     this.router.navigate([pathWithoutQueryParams], {
        //       queryParams: currentQueryparams,
        //     });
        //   });
      }
    });
  }

  executiveBusyAlert() {
    let stagestatus;

    if (this.activestagestatus?.[0]?.stage !== 'Fresh') {
      if (this.activestagestatus?.[0]?.stagestatus == '1') {
        stagestatus = '1';
      } else if (this.activestagestatus?.[0]?.stagestatus == '2') {
        stagestatus = '2';
      } else if (this.activestagestatus?.[0]?.stagestatus == '3') {
        stagestatus = '3';
      }
    } else {
      if (this.activestagestatus?.[0]?.stagestatus == null) {
        stagestatus = '0';
      } else {
        stagestatus = this.activestagestatus?.[0]?.stagestatus;
      }
    }

    const today = new Date();
    const date = today.toISOString().split('T')[0];

    const time = today.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    Swal.fire({
      imageUrl: '../../../assets/CRMimages/animation/phone.gif',
      imageWidth: 150,
      imageHeight: 150,
      title: 'You Missed it',
      text: 'You initiated a call but didn’t pick up.',
      confirmButtonText: 'Initiate Call',
      // cancelButtonText: 'Cancel',
      allowOutsideClick: false,
      showCloseButton: true,
      showDenyButton: true,
      denyButtonText: 'Move To Inactive',
      heightAuto: false,
      showConfirmButton: true,
      showCancelButton: false,
    }).then((val) => {
      this.showSpinner1 = false;
      if (val.value == true) {
        this.stopTimer();
        this.timer = '00h:00m:00s';
        setTimeout(() => {
          this.triggerCall();
        }, 500);
      } else if (val.isDenied) {
        let followupremarks = `${this.assignedrm[0].customer_name} was not reachable`;
        let autoremarks =
          'Status changed to Not Connected, as the call could not be established with the client.';
        var followups1 = {
          leadid: this.assignedrm?.[0]?.customer_IDPK,
          actiondate: date,
          actiontime: time,
          leadstatus: this.activestagestatus?.[0]?.stage,
          stagestatus: stagestatus,
          followupsection: '4',
          followupremarks: `${this.assignedrm[0].customer_name} was not reachable`,
          userid: localStorage.getItem('UserId'),
          // assignid: this.liveCallData?.assignee
          //   ? this.liveCallData?.assignee
          //   : this.liveCallData?.Exec_IDFK,
          assignid: this.execid,
          autoremarks:
            'Status changed to Not Connected, as the call could not be established with the client.',
          property: this.selectedSuggestedProp?.['propid'],
          feedbackid: 0,
        };
        this.showSpinner1 = true;
        this._mandateService
          .addfollowuphistory(followups1)
          .subscribe((success) => {
            this.showSpinner1 = false;
            if (success['status'] == 'True') {
              // let currentUrl = this.router.url;
              // let pathWithoutQueryParams = currentUrl.split('?')[0];
              // let currentQueryparams = this.route.snapshot.queryParams;
              // this.router
              //   .navigateByUrl('/', { skipLocationChange: true })
              //   .then(() => {
              //     this.router.navigate([pathWithoutQueryParams], {
              //       queryParams: currentQueryparams,
              //     });
              //   });
              location.reload();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                heightAuto: false,
                text: 'Something went wrong. Please try again.',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
              });
            }
          });
      } else {
        this._location.back();
        this.router.navigate([], {
          queryParams: {
            isOnCallDetailsPage: null,
            isCallHistory: null,
            execid: null,
            leadTabData: null,
            leadId: null,
            direction: null,
          },
          queryParamsHandling: 'merge',
        });
      }
    });
  }

  // async executiveBusyAlert() {
  //   const result = await Swal.fire({
  //     imageUrl: '../../../assets/CRMimages/animation/phone.gif',
  //     imageWidth: 150,
  //     imageHeight: 150,
  //     title: 'You Missed it',
  //     text: 'You initiated a call but didn’t pick up.',
  //     confirmButtonText: 'Initiate Call',
  //     cancelButtonText: 'Cancel',
  //     allowOutsideClick: false,
  //     allowEscapeKey: false,
  //     allowEnterKey: false,
  //     heightAuto: false,
  //     showConfirmButton: true,
  //     showCancelButton: true,
  //   });
  //   this.showSpinner1 = false;

  //   if (result.isConfirmed) {
  //     setTimeout(() => {
  //       this.triggerCall();
  //     }, 500);
  //   } else if (result.isDismissed) {
  //     this._location.back();
  //   }
  // }

  triggerCall() {
    const cleanedNumber =
      this.assignedrm?.[0]?.customer_number.startsWith('91') &&
      this.assignedrm?.[0]?.customer_number.length > 10
        ? this.assignedrm?.[0]?.customer_number.slice(2)
        : this.assignedrm?.[0]?.customer_number;

    const param = {
      execid: localStorage.getItem('UserId'),
      callto: cleanedNumber,
      leadid: this.assignedrm?.[0]?.customer_IDPK,
      starttime: this.getCurrentDateTime(),
      modeofcall: 'mobile-' + this.filteredParams.htype,
      leadtype: this.filteredParams.htype,
      assignee: this.liveCallData.assignee,
    };
    this._sharedservice.outboundCall(param).subscribe(() => {});
  }

  getCurrentDateTime(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}

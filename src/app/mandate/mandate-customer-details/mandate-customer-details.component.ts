import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import {
  MenuController,
  IonModal,
  PopoverController,
  IonContent,
  AnimationController,
} from '@ionic/angular';
import { Location } from '@angular/common';
import { MandateService } from 'src/app/mandate-service.service';
import { SharedService } from 'src/app/shared.service';
import { RetailServiceService } from 'src/app/retail-service.service';
import { debounceTime, Subject } from 'rxjs';
import { FollowUpFormComponent } from '../follow-up-form/follow-up-form.component';
import { JunkformComponent } from '../junkform/junkform.component';
import { MandateNegoformComponent } from '../mandate-negoform/mandate-negoform.component';
import { MandateRsvFormComponent } from '../mandate-rsv-form/mandate-rsv-form.component';
import { MandateUsvFormComponent } from '../mandate-usv-form/mandate-usv-form.component';
import { EchoService } from 'src/app/echo.service';
import { MandateCloseFormComponent } from '../mandate-close-form/mandate-close-form.component';
@Component({
  selector: 'app-mandate-customer-details',
  templateUrl: './mandate-customer-details.component.html',
  styleUrls: ['./mandate-customer-details.component.scss'],
})
export class MandateCustomerDetailsComponent implements OnInit {
  feedbackId = '0';
  isProfile = true;
  ismandate;
  isProperty = false;
  isStatusActivity = false;
  showSpinner = true;
  remark;
  id;
  userid: string;
  username: string;
  isAdmin: boolean = false;
  isAdminExceStatus = true;
  isAdminExeActivity = false;
  isPlanSection = false;
  roleid: any;
  leadtrack: any = [];
  show_cnt: any = [];
  show_cnt_subarray: any;
  facemodel: any;
  closestObject: any;
  locality: any;
  selectedlocality: any;
  leadPossession: string;
  leadPropertyType: string;
  showRejectionForm: boolean = false;
  assignedrm: any;
  leadsDetailsInfo: any;
  executeid: any = '';
  selectedExecId: any = '';
  usvstagedetection: any;
  usvstagestatusdetection: any;
  isSuggestedPropBoolean: boolean = false;
  selectedItem: any;
  selectedSuggestedProp;
  closepropertyname: any;
  requestedunits: any;
  execview: boolean;
  localStorage = localStorage;
  mergedleads = [];

  size_array = [
    {
      id: '1',
      size: '1BHK',
    },
    {
      id: '2',
      size: '2BHK',
    },
    {
      id: '3',
      size: '3BHK',
    },
    {
      id: '4',
      size: '4BHK',
    },
    {
      id: '5',
      size: '5BHK',
    },
  ];

  budget_array = [
    '50L - 60L',
    '60L - 70L',
    '70L - 80L',
    '80L - 90L',
    '90L - 1Cr',
    'Above 1Cr',
  ];
  leadpriority = [
    {
      id: '1',
      priority: 'Hot',
    },
    {
      id: '2',
      priority: 'Warm',
    },
    {
      id: '3',
      priority: 'Cold',
    },
  ];
  mails: any;
  leadAssign;
  today;
  selectedlists: Object;
  selectedproperty_commaseperated: any;
  isVisitassign = false;
  callStatus: any = '';
  onCallLeadData: any;
  headerType: string;
  htype: string;

  constructor(
    public _sharedservice: SharedService,
    private _retailservice: RetailServiceService,
    private menuCtrl: MenuController,
    private _echoService: EchoService,
    private _location: Location,
    private _mandateService: MandateService,
    private activeroute: ActivatedRoute,
    private router: Router,
    private cdf: ChangeDetectorRef,
    private popoverController: PopoverController,
    private animationCtrl: AnimationController
  ) {
    const currentDate = new Date();
    this.today = currentDate.toISOString();
  }

  @ViewChild(FollowUpFormComponent)
  FollowUpFormComponent!: FollowUpFormComponent;
  @ViewChild(JunkformComponent) JunkformComponent!: JunkformComponent;
  @ViewChild(MandateNegoformComponent)
  MandateNegoformComponent!: MandateNegoformComponent;
  @ViewChild(MandateRsvFormComponent)
  MandateRsvFormComponent!: MandateRsvFormComponent;
  @ViewChild(MandateUsvFormComponent)
  MandateUsvFormComponent!: MandateUsvFormComponent;
  @ViewChild(MandateCloseFormComponent)
  MandateCloseFormComponent!: MandateCloseFormComponent;

  getLiveCallsData(leadId) {
    this._sharedservice
      .fetchLiveCall(localStorage.getItem('UserId'))
      .subscribe({
        next: (response) => {
          if (response['status'] == 'success') {
            this.callStatus =
              leadId == response['success'][0].Lead_IDFK
                ? response['success'][0].dialstatus
                : '';
            this.onCallLeadData = response['success'][0];
            if (
              leadId != response['success'][0].Lead_IDFK &&
              this.router.url.includes('mandate-customers')
            ) {
              Swal.fire({
                title: 'Call Details',
                text: 'You’re already on a call with another client',
                icon: 'warning',
                heightAuto: false,
                allowOutsideClick: false,
                confirmButtonText: 'Go to client details page',
              }).then((result) => {
                if (result.isConfirmed) {
                  this._sharedservice.isMenuOpen = false;
                  this.onCallDetails();
                } else {
                }
              });
            }
            this._sharedservice.isMenuOpen = false;
          } else {
            this._sharedservice.isMenuOpen = true;
          }

          if (
            this.onCallLeadData?.modeofcall == 'Desktop-mandate' ||
            this.onCallLeadData?.modeofcall == 'mobile-mandate' ||
            this.onCallLeadData?.modeofcall == 'Mobile-Mandate' ||
            this.onCallLeadData?.modeofcall == 'Mobile-mandate'
          ) {
            this.headerType = 'mandate';
          } else if (
            this.onCallLeadData?.modeofcall == 'Desktop-retail' ||
            this.onCallLeadData?.modeofcall == 'mobile-retail' ||
            this.onCallLeadData?.modeofcall == 'Mobile-Retail' ||
            this.onCallLeadData?.modeofcall == 'Mobile-retail'
          ) {
            this.headerType = 'retail';
          }
        },
        error: () => {
          this.showSpinner = false;
        },
      });
  }
  isOnCallDetailsPage = false;
  onCallDetails() {
    setTimeout(() => {
      this.router.navigate([], {
        queryParams: {
          isOnCallDetailsPage: true,
          leadId: this.onCallLeadData.Lead_IDFK,
          execid: this.onCallLeadData.assignee,
          leadTabData: 'status',
          headerType: this.headerType,
        },
        queryParamsHandling: 'merge',
      });
    }, 500);
  }

  isfromOnCallModal = false;
  isRM = false;
  isCS = false;
  leadId;
  isSuggestedProp = false;
  dropdownSettings = {};
  properties;
  isCallHistory: any = '';
  ngOnInit() {
    this.activeroute.queryParams.subscribe((params) => {
      this.roleid = localStorage.getItem('Role');
      this.isRM =
        this.localStorage.getItem('Role') == '50001' ||
        this.localStorage.getItem('Role') == '50002' ||
        this.localStorage.getItem('Role') == '50009' ||
        this.localStorage.getItem('Role') == '50010';
      this.isCS =
        localStorage.getItem('Role') == '50014' ||
        localStorage.getItem('Role') == '50013';
      this.callStatus = '';
      this.leadId = params['leadId'];
      this.htype = params['htype'];
      this.isCallHistory = params['isCallHistory'];
      this.executeid = params['execid'];
      this.selectedExecId = params['execid'];

      this.isSuggestedProp =
        this.localStorage.getItem('prop_suggestion') == '1' ||
        localStorage.getItem('Role') == '1' ||
        localStorage.getItem('Role') == '2';
      this.isOnCallDetailsPage = params['isOnCallDetailsPage'] == 'true';
      if (params['fromOnCallModal']) {
        this.isfromOnCallModal = true;
      } else {
        this.isfromOnCallModal = false;
      }

      this.getLiveCallsData(params['leadId']);

      this.searchSubject.pipe(debounceTime(300)).subscribe((searchTerm) => {
        this.fetchData(searchTerm);
      });

      this.feedbackId = params['feedback'] ? params['feedback'] : '0';
      this.initializeParams();
      this.getcustomerview();
      this.getlocalitylist();
      this.triggerhistory();
      this.dropdownSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'name',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        enableCheckAll: false,
        allowSearchFilter: true,
      };

      this.getFixedMandateProperties();
    });
    this._echoService.listenToChannel(
      'database-changes',
      '.DatabaseNotification',
      (message) => {
        if (localStorage.getItem('UserId') == message.Executive) {
          this.callStatus = message.Call_status_new;
          if (message.Call_status_new != 'Call Disconnected') {
            this._sharedservice.isMenuOpen = false;
          } else {
            this._sharedservice.isMenuOpen = true;
            Swal.close();
          }
          setTimeout(() => {
            this.getLiveCallsData(this.leadId);
            message.Call_status_new == 'BUSY' ||
            message.Call_status_new == 'Executive Busy'
              ? this.updateStatus()
              : '';
          }, 1000);
        }
      }
    );
  }

  updateStatus() {
    const today = new Date();
    const date = today.toISOString().split('T')[0];

    const time = today.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    let stagestatus;

    if (this.activestagestatus[0].stage !== 'Fresh') {
      if (this.activestagestatus[0].stagestatus == '1') {
        stagestatus = '1';
      } else if (this.activestagestatus[0].stagestatus == '2') {
        stagestatus = '2';
      } else if (this.activestagestatus[0].stagestatus == '3') {
        stagestatus = '3';
      }
    } else {
      if (this.activestagestatus[0].stagestatus == null) {
        stagestatus = '0';
      } else {
        stagestatus = this.activestagestatus[0].stagestatus;
      }
    }

    let followups;
    if (this.callStatus == 'BUSY') {
      followups = {
        leadid: this.assignedrm?.[0].customer_IDPK,
        actiondate: date,
        actiontime: time,
        leadstatus: this.activestagestatus[0].stage,
        stagestatus: stagestatus,
        followupsection: '2',
        followupremarks: 'remark',
        userid: localStorage.getItem('UserId'),
        assignid: this.onCallLeadData.assignee,
        autoremarks:
          'Status changed to RNR, because the client did not answer the call.',
        property: this.selectedSuggestedProp?.['propid'],
        feedbackid: 0,
      };
    } else if (this.callStatus == 'Executive Busy') {
      followups = {
        leadid: this.assignedrm?.[0].customer_IDPK,
        actiondate: date,
        actiontime: time,
        leadstatus: this.activestagestatus[0].stage,
        stagestatus: stagestatus,
        followupsection: '100',
        followupremarks: localStorage.getItem('Name') + ' was busy',
        userid: localStorage.getItem('UserId'),
        assignid: this.onCallLeadData.assignee,
        autoremarks: localStorage.getItem('Name') + ' did not pick the Call.',
        property: this.selectedSuggestedProp?.['propid'],
        feedbackid: 0,
      };
    }
    if (this.htype == 'mandate') {
      this._mandateService
        .addfollowuphistory(followups)
        .subscribe((success) => {
          if (success['status'] == 'True') {
            this.showSpinner = false;
            if (this.callStatus == 'Executive Busy') {
              this.executiveBusyAlert();
            } else if (this.callStatus == 'BUSY') {
              this.clientBusyAlert();
            }
          }
        });
    } else if (this.htype == 'retail') {
      this._retailservice.addfollowuphistory(followups).subscribe(
        (success) => {
          if (success['status'] == 'True') {
            if (this.callStatus == 'Executive Busy') {
              this.executiveBusyAlert();
            } else if (this.callStatus == 'BUSY') {
              this.clientBusyAlert();
            }
          }
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    }
  }

  clientBusyAlert() {
    Swal.fire({
      title: 'Follow-up Updated Successfully',
      text: 'Client did not answer the call. A new reminder has been set as RNR',
      icon: 'success',
      heightAuto: false,
      showConfirmButton: true,
    }).then((val) => {
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
      showCloseButton: true,
      showDenyButton: true,
      denyButtonText: 'Move To Inactive',
      // cancelButtonText: 'Cancel',
      heightAuto: false,
      showConfirmButton: true,
      showCancelButton: false,
    }).then((val) => {
      if (val.value == true) {
        setTimeout(() => {
          this.outboundCall();
        }, 500);
      } else if (val.isDenied) {
        var followups1 = {
          leadid: this.assignedrm?.[0]?.customer_IDPK,
          actiondate: date,
          actiontime: time,
          leadstatus: this.activestagestatus?.[0]?.stage,
          stagestatus: stagestatus,
          followupsection: '4',
          followupremarks: `${this.assignedrm[0].customer_name} was not reachable`,
          userid: localStorage.getItem('UserId'),
          assignid: this.onCallLeadData?.assignee
            ? this.onCallLeadData?.assignee
            : this.onCallLeadData?.Exec_IDFK,
          autoremarks:
            'Status changed to Not Connected, as the call could not be established with the client.',
          property: this.selectedSuggestedProp?.['propid'],
          feedbackid: 0,
        };
        this.showSpinner = true;
        this._mandateService
          .addfollowuphistory(followups1)
          .subscribe((success) => {
            this.showSpinner = false;
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
        // location.back();
        location.reload();
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

  block = false;
  role_type = '';

  initializeParams() {
    this.activeroute.queryParamMap.subscribe((params) => {
      this.isProfile = true;
      this.userid = localStorage.getItem('UserId');
      this.username = localStorage.getItem('Name');
      this.selectedExecId = params.get('execid');
      this.isAdmin = localStorage.getItem('Role') === '1';
      this.role_type = localStorage.getItem('RoleType');
      this.block =
        this.userid != this.selectedExecId &&
        !this.isAdmin &&
        this.role_type != '1';

      if (params.get('htype') == 'retail') {
        this.isRetail = true;
      } else {
        this.isRetail = false;
      }

      this.propid = params.get('propid');

      if (params.get('propid') == '28773') {
        this._mandateService.setHoverState('ranav_group');
      } else {
        this._mandateService.setHoverState('');
      }

      if (params.get('leadId')) {
        this.id = params.get('leadId');
      }
      this.leadAssign = params.get('execid');

      if (localStorage.getItem('Role') == '1') {
        this.isAdmin = true;
        this.isAdminExeActivity = false;
      } else {
        this.isAdmin = false;
        this.isAdminExeActivity = true;
      }
      if (params.get('htype') === 'mandate') {
        this.ismandate = true;
      } else {
        this.ismandate = false;
      }
      if (params.get('status') === 'info') {
        this.isProfile = true;
        this.isProperty = false;
        this.isStatusActivity = false;
      } else if (params.get('status') === 'propertyInfo') {
        this.isProfile = false;
        this.isProperty = true;
        this.isStatusActivity = false;
      } else if (params.get('status') === 'activity') {
        this.isProfile = false;
        this.isProperty = false;
        this.isStatusActivity = true;
        this.isAdminExceStatus = true;
        this.isAdminExeActivity = false;
        if (params.get('statusSection')) {
          if (
            !(
              this.assignedrm &&
              (this.assignedrm[0]?.leadstage == 'USV' ||
                this.assignedrm[0]?.leadstage == 'RSV' ||
                this.assignedrm[0]?.leadstage == 'Final Negotiation')
            ) &&
            params.get('statusSection') === 'plan'
          ) {
            this.onStatusActivity('status');
          } else {
            this.isPlanSection = params.get('statusSection') === 'plan';
          }
          // this.isPlanSection = params.get('statusSection')  === 'plan';
          this.isAdminExeActivity = params.get('statusSection') === 'activity';
          this.isAdminExceStatus = params.get('statusSection') === 'status';
        }
      } else {
        this.isAdminExeActivity = false;
        this.isAdminExceStatus = false;
        this.isPlanSection = false;
        this.isStatusActivity = false;
      }

      if (localStorage.getItem('Role') == null) {
        this.router.navigateByUrl('/login');
      } else if (localStorage.getItem('Role') == '1') {
        this.isAdmin = true;
        // this.execview = false;
        // this.triggerhistory();
      } else {
        this.isAdmin = false;
        // this.triggerhistory();
        // this.execview = true;
      }
    });
  }

  getlocalitylist() {
    this._mandateService.getlocality().subscribe((localities) => {
      this.locality = localities['Localities'];
      this.selectedlocality = this.show_cnt?.['localityid'];
    });
  }

  // CUSTOMER-VIEW-FROM-ENQUIRY
  getcustomerview() {
    // this.showRejectionForm = false;
    this._mandateService.getcustomeredit(this.id).subscribe((cust) => {
      this.showSpinner = false;
      this.show_cnt = cust['Customerview'][0];
      this.mergedleads = cust['Customerview'][0]?.mergedleads;
      this.show_cnt_subarray = cust['Customerview'][0]?.assignedrm;
      this.facemodel = cust['Customerview'][0];
      if (cust['Customerview'][0]?.latestaction) {
        this.closestObject = cust['Customerview'][0].latestaction;
      }

      if (this.locality && this.show_cnt?.['localityid']) {
        let location = this.locality.filter(
          (data) => data.id == this.show_cnt['  ']
        );
        this.selectedlocality = location[0]?.id;
      }

      if (this.show_cnt?.enquiry_possession == '1') {
        this.leadPossession = 'Immediate';
      } else if (this.show_cnt?.enquiry_possession == '2') {
        this.leadPossession = '6 Months';
      } else if (this.show_cnt?.enquiry_possession == '3') {
        this.leadPossession = '1 Year';
      } else if (this.show_cnt?.enquiry_possession == '4') {
        this.leadPossession = '< 2 years';
      }

      if (this.show_cnt?.enquiry_proptype == '1') {
        this.leadPropertyType = 'Apartment';
      } else if (this.show_cnt?.enquiry_proptype == '2') {
        this.leadPropertyType = 'Villa';
      } else if (this.show_cnt?.enquiry_proptype == '3') {
        this.leadPropertyType = 'Plot';
      } else if (this.show_cnt?.enquiry_proptype == '4') {
        this.leadPropertyType = 'Villament';
      }

      $('#proptypeselect').val(this.show_cnt?.['enquiry_proptype'] || '');
      $('#sizeselect').val(this.show_cnt?.['enquiry_bhksize'] || '');
      $('#budgetselect').val(this.show_cnt?.['enquiry_budget'] || '');
      $('#possessionselect').val(this.show_cnt?.['enquiry_possession'] || '');
      $('#priorityselect').val(this.show_cnt?.['lead_priority'] || '');
      $('#customer_location').val(this.show_cnt?.['localityid'] || '');
      $('#customer_address').val(this.show_cnt?.['address'] || '');

      if (this.show_cnt?.['customer_phase'] == null) {
        this.show_cnt['customer_phase'] = 'Fresh lead';
      } else {
        this.showRejectionForm = false;
      }
    });

    this._mandateService
      .getassignedrm(this.id, this.userid, this.leadAssign, this.feedbackId)
      .subscribe((cust) => {
        if (
          cust.lead == '1' &&
          this.selectedExecId == this.userid &&
          (localStorage.getItem('Role') === '50003' ||
            localStorage.getItem('Role') === '50004')
        ) {
          this.confirmLeadConversionToMandate();
        }

        this.assignedrm = cust['RMname'];

        this.leadsDetailsInfo = cust['RMname'];
        this.usvstagedetection = cust['RMname'][0].leadstage;
        this.usvstagestatusdetection = cust['RMname'][0].leadstatus;
        this.assignedrm = this.assignedrm.filter((exec) => {
          return exec.RMID == this.selectedExecId;
        });
        this.selectedSuggestedProp =
          this.assignedrm?.[0]?.suggestedprop?.filter((item) => {
            return item.propid == this.propid;
          });
        this.selectedSuggestedProp = this.selectedSuggestedProp?.[0];
        if (this.assignedrm) {
          if (
            this.assignedrm.length > 0 &&
            this.assignedrm[0].rnrcount >= 5 &&
            this.roleid != 1 &&
            this.roleid != '2'
          ) {
            Swal.fire({
              text: 'Access Denied , Do contact the Admin',
              icon: 'error',
              heightAuto: false,
            }).then(() => {
              this.router.navigate(['mandate-lead-stages'], {
                queryParams: {
                  status: 'inactive',
                  type: 'Inactive',
                  isDropDown: 'false',
                  followup: '2',
                  htype: 'mandate',
                },
              });
            });
          }
        }

        setTimeout(() => {
          this.isAccompanyBy = false;
          if (
            this.userid != this.selectedExecId &&
            this.roleid != '1' &&
            this.roleid != '2' &&
            ((this.role_type == '1' &&
              (this.assignedrm.roleid == '50003' ||
                this.assignedrm.roleid == '50004')) ||
              this.role_type != '1') &&
            this.feedbackId != '1'
          ) {
            $('.updateActivities').removeClass('active');
            $('.allActivities').removeClass('active');
            setTimeout(() => {
              const tab = document.getElementById('allActivitiesTab');
              if (tab) {
                tab.click();
              }
            }, 100);
          } else if (
            this.userid == this.selectedExecId &&
            this.roleid != '1' &&
            this.roleid != '2' &&
            this.role_type == '1' &&
            this.assignedrm.roleid != '50003' &&
            this.assignedrm.roleid != '50004' &&
            this.feedbackId != '1'
          ) {
            if (
              this.assignedrm &&
              this.assignedrm[0].visitaccompaniedid &&
              this.assignedrm[0].visitaccompaniedid != this.assignedrm[0].RMID
            ) {
              this.isAccompanyBy = true;
            } else {
              $('.allActivities').removeClass('active');
              const tab = document.getElementById('updateActivitiesTab');
              if (tab) {
                tab.click();
              }
            }
          } else if (
            this.userid != this.selectedExecId &&
            this.roleid != '1' &&
            this.roleid != '2' &&
            ((this.role_type == '1' &&
              this.assignedrm.roleid != '50003' &&
              this.assignedrm.roleid != '50004') ||
              this.role_type != '1') &&
            this.feedbackId != '1'
          ) {
            if (
              (this.assignedrm &&
                this.assignedrm[0].visitaccompaniedid &&
                this.assignedrm[0].visitaccompaniedid !=
                  this.assignedrm[0].RMID) ||
              this.role_type == '1'
            ) {
              this.isAccompanyBy = true;
            } else {
              $('.allActivities').removeClass('active');
              const tab = document.getElementById('updateActivitiesTab');
              if (tab) {
                tab.click();
              }
            }
          }
        }, 1000);

        if (this.assignedrm[0].suggestedprop?.length > 1) {
          this.isSuggestedPropBoolean = false;
          let propertyData, propIndex;
          this.assignedrm[0].suggestedprop.forEach((prop, index) => {
            propertyData = prop;
            propIndex = index;
          });
          if (
            (propertyData.selection == 1 &&
              propertyData.leadstage == 'USV' &&
              propertyData.actions == 0) ||
            (propertyData.selection == 2 &&
              propertyData.leadstage == 'RSV' &&
              propertyData.actions == 1)
          ) {
            this.selectedItem = propIndex;
            setTimeout(() => {
              // this.tabclick(propIndex, propertyData);
              this.getstages();
            }, 100);
          } else {
            this.selectedItem = 0;
            setTimeout(() => {
              this.getstages();
              // this.tabclick(
              //   this.selectedItem,
              //   this.assignedrm[0].suggestedprop?.[0]
              // );
            }, 100);
          }
        } else {
          this.selectedItem = 0;
          this.getstages();
          // setTimeout(() => {
          //   this.tabclick(
          //     this.selectedItem,
          //     this.assignedrm[0].suggestedprop?.[0]
          //   );
          // }, 100);
        }

        if (this.assignedrm && this.assignedrm[0].suggestedprop) {
          this.visitpanelselection = this.assignedrm[0].suggestedprop.filter(
            (prop) => {
              return !(prop.weekplan == null);
            }
          );
          if (
            this.visitpanelselection.length > 0 &&
            this.visitpanelselection[0].weekplan == '1'
          ) {
            this.selectedPlanType = 'weekdays';
          } else if (
            this.visitpanelselection.length > 0 &&
            this.visitpanelselection[0].weekplan == '2'
          ) {
            this.selectedPlanType = 'weekend';
          } else if (
            this.visitpanelselection.length > 0 &&
            this.visitpanelselection[0].weekplan == '0'
          ) {
            this.selectedPlanType = 'ytc';
          }
        }

        setTimeout(() => {
          this.selectedplan(this.selectedPlanType);
        }, 100);
        if (
          this.usvstagedetection == 'USV' &&
          this.usvstagestatusdetection == '3' &&
          cust[0]?.visitstatus == '0'
        ) {
          this.actionChange(this.usvstagedetection);
        }
        if (
          (this.selectedSuggestedProp &&
            this.selectedSuggestedProp?.['actions'] == '7' &&
            this.selectedSuggestedProp?.['currentstage'] == '5') ||
          (this.selectedSuggestedProp?.['actions'] == '8' &&
            this.selectedSuggestedProp?.['currentstage'] == '5') ||
          (this.selectedSuggestedProp?.['actions'] == '6' &&
            this.selectedSuggestedProp?.['currentstage'] == '5')
        ) {
          this.showRejectionForm = true;
          this.verifyrequest(
            this.assignedrm[0].customer_IDPK,
            this.selectedSuggestedProp?.['propid'],
            this.assignedrm[0].RMID,
            this.selectedSuggestedProp?.['name']
          );
        }
        this.getAllCallLogs(false);
      });
  }

  isAccompanyBy = false;

  @ViewChild('unlockleadtomandateModal') unlockleadtomandateModal;
  selectedProperty;
  visitAssigModalDismiss = false;

  confirmLeadConversionToMandate() {
    Swal.fire({
      title: 'Do you want to convert lead to Mandate.',
      icon: 'warning',
      heightAuto: false,
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'OK',
      cancelButtonText: 'NO',
    }).then((result) => {
      if (result.isConfirmed) {
        this.unlockleadtomandateModal.present();
        this.mandateprojectsfetch();
      } else {
        this.router.navigate(['assigned-leads-detail'], {
          queryParams: {
            htype: 'retail',
          },
          queryParamsHandling: 'merge',
        });
      }
    });
  }

  unlockleadtomandate() {
    let param = {
      leadid: this.id,
      propid: this.selectedProperty?.property_idfk,
      execid: this.userid,
    };
    this._mandateService.unlockleadtomandate(param).subscribe((response) => {
      if (response['status'] == 'True') {
        this.unlockleadtomandateModal.dismiss();
        location.reload();
      }
    });
  }

  verifyrequest(leadid, propid, execid, propname) {
    this.closepropertyname = propname;
    var param = {
      leadid: leadid,
      propid: propid,
      execid: execid,
    };
    this._mandateService.fetchrequestedvalues(param).subscribe((requested) => {
      this.requestedunits = requested?.['requestedvals']?.map(
        (request: any) => {
          // Trim the spaces from bhk
          request.bhk = request.bhk.trim();
          return request;
        }
      );
    });
  }

  tabclick(i, suggested) {
    this.isSuggestedPropBoolean = false;
    // $('.actionss').addClass('actionbtnss');
    // $('.selectMarks').addClass('iconmarks');
    // $('.actionbtnss').removeClass('actionss');
    // $('.iconmarks').removeClass('selectMarks');
    // $('.actionss' + i).removeClass('actionbtnss');
    // $('.actionss' + i).addClass('actionss');
    // $('.selectMarks' + i).removeClass('iconmarks');
    // $('.selectMarks' + i).addClass('selectMarks');
    // this.selectedSuggestedProp = suggested;
    if (suggested?.propid == '28773') {
      this._mandateService.setHoverState('ranav_group');
    } else {
      this._mandateService.setHoverState('');
    }
    this.followform = false;
    this.usvform = false;
    this.rsvform = false;
    this.finalnegoform = false;
    this.leadclosedform = false;
    this.junkform = false;
    // $('.radiocheck').prop('checked', false);
    this.getstages();
    this.getFixedMandateProperties();
  }

  addquerryParam(suggested) {
    this.router.navigate([], {
      queryParams: {
        propid: suggested.propid,
      },
      queryParamsHandling: 'merge',
    });
  }
  activestagestatus: any;
  currentstage: any;
  currentstagestatus: any;
  followform = false;
  followupform = false;
  followupformbtn = false;
  f2fform = false;
  usvform = false;
  svform = false;
  rsvform = false;
  finalnegoform = false;
  leadclosedform = false;
  junkform = false;
  commonformbtn = false;
  junkformbtn = false;
  followup = true;
  USV = true;
  RSV = true;
  SV = true;
  Negotiation = true;
  leadclose = true;
  junkmove = true;
  leadMoveJunkExec: boolean = true;

  actionChange(val) {
    $('#sectionselector').val('');
    if (val == 'Follow Up') {
      this.followform = true;
      this.followupform = true;
      this.followupformbtn = true;
      this.f2fform = false;
      this.usvform = false;
      this.svform = false;
      this.rsvform = false;
      this.finalnegoform = false;
      this.leadclosedform = false;
      this.junkform = false;
      this.junkformbtn = false;
      this.commonformbtn = false;
      $('#customer_phase4').val('Follow Up');
      $('#sectionselector').val('Follow Up');
    } else if (val == 'USV') {
      this.followform = false;
      this.followupform = false;
      this.followupformbtn = false;
      this.usvform = true;
      this.f2fform = false;
      this.svform = false;
      this.rsvform = false;
      this.finalnegoform = false;
      this.leadclosedform = false;
      this.junkform = false;
      this.junkformbtn = false;
      $('#customer_phase4').val('USV');
      $('#sectionselector').val('USV');
    } else if (val == 'RSV') {
      this.followform = false;
      this.followupform = false;
      this.followupformbtn = false;
      this.rsvform = true;
      this.svform = false;
      this.usvform = false;
      this.f2fform = false;
      this.finalnegoform = false;
      this.leadclosedform = false;
      this.junkform = false;
      this.junkformbtn = false;
      $('#customer_phase4').val('RSV');
      $('#sectionselector').val('RSV');
    } else if (val == 'Final Negotiation') {
      this.followform = false;
      this.followupform = false;
      this.followupformbtn = false;
      this.finalnegoform = true;
      this.rsvform = false;
      this.svform = false;
      this.usvform = false;
      this.f2fform = false;
      this.leadclosedform = false;
      this.junkform = false;
      this.junkformbtn = false;
      $('#customer_phase4').val('Final Negotiation');
      $('#sectionselector').val('Final Negotiation');
    } else if (val == 'Lead Closed') {
      this.leadclosedform = true;
      this.followform = false;
      this.followupform = false;
      this.followupformbtn = false;
      this.finalnegoform = false;
      this.rsvform = false;
      this.svform = false;
      this.usvform = false;
      this.f2fform = false;
      this.junkform = false;
      this.junkformbtn = false;
      $('#customer_phase4').val('Lead Closed');
      $('#sectionselector').val('Lead Closed');
    } else if (val == 'Move to Junk') {
      this.junkform = true;
      this.junkformbtn = true;
      this.f2fform = false;
      this.followform = false;
      this.followupform = false;
      this.followupformbtn = false;
      this.rsvform = false;
      this.svform = false;
      this.usvform = false;
      this.f2fform = false;
      this.finalnegoform = false;
      this.commonformbtn = false;
      this.leadclosedform = false;
      $('#customer_phase4').val('Move to Junk');
      $('#sectionselector').val('Move to Junk');
    } else {
      this.followupform = false;
      this.junkform = false;
      this.commonformbtn = true;
      this.followupformbtn = false;
      this.junkformbtn = false;
    }

    console.log(this.selectedSuggestedProp);
  }

  isShowStages;
  callCounts: number = 2;

  getstages() {
    this.showSpinner = true;
    this.showRejectionForm = false;
    var userid = localStorage.getItem('UserId');

    this.USV = false;
    this.followup = true;
    this.junkmove = true;
    this.SV = false;
    this.RSV = false;
    this.Negotiation = false;
    this.leadclose = false;

    this._mandateService
      .getactiveleadsstatus(
        this.id,
        userid,
        this.selectedExecId,
        this.propid,
        this.feedbackId
      )
      .subscribe((stagestatus) => {
        this.showSpinner = false;
        if (stagestatus['status'] == 'True') {
          this.activestagestatus = stagestatus['activeleadsstatus'];

          console.log(this.activestagestatus, '  this.activestagestatus');
          this.currentstage = this.activestagestatus[0].stage;
          if (
            (this.activestagestatus[0].stagestatus == '1' &&
              this.activestagestatus[0].followupstatus == '0') ||
            (this.activestagestatus[0].stagestatus == '1' &&
              this.activestagestatus[0].followupstatus == null)
          ) {
            this.currentstagestatus = 'Fixed';
          } else if (
            (this.activestagestatus[0].stagestatus == '2' &&
              this.activestagestatus[0].followupstatus == '0') ||
            (this.activestagestatus[0].stagestatus == '2' &&
              this.activestagestatus[0].followupstatus == null)
          ) {
            this.currentstagestatus = 'Refixed';
          } else if (
            (this.activestagestatus[0].stagestatus == '3' &&
              this.activestagestatus[0].followupstatus == '0') ||
            (this.activestagestatus[0].stagestatus == '3' &&
              this.activestagestatus[0].followupstatus == null)
          ) {
            this.currentstagestatus = 'Done';
          } else if (
            this.activestagestatus[0].stagestatus == '1' &&
            this.activestagestatus[0].followupstatus == '4'
          ) {
            this.currentstagestatus = 'Fixed - Followup';
          } else if (
            this.activestagestatus[0].stagestatus == '2' &&
            this.activestagestatus[0].followupstatus == '4'
          ) {
            this.currentstagestatus = 'Refixed - Followup';
          } else if (
            this.activestagestatus[0].stagestatus == '3' &&
            this.activestagestatus[0].followupstatus == '4'
          ) {
            this.currentstagestatus = 'Done - Followup';
          }

          if (
            this.activestagestatus[0].stage == 'Closing Request Rejected' ||
            this.activestagestatus[0].stage == 'Lead Closed'
          ) {
            this.isShowStages = false;
          } else {
            this.isShowStages = true;
          }

          if (
            this.activestagestatus[0].stage == 'Lead Closed' ||
            this.activestagestatus[0].stage == 'Move to Junk'
          ) {
            this.USV = false;
            if (this.execview) {
              this.showRejectionForm = true;
            }
          } else if (this.activestagestatus[0].stage == 'Deal Closed') {
            if (
              this.roleid != '50014' &&
              this.roleid != '50013' &&
              this.assignedrm &&
              this.assignedrm[0].roleid != 50013 &&
              this.assignedrm[0].roleid != 50014
            ) {
              this.showRejectionForm = true;
              this.verifyrequest(
                this.id,
                this.selectedSuggestedProp['propid'],
                this.selectedExecId,
                this.selectedSuggestedProp['name']
              );
            } else {
              this.USV = false;
              this.followup = true;
              this.RSV = false;
              this.Negotiation = false;
              this.leadclose = false;
              this.junkmove = true;
            }
          } else if (
            this.activestagestatus[0].stage == 'Deal Closing Pending'
          ) {
            if (
              this.roleid != '50014' &&
              this.roleid != '50013' &&
              this.assignedrm &&
              this.assignedrm[0].roleid != 50013 &&
              this.assignedrm[0].roleid != 50014
            ) {
              // this.showRejectionForm = true;
              // this.verifyrequest(this.id, this.selectedSuggestedProp.propid, this.selectedExecId, this.selectedSuggestedProp.name);
              this.USV = false;
              this.followup = true;
              this.RSV = false;
              this.Negotiation = false;
              this.leadclose = true;
              this.junkmove = true;
            } else {
              this.USV = false;
              this.followup = true;
              this.RSV = false;
              this.Negotiation = false;
              this.leadclose = false;
              this.junkmove = true;
            }
          } else if (
            this.activestagestatus[0].stage == 'Deal Closing Requested' &&
            (this.activestagestatus[0].followupstatus == '0 ' ||
              this.activestagestatus[0].followupstatus == null ||
              this.activestagestatus[0].followupstatus == '4')
          ) {
            this.RSV = false;
            this.Negotiation = false;
            this.USV = false;
            if (this.userid == '1') {
              this.showRejectionForm = true;
              this.verifyrequest(
                this.id,
                this.selectedSuggestedProp?.['propid'],
                this.selectedExecId,
                this.selectedSuggestedProp?.['name']
              );
            } else {
              this.showRejectionForm = true;
              this.verifyrequest(
                this.id,
                this.selectedSuggestedProp?.['propid'],
                this.selectedExecId,
                this.selectedSuggestedProp?.['name']
              );
            }
          } else if (
            this.activestagestatus[0].stage == 'Closing Request Rejected' &&
            (this.activestagestatus[0].followupstatus == '0 ' ||
              this.activestagestatus[0].followupstatus == null ||
              this.activestagestatus[0].followupstatus == '4')
          ) {
            this.RSV = false;
            this.Negotiation = false;
            this.USV = false;
            if (this.userid == '1') {
              this.showRejectionForm = true;
              this.verifyrequest(
                this.id,
                this.selectedSuggestedProp?.['propid'],
                this.selectedExecId,
                this.selectedSuggestedProp?.['name']
              );
            } else {
              this.showRejectionForm = true;
              this.verifyrequest(
                this.id,
                this.selectedSuggestedProp?.['propid'],
                this.selectedExecId,
                this.selectedSuggestedProp?.['name']
              );
            }
          } else if (
            this.activestagestatus[0].stage == 'Fresh' &&
            this.activestagestatus[0].followupstatus == '4'
          ) {
            this.USV = true;
            this.followup = true;
            this.junkmove = true;
            this.SV = false;
            this.RSV = false;
            this.Negotiation = false;
            this.leadclose = false;
          } else if (
            (this.activestagestatus[0].stage == 'USV' &&
              this.activestagestatus[0].stagestatus == '1') ||
            (this.activestagestatus[0].stage == 'USV' &&
              this.activestagestatus[0].stagestatus == '2') ||
            (this.activestagestatus[0].stage == 'USV' &&
              this.activestagestatus[0].stagestatus == '4') ||
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
            this.activestagestatus[0].stage == 'USV' &&
            this.activestagestatus[0].stagestatus == '3' &&
            this.activestagestatus[0].visitstatus == '1'
          ) {
            this.USV = false;
            this.followup = true;
            this.RSV = true;
            this.Negotiation = true;
            this.leadclose = true;
            this.junkmove = true;
          } else if (
            this.activestagestatus[0].stage == 'USV' &&
            this.activestagestatus[0].stagestatus == '3' &&
            this.activestagestatus[0].visitstatus == '0'
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
                this.id,
                this.userid,
                this.leadAssign,
                this.feedbackId,
                localStorage.getItem('RoleType') == '1'
                  ? localStorage.getItem('UserId')
                  : ''
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
            (this.activestagestatus[0].stage == 'RSV' &&
              this.activestagestatus[0].stagestatus == '1') ||
            (this.activestagestatus[0].stage == 'RSV' &&
              this.activestagestatus[0].stagestatus == '2') ||
            (this.activestagestatus[0].stage == 'RSV' &&
              this.activestagestatus[0].stagestatus == '4') ||
            (this.activestagestatus[0].stage == 'RSV' &&
              this.activestagestatus[0].stagestatus == null &&
              this.activestagestatus[0].visitstatus == '0')
          ) {
            this.USV = false;
            this.SV = false;
            this.Negotiation = false;
            this.leadclose = false;
            this.RSV = true;
            this.junkmove = true;
            this.followup = true;
          } else if (
            this.activestagestatus[0].stage == 'RSV' &&
            this.activestagestatus[0].stagestatus == '3' &&
            this.activestagestatus[0].visitstatus == '1'
          ) {
            this.USV = false;
            this.RSV = true;
            this.Negotiation = true;
            this.leadclose = true;
            this.followup = true;
            this.junkmove = true;
          } else if (
            this.activestagestatus[0].stage == 'RSV' &&
            this.activestagestatus[0].stagestatus == '3' &&
            this.activestagestatus[0].visitstatus == '0'
          ) {
            this.followup = true;
            this.SV = false;
            this.USV = false;
            this.RSV = true;
            this.Negotiation = false;
            this.leadclose = false;
            this.junkmove = true;
            this.usvform = false;
            this.rsvform = true;
          } else if (
            (this.activestagestatus[0].stage == 'Final Negotiation' &&
              this.activestagestatus[0].stagestatus == '1') ||
            (this.activestagestatus[0].stage == 'Final Negotiation' &&
              this.activestagestatus[0].stagestatus == '2') ||
            (this.activestagestatus[0].stage == 'Final Negotiation' &&
              this.activestagestatus[0].stagestatus == '4') ||
            (this.activestagestatus[0].stage == 'Final Negotiation' &&
              this.activestagestatus[0].stagestatus == null &&
              this.activestagestatus[0].visitstatus == '0')
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
            this.activestagestatus[0].stage == 'Final Negotiation' &&
            this.activestagestatus[0].stagestatus == '3' &&
            this.activestagestatus[0].visitstatus == '1'
          ) {
            this.USV = false;
            this.RSV = true;
            this.leadclose = true;
            this.Negotiation = true;
            this.followup = true;
            this.junkmove = true;
          } else if (
            this.activestagestatus[0].stage == 'Final Negotiation' &&
            this.activestagestatus[0].stagestatus == '3' &&
            this.activestagestatus[0].visitstatus == '0'
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
          } else if (this.activestagestatus[0].stage == 'Junk') {
            if (this.roleid == 1) {
              this.USV = false;
              this.RSV = false;
              this.Negotiation = false;
              this.leadclose = false;
              this.followup = false;
              this.junkmove = false;
              this.leadMoveJunkExec = true;
            } else if (this.roleid != '1' && this.roleid != '2') {
              if (this.feedbackId == '') {
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
              this.activestagestatus[0].stage == 'Fresh' &&
              this.activestagestatus[0].followupstatus == null
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
          if (this.activestagestatus[0].stage == 'Fresh') {
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
  }

  //here the we can revert the lead that is pushed to junk
  revertStage() {
    Swal.fire({
      title: `Do you want to Revert the lead for ${this.assignedrm[0].customer_assign_name}`,
      icon: 'question',
      heightAuto: false,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        let param = {
          leadid: this.id,
          propid: this.selectedSuggestedProp?.['propid'],
          executid: this.selectedExecId,
        };
        this._mandateService
          .revertBackToPreStage(param)
          .subscribe((resposne) => {
            if (resposne['status'] == 'True') {
              this.getstages();
              location.reload();
            }
          });
      }
    });
  }

  //to get activity of leads
  triggerhistory() {
    this.roleid = localStorage.getItem('Role');
    this.userid = localStorage.getItem('UserId');

    let execId;
    if (this.isCallHistory == 'executive') {
      execId = this.selectedExecId;
    } else {
      execId = '';
    }

    var param2 = {
      leadid: this.id,
      roleid: this.roleid,
      userid: this.userid,
      execid: execId,
      feedbackid: this.feedbackId,
    };
    this._mandateService.gethistory(param2).subscribe((history) => {
      this.showSpinner = false;
      if (history['status'] == 'True') {
        // this.leadtrack = history['Leadhistory'];

        const uniquehistory = history['Leadhistory'].filter((val, i, self) => {
          return (
            i ==
            self.findIndex((t) => {
              return (
                t.autoremarks == val.autoremarks && t.Saveddate == val.Saveddate
              );
            })
          );
        });
        this.leadtrack = uniquehistory;
      } else {
        this.leadtrack = [];
      }
    });
  }

  @ViewChild('editLeadInfoModal') editLeadInfoModal: IonModal;
  getName;
  getMail;
  onEditProfile(id) {
    this.getName = this.show_cnt.enquiry_name
      ? this.show_cnt.enquiry_name
      : this.show_cnt.customer_name;
    this.getMail = this.show_cnt.enquiry_mail
      ? this.show_cnt.enquiry_mail
      : this.show_cnt.customer_mail;
    // if(this.show_cnt.enquiry_name){

    //   $('#customer_name').val(this.show_cnt.enquiry_name);
    // }else{
    //   // ? this.show_cnt.enquiry_name : this.show_cnt.customer_name
    //   $('#customer_name').val(this.show_cnt.customer_name);
    // }
    // $('#customer_mail').val(this.show_cnt.enquiry_mail? this.show_cnt.enquiry_mail:this.show_cnt.customer_mail);
    this.editLeadInfoModal.present();

    // this._mandateService.getcustomeredit(id).subscribe(test => {
    //   this.modela = test[0];
    //   this.editmodela = test[0];
    //   this.localityid = this.editmodela['localityid'];
    //   if (this.editmodela['customer_phase'] == null) {
    //     this.editmodela['customer_phase'] = 'Fresh lead';
    //   } else {
    //   }

    //   $('#proptypeselect').val(this.show_cnt['enquiry_proptype']);
    //   $('#sizeselect').val(this.show_cnt['enquiry_bhksize']);
    //   $('#budgetselect').val(this.show_cnt['enquiry_budget']);
    //   $('#possessionselect').val(this.show_cnt['enquiry_possession']);
    //   $('#priorityselect').val(this.show_cnt['lead_priority']);
    //   $('#customer_location').val(this.show_cnt['localityid']);
    //   $('#customer_address').val(this.show_cnt['address']);
    // })
  }

  onBack() {
    this._location.back();
  }

  alternateNumbercheck(event) {
    if (event.target.value == this.show_cnt.customer_number) {
      this.show_cnt.enquiry_altnumber = '';
      $('#enquiry_number')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please enter different contact number')
        .val('');
    }
  }

  updateProfile() {
    // primary name
    if ($('#customer_name').val() === '') {
      $('#customer_name')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Enter Name');
      return false;
    } else {
      var nameFilter = /^([a-zA-Z]+\s)*[a-zA-Z]+$/;
      if (nameFilter.test(String($('#customer_name').val()))) {
        $('#customer_name').removeAttr('style');
      } else {
        $('#customer_name')
          .focus()
          .css('border-color', 'red')
          .attr('placeholder', 'Please enter valid name')
          .val('');
        return false;
      }
    }

    //primary mail
    if ($('#customer_mail').val() != '') {
      let enameFilter =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

      if (enameFilter.test(String($('#customer_mail').val()))) {
        $('#customer_mail').removeAttr('style');
      } else {
        $('#customer_mail')
          .focus()
          .css('border-color', 'red')
          .attr('placeholder', 'Please enter valid email')
          .val('');
        return false;
      }
    }

    //alternate mail
    if ($('#enquiry_mail').val() != '') {
      let enameFilter =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

      if (enameFilter.test(String($('#enquiry_mail').val()))) {
        $('#enquiry_mail').removeAttr('style');
      } else {
        $('#enquiry_mail')
          .focus()
          .css('border-color', 'red')
          .attr('placeholder', 'Please enter valid email')
          .val('');
        return false;
      }
    }
    //alternate name
    if ($('#enquiry_name').val() != '') {
      var nameFilter = /^([a-zA-Z]+\s)*[a-zA-Z]+$/;
      if (nameFilter.test(String($('#enquiry_name').val()))) {
        $('#enquiry_name').removeAttr('style');
      } else {
        $('#enquiry_name')
          .focus()
          .css('border-color', 'red')
          .attr('placeholder', 'Please enter valid name')
          .val('');
        return false;
      }
    }

    //alternate number
    var mobileno = /^[0-9]{10}$/;
    if ($('#enquiry_number').val() != '') {
      if (mobileno.test(String($('#enquiry_number').val()))) {
        $('#enquiry_number').removeAttr('style');
      } else {
        $('#enquiry_number')
          .focus()
          .css('border-color', 'red')
          .attr('placeholder', 'Please enter valid contact number')
          .val('');
        return false;
      }
    }
    var propertyselect = $('#property_select').val();
    var param = {
      primaryname: $('#customer_name').val(),
      primarynumber: $('#customer_number').val(),
      primarymail: $('#customer_mail').val(),
      name: this.show_cnt.enquiry_altname,
      number: this.show_cnt.enquiry_altnumber,
      mail: this.show_cnt.enquiry_altmail,
      budget: this.show_cnt.enquiry_budget,
      location: this.show_cnt.localityid,
      proptype: this.show_cnt.enquiry_proptype,
      size: this.show_cnt.enquiry_bhksize,
      property: propertyselect,
      priority: this.show_cnt.lead_priority,
      address: this.show_cnt.address,
      leadid: this.id,
      possession: this.show_cnt.enquiry_possession,
    };

    // var param = {
    //   primaryname: $('#customer_name').val(),
    //   primarynumber:$('#customer_number').val(),
    //   primarymail:  $('#customer_mail').val(),
    //   name: $('#enquiry_name').val(),
    //   number:$('#enquiry_number').val(),
    //   mail:  $('#enquiry_mail').val(),
    //   budget: this.show_cnt.enquiry_budget,
    //   location: this.show_cnt.localityid,
    //   proptype: this.show_cnt.enquiry_proptype,
    //   size: this.show_cnt.enquiry_bhksize,
    //   property: propertyselect,
    //   priority:this.show_cnt.lead_priority,
    //   address: this.show_cnt.address,
    //   leadid: this.id,
    //   possession: this.show_cnt.enquiry_possession
    // }
    if (localStorage.getItem('Name') == 'demo') {
      Swal.fire({
        title: 'Updating lead details is restricted for demo accounts',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'OK!',
      }).then((result) => {
        this.showSpinner = false;
      });
    } else {
      this._sharedservice.updateProfile(param).subscribe(
        (success) => {
          if (success['status'] == 'True') {
            Swal.fire({
              title: 'Updated Successfully',
              icon: 'success',
              heightAuto: false,
              confirmButtonText: 'OK!',
            }).then((result) => {
              this.editLeadInfoModal.dismiss();
              location.reload();
            });
          }
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    }
    return true;
  }
  activeTabIndex = 0;
  getexecutiveId(exec) {
    this.showSpinner = true;
    this.selectedExecId = exec.RMID;
    this.activeTabIndex = this.leadsDetailsInfo.indexOf(exec);
    this.followform = false;
    this.usvform = false;
    this.rsvform = false;

    // this.followup = false;
    // this.USV = false;
    // this.RSV = false;
    // this.Negotiation = false;
    // this.leadclose = false;
    // this.junkmove = false;

    this.finalnegoform = false;
    this.leadclosedform = false;
    this.junkform = false;
    this.assignedrm = this.leadsDetailsInfo.filter((exec) => {
      return exec.RMID == this.selectedExecId;
    });
    if (this.assignedrm[0].suggestedprop?.length > 1) {
      this.isSuggestedPropBoolean = true;
    }
    setTimeout(() => {
      this.showSpinner = false;
      this.verifyrequest(
        this.assignedrm[0].customer_IDPK,
        this.assignedrm[0]?.suggestedprop?.[0]?.propid,
        exec.RMID,
        this.assignedrm[0].suggestedprop?.[0]?.name
      );
      this.getstages();
      // this.tabclick(0, this.assignedrm[0].suggestedprop?.[0]);
    }, 1000);
    $('.radiocheck').prop('checked', false);

    //   this.router.navigate([],{
    //   queryParams:{
    //     execid:exec.RMID
    //   },
    //   queryParamsHandling: 'merge'
    // })

    setTimeout(() => {
      this.isAccompanyBy = false;
      if (
        this.userid != this.selectedExecId &&
        this.roleid != 1 &&
        this.roleid != 2 &&
        ((this.role_type == '1' &&
          (exec.roleid == 50003 || exec.roleid == 50004)) ||
          this.role_type != '1') &&
        this.feedbackId != '1'
      ) {
        $('.updateActivities').removeClass('active');
        $('.allActivities').removeClass('active');
        this.getstages();
        // setTimeout(()=>{
        //   console.log('tabclicked')
        //   const tab = document.getElementById('allActivitiesTab');
        //   if (tab) {
        //     tab.click();
        //   }
        // },100)
      } else if (
        this.userid == this.selectedExecId &&
        this.roleid != 1 &&
        this.roleid != 2 &&
        ((this.role_type == '1' &&
          exec.roleid != 50003 &&
          exec.roleid != 50004) ||
          this.role_type != '1') &&
        this.feedbackId != '1'
      ) {
        if (
          this.assignedrm &&
          this.assignedrm[0].visitaccompaniedid &&
          this.assignedrm[0].visitaccompaniedid != this.assignedrm[0].RMID
        ) {
          this.isAccompanyBy = true;
        } else {
          this.getstages();
          //  $(".allActivities").removeClass("active");
          //  const tab = document.getElementById('updateActivitiesTab');
          //  if (tab) {
          //    tab.click();
          //  }
        }
      } else if (
        this.userid != this.selectedExecId &&
        this.roleid != 1 &&
        this.roleid != 2 &&
        ((this.role_type == '1' &&
          exec.roleid != 50003 &&
          exec.roleid != 50004) ||
          this.role_type != '1') &&
        this.feedbackId != '1'
      ) {
        if (
          (this.assignedrm &&
            this.assignedrm[0].visitaccompaniedid &&
            this.assignedrm[0].visitaccompaniedid != this.assignedrm[0].RMID) ||
          this.role_type == '1'
        ) {
          this.isAccompanyBy = true;
        } else {
          this.getstages();
          // $(".allActivities").removeClass("active");
          // const tab = document.getElementById('updateActivitiesTab');
          // if (tab) {
          //   tab.click();
          // }
        }
      }
    }, 1000);

    if (this.userid != exec.RMID && !this.isAdmin && this.role_type != '1') {
      this.router.navigate([], {
        queryParams: {
          execid: exec.RMID,
          statusSection: 'activity',
          status: 'activity',
          isCallHistory: 'leads',
          propid: this.assignedrm[0]?.suggestedprop?.[0]?.propid
            ? this.assignedrm[0]?.suggestedprop?.[0]?.propid
            : this.assignedrm[0].propid,
        },
        queryParamsHandling: 'merge',
      });
    } else {
      this.router.navigate([], {
        queryParams: {
          execid: exec.RMID,
          propid: this.assignedrm[0]?.suggestedprop?.[0]?.propid
            ? this.assignedrm[0]?.suggestedprop?.[0]?.propid
            : this.assignedrm[0].propid,
        },
        queryParamsHandling: 'merge',
      });
    }
  }

  getexecutiveLeadCloseDetail() {
    this.showSpinner = true;
    this.assignedrm = this.leadsDetailsInfo.filter((exec) => {
      return exec.RMID == this.selectedExecId;
    });

    setTimeout(() => {
      this.showSpinner = false;
      this.verifyrequest(
        this.assignedrm[0].customer_IDPK,
        this.assignedrm[0].suggestedprop[0]?.propid,
        this.selectedExecId,
        this.assignedrm[0].suggestedprop[0]?.name
      );
      // this.tabclick(0, this.assignedrm[0].suggestedprop[0]);
    }, 1000);
    //  this.editLeadInfoModal.dismiss()
  }
  onfooter(value) {
    this.showSpinner = true;
    this.isProfile = value == 'info';
    this.isProperty = value == 'propertyInfo';
    this.isStatusActivity = value == 'activity';
    this.isPlanSection = false;
    this.router.navigate([], {
      queryParams: {
        status: value,
        statusSection:
          this.userid != this.selectedExecId && !this.isAdmin
            ? 'activity'
            : 'status',
        isCallHistory: value == 'activity' ? 'leads' : null,
      },
      queryParamsHandling: 'merge',
    });
    // if(value=='activity'){

    // }else{
    //   this.router.navigate([],{
    //     queryParams:{
    //       status:null,
    //       statusSection:null
    //     },
    //     queryParamsHandling: 'merge'
    //   })
    // }
  }

  //to check the img and pdf extension
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

  @ViewChild('closeddeal') closeddeal: any;
  @ViewChild('reSubmitLead') reSubmitLead: any;
  // to trigger modal
  async openModal(modalId, closedleadid) {
    if (closedleadid) {
      this.requestedunits = this.requestedunits.filter((id) => {
        return id.closedlead_id == closedleadid;
      });
    }
    if (modalId == 'resubmit') {
      this.reSubmitLead.present();
    } else if (modalId == 'closeddeal') {
      this.closeddeal.present();
    }
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

  selectedFileName;
  closurefiles = [];
  uploads = [];
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

    // for(let i=0;i<myFile.length;i++){
    //   if(myFile[i].size>1110000){
    //     Swal.fire({
    //       title: 'File Size Exceeded',
    //       text: 'File Size limit is 1MB',
    //       icon: "error",
    //       heightAuto: false,
    //       confirmButtonText: 'OK!',
    //     }).then((result) => {
    //       if (result.value) {
    //       }
    //     });
    //   }else{
    //     const fileInput = event.target as HTMLInputElement;
    //       if (fileInput.files.length > 0) {
    //         this.closurefiles = []
    //         this.selectedFileName = fileInput.files[0].name;
    //         for (let j = 0; j < event.target.files.length; j++){
    //           if(!this.closurefiles.includes(event.target.files[j])){
    //             this.closurefiles.push(event.target.files[j]);
    //             var reader = new FileReader();
    //             reader.onload = (event: any) => {
    //             this.uploads.push(event.target.result);
    //             };
    //             reader.readAsDataURL(event.target.files[j]);
    //           }
    //         }
    //         this.uploadFile(leadid,execid,propid);
    //       } else {
    //         this.selectedFileName = null;
    //       }
    //   }
    // }
  }

  uploadFile(leadid, execid, propid) {
    const formData = new FormData();
    formData.append('PropID', propid);
    formData.append('LeadID', leadid);
    formData.append('ExecID', localStorage.getItem('UserId'));
    formData.append('assignID', execid);
    for (var k = 0; k < this.closurefiles.length; k++) {
      formData.append('file[]', this.closurefiles[k]);
    }
    this._mandateService.uploadFile(formData).subscribe((res) => {
      if (res['status'] == 'True') {
        this._mandateService
          .getassignedrm(
            this.id,
            this.userid,
            this.leadAssign,
            this.feedbackId,
            localStorage.getItem('RoleType') == '1'
              ? localStorage.getItem('UserId')
              : ''
          )
          .subscribe((cust) => {
            this.assignedrm = cust['RMname'];
            this.leadsDetailsInfo = cust['RMname'];

            this.assignedrm = this.assignedrm.filter((exec) => {
              return exec.RMID == this.selectedExecId;
            });

            this.verifyrequest(
              this.assignedrm[0].customer_IDPK,
              this.assignedrm[0].suggestedprop[0].propid,
              this.selectedExecId,
              this.assignedrm[0].suggestedprop[0].name
            );
          });
        this.uploads = [];
        this.closurefiles = [];
      }
    });
  }

  // method to reject lead close request
  requestrejection(leadid, execid, propid) {
    if (this.requestedunits[0].images.length == 0) {
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
                    setTimeout(() => {
                      // location.reload();
                      this.ngOnInit();
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
                //  window.location.reload();
                this.ngOnInit();
              });
            }
          });
      }
    }
  }
  autoremarks;

  requestapproval(leadid, execid, propid) {
    // this.verifyrequest(leadid, propid, this.selectedExecId, this.selectedSuggestedProp.name);

    if (this.requestedunits[0].images.length == 0) {
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
        assignid: this.selectedExecId,
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
        this._mandateService
          .closingrequestresponse(param)
          .subscribe((requestresponse) => {
            if (requestresponse['status'] == 'True-0') {
              this.autoremarks = ' Send the Deal Closing Request successfully.';
              var leadhistparam = {
                leadid: leadid,
                closedate: this.requestedunits[0].closed_date,
                closetime: this.requestedunits[0].closed_time,
                textarearemarks: 'Deal closed Request Approved',
                leadstage: 'Lead Closed',
                stagestatus: '0',
                userid: this.userid,
                assignid: this.selectedExecId,
                property: propid,
                autoremarks: this.autoremarks,
                feedbackid: this.feedbackId,
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
                      this.ngOnInit();
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
                      this.ngOnInit();
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
      }
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
        leadid: this.id,
        closedate: closedate,
        closetime: closetime,
        leadstage: 'Edit Closed Lead',
        stagestatus: '0',
        textarearemarks: textarearemarks,
        userid: this.userid,
        assignid: this.selectedExecId,
        property: propid,
        bhk: unitsselected,
        bhkunit: unitnumbers,
        dimension: dimensions,
        ratepersft: rpsft,
        autoremarks: this.autoremarks,
        closedleadID: closeid,
        feedbackid: this.feedbackId,
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

  assignteam;
  projectNames;
  selectedMandatePropId = '';
  selectedExecIds = [];
  mandateExecutives;
  selectedMandateTeam;
  retailExecutives;
  selectedEXEC;
  @ViewChild('retailMandate', { static: true }) retailReassignModal: IonModal;
  //TO OPEN ASSIGN LEAD MODAL
  displayAssignLeadModal(type) {
    this.assignteam = type;
    this.selectedMandateTeam = '';
    this.retailTeamId = '';
    this.mandateExecutives = [];
    this.retailExecutives = [];

    this.selectedMandatePropId = '';
    this.selectedExecIds = [];
    // if (type == 'mandate') {
    this.mandateprojectsfetch();
    // }
    this.retailReassignModal.present();
  }

  //fetch properties
  mandateprojectsfetch() {
    this._mandateService.getmandateprojects().subscribe((mandates) => {
      if (mandates['status'] == 'True') {
        this.projectNames = mandates['Properties'];

        const allowedPropIds = this.fixedVisitProperties.map(
          (item) => item.propId
        ); // collect all propIds

        this.projectNames = mandates['Properties'].map((property) => {
          const isEnabled = allowedPropIds.includes(property.property_idfk);

          return {
            ...property,
            disabled: !isEnabled, // disable if not in allowed list
          };
        });
      } else {
      }
    });
  }
  // here we get the selected executive id's
  executiveSelect(event) {
    this.selectedExecIds = [];

    let execData = Array.isArray(this.selectedEXEC)
      ? this.selectedEXEC
      : [this.selectedEXEC];

    if (this.assignteam === 'mandate') {
      this.selectedExecIds = execData.map((e) => e.id);
    } else if (this.assignteam === 'retail') {
      this.selectedExecIds = execData.map((e) => e.ID);
    }

    this.selectedExecIds = Array.from(new Set(this.selectedExecIds));
  }

  //here we get the selected  mandate property
  getselectedprop(event) {
    this.selectedMandatePropId = event.target.value;
    let selectedExecTeam;
    if (this.selectedExecTeam != undefined || this.selectedExecTeam != '') {
      selectedExecTeam = this.selectedExecTeam;
    }
    this._mandateService
      .fetchmandateexecutives(
        event.target.value,
        this.selectedMandateTeam,
        selectedExecTeam?.code
      )
      .subscribe((executives) => {
        if (executives['status'] == 'True') {
          this.selectedExecIds = [];
          this.mandateExecutives = executives['mandateexecutives'];
          this.mandateExecutives = this.mandateExecutives.filter(
            (executive) => {
              return !this.leadsDetailsInfo.some(
                (rmids) => rmids.RMID == executive.id
              );
            }
          );
        }
      });
  }

  //get selected team type based on the selected assign team type
  getselectedteam(vals) {
    if (this.assignteam == 'mandate') {
      this.selectedMandateTeam = vals.detail.value;
      this._mandateService
        .fetchmandateexecutives(this.selectedMandatePropId, vals.detail.value)
        .subscribe((executives) => {
          if (executives['status'] == 'True') {
            this.selectedExecIds = [];
            this.mandateExecutives = executives['mandateexecutives'];
            this.mandateExecutives = this.mandateExecutives.filter(
              (executive) => {
                return !this.leadsDetailsInfo.some(
                  (rmids) => rmids.RMID == executive.id
                );
              }
            );
          }
        });
    } else if (this.assignteam == 'retail') {
      this.retailTeamId = vals.detail.value;
      this._mandateService
        .getexecutivesbasedid(this.retailTeamId)
        .subscribe((execute) => {
          this.selectedExecIds = [];
          this.retailExecutives = execute['Executiveslist'];
          this.retailExecutives = this.retailExecutives.filter((executive) => {
            return !this.leadsDetailsInfo.some(
              (rmids) => rmids.RMID == executive.ID
            );
          });
        });
    }
  }

  retailTeamId;
  @ViewChild('viewAssignLeadDetail') viewAssignLeadDetail;
  reassignedResponseInfo;
  // assign lead to mandate or retail
  assignLead() {
    let comma_separated_data;
    if (this.selectedExecIds) {
      comma_separated_data = this.selectedExecIds.join(', ');
    }
    if (
      this.activestagestatus[0].stage == 'Fresh' ||
      (this.activestagestatus[0].stagestatus == '1' &&
        this.activestagestatus[0].stage == 'USV')
    ) {
      if (
        this.assignteam == 'retail' &&
        (this.retailTeamId == '' || this.retailTeamId == undefined)
      ) {
        Swal.fire({
          title: 'Please Select The Team!',
          text: 'Please try agin',
          icon: 'error',
          heightAuto: false,
          confirmButtonText: 'OK!',
        });
      } else if (
        this.assignteam == 'mandate' &&
        this.selectedMandatePropId == ''
      ) {
        Swal.fire({
          title: 'Please Select The Property!',
          text: 'Please try agin',
          icon: 'error',
          heightAuto: false,
          confirmButtonText: 'OK!',
        });
        $('#property')
          .focus()
          .css('border-color', 'red')
          .attr('placeholder', 'Please Select the Property');
      } else if (this.selectedExecIds.length === 0) {
        Swal.fire({
          title: 'Please Select The Executive!',
          text: 'Please try agin',
          icon: 'error',
          heightAuto: false,
          confirmButtonText: 'OK!',
        }).then((result) => {});
        $('#rm_dropdown')
          .focus()
          .css('border-color', 'red')
          .attr('placeholder', 'Please Select the Executives');
      } else {
        $('#rm_dropdown').removeAttr('style');
        var param = {
          rmID: comma_separated_data,
          LeadID: this.id,
          random: '',
          propID: this.selectedMandatePropId,
          loginId: this.userid,
        };
        if (localStorage.getItem('Name') == 'demo') {
          Swal.fire({
            title: 'Lead assignment is not allowed for demo account.',
            icon: 'error',
            allowOutsideClick: false,
            heightAuto: false,
            confirmButtonText: 'OK',
          }).then((result) => {
            this.showSpinner = false;
          });
        } else {
          this._mandateService.leadassign(param).subscribe((success) => {
            if (success['status'] == 'True') {
              this.reassignedResponseInfo = success['details'];
              Swal.fire({
                title: 'Assigned Successfully',
                icon: 'success',
                heightAuto: false,
                confirmButtonText: 'OK!',
              }).then((result) => {
                this.showSpinner = true;
                if (result.isConfirmed) {
                  this.retailReassignModal.dismiss();
                  this.viewAssignLeadDetail.present();
                } else if (result.dismiss === Swal.DismissReason.backdrop) {
                  this.retailReassignModal.dismiss();
                  this.viewAssignLeadDetail.present();
                }
              });
            }
          });
        }
      }
    } else {
      const params = {
        rmID: comma_separated_data,
        fromExecid: this.executeid,
        leadid: this.id,
        propid: this.propid,
        random: '',
        loginid: localStorage.getItem('UserId'),
        stage: this.activestagestatus[0].stage,
      };

      this._mandateService.visitreassign(params).subscribe((response) => {
        if (response['status'] == 'True') {
          if (response['result'] == '1') {
            Swal.fire({
              title: 'Visit Re-assign Successfully',
              icon: 'success',
              heightAuto: false,
              confirmButtonText: 'OK!',
            }).then((result) => {
              this.selectedExecIds = [];
              this.selectedMandatePropId = '';
              this.selectedMandateTeam = '';
              location.reload();
            });
          } else if (response['result'] == '2') {
            Swal.fire({
              title: 'Visit Re-assign Unsuccessfull',
              text: 'The lead can be assigned only if its overdue',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'OK!',
            }).then((result) => {
              this.selectedExecIds = [];
              this.selectedMandatePropId = '';
              this.selectedMandateTeam = '';
              location.reload();
            });
          }
        }
      });
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

    if ($('#unit').val() == '') {
      $('#unit')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please type the Unit Size');
    } else if ($('#unit_number').val() == '') {
      $('#unit_number')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please type the unit number');
    } else if ($('#dimension').val() == '') {
      $('#dimension')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please type the Dimension');
    } else if ($('#rate_per_sqft').val() == '') {
      $('#rate_per_sqft')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please type the Rate Per Squarefeet');
    } else if (this.requestedunits[0].images.length == 0) {
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
        assignid: this.selectedExecId,
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
                this.ngOnInit();
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
                this.ngOnInit();
              });
            }
          });
      }
    }
  }

  enablebuttonReject: boolean = false;
  enablebuttonApprove: boolean = true;
  enableButton() {
    if ($('.rejectedtextarea').val() == '') {
      this.enablebuttonApprove = true;
      this.enablebuttonReject = false;
    } else {
      this.enablebuttonReject = true;
      this.enablebuttonApprove = false;
    }
  }

  modeldismis_reset() {
    this.retailReassignModal.dismiss();
    this.selectedMandateTeam = '';
    this.retailTeamId = '';
    this.mandateExecutives = [];
    this.retailExecutives = [];
    this.selectedMandatePropId = '';
    this.selectedExecIds = [];
    this.selectedExecTeam = null;
  }

  ngOnDestroy() {
    this.popoverController.dismiss();
    if (this.FollowUpFormComponent) {
      this.FollowUpFormComponent.closeAlert();
    }
    if (this.JunkformComponent) {
      this.JunkformComponent.closeAlert();
    }
    if (this.MandateNegoformComponent) {
      this.MandateNegoformComponent.closeAlert();
    }
    if (this.MandateRsvFormComponent) {
      this.MandateRsvFormComponent.closeAlert();
    }

    if (this.MandateUsvFormComponent) {
      this.MandateUsvFormComponent.closeAlert();
    }

    if (this.MandateCloseFormComponent) {
      this.MandateCloseFormComponent.closeAlert();
    }
  }

  refresh(event) {
    this.ngOnInit();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  selectedPlanType = '';
  selectedPlanProperties;
  visitPlanNextDate;
  visitPlanNextTime;
  visitPlanDone: boolean = false;
  editplan: boolean = false;
  visitPlantime;
  filteredFixProperties: any;
  visitPlandate;
  isWeekend = true;
  isWeekdays = false;
  isYetToConfirm = false;
  visitpanelselection;
  // to Change the section of activity and status when we logged to admin
  onStatusActivity(value) {
    // this.isAdminExeActivity = value == 'activity';
    // this.isAdminExceStatus = value== 'status';
    // this.isPlanSection = value == 'plan';
    this.showSpinner = true;
    this.router.navigate([], {
      queryParams: {
        statusSection: value,
        isCallHistory: value == 'status' || value == 'plan' ? null : 'leads',
      },
      queryParamsHandling: 'merge',
    });
  }

  onCallLeadHistory(isCall: any) {
    this.router.navigate([], {
      queryParams: {
        isCallHistory: isCall,
      },
      queryParamsHandling: 'merge',
    });
  }

  checkstage() {
    if (
      this.assignedrm &&
      this.assignedrm[0].leadstage == 'Fresh' &&
      this.assignedrm[0].followupreason == '8'
    ) {
      Swal.fire({
        title: 'Please Fix the USV..!',
        icon: 'warning',
        heightAuto: false,
        timer: 2000,
        showConfirmButton: false,
      });
    }
    if (
      this.selectedPlanType == 'weekend' ||
      this.selectedPlanType == 'weekdays'
    ) {
      let listofProperties: any = [];
      if (
        this.assignedrm &&
        this.assignedrm[0].leadstage == 'USV' &&
        this.assignedrm[0].suggestedprop
      ) {
        this.visitPlanNextDate = this.selectedSuggestedProp?.['nextdate'];
        this.visitPlanNextTime = this.selectedSuggestedProp?.['nexttime'];
      } else if (
        this.assignedrm &&
        this.assignedrm[0].leadstage == 'RSV' &&
        this.assignedrm[0].suggestedprop
      ) {
        this.visitPlanNextDate = this.selectedSuggestedProp?.['nextdate'];
        this.visitPlanNextTime = this.selectedSuggestedProp?.['nexttime'];
      } else if (
        this.assignedrm &&
        this.assignedrm[0].leadstage == 'Final Negotiation' &&
        this.assignedrm[0].suggestedprop
      ) {
        this.visitPlanNextDate = this.selectedSuggestedProp?.['nextdate'];
        this.visitPlanNextTime = this.selectedSuggestedProp?.['nexttime'];
      }
    }
    this.checkWeekDay();
    setTimeout(() => {
      this.scriptfunctions();
    }, 0);
  }

  selectedplan(plantype) {
    this.selectedPlanType = plantype;
    setTimeout(() => {
      this.scriptfunctions();
    }, 0);
    if (
      this.selectedPlanType == 'weekend' ||
      this.selectedPlanType == 'weekdays'
    ) {
      if (this.assignedrm && this.assignedrm[0].leadstage == 'USV') {
        this.visitPlanNextDate = this.selectedSuggestedProp?.['nextdate'];
        this.visitPlanNextTime = this.selectedSuggestedProp?.['nexttime'];
        // },0);
      } else if (
        this.assignedrm &&
        this.assignedrm[0].leadstage == 'RSV' &&
        this.assignedrm[0].suggestedprop
      ) {
        // setTimeout(()=>{
        this.visitPlanNextDate = this.selectedSuggestedProp?.['nextdate'];
        this.visitPlanNextTime = this.selectedSuggestedProp?.['nexttime'];
        // },0);
      } else if (
        this.assignedrm &&
        this.assignedrm[0].leadstage == 'Final Negotiation' &&
        this.assignedrm[0].suggestedprop
      ) {
        // setTimeout(()=>{
        this.visitPlanNextDate = this.selectedSuggestedProp?.['nextdate'];
        this.visitPlanNextTime = this.selectedSuggestedProp?.['nexttime'];
        // },0);
      }
    }
    // $('#visitPlandate').val('');
    // $('#visitPlantime').val('');
    setTimeout(() => {
      this.checkWeekDay();
    }, 0);
  }

  scriptfunctions() {}

  checkWeekDay() {
    let date = new Date(this.assignedrm[0].suggestedprop?.[0]?.actiondate);
    let day = date.getDay();
    let isWeekend = day === 6 || day === 0;
    if (isWeekend) {
      if (this.selectedPlanType == 'weekend') {
        if (
          this.assignedrm &&
          this.assignedrm[0].suggestedprop[0].weekplan == '2'
        ) {
          this.visitPlanDone = true;
        } else {
          this.visitPlanDone = false;
        }
        // this.visitPlanDone = false;
      } else {
        // this.visitPlanDone = true
        if (this.selectedPlanType == '2') {
          this.visitPlanDone = false;
        } else {
          this.visitPlanDone = true;
        }
      }
    } else {
      if (this.selectedPlanType == 'weekdays') {
        if (
          this.assignedrm &&
          this.assignedrm[0].suggestedprop[0].weekplan == '1'
        ) {
          this.visitPlanDone = true;
        } else {
          this.visitPlanDone = false;
        }
        // this.visitPlanDone = false;
      } else {
        if (this.selectedPlanType == '1') {
          this.visitPlanDone = false;
        } else {
          this.visitPlanDone = true;
        }
        // this.visitPlanDone = true
      }
    }
  }

  editvisitPlan(type) {
    if (
      this.assignedrm &&
      this.assignedrm[0].suggestedprop &&
      this.assignedrm[0].suggestedprop[0].weekplan == '2'
    ) {
      this.selectedPlanType = 'weekend';
      setTimeout(() => {
        $('#visitPlandate').val(this.assignedrm[0].suggestedprop[0].actiondate);
        $('#visitPlantime').val(this.assignedrm[0].suggestedprop[0].actiontime);
        this.visitPlandate = this.assignedrm[0].suggestedprop[0].actiondate;
        this.visitPlantime = this.assignedrm[0].suggestedprop[0].actiontime;
      }, 100);
    } else if (
      this.assignedrm &&
      this.assignedrm[0].suggestedprop &&
      this.assignedrm[0].suggestedprop[0].weekplan == '1'
    ) {
      this.selectedPlanType = 'weekdays';
      setTimeout(() => {
        $('#visitPlandate').val(this.assignedrm[0].suggestedprop[0].actiondate);
        $('#visitPlantime').val(this.assignedrm[0].suggestedprop[0].actiontime);
        this.visitPlandate = this.assignedrm[0].suggestedprop[0].actiondate;
        this.visitPlantime = this.assignedrm[0].suggestedprop[0].actiontime;
      }, 100);
    } else if (
      this.assignedrm &&
      this.assignedrm[0].suggestedprop &&
      this.assignedrm[0].suggestedprop[0].weekplan == '0'
    ) {
      this.selectedPlanType = 'ytc';
    } else if (
      this.assignedrm &&
      this.assignedrm[0].suggestedprop &&
      this.assignedrm[0].suggestedprop[0].weekplan == null
    ) {
      if (type == 'edit') {
        setTimeout(() => {
          $('#visitPlandate').val(this.assignedrm[0].suggestedprop[0].nextdate);
          $('#visitPlantime').val(this.assignedrm[0].suggestedprop[0].nexttime);
          this.visitPlandate = this.assignedrm[0].suggestedprop[0].nextdate;
          this.visitPlantime = this.assignedrm[0].suggestedprop[0].nexttime;
          // this.scriptfunctions();
        }, 100);
      }
    }
    // this.scriptfunctions();
    this.editplan = true;
  }

  isWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();

    this.cdf.detectChanges();
    return this.selectedPlanType == 'weekdays'
      ? utcDay !== 0 && utcDay !== 6
      : utcDay === 0 || utcDay === 6;
  };

  timeError: boolean = false;
  confirmbtnClicked: boolean = false;
  // to display date in the format of YYYY-MM-DD
  onDateChange(event: CustomEvent) {
    const selectedDate = new Date(event.detail.value);
    this.visitPlandate = selectedDate.toLocaleDateString('en-CA');
  }

  validateTime(): void {
    if (this.visitPlantime) {
      const [time, modifier] = this.visitPlantime.split(' ');
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
      this.visitPlantime = '';
      $('#visitPlantime').val('');
      $('#refixtime').val('');
      $('#RSVvisitedtime').val('');
      $('#subrsvnextactiontime').val('');
    }
  }
  selectedpropertylists;
  fixPlan() {
    let selectPlanid: any;
    if (this.selectedPlanType == 'weekend') {
      selectPlanid = 2;
    } else if (this.selectedPlanType == 'weekdays') {
      selectPlanid = 1;
    } else if (this.selectedPlanType == 'ytc') {
      selectPlanid = 0;
    }

    if (
      this.selectedPlanType == '' ||
      this.selectedPlanType == undefined ||
      this.selectedPlanType == null
    ) {
      Swal.fire({
        title: 'Please select the correct weekdays date',
        text: 'Select the correct date',
        icon: 'error',
        heightAuto: false,
        timer: 2000,
        showConfirmButton: true,
      });
    } else if (
      this.confirmbtnClicked == false &&
      $('#visitPlandate').val() == ''
    ) {
      $('#visitPlandate')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Select One Date');
    } else if ($('#visitPlantime').val() == '') {
      $('#visitPlandate').removeAttr('style');
      $('#visitPlantime')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Select The Time');
    } else if ($('#visitPlandate').val() != '') {
      const rawVal = $('#visitPlandate').val();
      const date = new Date(String(rawVal));
      let day = date.getDay();
      let isWeekend = day === 6 || day === 0;
      if (isWeekend && this.selectedPlanType != 'weekend') {
        $('#visitPlandate').removeAttr('style');
        Swal.fire({
          title: 'Please select the correct weekdays date',
          text: 'Select the correct date',
          icon: 'error',
          heightAuto: false,
          timer: 2000,
          showConfirmButton: false,
        });
      } else if (!isWeekend && this.selectedPlanType != 'weekdays') {
        $('#visitPlandate').removeAttr('style');
        Swal.fire({
          title: 'Please select the correct weekend date',
          text: 'Select the correct date',
          icon: 'error',
          heightAuto: false,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        $('#visitPlantime').removeAttr('style');
        if (this.confirmbtnClicked == true) {
          var nextdate = this.visitPlanNextDate;
          var nexttime = this.visitPlanNextTime;
        } else {
          var nextdate: any = $('#visitPlandate').val();
          var nexttime: any = $('#visitPlantime').val();
        }
        this.showSpinner = true;
        if (this.activestagestatus[0].stage == 'USV') {
          var param = {
            leadid: this.id,
            nextdate: nextdate,
            nexttime: nexttime,
            suggestproperties: this.selectedSuggestedProp['propid'],
            execid: this.userid,
            assignid: this.selectedExecId,
          };

          this._mandateService
            .addselectedsuggestedproperties(param)
            .subscribe((success) => {
              this._mandateService
                .getselectedsuggestproperties(
                  this.id,
                  this.userid,
                  this.selectedExecId
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
                    'Scheduled the USV for ' +
                    this.selectedproperty_commaseperated +
                    ' On ' +
                    nextdate +
                    ' ' +
                    nexttime;
                  var leadusvhistparam = {
                    leadid: this.id,
                    closedate: nextdate,
                    closetime: nexttime,
                    leadstage: 'USV',
                    stagestatus: '1',
                    textarearemarks: '',
                    userid: this.userid,
                    assignid: this.selectedExecId,
                    autoremarks: this.autoremarks,
                    property: this.selectedSuggestedProp['propid'],
                    feedbackid: this.feedbackId,
                  };
                  this._mandateService
                    .addleadhistory(leadusvhistparam)
                    .subscribe(
                      (success) => {
                        if (success['status'] == 'True') {
                          let params = {
                            execid: this.selectedExecId,
                            leadid: this.id,
                            planid: selectPlanid,
                            plandate: nextdate,
                            plantime: nexttime,
                            stage: this.assignedrm[0].leadstage,
                            stagestatus: this.assignedrm[0].leadstatus,
                            loginid: this.userid,
                            propid: this.selectedSuggestedProp['propid'],
                          };
                          this._mandateService
                            .updatemyplan(params)
                            .subscribe((response) => {
                              this.showSpinner = false;
                              if (response['status'] == 'True') {
                                Swal.fire({
                                  title: 'Plan Confirmed',
                                  text: 'Visit Plan added Successfully',
                                  icon: 'success',
                                  heightAuto: false,
                                  timer: 2000,
                                  showConfirmButton: false,
                                }).then(() => {
                                  location.reload();
                                });
                              }
                            });
                        } else if (
                          success['status'] == 'False' &&
                          success['data']
                        ) {
                          Swal.fire({
                            title: ` ${success['data'][0].Lead_stage} already fixed by ${success['data'][0].name}`,
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
        } else if (this.activestagestatus[0].stage == 'RSV') {
          var param1 = {
            leadid: this.id,
            nextdate: nextdate,
            nexttime: nexttime,
            suggestproperties: this.selectedSuggestedProp['propid'],
            execid: this.userid,
            assignid: this.selectedExecId,
          };
          this._mandateService.addrsvselected(param1).subscribe(
            (success) => {
              if (success['status'] == 'True') {
                var param = {
                  leadid: this.id,
                  execid: this.userid,
                  stage: 'RSV',
                  assignid: this.selectedExecId,
                };

                this._mandateService
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
                      nextdate +
                      ' ' +
                      nexttime;
                    var leadrsvfixparam = {
                      leadid: this.id,
                      closedate: nextdate,
                      closetime: nexttime,
                      leadstage: 'RSV',
                      stagestatus: '1',
                      textarearemarks: '',
                      userid: this.userid,
                      assignid: this.selectedExecId,
                      autoremarks: this.autoremarks,
                      property: this.selectedSuggestedProp['propid'],
                      feedbackid: this.feedbackId,
                    };
                    this._mandateService
                      .addleadhistory(leadrsvfixparam)
                      .subscribe(
                        (success) => {
                          if (success['status'] == 'True') {
                            let params = {
                              execid: this.selectedExecId,
                              leadid: this.id,
                              planid: selectPlanid,
                              plandate: nextdate,
                              plantime: nexttime,
                              stage: this.assignedrm[0].leadstage,
                              stagestatus: this.assignedrm[0].leadstatus,
                              loginid: this.userid,
                              propid: this.selectedSuggestedProp['propid'],
                            };
                            this._mandateService
                              .updatemyplan(params)
                              .subscribe((response) => {
                                this.showSpinner = false;
                                if (response['status'] == 'True') {
                                  Swal.fire({
                                    title: 'Plan Confirmed',
                                    text: 'Visit Plan added Successfully',
                                    icon: 'success',
                                    timer: 2000,
                                    heightAuto: false,
                                    showConfirmButton: false,
                                  }).then(() => {
                                    location.reload();
                                  });
                                }
                              });
                          } else if (
                            success['status'] == 'False' &&
                            success['data']
                          ) {
                            Swal.fire({
                              title: ` ${success['data'][0].Lead_stage} already fixed by ${success['data'][0].name}`,
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
        } else if (this.activestagestatus[0].stage == 'Final Negotiation') {
          var param3 = {
            leadid: this.id,
            nextdate: nextdate,
            nexttime: nexttime,
            suggestproperties: this.selectedSuggestedProp['propid'],
            execid: this.userid,
            assignid: this.selectedExecId,
          };
          this._mandateService.addnegoselected(param3).subscribe(
            (success) => {
              this._mandateService
                .negoselectproperties(
                  this.id,
                  this.userid,
                  this.selectedExecId,
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
                    nextdate +
                    ' ' +
                    nexttime;
                  var leadnegofixparam = {
                    leadid: this.id,
                    closedate: nextdate,
                    closetime: nexttime,
                    leadstage: 'Final Negotiation',
                    stagestatus: '1',
                    textarearemarks: '',
                    userid: this.userid,
                    assignid: this.selectedExecId,
                    autoremarks: this.autoremarks,
                    property: this.selectedSuggestedProp['propid'],
                    feedbackid: this.feedbackId,
                  };
                  this._mandateService
                    .addleadhistory(leadnegofixparam)
                    .subscribe(
                      (success) => {
                        if (success['status'] == 'True') {
                          let params = {
                            execid: this.selectedExecId,
                            leadid: this.id,
                            planid: selectPlanid,
                            plandate: nextdate,
                            plantime: nexttime,
                            stage: this.assignedrm[0].leadstage,
                            stagestatus: this.assignedrm[0].leadstatus,
                            loginid: this.userid,
                            propid: this.selectedSuggestedProp['propid'],
                          };
                          this._mandateService
                            .updatemyplan(params)
                            .subscribe((response) => {
                              this.showSpinner = false;
                              if (response['status'] == 'True') {
                                Swal.fire({
                                  title: 'Plan Confirmed',
                                  text: 'Visit Plan added Successfully',
                                  icon: 'success',
                                  heightAuto: false,
                                  timer: 2000,
                                  showConfirmButton: false,
                                }).then(() => {
                                  location.reload();
                                });
                              }
                            });
                        } else if (
                          success['status'] == 'False' &&
                          success['data']
                        ) {
                          Swal.fire({
                            title: ` ${success['data'][0].Lead_stage} already fixed by ${success['data'][0].name}`,
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
  }

  confirmPlan() {
    this.confirmbtnClicked = true;
    setTimeout(() => {
      this.fixPlan();
    }, 0);
  }

  trimSpce(value) {
    return value.bhk.trim();
  }

  // MERG LEADS
  @ViewChild('mergeModal') mergeModal;
  @ViewChild('viewToMergedLeads') viewToMergedLeads;
  selectedRelation;
  filteredLead = [];
  relationShips = [
    { name: 'Father', code: 'Father' },
    { name: 'Mother', code: 'Mother' },
    { name: 'Sister', code: 'Sister' },
    { name: 'Brother', code: 'Brother' },
    { name: 'Husband', code: 'Husband' },
    { name: 'Wife', code: 'Wife' },
    { name: 'Others', code: 'Others' },
  ];
  searchSubject = new Subject<string>();
  filteredLeads = [];
  leadSearchTerm;
  isActiveMerge = false;
  searchClient(event): void {
    this.showSpinner = true;
    const query = event.target.value;
    if (query.length >= 5) {
      this.searchSubject.next(query);
    } else {
      this.filteredLeads = [];
      this.showSpinner = false;
    }
  }

  fetchData(query: string) {
    let searchedData;
    if (/^[\d\s+]+$/.test(query)) {
      searchedData = query.replace(/\s+/g, '');
      searchedData = searchedData.slice(-10);
    } else {
      searchedData = query;
    }
    this._sharedservice.searchLeads(searchedData, '', '', '1').subscribe({
      next: (response) => {
        if (response['status'] == 'True') {
          this.filteredLeads = response['Searchlist'];
          this.showSpinner = false;
        } else {
          this.filteredLeads = [];
          this.showSpinner = false;
        }
      },
      error: (error) => {
        this.filteredLeads = [];
        this.showSpinner = false;
      },
    });
  }
  toViewMergedLeads() {
    this.viewToMergedLeads.present();
  }
  onMergeIcon() {
    this.mergeModal.present();
  }

  onCloseMergeModal() {
    this.filteredLead = [];
    this.filteredLeads = [];
    this.leadSearchTerm = '';
    this.isActiveMerge = false;
    this.mergeModal.dismiss();
  }

  onFilteredLead(lead) {
    this.filteredLead = [];
    this.filteredLead.push(lead);
    this.isActiveMerge = true;
    this.leadSearchTerm = '';
    this.filteredLeads = [];
  }

  relationshipSelect(event) {
    console.log(event);
  }

  onMergeLead() {
    if (
      this.selectedRelation == '' ||
      this.selectedRelation == undefined ||
      this.selectedRelation == null
    ) {
      Swal.fire({
        title: 'Relation',
        text: 'Please select the Relationship',
        timer: 2000,
        heightAuto: false,
        showConfirmButton: false,
        icon: 'error',
      });
      $('#relationship_dropdown')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Select the Relation');
      return false;
    }

    let param = {
      leadId: this.id,
      mergeLeadId: this.filteredLead[0].customer_IDPK,
      relation: this.selectedRelation.name,
    };

    this._sharedservice.postMergeLeads(param).subscribe((resp) => {
      Swal.fire({
        title: 'Merge Lead',
        text: 'The Lead has been successfully Merged',
        showConfirmButton: false,
        timer: 2000,
        heightAuto: false,
        icon: 'success',
      }).then(() => {
        location.reload();
      });
    });
    return true;
  }

  isRetail = false;
  onHtype(htype) {
    if (this.isRetail) {
      this.router.navigate(['assigned-leads-detail'], {
        queryParams: {
          htype: 'retail',
          execid: !this.isAdmin ? this.userid : this.selectedExecId,
        },
        queryParamsHandling: 'merge',
      });
    } else {
      this.router.navigate(['mandate-customers'], {
        queryParams: {
          htype: 'mandate',
        },
        queryParamsHandling: 'merge',
      });
    }
  }

  openEndMenu() {
    this._sharedservice.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  accessNow(execDetails) {
    this.isAccompanyBy = false;
    // this.router.navigateByUrl(`/mandate-customers/${this.id}/${this.assignedrm[0].visitaccompaniedid}/${this.feedbackId}/${this.htype}`);
    setTimeout(() => {
      let accompapiedData = this.leadsDetailsInfo.filter(
        (exec) => exec.RMID == this.assignedrm[0].visitaccompaniedid
      );

      this.router.navigate([], {
        queryParams: {
          execid: accompapiedData[0].RMID,
          propid: accompapiedData[0].propid,
        },
        queryParamsHandling: 'merge',
      });
      // console.log(accompapiedData);
      // this.showSpinner = true;
      // this.selectedExecId = accompapiedData[0].RMID;
      // this.activeTabIndex = this.leadsDetailsInfo.indexOf(accompapiedData[0]);
      // this.followform = false;
      // this.usvform = false;
      // this.rsvform = false;
      // this.finalnegoform = false;
      // this.leadclosedform = false;
      // this.junkform = false;

      // //  this.router.navigate([],{
      // //       queryParams:{
      // //         execid:accompapiedData[0].RMID,
      // //       },
      // //       queryParamsHandling: 'merge'
      // //   })

      // const currentUrlTree = this.router.parseUrl(this.router.url);
      // currentUrlTree.queryParams['execid'] = accompapiedData[0].RMID;
      // currentUrlTree.queryParams['propid'] = accompapiedData[0].propid;

      // this._location.go(this.router.serializeUrl(currentUrlTree));

      // // this.getcustomerview();

      // // this.router.navigateByUrl(`/mandate-customers/${this.id}/${this.selectedExecId}/${this.feedbackId}/${this.htype}`);

      // this.assignedrm = this.leadsDetailsInfo.filter((exec) => {
      //   return exec.RMID == this.selectedExecId;
      // });

      // if (
      //   this.assignedrm &&
      //   this.assignedrm.length > 0 &&
      //   this.assignedrm[0].suggestedprop &&
      //   this.assignedrm[0].suggestedprop.length > 1
      // ) {
      //   this.isSuggestedPropBoolean = true;
      //   let propertyData;
      //   let propIndex;
      //   this.assignedrm[0].suggestedprop.forEach((prop, index) => {
      //     propertyData = prop;
      //     propIndex = index;
      //   });
      //   if (
      //     (propertyData.selection == 1 &&
      //       propertyData.leadstage == 'USV' &&
      //       propertyData.actions == 0) ||
      //     (propertyData.selection == 2 &&
      //       propertyData.leadstage == 'RSV' &&
      //       propertyData.actions == 1)
      //   ) {
      //     this.selectedItem = propIndex;
      //     setTimeout(() => {
      //       // this.tabclick(propIndex, propertyData);
      //     }, 100);
      //   }
      // } else {
      //   // this.selectedItem = 0;
      //   if (
      //     this.assignedrm &&
      //     this.assignedrm.length > 0 &&
      //     this.assignedrm[0].suggestedprop
      //   ) {
      //     // this.tabclick(0, this.assignedrm[0].suggestedprop[0]);
      //   }
      // }

      // if (
      //   this.assignedrm &&
      //   this.assignedrm.length > 0 &&
      //   this.assignedrm[0].suggestedprop
      // ) {
      //   this.visitpanelselection = this.assignedrm[0].suggestedprop.filter(
      //     (prop) => {
      //       return !(prop.weekplan == null);
      //     }
      //   );

      //   if (this.selectedSuggestedProp) {
      //     if (this.selectedSuggestedProp.weekplan == '1') {
      //       this.selectedPlanType = 'weekdays';
      //     } else if (this.selectedSuggestedProp.weekplan == '2') {
      //       this.selectedPlanType = 'weekend';
      //     } else if (this.selectedSuggestedProp.weekplan == '0') {
      //       this.selectedPlanType = 'ytc';
      //     }
      //   }
      // }

      // setTimeout(() => {
      //   this.getstages();
      //   this.triggerhistory();
      //   this.scriptfunctions();
      //   this.showSpinner = false;
      // }, 10);
    }, 0);
  }

  @ViewChild('callConfirmationModal') callConfirmationModal;
  outboundCall() {
    this.showSpinner = true;
    const cleanedNumber =
      this.show_cnt?.customer_number.startsWith('91') &&
      this.show_cnt?.customer_number.length > 10
        ? this.show_cnt?.customer_number.slice(2)
        : this.show_cnt?.customer_number;

    const param = {
      execid: this.localStorage.getItem('UserId'),
      callto: cleanedNumber,
      leadid: this.show_cnt.customer_IDPK,
      starttime: this.getCurrentDateTime(),
      modeofcall: 'mobile-' + this.htype,
      leadtype: this.htype,
      assignee: this.selectedExecId,
    };
    this._sharedservice.outboundCall(param).subscribe(() => {
      this.showSpinner = false;
      this.getLiveCallsData(this.show_cnt.customer_IDPK);
      this.callConfirmationModal.dismiss();
    });
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

  navigateToWhatsApp() {
    window.open(
      `https://wa.me/+91 ${this.show_cnt?.customer_number}`,
      '_system'
    );
    // this.router.navigate(['./clients-chats'], {
    //   queryParams: {
    //     chatListSearch: this.show_cnt?.customer_number,
    //     selectedChat: 'all',
    //     htype: this.htype,
    //   },
    // });
  }

  allCallLogs = [];
  getAllCallLogs(isLoadmore) {
    const params = {
      loginid: this.userid,
      execid: this.executeid,
      clientnum: this.assignedrm?.[0]?.customer_number,
      limit: 0,
      limitrows: 30,
    };
    return new Promise((resolve, reject) => {
      this._sharedservice.fetchAllCallLogs(params).subscribe({
        next: (response: any) => {
          this.showSpinner = false;
          if (response['status'] == 'success') {
            this.allCallLogs = isLoadmore
              ? this.allCallLogs.concat(response['success'])
              : response['success'];
            this.groupByDate(response['success']);
            resolve(true);
          } else {
            this.showSpinner = false;
            this.allCallLogs = [];
            resolve(false);
          }
        },
        error: (err) => {
          console.log('error', err);
          this.allCallLogs = [];
          this.showSpinner = false;
          resolve(false);
        },
      });
    });
  }
  groupedByDate: any[] = [];
  groupByDate(records: any[]) {
    const grouped = {};
    records.forEach((call) => {
      const date = call.starttime.split(' ')[0]; // extract 'YYYY-MM-DD'
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(call);
    });
    // Convert object to array (Angular 5 doesn’t support keyvalue pipe)
    this.groupedByDate = Object.keys(grouped).map((date) => ({
      date,
      calls: grouped[date],
    }));
  }

  isDateOver30Days(dateString: string): boolean {
    // Parse the date string into a Date object
    const dateObject = new Date(dateString);
    // Get today's date and subtract 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Compare the parsed date with the 30-day threshold using getTime()
    return dateObject.getTime() < thirtyDaysAgo.getTime();
  }

  clientregistereddata;
  propertyid;
  buildernamereg;
  property;
  fetchregistereddata(leadid, propid) {
    var param = {
      leadid: leadid,
      propid: propid,
    };
    this._retailservice
      .fetchclientregistereddata(param)
      .subscribe((regdata) => {
        this.clientregistereddata = regdata['registereddata'][0];
      });
  }
  fetchmails(name, propid) {
    this.showSpinner = true;
    this.propertyid = propid;
    this._retailservice.getfetchmail(propid).subscribe((mails) => {
      this.showSpinner = false;
      this.mails = mails['Buildermail'];
      this.buildernamereg = this.mails[0]['builderInfo_name'];
    });
    this.property = name;
  }
  toselect;
  registrationremarks;
  ccselect;
  clientregisteration() {
    this.toselect = $('#mailtoselect').val();
    this.registrationremarks = $('#regremarks').val();

    if ($('#ccselect').val() == '') {
      this.ccselect = this.toselect;
    } else {
      this.ccselect = $('#ccselect').val();
    }

    if ($('#mailtoselect').val() == '') {
      $('.sendto')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Enter Name');
    } else {
      $('.sendto').removeAttr('style');

      var param = {
        leadid: this.id,
        propid: this.propertyid,
        customer: this.assignedrm?.[0].customer_name,
        customernum: this.assignedrm?.[0].customer_number,
        customermail: this.assignedrm?.[0].customer_mail,
        rmname: localStorage.getItem('Name'),
        rmmail: localStorage.getItem('Mail'),
        builder: this.buildernamereg,
        property: this.property,
        sendto: this.toselect,
        sendcc: this.ccselect,
        execid: this.selectedExecId,
        remarks: this.registrationremarks,
      };
      this.showSpinner = true;
      this._retailservice.clientregistration(param).subscribe(
        (success) => {
          var status = success['status'];
          var data = success['success'];

          if (status == '1') {
            this.showSpinner = false;
            Swal.fire({
              title: 'Mail Sent Successfully!',
              text: 'This Data registered on 30 Days before so Re-registered Successfully',
              icon: 'success',
              heightAuto: false,
            }).then((result) => {
              if (result.value) {
                location.reload();
              }
            });
          } else if (status == '0') {
            this.showSpinner = false;
            Swal.fire({
              title: 'Mail Sent Successfully!',
              text: 'Registered Successfully',
              icon: 'success',
              heightAuto: false,
            }).then((result) => {
              if (result.value) {
                location.reload();
              }
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
              heightAuto: false,
              showConfirmButton: true,
            });
          }
        },
        (err) => {
          console.log('Failed to Update');
        }
      );
    }
  }
  alert() {
    Swal.fire({
      title: 'Lead in Junk',
      text: 'This lead is currently marked as Junk. Please revert the lead first to make a call.',
      icon: 'warning',
      confirmButtonText: 'OK',
      heightAuto: false,
    });
  }
  suggestedproperties;
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

  addpropertiestolist() {
    let param = {
      LeadID: this.id,
      Stage: this.activestagestatus?.[0].stage,
      Execid: this.userid,
      assignID: this.selectedExecId,
      PropertyID: this.suggestedproperties,
    };
    this._mandateService.addsuggestedproperties(param).subscribe((success) => {
      if (success['status'] == 'True') {
        Swal.fire({
          title: 'Suggested Successfully Added',
          icon: 'success',
          heightAuto: false,
          confirmButtonText: 'OK!',
        }).then((result) => {
          this.getAssignedRM();
          this.suggModal.dismiss();
          this._retailservice.isCloseSuggModal = true;
        });
      }
    });
  }

  getAssignedRM() {
    this._mandateService
      .getassignedrm(
        this.id,
        this.userid,
        this.leadAssign,
        this.feedbackId,
        localStorage.getItem('RoleType') == '1'
          ? localStorage.getItem('UserId')
          : ''
      )
      .subscribe((cust) => {
        if (
          cust.lead == '1' &&
          this.selectedExecId == this.userid &&
          (localStorage.getItem('Role') === '50003' ||
            localStorage.getItem('Role') === '50004')
        ) {
          this.confirmLeadConversionToMandate();
        }

        this.assignedrm = cust['RMname'];
        this.leadsDetailsInfo = cust['RMname'];

        this.usvstagedetection = cust['RMname'][0].leadstage;
        this.usvstagestatusdetection = cust['RMname'][0].leadstatus;
        this.assignedrm = this.assignedrm.filter((exec) => {
          return exec.RMID == this.selectedExecId;
        });

        if (this.assignedrm) {
          if (
            this.assignedrm.length > 0 &&
            this.assignedrm[0].rnrcount >= 5 &&
            this.roleid != 1 &&
            this.roleid != '2'
          ) {
            Swal.fire({
              text: 'Access Denied , Do contact the Admin',
              icon: 'error',
              heightAuto: false,
            }).then(() => {
              this.router.navigate(['mandate-lead-stages'], {
                queryParams: {
                  status: 'inactive',
                  type: 'Inactive',
                  isDropDown: 'false',
                  followup: '2',
                  htype: 'mandate',
                },
              });
            });
          }
        }

        setTimeout(() => {
          this.isAccompanyBy = false;
          if (
            this.userid != this.selectedExecId &&
            this.roleid != '1' &&
            this.roleid != '2' &&
            ((this.role_type == '1' &&
              (this.assignedrm.roleid == '50003' ||
                this.assignedrm.roleid == '50004')) ||
              this.role_type != '1') &&
            this.feedbackId != '1'
          ) {
            $('.updateActivities').removeClass('active');
            $('.allActivities').removeClass('active');
            setTimeout(() => {
              const tab = document.getElementById('allActivitiesTab');
              if (tab) {
                tab.click();
              }
            }, 100);
          } else if (
            this.userid == this.selectedExecId &&
            this.roleid != '1' &&
            this.roleid != '2' &&
            this.role_type == '1' &&
            this.assignedrm.roleid != '50003' &&
            this.assignedrm.roleid != '50004' &&
            this.feedbackId != '1'
          ) {
            if (
              this.assignedrm &&
              this.assignedrm[0].visitaccompaniedid &&
              this.assignedrm[0].visitaccompaniedid != this.assignedrm[0].RMID
            ) {
              this.isAccompanyBy = true;
            } else {
              $('.allActivities').removeClass('active');
              const tab = document.getElementById('updateActivitiesTab');
              if (tab) {
                tab.click();
              }
            }
          } else if (
            this.userid != this.selectedExecId &&
            this.roleid != '1' &&
            this.roleid != '2' &&
            ((this.role_type == '1' &&
              this.assignedrm.roleid != '50003' &&
              this.assignedrm.roleid != '50004') ||
              this.role_type != '1') &&
            this.feedbackId != '1'
          ) {
            if (
              (this.assignedrm &&
                this.assignedrm[0].visitaccompaniedid &&
                this.assignedrm[0].visitaccompaniedid !=
                  this.assignedrm[0].RMID) ||
              this.role_type == '1'
            ) {
              this.isAccompanyBy = true;
            } else {
              $('.allActivities').removeClass('active');
              const tab = document.getElementById('updateActivitiesTab');
              if (tab) {
                tab.click();
              }
            }
          }
        }, 1000);

        if (this.assignedrm[0].suggestedprop?.length > 1) {
          this.isSuggestedPropBoolean = false;
          let propertyData, propIndex;
          this.assignedrm[0].suggestedprop.forEach((prop, index) => {
            propertyData = prop;
            propIndex = index;
          });
          if (
            (propertyData.selection == 1 &&
              propertyData.leadstage == 'USV' &&
              propertyData.actions == 0) ||
            (propertyData.selection == 2 &&
              propertyData.leadstage == 'RSV' &&
              propertyData.actions == 1)
          ) {
            this.selectedItem = propIndex;
            setTimeout(() => {
              // this.tabclick(propIndex, propertyData);
            }, 100);
          } else {
            this.selectedItem = 0;
            setTimeout(() => {
              // this.tabclick(
              //   this.selectedItem,
              //   this.assignedrm[0].suggestedprop?.[0]
              // );
            }, 100);
          }
        } else {
          this.selectedItem = 0;
          setTimeout(() => {
            // this.tabclick(
            //   this.selectedItem,
            //   this.assignedrm[0].suggestedprop?.[0]
            // );
          }, 100);
        }

        if (this.assignedrm && this.assignedrm[0].suggestedprop) {
          this.visitpanelselection = this.assignedrm[0].suggestedprop.filter(
            (prop) => {
              return !(prop.weekplan == null);
            }
          );
          if (
            this.visitpanelselection.length > 0 &&
            this.visitpanelselection[0].weekplan == '1'
          ) {
            this.selectedPlanType = 'weekdays';
          } else if (
            this.visitpanelselection.length > 0 &&
            this.visitpanelselection[0].weekplan == '2'
          ) {
            this.selectedPlanType = 'weekend';
          } else if (
            this.visitpanelselection.length > 0 &&
            this.visitpanelselection[0].weekplan == '0'
          ) {
            this.selectedPlanType = 'ytc';
          }
        }

        setTimeout(() => {
          this.selectedplan(this.selectedPlanType);
        }, 100);
        if (
          this.usvstagedetection == 'USV' &&
          this.usvstagestatusdetection == '3' &&
          cust[0]?.visitstatus == '0'
        ) {
          this.actionChange(this.usvstagedetection);
        }
        if (
          (this.selectedSuggestedProp &&
            this.selectedSuggestedProp['actions'] == '7' &&
            this.selectedSuggestedProp['currentstage'] == '5') ||
          (this.selectedSuggestedProp['actions'] == '8' &&
            this.selectedSuggestedProp['currentstage'] == '5') ||
          (this.selectedSuggestedProp['actions'] == '6' &&
            this.selectedSuggestedProp['currentstage'] == '5')
        ) {
          this.showRejectionForm = true;
          this.verifyrequest(
            this.assignedrm[0].customer_IDPK,
            this.selectedSuggestedProp['propid'],
            this.assignedrm[0].RMID,
            this.selectedSuggestedProp['name']
          );
        }
      });
  }

  @ViewChild('suggModal', { static: true }) suggModal: IonModal;
  // to open suggested property modal
  displaySuggProperty() {
    //  .set('leadid', param.leadid)
    // .set('execid', param.execid)
    // .set('feedback', param.feedbackid ?? '');
    const param = {
      leadid: this.id,
      execid: this.selectedExecId,
      feedback: this.feedbackId,
    };
    this._mandateService.getPropertylist(param).subscribe((res) => {
      this.properties = res['Properties'];
    });
    // this.getProperty();
    this.suggestedproperties = [];
    this.suggModal.present();
  }

  isVisitAssign_btn;
  fixedVisitProperties;
  propid;
  getFixedMandateProperties() {
    let param = {
      leadid: this.id,
      execid: this.selectedExecId,
      loginid: this.localStorage.getItem('UserId'),
      PropId: this.propid,
    };

    this._mandateService.getFixedMandateProperties(param).subscribe((resp) => {
      if (resp['status'] == 'True') {
        this.isVisitAssign_btn = true;
        this.fixedVisitProperties = resp['result'];
      } else {
        this.fixedVisitProperties = [];
        this.isVisitAssign_btn = false;
      }
    });
  }

  onPropSelectOfVisitsAssign(event) {
    this._mandateService
      .fetchmandateexecutives1(event.value.property_idfk, '', '', '50002')
      .subscribe((response) => {
        this.mandateExecList = response['mandateexecutives'];
      });
  }
  onvisitAssignModal() {
    this.mandateprojectsfetch();

    this.visitAssign.present();
  }
  mandateExecList;
  selectedExec;

  @ViewChild('visitAssign') visitAssign;
  assignFixedLead() {
    //     .set('LeadId', param.leadid)
    // .set('PropId', param.propid)
    // .set('LoginId', param.loginid)
    // .set('FromExecId', param.fromExecid)
    // .set('ToExecId', param.toExecid)
    // .set('CrmType', param.crmType)
    // .set('DbClient', param.dbClient);

    let param = {
      leadid: this.id,
      propid: this.propid,
      loginid: localStorage.getItem('UserId'),
      fromExecid: localStorage.getItem('UserId'),
      toExecid: this.selectedExec.id,
      crmType: '1',
    };

    this._mandateService.assignfixedvisitlead(param).subscribe((resp) => {
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

  @ViewChild('content', { static: false }) content: IonContent;
  canScroll;
  isAtBottom = false;
  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.content.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;

      this.canScroll = scrollHeight > clientHeight + 10;
      if (!this.canScroll) {
        this.isAtBottom = false;
      } else {
        this.isAtBottom = scrollTop + clientHeight >= scrollHeight - 100;
      }
    });
  }

  selectedExecTeam;
  selectedExecutiveName;
  execTeam = [
    { name: 'Relationship Executives', code: '50002' },
    { name: 'Customersupport Executives', code: '50014' },
  ];
  onExecTeamSelect(event) {
    this.showSpinner = true;
    this.selectedExecutiveName = [];

    this._mandateService
      .fetchmandateexecutives(this.selectedMandatePropId, '', event.value.code)
      .subscribe((response) => {
        this.selectedExecIds = [];
        this.mandateExecutives = response['mandateexecutives'];
        this.mandateExecutives = this.mandateExecutives.filter((executive) => {
          return !this.leadsDetailsInfo.some(
            (rmids) => rmids.RMID == executive.id
          );
        });
        this.showSpinner = false;
      });
  }
  allCallsData;
  count = 0;
  fetchAllCallLogs(isLoadmore) {
    const params = {
      loginid: this.userid,
      execid: this.executeid,
      clientnum: this.assignedrm[0]?.customer_number,
      limit: 0,
      limitrows: 30,
    };

    return new Promise((resolve, reject) => {
      this._sharedservice.fetchAllCallLogs(params).subscribe({
        next: (response: any) => {
          this.showSpinner = false;
          if (response['status'] == 'success') {
            this.allCallLogs = isLoadmore
              ? this.allCallLogs.concat(response['success'])
              : response['success'];
            resolve(true);
          } else {
            this.showSpinner = false;
            this.allCallLogs = [];
            resolve(false);
          }
        },
        error: (err) => {
          this.allCallLogs = [];
          this.showSpinner = false;
          resolve(false);
        },
      });
    });
  }

  loadData(event) {
    this.fetchAllCallLogs(true).then(() => {
      event.target.complete();
      event.target.disabled = true;
    });
  }
  showInfiniteScroll = true;
  //TO RESET THE INFINITE SRCOLL
  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }

  async toggleAudio(audioElement: HTMLAudioElement, event: Event) {
    const clickedIcon = event.target as HTMLElement;

    // Pause all other audios
    const allAudios = document.querySelectorAll('audio');
    allAudios.forEach((audio) => {
      if (audio !== audioElement) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    // Reset all other icons to play
    const allIcons = document.querySelectorAll('ion-icon.play-icon');
    allIcons.forEach((icon) => {
      icon.setAttribute('name', 'play');
    });

    // Toggle current audio
    if (audioElement.paused) {
      try {
        await audioElement.play();
        clickedIcon.setAttribute('name', 'pause');

        // Reset icon when audio ends
        audioElement.onended = () => {
          clickedIcon.setAttribute('name', 'play');
        };
      } catch (err) {
        console.warn('Audio play interrupted:', err);
      }
    } else {
      audioElement.pause();
      audioElement.currentTime = 0;
      clickedIcon.setAttribute('name', 'play');
    }
  }
  getExecList() {
    this._mandateService
      .fetchmandateexecutives(this.propid, '', '50002')
      .subscribe((executives) => {
        if (executives['status'] == 'True') {
          this.selectedExecIds = [];
          this.mandateExecutives = executives['mandateexecutives'];
        }
      });
  }
  onWillDismiss(event) {
    location.reload();
  }

  enableAccess() {
    console.log(this.assignedrm);
    let param = {
      LeadID: this.assignedrm[0].customer_IDPK,
      rmID: this.assignedrm[0].RMID,
      propID: this.assignedrm[0].propid,
      loginId: this.userid,
      fromExecids: this.assignedrm[0].RMID,
    };
    console.log(param);
    this._mandateService.leadreassign(param).subscribe(
      (success) => {
        this.showSpinner = false;
        if (success['status'] == 'True') {
          this.reassignedResponseInfo = success['assignedleads'];
          Swal.fire({
            title: 'Access Enabled Successfully',
            icon: 'success',
            heightAuto: false,
            confirmButtonText: 'Show Details',
          }).then(() => {
            this.viewAssignLeadDetail.present();
          });
        } else {
          Swal.fire({
            title: 'Authentication Failed!',
            text: 'Please try again',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK',
          });
        }
      },
      (err) => {
        console.log('Connection Failed');
      }
    );
  }
}

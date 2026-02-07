import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDate, Location } from '@angular/common';
import Swal from 'sweetalert2';
import { catchError, forkJoin, of } from 'rxjs';
import { IonCheckbox, IonContent, MenuController } from '@ionic/angular';
import { CommonService } from '../../common.service';
import { RetailServiceService } from '../../retail-service.service';
import { SharedService } from '../../shared.service';
import { MandateService } from '../../mandate-service.service';

@Component({
  selector: 'app-mandate-visit-stages',
  templateUrl: './mandate-visit-stages.component.html',
  styleUrls: ['./mandate-visit-stages.component.scss'],
})
export class MandateVisitStagesComponent implements OnInit {
  @ViewChild('filterModal') filterModal;
  @ViewChild('assignLeadsModal') assignLeadsModal;
  @ViewChild('viewAssignLeadDetail') viewAssignLeadDetail;
  @ViewChild('sourceScrollContent', { static: false })
  sourceScrollContent!: IonContent;
  isFeedbackAssign = false;
  showSpinner = false;
  showSpinner1 = false;
  isCheckbox = false;
  startdate;
  enddate;
  minDate;
  maxDate;
  endDateMinDate;
  showInfiniteScroll = true;
  leads_detail = [];
  localStorage = localStorage;
  count = 0;

  mandateLeadsCount = {
    assignedleads: '',
    untouched: '',
    usv: '',
    sv: '',
    rsv: '',
    fn: '',
    junkvisits: '',
    usv_fix: '',
    usv_done: '',
    usv_fixed_overdue: '',
    usv_done_overdue: '',
    sv_fix: '',
    sv_done: '',
    sv_overdue: '',
    rsv_fix: '',
    rsv_done: '',
    rsv_fixed_overdue: '',
    rsv_done_overdue: '',
    fn_fix: '',
    fn_done: '',
    fn_fixed_overdue: '',
    fn_done_overdue: '',
    junkusv: '',
    junksv: '',
    junkrsv: '',
    junkfn: '',
    junkusvfixed: '',
    junkusvdone: '',
    junkrsvfixed: '',
    junkrsvdone: '',
    junkfnfixed: '',
    junkfndone: '',
    booking_request: '',
    request_rejected: '',
    booked: '',
    allvisits: '',
    activevisits: '',
  };
  tempFilteredValues;
  filteredParams = {
    fromDate: '',
    toDate: '',
    status: '',
    stage: '',
    team: '',
    propid: '',
    htype: '',
    followup: '',
    executid:
      localStorage.getItem('Role') === '1'
        ? []
        : localStorage.getItem('UserId'),
    loginid: localStorage.getItem('UserId'),
    teamlead:
      localStorage.getItem('RoleType') == '1'
        ? localStorage.getItem('UserId')
        : '',
    priority: '',
    source: '',
    stagestatus: '',
    visits: '',
    rmexecutid: [],
    receivedFromDate: '',
    receivedToDate: '',
    visitedfromdate: '',
    visitedtodate: '',
    assignedfromdate: '',
    assignedtodate: '',
    isDropDown: 'false',
    active: '1',
    selectedStage: '',
    fromTime: '',
    toTime: '',
    fromDashboard: '',
    visittype: '',
    type: '',
    visitassignedto: '',
    visitsuntouched: '',
    limit: 0,
    limitrows: 5,
  };

  isAdmin: boolean;
  propertyList = [];
  propertyList1;
  mandateExecutives;
  mandateExecutives1;
  executiveSearchTerm;
  sourceList;
  sourceList1;

  //to hold date in the formate of yyyy-mm-dd
  todaysdateforcompare: string;
  yesterdaysdateforcompare: string;
  tomorrowsdateforcompare: string;
  currentdateforcompare = new Date(); //to hold the today's date
  roleid;
  isManual = false;
  isCP;
  leadId;
  execid: any;
  mandateCSExecutives1: any;
  mandateCSExecutives: any;
  mandateRMExecutives1: any;
  mandateRMExecutives: any;
  csexecutiveSearchedTerm: any;
  rmexecutiveSearchedTerm: any;
  isCS: boolean;
  todaysDate: Date;
  constructor(
    private location: Location,
    public commonService: CommonService,
    private menuCtrl: MenuController,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private retailService: RetailServiceService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private _sharedservice: SharedService,
    private mandateService: MandateService
  ) {
    this.initializeStartEndDate();
  }
  showCheckLiveCall;
  isRM = false;

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((response) => {
      this.todaysDate = this.getTodayDate();
      this.isRM =
        this.localStorage.getItem('Role') == '50001' ||
        this.localStorage.getItem('Role') == '50002' ||
        this.localStorage.getItem('Role') == '50009' ||
        this.localStorage.getItem('Role') == '50010';

      this.isCS =
        this.localStorage.getItem('Role') == '50013' ||
        this.localStorage.getItem('Role') == '50014';
      this.roleid = localStorage.getItem('Role');

      this.showCheckLiveCall = true;
      this.isCP = this.localStorage.getItem('cpId') === '1';
      this.leadId = response['leadId'];
      this.execid = response['execid'];
      this.propertyList = [];
      if (localStorage.getItem('Role') == '1') {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }
      this.isCheckbox = false;
      this.leads_detail = [];
      this.isLeftFilterActive = 'property';
      this.getQueryParams();
      this.getPropertyList();
      this.getTodayYesterdayTomorrowDate();
      this.getsourcelist();
      this.getMandateExec();
      // this.getLeadsCount();
      this.getPriceList();
      // this.getRetailExecutive();
      // this.getRetailExec(this.filteredParams.team);
      this.settingSelectedDate();

      if (response['isOnCallDetailsPage'] == 'true') {
        this.isOnCallDetailsPage = true;
      } else {
        this.isOnCallDetailsPage = false;
      }

      //  this.isOnCallDetailsPage = true;

      if (this._sharedservice.hasState) {
        this.showSpinner = false;
        this.leads_detail = this._sharedservice.enquiries;
        this.page = this._sharedservice.page;
        setTimeout(() => {
          this.content.scrollToPoint(0, this._sharedservice.scrollTop, 0);
        }, 0);

        setTimeout(() => {
          this._sharedservice.hasState = false;
        }, 5000);
      } else {
        this.content?.scrollToTop(300);
        this.getLeadsCount();
      }
    });
  }
  page = 1;
  getLeadsCount() {
    this.showSpinner = true;
    const requests = [];
    // this.getAllStagesTotalCount();

    // When Type is All Visits

    if (this.filteredParams.visitsuntouched == '1') {
      const params = {
        ...this.filteredParams,
      };

      requests.push(
        this.mandateService.getAssignedLeadsCounts(params).pipe(
          catchError((error) => {
            console.error(`Error fetching data for status: ${status}`, error);
            return of(null);
          })
        )
      );

      forkJoin(requests).subscribe((results) => {
        results.forEach((assignleads, index) => {
          switch (index) {
            case 0:
              this.mandateLeadsCount.untouched =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            default:
              break;
          }
        });
      });
    } else if (
      this.filteredParams.type == 'Booked' ||
      this.filteredParams.type == 'Booking Request' ||
      this.filteredParams.type == 'Request Rejected'
    ) {
      const stage = [
        'Deal Closing Requested',
        'Closing Request Rejected',
        'Deal Closed',
      ];
      stage.forEach((stage) => {
        const params = {
          ...this.filteredParams,
          stage: stage,
          visitedfromdate:
            this.filteredParams.visitedfromdate &&
            this.filteredParams.fromDashboard != 'true'
              ? ''
              : this.filteredParams.visitedfromdate,
          visitedtodate:
            this.filteredParams.visitedtodate &&
            this.filteredParams.fromDashboard != 'true'
              ? ''
              : this.filteredParams.visitedtodate,

          fromDate: '',
          toDate: '',
          fromTime: '',
          toTime: '',
        };
        requests.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((error) => {
              console.error(`Error fetching data for status: ${stage}`, error);
              return of(null);
            })
          )
        );
      });

      forkJoin(requests).subscribe((results) => {
        results.forEach((assignleads, index) => {
          switch (index) {
            case 0:
              this.mandateLeadsCount.booking_request =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 1:
              this.mandateLeadsCount.request_rejected =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 2:
              this.mandateLeadsCount.booked =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            default:
              break;
          }
        });
      });
    } else if (this.filteredParams.type == 'USV') {
      const stagestatus = ['1', '3'];
      stagestatus.forEach((stagestatus) => {
        const params = {
          ...this.filteredParams,
          stagestatus: stagestatus,
          status: '',
          visitedfromdate:
            stagestatus == '1' && this.filteredParams.visitedfromdate
              ? ''
              : this.filteredParams.visitedfromdate,
          visitedtodate:
            stagestatus == '1' && this.filteredParams.visitedtodate
              ? ''
              : this.filteredParams.visitedtodate,
        };

        requests.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((error) => {
              console.error(
                `Error fetching data for status: ${stagestatus}`,
                error
              );
              return of(null);
            })
          )
        );
      });

      const ovedueStageStatus = ['1', '3'];
      ovedueStageStatus.forEach((stagestatus) => {
        const params = {
          ...this.filteredParams,
          status: 'overdues',
          stagestatus: stagestatus,
          visitedfromdate: this.filteredParams.visitedfromdate
            ? ''
            : this.filteredParams.visitedfromdate,
          visitedtodate: this.filteredParams.visitedtodate
            ? ''
            : this.filteredParams.visitedtodate,

          fromDate: this.filteredParams.visitedfromdate
            ? this.filteredParams.visitedfromdate
            : this.filteredParams.fromDate,
          toDate: this.filteredParams.visitedtodate
            ? this.filteredParams.visitedtodate
            : this.filteredParams.toDate,
        };

        requests.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((error) => {
              console.error(
                `Error fetching data for status: ${ovedueStageStatus}`,
                error
              );
              return of(null);
            })
          )
        );
      });

      forkJoin(requests).subscribe((results) => {
        results.forEach((assignleads, index) => {
          switch (index) {
            case 0:
              this.mandateLeadsCount.usv_fix =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 1:
              this.mandateLeadsCount.usv_done =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 2:
              this.mandateLeadsCount.usv_fixed_overdue =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 3:
              this.mandateLeadsCount.usv_done_overdue =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            default:
              break;
          }
        });
      });
    } else if (this.filteredParams.type == 'RSV') {
      const stagestatus = ['1', '3'];
      stagestatus.forEach((stagestatus) => {
        const params = {
          ...this.filteredParams,
          stagestatus: stagestatus,
          status: '',
          visitedfromdate:
            stagestatus == '1' && this.filteredParams.visitedfromdate
              ? ''
              : this.filteredParams.visitedfromdate,
          visitedtodate:
            stagestatus == '1' && this.filteredParams.visitedtodate
              ? ''
              : this.filteredParams.visitedtodate,
        };
        requests.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((error) => {
              console.error(
                `Error fetching data for status: ${stagestatus}`,
                error
              );
              return of(null);
            })
          )
        );
      });

      // const status = ['overdues'];
      // status.forEach((status) => {
      //   const params = {
      //     ...this.filteredParams,
      //     status: status,
      //     stagestatus: '',
      //     visitedfromdate: this.filteredParams.visitedfromdate
      //       ? ''
      //       : this.filteredParams.visitedfromdate,
      //     visitedtodate: this.filteredParams.visitedtodate
      //       ? ''
      //       : this.filteredParams.visitedtodate,
      //   };
      //   requests.push(
      //     this.mandateService.getAssignedLeadsCounts(params).pipe(
      //       catchError((error) => {
      //         console.error(`Error fetching data for status: ${status}`, error);
      //         return of(null);
      //       })
      //     )
      //   );
      // });

      const ovedueStageStatus = ['1', '3'];
      ovedueStageStatus.forEach((stagestatus) => {
        const params = {
          ...this.filteredParams,
          status: 'overdues',
          stagestatus: stagestatus,
          visitedfromdate: this.filteredParams.visitedfromdate
            ? ''
            : this.filteredParams.visitedfromdate,
          visitedtodate: this.filteredParams.visitedtodate
            ? ''
            : this.filteredParams.visitedtodate,
          fromDate: this.filteredParams.visitedfromdate
            ? this.filteredParams.visitedfromdate
            : this.filteredParams.fromDate,
          toDate: this.filteredParams.visitedtodate
            ? this.filteredParams.visitedtodate
            : this.filteredParams.toDate,
        };

        requests.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((error) => {
              console.error(
                `Error fetching data for status: ${ovedueStageStatus}`,
                error
              );
              return of(null);
            })
          )
        );
      });

      forkJoin(requests).subscribe((results) => {
        results.forEach((assignleads, index) => {
          switch (index) {
            case 0:
              this.mandateLeadsCount.rsv_fix =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 1:
              this.mandateLeadsCount.rsv_done =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 2:
              this.mandateLeadsCount.rsv_fixed_overdue =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 3:
              this.mandateLeadsCount.rsv_done_overdue =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            default:
              break;
          }
        });
      });
    } else if (this.filteredParams.type == 'Final Negotiation') {
      const stagestatus = ['1', '3'];
      stagestatus.forEach((stagestatus) => {
        const params = {
          ...this.filteredParams,
          stagestatus: stagestatus,
          status: '',
          visitedfromdate:
            stagestatus == '1' && this.filteredParams.visitedfromdate
              ? ''
              : this.filteredParams.visitedfromdate,
          visitedtodate:
            stagestatus == '1' && this.filteredParams.visitedtodate
              ? ''
              : this.filteredParams.visitedtodate,
        };
        requests.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((error) => {
              console.error(
                `Error fetching data for status: ${stagestatus}`,
                error
              );
              return of(null);
            })
          )
        );
      });

      // const status = ['overdues'];
      // status.forEach((status) => {
      //   const params = {
      //     ...this.filteredParams,
      //     status: status,
      //     stagestatus: '',
      //     visitedfromdate: this.filteredParams.visitedfromdate
      //       ? ''
      //       : this.filteredParams.visitedfromdate,
      //     visitedtodate: this.filteredParams.visitedtodate
      //       ? ''
      //       : this.filteredParams.visitedtodate,
      //   };
      //   requests.push(
      //     this.mandateService.getAssignedLeadsCounts(params).pipe(
      //       catchError((error) => {
      //         console.error(`Error fetching data for status: ${status}`, error);
      //         return of(null);
      //       })
      //     )
      //   );
      // });

      const ovedueStageStatus = ['1', '3'];
      ovedueStageStatus.forEach((stagestatus) => {
        const params = {
          ...this.filteredParams,
          status: 'overdues',
          stagestatus: stagestatus,
          visitedfromdate: this.filteredParams.visitedfromdate
            ? ''
            : this.filteredParams.visitedfromdate,
          visitedtodate: this.filteredParams.visitedtodate
            ? ''
            : this.filteredParams.visitedtodate,
          fromDate: this.filteredParams.visitedfromdate
            ? this.filteredParams.visitedfromdate
            : this.filteredParams.fromDate,
          toDate: this.filteredParams.visitedtodate
            ? this.filteredParams.visitedtodate
            : this.filteredParams.toDate,
        };

        requests.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((error) => {
              console.error(
                `Error fetching data for status: ${ovedueStageStatus}`,
                error
              );
              return of(null);
            })
          )
        );
      });
      forkJoin(requests).subscribe((results) => {
        results.forEach((assignleads, index) => {
          switch (index) {
            case 0:
              this.mandateLeadsCount.fn_fix =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 1:
              this.mandateLeadsCount.fn_done =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 2:
              this.mandateLeadsCount.fn_fixed_overdue =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 3:
              this.mandateLeadsCount.fn_done_overdue =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            default:
              break;
          }
        });
      });
    } else if (this.filteredParams.type == 'Junk Visits') {
      const stage = ['USV', 'RSV', 'Final Negotiation'];
      stage.forEach((stage) => {
        const params = {
          ...this.filteredParams,
          fromdate: '',
          todate: '',
          fromTime: '',
          toTime: '',
          stage: stage,
          status: 'junkvisits',
          stagestatus:
            this.filteredParams.visitedfromdate &&
            this.filteredParams.visitedtodate
              ? '3'
              : '',
        };
        requests.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((error) => {
              console.error(`Error fetching data for status: ${status}`, error);
              return of(null);
            })
          )
        );
      });

      const stagestatusUSV = ['1', '3'];
      stagestatusUSV.forEach((stagestatus) => {
        const params = {
          ...this.filteredParams,
          fromdate: '',
          todate: '',
          fromTime: '',
          toTime: '',
          stage: 'USV',
          status: 'junkvisits',
          stagestatus:
            this.filteredParams.visitedfromdate &&
            this.filteredParams.visitedtodate
              ? '3'
              : stagestatus,
        };
        requests.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((error) => {
              console.error(`Error fetching data for status: ${status}`, error);
              return of(null);
            })
          )
        );
      });

      const stagestatus = ['1', '3'];
      stagestatus.forEach((stagestatus) => {
        const params = {
          ...this.filteredParams,
          fromdate: '',
          todate: '',
          fromTime: '',
          toTime: '',
          stage: 'RSV',
          status: 'junkvisits',
          stagestatus:
            this.filteredParams.visitedfromdate &&
            this.filteredParams.visitedtodate
              ? '3'
              : stagestatus,
        };
        requests.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((error) => {
              console.error(`Error fetching data for status: ${status}`, error);
              return of(null);
            })
          )
        );
      });

      const stagestatusFN = ['1', '3'];
      stagestatusFN.forEach((stagestatus) => {
        const params = {
          ...this.filteredParams,
          fromdate: '',
          todate: '',
          fromTime: '',
          toTime: '',
          stage: 'Final Negotiation',
          status: 'junkvisits',
          stagestatus:
            this.filteredParams.visitedfromdate &&
            this.filteredParams.visitedtodate
              ? '3'
              : stagestatus,
        };
        requests.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((error) => {
              console.error(`Error fetching data for status: ${status}`, error);
              return of(null);
            })
          )
        );
      });

      forkJoin(requests).subscribe((results) => {
        results.forEach((assignleads, index) => {
          switch (index) {
            case 0:
              this.mandateLeadsCount.junkusv =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 1:
              this.mandateLeadsCount.junkrsv =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 2:
              this.mandateLeadsCount.junkfn =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 3:
              this.mandateLeadsCount.junkusvfixed =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 4:
              this.mandateLeadsCount.junkusvdone =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;

            case 5:
              this.mandateLeadsCount.junkrsvfixed =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 6:
              this.mandateLeadsCount.junkrsvdone =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;

            case 7:
              this.mandateLeadsCount.junkfnfixed =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 8:
              this.mandateLeadsCount.junkfndone =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            default:
              break;
          }
        });
      });
    } else if (
      this.filteredParams.status == 'activevisits' ||
      this.filteredParams.status == 'allvisits'
    ) {
      const status = ['activevisits', 'allvisits', 'junkvisits'];
      status.forEach((status) => {
        const params = {
          ...this.filteredParams,
          status: status,
          stagestatus:
            this.filteredParams.visitedfromdate &&
            this.filteredParams.visitedtodate &&
            this.filteredParams.status == 'allvisits'
              ? '3'
              : this.filteredParams.stagestatus,
        };
        requests.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((error) => {
              console.error(`Error fetching data for status: ${status}`, error);
              return of(null);
            })
          )
        );
      });

      forkJoin(requests).subscribe((results) => {
        results.forEach((assignleads, index) => {
          switch (index) {
            case 0:
              this.mandateLeadsCount.activevisits =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 1:
              this.mandateLeadsCount.allvisits =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 2:
              this.mandateLeadsCount.junkvisits =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            default:
              break;
          }
        });
      });
    }
    this.getAssignedLeadsDetail(false, 0);
    // this.showSpinner = false;
  }

  getAllStagesTotalCount() {
    const requests = [];
    const stage = [
      'USV',
      'RSV',
      'Final Negotiation',
      'Deal Closing Requested',
      'Closing Request Rejected',
      'Deal Closed',
    ];

    stage.forEach((stage) => {
      const params = { ...this.filteredParams, stage: stage, status: '' };
      requests.push(
        this.mandateService.getAssignedLeadsCounts(params).pipe(
          catchError((error) => {
            console.error(`Error fetching data for status: ${stage}`, error);
            return of(null);
          })
        )
      );
    });

    const status = ['junkvisits'];
    status.forEach((status) => {
      const params = {
        ...this.filteredParams,
        status: status,
        stage: '',
        stagestatus:
          this.filteredParams.visitedfromdate &&
          this.filteredParams.visitedtodate
            ? '3'
            : this.filteredParams.stagestatus,
      };
      requests.push(
        this.mandateService.getAssignedLeadsCounts(params).pipe(
          catchError((error) => {
            console.error(`Error fetching data for status: ${status}`, error);
            return of(null);
          })
        )
      );
    });

    forkJoin(requests).subscribe((results) => {
      results.forEach((assignleads, index) => {
        switch (index) {
          case 0:
            this.mandateLeadsCount.usv =
              assignleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 1:
            this.mandateLeadsCount.rsv =
              assignleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 2:
            this.mandateLeadsCount.fn =
              assignleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 3:
            this.mandateLeadsCount.booking_request =
              assignleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 4:
            this.mandateLeadsCount.request_rejected =
              assignleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 5:
            this.mandateLeadsCount.booked =
              assignleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 6:
            this.mandateLeadsCount.junkvisits =
              assignleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          default:
            break;
        }
      });
    });
  }

  getAssignedLeadsDetail(isLoadmore, selectedCount) {
    // this.count =  isLoadmore? this.count += 5:0;
    // this.filteredParams.limit = this.count;

    var filterParam = { ...this.filteredParams };

    if (selectedCount != 0 && !isLoadmore) {
      filterParam.limit = 0;
      filterParam.limitrows = selectedCount;
    } else {
      this.count = isLoadmore ? (this.count += 5) : 0;
      filterParam.limit = this.count;
    }

    if (
      this.filteredParams.status == 'junkvisits' &&
      this.filteredParams.visitedfromdate != '' &&
      this.filteredParams.visitedtodate != ''
    ) {
      filterParam.stagestatus = '3';
    }

    const stage = [
      'Deal Closing Requested',
      'Closing Request Rejected',
      'Deal Closed',
    ];
    if (
      stage.includes(this.filteredParams.stage) &&
      ((this.filteredParams.visitedfromdate != '' &&
        this.filteredParams.visitedtodate != '') ||
        (this.filteredParams.fromDate != '' &&
          this.filteredParams.toDate != '')) &&
      this.filteredParams.fromDashboard != 'true'
    ) {
      filterParam.visitedtodate = '';
      filterParam.visitedfromdate = '';
      filterParam.fromDate = '';
      filterParam.toDate = '';
    }

    const stage1 = ['USV', 'RSV', 'Final Negotiation'];
    if (
      (stage1.includes(this.filteredParams.stage) &&
        this.filteredParams.visitedfromdate != '' &&
        this.filteredParams.visitedtodate != '' &&
        this.filteredParams.stagestatus == '1') ||
      (this.filteredParams.status == 'overdues' &&
        stage1.includes(this.filteredParams.stage) &&
        this.filteredParams.visitedfromdate != '' &&
        this.filteredParams.visitedtodate != '')
    ) {
      filterParam.visitedtodate = '';
      filterParam.visitedfromdate = '';
    }
    if (
      stage1.includes(this.filteredParams.stage) &&
      this.filteredParams.status != 'junkvisits'
    ) {
      filterParam.fromTime = this.filteredParams.fromTime;
      filterParam.toTime = this.filteredParams.toTime;
    } else {
      filterParam.fromTime = '';
      filterParam.toTime = '';
    }

    return new Promise((resolve, reject) => {
      this.mandateService
        .getAssignedLeadsDetail(filterParam)
        .subscribe((response) => {
          console.log(response);
          this.ngZone.run(() => {
            if (response['status'] === 'True') {
              this.leads_detail = isLoadmore
                ? this.leads_detail.concat(response['AssignedLeads'])
                : response['AssignedLeads'];
              this.showSpinner = false;
              resolve(true);
            } else {
              isLoadmore ? '' : (this.leads_detail = []);
              this.showSpinner = false;
              resolve(false);
            }
          });
        });

      // if((this.filteredParams.status != 'junkvisits'? this.filteredParams.stage:this.filteredParams.status) in this.localStorage){

      //  const raw = localStorage.getItem(this.filteredParams.status != 'junkvisits'? this.filteredParams.stage:this.filteredParams.status);
      //  this.leads_detail = JSON.parse(raw);
      //  console.log(this.leads_detail)
      //    this.showSpinner = false;
      // }else{
      //   this.mandateService.getAssignedLeadsDetail(filterParam).subscribe((response)=>{
      //     // if (!response || !response['AssignedLeads'] || response['AssignedLeads'].length === 0) {
      //     //   console.error(`No data returned for index:`);
      //     //   return;
      //     // }
      //     this.ngZone.run(() => {
      //       if(response['status'] === 'True'){
      //         this.leads_detail = isLoadmore ? this.leads_detail.concat(response['AssignedLeads']) : response['AssignedLeads'];

      //         localStorage.setItem( this.filteredParams.status != 'junkvisits'? this.filteredParams.stage:this.filteredParams.status, JSON.stringify(this.leads_detail));
      //         this.showSpinner = false;
      //         resolve(true);
      //       }else{
      //         // this.leads_detail = [];
      //         this.showSpinner = false;
      //         resolve(false);
      //       }
      //     })
      //   })
      // }
    });
  }
  async loadData(event) {
    // Save current scroll position
    // const scrollEl = await this.content.getScrollElement();
    // const previousPosition = scrollEl.scrollTop;

    // Load more data
    const hasData = await this.getAssignedLeadsDetail(true, 0);

    setTimeout(async () => {
      event.target.complete();

      if (!hasData) {
        event.target.disabled = true;
        return;
      }

      //Restore scroll position
      // this.content.scrollToPoint(0, previousPosition, 0);
    }, 200);
  }

  // loadData(event) {
  //   if (
  //     (this.filteredParams.stage === 'USV' &&
  //       ((this.filteredParams.stagestatus === '1' &&
  //         this.leads_detail.length < Number(this.mandateLeadsCount.usv_fix)) ||
  //         (this.filteredParams.stagestatus === '3' &&
  //           this.leads_detail.length <
  //             Number(this.mandateLeadsCount.usv_done)) ||
  //         (this.filteredParams.status === 'overdues' &&
  //           this.leads_detail.length <
  //             Number(this.mandateLeadsCount.usv_overdue)))) ||
  //     (this.filteredParams.stage === 'SV' &&
  //       ((this.filteredParams.stagestatus === '1' &&
  //         this.leads_detail.length < Number(this.mandateLeadsCount.sv_fix)) ||
  //         (this.filteredParams.stagestatus === '3' &&
  //           this.leads_detail.length <
  //             Number(this.mandateLeadsCount.sv_done)) ||
  //         (this.filteredParams.status === 'overdues' &&
  //           this.leads_detail.length <
  //             Number(this.mandateLeadsCount.sv_overdue)))) ||
  //     (this.filteredParams.stage === 'RSV' &&
  //       ((this.filteredParams.stagestatus === '1' &&
  //         this.leads_detail.length < Number(this.mandateLeadsCount.rsv_fix)) ||
  //         (this.filteredParams.stagestatus === '3' &&
  //           this.leads_detail.length <
  //             Number(this.mandateLeadsCount.rsv_done)) ||
  //         (this.filteredParams.status === 'overdues' &&
  //           this.leads_detail.length <
  //             Number(this.mandateLeadsCount.rsv_overdue)))) ||
  //     (this.filteredParams.stage === 'Final Negotiation' &&
  //       ((this.filteredParams.stagestatus === '1' &&
  //         this.leads_detail.length < Number(this.mandateLeadsCount.fn_fix)) ||
  //         (this.filteredParams.stagestatus === '3' &&
  //           this.leads_detail.length <
  //             Number(this.mandateLeadsCount.fn_done)) ||
  //         (this.filteredParams.status === 'overdues' &&
  //           this.leads_detail.length <
  //             Number(this.mandateLeadsCount.fn_overdue)))) ||
  //     (this.filteredParams.status === 'junkvisits' &&
  //       ((this.filteredParams.stage === 'USV' &&
  //         this.leads_detail.length < Number(this.mandateLeadsCount.junkusv)) ||
  //         (this.filteredParams.stage === 'SV' &&
  //           this.leads_detail.length < Number(this.mandateLeadsCount.junksv)) ||
  //         (this.filteredParams.stage === 'RSV' &&
  //           this.leads_detail.length <
  //             Number(this.mandateLeadsCount.junkrsv)) ||
  //         (this.filteredParams.stage === 'Final Negotiation' &&
  //           this.leads_detail.length <
  //             Number(this.mandateLeadsCount.junkfn)))) ||
  //     (this.filteredParams.stage === 'Deal Closing Requested' &&
  //       this.leads_detail.length <
  //         Number(this.mandateLeadsCount.booking_request)) ||
  //     (this.filteredParams.stage === 'Deal Closed' &&
  //       this.leads_detail.length < Number(this.mandateLeadsCount.booked)) ||
  //     (this.filteredParams.stage === 'Closing Request Rejected' &&
  //       this.leads_detail.length <
  //         Number(this.mandateLeadsCount.request_rejected)) ||
  //     (this.filteredParams.status === 'allvisits' &&
  //       this.leads_detail.length < Number(this.mandateLeadsCount.allvisits)) ||
  //     (this.filteredParams.status === 'activevisits' &&
  //       this.leads_detail.length < Number(this.mandateLeadsCount.activevisits))
  //   ) {
  //     this.getAssignedLeadsDetail(true, 0).then(() => {
  //       event.target.complete();
  //     });
  //   } else {
  //     event.target.disabled = true;
  //   }
  // }

  //TO GET PROPERTY LIST
  getPropertyList() {
    this.mandateService.getmandateprojects().subscribe((response) => {
      if (this.localStorage.getItem('RoleType') === '1') {
        const propIds = this.localStorage.getItem('PropertyId');
        const propIdArray = propIds.split(',');
        response['Properties'].forEach((property) => {
          if (propIdArray.includes(property.property_idfk)) {
            this.propertyList.push(property);
          }
        });
      } else {
        this.propertyList = response['Properties'];
      }
      this.propertyList1 = this.propertyList;
    });
  }
  //to get the today's, yesterday and tomorrow date
  getTodayYesterdayTomorrowDate() {
    var curmonth = this.currentdateforcompare.getMonth() + 1;
    var curmonthwithzero = curmonth.toString().padStart(2, '0');
    // Todays Date
    var curday = this.currentdateforcompare.getDate();
    var curdaywithzero = curday.toString().padStart(2, '0');
    this.todaysdateforcompare =
      this.currentdateforcompare.getFullYear() +
      '-' +
      curmonthwithzero +
      '-' +
      curdaywithzero;
    // Todays Date
    // Yesterdays Date
    var yesterday = this.currentdateforcompare.getDate() - 1;
    var yesterdaywithzero = yesterday.toString().padStart(2, '0');
    this.yesterdaysdateforcompare =
      this.currentdateforcompare.getFullYear() +
      '-' +
      curmonthwithzero +
      '-' +
      yesterdaywithzero;
    // Yesterdays Date
    // Tomorrows Date
    var tomorrow = this.currentdateforcompare.getDate() + 1;
    var tomorrowwithzero = tomorrow.toString().padStart(2, '0');
    this.tomorrowsdateforcompare =
      this.currentdateforcompare.getFullYear() +
      '-' +
      curmonthwithzero +
      '-' +
      tomorrowwithzero;
    // Tomorrows Date
  }

  //To fetch executive names
  getMandateExec() {
    // if(this.localStorage.getItem('RoleType') === '1'){
    //   this.filteredParams.team = '2';
    //   this.filteredParams.propid = this.localStorage.getItem('PropertyId')
    // }

    const teamlead =
      localStorage.getItem('RoleType') === '1'
        ? this.localStorage.getItem('UserId')
        : '';
    const filterParam = {
      ...this.filteredParams,
      propid: localStorage.getItem('PropertyId'),
      team: localStorage.getItem('RoleType') === '1' ? '2' : '',
    };
    this.mandateService
      .fetchmandateexecutives1(
        filterParam.propid,
        filterParam.team,
        this.filteredParams.active,
        '',
        teamlead
      )
      .subscribe((executives) => {
        this.mandateExecutives = executives['mandateexecutives'];

        this.mandateExecutives = [
          ...(executives['mandateexecutives'] || []).filter(
            (x) => x.name !== 'Test RM' && x.name !== 'Test CS'
          ),
        ];
        this.mandateExecutives1 = this.mandateExecutives;

        this.mandateCSExecutives = this.mandateExecutives.filter((item) => {
          return item.roleid == '50014';
        });
        this.mandateCSExecutives1 = this.mandateCSExecutives;
        console.log(this.mandateCSExecutives1);

        this.mandateRMExecutives = this.mandateExecutives.filter((item) => {
          return item.roleid == '50002';
        });
        this.mandateRMExecutives1 = this.mandateRMExecutives;
        console.log(this.mandateRMExecutives1);
      });
  }

  //To fetch source list
  getsourcelist() {
    this._sharedservice.sourcelist().subscribe((response) => {
      this.sourceList = response['Sources'];
      this.sourceList1 = this.sourceList;
    });
  }

  onBackButton() {
    this.resetInfiniteScroll();
    if (!this.router.url.includes('type=USV')) {
      this.filteredParams = {
        fromDate: '',
        toDate: '',
        status: '',
        stage: 'USV',
        team: '',
        propid: '',
        htype: 'mandate',
        visitsuntouched: '',
        followup: '',
        executid:
          localStorage.getItem('Role') === '1'
            ? []
            : localStorage.getItem('UserId'),
        loginid: localStorage.getItem('UserId'),
        teamlead:
          localStorage.getItem('RoleType') == '1'
            ? localStorage.getItem('UserId')
            : '',
        priority: '',
        source: '',
        stagestatus: '3',
        visits: '',
        rmexecutid: [],
        receivedFromDate: '',
        receivedToDate: '',
        visitedfromdate: '',
        visitedtodate: '',
        assignedfromdate: '',
        assignedtodate: '',
        isDropDown: 'false',
        active: '1',
        selectedStage: '',
        fromTime: '',
        toTime: '',
        fromDashboard: '',
        visittype: '3',
        type: 'USV',
        visitassignedto: '',
        limit: 0,
        limitrows: 5,
      };
      this.addQueryParams();
    } else {
      this.location.back();
    }
  }
  setDefaultFromTime;
  setDefaultToTime;
  endDateMinDateNextaction;
  // to initialize the start and end date to date picker
  initializeStartEndDate() {
    // Only for next action date
    this.setDefaultFromTime = new Date();
    this.setDefaultFromTime.setUTCHours(0, 0, 0, 136);
    this.setDefaultFromTime = this.setDefaultFromTime.toISOString();

    this.setDefaultToTime = new Date();
    this.setDefaultToTime.setUTCHours(11, 59, 0, 136);
    this.setDefaultToTime = this.setDefaultToTime.toISOString();
    this.endDateMinDateNextaction = this.setDefaultFromTime;

    // Initialize start and end dates with default values
    this.startdate = new Date().toISOString();
    this.enddate = new Date().toISOString();

    // Set the minimum and maximum dates
    // this.minDate = '2000-01-01';
    this.maxDate = new Date();

    // Set initial min date for end date picker
    this.endDateMinDate = this.startdate;
  }

  //TO RESET THE INFINITE SRCOLL
  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }

  // When we click on stages
  onstage(value, selectedStage) {
    this.resetInfiniteScroll();
    this.filteredParams.selectedStage = selectedStage;
    this.filteredParams.type = selectedStage;
    this.filteredParams.isDropDown = 'false';

    if (value != 'junkvisits') {
      this.filteredParams.stage = value == '1' ? '' : value;
      this.filteredParams.visitsuntouched = value == '1' ? '1' : '';
      this.filteredParams.status = '';
      if (
        value != 'Deal Closing Requested' &&
        value != 'Deal Closed' &&
        value != 'Closing Request Rejected' &&
        value == 'Deal Closing Pending'
      ) {
        this.filteredParams.stagestatus = '3';
        this.filteredParams.visittype = '';
      } else {
        this.filteredParams.stagestatus = this.filteredParams.stagestatus
          ? this.filteredParams.stagestatus
          : '3';
      }
    } else {
      this.filteredParams.status = value == '1' ? '' : value;
      this.filteredParams.visitsuntouched = value == '1' ? '1' : '';
      this.filteredParams.stage = 'USV';
      this.filteredParams.selectedStage = 'USV';
      this.filteredParams.stagestatus = '3';
      this.filteredParams.visittype = '3';
    }
    this.addQueryParams();
  }

  formatId(value: string): string {
    return value ? value.replace(/\s+/g, '-') : '';
  }

  // TO ADD QUERRY PARAM
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
      .navigate([], {
        queryParams,
        queryParamsHandling: 'merge',
        replaceUrl: true,
      })
      .then(() => {});
  }

  // TO GET QUERRY PARAM VALUE AND ASSIGNE TO FILTERPARAM OBJECT
  // getQueryParams(){
  //   this.activeRoute.queryParamMap.subscribe(() => {
  //     const queryString = window.location.search;
  //     const queryParams = new URLSearchParams(queryString);
  //     Object.keys(this.filteredParams).forEach(key => {
  //       if (queryParams.has(key)) {
  //         this.filteredParams[key] = queryParams.get(key) || '';
  //       }
  //     });
  //   });
  // }
  isHeader = false;
  //To getting Querry Params value
  getQueryParams() {
    const queryString = window.location.search;
    const queryParams: any = {};

    // ✅ Handle multiple query params (like executid=40119&executid=40200)
    const urlParams = new URLSearchParams(queryString);
    urlParams.forEach((value, key) => {
      if (queryParams[key]) {
        // If already present, make it an array
        if (Array.isArray(queryParams[key])) {
          queryParams[key].push(value);
        } else {
          queryParams[key] = [queryParams[key], value];
        }
      } else {
        queryParams[key] = value;
      }
    });

    Object.keys(this.filteredParams).forEach((key) => {
      if (queryParams.hasOwnProperty(key)) {
        if (key === 'executid' || key == 'rmexecutid') {
          const val = queryParams[key];
          if (Array.isArray(val)) {
            this.filteredParams[key] = val;
          } else if (typeof val === 'string' && val.includes(',')) {
            this.filteredParams[key] = val.split(',');
          } else {
            this.filteredParams[key] = [val];
          }
        } else {
          this.filteredParams[key] = queryParams[key];
        }
      } else if (key == 'propid' && 'ranavPropId' in localStorage) {
        this.filteredParams[key] = '28773';
      } else if (key !== 'loginid' && key !== 'limit' && key !== 'limitrows') {
        this.filteredParams[key] = '';
      }
    });
    if (this.filteredParams.type == 'SV') {
      this.filteredParams.type = 'USV';
      this.filteredParams.selectedStage = 'USV';
      this.filteredParams.stage = 'USV';
    }

    if (this.filteredParams.propid === '28773') {
      this.mandateService.setHoverState('ranav_group');
    } else {
      this.mandateService.setHoverState('');
    }

    if (this.filteredParams.visittype == '1') {
      this.isHeader = true;
    } else {
      this.isHeader = false;
    }

    this.filteredParams.executid =
      localStorage.getItem('Role') === '1'
        ? this.filteredParams.executid
        : localStorage.getItem('UserId');

    // this.addQueryParams();
  }

  navigateToDetailsPage(leadId, execid, lead) {
    this._sharedservice.enquiries = this.leads_detail;
    this._sharedservice.page = this.page;
    this._sharedservice.hasState = true;
    let propid;
    lead.suggestedprop.forEach((prop) => {
      if (lead.propertyname == prop.name) {
        propid = prop.propid;
      }
    });
    this.router.navigate(['../mandate-customers'], {
      queryParams: {
        leadId: leadId,
        execid: execid,
        status: 'info',
        propid: propid,
        htype: this.filteredParams.htype,
        teamlead:
          localStorage.getItem('RoleType') == '1'
            ? localStorage.getItem('UserId')
            : null,
      },
    });
  }

  onSwipe(event, lead: any) {
    if (event.detail.side == 'start') {
      window.open(`https://wa.me/+91 ${lead.number}`, '_system');
      // this.navigateToWhatsApp(lead.number);
    } else {
      //   window.open(`tel:${lead.number}`, '_system');
      // if (lead && lead.number) {
      //   // Trigger the call
      //   window.open(`tel:${lead.number}`, '_system');
      // } else {
      //   console.error('Phone number not available for the selected lead.');
      // }
      this.outboundCall(lead);
    }
  }

  lead;
  @ViewChild('sliding') sliding;
  @ViewChild('callConfirmationModal') callConfirmationModal;
  outboundCall(lead) {
    this.sliding.close();
    if (lead == true) {
      this.isOnCallDetailsPage = true;
      this.callConfirmationModal.dismiss();
      const cleanedNumber =
        this.lead?.number.startsWith('91') && this.lead?.number.length > 10
          ? this.lead?.number.slice(2)
          : this.lead?.number;
      const param = {
        execid: this.localStorage.getItem('UserId'),
        callto: cleanedNumber,
        leadid: this.lead.LeadID,
        starttime: this.getCurrentDateTime(),
        modeofcall: 'mobile-' + this.filteredParams.htype,
        leadtype: this.filteredParams.htype,
        assignee: this.lead.ExecId,
      };
      this._sharedservice.outboundCall(param).subscribe(() => {
        this.callConfirmationModal.dismiss();
      });

      this.router.navigate([], {
        queryParams: {
          isOnCallDetailsPage: this.isOnCallDetailsPage,
          leadId: this.lead.LeadID,
          execid: this.lead.ExecId,
          leadTabData: 'status',
          callStatus: 'Call Connected',
          direction: 'outboundCall',
          headerType: this.filteredParams.htype,
        },
        queryParamsHandling: 'merge',
      });
    } else {
      this.lead = lead;
      this.callConfirmationModal.present();
    }
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

  onusvstage(value, stagestatus?) {
    this.filteredParams.stage = 'USV';
    this.resetInfiniteScroll();
    if (value == 'overdues') {
      this.filteredParams.status = value;
      this.filteredParams.stagestatus = stagestatus ? stagestatus : '';
    } else {
      this.filteredParams.status = '';
      this.filteredParams.stagestatus = value;
    }
    this.addQueryParams();
  }

  // onJunkStage(value,event){
  //   this.resetInfiniteScroll()
  //   if(value=='USV'){
  //     this.filteredParams.stagestatus = '3';
  //   }
  //   if(event){
  //     this.filteredParams.stagestatus = event.detail.value
  //   }
  //   this.filteredParams.selectedStage = value;
  //   this.filteredParams.stage= value;
  //   this.addQueryParams();
  // }

  onJunkStage(value, stageStatus) {
    this.resetInfiniteScroll();
    if (value == 'USV') {
      this.filteredParams.stagestatus = '3';
    }
    if (stageStatus) {
      this.filteredParams.stagestatus = stageStatus;
    } else {
      this.filteredParams.stagestatus = '';
    }
    this.filteredParams.selectedStage = value;
    this.filteredParams.stage = value;
    this.addQueryParams();
  }

  onrsvstage(value, stagestatus?) {
    this.resetInfiniteScroll();
    if (value == 'overdues') {
      this.filteredParams.status = value;
      this.filteredParams.stagestatus = stagestatus ? stagestatus : '';
    } else {
      this.filteredParams.status = '';
      this.filteredParams.stagestatus = value;
    }
    this.addQueryParams();
  }

  onfnstage(value, stageStatus?) {
    this.resetInfiniteScroll();
    if (value == 'overdues') {
      this.filteredParams.status = value;
      this.filteredParams.stagestatus = stageStatus ? stageStatus : '';
    } else {
      this.filteredParams.status = '';
      this.filteredParams.stagestatus = value;
    }
    this.addQueryParams();
  }

  isenabled = true;
  suggestVisitedProperty;
  closedProperty;
  propertySearchTerm;
  executiveSearchedTerm;
  sourceSearchTerm;
  //FILTER PART
  setFilteredProperty() {
    this.propertyList1 = this.propertyList.filter((item) => {
      return item.property_info_name
        .toLowerCase()
        .includes(this.propertySearchTerm.toLowerCase());
    });
  }

  setFilteredExecutive() {
    this.mandateExecutives1 = this.mandateExecutives.filter((item) => {
      return item.name
        .toLowerCase()
        .includes(this.executiveSearchedTerm.toLowerCase());
    });
  }
  setFilteredCSExecutive() {
    this.mandateCSExecutives1 = this.mandateCSExecutives.filter((item) => {
      return item.name
        .toLowerCase()
        .includes(this.csexecutiveSearchedTerm.toLowerCase());
    });
  }
  setFilteredRMExecutive() {
    this.mandateRMExecutives1 = this.mandateRMExecutives.filter((item) => {
      return item.name
        .toLowerCase()
        .includes(this.rmexecutiveSearchedTerm.toLowerCase());
    });
  }

  setFilteredSource() {
    this.sourceList1 = this.sourceList.filter((item) => {
      return item.source
        .toLowerCase()
        .includes(this.sourceSearchTerm.toLowerCase());
    });
  }

  //When filtering by the end of the source name, ensure the scroll moves to the filtered source value
  async scrollToSelectedSource(): Promise<void> {
    const source = this.filteredParams.source;
    if (!source) {
      return;
    }
    const elementId = `${source}`;
    setTimeout(() => {
      const selectedElement = document.getElementById(elementId);
      if (selectedElement) {
        this.sourceScrollContent.scrollToPoint(
          0,
          selectedElement.offsetTop,
          500
        );
      } else {
        console.log('Element not found2:', elementId);
      }
    }, 1000);
  }

  // to get active executives
  toggleActiveExecutive(event) {
    this.showSpinner = true;
    if (event.detail.checked) {
      this.filteredParams.active = '1';
      this.getMandateExec();
    } else {
      this.filteredParams.active = '2';
      this.getMandateExec();
    }
  }

  reset_filter() {
    this.tempFilteredValues = {
      fromDate: '',
      toDate: '',
      status: this.filteredParams.status,
      stage: this.filteredParams.stage,
      team: '',
      propid: '',
      followup: '',
      executid:
        localStorage.getItem('Role') === '1'
          ? ''
          : localStorage.getItem('UserId'),
      loginid: localStorage.getItem('UserId'),
      priority: '',
      source: '',
      stagestatus: this.filteredParams.stagestatus,
      visits: '',
      receivedFromDate: '',
      receivedToDate: '',
      visitedfromdate: '',
      visitedtodate: '',
      assignedfromdate: '',
      assignedtodate: '',
      fromTime: '',
      toTime: '',
      selectedStage: '',
      fromDashboard: '',
      htype: this.filteredParams.htype,
      isDropDown: 'false',
      active: '1',
      type: this.filteredParams.type,
      limit: 0,
      limitrows: 5,
    };
    this.receivedDateRange = null;
    this.assignedDateRange = null;
    this.visitedDateRange = null;
    this.nextActionFromDate = null;
    this.nextActionToDate = null;
    this.initializeStartEndDate();
  }

  onFilterValues(value) {
    this.isLeftFilterActive = value;
    if (value == 'source') {
      this.scrollToSelectedSource();
    } else if (value == 'property') {
      // this.scrollToSelectedProperty();
    }
  }

  onFilterSelection(data, value) {
    switch (data) {
      case 'property':
        this.tempFilteredValues.propid = value;
        if (this.tempFilteredValues.propid === '28773') {
          this.mandateService.setHoverState('ranav_group');
        } else {
          this.mandateService.setHoverState('');
        }
        this.getMandateExec();
        break;
      case 'source':
        this.tempFilteredValues.source = value == 'all' ? '' : value;
        break;
      case 'exec':
        if (!Array.isArray(this.tempFilteredValues.executid)) {
          this.tempFilteredValues.executid = [];
        }

        if (value === 'all') {
          this.tempFilteredValues.executid = [];
        } else {
          const index = this.tempFilteredValues.executid.indexOf(value);
          if (index > -1) {
            // already selected → remove it
            this.tempFilteredValues.executid.splice(index, 1);
          } else {
            // not selected → add it
            this.tempFilteredValues.executid.push(value);
          }
        }
        this.tempFilteredValues.executid.join(',');
        break;
      case 'stage':
        this.tempFilteredValues.followup = value == 'all' ? '' : value;
        break;
      case 'visitType':
        this.tempFilteredValues.visits = value == 'all' ? '' : value;
        break;
      case 'assignTo':
        if (!Array.isArray(this.tempFilteredValues.rmexecutid)) {
          this.tempFilteredValues.rmexecutid = [];
        }

        if (value === 'all') {
          this.tempFilteredValues.rmexecutid = [];
        } else {
          const index = this.tempFilteredValues.rmexecutid.indexOf(value);
          if (index > -1) {
            // already selected → remove it
            this.tempFilteredValues.rmexecutid.splice(index, 1);
          } else {
            // not selected → add it
            this.tempFilteredValues.rmexecutid.push(value);
          }
        }
        this.tempFilteredValues.rmexecutid.join(',');
        this.tempFilteredValues.executid = this.tempFilteredValues.rmexecutid;
        // this.tempFilteredValues.rmexecutid = value == 'all' ? '' : value;
        // this.tempFilteredValues.executid = value == 'all' ? '' : value;
        break;
      case 'assignFrom':
        if (localStorage.getItem('Role') == '1') {
          this.tempFilteredValues.visitassignedto = value == 'all' ? '' : value;
        } else {
          this.tempFilteredValues.executid = value == 'all' ? '' : value;
        }
        break;
      case 'receivedDate':
        if (this.receivedDateRange?.length === 2) {
          const start = formatDate(
            this.receivedDateRange[0],
            'yyyy-MM-dd',
            'en-US'
          );
          const end = formatDate(
            this.receivedDateRange[1],
            'yyyy-MM-dd',
            'en-US'
          );
          this.tempFilteredValues.receivedFromDate = start;
          this.tempFilteredValues.receivedToDate =
            end != '1970-01-01' ? end : '';
          this.isenabled =
            this.tempFilteredValues.receivedToDate != '' &&
            this.tempFilteredValues.receivedToDate != '1970-01-01'
              ? true
              : false;
        }
        break;
      case 'assignedDate':
        if (this.assignedDateRange?.length === 2) {
          const start = formatDate(
            this.assignedDateRange[0],
            'yyyy-MM-dd',
            'en-US'
          );
          const end = formatDate(
            this.assignedDateRange[1],
            'yyyy-MM-dd',
            'en-US'
          );
          this.tempFilteredValues.assignedfromdate = start;
          this.tempFilteredValues.assignedtodate =
            end != '1970-01-01' ? end : '';
          this.isenabled =
            this.tempFilteredValues.assignedtodate != '' &&
            this.tempFilteredValues.assignedtodate != '1970-01-01'
              ? true
              : false;
        }
        break;
      case 'visitedDate':
        this.tempFilteredValues.fromDate = '';
        this.tempFilteredValues.toDate = '';
        if (this.visitedDateRange?.length === 2) {
          const start = formatDate(
            this.visitedDateRange[0],
            'yyyy-MM-dd',
            'en-US'
          );
          const end = formatDate(
            this.visitedDateRange[1],
            'yyyy-MM-dd',
            'en-US'
          );
          this.tempFilteredValues.visitedfromdate = start;
          this.tempFilteredValues.visitedtodate =
            end != '1970-01-01' ? end : '';
          this.isenabled =
            this.tempFilteredValues.visitedtodate != '' &&
            this.tempFilteredValues.visitedtodate != '1970-01-01'
              ? true
              : false;
        }
        break;
      case 'fromdate':
        const selectedfromDate = new Date(value).getHours();
        const currentfromDate = new Date().getHours();

        if (selectedfromDate === currentfromDate) {
          value.setHours(0, 0, 0, 0);
        }
        const fromdate1 = new Date(value);
        this.nextActionFromDate = fromdate1;
        this.tempFilteredValues.fromDate =
          fromdate1.toLocaleDateString('en-CA');
        this.tempFilteredValues.fromTime = fromdate1
          .toTimeString()
          .split(' ')[0];
        this.tempFilteredValues.toDate = '';
        this.nextActionToDate = null;
        if (this.tempFilteredValues.toDate == '') {
          this.isenabled = false;
        } else {
          this.isenabled = true;
        }
        this.minDate = fromdate1;
        break;
      case 'todate':
        const selectedtoDate = new Date(value).getHours();
        const currenttoDate = new Date().getHours();
        if (selectedtoDate === currenttoDate) {
          value.setHours(23, 59, 0, 0);
        }
        const todate = new Date(value);
        this.nextActionToDate = todate;
        this.tempFilteredValues.toDate = todate.toLocaleDateString('en-CA');
        this.tempFilteredValues.toTime = todate.toTimeString().split(' ')[0];
        this.isenabled = true;
        break;

      case 'receivedFromdate':
        const selectedDate = new Date(value.detail.value);
        this.tempFilteredValues.receivedFromDate =
          selectedDate.toLocaleDateString('en-CA');
        this.endDateMinDate = this.tempFilteredValues.receivedFromDate;
        if (this.tempFilteredValues.toDate.length === 0) {
          this.isenabled = false;
        }
        break;
      case 'receivedTodate':
        const selectedDate1 = new Date(value.detail.value);
        const adjustedDate = new Date(
          selectedDate1.getTime() - selectedDate1.getTimezoneOffset() * 60000
        );
        this.enddate = value.detail.value;
        this.tempFilteredValues.receivedToDate =
          adjustedDate.toLocaleDateString('en-CA');
        this.endDateMinDate = this.tempFilteredValues.receivedFromDate;
        if (this.tempFilteredValues.receivedToDate.length !== 0) {
          this.isenabled = true;
        }
        break;
      case 'assignedfromdate':
        const selectedassignDate = new Date(value.detail.value);
        this.tempFilteredValues.assignedfromdate =
          selectedassignDate.toLocaleDateString('en-CA');
        this.endDateMinDate = this.tempFilteredValues.assignedfromdate;
        if (this.tempFilteredValues.assignedtodate.length === 0) {
          this.isenabled = false;
        }
        break;
      case 'assignedtodate':
        const selectedassignDate1 = new Date(value.detail.value);
        const adjustedassignDate = new Date(
          selectedassignDate1.getTime() -
            selectedassignDate1.getTimezoneOffset() * 60000
        );
        this.enddate = value.detail.value;
        this.tempFilteredValues.assignedtodate =
          adjustedassignDate.toLocaleDateString('en-CA');
        this.endDateMinDate = this.tempFilteredValues.assignedfromdate;
        if (this.tempFilteredValues.assignedtodate.length !== 0) {
          this.isenabled = true;
        }
        break;
      case 'visitedfromdate':
        const selectedvisitedDate = new Date(value.detail.value);
        this.tempFilteredValues.visitedfromdate =
          selectedvisitedDate.toLocaleDateString('en-CA');
        this.endDateMinDate = this.tempFilteredValues.visitedfromdate;
        if (this.tempFilteredValues.visitedtodate.length === 0) {
          this.isenabled = false;
        }
        this.tempFilteredValues.fromDate = '';
        this.tempFilteredValues.toDate = '';
        break;
      case 'visitedtodate':
        const selectedvisitedDate1 = new Date(value.detail.value);
        const adjustedvisitedDate = new Date(
          selectedvisitedDate1.getTime() -
            selectedvisitedDate1.getTimezoneOffset() * 60000
        );
        this.enddate = value.detail.value;
        this.tempFilteredValues.visitedtodate =
          adjustedvisitedDate.toLocaleDateString('en-CA');
        this.endDateMinDate = this.tempFilteredValues.visitedfromdate;
        if (this.tempFilteredValues.visitedtodate.length !== 0) {
          this.isenabled = true;
        }
        this.tempFilteredValues.fromDate = '';
        this.tempFilteredValues.toDate = '';
        break;
      case 'priority':
        this.tempFilteredValues.priority = value;
        break;
      // case 'fromDate':
      //   const selectedfromDate = new Date(value.detail.value);
      //   this.tempFilteredValues.fromDate = selectedfromDate.toLocaleDateString('en-CA');
      //   this.tempFilteredValues.fromTime =  selectedfromDate.toTimeString().split(' ')[0]
      //   this.endDateMinDateNextaction =this.tempFilteredValues.fromDate
      //   if (this.tempFilteredValues.toDate.length === 0) {
      //     this.isenabled = false;
      //   }
      //   break;
      // case 'toDate':
      //   const selectedfromDate1 = new Date(value.detail.value);
      //   const adjustedfromDate = new Date(selectedfromDate1.getTime() - selectedfromDate1.getTimezoneOffset() * 60000);
      //   this.enddate = value.detail.value
      //   this.tempFilteredValues.toDate = adjustedfromDate.toLocaleDateString('en-CA');
      //   this.tempFilteredValues.toTime =  selectedfromDate1.toTimeString().split(' ')[0];
      //   this.endDateMinDate = this.tempFilteredValues.fromDate
      //   if (this.tempFilteredValues.toDate.length !== 0) {
      //     this.isenabled = true;
      //   }
      //   break;
    }

    const {
      assignedfromdate,
      assignedtodate,
      receivedFromDate,
      receivedToDate,
      visitedfromdate,
      visitedtodate,
      fromDate,
      toDate,
    } = this.tempFilteredValues;

    const isValid = !(
      (assignedfromdate &&
        (!assignedtodate || assignedtodate === '1970-01-01')) ||
      (receivedFromDate &&
        (!receivedToDate || receivedToDate === '1970-01-01')) ||
      (visitedfromdate && (!visitedtodate || visitedtodate === '1970-01-01')) ||
      (fromDate && (!toDate || toDate === '1970-01-01'))
    );
    this.isenabled = isValid;
  }
  //END

  fromExecids = [];
  assignedLeadIds = [];
  assignedLeadDetails = [];
  temporaryLeadIds = [];
  selectedLeadCount = 0;
  selectedExecutiveName;
  executives;
  selectedExecTeam;
  selectedTeam;
  selectedProperty;
  isRetail = false;
  randomId = '';
  reassignedResponseInfo;
  team = [
    { name: 'Retail Team', code: 'Retail' },
    { name: 'Mandate Team', code: 'Mandate' },
  ];
  execTeam = [
    { name: 'Relationship Executives', code: '50002' },
    { name: 'Customersupport Executives', code: '50014' },
  ];

  // RE-ASSIGN PART
  //this called when click on check box
  // checkedLeads(event){
  //   const leadId = event.srcElement.id.split(' ')[0];
  //   const excId =  event.srcElement.id.split(' ')[1];
  //   if(event.detail.checked){
  //     !this.assignedLeadIds.includes(leadId)?this.assignedLeadIds.push(leadId):'';
  //     !this.temporaryLeadIds.includes(leadId)?this.temporaryLeadIds.push(leadId):'';//temporary to store the the lead id's
  //     this.selectedLeadCount = this.assignedLeadIds.length;
  //     this.getSelectedLeadDetails();
  //   }else{
  //     this.assignedLeadDetails=[]
  //     this.assignedLeadIds=this.assignedLeadIds.filter(id => id !== leadId);//remove id from array
  //     this.temporaryLeadIds =  this.temporaryLeadIds.filter(id => id !== leadId);
  //     this.selectedLeadCount = this.assignedLeadIds.length;
  //     this.getSelectedLeadDetails();
  //   }
  // }

  checkedLeads(event) {
    this.checkedLeadsDetail = [];
    this.checkboxes.forEach((checkbox, index) => {
      if (checkbox.checked) {
        this.checkedLeadsDetail.push(this.leads_detail[index]);
      }
    });
    this.temporaryLeadIds = this.checkedLeadsDetail.map((lead) => lead.LeadID);
    this.checkedLeadsDetail.forEach((element) => {
      this.fromExecids.push(element.ExecId);
    });
  }

  // to get the selected lead details
  getSelectedLeadDetails() {
    const uniqueLeadDetails = new Set<string>(
      (this.assignedLeadDetails || []).map((detail) => detail.LeadID)
    );
    const newAssignedLeadDetails = this.leads_detail.filter((record) => {
      if (
        this.assignedLeadIds.includes(record.LeadID) &&
        !uniqueLeadDetails.has(record.LeadID)
      ) {
        uniqueLeadDetails.add(record.LeadID);
        return true;
      }
      return false;
    });
    this.assignedLeadDetails = [
      ...(this.assignedLeadDetails || []),
      ...newAssignedLeadDetails,
    ];
    this.assignedLeadDetails.forEach((element) => {
      this.fromExecids.push(element.ExecId);
    });
  }

  // onSelectLeadCount(count){
  //   if(this.selectedLeadCount == count ||
  //     (this.selectedLeadCount == this.leads_detail.length && count=='all' )){
  //     this.selectedLeadCount = 0
  //     this.temporaryLeadIds = []
  //   }else{
  //     this.selectedLeadCount = count === 'all' ? this.leads_detail.length : count ;
  //     this.temporaryLeadIds = this.leads_detail.filter((item, index) => index < this.selectedLeadCount).map(item =>
  //       item.LeadID
  //     );
  //   }
  //   this.assignedLeadIds = this.assignedLeadIds.concat(this.temporaryLeadIds);
  //   this.getSelectedLeadDetails();
  // }

  checkedLeadsDetail = [];
  selectedCount;
  @ViewChildren('freshleadsCheckboxes') checkboxes!: QueryList<IonCheckbox>;
  onSelectLeadCount(count) {
    if (count != 'manual' && parseInt(count) > this.leads_detail.length) {
      this.selectedLeadCount = parseInt(count);
      this.showSpinner = true;
      this.isManual = false;
      this.getAssignedLeadsDetail(false, parseInt(count)).then(() => {
        this.checkedLeadsDetail = this.leads_detail.slice(0, parseInt(count));
        this.temporaryLeadIds = this.checkedLeadsDetail.map(
          (lead) => lead.LeadID
        );
        this.checkedLeadsDetail.forEach((element) => {
          this.fromExecids.push(element.ExecId);
        });
      });
    } else {
      if (count == 'manual') {
        this.isManual = true;
        this.selectedCount = null;
        this.selectedLeadCount = 0;
        this.checkedLeadsDetail = [];
        this.temporaryLeadIds = [];
        this.fromExecids = [];
      } else {
        this.selectedCount = null;
        setTimeout(() => {
          this.selectedCount = count;
        });
        this.selectedLeadCount = parseInt(count);
        this.isManual = false;
        if (this.temporaryLeadIds.length == parseInt(count)) {
          this.checkedLeadsDetail = [];
          this.temporaryLeadIds = [];
        } else {
          this.checkedLeadsDetail = this.leads_detail.slice(0, parseInt(count));
          this.temporaryLeadIds = this.checkedLeadsDetail.map(
            (lead) => lead.LeadID
          );
          this.checkedLeadsDetail.forEach((element) => {
            this.fromExecids.push(element.ExecId);
          });
        }
      }
    }
  }

  openAssignLeadsModal() {
    if (this.temporaryLeadIds.length) {
      this.assignLeadsModal.present();
    } else {
      Swal.fire({
        title: 'Please select a lead to proceed',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'OK',
      });
    }
  }

  reset() {
    this.selectedExecutiveName = [];
    this.executives = [];
    this.selectedExecTeam = '';
    this.selectedTeam = null;
    this.selectedProperty = '';
  }
  onAssignTeamSelect(event) {
    this.isRetail = event.value.code === 'Retail';
    this.executives = [];
    this.selectedExecutiveName = [];
  }
  onExecTeamSelect(event) {
    this.showSpinner = true;
    this.selectedExecutiveName = [];
    this.mandateService
      .fetchmandateexecutives(
        this.selectedProperty?.property_idfk,
        '',
        event.value.code
      )
      .subscribe((response) => {
        this.executives = response['mandateexecutives'];
        this.showSpinner = false;
      });
  }
  onPropertySelect(event) {
    this.showSpinner = true;
    this.selectedExecutiveName = [];

    if (event.value.property_idfk === '28773') {
      this.mandateService.setHoverState('ranav_group');
    } else {
      this.mandateService.setHoverState('');
    }

    let selectedExecTeam;
    if (this.selectedExecTeam != undefined || this.selectedExecTeam != '') {
      selectedExecTeam = this.selectedExecTeam;
    }
    this.mandateService
      .fetchmandateexecutives(
        event.value.property_idfk,
        '',
        selectedExecTeam?.code
      )
      .subscribe((response) => {
        this.executives = response['mandateexecutives'];
        this.showSpinner = false;
      });
  }
  onexecutive(event) {
    console.log(this.selectedExecutiveName);
  }

  toggle_random_assign(event) {
    event.detail.checked ? (this.randomId = '1') : (this.randomId = '');
  }

  assignLead() {
    if (!this.selectedProperty) {
      Swal.fire({
        title: 'Please select an property before proceeding.',
        icon: 'warning',
        heightAuto: false,
        confirmButtonText: 'OK',
      });
    } else if (
      this.selectedExecutiveName?.length === 0 ||
      this.selectedExecutiveName === undefined
    ) {
      Swal.fire({
        title: 'Please select an executive before proceeding.',
        icon: 'warning',
        heightAuto: false,
        confirmButtonText: 'OK',
      });
    } else {
      const selectedExecutiveIds = [];
      this.selectedExecutiveName.forEach((executive) => {
        selectedExecutiveIds.push(executive.id);
      });

      const param = {
        rmID: selectedExecutiveIds,
        LeadID: this.temporaryLeadIds,
        propID: this.isRetail ? '' : this.selectedProperty.property_idfk,
        random: this.randomId,
        fromExecids: this.fromExecids,
        loginId: localStorage.getItem('UserId'),
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
        // if (this.isRetail) {
        //   this.retailService.leadreassign(param).subscribe((response) => {
        //     if (response['status'] == 'True') {
        //       this.reassignedResponseInfo = response['assignedleads'];
        //       Swal.fire({
        //         title: 'Assigned Successfully',
        //         icon: 'success',
        //         heightAuto: false,
        //         confirmButtonText: 'Show Details',
        //       }).then((result) => {
        //         this.showSpinner = true;
        //         if (result.isConfirmed) {
        //           this.assignLeadsModal.dismiss();
        //           this.viewAssignLeadDetail.present();
        //         } else if (result.dismiss === Swal.DismissReason.backdrop) {
        //           this.assignLeadsModal.dismiss();
        //           this.viewAssignLeadDetail.present();
        //         }
        //       });
        //     }
        //   });
        // } else {
        this.mandateService.leadreassign(param).subscribe((response) => {
          if (response['status'] == 'True') {
            this.reassignedResponseInfo = response['assignedleads'];
            Swal.fire({
              title: 'Assigned Successfully',
              icon: 'success',
              heightAuto: false,
              allowOutsideClick: true,
              confirmButtonText: 'Show Details',
            }).then((result) => {
              this.showSpinner = true;
              if (result.isConfirmed) {
                this.assignLeadsModal.dismiss();
                this.viewAssignLeadDetail.present();
              } else if (result.dismiss === Swal.DismissReason.backdrop) {
                this.assignLeadsModal.dismiss();
                this.viewAssignLeadDetail.present();
              }
            });
          }
        });
        // }
      }
    }
  }

  onWillDismiss(event) {
    location.reload();
  }

  onViewAssignLeadDetailClose() {
    this.viewAssignLeadDetail.dismiss();
    window.location.reload();
  }

  onBackicon() {
    this.selectedLeadCount = 0;
    this.isCheckbox = false;
    this.showSpinner = false;
  }
  onReassign() {
    this.temporaryLeadIds = [];
    this.isCheckbox = true;
  }
  //END

  isLeftFilterActive;
  // TO DISPLAY FILTER SECTION
  navigateToFilter() {
    this.settingSelectedDate();
    if ('ranavPropId' in localStorage && this.isAdmin) {
      this.isLeftFilterActive = 'source';
    } else if ('ranavPropId' in localStorage && !this.isAdmin) {
      this.isLeftFilterActive = 'assignedDate';
    } else {
      this.isLeftFilterActive = 'property';
    }
    this.tempFilteredValues = { ...this.filteredParams };
    this.filterModal.present();
  }

  get fromDateTime(): string {
    return `${this.filteredParams.fromDate || ''}, ${
      this.filteredParams.fromTime || ''
    }`;
  }

  get toDateTime(): string {
    return `${this.filteredParams.toDate || ''}, ${
      this.filteredParams.toTime || ''
    }`;
  }
  // Called when the background is clicked while the dropdown is open.
  // This closes the dropdown and updates the query parameters.
  onBackgroundClick() {
    this.filteredParams.isDropDown = 'false';
    this.addQueryParams();
  }

  onHtype(htype) {
    this.reset_filter();
    this.filteredParams = {
      ...this.tempFilteredValues,
      visittype: htype !== 'mandate' ? '3' : '',
    };
    let queryParams = {};
    for (const key in this.filteredParams) {
      if (
        this.filteredParams.hasOwnProperty(key) &&
        this.filteredParams[key] !== ''
      ) {
        queryParams[key] = this.filteredParams[key];
      } else {
        queryParams[key] = null;
      }
    }

    if (this.isHeader == true && localStorage.getItem('Role') != '1') {
      queryParams = { ...queryParams, visittype: '1' };
    }

    if (htype == 'mandate') {
      this.router.navigate(['mandate-visit-stages'], {
        queryParams,
        queryParamsHandling: 'merge',
      });
    } else {
      this.router.navigate(['retail-visit-stages'], {
        queryParams,
        queryParamsHandling: 'merge',
      });
    }
  }

  openEndMenu() {
    this._sharedservice.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  confirmSelection() {
    this.filteredParams = { ...this.tempFilteredValues };
    this.filterModal.dismiss();
    this.addQueryParams();
  }

  propertyPriceList;
  getPriceList() {
    this.mandateService.getPriceList().subscribe((resp) => {
      if (resp['status'] == 'True') {
        this.propertyPriceList = resp['result'];
        this.propertyPriceList.forEach((element) => {
          if (element.PropId === '16793') {
            this.grSitaraPropertyInfo = element.PropInfo;
          } else if (element.PropId === '1830') {
            this.grSamskruthiProperyInfo = element.PropInfo;
          }
        });
      } else {
        this.propertyPriceList = [];
      }
    });
  }

  grSitaraPropertyInfo;
  grSamskruthiProperyInfo;
  @ViewChild('propInfo') propInfo!: ElementRef;
  sendWhatsApp(lead, type) {
    let url;
    const phoneNumber = lead.number;
    // const phoneNumber = '917090080306';
    if (lead.suggestedprop[0].propid === '16793') {
      if (type == 'location') {
        url = 'https://maps.app.goo.gl/FzU4bXzB8SgXRgPT8';
      } else if (type == 'brochure') {
        url =
          'https://lead247.in/images/brochure/GR%20Sitara%20Actual%20photos%20.pdf';
      } else if ((type = 'info')) {
        const textContent = this.propInfo.nativeElement.innerText; // Get plain text (no HTML tags)
        url = textContent
          .split('\n') // Split by new lines
          .map((line) => line.trim()) // Trim spaces from each line
          .filter(
            (line, index, arr) =>
              line !== '' || (arr[index - 1] && arr[index - 1] !== '')
          ) // Remove consecutive empty lines
          .join('\n'); // Join back with a single newline
      }
    } else if (lead.suggestedprop[0].propid === '1830') {
      if (type == 'location') {
        url = 'https://maps.app.goo.gl/3dvi23Sd6PPqvM91A';
      } else if (type == 'brochure') {
        url =
          'https://lead247.in/images/brochure/GR%20Samskruthi%20Brochure%20New..pdf';
      } else if ((type = 'info')) {
        const textContent = this.propInfo.nativeElement.innerText; // Get plain text (no HTML tags)
        url = textContent
          .split('\n') // Split by new lines
          .map((line) => line.trim()) // Trim spaces from each line
          .filter(
            (line, index, arr) =>
              line !== '' || (arr[index - 1] && arr[index - 1] !== '')
          ) // Remove consecutive empty lines
          .join('\n'); // Join back with a single newline
      }
    }
    const message = encodeURIComponent(`${url}`);
    const whatsappUrl = `https://wa.me/+91${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }

  teamLeadReassign() {
    if (!this.selectedProperty) {
      Swal.fire({
        title: 'Please select an property before proceeding.',
        icon: 'warning',
        heightAuto: false,
        confirmButtonText: 'OK',
      });
    } else if (
      this.selectedExecutiveName?.length === 0 ||
      this.selectedExecutiveName === undefined
    ) {
      Swal.fire({
        title: 'Please select an executive before proceeding.',
        icon: 'warning',
        heightAuto: false,
        confirmButtonText: 'OK',
      });
    } else {
      const param = {
        toExecid: this.selectedExecutiveName.id,
        LeadID: this.temporaryLeadIds,
        propID: this.selectedProperty.property_idfk,
        fromExecids: this.fromExecids,
        loginId: localStorage.getItem('UserId'),
      };
      this.mandateService.teamLeadreassign(param).subscribe((response) => {
        this.reassignedResponseInfo = response['assignedleads'];
        Swal.fire({
          title: 'Assigned Successfully',
          icon: 'success',
          heightAuto: false,
          allowOutsideClick: true,
          confirmButtonText: 'Show Details',
        }).then((result) => {
          this.showSpinner = true;
          if (result.isConfirmed) {
            this.assignLeadsModal.dismiss();
            this.viewAssignLeadDetail.present();
          } else if (result.dismiss === Swal.DismissReason.backdrop) {
            this.assignLeadsModal.dismiss();
            this.viewAssignLeadDetail.present();
          }
        });
      });
    }
  }
  retailExecutives;
  retailExecutives1;
  getRetailExec(roleId) {
    this.retailService
      .getRetailExecutives(roleId, this.filteredParams.active)
      .subscribe((exec) => {
        this.retailExecutives = exec['DashboardCounts'];
        this.retailExecutives1 = this.retailExecutives;
      });
  }

  executives1;
  getRetailExecutive() {
    this.retailService
      .fetchRetail_executivesName('50004', '')
      .subscribe((response) => {
        this.executives1 = response['DashboardCounts'];
      });
  }

  feedbackAssignLead() {
    if (
      this.selectedExecutiveName?.length === 0 ||
      this.selectedExecutiveName === undefined
    ) {
      Swal.fire({
        title: 'Please select an executive before proceeding.',
        icon: 'warning',
        heightAuto: false,
        confirmButtonText: 'OK',
      });
    } else {
      const selectedExecutiveIds = this.selectedExecutiveName.ExecId;

      let param = {
        rmID: selectedExecutiveIds,
        LeadID: this.temporaryLeadIds,
        random: this.randomId,
        loginid: localStorage.getItem('UserId'),
        fromExecids: this.fromExecids,
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
        this.showSpinner = true;
        this.mandateService.feedbackassign(param).subscribe((success) => {
          this.showSpinner = false;
          if (success['status'] == 'True') {
            Swal.fire({
              title: 'Assigned Successfully',
              icon: 'success',
              heightAuto: false,
              confirmButtonText: 'Show Details',
            }).then((result) => {
              this.reassignedResponseInfo = success['assignedleads'];
              this.showSpinner = true;
              if (result.isConfirmed) {
                this.assignLeadsModal.dismiss();
                this.viewAssignLeadDetail.present();
              } else if (result.dismiss === Swal.DismissReason.backdrop) {
                this.assignLeadsModal.dismiss();
                this.viewAssignLeadDetail.present();
              }
            });
          } else {
            Swal.fire({
              title: 'Authentication Failed!',
              text: 'Please try agin',
              icon: 'error',
              confirmButtonText: 'ok',
            }).then(() => {});
          }
        });
      }
    }
  }

  onVisits(visitsValue) {
    this.filteredParams.visittype = visitsValue;
    if (visitsValue == '2' || visitsValue == '3') {
      this.filteredParams.visitassignedto = '';
    }
    this.addQueryParams();
  }

  isAtBottom = false;
  canScroll;
  @ViewChild('content', { static: false }) content: IonContent;
  onScroll(event: CustomEvent) {
    this._sharedservice.scrollTop = event.detail.scrollTop;
    const scrollTop = event.detail.scrollTop;
    this.content.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;

      this.canScroll = scrollHeight > clientHeight + 10; // ADD A BUFFER of 10px

      if (!this.canScroll) {
        this.isAtBottom = false;
        this._sharedservice.isBottom = false;
      } else {
        this.isAtBottom = scrollTop + clientHeight >= scrollHeight - 100;
        this._sharedservice.isBottom =
          scrollTop + clientHeight >= scrollHeight - 100;
      }
    });
  }

  receivedDateRange;
  assignedDateRange;
  visitedDateRange;
  nextActionFromDate;
  nextActionToDate;
  daterange(data) {
    const from = this.tempFilteredValues.fromDate;
    const to =
      data == 'receivedDate' &&
      this.tempFilteredValues.receivedToDate != '1970-01-01'
        ? this.tempFilteredValues.toDate
        : '';

    if (
      data == 'receivedDate' &&
      this.tempFilteredValues.receivedFromDate != ''
    ) {
      return `${this.tempFilteredValues.receivedFromDate} to ${this.tempFilteredValues.receivedToDate}`;
    } else if (
      data == 'assignedDate' &&
      this.tempFilteredValues.assignedfromdate != ''
    ) {
      return `${this.tempFilteredValues.assignedfromdate} to ${this.tempFilteredValues.assignedtodate}`;
    } else if (
      data == 'visitedDate' &&
      this.tempFilteredValues.visitedfromdate != ''
    ) {
      return `${this.tempFilteredValues.visitedfromdate} to ${this.tempFilteredValues.visitedtodate}`;
    } else if (data == 'from' && this.tempFilteredValues.fromDate != '') {
      return `${this.tempFilteredValues.fromDate} , ${this.tempFilteredValues.fromTime}`;
    } else if (data == 'to' && this.tempFilteredValues.toDate != '') {
      return `${this.tempFilteredValues.toDate} , ${this.tempFilteredValues.toTime}`;
    } else {
      return `${'Select Date Range'}`;
    }
  }

  warningMessage() {
    if (this.filteredParams.fromDate == '') {
      Swal.fire({
        title: 'Please select a From Date',
        text: 'From Date is required to apply the filter',
        confirmButtonText: 'OK',
        heightAuto: false,
        allowOutsideClick: false,
      }).then((result) => {});
    }
  }

  settingSelectedDate() {
    if (this.filteredParams.receivedFromDate != '') {
      const fromDate = new Date(this.filteredParams.receivedFromDate);
      const toDate = new Date(this.filteredParams.receivedToDate);
      this.receivedDateRange = [fromDate, toDate];
    } else if (this.filteredParams.receivedFromDate == '') {
      this.receivedDateRange = null;
    }
    if (this.filteredParams.assignedfromdate != '') {
      const fromDate = new Date(this.filteredParams.assignedfromdate);
      const toDate = new Date(this.filteredParams.assignedtodate);
      this.assignedDateRange = [fromDate, toDate];
    } else if (this.filteredParams.assignedfromdate == '') {
      this.assignedDateRange = null;
    }

    if (this.filteredParams.visitedfromdate != '') {
      const fromDate = new Date(this.filteredParams.visitedfromdate);
      const toDate = new Date(this.filteredParams.visitedtodate);
      this.visitedDateRange = [fromDate, toDate];
    } else if (this.filteredParams.visitedfromdate == '') {
      this.visitedDateRange = null;
    }
  }

  closeFilterModal() {
    this.receivedDateRange = null;
    this.assignedDateRange = null;
    this.visitedDateRange = null;
    this.nextActionFromDate = null;
    this.nextActionToDate = null;
    this.showSpinner = false;
    this.filterModal.dismiss();
  }

  isOnCallDetailsPage = false;

  leadDetailsModalClose(event) {
    this.showSpinner = true;
    this.router.navigate([], {
      queryParams: {
        isOnCallDetailsPage: null,
        leadId: null,
        execid: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  onplayButton(lead) {
    this.router.navigate(['./all-and-live-call-details'], {
      queryParams: {
        execid: lead.ExecId,
        isAllCallLogs: false,
        callRecord: true,
        clientnum: lead.number,
        lastUpdate: lead.lastupdated,
        leadName: lead.CustomerName,
      },
    });
  }

  navigateToWhatsApp(number) {
    this.router.navigate(['./clients-chats'], {
      queryParams: {
        chatListSearch: number,
        selectedChat: 'all',
        htype: this.filteredParams.htype,
      },
    });
  }

  removeExecutive(execId: string | number) {
    this.filteredParams.executid = [];
    this.filteredParams.rmexecutid = [];
    // if (execId == 'rmid') {
    //   this.filteredParams.executid = [];
    //   this.filteredParams.rmexecutid = [];
    // } else {
    //   if (Array.isArray(this.filteredParams.executid)) {
    //     // Remove that particular executive id
    //     this.filteredParams.executid = this.filteredParams.executid.filter(
    //       (id) => id != execId
    //     );
    //   } else if (this.filteredParams.executid == execId) {
    //     // If only one id was selected
    //   }
    // }

    // Update query params
    this.addQueryParams();
  }

  removingExecChips(execId: string | number) {
    // if (
    //   this.localStorage.getItem('Role') == '50003' ||
    //   localStorage.getItem('Role') == '50004'
    // ) {
    //   this.filteredParams.executid = localStorage.getItem('UserId');
    // } else {
    //   this.filteredParams.executid = '';
    // }
    if (Array.isArray(this.filteredParams.executid)) {
      // Remove that particular executive id
      this.filteredParams.executid = this.filteredParams.executid.filter(
        (id) => id != execId
      );
    } else if (this.filteredParams.executid == execId) {
      // If only one id was selected
      this.filteredParams.executid = [];
    }
    this.addQueryParams();
  }
  priority_id;
  priorityUpdateLead;
  @ViewChild('addPriorityModal') addPriorityModal;
  onSetPriority(lead, isEdit) {
    this.priorityUpdateLead = lead;
    if (!isEdit) {
      this.priority_id = '';
    }
    this.addPriorityModal.present();
  }
  onUpdatePriority() {
    this.mandateService
      .updatehotwarmcold(this.priority_id, this.priorityUpdateLead.LeadID)
      .subscribe((resp) => {
        Swal.fire({
          title: 'Updated Successfully',
          text: 'Priority type Successfully updated',
          icon: 'success',
          heightAuto: false,
          confirmButtonText: 'OK',
        }).then(() => {
          this.addPriorityModal.dismiss();
          location.reload();
        });
      });
  }

  getTodayDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  // Convert API date string to Date object
  toDate(dateStr: string): Date {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0); // remove time part
    return d;
  }

  calculateDiff(dateStr: string): number {
    if (!dateStr) return 0;

    const nextDate = this.toDate(dateStr);
    const diffTime = nextDate.getTime() - this.todaysDate.getTime();
    return Math.ceil(Math.abs(diffTime / (1000 * 60 * 60 * 24)));
  }

  async ngOnDestroy() {
    this._sharedservice.dismissAllOverlays();
  }

  onEnableAccess() {
    console.log(this.accessingReassigningLead);
    const params = {
      leadid: this.accessingReassigningLead['LeadID'],
      execid: this.accessingReassigningLead['ExecId'],
      propid: this.accessingReassigningLead['propertyid'],
    };
    this.mandateService.givevisitaccess(params).subscribe((resp) => {
      if (resp['status'] == 'True') {
        Swal.fire({
          title: 'Enabled Successfully',
          text: 'Lead Access reverted Successfully',
          icon: 'success',
          timer: 2000,
          heightAuto: false,
          showConfirmButton: false,
        }).then(() => {
          location.reload();
        });
      } else {
        Swal.fire({
          title: 'Some Error Occured',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  }
  accessingReassigningLead = [];
  @ViewChild('accessRemovedModal') accessRemovedModal;

  onAccessRemoved(lead) {
    this.accessingReassigningLead = [];
    this.accessingReassigningLead = lead;
    this.accessRemovedModal.present();
  }

  @ViewChild('overdueLeadAssignModal') overdueLeadAssignModal;
  onReassignOverdueLead() {
    this.mandateService
      .fetchmandateexecutives(
        this.accessingReassigningLead['propertyid'],
        '',
        ''
      )
      .subscribe((response) => {
        this.executives = response['mandateexecutives'];
        this.showSpinner = false;
      });
    this.accessRemovedModal.dismiss();
    this.overdueLeadAssignModal.present();
  }

  onOverdueAssign() {
    const selectedExecutiveIds = [];
    this.selectedExecutiveName.forEach((executive) => {
      selectedExecutiveIds.push(executive.id);
    });

    const params = {
      rmID: selectedExecutiveIds,
      LeadID: this.accessingReassigningLead['LeadID'],
      propID: this.accessingReassigningLead['propertyid'],
      loginId: this.localStorage.getItem('UserId'),
      fromExecids: this.accessingReassigningLead['ExecId'],
    };

    if (
      this.selectedExecutiveName?.length === 0 ||
      this.selectedExecutiveName === undefined
    ) {
      Swal.fire({
        title: 'Please select an executive before proceeding.',
        icon: 'warning',
        heightAuto: false,
        confirmButtonText: 'OK',
      });
    } else {
      this.mandateService.leadreassign(params).subscribe((resp) => {
        if (resp['status'] == 'True') {
          this.reassignedResponseInfo = resp['assignedleads'];
          Swal.fire({
            title: 'Assigned Successfully',
            icon: 'success',
            heightAuto: false,
            confirmButtonText: 'Show Details',
          }).then(() => {
            this.overdueLeadAssignModal.dismiss();
            this.viewAssignLeadDetail.present();
          });
        } else {
          Swal.fire({
            title: 'Authentication Failed!',
            text: 'Please try agin',
            icon: 'error',
            heightAuto: false,
            confirmButtonText: 'OK',
          });
        }
      });
    }
  }
}

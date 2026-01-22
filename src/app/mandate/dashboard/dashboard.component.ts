import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Subject,
  Subscription,
  catchError,
  distinctUntilChanged,
  forkJoin,
  of,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import {
  IonContent,
  IonModal,
  IonPopover,
  MenuController,
  Platform,
  PopoverController,
  ToastController,
} from '@ionic/angular';
import { formatDate, Location } from '@angular/common';
import { MandateService } from '../../mandate-service.service';
import { SharedService } from 'src/app/shared.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  showSpinner1 = true;
  usvPlans = [];

  @ViewChild('mainscrollContainer', { static: false }) content: IonContent;
  @ViewChild('dashboard_custDate_modal') dashboard_custDate_modal: IonModal;
  @ViewChild('dashboard_fromDate_modal') dashboard_fromDate_modal: IonModal;
  @ViewChild('dashboard_toDate_modal') dashboard_toDate_modal: IonModal;
  segments = 6;
  weekDataCal: any[];
  weekData = [
    {
      label: 'Assigned',
      value: 0,
      total: 0,
      color: 'blue',
      type: 'solid',
      bgColor: '#F1F9FF',
      labelColor: '#005B8B',
    },
    {
      label: 'Active',
      value: 0,
      total: 0,
      color: 'green',
      type: 'segment',
      bgColor: '#F3FEE5',
      labelColor: '#437903',
    },
    {
      label: 'Inactive',
      value: 0,
      total: 0,
      color: 'orange',
      type: 'segment',
      bgColor: '#FFEFE8',
      labelColor: '#C53B01',
    },
    {
      label: 'Junk',
      value: 0,
      total: 0,
      color: 'red',
      type: 'segment',
      bgColor: '#FFF3F3',
      labelColor: '#B50E0E',
    },
  ];
  leads_count = {
    assigned: '0',
    untouched: '0',
    touched: '0',
    inactive: '0',
    junkLeads: '0',
    active: '0',
    generalFollowups: '0',
    nc: '0',
    usvfix: '0',
  };

  visits_count = {
    allVisits: '',
    activeVisits: '',
    usv: '',
    rsv: '',
    fn: '',
    bookingRequest: '',
    rejected: '',
    closed: '',
    junk: '',
    dcr: '',
    dcp: '',
    overdueDCR: '',
    overdueDCP: '',
  };
  overdues_count = {
    gf: '',
    nc: '',
    usv: '',
    rsv: '',
    fn: '',
    overdueDCP: '',
    overdueDCR: '',
  };
  scheduledtoday_count = {
    usv: '',
    rsv: '',
    fn: '',
  };

  totalScheduledtoday_overdueCount = {
    scheduledToday: '',
    overdue: '',
  };
  scheduledTodayOrOverduesData = [];
  allCallsData = [];
  teamNames = [
    { name: 'All', value: '' },
    { name: 'RM Executives', value: '50002' },
    { name: 'CS Executives', value: '50014' },
  ];
  selectedTeam;
  roleid: string;
  toggleDarkMode(event: any) {
    const isDark = event.detail.checked;

    document.body.classList.toggle('dark', isDark);

    // store theme
    localStorage.setItem('dark-theme', isDark ? '1' : '0');
  }

  filteredParams1 = {
    fromDate: new Date().toLocaleDateString('en-CA'),
    toDate: new Date().toLocaleDateString('en-CA'),
    visitedfromdate: new Date().toLocaleDateString('en-CA'),
    visitedtodate: new Date().toLocaleDateString('en-CA'),
    isLeadsVisitsCalls: 'leads',
    scheduledTodayOrOverdues: 'scheduledtoday',
    isDateFilter: 'today',
    activeExec: '1',
    executid:
      localStorage.getItem('UserId') != '1'
        ? localStorage.getItem('UserId')
        : '',
    execName: '',
    propid: '',
    propertyName: '',
    team: '',
    status: '',
    stage: '',
    stagestatus: '',
    visits: '',
    followup: '',
    roleId: '',
    loginid: localStorage.getItem('UserId'),
    callstage: 'overall',
    teamlead:
      localStorage.getItem('RoleType') == '1'
        ? localStorage.getItem('UserId')
        : '',
    htype: '',
    leadvisit: '',
    limit: 0,
    limitrows: 5,
  };
  isScheduledOverdueUpwardIcon = false;
  scheduledExecLC;
  overdueExecLC;

  executiveLeadCounts; //to hold all the leads details counts of executive

  selectedExecu;
  isExpanded = false;
  localStorage = localStorage;
  dateRange = {
    fromdate: null as Date | null,
    todate: null as Date | null,
  };
  propertyLists;
  executiveNames;
  showSpinner = false;
  isActiveExecLoader = true;
  origin: string = '';
  private backButtonSubscription: Subscription;
  private lastTimeBackPress = 0;
  private timePeriodToExit = 2000;
  isCP;
  private destroy$ = new Subject<void>();
  isAccSwitched;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private platform: Platform,
    public sharedService: SharedService,
    private toastController: ToastController,
    private location: Location,
    public popoverController: PopoverController,
    private router: Router,
    private mandateService: MandateService,
    private activeRoute: ActivatedRoute,
    private menuCtrl: MenuController
  ) {
    this.isCP = localStorage.getItem('cpId') == '1';
    this.roleid = localStorage.getItem('Role');
    this.isAccSwitched = localStorage.getItem('mainAccount') !== null;
    this.platform.resume.subscribe(() => {
      this.changeDetectorRef.detectChanges();
    });
  }
  mandatePercent;
  retailPercent;
  // ngOnInit() {
  //   this.isCP = localStorage.getItem('cpId') == '1';
  //   this.roleid = localStorage.getItem('Role');
  // }

  ionViewWillEnter() {
    this.origin = window.location.origin;
    this.backButtonSubscription =
      this.platform.backButton.subscribeWithPriority(9999, async () => {
        this.popoverController.dismiss();
        if (
          this.localStorage.getItem('Role') == '1' ||
          localStorage.getItem('Role') != '1'
        ) {
          // Get current timestamp
          const currentTime = new Date().getTime();
          // Check if the back button was pressed within the last `timePeriodToExit` milliseconds
          if (currentTime - this.lastTimeBackPress < this.timePeriodToExit) {
            navigator['app'].exitApp(); // Exit the app
          } else {
            // Update the last back press time
            this.lastTimeBackPress = currentTime;
            // Show exit toast
            this.showExitToast();
          }
        } else {
          this.location.back();
          this.filteredParams1.executid = '';
          this.getAssignedLeadsCount();
        }
      });

    this.isCP = localStorage.getItem('cpId') == '1';
    this.roleid = localStorage.getItem('Role');
    this.activeRoute.queryParams
      .pipe(
        takeUntil(this.destroy$),
        tap((params) => {
          this.scheduledTodayOrOverduesData = [];

          this.getQueryParams();
          this.isOnCallDetailsPage = params['isOnCallDetailsPage'] === 'true';
        }),
        switchMap(() => this.fetchPropertyLists())
      )
      .subscribe((params) => {
        this.content.scrollToTop(300);
        this.fetchmandateexecutives();
        this.getAssignedLeadsCount();
      });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
  async showExitToast() {
    const toast = await this.toastController.create({
      message: 'Tap back button again to exit',
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }

  //to Get All Information abouts leads track of executives
  getExecutiveQuickView(active) {
    this.isActiveExecLoader = true;
    const param = {
      PropID: this.filteredParams1.propid,
      fromdate: this.filteredParams1.fromDate
        ? this.filteredParams1.fromDate
        : this.filteredParams1.visitedfromdate,
      todate: this.filteredParams1.toDate
        ? this.filteredParams1.toDate
        : this.filteredParams1.visitedtodate,
      active: active,
    };
    this.mandateService.getAllExecutiveInfo(param).subscribe((param) => {
      this.executiveLeadCounts = param['Dashtotal'];

      if (active == '1') {
        this.executiveLeadCounts = this.executiveLeadCounts.filter((exec) => {
          return exec['counts']['0']['All_Visits'] > '0';
        });
      } else {
        this.executiveLeadCounts = param['Dashtotal'];
      }
      this.isActiveExecLoader = false;
    });
    this.getScheduledTodayAndOverdueExecLC();
  }

  //scheduled today and overdue counts for each executive
  getScheduledTodayAndOverdueExecLC() {
    const param1 = {
      PropID:
        this.localStorage.getItem('RoleType') === '1'
          ? this.localStorage.getItem('PropertyId')
          : this.filteredParams1.propid,
      fromdate: new Date().toLocaleDateString('en-CA'),
      todate: new Date().toLocaleDateString('en-CA'),
    };

    this.mandateService
      .getscheduledtoday_execquickview(param1)
      .subscribe((param) => {
        const schedOverdueExecLC = param['Dashtotal'];
        // scheduled today executives counts
        this.scheduledExecLC = schedOverdueExecLC.filter((response) => {
          return response['counts']['0']['All_Visits'] > '0';
        });

        // Overdue executives counts
        this.overdueExecLC = schedOverdueExecLC.filter((response) => {
          return response['counts']['0']['Overdues'] > '0';
        });
      });
  }

  // method to get the executive names
  fetchmandateexecutives() {
    if (this.localStorage.getItem('RoleType') === '1') {
      this.filteredParams1.team = '2';
      this.filteredParams1.propid = this.localStorage.getItem('PropertyId');
    }
    if (this.filteredParams1.isLeadsVisitsCalls == 'calls') {
      this.filteredParams1.propid = '';
    }

    return new Promise((resolve, reject) => {
      this.mandateService
        .fetchmandateexecutives1(
          this.filteredParams1.propid,
          this.filteredParams1.team,
          this.filteredParams1.activeExec,
          this.filteredParams1.roleId,
          this.localStorage.getItem('RoleType') == '1'
            ? this.localStorage.getItem('UserId')
            : ''
        )
        .subscribe((response) => {
          this.executiveNames = response['mandateexecutives'];
          // this.executiveNames = [
          //   { name: 'All', executid: '' },
          //   ...(response['mandateexecutives'] || []),
          // ];

          this.executiveNames = [
            { name: 'All', executid: '' },
            ...(response['mandateexecutives'] || []).filter(
              (x) => x.name !== 'Test RM' && x.name !== 'Test CS'
            ),
          ];

          if (
            localStorage.getItem('RoleType') == '1' &&
            this.filteredParams1.executid == '' &&
            this.filteredParams1.isLeadsVisitsCalls == 'calls'
          ) {
            this.selectedExecu = this.executiveNames?.filter((exec, i) => {
              if (exec.id == localStorage.getItem('UserId')) {
                return exec;
              }
            });
          } else {
            this.selectedExecu = this.executiveNames?.filter((exec, i) => {
              if (exec.id == this.filteredParams1.executid) {
                return exec;
              }
            });
          }
          this.selectedExecu = this.selectedExecu?.[0];
          resolve(true);
        });
    });
  }

  openEndMenu() {
    this.sharedService.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  //To get the property lists
  fetchPropertyLists() {
    return new Promise((resolve, reject) => {
      this.mandateService
        .getmandateprojects1(this.localStorage.getItem('UserId'))
        .subscribe(
          (response) => {
            if (response['status'] === 'True') {
              this.propertyLists = response['Properties'];
              resolve(true);
            } else {
              reject('Failed to fetch project names');
            }
          },
          (error) => {
            console.error('Error fetching project names:', error);
            reject(error);
          }
        );
    });
  }

  // to add querry params
  addQueryParams() {
    const queryParams: any = {};

    for (const key in this.filteredParams1) {
      if (this.filteredParams1.hasOwnProperty(key)) {
        let value = this.filteredParams1[key];

        // Convert string "true"/"false" to boolean
        if (value === 'true') {
          value = true;
        } else if (value === 'false') {
          value = false;
        }

        // Assign only if not empty
        queryParams[key] = value !== '' ? value : null;
      }
    }
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  getQueryParams() {
    const queryString = window.location.search;
    const queryParams: any = {};

    // Read all query params from URL
    new URLSearchParams(queryString).forEach((value, key) => {
      queryParams[key] = value;
    });

    // Merge with defaults
    const result: any = { ...this.filteredParams1 };
    Object.keys(result).forEach((key) => {
      if (queryParams.hasOwnProperty(key)) {
        result[key] = queryParams[key];
      } else if (
        key !== 'loginid' &&
        key !== 'limit' &&
        key !== 'limitrows' &&
        key != 'isLeadsVisitsCalls' &&
        key != 'isDateFilter' &&
        key != 'activeExec' &&
        key != 'propid' &&
        key != 'propertyName' &&
        key != 'scheduledTodayOrOverdues' &&
        key != 'fromDate' &&
        key != 'toDate' &&
        key != 'scheduledTodayOrOverdues' &&
        key != 'visitedtodate' &&
        key != 'visitedfromdate' &&
        key != 'teamlead'
      ) {
        result[key] = '';
      }
    });

    this.filteredParams1 = result;
    this.filteredParams1.executid =
      this.localStorage.getItem('Role') == '1' ||
      this.localStorage.getItem('RoleType') == '1'
        ? this.filteredParams1.executid
        : this.localStorage.getItem('UserId');

    if (this.filteredParams1.isLeadsVisitsCalls == 'visits') {
      this.filteredParams1.fromDate = '';
      this.filteredParams1.toDate = '';
    } else if (this.filteredParams1.isLeadsVisitsCalls == 'leads') {
      this.filteredParams1.visitedfromdate = '';
      this.filteredParams1.visitedtodate = '';
    }

    this.selectedTeam = this.teamNames.find(
      (x) => x.value === this.filteredParams1.roleId
    );
  }

  onBackButton() {
    // this.resetInfiniteScroll();
    this.content?.scrollToTop(400);
    this.filteredParams1.executid = '';
    this.filteredParams1.execName = '';
    this.selectedExecu = null;
    this.addQueryParams();
  }

  /**
   * Toggles the display of executive names in the Executive's Quick View Section.
   * When the toggle button is checked, only active executives are displayed.
   * When the toggle button is unchecked, all executives are displayed.
   */
  toggleActiveExecutive(event) {
    this.isActiveExecLoader = true;
    if (event.detail.checked) {
      this.filteredParams1.activeExec = '1';
      this.getExecutiveQuickView('1');
    } else {
      this.filteredParams1.activeExec = '';
      this.getExecutiveQuickView('');
    }
  }

  ionViewDidLeave() {
    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
  }

  onFilterSelection(type, value) {
    this.resetInfiniteScroll();
    const today = new Date();
    const format = (d) => d.toISOString().split('T')[0];
    const setDates = (from, to) => {
      if (this.filteredParams1.isLeadsVisitsCalls == 'visits') {
        this.filteredParams1.visitedfromdate = from;
        this.filteredParams1.visitedtodate = to;
      } else {
        this.filteredParams1.fromDate = from;
        this.filteredParams1.toDate = to;
      }
    };

    switch (type) {
      case 'property':
        this.filteredParams1.executid = '';
        Object.assign(this.filteredParams1, {
          propid: value.property_idfk,
          propertyName: value.property_info_name,
        });
        break;
      case 'leadsVisitsCalls':
        this.filteredParams1.isLeadsVisitsCalls = value;

        this.filteredParams1.executid == '' && this.roleid == '1'
          ? (this.scheduledTodayOrOverduesData = [])
          : '';

        // if (!this.isAdmin) {
        //   this.filteredParams1.propid = '';
        // } else {
        //   this.filteredParams1.propid = this.propertyLists[0].property_idfk;
        // }

        if (this.filteredParams1.isDateFilter == 'lastsevenDay') {
          // this.filteredParams1.isDateFilter = 'alltime';
          // setDates('', '');
          // this.filteredParams1.visitedfromdate = '';
          // this.filteredParams1.visitedtodate = '';
          // this.filteredParams1.fromDate = '';
          // this.filteredParams1.toDate = '';
        } else if (value == 'calls' && this.filteredParams1.visitedfromdate) {
          this.filteredParams1.fromDate = this.filteredParams1.visitedfromdate
            ? this.filteredParams1.visitedfromdate
            : this.filteredParams1.fromDate;
          this.filteredParams1.toDate = this.filteredParams1.visitedtodate
            ? this.filteredParams1.visitedtodate
            : this.filteredParams1.toDate;

          this.filteredParams1.visitedfromdate = '';
          this.filteredParams1.visitedtodate = '';
          this.filteredParams1.roleId = '';
        }

        if (
          this.filteredParams1.isLeadsVisitsCalls == 'calls' &&
          this.localStorage.getItem('RoleType') == '1' &&
          this.filteredParams1.executid == ''
        ) {
          this.filteredParams1.executid = localStorage.getItem('UserId');
        }
        this.filteredParams1.callstage = value == 'calls' ? 'overall' : '';
        break;
      case 'exec':
        Object.assign(this.filteredParams1, {
          executid: value.id,
          execName: value.name == 'All' ? '' : value.name,
        });

        if (this.filteredParams1.isLeadsVisitsCalls == 'calls') {
          this.filteredParams1.propid = this.selectedExecu?.propid?.split(
            ','
          )[0]
            ? this.selectedExecu?.propid?.split(',')[0]
            : value.propid.split(',')[0];
          const propertyName = this.propertyLists?.filter((item) => {
            return item.property_idfk == this.filteredParams1?.propid;
          });
          this.filteredParams1.propertyName =
            propertyName?.[0]?.['property_info_name'];
        }
        break;
      case 'team':
        Object.assign(this.filteredParams1, {
          roleId: value.value,
        });
        this.filteredParams1.execName = '';
        this.filteredParams1.executid = '';
        break;
      case 'scheduledTodayOrOverdues':
        this.filteredParams1.scheduledTodayOrOverdues = value;
        break;
      case 'dateFilter':
        value != 'customfromDate' && value != 'customtoDate'
          ? ((this.filteredParams1.isDateFilter = value),
            !this.dateRange.fromdate && !this.dateRange.todate)
          : '';

        if (
          value == 'today' ||
          value == 'yesterday' ||
          value == 'lastsevenDay'
        ) {
          this.dateRange = {
            fromdate: null as Date | null,
            todate: null as Date | null,
          };
        }
        if (value === 'alltime') setDates('', '');
        else if (value === 'today') setDates(format(today), format(today));
        else if (value === 'yesterday') {
          const y = new Date(today);
          y.setDate(today.getDate() - 1);
          setDates(format(y), format(y));
        } else if (value == 'lastsevenDay') {
          const today = new Date();
          today.setDate(today.getDate() - 6);
          this.filteredParams1.fromDate = today.toISOString().split('T')[0];
          this.filteredParams1.toDate = new Date().toISOString().split('T')[0];
          // setDates(
          //   today.toISOString().split('T')[0],
          //   new Date().toISOString().split('T')[0]
          // );
        } else if (value === 'custom') {
          this.dashboard_custDate_modal.present();
          return;
        } else if (value == 'customfromDate') {
          if (this.dateRange.fromdate > this.dateRange.todate) {
            this.filteredParams1.toDate = '';
            this.dateRange.todate = null;
          } else {
            this.filteredParams1.fromDate = (
              '' + this.dateRange.fromdate
            ).split('T')[0];
            this.filteredParams1.toDate = ('' + this.dateRange.todate).split(
              'T'
            )[0];
            console.log(this.filteredParams1);
          }

          const p = this.filteredParams1;
          if (p.isLeadsVisitsCalls === 'visits') {
            p.visitedfromdate = p.fromDate || p.visitedfromdate;
            p.visitedtodate = p.toDate || p.visitedtodate;
            p.fromDate = p.toDate = '';
          } else if (p.isLeadsVisitsCalls === 'leads') {
            p.fromDate = p.visitedfromdate || p.fromDate;
            p.toDate = p.visitedtodate || p.toDate;
            p.visitedfromdate = p.visitedtodate = '';
          }

          this.showFromDateError = false;
          this.dashboard_fromDate_modal?.dismiss();
          return;
        } else if (value == 'customtoDate') {
          this.filteredParams1.toDate = ('' + this.dateRange.todate).split(
            'T'
          )[0];
          const p = this.filteredParams1;
          if (p.isLeadsVisitsCalls === 'visits') {
            p.visitedfromdate = p.fromDate || p.visitedfromdate;
            p.visitedtodate = p.toDate || p.visitedtodate;
            p.fromDate = p.toDate = '';
          } else if (p.isLeadsVisitsCalls === 'leads') {
            p.fromDate = p.visitedfromdate || p.fromDate;
            p.toDate = p.visitedtodate || p.toDate;
            p.visitedfromdate = p.visitedtodate = '';
          }
          this.dashboard_toDate_modal?.dismiss();
          return;
        }
        break;
      case 'callstage':
        this.allCallsData = [];
        this.filteredParams1.callstage = value;
        break;
    }

    const p = this.filteredParams1;
    if (p.isLeadsVisitsCalls === 'visits') {
      p.visitedfromdate = p.fromDate || p.visitedfromdate;
      p.visitedtodate = p.toDate || p.visitedtodate;
      p.fromDate = p.toDate = '';
    } else if (p.isLeadsVisitsCalls === 'leads') {
      p.fromDate = p.visitedfromdate || p.fromDate;
      p.toDate = p.visitedtodate || p.toDate;
      p.visitedfromdate = p.visitedtodate = '';
    }
    this.showSpinner = true;
    this.addQueryParams();
  }

  navigateToLeadListPage(value) {
    this.filteredParams1.status = value != 'NC' ? value : '';
    this.filteredParams1.stage = value == 'NC' ? value : '';
    let queryParams = {};
    for (const key in this.filteredParams1) {
      if (
        this.filteredParams1.hasOwnProperty(key) &&
        this.filteredParams1[key] !== ''
      ) {
        queryParams[key] = this.filteredParams1[key];
      } else {
        queryParams[key] = null;
      }
    }

    queryParams = {
      ...queryParams,
      visits: value == 'touched' || value == 'active' ? '2' : '',
      followup: value == 'inactive' ? '2' : '',
      visittype: value == 'NC' ? '3' : '',
      type:
        value == 'inactive'
          ? 'Inactive'
          : value == 'generalfollowups'
          ? 'General Followup'
          : '',
    };

    this.router.navigate(['/mandate-lead-stages'], {
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  navigateToVisitsListPage(value) {
    this.filteredParams1.status = value == 'USV1' ? 'USV' : value;

    let queryParams = {};
    for (const key in this.filteredParams1) {
      if (
        this.filteredParams1.hasOwnProperty(key) &&
        this.filteredParams1[key] !== ''
      ) {
        queryParams[key] = this.filteredParams1[key];
      } else {
        queryParams[key] = null;
      }
    }
    value == 'USV1';
    queryParams = {
      ...queryParams,
      stagestatus:
        value == 'Deal Closing Requested' ? '' : value == 'USV1' ? '1' : '3',
      visittype:
        value == 'allvisits' ||
        value == 'activevisits' ||
        value == 'Deal Closing Requested' ||
        value == 'Closing Request Rejected' ||
        value == 'Deal Closed'
          ? null
          : '3',
      type:
        value == 'USV' || value == 'RSV' || value == 'Final Negotiation'
          ? value
          : value == 'USV1'
          ? 'USV'
          : null,
      stage:
        value == 'USV' ||
        value == 'RSV' ||
        value == 'Final Negotiation' ||
        value == 'Deal Closing Requested' ||
        value == 'Closing Request Rejected' ||
        value == 'Deal Closed'
          ? value
          : value == 'USV1'
          ? 'USV'
          : null,
      status:
        value == 'USV' ||
        value == 'RSV' ||
        value == 'Final Negotiation' ||
        value == 'Deal Closing Requested' ||
        value == 'Closing Request Rejected' ||
        value == 'Deal Closed' ||
        value == 'USV1'
          ? null
          : value,
      fromDate:
        this.filteredParams1.status == 'overdues' &&
        this.filteredParams1.visitedfromdate
          ? this.filteredParams1.visitedfromdate
          : this.filteredParams1.fromDate,
      toDate:
        this.filteredParams1.status == 'overdues' &&
        this.filteredParams1.visitedtodate
          ? this.filteredParams1.visitedtodate
          : this.filteredParams1.toDate,
      visitedfromdate:
        this.filteredParams1.status != 'overdues'
          ? this.filteredParams1.visitedfromdate
            ? this.filteredParams1.visitedfromdate
            : ''
          : '',
      visitedtodate:
        this.filteredParams1.status != 'overdues'
          ? this.filteredParams1.visitedtodate
            ? this.filteredParams1.visitedtodate
            : ''
          : '',
    };

    this.router.navigate(['/mandate-visit-stages'], {
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  navigateToOverduesListPage(value) {
    this.filteredParams1.stage = value == 'USVFix' ? 'USV' : value;

    let queryParams = {};
    for (const key in this.filteredParams1) {
      if (
        this.filteredParams1.hasOwnProperty(key) &&
        this.filteredParams1[key] !== ''
      ) {
        queryParams[key] = this.filteredParams1[key];
      } else {
        queryParams[key] = null;
      }
    }

    queryParams = {
      ...queryParams,
      stagestatus:
        value != 'Fresh' && value != 'NC' && value != 'USVFix'
          ? '3'
          : value == 'USVFix'
          ? '1'
          : null,
      status: 'overdues',
    };

    this.router.navigate(['/mandate-myoverdues'], {
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  navigateToCallListingPage(value) {
    this.router.navigate(['all-call-listing'], {
      queryParams: {
        callstage: value,
      },
      queryParamsHandling: 'merge',
    });
  }
  navigateToOverdueListingPage() {
    let queryParams = {};
    for (const key in this.filteredParams1) {
      if (
        this.filteredParams1.hasOwnProperty(key) &&
        this.filteredParams1[key] !== ''
      ) {
        queryParams[key] = this.filteredParams1[key];
      } else {
        queryParams[key] = null;
      }
    }

    queryParams = { selectedOption: 'overdue', stage: 'Fresh' };
    this.router.navigate(['/mandate-myoverdues'], {
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  refresh(event) {
    // this.filteredParams1 = {
    //   fromDate: '',
    //   toDate: '',
    //   visitedfromdate: '',
    //   visitedtodate: '',
    //   isLeadsVisitsCalls: this.filteredParams1.isLeadsVisitsCalls,
    //   isDateFilter: 'alltime',
    //   activeExec: '1',
    //   executid: '',
    //   execName: '',
    //   propid: '1830',
    //   status: '',
    //   visits: '',
    //   stage: '',
    //   stagestatus: '',
    //   scheduledTodayOrOverdues: 'scheduledtoday',
    //   propertyName: 'GR Samskruthi',
    //   callstage: 'overall',
    //   team: '',
    //   followup: '',
    //   loginid: localStorage.getItem('UserId'),
    //   limit: 0,
    //   limitrows: 30,
    // };

    this.filteredParams1 = {
      fromDate: new Date().toLocaleDateString('en-CA'),
      toDate: new Date().toLocaleDateString('en-CA'),
      visitedfromdate: new Date().toLocaleDateString('en-CA'),
      visitedtodate: new Date().toLocaleDateString('en-CA'),
      isLeadsVisitsCalls: this.filteredParams1.isLeadsVisitsCalls,
      scheduledTodayOrOverdues: 'scheduledtoday',
      isDateFilter: 'today',
      activeExec: '1',
      executid:
        localStorage.getItem('UserId') == '1' ||
        localStorage.getItem('RoleType') == '1'
          ? ''
          : this.filteredParams1.executid,
      execName: this.filteredParams1.execName,
      propid: '',
      propertyName: '',
      team: '',
      status: '',
      stage: '',
      stagestatus: '',
      visits: '',
      followup: '',
      loginid: localStorage.getItem('UserId'),
      callstage: 'overall',
      roleId: '',
      htype: this.filteredParams1.htype,
      teamlead:
        localStorage.getItem('RoleType') == '1'
          ? localStorage.getItem('UserId')
          : '',
      leadvisit: '',
      limit: 0,
      limitrows: 5,
    };
    this.dateRange = {
      fromdate: null as Date | null,
      todate: null as Date | null,
    };
    // event.target.complete();
    this.addQueryParams();
  }

  refreshPage(event) {
    event.target.complete();
    this.ionViewWillEnter();
  }
  // Getting counts of all assigned leads
  getAssignedLeadsCount() {
    const requests = [];

    this.changeDetectorRef.detectChanges();

    if (this.filteredParams1.isLeadsVisitsCalls == 'leads') {
      this.showSpinner = true;
      const status = [
        'assignedleads',
        'pending',
        'touched',
        'inactive',
        'active',
        'generalfollowups',
        'junkleads',
      ];
      status.forEach((status) => {
        const params = {
          ...this.filteredParams1,
          status: status,
          visits:
            status == 'pending' ||
            status == 'generalfollowups' ||
            status == 'junkleads'
              ? ''
              : '2',
          // stage: '',
          // stagestatus: '',
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

      const stages = ['NC', 'USV'];
      stages.forEach((stage) => {
        const params = {
          ...this.filteredParams1,
          stage: stage,
          stagestatus: stage == 'USV' ? '1' : '',
          // status: '',
          // stagestatus: '',
          // visits: '',
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

      const overduestages = ['Fresh', 'NC', 'USV'];
      overduestages.forEach((overduestages) => {
        const params = {
          ...this.filteredParams1,
          status: 'overdues',
          stage: overduestages,
          stagestatus:
            overduestages == 'USV' &&
            this.filteredParams1.isLeadsVisitsCalls == 'visits'
              ? '3'
              : overduestages == 'USV'
              ? '1'
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

      forkJoin(requests).subscribe((results) => {
        // Process results
        results.forEach((assgnleads, index) => {
          switch (index) {
            case 0:
              this.leads_count.assigned =
                assgnleads['AssignedLeads'][0]['counts'];
              break;
            case 1:
              this.leads_count.untouched =
                assgnleads['AssignedLeads'][0]['counts'];
              break;
            case 2:
              this.leads_count.touched =
                assgnleads['AssignedLeads'][0]['counts'];
              break;
            case 3:
              this.leads_count.inactive =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 4:
              this.leads_count.active =
                assgnleads['AssignedLeads'][0]['counts'];
              break;
            case 5:
              this.leads_count.generalFollowups =
                assgnleads['AssignedLeads'][0]['counts'];
              break;
            case 6:
              this.leads_count.junkLeads =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 7:
              this.leads_count.nc = assgnleads['AssignedLeads'][0]['counts'];
              break;
            case 8:
              this.leads_count.usvfix =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 9:
              this.overdues_count.gf =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 10:
              this.overdues_count.nc =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 11:
              this.overdues_count.usv =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            default:
              break;
          }
        });
        this.getSegmentsData();
      });

      // (!this.isAdmin || (this.isAdmin && this.filteredParams1.executid))
      // if (this.roleid != '1' || this.roleid == '1') {
      //   //scheduledtoday and overdues total couts
      //   const scheduledtoday_overdues = [];
      //   const status = ['scheduledtoday', 'overdues'];
      //   status.forEach((status) => {
      //     const params = {
      //       ...this.filteredParams1,
      //       status: status,
      //       fromDate:
      //         status == 'scheduledtoday'
      //           ? new Date().toLocaleDateString('en-CA')
      //           : this.filteredParams1.fromDate
      //           ? this.filteredParams1.fromDate
      //           : this.filteredParams1.visitedfromdate,
      //       toDate:
      //         status == 'scheduledtoday'
      //           ? new Date().toLocaleDateString('en-CA')
      //           : this.filteredParams1.toDate
      //           ? this.filteredParams1.toDate
      //           : this.filteredParams1.visitedtodate,
      //       stage: status == 'overdues' ? '8' : this.filteredParams1.stage,
      //       followup:
      //         status == 'overdues' ? '8' : this.filteredParams1.followup,
      //     };
      //     scheduledtoday_overdues.push(
      //       this.mandateService.getAssignedLeadsCounts(params).pipe(
      //         catchError((error) => {
      //           console.error(
      //             `Error fetching data for status: ${status}`,
      //             error
      //           );
      //           return of(null);
      //         })
      //       )
      //     );
      //   });

      //   forkJoin(scheduledtoday_overdues).subscribe((results) => {
      //     // Process results
      //     results.forEach((assgnleads, index) => {
      //       switch (index) {
      //         case 0:
      //           this.totalScheduledtoday_overdueCount.scheduledToday =
      //             assgnleads['AssignedLeads'][0]['Uniquee_counts'];
      //           break;
      //         case 1:
      //           this.totalScheduledtoday_overdueCount.overdue =
      //             assgnleads['AssignedLeads'][0]['Uniquee_counts'];
      //           break;
      //       }
      //     });
      //   });

      //   // GET USV, RSV AND FN COUTS FOR TODAY SCHEDULED
      //   if (this.filteredParams1.scheduledTodayOrOverdues == 'scheduledtoday') {
      //     this.getScheduledTodayCounts();
      //   }

      //   if (
      //     this.roleid != '1' ||
      //     (this.roleid == '1' && this.filteredParams1.executid)
      //   ) {
      //     this.getScheduledToday_Overdues_data(false);
      //   }
      // }

      // if (this.roleid == '1') {
      //   this.getExecutiveQuickView(this.filteredParams1.activeExec);
      // }
    }
    // VISITS SECTION API CALLING
    else if (this.filteredParams1.isLeadsVisitsCalls == 'visits') {
      this.showSpinner = true;
      const stage = [
        'USV',
        'RSV',
        'Final Negotiation',
        'Deal Closing Requested',
        'Closing Request Rejected',
        'Deal Closed',
      ];
      stage.forEach((stage) => {
        const params = {
          ...this.filteredParams1,
          stage: stage,
          stagestatus: '3',
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

      const status = ['allvisits', 'activevisits', 'junkvisits'];
      status.forEach((status) => {
        const params = {
          ...this.filteredParams1,
          status: status,
          stagestatus:
            status == 'activevisits' ||
            (this.filteredParams1.visitedfromdate &&
              this.filteredParams1.visitedtodate)
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

      // const overduestage = ['Deal Closing Requested', 'Deal Closing Pending'];
      // overduestage.forEach((stage) => {
      //   const params = {
      //     ...this.filteredParams1,
      //     stage: stage,
      //     status: 'overdues',
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

      const overduestages = [
        'USV',
        'RSV',
        'Final Negotiation',
        'Deal Closing Requested',
        'Deal Closing Pending',
      ];
      overduestages.forEach((overduestages) => {
        const params = {
          ...this.filteredParams1,
          fromDate: this.filteredParams1.visitedfromdate,
          toDate: this.filteredParams1.visitedtodate,
          visitedfromdate: '',
          visitedtodate: '',
          status: 'overdues',
          stage: overduestages,
          stagestatus:
            overduestages == 'USV' ||
            overduestages == 'RSV' ||
            overduestages == 'Final Negotiation'
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

      forkJoin(requests).subscribe((results) => {
        results.forEach((assgnleads, index) => {
          switch (index) {
            case 0:
              this.visits_count.usv =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 1:
              this.visits_count.rsv =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 2:
              this.visits_count.fn =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 3:
              this.visits_count.bookingRequest =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 4:
              this.visits_count.rejected =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 5:
              this.visits_count.closed =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 6:
              this.visits_count.allVisits =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 7:
              this.visits_count.activeVisits =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 8:
              this.visits_count.junk =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 9:
              this.overdues_count.usv =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 10:
              this.overdues_count.rsv =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 11:
              this.overdues_count.fn =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 12:
              this.overdues_count.overdueDCR =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 13:
              this.overdues_count.overdueDCP =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            // case 9:
            //   this.visits_count.overdueDCR =
            //     assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            //   break;
            // case 10:
            //   this.visits_count.overdueDCP =
            //     assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            //   break;
            default:
              break;
          }
        });

        this.showSpinner = false;
        this.getScheduledVisitsdata(false);
      });
    }

    if (this.filteredParams1.isLeadsVisitsCalls != 'calls') {
      this.getWeekPlansData(false);
    }

    //
    if (this.filteredParams1.isLeadsVisitsCalls == 'calls') {
      this.showSpinner = true;
      this.filteredParams1.callstage == 'live'
        ? this.getLiveCall()
        : this.getallCallsData(false);
      this.getCallCounts();
    }
  }
  getWeekPlansData(isLoadmore) {
    this.filteredParams1.leadvisit = '1';
    this.filteredParams1.fromDate = this.filteredParams1.visitedfromdate
      ? this.filteredParams1.visitedfromdate
      : this.filteredParams1.fromDate;
    this.filteredParams1.toDate = this.filteredParams1.visitedtodate
      ? this.filteredParams1.visitedtodate
      : this.filteredParams1.toDate;
    this.count = isLoadmore ? (this.count += 5) : 0;
    this.filteredParams1.limit = this.count;
    return new Promise((resolve, reject) => {
      this.mandateService.planLeads(this.filteredParams1).subscribe({
        next: (response: any) => {
          this.showSpinner = false;
          if (response['status'] == 'True') {
            this.usvPlans = isLoadmore
              ? this.usvPlans.concat(response['result'])
              : response['result'];
            resolve(true);
          } else {
            this.showSpinner = false;
            isLoadmore ? '' : (this.usvPlans = []);
            resolve(false);
          }
        },
        error: (err) => {
          this.showSpinner = false;
          this.usvPlans = [];
          resolve(false);
        },
      });
    });
    // this.mandateService.planLeads(this.filteredParams1).subscribe((resp) => {
    //   this.usvPlans = resp['result'];
    // });
  }

  getSegmentsData() {
    setTimeout(() => {
      this.weekData = [
        {
          label: 'Assigned',
          value: parseInt(this.leads_count.assigned),
          total: parseInt(this.leads_count.assigned),
          color: 'blue',
          type: 'solid',
          bgColor: '#F1F9FF',
          labelColor: ' #005B8B',
        },
        {
          label: 'Active',
          value: parseInt(this.leads_count.active),
          total: parseInt(this.leads_count.assigned),
          color: 'green',
          type: 'segment',
          bgColor: '#F3FEE5',
          labelColor: '#386700',
        },
        {
          label: 'Inactive',
          value: parseInt(this.leads_count.inactive),
          total: parseInt(this.leads_count.assigned),
          color: 'orange',
          type: 'segment',
          bgColor: '#FFEFE8',
          labelColor: '#C53B01',
        },
        {
          label: 'Junk',
          value: parseInt(this.leads_count.junkLeads),
          total: parseInt(this.leads_count.assigned),
          color: 'red',
          type: 'segment',
          bgColor: '#FFF3F3',
          labelColor: '#B50E0E',
        },
      ];

      this.weekDataCal = this.weekData.map((d) => ({
        ...d,
        activeSegments:
          d.type === 'segment'
            ? this.calculateSegments(d.value, d.total)
            : null,
      }));
    }, 100);
  }

  calculateSegments(value: number, total: number): number {
    if (total === 0) return 0;

    const ratio = value / total;
    const segments = Math.round(ratio * this.segments);

    // ensure it never exceeds limits
    return Math.min(this.segments, Math.max(0, segments));
  }

  getScheduledTodayCounts() {
    const requests = [];
    const stage = ['USV', 'RSV', 'Final Negotiation'];
    stage.forEach((stage) => {
      const params = {
        ...this.filteredParams1,
        stage: stage,
        fromDate: new Date().toLocaleDateString('en-CA'),
        toDate: new Date().toLocaleDateString('en-CA'),
        status: 'scheduledtoday',
      };
      requests.push(
        this.mandateService.getAssignedLeadsCounts(params).pipe(
          catchError((error) => {
            return of(null);
          })
        )
      );
    });

    forkJoin(requests).subscribe((results) => {
      // Process results
      results.forEach((assgnleads, index) => {
        switch (index) {
          case 0:
            this.scheduledtoday_count.usv =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 1:
            this.scheduledtoday_count.rsv =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 2:
            this.scheduledtoday_count.fn =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          default:
            break;
        }
      });
    });
  }
  count = 0;
  getScheduledToday_Overdues_data(isLoadmore) {
    this.filteredParams1.scheduledTodayOrOverdues == 'scheduledtoday';
    const params = {
      ...this.filteredParams1,
      status: this.filteredParams1.scheduledTodayOrOverdues,
      visitedfromdate: '',
      visitedtodate: '',
      fromDate:
        this.filteredParams1.scheduledTodayOrOverdues == 'scheduledtoday'
          ? new Date().toLocaleDateString('en-CA')
          : this.filteredParams1.fromDate,
      toDate:
        this.filteredParams1.scheduledTodayOrOverdues == 'scheduledtoday'
          ? new Date().toLocaleDateString('en-CA')
          : this.filteredParams1.toDate,
      stage:
        this.filteredParams1.scheduledTodayOrOverdues == 'overdues'
          ? '8'
          : this.filteredParams1.stage,
      followup:
        this.filteredParams1.scheduledTodayOrOverdues == 'overdues'
          ? '8'
          : this.filteredParams1.followup,
      limit: 0,
      limitrows: 5,
    };

    this.count = isLoadmore ? (this.count += 5) : 0;
    params.limit = this.count;

    return new Promise((resolve, reject) => {
      this.mandateService
        .getAssignedLeadsRecord(params)
        .subscribe((response) => {
          if (response['status'] == 'True') {
            this.scheduledTodayOrOverduesData = isLoadmore
              ? this.scheduledTodayOrOverduesData.concat(
                  response['AssignedLeads']
                )
              : response['AssignedLeads'];

            resolve(true);
          } else {
            // this.scheduledTodayOrOverduesData = [];
            resolve(false);
          }
        });
    });
  }
  scheduledVisitedData = [];
  getScheduledVisitsdata(isLoadmore) {
    const params = {
      ...this.filteredParams1,
      fromDate: new Date().toLocaleDateString('en-CA'),
      toDate: new Date().toLocaleDateString('en-CA'),
      visitedfromdate: '',
      visitedtodate: '',
      status: 'scheduledtoday',
    };

    this.count = isLoadmore ? (this.count += 5) : 0;
    params.limit = this.count;

    return new Promise((resolve, reject) => {
      this.mandateService
        .getAssignedLeadsRecord(params)
        .subscribe((response) => {
          if (response['status'] == 'True') {
            this.scheduledVisitedData = isLoadmore
              ? this.scheduledVisitedData.concat(response['AssignedLeads'])
              : response['AssignedLeads'];

            console.log(this.scheduledVisitedData);
            resolve(true);
          } else {
            isLoadmore ? '' : (this.scheduledVisitedData = []);
            resolve(false);
          }
        });
    });
  }

  canScroll;
  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.content.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;

      this.canScroll = scrollHeight > clientHeight + 10; // ADD A BUFFER of 10px

      if (!this.canScroll) {
        this.sharedService.isBottom = false;
      } else {
        this.sharedService.isBottom =
          scrollTop + clientHeight >= scrollHeight - 10;
      }
    });
  }

  loadData(event) {
    if (
      this.filteredParams1.isLeadsVisitsCalls == 'calls' &&
      this.filteredParams1.callstage == 'live'
    ) {
      event.target.disabled = true;
    } else if (
      this.filteredParams1.isLeadsVisitsCalls == 'calls' &&
      this.filteredParams1.callstage != 'live'
    ) {
      this.getallCallsData(true).then((hasData) => {
        event.target.complete();
        if (!hasData) {
          event.target.disabled = true;
        }
      });
    } else if (
      this.roleid != '1' ||
      (this.roleid == '1' && this.filteredParams1.executid)
    ) {
      this.getScheduledToday_Overdues_data(true).then((hasData) => {
        event.target.complete();
        if (!hasData) {
          event.target.disabled = true;
        }
      });
    }
    // this.getallCallsData(true).then((hasData) => {
    //   event.target.complete();
    //   // if API returned false → disable infinite scroll
    //   if (!hasData) {
    //     event.target.disabled = true;
    //   }
    // });
  }

  loadTableData(event) {
    this.getWeekPlansData(true).then((hasData) => {
      event.target.complete();
      if (!hasData) {
        event.target.disabled = true;
      }
    });
  }

  loadScheduledVisitsData(event) {
    this.getScheduledVisitsdata(true).then((hasData) => {
      event.target.complete();
      if (!hasData) {
        event.target.disabled = true;
      }
    });
  }
  // to get overdues counts in days
  getOverdueDaysCount(sentDate) {
    var date1: any = new Date(sentDate);
    var date2: any = new Date();
    var diffDays: any = Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getallCallsData(isLoadmore) {
    const params = {
      loginid: localStorage.getItem('UserId'),
      fromcalldatetime:
        this.filteredParams1.fromDate == ''
          ? new Date().toLocaleDateString('en-CA')
          : this.filteredParams1.fromDate,
      tocalldatetime:
        this.filteredParams1.toDate == ''
          ? new Date().toLocaleDateString('en-CA')
          : this.filteredParams1.toDate,
      execid:
        this.roleid == '1' || this.localStorage.getItem('RoleType') == '1'
          ? this.filteredParams1.executid
          : '',
      callstage: this.filteredParams1.callstage,
      limit: 0,
      limitrows: 5,
    };

    this.count = isLoadmore ? (this.count += 5) : 0;
    params.limit = this.count;

    return new Promise((resolve, reject) => {
      this.sharedService.fetchAllCallLogs(params).subscribe({
        next: (response: any) => {
          if (response['status'] == 'success') {
            this.allCallsData = isLoadmore
              ? this.allCallsData.concat(response['success'])
              : response['success'];
            resolve(true);
          } else {
            this.allCallsData = [];
            resolve(false);
          }
        },
        error: (err) => {
          resolve(false);
        },
      });
    });
  }
  allCallCounts = [];
  getCallCounts() {
    const params = {
      loginid: localStorage.getItem('UserId'),
      fromcalldatetime:
        this.filteredParams1.fromDate == ''
          ? new Date().toLocaleDateString('en-CA')
          : this.filteredParams1.fromDate,
      tocalldatetime:
        this.filteredParams1.toDate == ''
          ? new Date().toLocaleDateString('en-CA')
          : this.filteredParams1.toDate,
      execid:
        localStorage.getItem('Role') == '1'
          ? this.filteredParams1.executid
          : localStorage.getItem('UserId'),
    };
    this.sharedService.getCallCounts(params).subscribe((resp) => {
      this.allCallCounts = resp['success'][0];

      this.showSpinner = false;
    });
  }

  removeDateFilter() {
    this.dateRange = {
      fromdate: null as Date | null,
      todate: null as Date | null,
    };
    this.filteredParams1.isDateFilter = 'today';
    this.filteredParams1.fromDate = new Date().toLocaleDateString('en-CA');
    this.filteredParams1.toDate = new Date().toLocaleDateString('en-CA');
    this.filteredParams1.visitedfromdate = new Date().toLocaleDateString(
      'en-CA'
    );
    this.filteredParams1.visitedtodate = new Date().toLocaleDateString('en-CA');
    this.addQueryParams();
  }

  getLiveCall() {
    this.sharedService
      .fetchLiveCall(
        localStorage.getItem('UserId') == '1'
          ? this.filteredParams1.executid
          : localStorage.getItem('UserId')
      )
      .subscribe({
        next: (response) => {
          if (response['status'] == 'success') {
            this.allCallsData = response['success'];

            if (this.filteredParams1.callstage == 'live') {
              this.allCallsData = response['success'].map((item: any) => {
                return {
                  ...item,
                  timer: '00:00:00 Hrs',
                  intervalId: null,
                };
              });
              this.allCallsData.forEach((log) => {
                this.startTimer(log);
              });
            }
          } else {
            this.allCallsData = [];
          }
          this.showSpinner = false;
        },
        error: (resp) => {
          this.allCallsData = [];
          this.showSpinner = false;
        },
      });
  }

  stopTimer() {
    if (this.intervalId) {
      this.timer = '00:00:00 Hrs';
      clearInterval(this.intervalId);
    }
  }

  timer: string = '00:00:00 Hrs';
  private intervalId: any;
  startTimer(lead) {
    this.stopTimer();
    if (lead.starttime) {
      const startDate = new Date(lead.starttime.replace(' ', 'T'));

      lead.intervalId = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - startDate.getTime()) / 1000);
        lead.timer = this.formatTime(diff);
      }, 1000);
    }
  }
  formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs}h:${mins}m:${secs}s`;
  }

  showInfiniteScroll = true;
  //TO RESET THE INFINITE SRCOLL
  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }
  lead;
  @ViewChild('sliding') sliding;
  @ViewChild('callConfirmationModal') callConfirmationModal;
  @ViewChild('onCallDetailsPage') onCallDetailsPage;
  isOnCallDetailsPage;
  onSwipe(event, lead: any) {
    if (event.detail.side == 'start') {
      window.open(`https://wa.me/+91 ${lead.number}`, '_system');
      // this.navigateToWhatsApp(lead.number);
    } else {
      this.outboundCall(lead);
    }
    this.sliding.close();
  }
  outboundCall(lead) {
    this.sliding.close();
    this.showSpinner = true;
    if (lead == true) {
      this.isOnCallDetailsPage = true;
      this.callConfirmationModal.dismiss();

      const cleanedNumber =
        this.lead?.callto.startsWith('91') && this.lead?.callto.length > 10
          ? this.lead?.callto.slice(2)
          : this.lead?.callto;

      const param = {
        execid: this.localStorage.getItem('UserId'),
        callto: cleanedNumber,
        leadid: this.lead.leadid,
        starttime: this.getCurrentDateTime(),
        modeofcall: 'mobile-' + this.filteredParams1.htype,
        leadtype: this.filteredParams1.htype,
        assignee: this.lead.Exec_IDFK,
      };

      this.callConfirmationModal.dismiss();
      this.sharedService.outboundCall(param).subscribe((resp) => {
        if (resp['status'] == 'success') {
          this.showSpinner = false;
        } else {
          this.showSpinner = false;
        }
        //  this.callConfirmationModal.dismiss();
      });

      this.router.navigate([], {
        queryParams: {
          isOnCallDetailsPage: this.isOnCallDetailsPage,
          leadId: this.lead.leadid,
          execid: this.lead.Exec_IDFK,
          leadTabData: 'status',
          callStatus: 'Call Connected',
          direction: 'outboundCall',
          headerType: this.filteredParams1.htype,
        },
        queryParamsHandling: 'merge',
      });
    } else {
      this.lead = lead;
      this.showSpinner = false;
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

  isMoreThan10Sec(timeString: string | null | undefined): boolean {
    if (!timeString || !timeString.includes(':')) return false;

    const [hh, mm, ss] = timeString.split(':').map(Number);
    const totalSeconds = hh * 3600 + mm * 60 + ss;

    return totalSeconds > 10;
  }

  // To open from date modal
  async openFromDate() {
    await this.dashboard_toDate_modal?.dismiss();
    await this.dashboard_fromDate_modal.present();
  }

  // To open to date modal
  async openToDate() {
    await this.dashboard_fromDate_modal?.dismiss();
    await this.dashboard_toDate_modal.present();
  }
  onmodaldismiss() {
    this.dashboard_fromDate_modal?.dismiss();
    this.dashboard_toDate_modal?.dismiss();
  }
  showFromDateError = false;
  handleToDateClick() {
    if (!this.dateRange.fromdate) {
      this.showFromDateError = true;
      return;
    }

    this.showFromDateError = false;
    this.openToDate();
  }

  onCustomDateModalDismiss(event) {
    if (
      !(this.dateRange.fromdate && this.dateRange.todate) ||
      (this.dateRange.fromdate && !this.dateRange.todate)
    ) {
      this.dateRange = {
        fromdate: null as Date | null,
        todate: null as Date | null,
      };
      this.filteredParams1.isDateFilter = 'today';
      this.filteredParams1.fromDate = new Date().toLocaleDateString('en-CA');
      this.filteredParams1.toDate = new Date().toLocaleDateString('en-CA');
      this.addQueryParams();
    }
  }

  @ViewChild('headerScroll', { static: false })
  headerScroll!: ElementRef<HTMLDivElement>;

  syncHeader(event: Event) {
    const target = event.target as HTMLElement;
    if (this.headerScroll) {
      this.headerScroll.nativeElement.scrollLeft = target.scrollLeft;
    }
  }
}

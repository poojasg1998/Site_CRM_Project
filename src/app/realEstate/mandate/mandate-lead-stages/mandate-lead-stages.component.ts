import {
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
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import {
  IonCheckbox,
  IonContent,
  MenuController,
  Platform,
} from '@ionic/angular';
import Swal from 'sweetalert2';
import { RetailServiceService } from '../../retail-service.service';
import { SharedService } from '../../shared.service';
import { MandateService } from '../../mandate-service.service';

@Component({
  selector: 'app-mandate-lead-stages',
  templateUrl: './mandate-lead-stages.component.html',
  styleUrls: ['./mandate-lead-stages.component.scss'],
})
export class MandateLeadStagesComponent implements OnInit {
  tempFilteredValues;
  isManual = false;
  selectedCount;
  leadId;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChild('sourceScrollContent', { static: false })
  sourceScrollContent!: IonContent;
  @ViewChild('filterModal') filterModal;
  @ViewChild('assignLeadsModal') assignLeadsModal;
  @ViewChild('viewAssignLeadDetail') viewAssignLeadDetail;
  @ViewChild('content', { static: false }) content: IonContent;
  showSpinner = false; // to display the loader
  showSpinner1 = false;
  isCheckbox: boolean = false; // to display the checkbox
  showInfiniteScroll = true;
  isenabled = true;
  startdate;
  enddate;
  minDate;
  maxDate;
  endDateMinDate;
  leads_detail;
  isLeftFilterActive;
  mandateExecutives;
  mandateExecutives1;
  mandateCSExecutives;
  mandateCSExecutives1;
  mandateRMExecutives;
  mandateRMExecutives1;
  executiveSearchedTerm;
  sourceList;
  sourceList1;
  sourceSearchTerm;
  propertySearchTerm;
  propertyList = [];
  propertyList1 = [];
  count;
  localStorage = localStorage;
  generalFollowctgFilter;
  isAdmin;

  //to hold date in the formate of yyyy-mm-dd
  todaysdateforcompare: string;
  yesterdaysdateforcompare: string;
  tomorrowsdateforcompare: string;
  currentdateforcompare = new Date(); //to hold the today's date

  followupsections;
  followctgFilter;

  fromExecids = [];
  assignedLeadIds = [];
  assignedLeadDetails = [];
  selectedLeadCount = 0;
  selectedExecutiveName;
  executives;
  selectedExecTeam;
  selectedTeam;
  selectedProperty;
  isRetail = false;
  randomId = '';
  team = [
    { name: 'Retail Team', code: 'Retail' },
    { name: 'Mandate Team', code: 'Mandate' },
  ];
  execTeam = [
    { name: 'Relationship Executives', code: '50002' },
    { name: 'Customersupport Executives', code: '50014' },
  ];

  filteredParams = {
    fromDate: '',
    toDate: '',
    status: '',
    stage: '',
    team: '',
    propid: '',
    followup: '',
    executid:
      localStorage.getItem('Role') === '1'
        ? []
        : localStorage.getItem('UserId'),
    loginid: localStorage.getItem('UserId'),
    priority: '',
    htype: '',
    source: '',
    stagestatus: '',
    visits: '',
    receivedFromDate: '',
    receivedToDate: '',
    visitedfromdate: '',
    visitedtodate: '',
    assignedfromdate: '',
    assignedtodate: '',
    visitassignedto: '',
    fromTime: '',
    toTime: '',
    rmexecutid: '',
    isDropDown: 'false',
    active: '1',
    teamlead:
      localStorage.getItem('RoleType') == '1'
        ? localStorage.getItem('UserId')
        : '',
    type: '',
    limit: 0,
    limitrows: 5,
    visittype: '',
    remarks_search: '',
    counter: '',
  };
  mandateLeadsCount = {
    untouched: '0',
    generalFollowup: '0',
    nc: '0',
    inactive: '0',
    junkLeads: '0',
    touched: '0',
    active: '0',
    count_1: '0',
    count_2: '0',
    count_3: '0',
    count_4: '0',
    count_final: '0',
  };

  reassignedResponseInfo: any;
  temporaryLeadIds: any[] = [];
  execid: any;
  isRM: boolean;
  isCS: boolean = false;
  private backButtonSubscription: Subscription;

  constructor(
    private location: Location,
    private menuCtrl: MenuController,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private retailService: RetailServiceService,
    private _sharedservice: SharedService,
    private mandateService: MandateService,
    private ngZone: NgZone,
    private platform: Platform
  ) {
    this.initializeStartEndDate();
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((response) => {
      this.isRM =
        this.localStorage.getItem('Role') == '50001' ||
        this.localStorage.getItem('Role') == '50002' ||
        this.localStorage.getItem('Role') == '50009' ||
        this.localStorage.getItem('Role') == '50010';
      this.leadId = response['leadId'];
      this.execid = response['execid'];
      this.propertyList = [];
      if (localStorage.getItem('Role') == '1') {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }

      this.isCS =
        this.localStorage.getItem('Role') == '50013' ||
        this.localStorage.getItem('Role') == '50014';

      this.isCheckbox = false;
      this.leads_detail = [];
      this.isLeftFilterActive = 'property';
      this.getQueryParams();
      this.getPropertyList();
      this.getTodayYesterdayTomorrowDate();
      this.getsourcelist();
      this.getFollowupsStatus();
      this.getMandateExec(
        this.filteredParams.propid,
        this.filteredParams.team,
        this.filteredParams.active
      );

      this.getPriceList();
      if (
        this.filteredParams.status === 'generalfollowups' ||
        this.filteredParams.status === 'inactive'
      ) {
        // this.scrollToHighlightedStage();
      }

      if (response['isOnCallDetailsPage'] == 'true') {
        this.isOnCallDetailsPage = true;
      } else {
        this.isOnCallDetailsPage = false;
      }

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

    // this.backButtonSubscription =
    //   this.platform.backButton.subscribeWithPriority(9999, async () => {
    //     alert(this.filteredParams.status);
    //   });
  }

  isAtBottom = false;
  canScroll;
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

  // method called when we click on back icon
  onBackButton() {
    // this.resetInfiniteScroll();
    // this.location.back();
    if (!this.router.url.includes('status=pending')) {
      this.filteredParams = {
        fromDate: '',
        toDate: '',
        status: 'pending',
        stage: '',
        team: '',
        propid: '',
        followup: '',
        executid:
          localStorage.getItem('Role') === '1'
            ? []
            : localStorage.getItem('UserId'),
        loginid: localStorage.getItem('UserId'),
        priority: '',
        htype: '',
        source: '',
        stagestatus: '',
        visits: '',
        receivedFromDate: '',
        receivedToDate: '',
        visitedfromdate: '',
        visitedtodate: '',
        assignedfromdate: '',
        assignedtodate: '',
        visitassignedto: '',
        fromTime: '',
        toTime: '',
        rmexecutid: '',
        isDropDown: 'false',
        active: '1',
        type: '',
        limit: 0,
        limitrows: 10,
        visittype: '',
        teamlead:
          localStorage.getItem('RoleType') == '1'
            ? localStorage.getItem('UserId')
            : '',
        remarks_search: '',
        counter: '',
      };
      this.addQuerryParams();
    } else {
      this.location.back();
    }
  }

  //TO RESET THE INFINITE SRCOLL
  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
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
    this.setDefaultToTime.setUTCHours(23, 59, 0, 136);
    this.setDefaultToTime = this.setDefaultToTime.toISOString();
    // this.endDateMinDateNextaction= this.setDefaultFromTime;

    // Initialize start and end dates with default values
    this.startdate = new Date().toISOString();
    this.enddate = new Date().toISOString();

    // Set the minimum and maximum dates
    // this.minDate = '2000-01-01';
    // this.maxDate = new Date()

    // Set initial min date for end date picker
    this.endDateMinDate = this.startdate;
  }

  // when we click on stages present on horizontal scroll heading
  onStage(value, type) {
    this.filteredParams.type = type;
    this.resetInfiniteScroll();
    this.filteredParams.followup = '';
    if (value != 'NC') {
      this.filteredParams.status = value;
      this.filteredParams.stage = '';
      this.filteredParams.visittype = '';
    } else {
      this.filteredParams.stage = value;
      this.filteredParams.status = '';
    }

    if (value == 'inactive') {
      this.filteredParams.followup = '2';
      this.filteredParams.counter = this.isAdmin ? '1' : '';
    } else if (value == 'generalfollowups') {
      // this.filteredParams.followup = '1';
    } else if (value == 'junkleads') {
      this.filteredParams.counter = this.isAdmin ? '1' : '';
    } else {
      this.filteredParams.counter = '';
    }
    value == 'NC'
      ? (this.filteredParams.visittype = '3')
      : (this.filteredParams.visittype = '');
    this.filteredParams.isDropDown = 'false';

    if (value != 'generalfollowups' && value != 'NC') {
      this.filteredParams.remarks_search = '';
    }

    this.addQuerryParams();
  }

  // to add querry params
  addQuerryParams() {
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
    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

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

    // ✅ Initialize fromTime / toTime
    if (!this.filteredParams.hasOwnProperty('fromTime')) {
      this.filteredParams['fromTime'] = queryParams['fromTime'] || '';
    }
    if (!this.filteredParams.hasOwnProperty('toTime')) {
      this.filteredParams['toTime'] = queryParams['toTime'] || '';
    }

    // ✅ Assign values
    Object.keys(this.filteredParams).forEach((key) => {
      if (queryParams.hasOwnProperty(key)) {
        // If param like executid=40119,40200 convert to array
        if (key === 'executid') {
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
      } else if (key === 'propid' && localStorage.getItem('ranavPropId')) {
        this.filteredParams[key] = '28773';
      } else if (key !== 'loginid' && key !== 'limit' && key !== 'limitrows') {
        this.filteredParams[key] = '';
      }
    });

    // ✅ Hover state logic
    if (this.filteredParams.propid === '28773') {
      this.mandateService.setHoverState('ranav_group');
    } else {
      this.mandateService.setHoverState('');
    }
    (this.filteredParams.executid =
      localStorage.getItem('Role') === '1'
        ? this.filteredParams.executid
        : localStorage.getItem('UserId')),
      this.settingSelectedDate();
  }

  //horizontal scroll move to selected stages present on heading
  scrollToHighlightedStage() {
    const scrollContainer = this.scrollContainer?.nativeElement;
    const selectedElement = scrollContainer?.querySelector(
      `[data-stage="${this.filteredParams.followup}"]`
    );

    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }

  //To fetch executive names
  getMandateExec(propid, team, active) {
    let teamlead = '';
    if (this.localStorage.getItem('RoleType') === '1') {
      team = '2';
      propid = this.localStorage.getItem('PropertyId');
      teamlead = this.localStorage.getItem('UserId');
    }
    this.mandateService
      .fetchmandateexecutives1(propid, team, active, '', teamlead)
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

        this.mandateRMExecutives = this.mandateExecutives.filter((item) => {
          return item.roleid == '50002';
        });
        this.mandateRMExecutives1 = this.mandateRMExecutives;
      });
  }

  //To fetch source list
  getsourcelist() {
    this._sharedservice.sourcelist().subscribe((response) => {
      this.sourceList = response['Sources'];
      this.sourceList1 = this.sourceList;
    });
  }

  onGfInaciveSubStage(followupId) {
    this.resetInfiniteScroll();
    this.filteredParams.followup = followupId;
    this.addQuerryParams();
  }

  //here we get the list of Generalfollowups and inactive stage data
  getFollowupsStatus() {
    this.mandateService.getfollowupsections().subscribe((followupsection) => {
      this.followupsections = followupsection['followupCategories'];
      if (this.filteredParams.status == 'generalfollowups') {
        let id = [1, 5];
        this.generalFollowctgFilter = this.followupsections.filter((da) =>
          id.some((num) => {
            return (
              da.followup_section_IDPK == num && da.followup_categories != 'NC'
            );
          })
        );
      } else {
        let id = [1, 5];
        this.followctgFilter = this.followupsections.filter((da) => {
          return (
            da.followup_categories !== 'NC' &&
            !id.some((num) => da.followup_section_IDPK == num)
          );
        });
      }
    });
  }

  getLeadsCount() {
    this.showSpinner = true;
    const requests = [];
    const status = [
      'pending',
      'generalfollowups',
      'inactive',
      'junkleads',
      'touched',
      'active',
    ];
    status.forEach((status) => {
      const params = {
        ...this.filteredParams,
        status: status,
        stage:
          this.filteredParams.status != '' && this.filteredParams.stage != ''
            ? this.filteredParams.stage
            : '',
        followup:
          (status == 'generalfollowups' || status == 'inactive') &&
          this.filteredParams.followup
            ? this.filteredParams.followup
            : '',
        fromTime:
          status == 'generalfollowups' ? this.filteredParams.fromTime : '',
        toTime: status == 'generalfollowups' ? this.filteredParams.toTime : '',
        counter:
          (status == 'junkleads' &&
            this.filteredParams.status == 'junkleads') ||
          (status == 'inactive' && this.filteredParams.status == 'inactive')
            ? this.filteredParams.counter
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
    const stage = ['NC'];
    stage.forEach((stage) => {
      const params = {
        ...this.filteredParams,
        stage: stage,
        status: '',
        followup: '',
        counter: '',
      };
      requests.push(
        this.mandateService.getAssignedLeadsCounts(params).pipe(
          catchError((error) => {
            console.error(`Error fetching data for stage: ${stage}`, error);
            return of(null);
          })
        )
      );
    });
    forkJoin(requests).subscribe((results) => {
      results.forEach((assignleads, index) => {
        if (assignleads && assignleads['AssignedLeads']) {
          switch (index) {
            case 0:
              this.mandateLeadsCount.untouched =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 1:
              this.mandateLeadsCount.generalFollowup =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 2:
              this.mandateLeadsCount.inactive =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 3:
              this.mandateLeadsCount.junkLeads =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 4:
              this.mandateLeadsCount.touched =
                assignleads['AssignedLeads'][0]['counts'];
              break;
            case 5:
              this.mandateLeadsCount.active =
                assignleads['AssignedLeads'][0]['counts'];
              break;
            case 6:
              this.mandateLeadsCount.nc =
                assignleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            default:
              break;
          }
        }
      });
    });

    if (
      this.filteredParams.status == 'inactive' ||
      this.filteredParams.status == 'junkleads'
    ) {
      const requests = [];
      const counter = ['1', '2', '3', '4', 'final'];
      counter.forEach((counter) => {
        const params = {
          ...this.filteredParams,
          counter: counter,
        };
        requests.push(
          this.mandateService.getAssignedLeadsCounts(params).pipe(
            catchError((error) => {
              console.error(`Error fetching data for stage: ${stage}`, error);
              return of(null);
            })
          )
        );
      });

      forkJoin(requests).subscribe((results) => {
        results.forEach((assignleads, index) => {
          if (assignleads && assignleads['AssignedLeads']) {
            switch (index) {
              case 0:
                this.mandateLeadsCount.count_1 =
                  assignleads['AssignedLeads'][0]['Uniquee_counts'];
                break;
              case 1:
                this.mandateLeadsCount.count_2 =
                  assignleads['AssignedLeads'][0]['Uniquee_counts'];
                break;
              case 2:
                this.mandateLeadsCount.count_3 =
                  assignleads['AssignedLeads'][0]['Uniquee_counts'];
                break;
              case 3:
                this.mandateLeadsCount.count_4 =
                  assignleads['AssignedLeads'][0]['Uniquee_counts'];
                break;
              case 4:
                this.mandateLeadsCount.count_final =
                  assignleads['AssignedLeads'][0]['Uniquee_counts'];
                break;
            }
          }
        });
      });
    }
    this.getLeadsDetail(false, 0);
  }

  getLeadsDetail(isLoadmore, selectedCount) {
    var filterParam = this.filteredParams;
    if (
      this.filteredParams.status == 'inactive' ||
      this.filteredParams.status == 'junkleads'
    ) {
      filterParam.counter = this.filteredParams.counter
        ? this.filteredParams.counter
        : '';
    }

    if (
      this.filteredParams.stage != 'NC' &&
      this.filteredParams.status != 'generalfollowups'
    ) {
      filterParam.fromTime = '';
      filterParam.toTime = '';
    } else {
      filterParam.fromTime = this.filteredParams.fromTime;
      filterParam.toTime = this.filteredParams.toTime;
    }
    if (
      (this.filteredParams.status == 'generalfollowups' ||
        this.filteredParams.status == 'inactive') &&
      this.filteredParams.followup
    ) {
      filterParam.followup = this.filteredParams.followup;
    } else {
      filterParam.followup = '';
    }

    if (selectedCount != 0 && !isLoadmore) {
      filterParam.limit = 0;
      filterParam.limitrows = selectedCount;
    } else {
      this.count = isLoadmore ? (this.count += 5) : 0;
      filterParam.limit = this.count;
    }

    return new Promise((resolve, reject) => {
      this.mandateService
        .getAssignedLeadsDetail(filterParam)
        .subscribe((response) => {
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
    });
  }

  async loadData(event) {
    // Save current scroll position
    const scrollEl = await this.content.getScrollElement();
    const previousPosition = scrollEl.scrollTop;

    // Load more data
    const hasData = await this.getLeadsDetail(true, 0);

    setTimeout(async () => {
      event.target.complete();

      if (!hasData) {
        event.target.disabled = true;
        return;
      }

      //Restore scroll position
      this.content.scrollToPoint(0, previousPosition, 0);
    }, 200);
  }

  // loadData(event) {
  //   if (
  //     (this.filteredParams.status == 'pending' &&
  //       this.leads_detail.length < Number(this.mandateLeadsCount.untouched)) ||
  //     (this.filteredParams.status == 'generalfollowups' &&
  //       this.leads_detail.length <
  //         Number(this.mandateLeadsCount.generalFollowup)) ||
  //     (this.filteredParams.status == 'inactive' &&
  //       this.leads_detail.length < Number(this.mandateLeadsCount.inactive)) ||
  //     (this.filteredParams.status == 'junkleads' &&
  //       this.leads_detail.length < Number(this.mandateLeadsCount.junkLeads)) ||
  //     (this.filteredParams.stage == 'NC' &&
  //       this.leads_detail.length < Number(this.mandateLeadsCount.junkLeads)) ||
  //     (this.filteredParams.status == 'touched' &&
  //       this.leads_detail.length < Number(this.mandateLeadsCount.touched)) ||
  //     (this.filteredParams.status == 'active' &&
  //       this.leads_detail.length < Number(this.mandateLeadsCount.active))
  //   ) {
  //     this.getLeadsDetail(true, 0).then(() => {
  //       event.target.complete();
  //     });
  //   } else {
  //     event.target.disabled = true;
  //   }
  // }

  navigateToFilter() {
    if ('ranavPropId' in localStorage && this.isAdmin) {
      this.isLeftFilterActive = 'source';
    } else if ('ranavPropId' in localStorage && !this.isAdmin) {
      this.isLeftFilterActive = 'assignedDate';
    } else {
      this.isLeftFilterActive = 'property';
    }
    this.tempFilteredValues = { ...this.filteredParams };
    this.settingSelectedDate();
    this.filterModal.present();
  }

  //called when we swipe the card
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
    this.sliding.close();
  }

  lead;
  @ViewChild('sliding') sliding;
  @ViewChild('callConfirmationModal') callConfirmationModal;
  @ViewChild('onCallDetailsPage') onCallDetailsPage;

  outboundCall(lead) {
    this.sliding.close();
    this.showSpinner = true;
    this._sharedservice.isMenuOpen = false;
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

      this.callConfirmationModal.dismiss();

      this._sharedservice.outboundCall(param).subscribe((resp) => {
        if (resp['status'] == 'success') {
          this.showSpinner = false;
        } else {
          this._sharedservice.isMenuOpen = true;
          this.showSpinner = false;
        }
        //  this.callConfirmationModal.dismiss();
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

  // To fetch the Property
  getPropertyList() {
    this.mandateService.getmandateprojects().subscribe((proplist) => {
      if (this.localStorage.getItem('RoleType') === '1') {
        const propIds = this.localStorage.getItem('PropertyId');
        const propIdArray = propIds.split(',');
        proplist['Properties'].forEach((property) => {
          if (propIdArray.includes(property.property_idfk)) {
            this.propertyList.push(property);
          }
        });
      } else {
        this.propertyList = proplist['Properties'];
      }
      this.propertyList1 = this.propertyList;
    });
  }
  page = 1;
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
        teamlead:
          localStorage.getItem('RoleType') == '1'
            ? localStorage.getItem('UserId')
            : null,
        htype: this.filteredParams.htype,
      },
    });
  }

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
      this.getMandateExec(
        this.tempFilteredValues.propid,
        this.tempFilteredValues.team,
        this.tempFilteredValues.active
      );
    } else {
      this.filteredParams.active = '2';
      this.getMandateExec(
        this.tempFilteredValues.propid,
        this.tempFilteredValues.team,
        this.tempFilteredValues.active
      );
    }
  }

  reset_filter() {
    this.isLeftFilterActive = 'property';
    this.tempFilteredValues = {
      fromDate: '',
      toDate: '',
      status: this.filteredParams.status,
      stage: this.filteredParams.stage,
      team: '',
      propid: '',
      htype: this.filteredParams.htype,
      followup: this.filteredParams.followup,
      executid:
        localStorage.getItem('Role') === '1'
          ? ''
          : localStorage.getItem('UserId'),
      loginid: localStorage.getItem('UserId'),
      priority: '',
      source: '',
      stagestatus: '',
      visits: '',
      receivedFromDate: '',
      receivedToDate: '',
      visitedfromdate: '',
      visitedtodate: '',
      assignedfromdate: '',
      assignedtodate: '',
      fromTime: '',
      toTime: '',
      isDropDown: 'false',
      active: '1',
      type: this.filteredParams.type,
      limit: 0,
      limitrows: 10,
    };
    this.isenabled = true;
    this.receivedDateRange = null;
    this.assignedDateRange = null;
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
        this.getMandateExec(
          this.tempFilteredValues?.propid,
          this.tempFilteredValues?.team,
          this.tempFilteredValues?.active
        );
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
      case 'assignTo':
        this.tempFilteredValues.rmexecutid = value == 'all' ? '' : value;
        this.tempFilteredValues.executid = value == 'all' ? '' : value;
        break;
      case 'assignFrom':
        if (localStorage.getItem('Role') == '1') {
          this.tempFilteredValues.visitassignedto = value == 'all' ? '' : value;
        } else {
          this.tempFilteredValues.executid = value == 'all' ? '' : value;
        }
        break;
      case 'stage':
        this.tempFilteredValues.followup = value == 'all' ? '' : value;
        break;
      case 'visitType':
        this.tempFilteredValues.visits = value == 'all' ? '' : value;
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
      case 'priority':
        this.tempFilteredValues.priority = value;
        break;
    }

    const {
      assignedfromdate,
      assignedtodate,
      receivedFromDate,
      receivedToDate,
      fromDate,
      toDate,
    } = this.tempFilteredValues;

    const isValid = !(
      (assignedfromdate &&
        (!assignedtodate || assignedtodate === '1970-01-01')) ||
      (receivedFromDate &&
        (!receivedToDate || receivedToDate === '1970-01-01')) ||
      (fromDate && (!toDate || toDate === '1970-01-01'))
    );
    this.isenabled = isValid;
  }

  //END
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
  //     this.assignedLeadDetails=[];
  //     this.assignedLeadIds = this.assignedLeadIds.filter(id => id !== leadId);//remove id from array
  //     this.temporaryLeadIds =  this.temporaryLeadIds.filter(id => id !== leadId);
  //     this.selectedLeadCount = this.assignedLeadIds.length;
  //     this.getSelectedLeadDetails();
  //   }
  // }

  onReceivedDate() {
    //           const fromDate = new Date(this.filteredParams.receivedFromDate);
    // const toDate = new Date( this.filteredParams.receivedToDate);
    // this.receivedDateRange = [fromDate, toDate];
  }

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
  @ViewChildren('freshleadsCheckboxes') checkboxes!: QueryList<IonCheckbox>;
  onSelectLeadCount(count) {
    if (count != 'manual' && parseInt(count) > this.leads_detail.length) {
      this.selectedLeadCount = parseInt(count);
      this.showSpinner = true;
      this.isManual = false;
      this.getLeadsDetail(false, parseInt(count)).then(() => {
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
        this.selectedLeadCount = parseInt(count);
        this.isManual = false;
        this.selectedCount = null;
        setTimeout(() => {
          this.selectedCount = count;
        });
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
    // this.retailService
    //   .fetchRetail_executivesName(event.value.code, '')
    //   .subscribe((response) => {
    //     this.showSpinner = false;
    //     this.executives = response['DashboardCounts'];
    //   });
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
    console.log(this.selectedExecutiveName.id);
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
      }
    }
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

  onWillDismiss(event) {
    location.reload();
  }
  onViewAssignLeadDetailClose() {
    this.viewAssignLeadDetail.dismiss();
    window.location.reload();
  }

  onBackicon() {
    this.selectedCount = 0;
    this.isManual = false;
    this.temporaryLeadIds = [];
    this.checkedLeadsDetail = [];
    this.selectedLeadCount = 0;
    this.isCheckbox = false;
    this.showSpinner = false;
  }
  onReassign() {
    this.temporaryLeadIds = [];
    this.isCheckbox = true;
  }
  //END

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
    this.addQuerryParams();
  }

  onHtype(htype) {
    this.reset_filter();
    this.filteredParams = { ...this.tempFilteredValues };
    const queryParams = {};
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
    if (this.filteredParams.htype == 'mandate') {
      this.router.navigate(['mandate-lead-stages'], {
        queryParams,
        queryParamsHandling: 'merge',
      });
    } else {
      this.router.navigate(['retail-lead-stages'], {
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
    this.addQuerryParams();
  }

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
  csexecutiveSearchedTerm;
  rmexecutiveSearchedTerm;
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

  propertyPriceList;
  grSitaraPropertyInfo;
  grSamskruthiProperyInfo;
  @ViewChild('propInfo') propInfo: ElementRef;
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
      } else if (type == 'info') {
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
      } else if (type == 'info') {
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

  onVisits(visittype) {
    this.resetInfiniteScroll();
    this.filteredParams.visittype = visittype;
    this.addQuerryParams();
  }

  receivedDateRange;
  assignedDateRange;
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
    } else if (data == 'from' && this.tempFilteredValues.fromDate != '') {
      return `${this.tempFilteredValues.fromDate} , ${this.tempFilteredValues.fromTime}`;
    } else if (data == 'to' && this.tempFilteredValues.toDate != '') {
      return `${this.tempFilteredValues.toDate} , ${this.tempFilteredValues.toTime}`;
    } else {
      return `${'Select Date Range'}`;
    }
  }

  closeFilterModal() {
    this.isenabled = true;
    this.receivedDateRange = null;
    this.assignedDateRange = null;
    this.nextActionFromDate = null;
    this.nextActionToDate = null;
    this.filterModal.dismiss();
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

    // if(this.filteredParams.fromDate != ''){
    //  const fromDateStr = this.filteredParams.fromDate + 'T' + this.filteredParams.fromTime;
    //   const toDateStr = this.filteredParams.toDate + 'T' + this.filteredParams.toTime;

    //   const fromDate = new Date(fromDateStr);
    //   const toDate = new Date(toDateStr);

    //   this.nextActionFromDate = [fromDate];
    //   this.nextActionToDate = [toDate];
    // }else {
    //   this.nextActionFromDate = null;
    //   this.nextActionToDate = null;
    // }
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
    // if (this.filteredParams.status == 'pending') {
    //   window.open(`https://wa.me/+91 ${number}`, '_system');
    // } else {
    this.router.navigate(['./clients-chats'], {
      queryParams: {
        chatListSearch: number,
        selectedChat: 'all',
        htype: this.filteredParams.htype,
      },
    });
    // }
  }

  onRemarkSearch() {
    if (this.filteredParams.remarks_search == '') {
      this.addQuerryParams();
    } else {
    }
  }

  //this method is used in junk and inactive param,here we check time difference to allow the executive to access the lead.
  isOverAnHourOld(apiDate: string): boolean {
    const apiDateObj = new Date(apiDate);
    const currentTime = new Date();
    const timeDiff = currentTime.getTime() - apiDateObj.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return hoursDiff > 2;
  }

  removeExecutive(execId: string | number) {
    if (Array.isArray(this.filteredParams.executid)) {
      // Remove that particular executive id
      this.filteredParams.executid = this.filteredParams.executid.filter(
        (id) => id != execId
      );
    } else if (this.filteredParams.executid == execId) {
      // If only one id was selected
      this.filteredParams.executid = [];
    }

    // Update query params
    this.addQuerryParams();
  }

  inactive_junk_subFilter(value) {
    this.resetInfiniteScroll();
    this.filteredParams.counter = value;
    this.addQuerryParams();
  }
  @ViewChild('addPriorityModal') addPriorityModal;
  priorityUpdateLead;
  onSetPriority(lead, isEdit) {
    this.priorityUpdateLead = lead;
    if (!isEdit) {
      this.priority_id = '';
    }
    this.addPriorityModal.present();
  }
  priority_id = '';
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
}

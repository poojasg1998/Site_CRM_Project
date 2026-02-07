import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MandateService } from '../../mandate-service.service';
import { formatDate, Location } from '@angular/common';
import { forkJoin } from 'rxjs';
import { IonContent, MenuController, Platform } from '@ionic/angular';
import Swal from 'sweetalert2';
import { RetailServiceService } from '../../retail-service.service';
import { SharedService } from '../../shared.service';
@Component({
  selector: 'app-leadassign',
  templateUrl: './leadassign.component.html',
  styleUrls: ['./leadassign.component.scss'],
})
export class LeadassignComponent {
  showInfiniteScroll = true;
  @ViewChild('filterModal') filterModal;
  isLeftFilterActive;
  mandateExecutives1;
  mandateexecutives;
  executiveSearchedName;
  propertyList;
  propertyList1;
  propertySearchedName;
  sourceList;
  sourceList1;
  sourceSearchTerm;

  todaysfollowups = {
    todayFollowup: '',
    upcomingFollowup: '',
  };

  todayVisits = {
    scheduledVisits: '',
    todayVisited: '',
    upcomingVisits: '',
  };

  filteredParams = {
    fromDate: '',
    toDate: '',
    status: '',
    stage: '',
    team: '',
    propid: '',
    stagestatus: '',
    todaysvisits: '',
    todaysfollowups: '',
    executid:
      localStorage.getItem('Role') === '1'
        ? []
        : localStorage.getItem('UserId'),
    loginid: localStorage.getItem('UserId'),
    priority: '',
    source: '',
    active: '1',
    followup: '',
    visits: '',
    receivedFromDate: '',
    receivedToDate: '',
    visitedfromdate: '',
    visitedtodate: '',
    assignedfromdate: '',
    assignedtodate: '',
    fromTime: '',
    teamlead:
      localStorage.getItem('RoleType') === '1'
        ? localStorage.getItem('UserId')
        : '',
    htype: '',
    type: '',
    toTime: '',
    limit: 0,
    limitrows: 5,
  };

  mandateLeadsCount = {
    todayVisited: '',
    scheduled_Visits: '',
    upcomingVisits: '',
    todaysFollowup: '',
    upcomingFollowups: '',
  };

  showSpinner = true;
  selectedOption;
  count = 0;
  localStorage = localStorage;
  leads_detail;
  isProjectSection = true;
  isExecutiveSection = false;
  isPrioritySection = false;
  isStageSection = false;
  isDateSection = false;
  isSourceSection = false;
  minDate;
  maxDate;
  endDateMinDate;
  isenabled = true;
  startdate;
  enddate;
  isAdmin = false;
  todaysvisits;
  // todaysfollowups

  isTodayVisits: boolean;

  //to hold date in the formate of yyyy-mm-dd

  todaysdateforcompare: string;
  yesterdaysdateforcompare: string;
  tomorrowsdateforcompare: string;
  currentdateforcompare = new Date(); //to hold the today's date
  leadId: string;
  execid: string;
  isRM = false;
  isCS: boolean;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private menuCtrl: MenuController,
    private mandateService: MandateService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private platform: Platform,
    private retailService: RetailServiceService,
    public _sharedservice: SharedService,
    private _location: Location
  ) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this._location.back();
      this.ngOnInit();
    });
  }

  ngOnInit() {
    this.activeRoute.queryParamMap.subscribe((params) => {
      this.isRM =
        this.localStorage.getItem('Role') == '50001' ||
        this.localStorage.getItem('Role') == '50002' ||
        this.localStorage.getItem('Role') == '50009' ||
        this.localStorage.getItem('Role') == '50010';
      this.isCS =
        this.localStorage.getItem('Role') == '50013' ||
        this.localStorage.getItem('Role') == '50014';
      this.leads_detail = [];
      this.leadId = params.get('leadId');
      this.execid = params.get('execid');
      this.resetInfiniteScroll();
      if (localStorage.getItem('Role') == '1') {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }

      if (this.router.url.indexOf('todaysvisits') > -1) {
        this.isTodayVisits = true;
      } else {
        this.isTodayVisits = false;
      }

      this.getTodayYesterdayTomorrowDate();
      this.fetchPropertyNames();
      this.getExecutives();
      this.getsourcelist();
      this.getQueryParam();
      this.getPriceList();
      if (params.get('isOnCallDetailsPage') == 'true') {
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
        this.getAssignedLeadsCount();
      }

      // if(this.router.url.indexOf('todaysvisits')>-1){
      //     this.todaysvisits = true;
      //     // this.todaysfollowups = false;
      //     this.initializeFilterParam();
      //     this.getQueryParam();
      //     if( this.filteredParams.selectedOption == 'todayvisited'){
      //       this.filteredParams.status = '';
      //     }else{
      //       this.filteredParams.status = this.filteredParams.status;
      //     }

      //     if(this.filteredParams.selectedOption == 'upcomingvisit'){
      //       this.filteredParams.fromDate = '';
      //       this.filteredParams.toDate = '';
      //     }else{

      //     }
      //   this.getScheduledActivityLeadsCount();
      //   }else if(this.router.url.indexOf('todaysfollowups')>-1){
      //     // this.todaysfollowups = true;
      //     this.todaysvisits = false;
      //   if(this.filteredParams.selectedOption == 'todaysfollowups'){
      //     this.filteredParams.fromDate=this.todaysdateforcompare;
      //     this.filteredParams.toDate = this.todaysdateforcompare;
      //   }
      //   this.filteredParams.status = 'todaysfollowups';
      //   this.getQueryParam();
      //   this.getFollowupsLeadsCount();
      // }
    });
  }

  getAssignedLeadsCount() {
    this.showSpinner = true;
    const requests = [];
    if (this.filteredParams.todaysvisits) {
      const status = ['scheduledtoday', 'allvisits', 'upcomingvisit'];
      status.forEach((status) => {
        const params = {
          ...this.filteredParams,
          status: status,
          fromDate:
            status == 'scheduledtoday'
              ? this.todaysdateforcompare
              : status == 'allvisits' || status == 'upcomingvisit'
              ? ''
              : this.filteredParams.fromDate,

          toDate:
            status == 'scheduledtoday'
              ? this.todaysdateforcompare
              : status == 'allvisits' || status == 'upcomingvisit'
              ? ''
              : this.filteredParams.toDate,
          visitedfromdate:
            status == 'allvisits' ? this.todaysdateforcompare : '',
          visitedtodate: status == 'allvisits' ? this.todaysdateforcompare : '',
          stagestatus: status == 'allvisits' ? '3' : '',
        };
        requests.push(this.mandateService.getAssignedLeadsCounts(params));
      });

      forkJoin(requests).subscribe((results) => {
        results.forEach((assgnleads, index) => {
          switch (index) {
            case 0:
              this.todayVisits.scheduledVisits =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 1:
              this.todayVisits.todayVisited =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 2:
              this.todayVisits.upcomingVisits =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            default:
              break;
          }
        });
        this.changeDetectorRef.detectChanges();
        this.getAssignedLeadsData(false);
      });
    } else if (this.filteredParams.type == 'notification') {
      const status = ['scheduledtoday', 'todaysfollowups'];

      status.forEach((status) => {
        const params = {
          ...this.filteredParams,
          status: status,
          fromDate: this.todaysdateforcompare,
          toDate: this.todaysdateforcompare,
        };
        requests.push(this.mandateService.getAssignedLeadsCounts(params));
      });

      forkJoin(requests).subscribe((results) => {
        results.forEach((assgnleads, index) => {
          switch (index) {
            case 0:
              this.todayVisits.scheduledVisits =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 1:
              this.todaysfollowups.todayFollowup =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            default:
              break;
          }
        });
        this.changeDetectorRef.detectChanges();
        this.getAssignedLeadsData(false);
      });
    } else {
      const status = ['todaysfollowups', 'upcomingfollowups'];
      status.forEach((status) => {
        const params = {
          ...this.filteredParams,
          status: status,
          stagestatus: '',
          fromDate:
            status == 'todaysfollowups'
              ? this.todaysdateforcompare
              : this.filteredParams.status == 'todaysfollowups' &&
                status == 'upcomingfollowups'
              ? ''
              : this.filteredParams.fromDate,
          toDate:
            status == 'todaysfollowups'
              ? this.todaysdateforcompare
              : this.filteredParams.status == 'todaysfollowups' &&
                status == 'upcomingfollowups'
              ? ''
              : this.filteredParams.toDate,
        };
        requests.push(this.mandateService.getAssignedLeadsCounts(params));
      });

      forkJoin(requests).subscribe((results) => {
        results.forEach((assgnleads, index) => {
          switch (index) {
            case 0:
              this.todaysfollowups.todayFollowup =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            case 1:
              this.todaysfollowups.upcomingFollowup =
                assgnleads['AssignedLeads'][0]['Uniquee_counts'];
              break;
            default:
              break;
          }
        });
        this.changeDetectorRef.detectChanges();
        this.getAssignedLeadsData(false);
      });
    }
  }

  getAssignedLeadsData(isLoadmore) {
    this.count = isLoadmore ? (this.count += 5) : 0;
    this.filteredParams.limit = this.count;

    if (this.filteredParams.todaysvisits) {
      this.filteredParams = {
        ...this.filteredParams,
        fromDate:
          this.filteredParams.status == 'scheduledtoday'
            ? this.todaysdateforcompare
            : this.filteredParams.status == 'allvisits' ||
              this.filteredParams.status == 'upcomingvisit'
            ? ''
            : this.filteredParams.fromDate,

        toDate:
          this.filteredParams.status == 'scheduledtoday'
            ? this.todaysdateforcompare
            : this.filteredParams.status == 'allvisits' ||
              this.filteredParams.status == 'upcomingvisit'
            ? ''
            : this.filteredParams.toDate,
        visitedfromdate:
          this.filteredParams.status == 'allvisits'
            ? this.todaysdateforcompare
            : '',
        visitedtodate:
          this.filteredParams.status == 'allvisits'
            ? this.todaysdateforcompare
            : '',
        stagestatus: this.filteredParams.status == 'allvisits' ? '3' : '',
      };
    } else if (this.filteredParams.type == 'notification') {
      this.filteredParams = {
        ...this.filteredParams,
        fromDate: this.todaysdateforcompare,
        toDate: this.todaysdateforcompare,
      };
    } else {
      this.filteredParams = {
        ...this.filteredParams,
        stagestatus: '',
        fromDate:
          this.filteredParams.status == 'todaysfollowups'
            ? this.todaysdateforcompare
            : this.filteredParams.fromDate,
        toDate:
          this.filteredParams.status == 'todaysfollowups'
            ? this.todaysdateforcompare
            : this.filteredParams.toDate,
      };
    }

    return new Promise((resolve, reject) => {
      this.mandateService
        .assignedLeads(this.filteredParams)
        .subscribe((response) => {
          this.ngZone.run(() => {
            if (response['status'] === 'True') {
              this.leads_detail = isLoadmore
                ? this.leads_detail.concat(response['AssignedLeads'])
                : response['AssignedLeads'];
              this.showSpinner = false;

              // this.enquiredProp = response['EnquiredPropertyLists'];
              // this.propertyList1 = this.enquiredProp;
              // this.suggestedProp = response['SuggestedPropertyLists'];
              // this.visitedProp = response['SuggestedPropertyLists'];
              this.showSpinner = false;
              resolve(true);
            } else {
              // this.leads_detail = [];
              this.showSpinner = false;
              resolve(false);
            }
          });
        });
    });
    this.changeDetectorRef.detectChanges();
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
        allVisits: null,
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

  initializeFilterParam() {
    this.filteredParams = {
      fromDate:
        this.filteredParams.status == 'upcomingfollowups' &&
        this.filteredParams.fromDate
          ? ''
          : this.filteredParams.status == 'todaysfollowups'
          ? this.todaysdateforcompare
          : '',
      toDate:
        this.filteredParams.status == 'upcomingfollowups' &&
        this.filteredParams.toDate
          ? ''
          : this.filteredParams.status == 'todaysfollowups'
          ? this.todaysdateforcompare
          : '',
      status: this.filteredParams.status,
      stage: '',
      team: '',
      propid: '',
      stagestatus: '',
      todaysvisits: this.filteredParams.todaysvisits,
      todaysfollowups: this.filteredParams.todaysfollowups,
      executid:
        localStorage.getItem('Role') === '1'
          ? []
          : localStorage.getItem('UserId'),
      loginid: localStorage.getItem('UserId'),
      teamlead:
        localStorage.getItem('RoleType') === '1'
          ? localStorage.getItem('UserId')
          : '',
      priority: '',
      source: '',
      active: '1',
      followup: '',
      visits: '',
      receivedFromDate: '',
      receivedToDate: '',
      visitedfromdate: '',
      visitedtodate: '',
      assignedfromdate: '',
      assignedtodate: '',
      htype: this.filteredParams.htype,
      fromTime: '',
      type: '',
      toTime: '',
      limit: 0,
      limitrows: 5,
    };
    this.isLeftFilterActive = 'property';
  }

  // to add querry params
  addQuerryParams() {
    this.resetInfiniteScroll();
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
    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  // To get queryParam value and assign to filterParam object
  getQueryParam() {
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
      } else if (key == 'propid' && 'ranavPropId' in localStorage) {
        this.filteredParams[key] = '28773';
      } else if (key !== 'loginid' && key !== 'limit' && key !== 'limitrows') {
        this.filteredParams[key] = '';
      }
    });

    this.filteredParams.executid =
      localStorage.getItem('Role') === '1'
        ? this.filteredParams.executid
        : localStorage.getItem('UserId');
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

  //fetch sourcelist
  getsourcelist() {
    this._sharedservice.sourcelist().subscribe((sources) => {
      this.sourceList = sources['Sources'];
      this.sourceList1 = this.sourceList;
    });
  }

  // to get the property names
  fetchPropertyNames() {
    this.mandateService
      .getmandateprojects1(this.localStorage.getItem('UserId'))
      .subscribe((response) => {
        if (response['status'] == 'True') {
          if (localStorage.getItem('RoleType') == '1') {
            const propIdsArray = this.localStorage
              .getItem('PropertyId')
              .split(',');
            this.propertyList = response['Properties'].filter((prop) => {
              return propIdsArray.includes(prop.property_idfk);
            });
            this.propertyList1 = this.propertyList;
          } else {
            this.propertyList = response['Properties'];
            this.propertyList1 = this.propertyList;
          }
        } else {
        }
      });
  }

  // to get executive names
  getExecutives() {
    if (this.localStorage.getItem('RoleType') == '1') {
      var param = {
        propid: this.localStorage.getItem('PropertyId'),
        team: '2',
        teamlead: this.localStorage.getItem('UserId'),
      };
    } else {
      var param = {
        propid:
          localStorage.getItem('PropertyId') != '28773'
            ? this.filteredParams.propid
            : '28773',
        team: this.filteredParams.team,
        teamlead: '',
      };
    }
    this.mandateService
      .fetchmandateexecutives1(
        param.propid,
        param.team,
        this.filteredParams.active,
        '',
        param.teamlead
      )
      .subscribe((executives) => {
        if (executives['status'] == 'True') {
          this.mandateexecutives = executives['mandateexecutives'];

          this.mandateexecutives = [
            ...(executives['mandateexecutives'] || []).filter(
              (x) => x.name !== 'Test RM' && x.name !== 'Test CS'
            ),
          ];
          this.mandateExecutives1 = this.mandateexecutives;
        } else {
        }
      });
  }

  // get scheduled activity Leads count
  // getScheduledActivityLeadsCount(){
  //   const requests=[];
  //   this.showSpinner = true;
  //   const status=['scheduledtoday']
  //   status.forEach(status => {
  //       const params = { ...this.filteredParams,fromDate:this.todaysdateforcompare,
  //         toDate:this.todaysdateforcompare,status:status,stagestatus:'',visitedfromdate:'',visitedtodate:''};
  //       requests.push(this.mandateService.getAssignedLeadsCounts(params));
  //   });

  //   const params = { ...this.filteredParams,fromDate:'',
  //     toDate:'',visitedfromdate:this.todaysdateforcompare,
  //   visitedtodate:this.todaysdateforcompare,stagestatus:'3',status:'allvisits'};
  //   requests.push(this.mandateService.getAssignedLeadsCounts(params));

  //   const status1=['upcomingvisit']
  //   status1.forEach(status => {
  //       const params = { ...this.filteredParams,status:status,stagestatus:'',fromDate:'',
  //         toDate:'',visitedfromdate:'',
  //       visitedtodate:''};
  //       requests.push(this.mandateService.getAssignedLeadsCounts(params));
  //   });

  //   forkJoin(requests).subscribe(results => {
  //     results.forEach((assignleads, index) => {
  //       switch (index) {
  //         case 0:
  //           this.mandateLeadsCount.scheduled_Visits = assignleads['AssignedLeads'][0]['Uniquee_counts']
  //         break;
  //         case 1:
  //           this.mandateLeadsCount.todayVisited = assignleads['AssignedLeads'][0]['Uniquee_counts']
  //         break;
  //         case 2:
  //           this.mandateLeadsCount.upcomingVisits = assignleads['AssignedLeads'][0]['Uniquee_counts']
  //         break;
  //         default:
  //         break;
  //       }
  //     })
  //     this.getScheduledActivityLeadsDetail(false);
  //   })
  // }

  // To get scheduled activity Leads detail
  // getScheduledActivityLeadsDetail(isLoadmore){
  //   if(this.filteredParams.selectedOption == 'scheduledtoday'){
  //     this.filteredParams.status = 'scheduledtoday';
  //   }
  //   this.count =  isLoadmore?  this.count += 5:0
  //   this.filteredParams.limit = this.count;

  //   return new Promise((resolve, reject) => {
  //     this.mandateService.assignedLeads(this.filteredParams).subscribe((response)=>{
  //       if(response['status'] === 'True'){
  //         this.leads_detail = isLoadmore ? this.leads_detail.concat(response['AssignedLeads']) : response['AssignedLeads']
  //         this.showSpinner = false;
  //         resolve(true);
  //       }else{
  //         this.showSpinner = false;
  //         resolve(false);
  //       }
  //     })
  //   })

  // }

  // Get Followups Leads count
  getFollowupsLeadsCount() {
    const requests = [];
    this.showSpinner = false;
    const status = ['todaysfollowups', 'upcomingfollowups'];
    status.forEach((status) => {
      const params = {
        ...this.filteredParams,
        status: status,
        stagestatus: '',
        fromDate:
          status == 'todaysfollowups'
            ? this.todaysdateforcompare
            : this.filteredParams.fromDate != this.todaysdateforcompare
            ? this.filteredParams.fromDate
            : '',
        toDate:
          status == 'todaysfollowups'
            ? this.todaysdateforcompare
            : this.filteredParams.toDate != this.todaysdateforcompare
            ? this.filteredParams.toDate
            : '',
      };
      requests.push(this.mandateService.getAssignedLeadsCounts(params));
    });

    forkJoin(requests).subscribe((results) => {
      results.forEach((assignleads, index) => {
        switch (index) {
          case 0:
            this.mandateLeadsCount.todaysFollowup =
              assignleads['AssignedLeads'][0]['counts'];
            break;
          case 1:
            this.mandateLeadsCount.upcomingFollowups =
              assignleads['AssignedLeads'][0]['counts'];
            break;
          default:
            break;
        }
      });
      this.getFollowupsLeadsdetail(false);
    });
  }

  // Get Followups Leads Details
  getFollowupsLeadsdetail(isLoadmore) {
    if (this.filteredParams.status == 'todaysfollowups') {
      this.filteredParams.fromDate = this.todaysdateforcompare;
      this.filteredParams.toDate = this.todaysdateforcompare;
    } else {
      this.filteredParams.fromDate = this.filteredParams.fromDate;
      this.filteredParams.toDate = this.filteredParams.toDate;
    }
    this.count = isLoadmore ? (this.count += 5) : 0;
    this.filteredParams.limit = this.count;

    return new Promise((resolve, reject) => {
      this.mandateService
        .assignedLeads(this.filteredParams)
        .subscribe((response) => {
          if (response['status'] === 'True') {
            this.leads_detail = isLoadmore
              ? this.leads_detail.concat(response['AssignedLeads'])
              : response['AssignedLeads'];
            this.showSpinner = false;
            resolve(true);
          } else {
            this.showSpinner = false;
            resolve(false);
          }
        });
    });
  }

  setFilteredExecutive() {
    this.mandateExecutives1 = this.mandateexecutives.filter((item) => {
      return item.name
        .toLowerCase()
        .includes(this.executiveSearchedName.toLowerCase());
    });
  }

  setFilteredProperty() {
    this.propertyList1 = this.propertyList.filter((item) => {
      return item.property_info_name
        .toLowerCase()
        .includes(this.propertySearchedName.toLowerCase());
    });
  }

  setFilteredSource() {
    this.sourceList1 = this.sourceList.filter((item) => {
      return item.source
        .toLowerCase()
        .includes(this.sourceSearchTerm.toLowerCase());
    });
  }

  // to get active executives
  toggleActiveExecutive(event) {
    this.showSpinner = true;
    if (event.detail.checked) {
      this.filteredParams.active = '1';
      this.getExecutives();
    } else {
      this.filteredParams.active = '2';
      this.getExecutives();
    }
  }

  onFilterValues(value) {
    if (value == 'property') {
      this.getExecutives();
    } else if (value == 'source') {
      this.scrollToSelectedSource();
    }
    this.isLeftFilterActive = value;
  }

  onFilterSelection(value, data) {
    switch (value) {
      case 'property':
        this.filteredParams.executid = '';
        this.filteredParams.propid = data == 'all' ? '' : data;

        if (this.filteredParams.propid === '28773') {
          this.mandateService.setHoverState('ranav_group');
        } else {
          this.mandateService.setHoverState('');
        }
        this.getExecutives();
        break;
      case 'executive':
        if (!Array.isArray(this.filteredParams.executid)) {
          this.filteredParams.executid = [];
        }

        if (value === 'all') {
          this.filteredParams.executid = [];
        } else {
          const index = this.filteredParams.executid.indexOf(data);
          if (index > -1) {
            // already selected → remove it
            this.filteredParams.executid.splice(index, 1);
          } else {
            // not selected → add it
            this.filteredParams.executid.push(data);
          }
        }
        this.filteredParams.executid.join(',');
        break;
      case 'source':
        this.filteredParams.source = data == 'all' ? '' : data;
        break;
      case 'visitType':
        this.filteredParams.visits = data == 'all' ? '' : data;
        break;
      case 'stage':
        this.filteredParams.stage = data;
        break;
      case 'fromDate':
        const fromDate = new Date(data.detail.value);
        this.filteredParams.fromDate = fromDate.toLocaleDateString('en-CA');
        this.filteredParams.fromTime = fromDate.toTimeString().split(' ')[0];

        this.endDateMinDate = this.filteredParams.fromDate;
        if (this.filteredParams.toDate.length === 0) {
          this.isenabled = false;
        }
        break;
      case 'toDate':
        const toDate = new Date(data.detail.value);
        const receivedAdjustedDate = new Date(
          toDate.getTime() - toDate.getTimezoneOffset() * 60000
        );
        this.enddate = data.detail.value;
        this.filteredParams.toDate =
          receivedAdjustedDate.toLocaleDateString('en-CA');
        this.filteredParams.toTime = toDate.toTimeString().split(' ')[0];
        this.endDateMinDate = this.filteredParams.fromDate;
        if (this.filteredParams.toDate.length !== 0) {
          this.isenabled = true;
        }
        break;
      case 'fromdate':
        const selectedfromDate = new Date(data).getHours();
        const currentfromDate = new Date().getHours();

        if (selectedfromDate === currentfromDate) {
          data.setHours(0, 0, 0, 0);
        }
        const fromdate1 = new Date(data);
        this.fromDateTime1 = fromdate1;
        this.filteredParams.fromDate = fromdate1.toLocaleDateString('en-CA');
        this.filteredParams.fromTime = fromdate1.toTimeString().split(' ')[0];
        this.filteredParams.toDate = '';
        if (this.filteredParams.toDate == '') {
          this.isenabled = false;
        } else {
          this.isenabled = true;
        }
        this.minDate = fromdate1;
        break;
      case 'todate':
        const selectedtoDate = new Date(data).getHours();
        const currenttoDate = new Date().getHours();
        if (selectedtoDate === currenttoDate) {
          data.setHours(23, 59, 0, 0);
        }
        const todate = new Date(data);
        this.toDateTime1 = todate;
        this.filteredParams.toDate = todate.toLocaleDateString('en-CA');
        this.filteredParams.toTime = todate.toTimeString().split(' ')[0];
        this.isenabled = true;
        break;
      default:
        break;
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

  //this called when we click on status present on heading
  changeOption(value) {
    this.resetInfiniteScroll();
    this.filteredParams.status = value;
    this.filteredParams.fromDate = '';
    this.filteredParams.toDate = '';
    this.addQuerryParams();
    // this.getAssignedLeadsDetail(false);
  }

  onBackButton() {
    this.resetInfiniteScroll();
    this._location.back();
    this.ngOnInit();
  }

  // TO DISPLAY FILTER SECTION
  navigateToFilter() {
    if ('ranavPropId' in localStorage && this.isAdmin) {
      this.isLeftFilterActive = 'source';
    } else if ('ranavPropId' in localStorage && !this.isAdmin) {
      this.isLeftFilterActive = 'visitType';
    } else {
      this.isLeftFilterActive = 'property';
    }
    this.filterModal.present();
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
    this.sliding.close();
  }

  loadData(event) {
    // if (!this.isTodayVisits) {
    //   if (
    //     (this.filteredParams.status == 'todaysfollowups' &&
    //       this.leads_detail.length < this.todaysfollowups.todayFollowup) ||
    //     (this.filteredParams.status == 'upcomingfollowups' &&
    //       this.leads_detail.length < this.todaysfollowups.upcomingFollowup)
    //   ) {
    //     this.getAssignedLeadsData(true).then(() => {
    //       event.target.complete();
    //     });
    //   } else {
    //     event.target.disabled = true;
    //   }
    // } else if (this.isTodayVisits) {
    //   if (
    //     (this.filteredParams.status == 'scheduledtoday' &&
    //       this.leads_detail.length < this.todayVisits.scheduledVisits) ||
    //     (this.filteredParams.status == 'allvisits' &&
    //       this.leads_detail.length < this.todayVisits.todayVisited) ||
    //     (this.filteredParams.status == 'upcomingvisit' &&
    //       this.leads_detail.length < this.todayVisits.upcomingVisits)
    //   ) {
    //     this.getAssignedLeadsData(true).then(() => {
    //       event.target.complete();
    //     });
    //   } else {
    //     event.target.disabled = true;
    //   }
    // }

    this.getAssignedLeadsData(true).then((hasData) => {
      event.target.complete();
      if (!hasData) {
        event.target.disabled = true;
      }
    });
  }

  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }

  @ViewChild('sourceScrollContent', { static: false })
  sourceScrollContent!: IonContent;
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

  fromDateTime1;
  toDateTime1;

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

  onHtype(htype) {
    const queryParams = {};
    for (const key in this.filteredParams) {
      if (
        this.filteredParams.hasOwnProperty(key) &&
        this.filteredParams[key] !== ''
      ) {
        if (key == 'propid') {
          queryParams[key] = '';
        } else {
          queryParams[key] = this.filteredParams[key];
        }
      } else {
        queryParams[key] = null;
      }
    }
    if (htype == 'mandate') {
      this.router.navigate(['leadassign'], {
        queryParams,
        queryParamsHandling: 'merge',
      });
    } else {
      this.router.navigate(['retail-leadassign'], {
        queryParams,
        queryParamsHandling: 'merge',
      });
    }
  }

  openEndMenu() {
    this._sharedservice.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  grSitaraPropertyInfo;
  grSamskruthiProperyInfo;
  propertyPriceList;
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

  dateRange = null;

  daterange(data) {
    const from = this.filteredParams.fromDate;
    const to =
      this.filteredParams.toDate != '1970-01-01'
        ? this.filteredParams.toDate
        : '';
    if (data == 'from' && this.filteredParams.fromDate) {
      return `${from + ' , ' + this.filteredParams.fromTime} `;
    } else if (data == 'to' && this.filteredParams.toDate) {
      return ` ${to + ' , ' + this.filteredParams.toTime}`;
    } else {
      return `${data == 'from' ? 'Select From Date' : 'Select To Date'}`;
    }
  }

  closeFilterModal() {
    this.isenabled = true;
    if (
      this.filteredParams.fromDate != '' &&
      this.filteredParams.toDate == ''
    ) {
      this.filteredParams.fromDate = '';
      this.filteredParams.fromTime = '';
    }
    this.filterModal.dismiss();
    this.addQuerryParams();
  }

  lead;
  isOnCallDetailsPage = false;
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

  canScroll;
  @ViewChild('mainscrollContainer', { static: false }) content: IonContent;
  onScroll(event: CustomEvent) {
    this._sharedservice.scrollTop = event.detail.scrollTop;
    const scrollTop = event.detail.scrollTop;
    this.content.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;

      this.canScroll = scrollHeight > clientHeight + 10;

      if (!this.canScroll) {
        this._sharedservice.isBottom = false;
      } else {
        this._sharedservice.isBottom =
          scrollTop + clientHeight >= scrollHeight - 100;
      }
    });
  }
}

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarComponentOptions } from '@googlproxer/ion-range-calendar';
import { catchError, forkJoin, of } from 'rxjs';
import {
  IonContent,
  IonModal,
  MenuController,
  PopoverController,
} from '@ionic/angular';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';
import { SharedService } from '../../shared.service';
import { MandateService } from '../../mandate-service.service';

@Component({
  selector: 'app-mandate-exec-activities',
  templateUrl: './mandate-exec-activities.component.html',
  styleUrls: ['./mandate-exec-activities.component.scss'],
})
export class MandateExecActivitiesComponent implements OnInit {
  showInfiniteScroll = true;
  @ViewChild('filterModal') filterModal;
  localStorage = localStorage;
  filteredParams = {
    fromDate: new Date().toLocaleDateString('en-CA'),
    toDate: new Date().toLocaleDateString('en-CA'),
    status: 'generalfollowups',
    stage: '',
    team: '',
    htype: '',
    propid: '',
    followup: '',
    isDateFilter: '',
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
    receivedFromDate: '',
    receivedToDate: '',
    actionfromdate: '',
    actiontodate: '',
    visitedfromdate: '',
    visitedtodate: '',
    fromTime: '',
    toTime: '',
    active: '1',
    limit: 0,
    limitrows: 5,
  };

  activityReport_count = {
    allleads: '',
    assignleads: '',
    gf: '',
    nc: '',
    usv: '',
    rsv: '',
    fn: '',
    dcrr: '',
    dealClosed: '',
    inactive: '',
    junkVisits: '',
    junkLeads: '',
  };

  isLeftFilterActive = 'property';
  todayDate = new Date().toLocaleDateString('en-CA');
  leads_detail;
  showSpinner = true;

  propertyList;
  propertyList1;
  propertySearchedName;

  startdate;
  enddate;
  minDate;
  maxDate;
  endDateMinDate;
  isenabled = true;
  isDisable;
  tempFilteredValues: {
    fromDate: string;
    toDate: string;
    status: string;
    stage: string;
    team: string;
    htype: string;
    propid: string;
    followup: string;
    executid: any;
    loginid: string;
    priority: string;
    source: string;
    stagestatus: string;
    isDateFilter: string;
    visits: string;
    receivedFromDate: string;
    receivedToDate: string;
    actionfromdate: string;
    actiontodate: string;
    visitedfromdate: string;
    visitedtodate: string;
    fromTime: string;
    toTime: string;
    teamlead: string;
    active: string;
    limit: number;
    limitrows: number;
  };

  execid: any;
  leadId: any;
  isOnCallDetailsPage: any = false;
  isCS: boolean;

  constructor(
    public _sharedservice: SharedService,
    private menuCtrl: MenuController,
    private mandateService: MandateService,
    private popoverController: PopoverController,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private _location: Location
  ) {}
  isRM = false;

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params) => {
      this.selecteddaterange = params['selecteddaterange'];
      this.isAdmin = localStorage.getItem('Role') == '1';
      this.isRM =
        this.localStorage.getItem('Role') == '50001' ||
        this.localStorage.getItem('Role') == '50002' ||
        this.localStorage.getItem('Role') == '50009' ||
        this.localStorage.getItem('Role') == '50010';
      this.isCS =
        this.localStorage.getItem('Role') == '50013' ||
        this.localStorage.getItem('Role') == '50014';
      this.leadId = params['leadId'];
      this.execid = params['execid'];
      this.initializeStartEndDate();
      this.getTodayYesterdayTomorrowDate();
      this.getQueryParam();
      this.getsourcelist();
      this.getExecutives();
      this.getProperty();

      this.getPriceList();

      if (params['isOnCallDetailsPage'] == 'true') {
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
        this.get_Activities_count();
      }
    });
  }
  count = 0;
  get_Activities_Data(isLoadmore) {
    this.count = isLoadmore ? this.count + 5 : 0;
    this.filteredParams.limit = this.count;
    var filterParam = { ...this.filteredParams };
    const stage1 = [
      'generalfollowups',
      'NC',
      'USV',
      'RSV',
      'Final Negotiation',
    ];
    if (stage1.includes(this.filteredParams.status)) {
      filterParam.fromTime = this.filteredParams.fromTime;
      filterParam.toTime = this.filteredParams.toTime;
    } else {
      filterParam.fromTime = '';
      filterParam.toTime = '';
    }

    return new Promise((resolve, reject) => {
      this.mandateService
        .assignedLeads1(this.filteredParams)
        .subscribe((response) => {
          this.ngZone.run(() => {
            if (response['status'] === 'True') {
              this.leads_detail = isLoadmore
                ? this.leads_detail.concat(response['result'])
                : response['result'];
              resolve(true);
              this.showSpinner = false;
            } else {
              isLoadmore ? '' : (this.leads_detail = []);
            }
          });
          this.showSpinner = false;
          resolve(false);
        });
    });
  }

  get_Activities_count() {
    this.showSpinner = true;
    const requests = [];
    var status = [
      'allleads',
      'assignedleads',
      'generalfollowups',
      'NC',
      'USV',
      'RSV',
      'Final Negotiation',
      'DCRR',
      'Deal Closed',
      'inactive',
      'junkvisits',
      'junkleads',
    ];

    status.forEach((status) => {
      const params = {
        ...this.filteredParams,
        status: status,
        stagestatus:
          status === 'USV' ||
          status === 'RSV' ||
          status === 'Final Negotiation' ||
          status == 'DCRR' ||
          status == 'Deal Closed'
            ? '3'
            : '',
        stage: status == 'junkvisits' ? this.filteredParams.stage : '',

        fromTime:
          status == 'generalfollowups' ||
          status == 'NC' ||
          status == 'USV' ||
          status == 'RSV' ||
          status == 'Final Negotiation'
            ? this.filteredParams.fromTime
            : '',
        toTime:
          status == 'generalfollowups' ||
          status == 'NC' ||
          status == 'USV' ||
          status == 'RSV' ||
          status == 'Final Negotiation'
            ? this.filteredParams.toTime
            : '',
      };

      requests.push(
        this.mandateService.getActivityLeadsCounts(params).pipe(
          catchError((error) => {
            return of(null);
          })
        )
      );
    });

    forkJoin(requests).subscribe((results) => {
      results.forEach((result, index) => {
        switch (index) {
          case 0:
            this.activityReport_count.allleads =
              result['result'][0]['uniquee_count'];
            break;
          case 1:
            this.activityReport_count.assignleads =
              result['result'][0]['uniquee_count'];
            break;
          case 2:
            this.activityReport_count.gf = result['result'][0]['uniquee_count'];
            break;
          case 3:
            this.activityReport_count.nc = result['result'][0]['uniquee_count'];
            break;
          case 4:
            this.activityReport_count.usv =
              result['result'][0]['uniquee_count'];
            break;
          case 5:
            this.activityReport_count.rsv =
              result['result'][0]['uniquee_count'];
            break;
          case 6:
            this.activityReport_count.fn = result['result'][0]['uniquee_count'];
            break;
          case 7:
            this.activityReport_count.dcrr =
              result['result'][0]['uniquee_count'];
            break;
          case 8:
            this.activityReport_count.dealClosed =
              result['result'][0]['uniquee_count'];
            break;
          case 9:
            this.activityReport_count.inactive =
              result['result'][0]['uniquee_count'];
            break;
          case 10:
            this.activityReport_count.junkVisits =
              result['result'][0]['uniquee_count'];
            break;
          case 11:
            this.activityReport_count.junkLeads =
              result['result'][0]['uniquee_count'];
            break;
          default:
            break;
        }
      });
      this.get_Activities_Data(false);
    });
  }

  changeOption(data, selectedValue) {
    this.resetInfiniteScroll();
    this.selectedOption = selectedValue;
    this.filteredParams.status = data;
    if (
      this.filteredParams.status == 'junkvisits' &&
      this.filteredParams.stage != ''
    ) {
      this.filteredParams.stage = this.filteredParams.stage;
    } else {
      this.filteredParams.stage = '';
    }
    this.addQueryParam();
  }
  selectedOption;
  isAdmin;
  getQueryParam() {
    const queryString = window.location.search;
    const queryParams: any = {};

    // Handle multiple query params (like executid=40119&executid=40200)
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

    //  Assign values
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

    // this.activeRoute.queryParamMap.subscribe(() => {
    //   this.leads_detail = [];
    //   if (localStorage.getItem('Role') == '1') {
    //     this.isAdmin = true;
    //   } else {
    //     this.isAdmin = false;
    //   }
    //   this.selectedOption = this.filteredParams.status
    //     ? this.filteredParams.status
    //     : this.filteredParams.stage
    //     ? this.filteredParams.stage
    //     : '';
    //   const queryString = window.location.search;
    //   const queryParams = new URLSearchParams(queryString);

    //   Object.keys(this.filteredParams).forEach((key) => {
    //     if (queryParams.has(key)) {
    //       this.filteredParams[key] = queryParams.get(key) || '';
    //     }
    //   });
    if (this.filteredParams.status == 'SV') {
      this.filteredParams.status = 'generalfollowups';
    }

    if (this.filteredParams.status != '') {
      if (
        this.filteredParams.status == 'junkvisits' &&
        this.filteredParams.stage != ''
      ) {
        this.selectedOption = this.filteredParams.status;
      }
      this.selectedOption = this.filteredParams.status;
    } else if (this.filteredParams.stage != '') {
      this.selectedOption = this.filteredParams.stage;
    }

    if (
      this.filteredParams.status == 'USV' ||
      this.filteredParams.status == 'RSV' ||
      this.filteredParams.status == 'Final Negotiation' ||
      this.filteredParams.status == 'Deal Closed' ||
      this.filteredParams.status == 'DCRR' ||
      this.filteredParams.status == 'junkvisits'
    ) {
      this.filteredParams.stagestatus =
        this.filteredParams.stagestatus != ''
          ? this.filteredParams.stagestatus
          : '3';
    } else {
      this.filteredParams.stagestatus = '';
    }

    if (this.filteredParams.propid === '28773') {
      this.mandateService.setHoverState('ranav_group');
    } else {
      this.mandateService.setHoverState('');
    }

    this.filteredParams.executid =
      localStorage.getItem('Role') === '1'
        ? this.filteredParams.executid
        : localStorage.getItem('UserId');
    // });
  }

  // addQueryParam() {
  //   this.resetInfiniteScroll();
  //   const queryParams = {};
  //   let paramsChanged = false;
  //   for (const key in this.filteredParams) {
  //     if (this.filteredParams.hasOwnProperty(key)) {
  //       // Set the param if it's not empty, otherwise set to null
  //       const newParamValue =
  //         this.filteredParams[key] !== '' ? this.filteredParams[key] : null;
  //       // Check if query parameters have changed
  //       if (this.activeRoute.snapshot.queryParams[key] !== newParamValue) {
  //         paramsChanged = true;
  //       }
  //       queryParams[key] = newParamValue;
  //     }
  //   }

  //   // If params have changed or if you want to always trigger an API call
  //   if (paramsChanged) {
  //     this.router
  //       .navigate([], { queryParams, queryParamsHandling: 'merge' })
  //       .then(() => {
  //         this.get_Activities_count();
  //         // window.location.reload();
  //       });
  //   } else {
  //     // Trigger API call even if no params changed
  //     this.get_Activities_count();
  //   }
  // }

  addQueryParam() {
    this.resetInfiniteScroll();
    const queryParams = {
      selecteddaterange: this.selecteddaterange,
    };
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

  navigateToFilter() {
    this.isenabled = true;
    this.tempFilteredValues = { ...this.filteredParams };
    this.isLeftFilterActive = 'property';
    this.filterModal.present();
  }

  reset_filter() {
    this.tempFilteredValues = {
      fromDate: new Date().toLocaleDateString('en-CA'),
      toDate: new Date().toLocaleDateString('en-CA'),
      status: this.filteredParams.status,
      stage: '',
      team: '',
      propid: '',
      htype: '',
      followup: '',
      executid:
        localStorage.getItem('Role') === '1'
          ? ''
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
      receivedFromDate: '',
      receivedToDate: '',
      actionfromdate: '',
      actiontodate: '',
      visitedfromdate: '',
      isDateFilter: '',
      visitedtodate: '',
      fromTime: '',
      toTime: '',
      active: '1',
      limit: 0,
      limitrows: 5,
    };
    this.nextActionFromDate = null;
    this.nextActionToDate = null;
    this.dateRange = null;
    this.settingSelectedDate();
    this.initializeStartEndDate();
    this.selecteddaterange = 'today';
  }

  onFilterValues(value) {
    if (value == 'stage') {
      this.getFollowupsStatus();
    }
    if (value == 'source') {
      this.scrollToSelectedSource();
    }
    this.isLeftFilterActive = value;
  }

  getProperty() {
    this.mandateService.getmandateprojects().subscribe((response) => {
      // this.propertyList = response['Properties'];
      // this.propertyList1 = this.propertyList;

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

  followctgFilter;
  followupsections;
  getFollowupsStatus() {
    this.showSpinner = true;
    this.mandateService.getfollowupsections().subscribe((followupsection) => {
      this.followupsections = followupsection['followupCategories'];
      if (this.filteredParams.status == 'generalfollowups') {
        let id = [1, 5];
        this.followctgFilter = this.followupsections.filter((da) =>
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
      this.showSpinner = false;
    });
  }

  setFilteredProperty() {
    this.propertyList1 = this.propertyList.filter((item) => {
      return item.property_info_name
        .toLowerCase()
        .includes(this.propertySearchedName.toLowerCase());
    });
  }

  selecteddaterange = 'today';

  onFilterSelection(section: any, value: any) {
    switch (section) {
      case 'property':
        this.tempFilteredValues.propid = value;
        if (this.tempFilteredValues.propid === '28773') {
          this.mandateService.setHoverState('ranav_group');
        } else {
          this.mandateService.setHoverState('');
        }
        this.getExecutives();
        break;
      case 'stage':
        if (this.tempFilteredValues.status !== 'junkvisits') {
          this.tempFilteredValues.status = '';
        }
        this.tempFilteredValues.stagestatus = '';
        this.tempFilteredValues.stage = value;
        break;
      case 'visitType':
        this.tempFilteredValues.visits = value == 'all' ? '' : value;
        break;
      case 'date':
        const today = new Date();
        const format = (d) => d.toISOString().split('T')[0];

        if (
          value == 'today' ||
          value == 'yesterday' ||
          value == 'lastsevenDay' ||
          value == 'monthAgoDate'
        ) {
          this.dateRange = {
            fromdate: null as Date | null,
            todate: null as Date | null,
          };

          this.tempFilteredValues.isDateFilter =
            value == 'monthAgoDate' ? 'custom' : value;
        } else {
          this.tempFilteredValues.isDateFilter = 'custom';
        }

        if (value == 'today') {
          this.tempFilteredValues.fromDate = format(today);
          this.tempFilteredValues.toDate = format(today);
        } else if (value == 'yesterday') {
          const y = new Date(today);
          y.setDate(today.getDate() - 1);
          this.tempFilteredValues.fromDate = format(y);
          this.tempFilteredValues.toDate = format(y);
        } else if (value == 'lastsevenDay') {
          const today = new Date();
          today.setDate(today.getDate() - 6);
          this.tempFilteredValues.fromDate = today.toISOString().split('T')[0];
          this.tempFilteredValues.toDate = new Date()
            .toISOString()
            .split('T')[0];
        } else if (value == 'monthAgoDate') {
          const monthAgo = new Date(today);
          monthAgo.setDate(monthAgo.getDate() - 30);
          this.tempFilteredValues.fromDate = monthAgo
            .toISOString()
            .split('T')[0];
          this.tempFilteredValues.toDate = today.toISOString().split('T')[0];
          this.tempFilteredValues.isDateFilter = 'monthAgoDate';
        } else if (value === 'custom') {
          this.dashboard_custDate_modal.present();
          return;
        } else if (value == 'customfromDate') {
          if (this.dateRange.fromdate > this.dateRange.todate) {
            this.filteredParams.toDate = '';
            this.dateRange.todate = null;
          } else {
            this.filteredParams.fromDate = ('' + this.dateRange.fromdate).split(
              'T'
            )[0];
            this.filteredParams.toDate = ('' + this.dateRange.todate).split(
              'T'
            )[0];
          }
          this.showFromDateError = false;
          this.dashboard_fromDate_modal?.dismiss();
          return;
        } else if (value == 'customtoDate') {
          this.filteredParams.toDate = ('' + this.dateRange.todate).split(
            'T'
          )[0];
          this.dashboard_toDate_modal?.dismiss();
          return;
        }
        // else if (value == 'customfromDate') {
        //   if (this.dateRange.fromdate > this.dateRange.todate) {
        //     this.filteredParams.toDate = '';
        //     this.dateRange.todate = null;
        //   } else {
        //     this.filteredParams.fromDate = ('' + this.dateRange.fromdate).split(
        //       'T'
        //     )[0];
        //     this.filteredParams.toDate = ('' + this.dateRange.todate).split(
        //       'T'
        //     )[0];
        //     console.log(this.filteredParams);
        //   }

        //   this.showFromDateError = false;
        //   this.dashboard_fromDate_modal?.dismiss();
        //   return;
        // } else if (value === 'custom') {
        //   const from = this.dateRange.fromdate;
        //   const to = this.dateRange.todate;

        //   if (from && to) {
        //     // SIMPLE conversion – no errors, no timezone issues
        //     const fromStr = from.toLocaleDateString('en-CA');
        //     const toStr = to.toLocaleDateString('en-CA');

        //     // assign to filteredParams
        //     this.tempFilteredValues.fromDate = fromStr;
        //     this.tempFilteredValues.toDate = toStr;
        //     this.tempFilteredValues.isDateFilter = 'custom';
        //   }

        //   this.dateRange.fromdate && this.dateRange.todate
        //     ? this.popoverController.dismiss()
        //     : '';
        // } else if (value == 'customfromDate') {
        //   if (this.dateRange.fromdate > this.dateRange.todate) {
        //     this.tempFilteredValues.toDate = '';
        //     this.dateRange.todate = null;
        //   } else if (this.dateRange.fromdate && this.dateRange.todate) {
        //     this.tempFilteredValues.fromDate =
        //       this.dateRange.fromdate.toLocaleDateString('en-CA');
        //     this.tempFilteredValues.toDate =
        //       this.dateRange.todate.toLocaleDateString('en-CA');
        //   }

        //   this.dateRange.fromdate && this.dateRange.todate
        //     ? this.popoverController.dismiss()
        //     : '';

        //   return;
        // }
        break;
      case 'source':
        this.tempFilteredValues.source = value == 'all' ? '' : value;
        break;
      case 'exec':
        // this.tempFilteredValues.executid = value == 'all' ? '' : value;
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
      case 'fromdate':
        const selectedfromDate = new Date(value).getHours();
        const currentfromDate = new Date().getHours();

        if (selectedfromDate === currentfromDate) {
          value.setHours(0, 0, 0, 0);
        }
        const fromdate1 = new Date(value);
        this.nextActionFromDate = fromdate1;
        this.tempFilteredValues.actionfromdate =
          fromdate1.toLocaleDateString('en-CA');
        this.tempFilteredValues.fromTime = fromdate1
          .toTimeString()
          .split(' ')[0];
        this.tempFilteredValues.actiontodate = '';
        this.nextActionToDate = null;
        if (this.tempFilteredValues.actiontodate == '') {
          this.isenabled = false;
        } else {
          this.isenabled = true;
        }
        this.minDate = fromdate1;

        // this.initializeStartEndDate();
        // const fromDate = new Date(value.detail.value);
        // this.tempFilteredValues.actionfromdate = fromDate.toLocaleDateString('en-CA');
        // this.tempFilteredValues.fromTime =  fromDate.toTimeString().split(' ')[0]
        // this.endDateMinDateNextaction =this.tempFilteredValues.actionfromdate
        // if (this.tempFilteredValues.actiontodate.length === 0) {
        //   this.isenabled = false;
        // }
        break;
      case 'todate':
        const selectedtoDate = new Date(value).getHours();
        const currenttoDate = new Date().getHours();

        if (selectedtoDate === currenttoDate) {
          value.setHours(23, 59, 0, 0);
        }
        const todate = new Date(value);
        this.nextActionToDate = todate;
        this.tempFilteredValues.actiontodate =
          todate.toLocaleDateString('en-CA');
        this.tempFilteredValues.toTime = todate.toTimeString().split(' ')[0];
        this.isenabled = true;

        // const toDate = new Date(value.detail.value);
        // const receivedAdjustedDate = new Date(toDate.getTime() - toDate.getTimezoneOffset() * 60000);
        // this.enddate = value.detail.value
        // this.tempFilteredValues.actiontodate = receivedAdjustedDate.toLocaleDateString('en-CA');
        // this.tempFilteredValues.toTime =  toDate.toTimeString().split(' ')[0];
        // this.endDateMinDateNextaction = this.tempFilteredValues.actionfromdate;
        // if (this.tempFilteredValues.actiontodate.length !== 0) {
        //   this.isenabled = true;
        // }
        break;
      default:
        break;
    }

    const { actionfromdate, actiontodate, fromDate, toDate } =
      this.tempFilteredValues || {};

    const isValid = !(
      (actionfromdate && (!actiontodate || actiontodate === '1970-01-01')) ||
      (fromDate && (!toDate || toDate === '1970-01-01'))
    );
    this.isenabled = isValid;
  }

  onStageStatusChange(event) {
    if (
      this.filteredParams.stage === 'NC' &&
      (this.filteredParams.stagestatus === '4' ||
        this.filteredParams.stagestatus === '3')
    ) {
      this.filteredParams.stagestatus = ''; // Default to Followup
    } else {
      this.filteredParams.stagestatus = this.filteredParams.stagestatus;
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

  //to hold date in the formate of yyyy-mm-dd
  todaysdateforcompare: string;
  yesterdaysdateforcompare: string;
  tomorrowsdateforcompare: string;
  currentdateforcompare = new Date(); //to hold the today's date
  dateSevenDaysAgo;
  monthAgoDate;
  dateRange = {
    fromdate: null as Date | null,
    todate: null as Date | null,
  };
  optionsRange: CalendarComponentOptions = {
    pickMode: 'range',
    from: new Date(1990, 0, 1),
    to: new Date(),
  };
  // to close date picker
  toCloseDatePicker() {
    this.popoverController.dismiss();
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
  ngAfterViewChecked() {
    this.scrollToSelectedItem();
  }

  @ViewChild('scrollContainer', { read: ElementRef })
  scrollContainer: ElementRef;

  scrollToSelectedItem() {
    const container = this.scrollContainer?.nativeElement;
    if (container) {
      if (this.selectedOption == 'generalfollowups') {
        var index = 0;
      } else if (this.selectedOption == 'NC') {
        var index = 1;
      } else if (this.selectedOption == 'USV') {
        var index = 2;
      } else if (this.selectedOption == 'RSV') {
        var index = 3;
      } else if (this.selectedOption == 'Final Negotiation') {
        var index = 4;
      } else if (this.selectedOption == 'inactive') {
        var index = 7;
      } else if (this.selectedOption == 'junkleads') {
        var index = 8;
      } else if (this.selectedOption == 'junkvisits') {
        var index = 9;
      } else if (this.selectedOption == 'DCRR') {
        var index = 5;
      } else if (this.selectedOption == 'Closing Request Rejected') {
        var index = 5;
      } else if (this.selectedOption == 'Deal Closed') {
        var index = 6;
      }

      if (index !== -1) {
        const selectedButton = container.children[index];
        if (selectedButton) {
          // Scroll to the selected element
          container.scrollLeft =
            selectedButton.offsetLeft -
            container.clientWidth / 2 +
            selectedButton.clientWidth / 2;
        }
      }
    }
    this.changeDetectorRef.detectChanges(); // Ensure view updates are reflected
  }

  sourceSearchTerm;
  sourceList1;
  sourceList;
  //fetch sourcelist
  getsourcelist() {
    this._sharedservice.sourcelist().subscribe((sources) => {
      this.sourceList = sources['Sources'];
      this.sourceList1 = this.sourceList;
    });
  }
  setFilteredSource() {
    this.sourceList1 = this.sourceList.filter((item) => {
      return item.source
        .toLowerCase()
        .includes(this.sourceSearchTerm.toLowerCase());
    });
  }

  @ViewChild('sourceScrollContent', { static: false })
  sourceScrollContent!: IonContent;
  async scrollToSelectedSource(): Promise<void> {
    const source = this.tempFilteredValues.source;
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

  executiveSearchedName;
  mandateExecutives1;
  mandateexecutives;
  setFilteredExecutive() {
    this.mandateExecutives1 = this.mandateexecutives.filter((item) => {
      return item.name
        .toLowerCase()
        .includes(this.executiveSearchedName.toLowerCase());
    });
  }

  showSpinner1 = false;
  // to get active executives
  toggleActiveExecutive(event) {
    this.showSpinner1 = true;
    if (event.detail.checked) {
      this.filteredParams.active = '1';
      this.getExecutives();
    } else {
      this.filteredParams.active = '2';
      this.getExecutives();
    }
  }

  // to get executive names
  getExecutives() {
    if (localStorage.getItem('RoleType') == '1') {
      var param = {
        propid: localStorage.getItem('PropertyId'),
        team: '2',
      };
    } else {
      var param = {
        propid: this.filteredParams.propid,
        team: this.filteredParams.team,
      };
    }

    const teamlead =
      localStorage.getItem('RoleType') == '1'
        ? this.localStorage.getItem('UserId')
        : '';
    this.mandateService
      .fetchmandateexecutives1(
        param.propid,
        param.team,
        this.filteredParams.active,
        '',
        teamlead
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
          this.showSpinner1 = false;
        } else {
          this.showSpinner1 = false;
        }
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
    this.sliding.close();
  }

  // isOverAnHourOld(apiDate: string): boolean {
  //   const apiDateObj = new Date(apiDate);
  //   const currentTime = new Date();
  //   const timeDiff = currentTime.getTime() - apiDateObj.getTime();
  //   const hoursDiff = timeDiff / (1000 * 60 * 60);
  //   return hoursDiff > 2;
  // }
  page = 1;
  navigateToDetailsPage(leadId, execid, lead) {
    this._sharedservice.enquiries = this.leads_detail;
    this._sharedservice.page = this.page;
    this._sharedservice.hasState = true;
    let propid;
    if (lead.propertyname == 'Ranav Tranquil Haven') {
      propid = '28773';
    } else if (lead.propertyname == 'GR Sitara') {
      propid = '16793';
    } else if (lead.propertyname == 'GR Samskruthi') {
      propid = '1830';
    }
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

  loadData(event) {
    if (
      (this.filteredParams.status === 'generalfollowups' &&
        this.leads_detail.length < this.activityReport_count.gf) ||
      (this.filteredParams.status === 'USV' &&
        this.leads_detail.length < this.activityReport_count.usv) ||
      (this.filteredParams.status === 'RSV' &&
        this.leads_detail.length < this.activityReport_count.rsv) ||
      (this.filteredParams.status === 'Final Negotiation' &&
        this.leads_detail.length < this.activityReport_count.fn) ||
      (this.filteredParams.status === 'DCRR' &&
        this.leads_detail.length < this.activityReport_count.dcrr) ||
      (this.filteredParams.status === 'NC' &&
        this.leads_detail.length < this.activityReport_count.nc) ||
      (this.filteredParams.status === 'Deal Closed' &&
        this.leads_detail.length < this.activityReport_count.dealClosed) ||
      (this.filteredParams.status === 'inactive' &&
        this.leads_detail.length < this.activityReport_count.inactive) ||
      (this.filteredParams.status === 'junkleads' &&
        this.leads_detail.length < this.activityReport_count.junkLeads) ||
      (this.filteredParams.status === 'junkvisits' &&
        this.leads_detail.length < this.activityReport_count.junkVisits)
    ) {
      this.get_Activities_Data(true).then(() => {
        event.target.complete();
      });
    } else {
      event.target.disabled = true;
    }
  }

  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }
  onBack() {
    this._location.back();
  }

  get fromDateTime(): string {
    return `${this.filteredParams.actionfromdate || ''}, ${
      this.filteredParams.fromTime || ''
    }`;
  }

  get toDateTime(): string {
    return `${this.filteredParams.actiontodate || ''}, ${
      this.filteredParams.toTime || ''
    }`;
  }

  onHtype(htype) {
    if (htype == 'mandate') {
      this.router.navigate(['mymandatereports'], {
        queryParams: {
          htype: htype,
        },
        queryParamsHandling: 'merge',
      });
    } else {
      this.router.navigate(['myretailreports'], {
        queryParams: {
          htype: htype,
        },
        queryParamsHandling: 'merge',
      });
    }
  }

  onBackButton() {
    this.resetInfiniteScroll();
    this._location.back();
  }
  openEndMenu() {
    this._sharedservice.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  propertyPriceList;
  getPriceList() {
    this.mandateService.getPriceList().subscribe((resp) => {
      if (resp['status'] == 'True') {
        this.propertyPriceList = resp['result'];
        this.propertyPriceList.forEach((element) => {
          if (element.PropName === 'GR Sitara') {
            this.grSitaraPropertyInfo = element.PropInfo;
          } else if (element.PropName === 'GR Samskruthi') {
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
    // const phoneNumber = ' 7090080306';
    if (lead.propertyname === 'GR Sitara') {
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
    } else if (lead.propertyname === 'GR Samskruthi') {
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

  daterange(data) {
    if (data == 'dateRange') {
      return `${this.tempFilteredValues.fromDate} to ${this.tempFilteredValues.toDate}`;
    } else if (data == 'from' && this.tempFilteredValues.actionfromdate != '') {
      return `${this.tempFilteredValues.actionfromdate} , ${this.tempFilteredValues.fromTime}`;
    } else if (data == 'to' && this.tempFilteredValues.actiontodate != '') {
      return `${this.tempFilteredValues.actiontodate} , ${this.tempFilteredValues.toTime}`;
    } else {
      return data == 'from'
        ? 'Select from date'
        : data == 'to'
        ? 'Select to date'
        : `${'Select Date Range'}`;
    }
  }

  settingSelectedDate() {
    if (this.tempFilteredValues.fromDate != '') {
      const fromDate = new Date(this.tempFilteredValues.fromDate);
      const toDate = new Date(this.tempFilteredValues.toDate);
      // this.dateRange = [fromDate, toDate];
    } else if (this.tempFilteredValues.fromDate == '') {
      this.dateRange = null;
    }
  }

  confirmSelection() {
    this.filteredParams = { ...this.tempFilteredValues };
    this.filterModal.dismiss();
    this.addQueryParam();
  }

  nextActionFromDate = null;
  nextActionToDate = null;
  warningMessage() {
    if (this.tempFilteredValues.fromDate == '') {
      Swal.fire({
        title: 'Please select a From Date',
        text: 'From Date is required to apply the filter',
        confirmButtonText: 'OK',
        heightAuto: false,
        allowOutsideClick: false,
      }).then((result) => {});
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

  dateFilter(dateType) {
    // if (dateType == 'today') {
    //   this.selecteddaterange = dateType;
    //   this.filteredParams.fromDate =
    //     this.currentdateforcompare.toLocaleDateString('en-CA');
    //   this.filteredParams.toDate =
    //     this.currentdateforcompare.toLocaleDateString('en-CA');
    // } else if (dateType == 'yesterday') {
    //   this.selecteddaterange = dateType;
    //   this.filteredParams.fromDate = this.yesterdaysdateforcompare;
    //   this.filteredParams.toDate = this.yesterdaysdateforcompare;
    // } else if (dateType == 'custom') {
    //   // this.selecteddaterange = 'custom';
    //   // if (this.dateRange?.length === 2 && this.dateRange[1] != null) {
    //   //   const start = formatDate(this.dateRange[0], 'yyyy-MM-dd', 'en-US');
    //   //   const end = formatDate(this.dateRange[1], 'yyyy-MM-dd', 'en-US');
    //   //   this.filteredParams.fromDate = start;
    //   //   this.filteredParams.toDate = end != '1970-01-01' ? end : '';
    //   //   this.isenabled =
    //   //     this.filteredParams.toDate != '' &&
    //   //     this.filteredParams.toDate != '1970-01-01'
    //   //       ? true
    //   //       : false;
    //   // }
    // } else if (dateType == '7dateAge') {
    //   this.selecteddaterange = dateType;
    //   this.currentdateforcompare = new Date();
    //   var curmonth = this.currentdateforcompare.getMonth() + 1;
    //   var curmonthwithzero = curmonth.toString().padStart(2, '0');
    //   var curday = this.currentdateforcompare.getDate();
    //   var curdaywithzero = curday.toString().padStart(2, '0');
    //   var todaysdate =
    //     this.currentdateforcompare.getFullYear() +
    //     '-' +
    //     curmonthwithzero +
    //     '-' +
    //     curdaywithzero;
    //   //getting the date of the -6days
    //   var sevendaysago = new Date(this.currentdateforcompare);
    //   sevendaysago.setDate(sevendaysago.getDate() - 6);
    //   var sevendaysmonth = sevendaysago.getMonth() + 1;
    //   var sevendaysmonthwithzero = sevendaysmonth.toString().padStart(2, '0');
    //   var sevendays = sevendaysago.getDate();
    //   var sevendayswithzero = sevendays.toString().padStart(2, '0');
    //   var sevendaysdateforcompare =
    //     sevendaysago.getFullYear() +
    //     '-' +
    //     sevendaysmonthwithzero +
    //     '-' +
    //     sevendayswithzero;

    //   this.filteredParams.fromDate = sevendaysdateforcompare;
    //   this.filteredParams.toDate = todaysdate;
    //   if (this.filteredParams.fromDate != '') {
    //     const fromDate = new Date(this.filteredParams.fromDate);
    //     const toDate = new Date(this.filteredParams.toDate);
    //     // this.dateRange = [fromDate, toDate];
    //   } else if (this.filteredParams.fromDate == '') {
    //     this.dateRange = null;
    //   }
    // }
    const today = new Date();
    const format = (d) => d.toISOString().split('T')[0];

    if (
      dateType != 'custom' &&
      dateType != 'customfromDate' &&
      dateType != 'customtoDate'
    ) {
      this.dateRange = {
        fromdate: null as Date | null,
        todate: null as Date | null,
      };
      this.filteredParams.isDateFilter = dateType;
    }

    if (dateType === 'today') {
      this.filteredParams.fromDate = format(today);
      this.filteredParams.toDate = format(today);
    } else if (dateType === 'yesterday') {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      this.filteredParams.fromDate = format(y);
      this.filteredParams.toDate = format(y);
    } else if (dateType === 'lastsevenDay') {
      const from = new Date(today);
      from.setDate(from.getDate() - 6);
      this.filteredParams.fromDate = format(from);
      this.filteredParams.toDate = format(today);
    } else if (dateType === 'custom') {
      this.filteredParams.isDateFilter = dateType;
      this.dashboard_custDate_modal.present();
      return;
    } else if (dateType == 'customfromDate') {
      this.filteredParams.isDateFilter = 'custom';
      if (this.dateRange.fromdate > this.dateRange.todate) {
        this.filteredParams.toDate = '';
        this.dateRange.todate = null;
      } else {
        this.filteredParams.fromDate = ('' + this.dateRange.fromdate).split(
          'T'
        )[0];
        this.filteredParams.toDate = ('' + this.dateRange.todate).split('T')[0];
      }
      this.showFromDateError = false;
      this.dashboard_fromDate_modal?.dismiss();
      return;
    } else if (dateType == 'customtoDate') {
      this.filteredParams.isDateFilter = 'custom';
      this.filteredParams.toDate = ('' + this.dateRange.todate).split('T')[0];
      this.dashboard_toDate_modal?.dismiss();
      return;
    }
    this.addQueryParam();
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
    this.addQueryParam();
  }

  canScroll;
  @ViewChild('mainscrollContainer', { static: false }) content: IonContent;
  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.content.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;

      this.canScroll = scrollHeight > clientHeight + 10; // ADD A BUFFER of 10px

      if (!this.canScroll) {
        this._sharedservice.isBottom = false;
      } else {
        this._sharedservice.isBottom =
          scrollTop + clientHeight >= scrollHeight - 100;
      }
    });
  }

  @ViewChild('dashboard_custDate_modal') dashboard_custDate_modal: IonModal;
  @ViewChild('dashboard_fromDate_modal') dashboard_fromDate_modal: IonModal;
  @ViewChild('dashboard_toDate_modal') dashboard_toDate_modal: IonModal;
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
      this.filteredParams.isDateFilter = 'today';
      this.filteredParams.fromDate = new Date().toLocaleDateString('en-CA');
      this.filteredParams.toDate = new Date().toLocaleDateString('en-CA');
      this.addQueryParam();
    }
  }
}

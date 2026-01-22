import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, MenuController } from '@ionic/angular';
import { catchError, forkJoin, of } from 'rxjs';
import { MandateService } from 'src/app/mandate-service.service';
import { RetailServiceService } from 'src/app/retail-service.service';
import { formatDate, Location } from '@angular/common';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-mandate-plans',
  templateUrl: './mandate-plans.component.html',
  styleUrls: ['./mandate-plans.component.scss'],
})
export class MandatePlansComponent implements OnInit {
  @ViewChild('filterModal') filterModal;
  @ViewChild('sourceScrollContent', { static: false })
  propScrollContent!: IonContent;
  isAdmin = false;
  isLeftFilterActive = 'fixedProperties';
  count = 0;
  leads_detail = [];
  showSpinner = true;
  propertlist;
  propertlist1;
  fixedPropSearchTerm;
  executive;
  executive1;
  executiveSearchedName;

  localStorage = localStorage;
  Week_plans_counts = {
    weekend: '',
    weekdays: '',
    usv: '',
    sv: '',
    rsv: '',
    fn: '',
  };

  filteredParams = {
    fromDate: '',
    toDate: '',
    statuss: '',
    executid:
      localStorage.getItem('Role') === '1'
        ? []
        : localStorage.getItem('UserId'),
    loginid: localStorage.getItem('UserId'),
    teamlead:
      localStorage.getItem('RoleType') == '1'
        ? localStorage.getItem('UserId')
        : '',
    propid: '',
    visits: '',
    stage: '',
    source: '',
    htype: '',
    stagestatus: '',
    loginuser: '',
    team: '',
    active: '1',
    plan: '',
    limit: 0,
    limitrows: 5,
  };
  leadId: any;
  execid: any;
  isOnCallDetailsPage: any = false;

  constructor(
    private mandateService: MandateService,
    private _sharedservice: SharedService,
    private menuCtrl: MenuController,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private location: Location,
    private ngZone: NgZone
  ) {
    this.initializeStartEndDate();
  }
  isRM = false;
  page = 1;
  ngOnInit() {
    this.activeRoute.queryParams.subscribe((param) => {
      this.isRM =
        this.localStorage.getItem('Role') == '50001' ||
        this.localStorage.getItem('Role') == '50002' ||
        this.localStorage.getItem('Role') == '50009' ||
        this.localStorage.getItem('Role') == '50010';
      this.leads_detail = [];
      this.leadId = param['leadId'];
      this.execid = param['execid'];
      this.isAdmin = this.localStorage.getItem('Role') == '1';
      this.getTodayYesterdayTomorrowDate();
      this.getLastWeekendDates();
      this.getPropertyList();
      this.getExecutives();
      this.getQueryParam();

      this.getPriceList();
      this.settingSelectedDate();

      if (param['isOnCallDetailsPage'] == 'true') {
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
        this.getWeek_plans_counts();
      }
    });
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

    if (this.filteredParams.stage == 'SV') {
      this.filteredParams.stage = 'USV';
    }

    // Example condition: enable only weekends
    if (this.filteredParams.plan === '1') {
      this.disabledDays = [0, 6]; // Sunday and Saturday
    }

    // Example: enable only weekdays
    else if (this.filteredParams.plan === '2') {
      this.disabledDays = [1, 2, 3, 4, 5]; // Monday to Friday
    }

    (this.filteredParams.executid =
      localStorage.getItem('Role') === '1'
        ? this.filteredParams.executid
        : localStorage.getItem('UserId')),
      (this.tempFilteredValues = { ...this.filteredParams });
  }

  getWeek_plans_counts() {
    this.showSpinner = true;
    const requests = [];

    //GET THE TOTAL COUNT OF WEEKEND AND WEEKDAYS
    const plan = ['1', '2'];

    plan.forEach((plan) => {
      const params = { ...this.filteredParams, plan: plan, stage: '' };
      requests.push(
        this.mandateService.planLeadsCount(params).pipe(
          catchError((error) => {
            return of(null);
          })
        )
      );
    });

    //GET THE COUNT OF ALL STAGES
    const stage = ['USV', 'SV', 'RSV', 'Final Negotiation'];
    stage.forEach((stage) => {
      const params = {
        ...this.filteredParams,
        stage: stage,
        fromDate:
          this.filteredParams.plan == '2'
            ? this.filteredParams.fromDate != ''
              ? this.filteredParams.fromDate
              : this.getUpcomingWeekendDates().fromdate
            : this.filteredParams.plan == '1'
            ? this.filteredParams.fromDate != ''
              ? this.filteredParams.fromDate
              : this.getCurrentWeekdays().fromdate
            : '',
        toDate:
          this.filteredParams.plan == '2'
            ? this.filteredParams.toDate != ''
              ? this.filteredParams.toDate
              : this.getUpcomingWeekendDates().todate
            : this.filteredParams.plan == '1'
            ? this.filteredParams.toDate != ''
              ? this.filteredParams.toDate
              : this.getCurrentWeekdays().todate
            : '',
      };
      requests.push(
        this.mandateService.planLeadsCount(params).pipe(
          catchError((error) => {
            console.error(`Error fetching data for status: ${stage}`, error);
            return of(null);
          })
        )
      );
    });

    forkJoin(requests).subscribe((results) => {
      results.forEach((assgnleads, index) => {
        switch (index) {
          case 0:
            this.Week_plans_counts.weekdays =
              assgnleads['result'][0].uniquee_count;
            break;
          case 1:
            this.Week_plans_counts.weekend =
              assgnleads['result'][0].uniquee_count;
            break;
          case 2:
            this.Week_plans_counts.usv = assgnleads['result'][0].uniquee_count;
            break;
          case 3:
            this.Week_plans_counts.sv = assgnleads['result'][0].uniquee_count;
            break;
          case 4:
            this.Week_plans_counts.rsv = assgnleads['result'][0].uniquee_count;
            break;
          case 5:
            this.Week_plans_counts.fn = assgnleads['result'][0].uniquee_count;
            break;
        }
      });
      this.getWeekPlanLeadDetails(false);
    });
  }
  lead_details_count;
  lead_details1;
  showInfiniteScroll = true;
  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }

  // GET WEEK PLAN LEAD DETAILS
  getWeekPlanLeadDetails(isLoadmore) {
    this.count = isLoadmore ? this.count + 5 : 0;
    this.filteredParams.limit = this.count;

    return new Promise((resolve, reject) => {
      this.mandateService.planLeads(this.filteredParams).subscribe(
        (response) => {
          this.ngZone.run(() => {
            if (response['status'] === 'True') {
              this.showSpinner = false;
              // this.lead_details1 = isLoadmore ? this.lead_details1.concat(response['result']) : response['result'];
              // this.lead_details_count = this.lead_details1.length;

              this.leads_detail = isLoadmore
                ? this.leads_detail.concat(response['result'])
                : response['result'];

              this.leads_detail = this.leads_detail.reduce(
                (result, current) => {
                  const existingIndex = result.findIndex(
                    (item) =>
                      item.LeadID === current.LeadID &&
                      item.ExecId === current.ExecId
                  );
                  if (existingIndex !== -1) {
                    // If a duplicate exists, replace it only if the current item's leadstagestatus is "3"
                    if (current.leadstagestatus === '3') {
                      result[existingIndex] = current;
                    }
                  } else {
                    // If no duplicate exists, add the current item
                    result.push(current);
                  }
                  return result;
                },
                []
              );

              // let callerleads = response['result'];

              // let filterDoneData,filterFixdata;
              // filterDoneData = callerleads.filter((lead)=>{ return lead.leadstagestatus == '3';});
              // filterFixdata = callerleads.filter((lead)=>{ return (lead.leadstagestatus == '1' || lead.leadstagestatus == '2')});

              // let removedtheFilteredFixData = filterFixdata.filter((lead) => {
              //   return !filterDoneData.some((led) => lead.LeadID === led.LeadID);
              // });
              // let leads = removedtheFilteredFixData.concat(filterDoneData);

              // this.leads_detail = isLoadmore ? this.leads_detail.concat(leads) : leads;
              resolve(true);
            } else {
              this.showSpinner = false;
              resolve(false);
            }
          });
        },
        (error) => {
          this.showSpinner = false;
          resolve(false);
        }
      );
    });
  }

  //TO GET WEEK END DATES
  getUpcomingWeekendDates() {
    const today = new Date();
    const currentDayOfWeek = today.getDay();

    let nextSaturday = new Date(today);
    let nextSunday = new Date(today);

    // If today is Saturday or Sunday, use today's date for that day
    if (currentDayOfWeek === 6) {
      // If today is Saturday
      nextSaturday = today;
      const daysUntilSunday = 1;
      nextSunday.setDate(today.getDate() + daysUntilSunday);
    } else if (currentDayOfWeek === 0) {
      // If today is Sunday
      nextSunday = today;
      const daysUntilPreviousSaturday = -1;
      nextSaturday.setDate(today.getDate() + daysUntilPreviousSaturday);
    } else {
      // Calculate the days until the next Saturday and Sunday
      const daysUntilSaturday = 6 - currentDayOfWeek;
      const daysUntilSunday = 7 - currentDayOfWeek;

      nextSaturday.setDate(today.getDate() + daysUntilSaturday);
      nextSunday.setDate(today.getDate() + daysUntilSunday);
    }

    this.filteredParams.fromDate = nextSaturday.toLocaleDateString('en-CA');
    this.filteredParams.toDate = nextSunday.toLocaleDateString('en-CA');

    return {
      fromdate: nextSaturday.toLocaleDateString('en-CA'),
      todate: nextSunday.toLocaleDateString('en-CA'),
    };
  }

  // TO GET WEEKDAYS DATE
  getCurrentWeekdays() {
    let currentDate = new Date();
    let dayOfWeek = currentDate.getDay();
    let monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() - dayOfWeek + 1);

    let friday = new Date(currentDate);
    friday.setDate(currentDate.getDate() - dayOfWeek + 5);

    this.filteredParams.fromDate = monday.toLocaleDateString('en-CA');
    this.filteredParams.toDate = friday.toLocaleDateString('en-CA');

    return {
      fromdate: monday.toLocaleDateString('en-CA'),
      todate: friday.toLocaleDateString('en-CA'),
    };
  }

  //CALLED WHEN CLICK ON WEEKEND AND WEEKDAYS TAB
  onTabPlan(plan) {
    if (plan == 'weekends') {
      this.filteredParams.plan = '2';
      this.getUpcomingWeekendDates();
    } else if (plan == 'weekdays') {
      this.filteredParams.plan = '1';
      this.getCurrentWeekdays();
    }
    this.addQueryParams();
  }

  //CALLED WHEN CLLICK ON STAGE BUTTONS
  onStage(stage) {
    this.filteredParams.stage = stage;
    this.addQueryParams();
  }

  // CALLED WHEN CLICK ON LEFT SIDE HEADING IN FILTER SECTION
  onFilterValues(value) {
    if (value == 'fixedPropSection') {
      this.scrollToSelectedProp();
    }
    this.isLeftFilterActive = value;
  }

  // TO DISPLAY FILTER SECTION
  navigateToFilter() {
    this.scrollToSelectedProp();
    if ('ranavPropId' in localStorage && this.isAdmin) {
      this.isLeftFilterActive = 'ExecSection';
    } else if ('ranavPropId' in localStorage && !this.isAdmin) {
      this.isLeftFilterActive = 'visitType';
    } else {
      this.isLeftFilterActive = 'fixedPropSection';
    }
    this.tempFilteredValues = { ...this.filteredParams };
    this.filterModal.present();
  }

  //TO GET PROPERTY LIST
  getPropertyList() {
    this.mandateService.getmandateprojects().subscribe((response) => {
      // this.propertlist = response['Properties'];
      // this.propertlist1 = this.propertlist;

      if (response['status'] == 'True') {
        if (localStorage.getItem('RoleType') == '1') {
          const propIdsArray = this.localStorage
            .getItem('PropertyId')
            .split(',');
          this.propertlist = response['Properties'].filter((prop) => {
            return propIdsArray.includes(prop.property_idfk);
          });
          this.propertlist1 = this.propertlist;
        } else {
          this.propertlist = response['Properties'];
          this.propertlist1 = this.propertlist;
        }
      } else {
      }
    });
  }

  //Called when we search property
  setFilteredProperty() {
    this.propertlist1 = this.propertlist.filter((item) => {
      return item.name
        .toLowerCase()
        .includes(this.fixedPropSearchTerm.toLowerCase());
    });
  }

  //To highlight the selected property
  async scrollToSelectedProp(): Promise<void> {
    const propid = this.filteredParams.propid;
    if (!propid) {
      return;
    }
    const elementId = `${propid}`;
    setTimeout(() => {
      const selectedElement = document.getElementById(elementId);
      if (selectedElement) {
        this.propScrollContent.scrollToPoint(0, selectedElement.offsetTop, 500);
      } else {
        console.log('Element not found2:', elementId);
      }
    }, 1000);
  }

  //to get executive name
  getExecutives() {
    // if(this.localStorage.getItem('RoleType') === '1'){
    //   this.filteredParams.team = '2';
    //   this.filteredParams.propid = this.localStorage.getItem('PropertyId')
    // }else{
    //   this.filteredParams.team = this.filteredParams.team;
    //   this.filteredParams.propid = this.filteredParams.propid
    // }

    const teamlead =
      localStorage.getItem('RoleType') === '1'
        ? this.localStorage.getItem('UserId')
        : '';
    const filterParam = {
      ...this.filteredParams,
      team: localStorage.getItem('RoleType') === '1' ? '2' : '',
      propid:
        localStorage.getItem('RoleType') === '1'
          ? localStorage.getItem('PropertyId')
          : '',
    };

    this.mandateService
      .fetchmandateexecutives1(
        filterParam.propid,
        filterParam.team,
        '',
        '',
        teamlead
      )
      .subscribe((response) => {
        this.executive = response['mandateexecutives'];
        this.executive1 = this.executive;
      });
  }

  setFilteredExecutive() {
    this.executive1 = this.executive.filter((item) => {
      return item.ExecName.toLowerCase().includes(
        this.executiveSearchedName.toLowerCase()
      );
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

  isWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay();
    return this.filteredParams.plan == '1'
      ? utcDay !== 0 && utcDay !== 6
      : utcDay === 6;
  };

  isSaturday = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay(); // Get the day of the week (0 for Sunday, 6 for Saturday)

    return utcDay === 6; // Enable only Saturdays
  };

  isSunday = (dateString: string) => {
    const date = new Date(dateString);
    const utcDay = date.getUTCDay(); // Get the day of the week (0 for Sunday, 6 for Saturday)

    return utcDay === 0; // Enable only Sundays
  };

  getLastWeekendDates() {
    const today = new Date();
    const dayOfWeek = today.getDay();

    const daysToLastSunday = dayOfWeek === 0 ? 7 : dayOfWeek;
    const daysToLastSaturday = daysToLastSunday + 1;

    const lastSaturday = new Date(today);
    lastSaturday.setDate(today.getDate() - daysToLastSaturday);

    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - daysToLastSunday);

    const lastSaturday1 = lastSaturday.toLocaleDateString('en-CA');
    const lastSunday1 = lastSunday.toLocaleDateString('en-CA');

    return { lastSaturday1, lastSunday1 };
  }

  onFilterSelection(value, data) {
    switch (value) {
      case 'fixedProp':
        this.tempFilteredValues.propid = data;
        break;
      case 'executive':
        if (!Array.isArray(this.tempFilteredValues.executid)) {
          this.tempFilteredValues.executid = [];
        }

        if (value === 'all') {
          this.tempFilteredValues.executid = [];
        } else {
          const index = this.tempFilteredValues.executid.indexOf(data);
          if (index > -1) {
            // already selected → remove it
            this.tempFilteredValues.executid.splice(index, 1);
          } else {
            // not selected → add it
            this.tempFilteredValues.executid.push(data);
          }
        }
        this.tempFilteredValues.executid.join(',');
        break;
      case 'visitType':
        this.tempFilteredValues.visits = data == 'all' ? '' : data;
        break;
      case 'lastweekend':
        this.tempFilteredValues.fromDate =
          this.getLastWeekendDates().lastSaturday1;
        this.tempFilteredValues.toDate = this.getLastWeekendDates().lastSunday1;
        break;
      case 'dateRange':
        if (this.dateRange?.length === 2 && this.dateRange[1] != null) {
          const start = formatDate(this.dateRange[0], 'yyyy-MM-dd', 'en-US');
          const end = formatDate(this.dateRange[1], 'yyyy-MM-dd', 'en-US');
          this.tempFilteredValues.fromDate = start;
          this.tempFilteredValues.toDate = end != '1970-01-01' ? end : '';
          this.isenabled =
            this.tempFilteredValues.toDate != '' &&
            this.tempFilteredValues.fromDate != '1970-01-01'
              ? true
              : false;
        }
        console.log(this.tempFilteredValues.fromDate);
        console.log(this.tempFilteredValues.toDate);
        break;
      case 'fromDate':
        this.initializeStartEndDate();
        const fromDate = new Date(data.detail.value);
        this.tempFilteredValues.fromDate = fromDate.toLocaleDateString('en-CA');
        this.endDateMinDate = this.tempFilteredValues.fromDate;
        if (this.tempFilteredValues.fromDate.length === 0) {
          this.isenabled = false;
        }
        break;
      case 'toDate':
        const todate = new Date(data.detail.value);
        const receivedAdjustedDate1 = new Date(
          todate.getTime() - todate.getTimezoneOffset() * 60000
        );
        this.enddate = data.detail.value;
        this.tempFilteredValues.toDate =
          receivedAdjustedDate1.toLocaleDateString('en-CA');
        this.endDateMinDate = this.tempFilteredValues.fromDate;
        if (this.tempFilteredValues.toDate.length !== 0) {
          this.isenabled = true;
        }
        break;
    }
    // this.addQueryParams();
  }
  tempFilteredValues;

  reset_filter() {
    this.tempFilteredValues = {
      fromDate:
        this.filteredParams.plan == '2'
          ? this.getUpcomingWeekendDates().fromdate
          : this.getCurrentWeekdays().fromdate,
      toDate:
        this.filteredParams.plan == '2'
          ? this.getUpcomingWeekendDates().todate
          : this.getCurrentWeekdays().todate,
      statuss: '',
      executid:
        localStorage.getItem('Role') === '1'
          ? ''
          : localStorage.getItem('UserId'),
      loginid: localStorage.getItem('UserId'),
      propid: '',
      visits: '',
      stage: this.filteredParams.stage,
      source: '',
      stagestatus: '',
      loginuser: '',
      active: '1',
      team: '',
      htype: this.filteredParams.htype,
      plan: this.filteredParams.plan,
      limit: 0,
      limitrows: 5,
    };

    this.initializeStartEndDate();
    this.dateRange = null;
    // this.addQueryParams()
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
        htype: this.filteredParams.htype,
        propid: propid,
        status: 'info',
        teamlead:
          localStorage.getItem('RoleType') == '1'
            ? localStorage.getItem('UserId')
            : null,
      },
    });
  }

  onBackbutton() {
    this.resetInfiniteScroll();
    this.location.back();
  }

  loadData(event) {
    if (
      (this.filteredParams.plan == '2' &&
        this.filteredParams.stage == 'USV' &&
        this.leads_detail.length < Number(this.Week_plans_counts.usv)) ||
      (this.filteredParams.stage == 'RSV' &&
        this.leads_detail.length < Number(this.Week_plans_counts.rsv)) ||
      (this.filteredParams.stage == 'SV' &&
        this.leads_detail.length < Number(this.Week_plans_counts.sv)) ||
      (this.filteredParams.stage == 'Final Negotiation' &&
        this.leads_detail.length < Number(this.Week_plans_counts.fn)) ||
      (this.filteredParams.plan == '1' &&
        this.filteredParams.stage == 'USV' &&
        this.leads_detail.length < Number(this.Week_plans_counts.usv)) ||
      (this.filteredParams.stage == 'RSV' &&
        this.leads_detail.length < Number(this.Week_plans_counts.rsv)) ||
      (this.filteredParams.stage == 'SV' &&
        this.leads_detail.length < Number(this.Week_plans_counts.sv)) ||
      (this.filteredParams.stage == 'Final Negotiation' &&
        this.leads_detail.length < Number(this.Week_plans_counts.fn))
    ) {
      this.getWeekPlanLeadDetails(true).then(() => {
        event.target.complete();
      });
    } else {
      event.target.disabled = true;
    }
  }
  startdate;
  enddate;
  minDate;
  maxDate;
  endDateMinDate;
  isenabled = true;
  // to initialize the start and end date to date picker
  initializeStartEndDate() {
    // Initialize start and end dates with default values
    this.startdate = new Date().toISOString();
    this.enddate = new Date().toISOString();

    // Set the minimum and maximum dates
    this.minDate = '2000-01-01';
    this.maxDate = new Date().toISOString();

    // Set initial min date for end date picker
    this.endDateMinDate = this.startdate;
  }

  getLastWeekDays() {
    const today = new Date();
    const dayOfWeek = today.getDay();

    // Calculate the start of the previous week (last Monday)
    const daysToLastMonday = dayOfWeek === 0 ? 7 + 6 : dayOfWeek + 6;
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysToLastMonday);

    // Calculate the last Friday based on last Monday
    const lastFriday = new Date(lastMonday);
    lastFriday.setDate(lastMonday.getDate() + 4); // Friday is 4 days after Monday

    // Format the dates as YYYY-MM-DD
    const lastMondayStr = lastMonday.toLocaleDateString('en-CA');
    const lastFridayStr = lastFriday.toLocaleDateString('en-CA');

    return { lastMonday: lastMondayStr, lastFriday: lastFridayStr };
  }

  //to hold date in the formate of yyyy-mm-dd
  todaysdateforcompare: string;
  yesterdaysdateforcompare: string;
  tomorrowsdateforcompare: string;
  currentdateforcompare = new Date(); //to hold the today's date
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

  onHtype(htype) {
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
    if (htype == 'mandate') {
      this.router.navigate(['mandate-plans'], {
        queryParams,
        queryParamsHandling: 'merge',
      });
    } else {
      this.router.navigate(['retail-plans'], {
        queryParams,
        queryParamsHandling: 'merge',
      });
    }
  }
  openEndMenu() {
    this._sharedservice.isMenuOpen = true;
    this.menuCtrl.open('end');
  }
  onBackButton() {
    this.resetInfiniteScroll();
    this.location.back();
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
    // const phoneNumber = '917090080306';
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

  disabledDays: number[] = [];
  dateRange;
  daterange(data) {
    if (data == 'dateRange' && this.tempFilteredValues.fromDate != '') {
      return `${this.tempFilteredValues.fromDate} to ${this.tempFilteredValues.toDate}`;
    } else {
      return `${'Select Date Range'}`;
    }
  }

  settingSelectedDate() {
    if (this.filteredParams.fromDate != '') {
      const fromDate = new Date(this.filteredParams.fromDate);
      const toDate = new Date(this.filteredParams.toDate);
      this.dateRange = [fromDate, toDate];
    } else if (this.filteredParams.fromDate == '') {
      this.dateRange = null;
    }
  }

  confirmSelection() {
    this.filteredParams = { ...this.tempFilteredValues };
    this.filterModal.dismiss();
    this.addQueryParams();
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
    this.addQueryParams();
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

      this.canScroll = scrollHeight > clientHeight + 10; // ADD A BUFFER of 10px

      if (!this.canScroll) {
        this._sharedservice.isBottom = false;
      } else {
        this._sharedservice.isBottom =
          scrollTop + clientHeight >= scrollHeight - 100;
      }
    });
  }
}

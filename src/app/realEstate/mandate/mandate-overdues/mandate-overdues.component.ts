import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { forkJoin } from 'rxjs';
import { formatDate, Location } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import {
  IonCheckbox,
  IonContent,
  MenuController,
  Platform,
} from '@ionic/angular';
import { CalendarComponentOptions } from '@googlproxer/ion-range-calendar';
import Swal from 'sweetalert2';
import { SharedService } from '../../shared.service';
import { MandateService } from '../../mandate-service.service';
// import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
@Component({
  selector: 'app-mandate-overdues',
  templateUrl: './mandate-overdues.component.html',
  styleUrls: ['./mandate-overdues.component.scss'],
})
export class MandateOverduesComponent {
  @ViewChild('filterModal') filterModal;
  dateRange;
  isDisable = true;
  isCheckbox = false;
  optionsRange: CalendarComponentOptions = {
    pickMode: 'range',
    from: new Date(1990, 0, 1),
    to: new Date(),
  };
  showSpinner;
  showInfiniteScroll = true;
  localStorage = localStorage;
  filteredParams = {
    fromDate: '',
    toDate: '',
    stage: '',
    propid: '',
    htype: '',
    status: 'overdues',
    executid:
      localStorage.getItem('Role') === '1'
        ? []
        : localStorage.getItem('UserId'),
    loginid: localStorage.getItem('UserId'),
    teamlead:
      localStorage.getItem('RoleType') == '1'
        ? localStorage.getItem('UserId')
        : '',
    team: '',
    stagestatus: '',
    active: '1',
    source: '',
    priority: '',
    visits: '',
    followup: '',
    receivedFromDate: '',
    receivedToDate: '',
    visitedfromdate: '',
    visitedtodate: '',
    assignedfromdate: '',
    assignedtodate: '',
    fromTime: '',
    toTime: '',
    limit: 0,
    limitrows: 5,
  };

  tempFilteredValues;

  isPropertySection = true;
  isSourceSection = false;
  isExecutiveSection = false;
  isStageStatusSection = false;
  isDateSection = false;

  overduesCount = {
    total: '',
    followupsoverdues: '',
    ncOverdues: '',
    usvOverdues: '',
    rsvOverdues: '',
    fnOverdues: '',
    dealclosingPending: '',
    dealclosingReuquested: '',
  };

  startdate;
  enddate;
  minDate;
  maxDate;
  endDateMinDate;
  isenabled = true;
  executivesName;
  sourceList;
  propertyList;
  leads_detail;
  selectedOption;
  popoverController: any;
  currentdateforcompare = new Date();

  isAdmin;
  leadId: any;
  execid: any;

  constructor(
    private platform: Platform,
    private location: Location,
    private menuCtrl: MenuController,
    private changeDetectorRef: ChangeDetectorRef,
    private _sharedservice: SharedService,
    private _location: Location,
    private mandateService: MandateService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private ngZone: NgZone
  ) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this._location.back();
    });
    //  // Initialize start and end dates with default values
    //  this.startdate = new Date().toISOString();
    //  this.enddate = new Date().toISOString();

    //  // Set the minimum and maximum dates
    //  this.minDate = '2000-01-01';
    //  this.maxDate = new Date().toISOString();

    //  // Set initial min date for end date picker
    //  this.endDateMinDate = this.startdate;

    this.maxDate = new Date();
  }
  isRM = false;
  ngOnInit() {
    // this.router.events.subscribe(event => {
    //   if (event instanceof NavigationEnd) {
    //     const queryParams = this.activeRoute.snapshot.queryParams;
    //     // Use queryParams to fetch data
    //     console.log(queryParams)
    //   }
    // });

    this.activeRoute.queryParams.subscribe((params) => {
      this.isRM =
        this.localStorage.getItem('Role') == '50001' ||
        this.localStorage.getItem('Role') == '50002' ||
        this.localStorage.getItem('Role') == '50009' ||
        this.localStorage.getItem('Role') == '50010';
      this.showSpinner = true;
      this.leads_detail = [];
      this.leadId = params['leadId'];
      this.execid = params['execid'];
      this.isAdmin = this.localStorage.getItem('Role') == '1';
      // this.resetInfiniteScroll();
      // const queryString = window.location.search;
      // const queryParams = {};
      // new URLSearchParams(queryString).forEach((value, key) => {
      //   queryParams[key] = value;
      // });
      // Object.keys(queryParams).forEach(key => {
      //   if (this.filteredParams.hasOwnProperty(key)) {
      //     this.filteredParams[key] = queryParams[key];
      //   }
      // });
      this.getQueryParams();

      const existingParams = this.activeRoute.snapshot.queryParams;
      if (existingParams) {
        this.getFollowupsStatus();
        this.getExecutives();
        this.getsourcelist();
        this.getPropertyList();

        this.getPriceList();
        this.settingSelectedDate();
      }

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
        this.getOverduesCount();
      }
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
      } else if (key == 'propid' && 'ranavPropId' in localStorage) {
        this.filteredParams[key] = '28773';
      } else if (key !== 'loginid' && key !== 'limit' && key !== 'limitrows') {
        this.filteredParams[key] = '';
      }
    });
    if (this.filteredParams.stage == 'SV') {
      this.filteredParams.stage = 'Fresh';
    }

    if (this.filteredParams.propid === '28773') {
      this.mandateService.setHoverState('ranav_group');
    } else {
      this.mandateService.setHoverState('');
    }

    (this.filteredParams.executid =
      localStorage.getItem('Role') === '1'
        ? this.filteredParams.executid
        : localStorage.getItem('UserId')),
      (this.tempFilteredValues = { ...this.filteredParams });

    console.log(this.filteredParams);
  }

  // Get the overdues count on evry stage
  getOverduesCount() {
    this.showSpinner = true;
    const requests = [];
    const stage = ['', 'Fresh', 'NC'];
    stage.forEach((stage) => {
      const params = {
        ...this.filteredParams,
        stage: stage,
        stagestatus: '',
        status: 'overdues',
      };
      requests.push(this.mandateService.getAssignedLeadsCounts(params));
    });

    const stage1 = [
      'USV',
      'RSV',
      'Final Negotiation',
      'Deal Closing Pending',
      'Deal Closing Requested',
    ];
    stage1.forEach((stage1) => {
      const params = {
        ...this.filteredParams,
        stage: stage1,
        stagestatus: !this.filteredParams.stagestatus
          ? '3'
          : this.filteredParams.stagestatus,
        followup: '',
        status: 'overdues',
      };
      requests.push(this.mandateService.getAssignedLeadsCounts(params));
    });

    // Execute all requests concurrently
    forkJoin(requests).subscribe((results) => {
      // Process results
      results.forEach((assgnleads, index) => {
        switch (index) {
          case 0:
            // this.overduesCount.total = assgnleads['AssignedLeads'][0]['counts'];
            break;
          case 1:
            this.overduesCount.followupsoverdues =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 2:
            this.overduesCount.ncOverdues =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 3:
            this.overduesCount.usvOverdues =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 4:
            this.overduesCount.rsvOverdues =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 5:
            this.overduesCount.fnOverdues =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 6:
            this.overduesCount.dealclosingPending =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 7:
            this.overduesCount.dealclosingReuquested =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          default:
            break;
        }

        const number =
          Number(this.overduesCount.followupsoverdues) +
          Number(this.overduesCount.ncOverdues) +
          Number(this.overduesCount.usvOverdues) +
          Number(this.overduesCount.rsvOverdues) +
          Number(this.overduesCount.fnOverdues);

        this.overduesCount.total = String(number);
      });
    });

    this.getOverduesData(false, 0);
  }

  changeOption(value, data) {
    this.resetInfiniteScroll();
    if (value != 'NC' && value != 'Fresh') {
      this.filteredParams.stagestatus = '3';
    } else {
      this.filteredParams.stagestatus = '';
    }
    this.filteredParams.stage = value;
    this.selectedOption = data;
    this.addQuerryParams();
    // this.getOverduesData(false);
  }

  count = 0;
  //get the data of overdues
  getOverduesData(isLoadmore, selectedCount) {
    const stage = ['USV', 'RSV', 'Final Negotiation'];
    if (
      stage.includes(this.filteredParams.stage) &&
      !this.filteredParams.stagestatus
    ) {
      this.filteredParams.stagestatus = '3';
    }
    // this.count = isLoadmore ? (this.count += 10) : 0;
    // this.filteredParams.limit = this.count;
    var filterParam = this.filteredParams;
    if (selectedCount != 0 && !isLoadmore) {
      filterParam.limit = 0;
      filterParam.limitrows = selectedCount;
    } else {
      this.count = isLoadmore ? (this.count += 5) : 0;
      filterParam.limit = this.count;
    }

    return new Promise((resolve, reject) => {
      this.mandateService.assignedLeads(filterParam).subscribe((response) => {
        this.ngZone.run(() => {
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
    });
  }

  onBack() {
    this._location.back();
  }

  // to close the filterd section
  closeFilter() {
    this.getFilteredData();
  }

  // to remove all filtered values
  refresh() {
    this.filteredParams = {
      fromDate: '',
      toDate: '',
      status: 'overdues',
      stage: this.filteredParams.stage,
      team: '',
      propid: '',
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
      htype: this.filteredParams.htype,
      stagestatus: '',
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
      toTime: '',
      limit: 0,
      limitrows: 10,
    };
    this.isPropertySection = true;
    this.isSourceSection = false;
    this.isExecutiveSection = false;
    this.isStageStatusSection = false;
    this.isDateSection = false;
    this.isenabled = true;
  }

  onFilterValues(value) {
    this.isSourceSection = value === 'source';
    this.isPropertySection = value === 'property';
    this.isStageStatusSection = value === 'stage';
    this.isExecutiveSection = value === 'executive';
    this.isDateSection = value === 'date';

    if (value === 'source') {
      this.scrollToSelectedSource();
    }
  }

  selecteddaterange;

  //To store filtered value to Object
  onFilterSelection(value, data) {
    switch (value) {
      case 'property':
        this.tempFilteredValues.propid = data;

        if (this.tempFilteredValues.propid === '28773') {
          this.mandateService.setHoverState('ranav_group');
        } else {
          this.mandateService.setHoverState('');
        }
        this.getExecutives();
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
      case 'source':
        this.tempFilteredValues.source = data == 'all' ? '' : data;
        break;
      case 'stage':
        this.tempFilteredValues.stagestatus = data;
        break;
      case 'fromdate':
        this.selecteddaterange = '';
        const selectedDate = new Date(data.detail.value);
        this.tempFilteredValues.fromDate =
          selectedDate.toLocaleDateString('en-CA');
        this.endDateMinDate = this.tempFilteredValues.fromDate;
        if (this.tempFilteredValues.toDate.length === 0) {
          this.isenabled = false;
        }
        break;
      case 'todate':
        this.selecteddaterange = '';
        const selectedDate1 = new Date(data.detail.value);
        const adjustedDate = new Date(
          selectedDate1.getTime() - selectedDate1.getTimezoneOffset() * 60000
        );
        this.enddate = data.detail.value;
        this.tempFilteredValues.toDate =
          adjustedDate.toLocaleDateString('en-CA');
        this.endDateMinDate = this.tempFilteredValues.fromDate;
        if (this.tempFilteredValues.toDate.length !== 0) {
          this.isenabled = true;
        }
        break;
      case 'date':
        if (data == '5days') {
          const fifthDayBack = new Date(this.currentdateforcompare);
          fifthDayBack.setDate(this.currentdateforcompare.getDate() - 5);
          this.tempFilteredValues.fromDate =
            fifthDayBack.toLocaleDateString('en-CA');
          this.tempFilteredValues.toDate =
            this.currentdateforcompare.toLocaleDateString('en-CA');
          this.selecteddaterange = '5days';
        } else if (data == '10days') {
          const tenDayBack = new Date(this.currentdateforcompare);
          tenDayBack.setDate(this.currentdateforcompare.getDate() - 10);
          this.tempFilteredValues.fromDate =
            tenDayBack.toLocaleDateString('en-CA');
          this.tempFilteredValues.toDate =
            this.currentdateforcompare.toLocaleDateString('en-CA');
          this.selecteddaterange = '10days';
        } else if (data == '15days') {
          const tenDayBack = new Date(this.currentdateforcompare);
          tenDayBack.setDate(this.currentdateforcompare.getDate() - 15);
          this.tempFilteredValues.fromDate =
            tenDayBack.toLocaleDateString('en-CA');
          this.tempFilteredValues.toDate =
            this.currentdateforcompare.toLocaleDateString('en-CA');
          this.selecteddaterange = '15days';
        } else if (data == 'overdue') {
          if (this.overdueDateRange?.length === 2) {
            const start = formatDate(
              this.overdueDateRange[0],
              'yyyy-MM-dd',
              'en-US'
            );
            const end = formatDate(
              this.overdueDateRange[1],
              'yyyy-MM-dd',
              'en-US'
            );
            this.tempFilteredValues.fromDate = start;
            this.tempFilteredValues.toDate = end != '1970-01-01' ? end : '';
            this.isenabled =
              this.tempFilteredValues.toDate != '' &&
              this.tempFilteredValues.toDate != '1970-01-01'
                ? true
                : false;
          }
        }

        if (this.tempFilteredValues.fromDate != '' && data != 'overdue') {
          const fromDate = new Date(this.tempFilteredValues.fromDate);
          const toDate = new Date(this.tempFilteredValues.toDate);
          this.overdueDateRange = [fromDate, toDate];
        } else if (this.tempFilteredValues.fromDate == '') {
          this.overdueDateRange = null;
        }

        break;
      default:
        break;
    }
  }

  // Get Executives name
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
        ? localStorage.getItem('UserId')
        : '';
    const filterParam = {
      ...this.filteredParams,
      team:
        localStorage.getItem('RoleType') === '1'
          ? '2'
          : this.filteredParams.team,
      propid:
        localStorage.getItem('RoleType') === '1'
          ? localStorage.getItem('PropertyId')
          : this.filteredParams.propid,
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
        if (executives['status'] == 'True') {
          this.executivesName = executives['mandateexecutives'];

          this.executivesName = [
            ...(executives['mandateexecutives'] || []).filter(
              (x) => x.name !== 'Test RM' && x.name !== 'Test CS'
            ),
          ];
          this.executivesName1 = this.executivesName;
          this.showSpinner1 = false;
        } else {
          this.showSpinner1 = false;
        }
      });
  }

  showSpinner1 = false;
  // Get the active executive names
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

  //To get the source list
  getsourcelist() {
    this._sharedservice.sourcelist().subscribe((response) => {
      this.sourceList = response['Sources'];
      this.sourceList1 = this.sourceList;
    });
  }

  //Get Property list
  getPropertyList() {
    this.mandateService.getmandateprojects().subscribe((response) => {
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

  // TO DISPLAY FILTER SECTION
  navigateToFilter() {
    if ('ranavPropId' in localStorage && this.isAdmin) {
      this.isPropertySection = false;
      this.isSourceSection = true;
      this.isExecutiveSection = false;
      this.isDateSection = false;
      this.isStageStatusSection = false;
    } else if ('ranavPropId' in localStorage && !this.isAdmin) {
      this.isPropertySection = false;
      this.isSourceSection = false;
      this.isExecutiveSection = false;
      this.isDateSection = true;
      this.isStageStatusSection = false;
    } else {
      this.isPropertySection = true;
      this.isSourceSection = false;
      this.isExecutiveSection = false;
      this.isDateSection = false;
      this.isStageStatusSection = false;
    }

    this.tempFilteredValues = { ...this.filteredParams };
    this.filterModal.present();
  }
  page = 1;
  navigateToMandateCustomerPage(leadId, execid, lead) {
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
      queryParamsHandling: 'merge',
    });
  }

  convertToNumber(value: string): number {
    return Number(value);
  }

  getFilteredData() {
    this.showSpinner = true;
    this.addQuerryParams();
  }
  //scroll position update
  // @ViewChild('scrollContainer1', { read: ElementRef }) scrollContainer1: ElementRef;
  // options = ['529','657','1830','2987','16793', '34779', '58878'];
  // scrollToSelectedItem() {
  //   const container = this.scrollContainer1?.nativeElement;
  //   if (container) {
  //       const index = this.options.indexOf(this.filteredParams.propid)
  //     if (index !== -1) {
  //       const selectedButton = container.children[index];
  //       if (selectedButton) {
  //         container.scrollLeft = selectedButton.offsetLeft - (container.clientWidth / 2) + (selectedButton.clientWidth / 2);
  //       }
  //     }
  //   }
  //   this.changeDetectorRef.detectChanges();
  // }

  @ViewChild('scrollContainer', { read: ElementRef })
  scrollContainer: ElementRef;
  options = ['Fresh', 'NC', 'USV', 'RSV', 'Final Negotiation'];
  scrollToSelectedItem() {
    const container = this.scrollContainer?.nativeElement;
    if (container) {
      const index = this.options.indexOf(this.filteredParams.stage);
      if (index !== -1) {
        const selectedButton = container.children[index];
        if (selectedButton) {
          container.scrollLeft =
            selectedButton.offsetLeft -
            container.clientWidth / 2 +
            selectedButton.clientWidth / 2;
        }
      }
    }
    this.changeDetectorRef.detectChanges(); // Ensure view updates are reflected
  }

  // ngAfterViewChecked() {
  //   this.scrollToSelectedItem();
  // }

  propertySearchTerm;
  propertyList1;
  setFilteredProperty() {
    this.propertyList1 = this.propertyList.filter((item) => {
      return item.property_info_name
        .toLowerCase()
        .includes(this.propertySearchTerm.toLowerCase());
    });
  }

  sourceSearchTerm;
  sourceList1;
  setFilteredSource() {
    this.sourceList1 = this.sourceList.filter((item) => {
      return item.source
        .toLowerCase()
        .includes(this.sourceSearchTerm.toLowerCase());
    });
  }

  executiveSearchTerm;
  executivesName1;
  setFilteredExecutive() {
    this.executivesName1 = this.executivesName.filter((item) => {
      return item.name
        .toLowerCase()
        .includes(this.executiveSearchTerm.toLowerCase());
    });
  }

  followctgFilter: any;
  followupsections;
  followupleadsparam;
  //here we get the list of followups list
  getFollowupsStatus() {
    this.mandateService.getfollowupsections().subscribe((followupsection) => {
      this.followupsections = followupsection['followupCategories'];
      if (this.filteredParams.stage == 'Fresh') {
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
    });
  }

  // to add querry params
  addQuerryParams() {
    this.resetInfiniteScroll();
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
    // If params have changed or if you want to always trigger an API call
    if (paramsChanged) {
      this.router
        .navigate([], {
          queryParams,
          queryParamsHandling: 'merge',
          replaceUrl: true,
        })
        .then(() => {
          // this.getOverduesCount();
        });
    } else {
      // Trigger API call even if no params changed
      // this.getOverduesCount();
    }
  }

  onSwipe(event, lead: any) {
    if (event.detail.side == 'start') {
      window.open(`https://wa.me/+91 ${lead.number}`, '_system');
      // this.navigateToWhatsApp(lead.number);
      this.sliding.close();
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

  loadData(event) {
    if (
      (this.filteredParams.stage === 'Fresh' &&
        this.leads_detail.length < this.overduesCount.followupsoverdues) ||
      (this.filteredParams.stage === 'USV' &&
        this.leads_detail.length < this.overduesCount.usvOverdues) ||
      (this.filteredParams.stage === 'NC' &&
        this.leads_detail.length < this.overduesCount.ncOverdues) ||
      (this.filteredParams.stage === 'RSV' &&
        this.leads_detail.length < this.overduesCount.rsvOverdues) ||
      (this.filteredParams.stage === 'Final Negotiation' &&
        this.leads_detail.length < this.overduesCount.fnOverdues)
    ) {
      this.getOverduesData(true, 0).then(() => {
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

  // to close date picker
  toCloseDatePicker() {
    this.popoverController.dismiss();
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
      this.router.navigate(['mandate-myoverdues'], {
        queryParams,
        queryParamsHandling: 'merge',
      });
    } else {
      this.router.navigate(['retail-myoverdues'], {
        queryParams,
        queryParamsHandling: 'merge',
      });
    }
  }

  onBackButton() {
    this.resetInfiniteScroll();
    this.location.back();
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

  confirmSelection() {
    this.filteredParams = { ...this.tempFilteredValues };
    this.filterModal.dismiss();
    this.addQuerryParams();
  }

  closeFilterModal() {
    this.filterModal.dismiss();
  }

  daterange(data) {
    const from = this.tempFilteredValues.fromDate;
    const to =
      data == 'receivedDate' &&
      this.tempFilteredValues.receivedToDate != '1970-01-01'
        ? this.tempFilteredValues.toDate
        : '';

    if (data == 'overdueDate' && this.tempFilteredValues.fromDate != '') {
      return `${this.tempFilteredValues.fromDate} to ${this.tempFilteredValues.toDate}`;
    } else {
      return `${'Select Date Range'}`;
    }
  }

  overdueDateRange;

  settingSelectedDate() {
    if (this.tempFilteredValues.fromDate != '') {
      const fromDate = new Date(this.tempFilteredValues.fromDate);
      const toDate = new Date(this.tempFilteredValues.toDate);
      this.overdueDateRange = [fromDate, toDate];
    } else if (this.tempFilteredValues.fromDate == '') {
      this.overdueDateRange = null;
    }
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
  canScroll;
  @ViewChild('content', { static: false }) content: IonContent;
  isAtBottom = false;
  onScroll(event: CustomEvent) {
    this._sharedservice.scrollTop = event.detail.scrollTop;
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

  formatId(value: string): string {
    return value ? value.replace(/\s+/g, '-') : '';
  }

  onReassign() {
    this.isCheckbox = true;
  }

  selectedCount;
  selectedLeadCount;
  temporaryLeadIds = [];
  isManual = false;
  checkedLeadsDetail;
  fromExecids;
  selectedProperty;
  selectedExecTeam;
  selectedExecutiveName;
  executives;
  randomId = '';
  reassignedResponseInfo;
  selectedTeam;
  @ViewChild('assignLeadsModal') assignLeadsModal;
  @ViewChild('viewAssignLeadDetail') viewAssignLeadDetail;
  @ViewChildren('freshleadsCheckboxes') checkboxes!: QueryList<IonCheckbox>;
  team = [
    { name: 'Retail Team', code: 'Retail' },
    { name: 'Mandate Team', code: 'Mandate' },
  ];
  execTeam = [
    { name: 'Relationship Executives', code: '50002' },
    { name: 'Customersupport Executives', code: '50014' },
  ];
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
  onSelectLeadCount(count) {
    if (count != 'manual' && parseInt(count) > this.leads_detail.length) {
      this.selectedLeadCount = parseInt(count);
      this.showSpinner = true;
      this.isManual = false;
      this.getOverduesData(false, parseInt(count)).then(() => {
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

  onBackicon() {
    this.selectedCount = 0;
    this.isManual = false;
    this.temporaryLeadIds = [];
    this.checkedLeadsDetail = [];
    this.selectedLeadCount = 0;
    this.isCheckbox = false;
    this.showSpinner = false;
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
        propID: this.selectedProperty.property_idfk,
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

  onViewAssignLeadDetailClose() {
    this.viewAssignLeadDetail.dismiss();
    window.location.reload();
  }
  onWillDismiss(event) {
    location.reload();
  }
  reset() {
    this.selectedExecutiveName = [];
    this.executives = [];
    this.selectedExecTeam = '';
    this.selectedTeam = null;
    this.selectedProperty = '';
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
}

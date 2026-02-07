import { Component, OnInit, ViewChild } from '@angular/core';
import { formatDate, Location } from '@angular/common';
import { SharedService } from '../shared.service';
import { IonContent, MenuController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Calendar } from 'primeng/calendar';
@Component({
  selector: 'app-all-calls-listing',
  templateUrl: './all-calls-listing.component.html',
  styleUrls: ['./all-calls-listing.component.scss'],
})
export class AllCallsListingComponent implements OnInit {
  @ViewChild('content', { static: false }) content: IonContent;
  @ViewChild('filterModal') filterModal;
  executiveNames;
  selectedExecu;
  isAdmin;
  showSpinner = false;
  today: Date = new Date();
  filteredParams = {
    fromDate: '',
    toDate: '',
    callstage: '',
    loginid: localStorage.getItem('UserId'),
    execid: '',
    isDateFilter: '',
    htype: '',
  };
  tempFilteredValues;
  allCallsCount;
  isAtBottom: any = false;
  count: any;
  allCallsData;
  showInfiniteScroll = true;
  dateRange: any[];

  constructor(
    private location: Location,
    private sharedService: SharedService,
    private menuCtrl: MenuController,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private _sharedservice: SharedService
  ) {}

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((response) => {
      if (response['isOnCallDetailsPage'] == 'true') {
        this.isOnCallDetailsPage = true;
      } else {
        this.isOnCallDetailsPage = false;
      }

      this.isAdmin = localStorage.getItem('Role') == '1';
      this.getqueryParam();
      this.getExecutivesList();
      this.getAllCallsCount();
    });
  }

  getExecutivesList() {
    this._sharedservice.getexecutiveslist().subscribe((resp) => {
      this.executiveNames = resp['Executiveslist'];
      this.selectedExecu = this.executiveNames?.filter((exec, i) => {
        if (exec.ID == this.filteredParams.execid) {
          return exec;
        }
      });
      this.executiveNames?.unshift({ ID: '', Name: 'All' });
      this.selectedExecu = this.selectedExecu?.[0];
    });
  }

  getAllCallsCount() {
    this.showSpinner = true;
    const filteredParams = {};
    const apiParams = {
      ...this.filteredParams,
      fromcalldatetime: this.filteredParams.fromDate,
      tocalldatetime: this.filteredParams.toDate,
    };
    this.sharedService.getCallCounts(apiParams).subscribe((resp) => {
      this.allCallsCount = resp['success'][0];
      this.getallCallsData(false);
    });
  }

  onBackbutton() {
    this.location.back();
  }

  openEndMenu() {
    this.sharedService.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  addQueryParams() {
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
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  getqueryParam() {
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
      } else if (key !== 'loginid' && key !== 'limit' && key !== 'limitrows') {
        this.filteredParams[key] = '';
      }
    });
    this.tempFilteredValues = this.filteredParams;
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
        this.isAtBottom = false;
      } else {
        this.isAtBottom = scrollTop + clientHeight >= scrollHeight - 100;
      }
    });
  }

  closeFilterModal() {
    // this.isenabled = true;
    // this.receivedDateRange = null;
    // this.assignedDateRange = null;
    // this.nextActionFromDate = null;
    // this.nextActionToDate = null;
    this.filterModal.dismiss();
  }

  navigateToFilter() {
    this.tempFilteredValues = { ...this.filteredParams };
    this.filterModal.present();
  }

  getallCallsData(isLoadmore) {
    const params = {
      loginid: localStorage.getItem('UserId'),
      fromcalldatetime: this.filteredParams.fromDate,
      tocalldatetime: this.filteredParams.toDate,
      execid: this.isAdmin ? this.filteredParams.execid : '',
      callstage: this.filteredParams.callstage,
      limit: 0,
      limitrows: 5,
    };

    this.count = isLoadmore ? (this.count += 5) : 0;
    params.limit = this.count;

    return new Promise((resolve, reject) => {
      this._sharedservice.fetchAllCallLogs(params).subscribe({
        next: (response: any) => {
          this.showSpinner = false;
          if (response['status'] == 'success') {
            this.allCallsData = isLoadmore
              ? this.allCallsData.concat(response['success'])
              : response['success'];
            resolve(true);
          } else {
            this.showSpinner = false;
            this.allCallsData = [];
            resolve(false);
          }
        },
        error: (err) => {
          this.allCallsData = [];
          this.showSpinner = false;
          resolve(false);
        },
      });
    });
  }

  oncallStage(callstage) {
    this.resetInfiniteScroll();
    this.content.scrollToTop(500);
    this.filteredParams.callstage = callstage;
    this.addQueryParams();
  }

  loadData(event) {
    if (
      (this.filteredParams.callstage == 'overall' &&
        this.allCallsData.length < Number(this.allCallsCount.overall)) ||
      (this.filteredParams.callstage == 'missed' &&
        this.allCallsData.length < Number(this.allCallsCount.missed)) ||
      (this.filteredParams.callstage == 'connected' &&
        this.allCallsData.length < Number(this.allCallsCount.connected)) ||
      (this.filteredParams.callstage == 'active' &&
        this.allCallsData.length < Number(this.allCallsCount.active)) ||
      (this.filteredParams.callstage == 'inactive' &&
        this.allCallsData.length < Number(this.allCallsCount.inactive)) ||
      (this.filteredParams.callstage == 'visitsfixed' &&
        this.allCallsData.length < Number(this.allCallsCount.visitsfixed))
    ) {
      this.getallCallsData(true).then(() => {
        event.target.complete();
      });
    } else {
      event.target.disabled = true;
    }
  }

  //TO RESET THE INFINITE SRCOLL
  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }

  onExecutive(event) {
    this.filteredParams.execid = this.selectedExecu.ID;
    this.addQueryParams();
  }
  @ViewChild('calendar') calendar!: Calendar;
  selectDateFilter(dateType) {
    if (dateType == 'today') {
      this.filteredParams.isDateFilter = 'today';
      this.dateRange = [];
      this.filteredParams.fromDate = this.getTodayDate();
      this.filteredParams.toDate = this.getTodayDate();
    } else if (dateType == 'lastsevenDay') {
      this.filteredParams.isDateFilter = 'lastsevendays';
      this.dateRange = [];
      this.filteredParams.fromDate = this.getsevenDaysAgo();
      this.filteredParams.toDate = this.getTodayDate();
    } else if (dateType == 'custom') {
      if (this.dateRange && this.dateRange[0] && this.dateRange[1]) {
        const fromDate = new Date(this.dateRange[0]);
        const toDate = new Date(this.dateRange[1]);

        const diffInTime = toDate.getTime() - fromDate.getTime();
        const diffInDays = diffInTime / (1000 * 3600 * 24);

        // if (diffInDays > 7) {
        //   Swal.fire({
        //     title: 'Please select a date range of 7 days or less.',
        //     icon: 'warning',
        //     heightAuto: false,
        //     confirmButtonText: 'Ok',
        //   }).then(() => {
        //     if (
        //       this.filteredParams.fromdate != '' &&
        //       this.filteredParams.todate != ''
        //     ) {
        //       this.filteredParams.fromdate = this.filteredParams.fromdate;
        //       this.filteredParams.todate = this.filteredParams.todate;
        //       this.addQueryParams();
        //     } else {
        //       this.filteredParams.fromdate = this.getTodayDate();
        //       this.filteredParams.todate = this.getTodayDate();
        //       this.filteredParams.isDateFilter = 'today';
        //       this.addQueryParams();
        //     }
        //   });
        // } else {
        if (this.dateRange?.length === 2 && this.dateRange[1] != null) {
          this.filteredParams.isDateFilter = 'custom';
          const start = formatDate(this.dateRange[0], 'yyyy-MM-dd', 'en-US');
          const end = formatDate(this.dateRange[1], 'yyyy-MM-dd', 'en-US');
          this.filteredParams.fromDate = start;
          this.filteredParams.toDate = end != '1970-01-01' ? end : '';
          this.addQueryParams();
        } else {
          if (
            this.filteredParams.fromDate != '' &&
            this.filteredParams.toDate != ''
          ) {
            this.filteredParams.fromDate = this.filteredParams.fromDate;
            this.filteredParams.toDate = this.filteredParams.toDate;
            this.addQueryParams();
          } else {
            this.filteredParams.fromDate = this.getTodayDate();
            this.filteredParams.toDate = this.getTodayDate();
            this.filteredParams.isDateFilter = 'today';
            this.addQueryParams();
          }
        }
        // }
      } else {
        if (
          this.filteredParams.fromDate != '' &&
          this.filteredParams.toDate != ''
        ) {
          this.filteredParams.fromDate = this.filteredParams.fromDate;
          this.filteredParams.toDate = this.filteredParams.toDate;
          this.addQueryParams();
        } else {
          this.filteredParams.fromDate = this.getTodayDate();
          this.filteredParams.toDate = this.getTodayDate();
          this.filteredParams.isDateFilter = 'today';
          this.addQueryParams();
        }
      }
    }
    this.addQueryParams();
  }

  getsevenDaysAgo() {
    const today = new Date();
    today.setDate(today.getDate() - 6);
    return today.toISOString().split('T')[0];
  }
  getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  reset() {
    this.filteredParams = {
      fromDate: this.getTodayDate(),
      toDate: this.getTodayDate(),
      callstage: this.filteredParams.callstage,
      loginid: localStorage.getItem('UserId'),
      execid: '',
      isDateFilter: 'today',
      htype: this.filteredParams.htype,
    };

    this.addQueryParams();
  }

  onMissedFilter(missedsilter) {
    this.filteredParams.callstage = missedsilter;
    this.addQueryParams();
  }

  @ViewChild('sliding') sliding;
  @ViewChild('callConfirmationModal') callConfirmationModal;
  @ViewChild('onCallDetailsPage') onCallDetailsPage;
  lead;
  isOnCallDetailsPage = false;
  outboundCall(lead) {
    this.showSpinner = true;
    if (lead == true) {
      this.isOnCallDetailsPage = true;
      this.callConfirmationModal.dismiss();
      const cleanedNumber =
        this.lead?.callto.startsWith('91') && this.lead?.callto.length > 10
          ? this.lead?.callto.slice(2)
          : this.lead?.callto;
      const param = {
        execid: localStorage.getItem('UserId'),
        callto: cleanedNumber,
        leadid: this.lead.leadid,
        starttime: this.getCurrentDateTime(),
        modeofcall: 'mobile-' + this.filteredParams.htype,
        leadtype: this.filteredParams.htype,
        assignee: this.lead.Exec_IDFK,
      };
      this.callConfirmationModal.dismiss();
      this._sharedservice.outboundCall(param).subscribe((resp) => {
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
          headerType: this.filteredParams.htype,
        },
        queryParamsHandling: 'merge',
      });
    } else {
      this.lead = lead;
      this.showSpinner = false;
      this.callConfirmationModal.present();
    }

    // this.callConfirmationModal.present();
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
  ngOnDestroy() {
    this.sharedService.dismissAllOverlays();
  }
}

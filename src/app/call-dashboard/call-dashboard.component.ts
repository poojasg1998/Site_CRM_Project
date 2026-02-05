import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { SharedService } from '../shared.service';
import { MenuController } from '@ionic/angular';
import { Calendar } from 'primeng/calendar';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDate } from '@angular/common';
import Swal from 'sweetalert2';
import { merge } from 'jquery';

@Component({
  selector: 'app-call-dashboard',
  templateUrl: './call-dashboard.component.html',
  styleUrls: ['./call-dashboard.component.scss'],
})
export class CallDashboardComponent implements OnInit {
  dateRange;
  today: Date = new Date();
  filteredParams = {
    isDateFilter: '',
    fromdate: '',
    todate: '',
    execid: '',
    callRecord: '',
    clientnum: '',
    leadName: '',
    lastUpdate: '',
    callstage: '',
  };
  isAdmin = false;
  executiveslist;
  selectedExecName;
  allCallCounts;
  showSpinner = false;
  allCallsData: any;
  queryParamSub: any;

  constructor(
    private _sharedservice: SharedService,
    private menuCtrl: MenuController,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  counter = 0;
  ngOnInit() {
    this.queryParamSub = this.activeRoute.queryParams.subscribe(() => {
      this.selectedExecName = null;
      this.isAdmin = localStorage.getItem('Role') == '1';
      this.getqueryParam();
      this.getexecutiveslist();
      this.getCallCounts();
    });
  }

  ngOnDestroy() {
    if (this.queryParamSub) this.queryParamSub.unsubscribe();
    this._sharedservice.dismissAllOverlays();
  }

  openEndMenu() {
    this._sharedservice.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  @ViewChild('calendar') calendar!: Calendar;
  selectDateFilter(dateType) {
    if (dateType == 'today') {
      this.filteredParams.isDateFilter = 'today';
      this.dateRange = [];
      this.filteredParams.fromdate = this.getTodayDate();
      this.filteredParams.todate = this.getTodayDate();
    } else if (dateType == 'lastsevenDay') {
      this.filteredParams.isDateFilter = 'lastsevendays';
      this.dateRange = [];
      this.filteredParams.fromdate = this.getsevenDaysAgo();
      this.filteredParams.todate = this.getTodayDate();
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
          this.filteredParams.fromdate = start;
          this.filteredParams.todate = end != '1970-01-01' ? end : '';
          this.addQueryParams();
        } else {
          if (
            this.filteredParams.fromdate != '' &&
            this.filteredParams.todate != ''
          ) {
            this.filteredParams.fromdate = this.filteredParams.fromdate;
            this.filteredParams.todate = this.filteredParams.todate;
            this.addQueryParams();
          } else {
            this.filteredParams.fromdate = this.getTodayDate();
            this.filteredParams.todate = this.getTodayDate();
            this.filteredParams.isDateFilter = 'today';
            this.addQueryParams();
          }
        }
        // }
      } else {
        if (
          this.filteredParams.fromdate != '' &&
          this.filteredParams.todate != ''
        ) {
          this.filteredParams.fromdate = this.filteredParams.fromdate;
          this.filteredParams.todate = this.filteredParams.todate;
          this.addQueryParams();
        } else {
          this.filteredParams.fromdate = this.getTodayDate();
          this.filteredParams.todate = this.getTodayDate();
          this.filteredParams.isDateFilter = 'today';
          this.addQueryParams();
        }
      }
    }
    this.addQueryParams();
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
      fromdate: this.getTodayDate(),
      todate: this.getTodayDate(),
      isDateFilter: 'today',
      execid: '',
      callRecord: '',
      clientnum: '',
      leadName: '',
      lastUpdate: '',
      callstage: '',
    };
    this.addQueryParams();
  }

  onExecutive(event) {
    this.filteredParams.execid = event.value.ID;
    this.addQueryParams();
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
    this.cd.detectChanges();
  }

  getexecutiveslist() {
    this._sharedservice.getexecutiveslist().subscribe((response) => {
      this.executiveslist = response['Executiveslist'];
      this.executiveslist = [
        { Name: 'All', ID: null },
        ...(response['Executiveslist'] || []),
      ];

      if (this.filteredParams.execid) {
        this.selectedExecName = this.executiveslist.filter(
          (item) => item.ID == this.filteredParams.execid
        );
        this.selectedExecName = this.selectedExecName[0];
      }
    });
  }

  getCallCounts() {
    this.showSpinner = true;
    const params = {
      loginid: localStorage.getItem('UserId'),
      fromcalldatetime: this.filteredParams.fromdate,
      tocalldatetime: this.filteredParams.todate,
      execid: this.filteredParams.execid,
    };
    this._sharedservice.getCallCounts(params).subscribe((resp) => {
      this.allCallCounts = resp['success'][0];
    });
    this.getallCallsData(false);
  }
  count = 0;
  getallCallsData(isLoadmore) {
    const params = {
      loginid: localStorage.getItem('UserId'),
      fromcalldatetime: this.filteredParams.fromdate,
      tocalldatetime: this.filteredParams.todate,
      execid: this.isAdmin ? this.filteredParams.execid : '',
      callstage: this.filteredParams.callstage,
      limit: 0,
      limitrows: 30,
    };

    this.count = isLoadmore ? (this.count += 30) : 0;
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

  onAllMissedsCalls(data) {
    this.resetInfiniteScroll();
    this.filteredParams.callstage = data;
    this.addQueryParams();
  }

  navigateToListingPage(status) {
    this.router.navigate(['all-call-listing'], {
      queryParams: {
        callstage: status,
      },
      queryParamsHandling: 'merge',
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

  loadData(event) {
    if (
      (this.filteredParams.callstage == 'overall' &&
        this.allCallsData.length < Number(this.allCallCounts.overall)) ||
      (this.filteredParams.callstage == 'missed' &&
        this.allCallsData.length < Number(this.allCallCounts.missed))
    ) {
      this.getallCallsData(true).then(() => {
        event.target.complete();
      });
    } else {
      event.target.disabled = true;
    }
  }
}

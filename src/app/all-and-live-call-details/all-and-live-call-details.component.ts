import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { SharedService } from '../shared.service';
import { formatDate, Location } from '@angular/common';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { Calendar } from 'primeng/calendar/calendar';

@Component({
  selector: 'app-all-and-live-call-details',
  templateUrl: './all-and-live-call-details.component.html',
  styleUrls: ['./all-and-live-call-details.component.scss'],
})
export class AllAndLiveCallDetailsComponent implements OnInit {
  filteredParams = {
    fromdate: '',
    todate: '',
    isDateFilter: '',
    execid: '',
    isAllCallLogs: '',
    callRecord: '',
    clientnum: '',
    leadName: '',
    lastUpdate: '',
  };
  dateRange;
  today: Date = new Date();
  isAdmin;
  allAndLiveCallLogs;
  selectedExecName = [];
  allAndLiveCallLogs1: any = [];
  showSpinner: any;
  executiveslist: any;

  constructor(
    private menuCtrl: MenuController,
    private location: Location,
    private sharedService: SharedService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params) => {
      this.allAndLiveCallLogs1 = [];
      this.showSpinner = true;
      // this.filteredParams = { ...this.filteredParams, ...params };
      this.getqueryParam();
      if (
        this.filteredParams.isAllCallLogs == 'true' ||
        this.filteredParams.callRecord == 'true'
      ) {
        this.getAllCallLogs();
      } else if (this.filteredParams.callRecord != 'true') {
        this.getLiveCallsData();
      }
      this.isAdmin = localStorage.getItem('Role') == '1';
      this.getexecutiveslist();
      this.cd.detectChanges();
    });
  }

  getexecutiveslist() {
    this.sharedService.getexecutiveslist().subscribe((response) => {
      this.executiveslist = response['Executiveslist'];
      this.executiveslist = [
        { Name: 'All', ID: null },
        ...(response['Executiveslist'] || []),
      ];

      this.selectedExecName = this.executiveslist?.filter((exec, i) => {
        if (exec.ID == this.filteredParams.execid) {
          return exec;
        }
      });
      this.selectedExecName = this.selectedExecName[0];
    });
  }

  onExecutive(event) {
    this.filteredParams.execid = event.value.ID;
    this.addQueryParams();
  }

  reset() {
    this.filteredParams = {
      fromdate: this.getTodayDate(),
      todate: this.getTodayDate(),
      isDateFilter: 'today',
      execid: '',
      isAllCallLogs: this.filteredParams.isAllCallLogs,
      callRecord: '',
      clientnum: '',
      leadName: '',
      lastUpdate: '',
    };
    this.selectedExecName = [];
    this.addQueryParams();
  }

  getAllCallLogs() {
    const params = {
      loginid: localStorage.getItem('UserId'),
      fromcalldatetime: this.filteredParams.fromdate,
      tocalldatetime: this.filteredParams.todate,
      execid: this.filteredParams.execid ? this.filteredParams.execid : '',
      clientnum: this.filteredParams.clientnum
        ? this.filteredParams.clientnum
        : '',
    };

    this.sharedService.fetchAllCallLogs(params).subscribe(
      {
        next: (response: any) => {
          this.showSpinner = false;
          this.allAndLiveCallLogs = response['success'];
          this.allAndLiveCallLogs1 = this.allAndLiveCallLogs;
        },
        error: (err) => {
          this.showSpinner = false;
        },
      }
      //     (response) => {
      //     console.log(response);
      //     if (response['status'] == 'success') {
      //       this.allAndLiveCallLogs = response['success'];
      //       this.allAndLiveCallLogs1 = this.allAndLiveCallLogs;
      //     } else {
      //       this.allAndLiveCallLogs1 = [];
      //     }
      //     this.showSpinner = false;
      //   }
    );
  }

  openEndMenu() {
    this.sharedService.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  onBackbutton() {
    this.location.back();
  }

  getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getsevenDaysAgo() {
    const today = new Date();
    today.setDate(today.getDate() - 6);
    return today.toISOString().split('T')[0];
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

        if (diffInDays > 7) {
          Swal.fire({
            title: 'Please select a date range of 7 days or less.',
            icon: 'warning',
            heightAuto: false,
            confirmButtonText: 'Ok',
          }).then(() => {
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
          });
        } else {
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
        }
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

  settingSelectedDate() {
    if (this.filteredParams.fromdate != '') {
      const fromDate = new Date(this.filteredParams.fromdate);
      const toDate = new Date(this.filteredParams.todate);
      this.dateRange = [fromDate, toDate];
    } else if (this.filteredParams.fromdate == '') {
      this.dateRange = [];
    }
  }

  // setFilteredExecutive() {
  //   this.allAndLiveCallLogs1 = this.allAndLiveCallLogs.filter((item) => {
  //     return item.name?.toLowerCase().includes(this.execSearchName?.toLowerCase());
  //   });
  // }

  getLiveCallsData() {
    this.sharedService.fetchLiveCall(localStorage.getItem('UserId')).subscribe({
      next: (resp) => {
        this.showSpinner = false;
        this.allAndLiveCallLogs = resp['success'];
        this.allAndLiveCallLogs1 = resp['success'];

        this.allAndLiveCallLogs1.forEach((item, index) => {
          this.startTimer(index.toString(), item.starttime);
        });
      },
      error: (resp) => {
        this.showSpinner = false;
        this.allAndLiveCallLogs1 = [];
      },
    });
  }

  timers: { [key: string]: string } = {};
  private intervalIds: { [key: string]: any } = {};

  startTimer(logId: string, checkInTime: string | Date) {
    this.stopTimer(logId);

    const start =
      typeof checkInTime === 'string'
        ? new Date(checkInTime.replace(' ', 'T'))
        : checkInTime;

    this.intervalIds[logId] = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
      this.timers[logId] = this.formatTime(diff);
    }, 1000);
  }

  formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}h:${mins
      .toString()
      .padStart(2, '0')}m:${secs.toString().padStart(2, '0')}s`;
  }

  stopTimer(logId: string) {
    if (this.intervalIds[logId]) {
      clearInterval(this.intervalIds[logId]);
      delete this.intervalIds[logId];
      this.timers[logId] = '00:00:00 Hrs';
    }
  }
  ngOnDestroy() {
    this.sharedService.dismissAllOverlays();
  }
}

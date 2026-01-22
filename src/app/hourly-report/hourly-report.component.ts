import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import {
  IonModal,
  IonPopover,
  MenuController,
  PopoverController,
} from '@ionic/angular';
import { formatDate, Location } from '@angular/common';
import { SharedService } from '../shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarComponentOptions } from '@googlproxer/ion-range-calendar';
import { MandateService } from '../mandate-service.service';
import { RetailServiceService } from '../retail-service.service';
import { merge } from 'jquery';
import Swal from 'sweetalert2';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';

@Component({
  selector: 'app-hourly-report',
  templateUrl: './hourly-report.component.html',
  styleUrls: ['./hourly-report.component.scss'],
})
export class HourlyReportComponent implements OnInit {
  @ViewChild('reportSending') reportSending;
  showSpinner = false;
  isCustomDate = false;
  isAdmin = false;
  dateRange = {
    fromdate: null as Date | null,
    todate: null as Date | null,
  };
  executiveList;
  formattedDate;
  activityRepExeutives;
  executivesReportList;
  executivesReportList1;
  executiveCounts;
  zeroRepExecutives;
  execSearchName;
  selectedExec;
  filteredParams = {
    fromdate: '',
    todate: '',
    fromtime: '',
    totime: '',
    execid:
      localStorage.getItem('Role') === '1'
        ? ''
        : localStorage.getItem('UserId'),
    loginid: localStorage.getItem('UserId'),
    teamlead:
      localStorage.getItem('RoleType') == '1'
        ? localStorage.getItem('UserId')
        : '',
    isZeroActiveLeads: 'false',
    status: '',
    isStage: '',
    pageid: 1,
    isDateFilter: '',
    dbClient: '',
  };

  showInfiniteScroll = true;
  unquieleadcounts = 0;
  totalPendingCount = 0;

  time = [
    { name: 'Overall', code: '' },
    { name: 'Before 9:30AM', code: '12:00-09:30' },
    { name: '9:30AM - 10:30AM', code: '09:30-10:30' },
    { name: '10:30AM - 11:30AM', code: '10:30-11:30' },
    { name: '11:30AM - 12:30PM', code: '11:30-12:30' },
    { name: '12:30PM - 1:30PM', code: '12:30-1:30' },
    { name: '1:30PM - 2:30PM', code: '13:30-14:30' },
    { name: '2:30PM - 3:30PM', code: '14:30-15:30' },
    { name: '3:30PM - 4:30PM', code: '15:30-16:30' },
    { name: '4:30PM - 5:30PM', code: '16:30-17:30' },
    { name: '5:30PM - 6:30PM', code: '17:30-18:30' },
    { name: '6:30PM - 7:30PM', code: '18:30-19:30' },
    { name: 'After 7:30PM', code: '19:30-23:59' },
  ];
  today = new Date().toISOString().split('T')[0];
  // optionsRange: CalendarComponentOptions = {
  //   pickMode: 'range',
  //   from:new Date(),
  // };
  optionsRange: CalendarComponentOptions = {
    pickMode: 'range',
    from: new Date(2025, 2, 25),
    to: new Date(),
  };
  isTeamLead = false;
  teams;
  selectedTime = this.time[0];
  filteredTime;
  executiveList1: any;
  isOnCallDetailsPage = false;

  constructor(
    private menuCtrl: MenuController,
    private location: Location,
    private sharedService: SharedService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private _mandateService: MandateService,
    private _retailService: RetailServiceService,
    private ngZone: NgZone,
    private popoverController: PopoverController
  ) {}

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params) => {
      this.isTeamLead = localStorage.getItem('RoleType') == '1';
      if (params['isOnCallDetailsPage'] == 'true') {
        this.isOnCallDetailsPage = true;
      } else {
        this.isOnCallDetailsPage = false;
      }
      this.filteredTime = this.time.filter(
        (item) => !['', '12:00-09:30', '19:30-23:59'].includes(item.code)
      );
      this.resetInfiniteScroll();
      this.getlastSeventhDate();
      this.getQueryParams();
      this.getexecutiveslist();
      this.getAdminHourlyReport(false);
      if (
        this.getTodayDate() !== this.filteredParams.fromdate &&
        this.getlastSeventhDate() !== this.filteredParams.fromdate
      ) {
        this.isCustomDate = true;
      } else {
        this.isCustomDate = false;
      }
      if (localStorage.getItem('Role') == '1') {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }
      this.checkIfAfterTargetDate();

      this.teams = [
        { name: 'All', code: '' },
        { name: 'Inhouse Team', code: '0' },
        { name: 'Ranav Team', code: '1' },
      ];
    });
  }

  count = 1;
  getAdminHourlyReport(isLoadmore) {
    this.showSpinner = true;
    this.count = isLoadmore ? this.count + 1 : 1;
    this.filteredParams.pageid = this.count;

    return new Promise((resolve, reject) => {
      this.sharedService
        .getAdminHourlyReport(this.filteredParams)
        .subscribe((response) => {
          this.showSpinner = false;
          this.ngZone.run(() => {
            if (response['status'] === 'True') {
              if (localStorage.getItem('Role') == '1') {
                this.executivesReportList = isLoadmore
                  ? this.executivesReportList.concat(response['Exec_list'])
                  : response['Exec_list'];
                this.executivesReportList1 = this.executivesReportList;
              } else {
                this.executiveCounts = response['Exec_list'];
                this.executivesReportList = isLoadmore
                  ? this.executivesReportList.concat(response['Exec_list'])
                  : response['Exec_list'];
                this.executivesReportList1 = this.executivesReportList;
              }
              if (this.filteredParams.isZeroActiveLeads == 'true') {
                this.getZeroActivityReport();
              }
              if (this.execSearchName) {
                this.setFilteredExecutive();
              }
              resolve(true);
              this.getRetailMandateUntouchedCount();
            } else {
              resolve(false);
            }
          });
        });
    });
  }

  getPendingCountsMandate() {
    this.unquieleadcounts = 0;
    var totalleads = {
      assignedfromdate: this.filteredParams.fromdate,
      assignedtodate: this.filteredParams.todate,
      status: 'pending',
      executid: this.filteredParams.execid,
      loginid: localStorage.getItem('UserId'),
    };
    this._mandateService
      .getAssignedLeadsCounts(totalleads)
      .subscribe((compleads) => {
        if (compleads['status'] == 'True') {
          this.totalPendingCount = compleads.AssignedLeads[0].Uniquee_counts;
        } else {
          this.totalPendingCount = 0;
        }
      });
  }

  onReportSending() {
    if (this.filteredParams.fromtime === '') {
      Swal.fire({
        title: 'Please Select Time range',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'OK',
      }).then(() => {
        // location.reload();
      });
    } else {
      this.showSpinner = true;
      let params = {
        fromdate: this.filteredParams.fromdate,
        todate: this.filteredParams.todate,
        fromtime: this.filteredParams.fromtime,
        totime: this.filteredParams.totime,
        loginid: localStorage.getItem('UserId'),
      };
      this.reSet();
      this.sharedService.getAdminHourlyReport(params).subscribe((response) => {
        this.showSpinner = false;
        Swal.fire({
          title: 'Report Submited Successfully',
          icon: 'success',
          heightAuto: false,
          confirmButtonText: 'OK',
        }).then(() => {
          location.reload();
        });
      });
    }
  }

  getPendingCountsRetail() {
    this.unquieleadcounts = 0;
    var totalleads = {
      assignedfromdate: this.filteredParams.fromdate,
      assignedtodate: this.filteredParams.todate,
      status: 'pending',
      executid: this.filteredParams.execid,
      loginid: localStorage.getItem('UserId'),
    };

    this._retailService
      .getAssignedLeadsCount(totalleads)
      .subscribe((compleads) => {
        if (compleads['status'] == 'True') {
          if (compleads.result && compleads.result[0]) {
            this.totalPendingCount = compleads.AssignedLeads[0].Uniquee_counts;
          }
        } else {
          this.totalPendingCount = 0;
        }
      });
  }

  onToggleZeroActivityReport(event) {
    this.execSearchName = '';
    if (this.filteredParams.isZeroActiveLeads == 'true') {
      this.filteredParams.isZeroActiveLeads = 'false';
    } else {
      this.filteredParams.isZeroActiveLeads = 'true';
    }
    // this.getZeroActivityReport();
    this.addQueryParams();
  }

  getZeroActivityReport() {
    if (this.filteredParams.isZeroActiveLeads === 'true') {
      this.executivesReportList1 = this.executivesReportList.filter((exec) => {
        return (
          (exec?.counts?.length > 0
            ? exec?.counts[0]?.overall
            : exec?.overall) == '0'
        );
      });
    } else {
      this.executivesReportList1 = this.executivesReportList;
    }
  }
  openEndMenu() {
    this.sharedService.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  onBackButton() {
    this.location.back();
  }
  executiveNames;
  selectedExecu;
  getexecutiveslist() {
    this.sharedService.getexecutiveslist().subscribe((response) => {
      this.executiveList = response['Executiveslist'];
      this.executiveList1 = response['Executiveslist'];
      this.selectedExec = this.executiveList.filter((exec, i) => {
        if (exec.ID == this.filteredParams.execid) {
          return exec;
        }
      });
      this.selectedExec = this.executiveList.find(
        (exec) => exec.ID == this.filteredParams.execid
      );
    });

    this._mandateService
      .fetchmandateexecutives1(
        '',
        '',
        '',
        '',
        localStorage.getItem('RoleType') == '1'
          ? localStorage.getItem('UserId')
          : null
      )
      .subscribe((response) => {
        this.executiveNames = response['mandateexecutives'];

        this.executiveNames = [
          ...(response['mandateexecutives'] || []).filter(
            (x) => x.name !== 'Test RM' && x.name !== 'Test CS'
          ),
        ];

        if (localStorage.getItem('RoleType') == '1') {
          this.executiveNames = this.executiveNames.map((item) => {
            if (item.name === 'Kiran') {
              return { ...item, name: 'My Activity' };
            }
            return item;
          });
          // this.selectedExecu = { ...this.selectedExecu, name: 'My Activity' };
        } else {
          this.executiveNames = [
            { name: 'All', executid: '' },
            ...(this.executiveNames || []),
          ];
        }

        this.selectedExecu = this.executiveNames?.filter((exec, i) => {
          if (exec.id == this.filteredParams.execid) {
            return exec;
          }
        });

        this.selectedExecu = this.selectedExecu?.[0];
      });
  }

  getQueryParams() {
    const queryString = window.location.search;
    const queryParams = {};
    new URLSearchParams(queryString).forEach((value, key) => {
      queryParams[key] = value;
    });

    Object.keys(this.filteredParams).forEach((key) => {
      if (queryParams.hasOwnProperty(key)) {
        this.filteredParams[key] = queryParams[key];
      } else if (key !== 'loginid' && key !== 'pageid') {
        if (localStorage.getItem('Role') !== '1' && key === 'execid') {
          // this.filteredParams[key] = '';
        } else {
          this.filteredParams[key] = '';
        }
      }
    });
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
    if (this.filteredParams.isStage === 'true') {
      this.router
        .navigate(['hourly-report-listing'], {
          queryParams,
          queryParamsHandling: 'merge',
        })
        .then(() => {});
    } else {
      this.router
        .navigate([], { queryParams, queryParamsHandling: 'merge' })
        .then(() => {});
    }
  }

  setFilteredExecutive() {
    this.getZeroActivityReport();
    this.executivesReportList = this.executivesReportList1;
    this.executivesReportList1 = this.executivesReportList.filter((item) => {
      return item.ExecName?.toLowerCase().includes(
        this.execSearchName?.toLowerCase()
      );
    });
  }

  reSet() {
    this.resetInfiniteScroll();
    this.searchVisible = false;
    this.isCustomDate = false;
    this.selectedExec = null;
    this.execSearchName = '';
    this.selectedTime = this.time[0];
    this.filteredParams = {
      fromdate: this.getTodayDate(),
      todate: this.getTodayDate(),
      fromtime: '',
      totime: '',
      execid:
        localStorage.getItem('Role') === '1'
          ? ''
          : localStorage.getItem('UserId'),
      loginid: localStorage.getItem('UserId'),
      teamlead:
        localStorage.getItem('RoleType') == '1'
          ? localStorage.getItem('UserId')
          : '',
      isZeroActiveLeads: 'false',
      isStage: '',
      status: '',
      isDateFilter: 'today',
      pageid: 1,
      dbClient: '',
    };

    this.dateRange = {
      fromdate: null as Date | null,
      todate: null as Date | null,
    };
  }

  getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Returns 'YYYY-MM-DD'
  }

  getlastSeventhDate() {
    const today = new Date();
    const last7thDate = new Date();
    last7thDate.setDate(today.getDate() - 6);
    return last7thDate.toISOString().split('T')[0];
  }

  onExecSelected(event) {
    this.execSearchName = '';
    this.resetInfiniteScroll();
    this.filteredParams.fromtime = '';
    this.filteredParams.totime = '';
    this.filteredParams.execid = this.selectedExec.ID;
    this.addQueryParams();
  }

  onTeamSelect(event) {
    this.filteredParams.dbClient = event.value.code;
    this.addQueryParams();
  }

  getRetailMandateUntouchedCount() {
    if (this.filteredParams.execid && this.executiveList) {
      let executive = this.executiveList.filter((exec) => {
        return exec.ID == this.filteredParams.execid;
      });
      if (
        executive &&
        (executive[0].DesignationId == '50001' ||
          executive[0].DesignationId == '50002')
      ) {
        this.getPendingCountsMandate();
      } else if (
        executive &&
        (executive[0].DesignationId == '50009' ||
          executive[0].DesignationId == '50010' ||
          executive[0].DesignationId == '50003' ||
          executive[0].DesignationId == '50004')
      ) {
        this.getPendingCountsRetail();
      }
    }
  }

  onDateFilter(date) {
    this.execSearchName = '';
    if (date == 'today') {
      this.isCustomDate = false;
      this.filteredParams.fromdate = this.getTodayDate();
      this.filteredParams.todate = this.getTodayDate();
    } else if (date == 'last7Days') {
      this.isCustomDate = false;
      this.filteredParams.fromtime = '';
      this.filteredParams.totime = '';
      this.filteredParams.fromdate = this.getlastSeventhDate();
      this.filteredParams.todate = this.getTodayDate();
    } else if (date === 'custom') {
      this.filteredParams.fromtime = '';
      this.filteredParams.totime = '';
      this.dateRange = null;
      this.isCustomDate = true;
    }
    this.addQueryParams();
  }

  dateFilter(dateType) {
    // const today = new Date();
    // const format = (d) => d.toISOString().split('T')[0];

    // if (dateType != 'custom' && dateType != 'customfromDate') {
    //   this.dateRange = {
    //     fromdate: null as Date | null,
    //     todate: null as Date | null,
    //   };
    //   this.filteredParams.isDateFilter = dateType;
    // }

    // if (dateType === 'today') {
    //   this.filteredParams.fromdate = format(today);
    //   this.filteredParams.todate = format(today);
    // } else if (dateType === 'yesterday') {
    //   const y = new Date(today);
    //   y.setDate(today.getDate() - 1);
    //   this.filteredParams.fromdate = format(y);
    //   this.filteredParams.todate = format(y);
    // } else if (dateType == 'lastsevenDay') {
    //   const today = new Date();
    //   today.setDate(today.getDate() - 6);
    //   this.filteredParams.fromdate = today.toISOString().split('T')[0];
    //   this.filteredParams.todate = new Date().toISOString().split('T')[0];
    // } else if (dateType === 'custom') {
    //   const from = this.dateRange.fromdate;
    //   const to = this.dateRange.todate;

    //   if (from && to) {
    //     // SIMPLE conversion – no errors, no timezone issues
    //     const fromStr = from.toLocaleDateString('en-CA');
    //     const toStr = to.toLocaleDateString('en-CA');

    //     // assign to filteredParams
    //     this.filteredParams.fromdate = fromStr;
    //     this.filteredParams.todate = toStr;
    //     this.filteredParams.isDateFilter = 'custom';
    //     this.addQueryParams();
    //   }
    //   console.log(this.dateRange.fromdate + ' ' + this.dateRange.todate);
    //   this.dateRange.fromdate && this.dateRange.todate
    //     ? this.popoverController.dismiss()
    //     : '';
    // } else if (dateType == 'lastsevenDay') {
    //   const today = new Date();
    //   today.setDate(today.getDate() - 6);
    //   this.filteredParams.fromdate = today.toISOString().split('T')[0];
    //   this.filteredParams.todate = new Date().toISOString().split('T')[0];
    // } else if (dateType == 'customfromDate') {
    //   if (this.dateRange.fromdate > this.dateRange.todate) {
    //     this.filteredParams.todate = '';
    //     this.dateRange.todate = null;
    //   } else if (this.dateRange.fromdate && this.dateRange.todate) {
    //     this.filteredParams.fromdate =
    //       this.dateRange.fromdate.toLocaleDateString('en-CA');
    //     this.filteredParams.todate =
    //       this.dateRange.todate.toLocaleDateString('en-CA');
    //     console.log(this.filteredParams.isDateFilter);
    //   }

    //   this.dateRange.fromdate && this.dateRange.todate
    //     ? (this.addQueryParams(), this.popoverController.dismiss())
    //     : '';

    //   return;
    // }

    // dateType != 'custom' && dateType != 'customfromDate'
    //   ? this.addQueryParams()
    //   : '';

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
      this.filteredParams.fromdate = format(today);
      this.filteredParams.todate = format(today);
    } else if (dateType === 'yesterday') {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      this.filteredParams.fromdate = format(y);
      this.filteredParams.todate = format(y);
    } else if (dateType === 'lastsevenDay') {
      const from = new Date(today);
      from.setDate(from.getDate() - 6);
      this.filteredParams.fromdate = format(from);
      this.filteredParams.todate = format(today);
    } else if (dateType === 'custom') {
      this.filteredParams.isDateFilter = dateType;
      this.dashboard_custDate_modal.present();
      return;
    } else if (dateType == 'customfromDate') {
      this.filteredParams.isDateFilter = 'custom';
      if (this.dateRange.fromdate > this.dateRange.todate) {
        this.filteredParams.todate = '';
        this.dateRange.todate = null;
      } else {
        this.filteredParams.fromdate = ('' + this.dateRange.fromdate).split(
          'T'
        )[0];
        this.filteredParams.todate = ('' + this.dateRange.todate).split('T')[0];
      }
      this.showFromDateError = false;
      this.dashboard_fromDate_modal?.dismiss();
      return;
    } else if (dateType == 'customtoDate') {
      this.filteredParams.isDateFilter = 'custom';
      this.filteredParams.todate = ('' + this.dateRange.todate).split('T')[0];
      this.dashboard_toDate_modal?.dismiss();
      return;
    }
    this.addQueryParams();
  }

  onCustomDate() {
    // this.filteredParams.fromdate = this.dateRange.from
    // this.filteredParams.todate = this.dateRange.to
    // if (this.dateRange?.from && this.dateRange?.to) {
    //   setTimeout(() => {
    //     this.datePopover.dismiss();
    //     this.reportSendingTime.dismiss();
    //   }, 200);
    // }
    // if (this.dateRange?.length === 2 && this.dateRange[1] != null) {
    //   const start = formatDate(this.dateRange[0], 'yyyy-MM-dd', 'en-US');
    //   const end = formatDate(this.dateRange[1], 'yyyy-MM-dd', 'en-US');
    //   this.filteredParams.fromdate = start;
    //   this.filteredParams.todate = end != '1970-01-01' ? end : '';
    //   this.addQueryParams();
    // } else {
    //   if (
    //     this.filteredParams.fromdate != '' &&
    //     this.filteredParams.todate != ''
    //   ) {
    //     this.filteredParams.fromdate = this.filteredParams.fromdate;
    //     this.filteredParams.todate = this.filteredParams.todate;
    //   } else {
    //     this.filteredParams.fromdate = this.getTodayDate();
    //     this.filteredParams.todate = this.getTodayDate();
    //   }
    // }
    // this.addQueryParams();
    // this.popoverController.dismiss();
  }

  @ViewChild('datePopover') datePopover!: IonPopover;
  @ViewChild('reportSendingTime') reportSendingTime!: IonPopover;

  getPreviousDate() {
    const today = new Date();
    const previousDate = new Date();
    previousDate.setDate(today.getDate() - 1);
  }

  changeDate(direction) {
    const date = new Date(this.filteredParams.fromdate);
    if (direction === 'next') {
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      this.filteredParams.fromdate = nextDate.toISOString().split('T')[0];
      this.filteredParams.todate = this.filteredParams.fromdate;
    } else {
      const previousDate = new Date(date);
      previousDate.setDate(date.getDate() - 1);
      this.filteredParams.fromdate = previousDate.toISOString().split('T')[0];
      this.filteredParams.todate = this.filteredParams.fromdate;
    }
    this.addQueryParams();
  }

  // onTimeFilter1(event) {
  //   console.log(event);
  //   this.execSearchName = '';
  //   let [timeRange, text] = event.value.code.split(' ', 2);
  //   let [startTime, endTime] = timeRange.split('-');
  //   this.filteredParams.fromtime = startTime;
  //   this.filteredParams.totime = endTime;
  //   console.log(this.filteredParams);

  //   fromtime: '09:30';
  //   totime: '10:30';
  //   // this.addQueryParams();
  // }

  onTimeFilter(fromtime, totime) {
    this.filteredParams.fromtime = fromtime;
    this.filteredParams.totime = totime;
    this.addQueryParams();
  }

  onTimeFilter1(event) {
    this.execSearchName = '';
    let [timeRange, text] = event.value.code.split(' ', 2);
    let [startTime, endTime] = timeRange.split('-');
    this.filteredParams.fromtime = startTime;
    this.filteredParams.totime = endTime;
    // this.addQueryParams();
  }

  loadData(event) {
    if (this.filteredParams.pageid !== 2 && this.filteredParams.pageid < 2) {
      this.getAdminHourlyReport(true).then(() => {
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

  checkIfBeforeTargetDate(): boolean {
    const targetDate = new Date('2025-03-25');
    targetDate.setHours(0, 0, 0, 0);
    const fromDate = new Date(this.filteredParams.fromdate);
    fromDate.setHours(0, 0, 0, 0);
    return fromDate.getTime() <= targetDate.getTime();
  }

  checkIfAfterTargetDate() {
    let enteredDate = new Date(this.filteredParams.fromdate);
    let lowerBound = new Date('2025-03-25'); // March 25, 2025
    let upperBound = new Date();
    enteredDate.setHours(0, 0, 0, 0);
    lowerBound.setHours(0, 0, 0, 0);
    upperBound.setHours(0, 0, 0, 0);
    if (enteredDate >= lowerBound && enteredDate < upperBound) {
      return false;
    } else {
      return true;
    }
  }

  onStage(stage, exec) {
    if (!this.filteredParams.execid) {
      this.filteredParams.execid = exec.ExecId;
    } else if (this.filteredParams.execid) {
      this.filteredParams.fromtime = exec.starttime;
      this.filteredParams.totime = exec.endtime;
    }
    this.filteredParams.isStage = 'true';
    this.filteredParams.status = stage;
    this.addQueryParams();
  }

  onSendReport() {
    this.dateRange.fromdate = this.filteredParams.fromdate
      ? new Date(this.filteredParams.fromdate)
      : null;
    this.dateRange.todate = this.filteredParams.todate
      ? new Date(this.filteredParams.todate)
      : null;
    this.reportSending.present();
  }

  get fromAndToDate(): string {
    return this.filteredParams.fromdate + ' / ' + this.filteredParams.todate;
  }

  searchVisible = false;
  searchAnimationClass = '';

  searchMembers() {
    this.searchVisible = true;
    setTimeout(() => {
      this.searchAnimationClass = 'slide-in';
    }); // small delay so DOM paints before animating
  }

  closeSearch() {
    this.searchAnimationClass = 'slide-out';
    setTimeout(() => {
      this.searchVisible = false;
      this.searchAnimationClass = '';
    }, 300); // match CSS transition duration
  }

  filterExecName(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query;

    for (let i = 0; i < (this.executiveList as any[]).length; i++) {
      let country = (this.executiveList as any[])[i];
      if (country.Name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(country);
      }
    }
    this.executiveList1 = filtered;
  }

  onExecInput(event: any) {
    const value = event.target.value;
    if (value === '') {
      this.execSearchName = '';
      this.resetInfiniteScroll();
      this.filteredParams.fromtime = '';
      this.filteredParams.totime = '';
      this.filteredParams.execid = '';
      this.addQueryParams();
    }
  }

  onExecutiveFilter(event) {
    this.filteredParams.execid = this.selectedExecu.id;
    this.addQueryParams();
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
      this.filteredParams.fromdate = new Date().toLocaleDateString('en-CA');
      this.filteredParams.todate = new Date().toLocaleDateString('en-CA');
      this.addQueryParams();
    }
  }
}

import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  IonContent,
  IonModal,
  MenuController,
  PopoverController,
} from '@ionic/angular';
import { formatDate, Location } from '@angular/common';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';
import { SharedService } from '../shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarComponentOptions } from '@googlproxer/ion-range-calendar';
import Swal from 'sweetalert2';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss'],
})
export class AttendanceComponent implements OnInit {
  @ViewChild('scrollContent', { static: false }) scrollContent!: IonContent;
  latitude: number | null = null;
  longitude: number | null = null;
  address: string | null = null;
  errorMsg: string | null = null;
  todayDate = new Date();
  executives;
  dateRange = {
    fromdate: null as Date | null,
    todate: null as Date | null,
  };
  optionsRange: CalendarComponentOptions = {
    pickMode: 'range',
    from: new Date(1990, 0, 1),
    to: new Date(),
  };
  showSpinner = false;
  checkInOutDetails;
  selectedExecu;
  isAdmin;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private menuCtrl: MenuController,
    private location: Location,
    private http: HttpClient,
    private sharedService: SharedService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private popoverController: PopoverController
  ) {}

  filteredParams = {
    fromdate: '',
    todate: '',
    execid: '',
    isExecCheckInOutDetails: 'false',
    execname: '',
    selectedDay: '',
    isDateFilter: '',
    limit: 0,
    limitrows: 20,
  };
  isOnCallDetailsPage = false;
  isEmployee = false;
  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params) => {
      this.isEmployee = localStorage.getItem('Department') === '10006';

      if (params['isOnCallDetailsPage'] == 'true') {
        this.isOnCallDetailsPage = true;
      } else {
        this.isOnCallDetailsPage = false;
      }
      this.isAdmin = localStorage.getItem('Role') === '1';
      this.getqueryParam();

      if (
        ((this.filteredParams.fromdate == this.getTodayDate() &&
          this.filteredParams.todate == this.getTodayDate()) ||
          (this.filteredParams.fromdate == this.getYesterdayDate() &&
            this.filteredParams.todate == this.getYesterdayDate())) &&
        this.filteredParams.execid != '1'
      ) {
        this.filteredParams.isExecCheckInOutDetails = 'true';
      }

      this.getcheckInAndOutStatus();
      this.getExecutiveList();
    });
  }
  refreshPage() {
    this.dateRange = {
      fromdate: null as Date | null,
      todate: null as Date | null,
    };
    this.filteredParams = {
      fromdate: new Date().toLocaleDateString('en-CA'),
      todate: new Date().toLocaleDateString('en-CA'),
      execid: this.filteredParams.execid,
      isExecCheckInOutDetails: 'false',
      execname: '',
      selectedDay: '',
      isDateFilter: 'today',
      limit: 0,
      limitrows: 20,
    };
    this.addQueryParams();
  }

  getExecutiveList() {
    this.sharedService.getexecutiveslist().subscribe((response) => {
      if (response['status'] == 'True') {
        this.executives = response['Executiveslist'];
        // const allOption = { ID: '1', Name: 'All' };
        // this.executives = [allOption, ...this.executives];

        this.executives = [
          { ID: '1', Name: 'All' },
          ...(response['Executiveslist'] || []).filter(
            (x) => x.Name !== 'Test RM' && x.name !== 'Test CS'
          ),
        ];

        this.selectedExecu = this.executives?.filter((exec, i) => {
          if (exec.ID == this.filteredParams.execid) {
            return exec;
          }
        });
        this.selectedExecu = this.selectedExecu?.[0];
      }
    });
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

  getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Returns 'YYYY-MM-DD'
  }

  getYesterdayDate() {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    return today.toISOString().split('T')[0];
  }

  getsevenDaysAgo() {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    return sevenDaysAgo.toISOString().split('T')[0];
  }

  selectDateFilter(dateType) {
    this.filteredParams.selectedDay = '';
    dateType != 'custom' && dateType != 'customfromDate'
      ? ((this.filteredParams.isDateFilter = dateType),
        !this.dateRange.fromdate && !this.dateRange.todate)
      : '';

    if (
      dateType == 'today' ||
      dateType == 'yesterday' ||
      dateType == 'lastsevenDay'
    ) {
      this.dateRange = {
        fromdate: null as Date | null,
        todate: null as Date | null,
      };
    }
    if (dateType == 'today') {
      this.filteredParams.fromdate = this.getTodayDate();
      this.filteredParams.todate = this.getTodayDate();
    } else if (dateType == 'yesterday') {
      this.filteredParams.fromdate = this.getYesterdayDate();
      this.filteredParams.todate = this.getYesterdayDate();
    } else if (dateType == 'lastsevenDay') {
      this.filteredParams.fromdate = this.getsevenDaysAgo();
      this.filteredParams.todate = this.getTodayDate();
      this.filteredParams.isExecCheckInOutDetails = 'false';
    } else if (dateType === 'custom') {
      this.dashboard_custDate_modal.present();
      return;
    } else if (dateType == 'customfromDate') {
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
      this.filteredParams.todate = ('' + this.dateRange.todate).split('T')[0];
      this.dashboard_toDate_modal?.dismiss();
      return;
    } else if (dateType === 'custom') {
      const from = this.dateRange.fromdate;
      const to = this.dateRange.todate;

      if (from && to) {
        const diffInMonths =
          to.getMonth() -
          from.getMonth() +
          12 * (to.getFullYear() - from.getFullYear());

        if (
          diffInMonths > 1 ||
          (diffInMonths === 1 && to.getDate() > from.getDate())
        ) {
          Swal.fire({
            title: 'Please select a date range of 1 month or less.',
            icon: 'warning',
            heightAuto: false,
            confirmButtonText: 'ok',
          }).then(() => {
            this.dateRange = { fromdate: null, todate: null };
          });
          return;
        }
      }

      // Move this AFTER the month validation
      if (from && to && from > to) {
        this.filteredParams.todate = '';
        this.dateRange.todate = null;
        return;
      }

      if (from && to) {
        this.filteredParams.fromdate = from.toLocaleDateString('en-CA');
        this.filteredParams.todate = to.toLocaleDateString('en-CA');
        this.filteredParams.isDateFilter = dateType;
      }

      this.addQueryParams();
      this.dateRange.fromdate && this.dateRange.todate
        ? this.popoverController.dismiss()
        : '';
    } else if (dateType == 'customfromDate') {
      const from = new Date(this.dateRange.fromdate);
      const to = new Date(this.dateRange.todate);
      const diffInMonths =
        to.getMonth() -
        from.getMonth() +
        12 * (to.getFullYear() - from.getFullYear());
      if (
        diffInMonths > 1 ||
        (diffInMonths === 1 && to.getDate() > from.getDate())
      ) {
        Swal.fire({
          title: 'Please select a date range of 1 month or less.',
          icon: 'warning',
          heightAuto: false,
          confirmButtonText: 'ok',
        }).then(() => {
          this.dateRange = {
            fromdate: null as Date | null,
            todate: null as Date | null,
          };

          this.filteredParams.fromdate = this.filteredParams.fromdate;
          this.filteredParams.todate = this.filteredParams.todate;
        });
      } else {
        if (this.dateRange.fromdate > this.dateRange.todate) {
          this.filteredParams.todate = '';
          this.dateRange.todate = null;
        } else if (this.dateRange.fromdate && this.dateRange.todate) {
          this.filteredParams.fromdate =
            this.dateRange.fromdate.toLocaleDateString('en-CA');
          this.filteredParams.todate =
            this.dateRange.todate.toLocaleDateString('en-CA');
        }
      }

      this.dateRange.fromdate && this.dateRange.todate
        ? (this.addQueryParams(), this.popoverController.dismiss())
        : '';

      return;
    } else if (dateType == 'custom') {
      // const from = new Date(this.dateRange[0]);
      // const to = new Date(this.dateRange[1]);
      // const diffInMonths =
      //   to.getMonth() -
      //   from.getMonth() +
      //   12 * (to.getFullYear() - from.getFullYear());
      // if (
      //   diffInMonths > 1 ||
      //   (diffInMonths === 1 && to.getDate() > from.getDate())
      // ) {
      //   Swal.fire({
      //     title: 'Please select a date range of 1 month or less.',
      //     icon: 'warning',
      //     heightAuto: false,
      //     confirmButtonText: 'ok',
      //   });
      //   this.dateRange.to = null;
      // } else {
      //   if (this.dateRange?.length === 2 && this.dateRange[1] != null) {
      //     const start = formatDate(this.dateRange[0], 'yyyy-MM-dd', 'en-US');
      //     const end = formatDate(this.dateRange[1], 'yyyy-MM-dd', 'en-US');
      //     this.filteredParams.fromdate = start;
      //     this.filteredParams.todate = end != '1970-01-01' ? end : '';
      //     this.addQueryParams();
      //   } else {
      //     if (
      //       this.filteredParams.fromdate != '' &&
      //       this.filteredParams.todate != ''
      //     ) {
      //       this.filteredParams.fromdate = this.filteredParams.fromdate;
      //       this.filteredParams.todate = this.filteredParams.todate;
      //     } else {
      //       this.filteredParams.fromdate = this.getTodayDate();
      //       this.filteredParams.todate = this.getTodayDate();
      //     }
      //   }
      // }
    }
    this.scrollContent.scrollToTop();
    this.addQueryParams();
  }

  onExecutiveFilter(event) {
    this.filteredParams.execid = this.selectedExecu.ID;
    this.filteredParams.execname = this.selectedExecu.Name;
    this.addQueryParams();
  }

  getcheckInAndOutStatus() {
    // this.showSpinner = true;
    const param = {
      execid: this.filteredParams.execid,
      loginid: localStorage.getItem('UserId'),
      from: this.filteredParams.fromdate,
      to: this.filteredParams.todate,
      logintype:
        localStorage.getItem('PropertyId') === '28773'
          ? localStorage.getItem('direct_inhouse')
          : '',
      propid:
        localStorage.getItem('PropertyId') === '28773'
          ? localStorage.getItem('PropertyId')
          : '',
      limit: 0,
      limitrows: 30,
    };
    this.sharedService.getCheck_inStatus(param).subscribe((response) => {
      this.checkInOutDetails = response['data'];

      this.checkInOutDetails?.forEach((user) => {
        this.offLineTimer(user);
        if (
          user.all_checks?.length > 0 &&
          user.all_checks[user.all_checks.length - 1].check_status == '1' &&
          user.auto_checkOut != '1'
        ) {
          this.initializeTimers();
        } else if (user.auto_checkOut == '1') {
          this.totalHrForAutocheckout(user);
        }
      });
      this.showSpinner = false;
    });
  }

  totalHrForAutocheckout(user) {
    // ---- Auto-checkout, calculate once ----
    const userId = user.id;
    const checkDate = new Date(user.all_checks[0].created_at)
      .toISOString()
      .split('T')[0];
    const timerKey = `${userId}_${checkDate}`;

    const createdAt = new Date(user.all_checks[0].created_at);
    const startTime = createdAt.getTime();

    const midnight = new Date(createdAt);
    midnight.setHours(24, 0, 0, 0);

    const elapsed = midnight.getTime() - startTime;

    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
    const seconds = Math.floor((elapsed / 1000) % 60);

    // Instead of timersMap, store in user.total_hours
    user.total_hours = `${this.pad(hours)}h:${this.pad(minutes)}m:${this.pad(
      seconds
    )}s`;
  }

  private timerSubscriptions: { [key: string]: Subscription } = {};
  timersMap: { [key: string]: string } = {};

  initializeTimers() {
    this.checkInOutDetails.forEach((detail) => {
      if (
        detail.all_checks?.length > 0 &&
        detail.all_checks[0].check_status === '1' &&
        detail.auto_checkOut !== '1'
      ) {
        const userId = detail.id;
        const checkDate = new Date(detail.all_checks[0].created_at)
          .toISOString()
          .split('T')[0];
        const timerKey = `${userId}_${checkDate}`;

        const startTime = new Date(detail.all_checks[0].created_at).getTime();

        if (this.timerSubscriptions[timerKey]) {
          return; // Already subscribed for this user and date
        }

        // Create interval for each user/date combo
        this.timerSubscriptions[timerKey] = interval(1000).subscribe(() => {
          const now = new Date().getTime();
          const elapsed = now - startTime;

          const hours = Math.floor(elapsed / (1000 * 60 * 60));
          const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
          const seconds = Math.floor((elapsed / 1000) % 60);

          this.timersMap[timerKey] = `${this.pad(hours) + 'h'}:${
            this.pad(minutes) + 'm'
          }:${this.pad(seconds) + 's'}`;
        });
      }
    });
  }

  private logout_timeSubscriptions: { [key: string]: Subscription } = {};
  logout_timersMap: { [key: string]: string } = {};

  offLineTimer(checkStatus) {
    const userId = checkStatus.id;
    const checkDate = new Date(checkStatus.logout_time)
      .toISOString()
      .split('T')[0];
    const timerKey = `${userId}_${checkDate}`;
    const startTime = new Date(checkStatus.logout_time).getTime();
    if (this.logout_timeSubscriptions[timerKey]) {
      return; // Already subscribed for this user and date
    }

    // Create interval for each user/date combo
    this.logout_timeSubscriptions[timerKey] = interval(1000).subscribe(() => {
      const now = new Date().getTime();
      const elapsed = now - startTime;

      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
      const seconds = Math.floor((elapsed / 1000) % 60);

      this.logout_timersMap[timerKey] = `${this.pad(hours) + 'h'}:${
        this.pad(minutes) + 'm'
      }:${this.pad(seconds) + 's'}`;
    });
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : '' + num;
  }

  openEndMenu() {
    this.sharedService.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  onBackbutton() {
    this.location.back();
  }

  async getCurrentPosition() {
    try {
      const permission = await Geolocation.checkPermissions();

      if (permission.location === 'denied') {
        await Geolocation.requestPermissions();
      }
      const position = await Geolocation.getCurrentPosition();
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      // Use or display the coordinates as you like
    } catch (err) {
      console.error('Error getting location', err);
    }
  }

  async getCurrentLocation() {
    try {
      const permission = await Geolocation.checkPermissions();
      if (permission.location === 'denied') {
        await Geolocation.requestPermissions();
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
      });

      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;

      this.getAddressFromCoords(this.latitude, this.longitude);
    } catch (err) {
      this.errorMsg = 'Error getting location: ' + err;
    }
  }

  getAddressFromCoords(lat: number, lng: number) {
    const apiKey = '02c57990ba84464f92881b3694fb465c';
    const query = `${lat}+${lng}`;

    this.http
      .get(
        `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${apiKey}`
      )
      .subscribe(
        (res: any) => {
          if (res && res.results && res.results.length > 0) {
            this.address = res.results[0].formatted;
          } else {
            this.address = 'Address not found';
          }
        },
        (error) => {
          this.address = 'Geocoding failed';
        }
      );
  }

  isNewDate(index: number): boolean {
    if (index === 0) return true;
    const currentDate = new Date(
      this.checkInOutDetails[0]?.['all_checks']?.[index]?.created_at
    ).toDateString();
    const prevDate = new Date(
      this.checkInOutDetails[0]?.['all_checks']?.[index - 1]?.created_at
    ).toDateString();
    return currentDate !== prevDate;
  }

  isNewDay(index: number): boolean {
    if (index === 0) return true;
    const currentDate = new Date(
      this.checkInOutDetails[index]?.date
    ).toDateString();
    const prevDate = new Date(
      this.checkInOutDetails[index - 1]?.date
    ).toDateString();
    return currentDate !== prevDate;
  }

  hasKeyInAllObjects(): boolean {
    // checkStatus.filter
    // this.filteredParams.execid
    return this.checkInOutDetails?.some((item) =>
      item.hasOwnProperty('all_checks')
    );
  }

  @ViewChild('checkInPreviewModal') checkInPreviewModal;
  checkInPreviewDetails;
  onViewCheckInModal(checkStatus) {
    this.checkInPreviewDetails = checkStatus;
    this.checkInPreviewModal.present();
  }

  timer: string = '00:00:00 Hrs';
  private intervalId: any;
  startTimer(checkInTime: Date) {
    this.stopTimer();
    this.intervalId = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - checkInTime.getTime()) / 1000); // in seconds
      this.timer = this.formatTime(diff);
    }, 1000);
  }

  formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')} Hrs`;
  }

  stopTimer() {
    if (this.intervalId) {
      this.timer = '00:00:00 Hrs';
      clearInterval(this.intervalId);
    }
  }

  onExecCheckInOutDetails(checkStatus) {
    this.filteredParams.execname = checkStatus.name;
    this.filteredParams.execid = checkStatus.id;
    this.filteredParams.isExecCheckInOutDetails = 'true';
    this.addQueryParams();
  }

  dateModify(modifyingDate) {
    const date = new Date(modifyingDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // settingSelectedDate() {
  //   if (this.filteredParams.fromdate != '') {
  //     const fromDate = new Date(this.filteredParams.fromdate);
  //     const toDate = new Date(this.filteredParams.todate);
  //     this.dateRange = [fromDate, toDate];
  //   } else if (this.filteredParams.fromdate == '') {
  //     this.dateRange = null;
  //   }
  // }
  canScroll;
  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.scrollContent.getScrollElement().then((scrollEl) => {
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

  removeDateFilter() {
    this.dateRange = {
      fromdate: null as Date | null,
      todate: null as Date | null,
    };
    this.filteredParams.isDateFilter = 'today';
    this.filteredParams.fromdate = new Date().toLocaleDateString('en-CA');
    this.filteredParams.todate = new Date().toLocaleDateString('en-CA');
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

  ngOnDestroy() {
    this.sharedService.dismissAllOverlays();
  }
}

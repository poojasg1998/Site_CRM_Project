import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  IonModal,
  Platform,
  PopoverController,
} from '@ionic/angular';
import Swal from 'sweetalert2';
import { SharedService } from '../shared.service';
import { interval, Subscription } from 'rxjs';
import { CheckInOutPhotoCaptureComponent } from '../check-in-out-photo-capture/check-in-out-photo-capture.component';
import { AuthServiceService } from '../auth-service.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation, Position } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';
import { App, AppState } from '@capacitor/app';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import {
  NativeSettings,
  AndroidSettings,
  IOSSettings,
} from 'capacitor-native-settings';
@Component({
  selector: 'app-employee-attendance',
  templateUrl: './employee-attendance.component.html',
  styleUrls: ['./employee-attendance.component.scss'],
})
export class EmployeeAttendanceComponent implements OnInit {
  isPhotoModalOpen = false;
  ischeck_in_AlertModal = false;
  lastBreakData = [];
  showSpinner = false;
  @ViewChild('dashboard_custDate_modal') dashboard_custDate_modal: IonModal;
  @ViewChild('dashboard_fromDate_modal') dashboard_fromDate_modal: IonModal;
  @ViewChild('dashboard_toDate_modal') dashboard_toDate_modal: IonModal;
  @ViewChild(CheckInOutPhotoCaptureComponent)
  CheckInOutPhotoCaptureComponent!: CheckInOutPhotoCaptureComponent;
  showFromDateError = false;
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
  depId;
  checkInOutDetails;
  dateRange = {
    fromdate: null as Date | null,
    todate: null as Date | null,
  };
  isOnCallDetailsPage = false;
  breakData: any;
  loggedName;

  constructor(
    private popoverController: PopoverController,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private sharedService: SharedService,
    private authService: AuthServiceService,
    private http: HttpClient,
    private alertController: AlertController
  ) {
    App.addListener('resume', () => {
      this.getCurrentLocation1();
    });
    // this.startLocationWatch();
  }

  watchId;
  isLocationAlertOpen = false;

  // async startLocationWatch() {
  //   if (this.watchId) return;

  //   // Start watching position
  //   this.watchId = Geolocation.watchPosition(
  //     { enableHighAccuracy: true, timeout: 10000 },
  //     (position, error) => {
  //       if (error) {
  //         // GPS OFF or permission denied
  //         this.showEnableLocationAlert();
  //       } else {
  //         console.log('Location active', position);
  //         if (this.isLocationAlertOpen) {
  //           this.isLocationAlertOpen = false;
  //         }
  //       }
  //     }
  //   );

  //   // Periodically check permission (every 5 sec)
  //   setInterval(() => this.checkLocationStatus(), 5000);
  // }
  // async checkLocationStatus() {
  //   const perm = await Geolocation.checkPermissions();

  //   if (perm.location !== 'granted') {
  //     this.showEnableLocationAlert();
  //   }
  // }
  unsubscribe;
  ngOnInit() {
    //  App.openSettings();
    this.getCurrentLocation1();

    this.activeRoute.queryParams.subscribe((params) => {
      this.loggedName = localStorage.getItem('Name');
      if (params['isOnCallDetailsPage'] == 'true') {
        this.isOnCallDetailsPage = true;
      } else {
        this.isOnCallDetailsPage = false;
      }
      this.depId = localStorage.getItem('Department');
      this.getqueryParam();
      this.showSpinner = true;
      this.getEmployeePuchData();
    });
  }

  async getCurrentLocation1() {
    try {
      const perm = await Geolocation.checkPermissions();
      if (perm.location !== 'granted') {
        await Geolocation.requestPermissions();
      }

      await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });
    } catch (err) {
      // GPS is OFF or unavailable

      this.showEnableLocationAlert();
    }
  }

  async showEnableLocationAlert() {
    const alert = await this.alertController.create({
      header: 'Enable Location',
      message: 'Location is required to continue using this app.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Enable Location',
          handler: () => {
            this.showSpinner = true;
            this.openLocationSettings();
            this.showSpinner = false;
            this.dismissLocationAlert();
          },
        },
      ],
    });

    await alert.present();
  }
  private locationAlert: HTMLIonAlertElement | null = null;
  async dismissLocationAlert() {
    if (this.locationAlert) {
      await this.locationAlert.dismiss();
      this.locationAlert = null; // clear reference
    }
  }
  openLocationSettings() {
    NativeSettings.open({
      optionAndroid: AndroidSettings.Location,
      optionIOS: IOSSettings.App,
    });
  }
  selectDateFilter(dateType) {
    this.filteredParams.selectedDay = '';
    dateType != 'custom' &&
    dateType != 'customfromDate' &&
    dateType != 'customtoDate'
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
      this.filteredParams.fromdate = new Date().toLocaleDateString('en-CA');
      this.filteredParams.todate = new Date().toLocaleDateString('en-CA');
    } else if (dateType == 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdayDate = yesterday.toLocaleDateString('en-CA');
      this.filteredParams.fromdate = yesterdayDate;
      this.filteredParams.todate = yesterdayDate;
    } else if (dateType == 'lastsevenDay') {
      const lastSeventhDate = new Date();
      lastSeventhDate.setDate(lastSeventhDate.getDate() - 7);
      const seventhDate = lastSeventhDate.toLocaleDateString('en-CA');
      this.filteredParams.fromdate = seventhDate;
      this.filteredParams.todate = new Date().toLocaleDateString('en-CA');
      this.filteredParams.isExecCheckInOutDetails = 'false';
    } else if (dateType === 'custom') {
      // this.filteredParams.isDateFilter = 'custom';
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
      this.dashboard_fromDate_modal?.dismiss();
      return;
    } else if (dateType == 'customtoDate') {
      this.filteredParams.isDateFilter = 'custom';
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
  async openFromDate() {
    await this.dashboard_toDate_modal?.dismiss();
    await this.dashboard_fromDate_modal.present();
  }

  handleToDateClick() {
    if (!this.dateRange.fromdate) {
      this.showFromDateError = true;
      return;
    }

    this.showFromDateError = false;
    this.openToDate();
  }
  async openToDate() {
    await this.dashboard_fromDate_modal?.dismiss();
    await this.dashboard_toDate_modal.present();
  }
  onmodaldismiss() {
    this.dashboard_fromDate_modal?.dismiss();
    this.dashboard_toDate_modal?.dismiss();
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

  reset() {
    this.filteredParams = {
      fromdate: new Date().toLocaleDateString('en-CA'),
      todate: new Date().toLocaleDateString('en-CA'),
      isDateFilter: 'today',
      execid: '',
      isExecCheckInOutDetails: 'false',
      execname: '',
      selectedDay: '',
      limit: 0,
      limitrows: 20,
    };
    this.dateRange = {
      fromdate: null as Date | null,
      todate: null as Date | null,
    };
    this.addQueryParams();
  }

  break_status = '';
  onbreak(break_status) {
    this.getCurrentLocation1();
    this.mainCheckout = false;
    this.break_status = break_status;
    // this.photoCaptureModal.present();
    if (break_status == '0') {
      this.stopBreakTimer();
    }
    this.isPhotoModalOpen = true;
  }
  //PHOTO CAPTURE LOCATION PUCH DATA API
  employeePunchData = [];
  // @ViewChild('check_in_AlertModal') check_in_AlertModal;
  timer: string = '00:00:00 Hrs';
  private intervalId: any;
  private breakIntervalId: any;
  // @ViewChild('photoCaptureModal', { static: false })
  // photoCaptureModal!: IonModal;
  capturedImage;
  isFetchingLocation = false;
  latitude;
  file;
  address;
  longitude;
  errorMsg;
  isCheckInOutInProgress = false;
  checkStatus = '';
  isCheckInInProgress;
  todayDate = new Date();
  breakTimer = '00:00 min';
  startTimer(checkInTime: Date) {
    this.stopTimer();
    this.intervalId = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - checkInTime.getTime()) / 1000); // in seconds
      this.timer = this.formatTime(diff);

      if (diff >= 1 * 60) {
        this.onFortyMinutesCompleted();
      } else {
      }
    }, 1000);
  }

  startBreakTimer(breakStartTime) {
    this.stopBreakTimer();
    this.breakIntervalId = setInterval(() => {
      const now = new Date();
      const diff = Math.floor(
        (now.getTime() - breakStartTime.getTime()) / 1000
      ); // in seconds
      this.breakTimer = this.formatBreakTime(diff);

      // if (diff >= 1 * 60) {
      //   console.log('40 minutes completed');
      //   this.onFortyMinutesCompleted();
      // } else {
      //   console.log('niot');
      // }

      // if (diff >= 15 * 60) {
      //   this.onFifteenMinutesExceeded(true);
      // } else {
      //   this.onFifteenMinutesExceeded(false);
      // }
    }, 1000);
  }
  isBreakExceeded15Min(): boolean {
    if (!this.breakTimer) return false;

    let totalSeconds = 0;

    if (this.breakTimer.includes('min')) {
      // MM:SS min
      const time = this.breakTimer.replace(' min', '');
      const [mm, ss] = time.split(':').map(Number);
      totalSeconds = mm * 60 + ss;
    } else {
      // HH:MM:SS
      const cleanTime = this.breakTimer.replace(' hrs', '').trim();
      const [hh, mm, ss] = cleanTime.split(':').map(Number);

      totalSeconds = hh * 3600 + mm * 60 + ss;
    }

    return totalSeconds >= 15 * 60;
  }
  isBreakExceeded30Min(): boolean {
    if (!this.breakTimer) return false;

    let totalSeconds = 0;

    if (this.breakTimer.includes('min')) {
      // MM:SS min
      const time = this.breakTimer.replace(' min', '');
      const [mm, ss] = time.split(':').map(Number);
      totalSeconds = mm * 60 + ss;
    } else {
      // HH:MM:SS
      const [hh, mm, ss] = this.breakTimer.split(':').map(Number);
      totalSeconds = hh * 3600 + mm * 60 + ss;
    }

    return totalSeconds >= 30 * 60; // 30 minutes
  }

  formatBreakTime(totalSeconds: number): string {
    if (totalSeconds < 3600) {
      // Less than 1 hour → MM:SS
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${this.pad(minutes)}:${this.pad(seconds)} min`;
    } else {
      // 1 hour or more → HH:MM:SS
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)} hrs`;
    }
  }

  pad(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }
  stopBreakTimer() {
    if (this.breakIntervalId) {
      this.breakTimer = '00:00 min';
      clearInterval(this.breakIntervalId);
    }
  }
  stopTimer() {
    if (this.intervalId) {
      this.timer = '00:00:00 Hrs';
      clearInterval(this.intervalId);
    }
  }
  onFortyMinutesCompleted() {}

  formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')} Hrs`;
  }
  mainCheckout = false;
  onCheckOut() {
    Swal.fire({
      title: 'Do you want to continue?',
      text: 'Checking out now will be considered a half day.',
      icon: 'warning',
      heightAuto: false,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Check-Out!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.mainCheckout = true;
        // this.photoCaptureModal.present();
        this.isPhotoModalOpen = true;
      }
    });
  }

  getEmployeePuchData() {
    const params = {
      execid: localStorage.getItem('UserId'),
      loginid: localStorage.getItem('UserId'),
      from: this.filteredParams.fromdate,
      to: this.filteredParams.todate,
      limit: 0,
      limitrows: 30,
    };
    this.sharedService.getPunchData(params).subscribe((resp) => {
      if (resp['status'] == 'true') {
        this.employeePunchData = resp['executive'];
        this.breakData = resp['executive'][1]?.Break_data || [];
        if (resp['executive'][0]['login'] == null) {
          // this.check_in_AlertModal.present();
          this.showSpinner = false;
          this.ischeck_in_AlertModal = true;
        } else {
          const dbTimeString = resp['executive'][1]['login'];
          const [datePart, timePart] = dbTimeString.split(' ');
          const [year, month, day] = datePart.split('-').map(Number);
          const [hours, minutes, seconds] = timePart.split(':').map(Number);

          // JS months are 0-based!
          const checkInTime = new Date(
            year,
            month - 1,
            day,
            hours,
            minutes,
            seconds
          );
          this.startTimer(checkInTime);
          const lastExecutive = resp['executive'][resp['executive'].length - 1];
          this.lastBreakData = lastExecutive?.Break_data?.at(-1);
          const lastBreakEnd = this.lastBreakData?.['end'];
          if (lastBreakEnd == 'Still on Break') {
            const dbTimeString = this.lastBreakData?.['start'];
            const [datePart, timePart] = dbTimeString.split(' ');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hours, minutes, seconds] = timePart.split(':').map(Number);

            // JS months are 0-based!
            const breakTimer = new Date(
              year,
              month - 1,
              day,
              hours,
              minutes,
              seconds
            );
            this.startBreakTimer(breakTimer);
          }

          setTimeout(() => {
            this.showSpinner = false;
          }, 1000);
        }
      } else {
        this.employeePunchData = [];
        this.showSpinner = false;
      }
    });
  }
  logOut() {
    this.sharedService
      .logOut(
        localStorage.getItem('session_id'),
        localStorage.getItem('UserId')
      )
      .subscribe(() => {});
    this.popoverController.dismiss();
    // this.check_in_AlertModal.dismiss();
    this.ischeck_in_AlertModal = false;
    this.sharedService.loginMethodname = 'login';
    // localStorage.clear();
    Object.keys(localStorage).forEach((key) => {
      if (key !== 'Mail' && key !== 'Password' && key !== 'useBiometric') {
        localStorage.removeItem(key);
      }
    });
    this.authService.logout();
    this.router.navigate(['/']);
  }

  onCheck_inPhotoCapture() {
    // this.photoCaptureModal.present();
    this.isPhotoModalOpen = true;
  }

  async takePicture(event) {
    event?.stopPropagation();
    event?.preventDefault();
    try {
      const image = await Camera.getPhoto({
        quality: 60,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });
      this.capturedImage = image.dataUrl;
      const base64String = image.dataUrl.split(',')[1];
      const dataUrl = image.dataUrl;
      const mimeType = dataUrl.substring(
        dataUrl.indexOf(':') + 1,
        dataUrl.indexOf(';')
      );
      const extension = mimeType.split('/')[1];
      this.isFetchingLocation = true;
      this.getCurrentLocation();
      const now = new Date();
      const dateTimeString = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${
        now.getHours() % 12 || 12
      }-${String(now.getMinutes()).padStart(2, '0')}${
        now.getHours() >= 12 ? 'PM' : 'AM'
      }`;
      const random = Math.floor(Math.random() * 1000000);
      const uniqueName = `image_${dateTimeString}_${random}.${extension}`;

      // Compress with canvas resizing
      this.compressBase64Image(dataUrl, mimeType, 0.6).then(
        (compressedBase64) => {
          const compressedBase64String = compressedBase64.split(',')[1];
          this.file = this.base64ToFile(
            compressedBase64String,
            uniqueName,
            mimeType
          );
        }
      );
    } catch (error) {
      console.error('Camera error:', error);
    }
  }
  compressBase64Image(
    base64: string,
    mimeType: string,
    quality = 0.6
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64;

      img.onload = () => {
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;

        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio
        if (width > height && width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        } else if (height > width && height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas not supported');

        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL(mimeType, quality);
        resolve(compressedBase64);
      };

      img.onerror = (err) => reject(err);
    });
  }
  async getCurrentLocation() {
    try {
      const permission = await Geolocation.checkPermissions();
      if (permission.location === 'denied') {
        await Geolocation.requestPermissions();
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });

      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;

      this.getAddressFromCoords(this.latitude, this.longitude);
    } catch (err) {
      this.isFetchingLocation = false;

      this.address =
        'Homes247, 21/1, Cunningham Road, Shivajinagar, Bengaluru - 560001, Karnataka, India ';
      this.errorMsg = 'Error getting location: ' + err;
    }
  }
  base64ToFile(base64: string, fileName: string, mimeType: string): File {
    const byteString = atob(base64);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([intArray], { type: mimeType });
    return new File([blob], fileName, {
      type: mimeType,
      lastModified: Date.now(),
    });
  }
  getAddressFromCoords(lat: number, lng: number) {
    // https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json

    // https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat+","+lng}&key=AIzaSyBNv_ayHtDYwhWHUKVZQ01tm8us00uxWIk

    // this.http.get(`https://us1.locationiq.com/v1/reverse?key=pk.b5750a8cdb90ab0a2a443d6929a086d4&lat=${lat}&lon=${lng}&format=json`).subscribe((res: any) => {
    //   console.log(res)
    //     this.address = res.display_name
    // });
    // this.http
    //   .get(
    //     `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=02c57990ba84464f92881b3694fb465c`
    //   )
    //   .subscribe((res: any) => {
    //     console.log(res);
    //     this.isFetchingLocation = false;
    //     this.address = res.results[0]?.formatted;
    //   });

    // this.http
    //   .get(
    //     `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=02c57990ba84464f92881b3694fb465c`
    //   )
    //   .subscribe({
    //     next: (res: any) => {
    //       console.log('Reverse geocode SUCCESS', res);
    //       this.isFetchingLocation = false;
    //       this.address = res.results[0]?.formatted;
    //     },
    //     error: (err) => {
    //       console.error('Reverse geocode ERROR', err);
    //       this.isFetchingLocation = false;
    //     },
    //     complete: () => {
    //       this.address = console.log('Reverse geocode COMPLETED');
    //     },
    //   });

    this.http
      .get(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=02c57990ba84464f92881b3694fb465c`
      )
      .subscribe({
        next: (res: any) => {
          console.log('Reverse geocode SUCCESS', res);
          this.address = res.results[0]?.formatted;
          this.isFetchingLocation = false;
        },
        error: (err) => {
          console.error('Reverse geocode ERROR', err);
          this.isFetchingLocation = false;
        },
        complete: () => {
          console.log('Reverse geocode COMPLETED');
          this.isFetchingLocation = false;
        },
      });
  }

  onCheckInOut(checkStatus: 'in' | 'out') {
    this.isCheckInInProgress = true;
    const img_extension = this.file.name.split('.');
    if (
      img_extension[1] != 'png' &&
      img_extension[1] != 'jpg' &&
      img_extension[1] != 'jpeg'
    ) {
      Swal.fire({
        title:
          'Invalid file format. Please upload an image in JPG or PNG format only.',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'OK',
      });
    } else {
      if (this.isCheckInOutInProgress) {
        return; // Prevent duplicate API call
      }
      this.isCheckInOutInProgress = true;

      const formData = new FormData();
      const isCheckIn = checkStatus === 'in';
      checkStatus === 'in'
        ? (this.checkStatus = 'check-in')
        : (this.checkStatus = 'check-out');

      formData.append('execid', localStorage.getItem('UserId') || '');
      formData.append('device_type', '1');
      if (this.mainCheckout) {
      } else {
        formData.append(
          'break_time',
          this.isBetween1110And1145()
            ? '1'
            : this.isBetween12And3()
            ? '2'
            : this.isBetween335And415()
            ? '3'
            : ''
        );
      }
      formData.append('latitude', this.latitude);
      formData.append('longitude', this.longitude);
      formData.append('address', this.address);
      if (localStorage.getItem('Department') == '10006' && !this.mainCheckout) {
        formData.append('check_status', '1');
        if (this.break_status) {
          formData.append('break_status', this.break_status);
        }
      } else {
        formData.append('check_status', isCheckIn ? '1' : '0');
      }
      formData.append('selfie_img', this.file);

      if (
        this.address !== '' &&
        this.latitude !== '' &&
        this.longitude !== ''
      ) {
        this.sharedService.postlocationapi(formData).subscribe({
          next: (response) => {
            this.isCheckInOutInProgress = false; // Reset flag
            if (isCheckIn) {
              const now = new Date();
              this.startTimer(now);
              localStorage.setItem('checkInTime', now.toISOString());
            } else {
              localStorage.removeItem('checkInTime');
              this.stopTimer();
            }

            if (isCheckIn && this.timer != '00:00:00 Hrs') {
              // this.photoCaptureModal.dismiss();
              this.isPhotoModalOpen = false;
              // this.check_in_AlertModal.dismiss();
              this.ischeck_in_AlertModal = false;
            } else {
              // this.photoCaptureModal.dismiss();
              // this.check_in_AlertModal.dismiss();
              this.ischeck_in_AlertModal = false;
              this.isPhotoModalOpen = false;
            }

            if (response['status'] === 'True') {
              this.latitude = '';
              this.longitude = '';
              this.errorMsg = '';
              this.address = '';
              this.file = '';
              this.capturedImage = '';
              location.reload();
            }
          },
          error: () => {
            this.isCheckInOutInProgress = false; // Ensure flag reset on error
          },
        });
      } else {
        this.isCheckInOutInProgress = false; // Reset flag if validation fails
      }
    }
  }
  isBetween1110And1145(): boolean {
    const now = new Date();

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = 11 * 60 + 10; // 11:10 AM
    const endMinutes = 11 * 60 + 45; // 11:45 AM

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }
  isBetween12And3(): boolean {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = 12 * 60; // 12:00 PM
    const endMinutes = 15 * 60; // 3:00 PM

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  isBetween930And1145(): boolean {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = 9 * 60 + 30; // 9:30 AM
    const endMinutes = 11 * 60 + 45; // 11:45 AM

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }
  isBetween1145And3(): boolean {
    const now = new Date();

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = 11 * 60 + 45; // 11:45 AM
    const endMinutes = 15 * 60; // 3:00 PM

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  isAfter3(): boolean {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const threePM = 15 * 60; // 3:00 PM

    return currentMinutes > threePM;
  }
  isBetween430And405(): boolean {
    const now = new Date();

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = 17 * 60 + 20; // 3:35 PM
    const endMinutes = 17 * 60 + 30; // 4:15 PM

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  isBetween335And415(): boolean {
    const now = new Date();

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = 15 * 60 + 35; // 3:35 PM
    const endMinutes = 16 * 60 + 15; // 4:15 PM

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  isBetween3And410(): boolean {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const after3 = 15 * 60; // 3:00 PM
    const before410 = 16 * 60 + 10; // 4:10 PM

    return currentMinutes >= after3 && currentMinutes < before410;
  }

  isBetween1120And3(): boolean {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const after1120 = 11 * 60 + 20; // 11:20 AM
    const before3 = 15 * 60; // 3:00 PM

    return currentMinutes > after1120 && currentMinutes < before3;
  }
  isExceeded15Minutes(startTime: string, endTime: string): boolean {
    const start = new Date(startTime.replace(' ', 'T'));
    const end = new Date(endTime.replace(' ', 'T'));

    const diffMs = Math.abs(end.getTime() - start.getTime());
    const diffMinutes = diffMs / (1000 * 60);

    return diffMinutes > 15;
  }

  isExceededMinutes(
    startTime: string,
    endTime: string,
    limitMinutes: number = 30
  ): boolean {
    const start = new Date(startTime.replace(' ', 'T'));
    const end = new Date(endTime.replace(' ', 'T'));

    const diffMs = Math.abs(end.getTime() - start.getTime());
    const diffMinutes = diffMs / (1000 * 60);

    return diffMinutes > limitMinutes;
  }

  formattedDuration(duration): string {
    if (!duration) return '00:00';

    const [hh, mm, ss] = duration.split(':');

    return Number(hh) > 0
      ? `${hh}:${mm}:${ss}` // show hours
      : `${mm}:${ss}`; // hide hours
  }

  // getAvailableRange(start: string): string {
  //   const startDate = new Date(start?.replace(' ', 'T'));
  //   const endDate = new Date(startDate);
  //   endDate.setMinutes(endDate?.getMinutes() + 30);

  //   const format = (d: Date) =>
  //     d.toLocaleTimeString('en-US', {
  //       hour: 'numeric',
  //       minute: '2-digit',
  //       hour12: true,
  //     });

  //   return `${format(startDate)} - ${format(endDate)}`;
  // }

  getCurrentBreakSlot(): string | null {
    if (this.isBetween1110And1145()) return '1'; // Morning
    if (this.isBetween12And3()) return '2'; // Lunch
    if (this.isBetween335And415()) return '3'; // Evening
    return null;
  }
  canTakeBreak(): boolean {
    const currentSlot = this.getCurrentBreakSlot();
    // console.log(currentSlot);

    // Outside allowed time
    if (!currentSlot) return false;

    // If break already completed for THIS slot → disable
    if (this.isBreakCompletedForSlot(currentSlot)) return false;

    // If currently on break → disable Take Break
    if (this.lastBreakData?.['end'] === 'Still on Break') return false;

    return true;
  }
  isBreakCompletedForSlot(slot: string): boolean {
    return this.breakData?.some(
      (b) => b.break_time == slot && b.status === 'Completed'
    );
  }

  @ViewChild('checkInPreviewModal') checkInPreviewModal;
  checkInPreviewDetails;
  onViewCheckInModal(checkStatus, isStartimg) {
    this.checkInPreviewDetails = { ...checkStatus, isStartimg: isStartimg };
    this.checkInPreviewModal.present();
  }
  ngOnDestroy() {
    // Clear interval to avoid memory leaks
    if (this.unsubscribe) this.unsubscribe.remove();
  }
}

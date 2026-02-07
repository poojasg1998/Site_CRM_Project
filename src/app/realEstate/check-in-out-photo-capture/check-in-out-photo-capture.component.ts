import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { AlertController, IonModal, PopoverController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation, Position } from '@capacitor/geolocation';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import {
  NativeSettings,
  AndroidSettings,
  IOSSettings,
} from 'capacitor-native-settings';
import { AuthServiceService } from '../auth-service.service';
import { SharedService } from '../shared.service';

declare var google: any;
@Component({
  selector: 'app-check-in-out-photo-capture',
  templateUrl: './check-in-out-photo-capture.component.html',
  styleUrls: ['./check-in-out-photo-capture.component.scss'],
})
export class CheckInOutPhotoCaptureComponent implements OnInit {
  break_status;
  localStorage = localStorage;
  latitude;
  longitude;
  errorMsg;
  address;
  todayDate = new Date();
  file;
  capturedImage: string | undefined;
  depId;
  employeePunchData;
  constructor(
    private authService: AuthServiceService,
    private router: Router,
    private http: HttpClient,
    private sharedService: SharedService,
    private popoverController: PopoverController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.depId = this.localStorage.getItem('Department');
    this.loadGoogleMapsScript();
    this.getcheckInStatus();
    this.getCurrentLocation1();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['break_status'] && changes['break_status'].currentValue) {
    }
  }
  getEmployeePuchData() {
    const params = {
      execid: localStorage.getItem('UserId'),
      loginid: localStorage.getItem('UserId'),
      from: this.todayDate.toLocaleDateString('en-CA'),
      to: this.todayDate.toLocaleDateString('en-CA'),
      limit: 0,
      limitrows: 30,
    };
    this.sharedService.getPunchData(params).subscribe((resp) => {
      this.employeePunchData = resp['executive'];

      if (resp['executive'][0]['login'] == null) {
        this.check_in_AlertModal.present();
      } else {
        const dbTimeString = resp['executive'][0]['login'];
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
      }
    });
  }

  @ViewChild('photoCaptureModal', { static: false })
  photoCaptureModal!: IonModal;
  onCheck_inPhotoCapture() {
    this.photoCaptureModal.present();
  }
  isCheckInInProgress;
  @ViewChild('check_in_AlertModal') check_in_AlertModal;
  check_in_AlertModal1;
  getcheckInStatus() {
    const param = {
      execid: localStorage.getItem('UserId'),
      loginid: localStorage.getItem('UserId'),
      from: this.todayDate.toLocaleDateString('en-CA'),
      to: this.todayDate.toLocaleDateString('en-CA'),
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
      this.isCheckInInProgress = false;
      if (
        response['data']?.[0]?.['status'] == 'Absent' ||
        response['data']?.[0]?.['all_checks'][
          response['data']?.[0]?.['all_checks'].length - 1
        ]['check_status'] == '0'
      ) {
        this.check_in_AlertModal.present();
        this.check_in_AlertModal1 = true;
      } else {
        if (
          response['data']?.[0]?.['all_checks']?.['0']?.['check_status'] == '1'
        ) {
        }
        const dbTimeString =
          response['data']?.[0]['all_checks'][
            response['data'][0]['all_checks'].length - 1
          ]['created_at'];
        // Convert to a Date in LOCAL time:
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
      }
      this.todayDate = new Date();
    });
  }

  async takePicture(event) {
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
      this.errorMsg = 'Error getting location: ' + err;
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

  getAddressFromCoords(lat: number, lng: number) {
    // https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json

    // https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat+","+lng}&key=AIzaSyBNv_ayHtDYwhWHUKVZQ01tm8us00uxWIk

    // this.http.get(`https://us1.locationiq.com/v1/reverse?key=pk.b5750a8cdb90ab0a2a443d6929a086d4&lat=${lat}&lon=${lng}&format=json`).subscribe((res: any) => {
    //   console.log(res)
    //     this.address = res.display_name
    // });
    this.http
      .get(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=02c57990ba84464f92881b3694fb465c`
      )
      .subscribe((res: any) => {
        this.isFetchingLocation = false;
        this.address = res.results[0]?.formatted;
      });
  }

  locationError: string | null = null;
  isLoading: boolean = false;

  loadGoogleMapsScript() {
    // Check if script is already loaded
    if (typeof google !== 'undefined' && google.maps) {
      console.log('Google Maps script already loaded.');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBNv_ayHtDYwhWHUKVZQ01tm8us00uxWIk&libraries=places&callback=initMap`; // 'places' library is useful for autocomplete, but not strictly needed for basic geocoding
    script.async = true;
    script.defer = true;
    script.onload = () => {};
    script.onerror = (error) => {
      this.locationError =
        'Failed to load Google Maps. Check your API key or network.';
    };
    document.head.appendChild(script);
  }
  watchId;
  businessName;

  timer: string = '00:00:00 Hrs';
  private intervalId: any;
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
  onFortyMinutesCompleted() {}

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

  onCheckOut() {
    if (this.localStorage.getItem('Department') === '10006') {
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
          this.photoCaptureModal.present();
        }
      });
    } else {
      this.photoCaptureModal.present();
    }
  }

  isCheckInOutInProgress = false;
  isFetchingLocation = false;
  checkStatus = '';
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
      formData.append('latitude', this.latitude);
      formData.append('longitude', this.longitude);
      formData.append('address', this.address);
      if (this.localStorage.getItem('Department') == '10006') {
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
              this.photoCaptureModal.dismiss();
              this.check_in_AlertModal.dismiss();
            } else {
              this.photoCaptureModal.dismiss();
              this.check_in_AlertModal.dismiss();
            }

            if (response['status'] === 'True') {
              this.latitude = '';
              this.longitude = '';
              this.errorMsg = '';
              this.address = '';
              this.file = '';
              this.capturedImage = '';
              this.getcheckInStatus();
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

  logOut() {
    this.sharedService
      .logOut(
        this.localStorage.getItem('session_id'),
        this.localStorage.getItem('UserId')
      )
      .subscribe(() => {});
    this.popoverController.dismiss();
    this.check_in_AlertModal.dismiss();
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

  ngOnDestroy() {
    this.check_in_AlertModal.dismiss();
    this.sharedService.dismissAllOverlays();
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
            this.openLocationSettings();
          },
        },
      ],
    });

    await alert.present();
  }

  openLocationSettings() {
    NativeSettings.open({
      optionAndroid: AndroidSettings.Location,
      optionIOS: IOSSettings.App,
    });
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { App } from '@capacitor/app';
import { PrivacyScreen } from '@capacitor-community/privacy-screen';
import { MandateService } from './mandate-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthServiceService } from './auth-service.service';
import { SharedService } from './shared.service';
import { RetailServiceService } from './retail-service.service';
import { forkJoin, interval, Subscription, switchMap } from 'rxjs';
import { StatusBar, Style } from '@capacitor/status-bar';
import { CommonService } from './common.service';
import { EchoService } from './echo.service';
import { Network, NetworkStatus } from '@capacitor/network';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  localStorage = localStorage;
  isLastOneHrReportOpen = false;
  isMenuOpen = true;
  showSpinner = false;
  isAdmin = false;
  isCP = false;
  isRetail = false;
  unquieleadcounts;
  apiAlreadyCalled = false;
  isOnCallDetailsPage = false;
  callStatus: any;
  constructor(
    private _echoService: EchoService,
    public commonService: CommonService,
    public sharedService: SharedService,
    private mandateService: MandateService,
    private toastController: ToastController,
    private platform: Platform,
    private router: Router,
    private authService: AuthServiceService,
    private activeRoute: ActivatedRoute,
    public _retailservice: RetailServiceService
  ) {
    // this.showOfflineToast();
    // this.checkInternet();
    App.addListener('resume', () => {
      this.initNetworkListener();
    });
    this.platform.ready().then(async () => {
      await this.initializePrivacyScreen();
    });
    this.initializeApp();
  }

  isOnline = true;
  offlineToast: HTMLIonToastElement | null = null;
  async initNetworkListener() {
    const status = await Network.getStatus();
    this.isOnline = status.connected;

    if (!this.isOnline) {
      await this.showOfflineToast();
    }

    Network.addListener('networkStatusChange', async (status) => {
      if (status.connected === this.isOnline) return;

      this.isOnline = status.connected;

      if (!this.isOnline) {
        await this.showOfflineToast();
      } else {
        await this.dismissOfflineToast();
        await this.showOnlineToast();
      }
    });
  }
  async dismissOfflineToast() {
    if (this.offlineToast) {
      await this.offlineToast.dismiss();
      this.offlineToast = null;
    }
  }
  async showOnlineToast() {
    const toast = await this.toastController.create({
      message: 'Back Online',
      color: 'success',
      duration: 2000,
    });
    toast.present();
  }

  async showOfflineToast() {
    if (this.offlineToast) return;

    this.offlineToast = await this.toastController.create({
      message: 'No Internet Connection',
      color: 'danger',
      position: 'top',
      duration: 0, // stays until dismissed
    });

    await this.offlineToast.present();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      App.addListener('pause', () => {
        const timestamp = new Date().getTime();
        localStorage.setItem('lastPausedTime', timestamp.toString());
      });

      App.addListener('resume', () => {
        const storedTime = localStorage.getItem('lastPausedTime');
        if (storedTime) {
          const lastPausedTime = parseInt(storedTime, 10);
          const currentTime = new Date().getTime();
          const timeDifference = (currentTime - lastPausedTime) / (1000 * 60);
          if (timeDifference >= 30) {
            if (localStorage.getItem('isLoggedIn') == 'true') {
              if (localStorage.getItem('Role') == '1') {
                this.router.navigate(['home'], {
                  queryParams: {
                    htype: 'mandate',
                    propid: !localStorage.getItem('ranavPropId')
                      ? '16793'
                      : '28773',
                  },
                });
                localStorage.setItem('projectName', 'GR Sitara');
              } else if (
                localStorage.getItem('Role') == '50001' ||
                localStorage.getItem('Role') == '50002'
              ) {
                this.router.navigate(['home'], {
                  queryParams: {
                    htype: 'mandate',
                    propid: !localStorage.getItem('ranavPropId')
                      ? '16793'
                      : '28773',
                  },
                });
              } else if (
                localStorage.getItem('Role') == '50009' ||
                localStorage.getItem('Role') == '50010' ||
                localStorage.getItem('Role') == '50003' ||
                localStorage.getItem('Role') == '50004'
              ) {
                this.router.navigate(['retail-dashboard'], {
                  queryParams: {
                    htype: 'retail',
                  },
                });
              }
            } else {
              this.router.navigate(['/'], {
                queryParams: {
                  htype: 'mandate',
                  propid: !localStorage.getItem('ranavPropId')
                    ? '16793'
                    : '28773',
                },
              });
            }
          }
        }
      });
    });
  }

  // To disable and enable the screen shot bsed on login
  async initializePrivacyScreen() {
    localStorage.getItem('Role');
    if (localStorage.getItem('Role') === '1') {
      // Screenshot enabled
      PrivacyScreen.disable();
    } else {
      // Screensot disabled
      PrivacyScreen.enable();
    }
  }

  isDetailPage;
  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  closeLastOneHrReport() {
    this.isLastOneHrReportOpen = false;
  }

  private intervalId: any;
  backgroundTime: number | null = null;
  async ngOnInit() {
    StatusBar.setBackgroundColor({ color: '#0B7AB2' });

    //log out at 10:00 PM
    setInterval(() => {
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      const currentMinutes = currentTime.getMinutes();
      if (currentHour === 22 && currentMinutes === 0) {
        this.sharedService
          .logOut(
            localStorage.getItem('session_id'),
            localStorage.getItem('UserId')
          )
          .subscribe(() => {});
        this.authService.logout();
      }
    }, 10000);
    //end

    const id = localStorage.getItem('UserId');
    this.isAdmin =
      localStorage.getItem('Role') === '1' &&
      localStorage.getItem('UserId') === '1';
    this.isCP = localStorage.getItem('cpId') === '1';
    this.sharedService.checkForUpdate(id);
    this.isLastOneHrReportOpen = false;

    this.getRetailMandateUntouchedCount();

    // App.addListener('appStateChange', (state) => {
    //   if (state.isActive) {
    //     this.sharedService.checkForUpdate(id);
    //   } else {
    //     this.sharedService.checkForUpdate(id);
    //   }
    //   if (!state.isActive) {
    //     // App goes to background
    //     alert('back');
    //     this.backgroundTime = Date.now();
    //   } else {
    //     alert('from background');
    //     // App comes to foreground
    //     if (this.backgroundTime) {
    //       const diff = (Date.now() - this.backgroundTime) / (1000 * 60); // hours
    //       if (diff >= 1) {
    //         location.reload();
    //         alert('more than one minute');
    //         // // Clear session or force restart
    //         localStorage.clear();
    //         // sessionStorage.clear();
    //         // // Navigate to login or reload
    //         // window.location.href = '/login'; // or
    //         // // App.exitApp(); // Not recommended unless absolutely required
    //       }
    //       this.backgroundTime = null;
    //     }
    //   }
    // });

    if (this.platform.is('capacitor')) {
      document.addEventListener('copy', this.disableClipboard.bind(this));
      document.addEventListener('cut', this.disableClipboard.bind(this));
    } else {
      console.warn(
        'PrivacyScreen functionality is not supported on the web platform.'
      );
    }

    this.activeRoute.queryParams.subscribe((params) => {
      if (!this.apiAlreadyCalled) {
        this.apiAlreadyCalled = true;
        // this.getLiveCall();
      }

      if (params['isOnCallDetailsPage'] == 'true') {
        this.isOnCallDetailsPage = true;
      } else {
        this.isOnCallDetailsPage = false;
      }

      if (
        localStorage.getItem('isLoggedIn') === 'true' &&
        this.localStorage.getItem('Department') != '10006'
      ) {
        this.sharedService.isMenuOpen = true;
      } else {
        this.sharedService.isMenuOpen = false;
      }

      if (params['htype'] == 'retail') {
        this.isRetail = true;
      } else {
        this.isRetail = false;
      }
      this.localStorage.getItem('Department') != '10006'
        ? this.getCallCounts()
        : '';
    });

    // this.getHourlyReport();
    // this.scheduleApiTrigger
    // this.intervalId = setInterval(() => {
    //   this.isLastOneHrReportOpen = true;
    //   this.getHourlyReport();
    // }, 20000);

    // this.isLastOneHrReportOpen = true;
    // this.getHourlyReport();
    if (!this.apiStarted) {
      // this.scheduleApiTrigger();
      // this.apiStarted = true;
    }

    this.platform.ready().then(() => {
      App.addListener('appStateChange', (state) => {
        if (state.isActive) {
          this.sharedService.checkForUpdate(id);
        } else {
          this.sharedService.checkForUpdate(id);
        }
        if (!state.isActive) {
          // App goes to background
          this.backgroundTime = Date.now();
        } else {
          // App comes to foreground
          if (this.backgroundTime) {
            const diff = (Date.now() - this.backgroundTime) / (1000 * 60 * 60);

            if (diff >= 2) {
              location.reload();
            }
            this.backgroundTime = null;
          }
        }
      });
    });
  }
  private apiStarted = false;

  // scheduleApiTrigger() {
  //   const now = new Date();
  //   const firstTriggerTime = new Date();
  //   firstTriggerTime.setHours(9, 30, 0, 0); // Start at 9:30 AM

  //   // If it's already past 9:30 AM, find the next 2-minute slot
  //   if (now >= firstTriggerTime) {
  //     while (firstTriggerTime < now) {
  //       firstTriggerTime.setMinutes(firstTriggerTime.getMinutes() + 2);
  //     }
  //   }

  //   const delay = firstTriggerTime.getTime() - now.getTime();
  //   console.log("First API trigger at:", firstTriggerTime.toLocaleTimeString());

  //   // Wait until the first trigger time
  //   setTimeout(() => {
  //     this.getHourlyReport(); // First trigger
  //     this.isLastOneHrReportOpen = true;
  //     this.intervalId = setInterval(() => {
  //       const currentTime = new Date();
  //       const currentHour = currentTime.getHours();
  //       const currentMinutes = currentTime.getMinutes();

  //       // Stop execution after 7:30 PM
  //       if (currentHour >= 19 && currentMinutes >= 30) {
  //         clearInterval(this.intervalId);
  //         console.log("API scheduling stopped.");
  //         return;
  //       }

  //       this.getHourlyReport();
  //       this.isLastOneHrReportOpen = true;
  //     }, 2 * 60 * 1000); // Every 2 minutes
  //   }, delay);
  // }

  fileSubmitingAnimation() {
    const script = document.createElement('script');
    script.src =
      'https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs';
    script.type = 'module';
    script.async = true;
    script.onload = () => {};
    document.head.appendChild(script);
  }

  scheduleApiTrigger() {
    const now = new Date();
    const firstTriggerTime = new Date();
    firstTriggerTime.setHours(9, 30, 0, 0); // First trigger at 9:30 AM

    // If it's past 9:30 AM, calculate the next available hour slot
    if (now >= firstTriggerTime) {
      while (firstTriggerTime < now) {
        firstTriggerTime.setHours(firstTriggerTime.getHours() + 1);
      }
    }

    // if (now >= firstTriggerTime) {
    //   while (firstTriggerTime < now) {
    //     firstTriggerTime.setMinutes(firstTriggerTime.getMinutes() + 1);
    //   }
    // }

    const delay = firstTriggerTime.getTime() - now.getTime();
    // Wait until the next valid time (9:30 AM or the next hour slot)
    setTimeout(() => {
      this.isAdmin = localStorage.getItem('Role') === '1';
      'ranavPropId' in localStorage
        ? ''
        : localStorage.getItem('Role') !== null
        ? this.triggerHourlyReport()
        : '';
      this.intervalId = setInterval(() => {
        const currentTime = new Date();
        const currentHour = currentTime.getHours();
        // Stop execution after 7:30 PM
        if (
          currentHour > 19 ||
          (currentHour === 19 && currentTime.getMinutes() >= 30)
        ) {
          clearInterval(this.intervalId);
          return;
        }
        'ranavPropId' in localStorage
          ? ''
          : localStorage.getItem('Role') !== null
          ? this.triggerHourlyReport()
          : '';
      }, 60 * 60 * 1000);
    }, delay);
  }

  triggerHourlyReport() {
    // this.isLastOneHrReportOpen = true;
    this.getHourlyReport();
    this.fileSubmitingAnimation();
    localStorage.setItem('lastReportTime', new Date().getTime().toString());
  }

  disableClipboard(event: ClipboardEvent) {
    event.preventDefault();
    this.presentToast();
  }

  //Function to present message for copy and cut
  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Thank you for your Valuable time! Please Try Again!',
      duration: 2000,
    });
    toast.present();
  }

  selectedReportType = 'activity';
  executivesList;
  executiveCounts;
  zeroRepExecutives;
  activityRepExeutives;
  getHourlyReport() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const now = new Date();
    now.setHours(now.getHours() - 1);

    let param1 = {
      fromdate: formattedDate,
      todate: formattedDate,
      fromtime: '',
      totime: '',
      pageid: '1',
      execid:
        localStorage.getItem('Role') === '1'
          ? ''
          : localStorage.getItem('UserId'),
      loginid: localStorage.getItem('UserId'),
    };

    let param2 = { ...param1, pageid: '2' };

    if (localStorage.getItem('Role') != null) {
      // this.showSpinner = true;

      // Fetch both reports simultaneously
      forkJoin([
        this.sharedService.getAdminHourlyReport(param1),
        this.sharedService.getAdminHourlyReport(param2),
      ]).subscribe(([resp1, resp2]) => {
        // this.showSpinner = false;

        let combinedExecutivesList = [
          ...resp1['Exec_list'],
          ...resp2['Exec_list'],
        ];

        if (localStorage.getItem('Role') == '1') {
          this.executivesList = combinedExecutivesList;
          this.zeroRepExecutives = this.executivesList.filter(
            (exec) =>
              exec.counts && exec.counts[0] && exec.counts[0].overall == '0'
          );
          this.activityRepExeutives = this.executivesList.filter(
            (exec) =>
              exec.counts && exec.counts[0] && exec.counts[0].overall > '0'
          );
        } else {
          this.executiveCounts = combinedExecutivesList;
        }
      });
    }
    this.getCountsRetail();
  }

  getCountsRetail() {
    this.unquieleadcounts = 0;
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    var totalleads = {
      assignedfrom: formattedDate,
      assignedto: formattedDate,
      statuss: 'pending',
      executid:
        localStorage.getItem('Role') === '1'
          ? ''
          : localStorage.getItem('UserId'),
      loginid: localStorage.getItem('UserId'),
    };
    this._retailservice
      .getAssignedLeadsCount(totalleads)
      .subscribe((compleads) => {
        if (compleads['status'] == 'True') {
          if (compleads['result'] && compleads['result'][0]) {
            this.unquieleadcounts =
              compleads['AssignedLeads'][0].Uniquee_counts;
          }
        } else {
          this.unquieleadcounts = 0;
        }
      });
  }

  //here we get the counts for every one hour for Mandate executives
  getCountsMandate() {
    this.unquieleadcounts = 0;
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    var totalleads = {
      assignedfrom: formattedDate,
      assignedto: formattedDate,
      statuss: 'pending',
      executid:
        localStorage.getItem('Role') === '1'
          ? ''
          : localStorage.getItem('UserId'),
      loginuser: localStorage.getItem('UserId'),
    };
    this.mandateService
      .getAssignedLeadsCounts(totalleads)
      .subscribe((compleads) => {
        if (compleads['status'] == 'True') {
          this.unquieleadcounts = compleads.AssignedLeads[0].Uniquee_counts;
        } else {
          this.unquieleadcounts = 0;
        }
      });
  }

  onDetailedReport() {
    this.isLastOneHrReportOpen = false;
    this.router.navigate(['hourly-report'], {
      queryParams: {
        htype: this.isRetail ? 'retail' : 'mandate',
        fromdate: this.getTodayDate(),
        todate: this.getTodayDate(),
      },
    });
  }

  getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Returns 'YYYY-MM-DD'
  }

  getRetailMandateUntouchedCount() {
    if (
      localStorage.getItem('Role') == '50001' ||
      localStorage.getItem('Role') == '50002'
    ) {
      this.getPendingCountsMandate();
    } else if (
      localStorage.getItem('Role') == '50009' ||
      localStorage.getItem('Role') == '50010' ||
      localStorage.getItem('Role') == '50003' ||
      localStorage.getItem('Role') == '50004'
    ) {
      this.getPendingCountsRetail();
    }
  }

  totalPendingCount = 0;

  getPendingCountsMandate() {
    this.unquieleadcounts = 0;
    var totalleads = {
      assignedfromdate: this.getTodayDate(),
      assignedtodate: this.getTodayDate(),
      status: 'pending',
      executid:
        localStorage.getItem('Role') === '1'
          ? ''
          : localStorage.getItem('UserId'),
      loginid: localStorage.getItem('UserId'),
    };

    this.mandateService
      .getAssignedLeadsCounts(totalleads)
      .subscribe((compleads) => {
        if (compleads['status'] == 'True') {
          this.totalPendingCount = compleads.AssignedLeads[0].Uniquee_counts;
        } else {
          this.totalPendingCount = 0;
        }
      });
  }

  getPendingCountsRetail() {
    this.unquieleadcounts = 0;
    var totalleads = {
      assignedfromdate: this.getTodayDate(),
      assignedtodate: this.getTodayDate(),
      status: 'pending',
      executid:
        localStorage.getItem('Role') === '1'
          ? ''
          : localStorage.getItem('UserId'),
      loginid: localStorage.getItem('UserId'),
    };

    this._retailservice
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

  getLastHourRange(): string {
    let now = new Date(); // Current time
    let oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // One hour before

    // Function to format time in 12-hour format with AM/PM
    let formatTime = (date: Date) => {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      let ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; // Convert to 12-hour format
      return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };
    return `${formatTime(oneHourAgo)} - ${formatTime(now)}`;
  }

  autoCloseTimeout: any;

  startAutoCloseTimer() {
    this.autoCloseTimeout = setTimeout(() => {
      this.isLastOneHrReportOpen = false;
    }, 60000);
  }

  clearAutoCloseTimer() {
    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
    }
  }

  getCallCounts() {
    const params = {
      loginid: localStorage.getItem('UserId'),
      fromcalldatetime: new Date().toLocaleDateString('en-CA'),
      tocalldatetime: new Date().toLocaleDateString('en-CA'),
      execid:
        localStorage.getItem('Role') == '1'
          ? ''
          : localStorage.getItem('UserId'),
    };
    this.sharedService.getCallCounts(params).subscribe((resp) => {
      this.sharedService.allCallCounts = resp['success'][0];
    });
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthServiceService } from '../auth-service.service';
import { MandateService } from '../mandate-service.service';
import Swal from 'sweetalert2';
import { SharedService } from '../shared.service';
import { App } from '@capacitor/app';
import { NativeBiometric } from 'capacitor-native-biometric';
import { BiometricService } from '../biometric.service';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  data = false;
  downarrow = false;
  isRetail;
  name;
  MandateRMEXview: boolean;
  adminview: boolean;
  RMTLview: boolean;
  RMEXview: boolean;
  CSTLview: boolean;
  CSEXview: boolean;
  builderexecview: boolean;
  iscpId = false;
  isTL;
  isRanavLogin = false;
  isAdmin = false;
  callStatus: any;
  isFingureprintEnabled: boolean;
  showSpinner: any;

  constructor(
    private router: Router,
    private authService: AuthServiceService,
    public mandateService: MandateService,
    private activeRoute: ActivatedRoute,
    public sharedService: SharedService,
    private biometricService: BiometricService
  ) {}

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((param) => {
      this.isFingureprintEnabled =
        localStorage.getItem('useBiometric') == 'true';
      this.getPreviousPresentmonthDate();
      this.isRanavLogin = localStorage.getItem('ranavPropId') === '28773';
      this.iscpId = localStorage.getItem('cpId') === '1';
      this.isTL = this.localStorage.getItem('RoleType') === '1';
      this.isAdmin = this.localStorage.getItem('Role') === '1';
      const session_id = localStorage.getItem('session_id');

      if (this.localStorage.getItem('cpId') != '1') {
        this.sharedService
          .getVersionCode(localStorage.getItem('UserId'), session_id)
          .subscribe({
            next: async (response) => {
              const info = App.getInfo();
              if (
                response['Executives']?.length != 0 &&
                response['Executives']?.[0]?.['active_status'] !== '0' &&
                localStorage.getItem('Role') !== '1'
              ) {
                Swal.fire({
                  title: 'Blocked',
                  text: 'Your account has been blocked',
                  confirmButtonText: 'OK',
                  heightAuto: false,
                  allowOutsideClick: false,
                }).then((result) => {
                  // localStorage.clear();
                  Object.keys(localStorage).forEach((key) => {
                    if (
                      key !== 'Mail' &&
                      key !== 'Password' &&
                      key !== 'useBiometric'
                    ) {
                      localStorage.removeItem(key);
                    }
                  });
                  this.authService.logout();
                });
              } else if (
                this.isNewVersionAvailable(
                  (await info).version,
                  response['versioncode'][0].version_code
                )
              ) {
                Swal.fire({
                  title: 'Time to Catch Up',
                  text: 'Update to the latest version & enjoy a seamless experience',
                  confirmButtonText: 'Update Now',
                  heightAuto: false,
                  allowOutsideClick: false,
                }).then((result) => {
                  if (result.isConfirmed) {
                    window.location.href =
                      'https://play.google.com/store/apps/details?id=io.lead247';
                  }
                });
              }
            },
            error: () => {
              // localStorage.clear();
              Object.keys(localStorage).forEach((key) => {
                if (
                  key !== 'Mail' &&
                  key !== 'Password' &&
                  key !== 'useBiometric'
                ) {
                  localStorage.removeItem(key);
                }
              });
              this.authService.logout();
              this.router.navigate(['/']);
            },
          });
      }
      this.name = localStorage.getItem('Name');
      this.downarrow = false;
      this.data = true;
      // if (param['htype'] == 'retail') {
      //   this.isRetail = true;
      // } else {
      //   this.isRetail = false;
      // }

      // if (
      //   localStorage.getItem('Role') == '1' &&
      //   !localStorage.getItem('ranavPropId')
      // ) {
      //   param['htype'] == 'retail'
      //     ? (this.isRetail = true)
      //     : (this.isRetail = false);
      // } else if (
      //   localStorage.getItem('ranavPropId') == '28773' ||
      //   (localStorage.getItem('Role') == '1' &&
      //     localStorage.getItem('cpId') != '1') ||
      //   localStorage.getItem('Role') == '50001' ||
      //   localStorage.getItem('Role') == '50002'
      // ) {
      //   this.isRetail = false;
      // } else if (
      //   localStorage.getItem('Role') == '50009' ||
      //   localStorage.getItem('Role') == '50010' ||
      //   localStorage.getItem('Role') == '50003' ||
      //   localStorage.getItem('Role') == '50004' ||
      //   localStorage.getItem('cpId') == '1'
      // ) {
      //   this.isRetail = true;
      // }
      this.updateRole();
    });

    this.fetchmandateexecutives();
  }
  executiveNames;
  fetchmandateexecutives() {
    this.sharedService.getallactiveexec().subscribe((response) => {
      this.executiveNames = response['Executives'];
      this.showSpinner = false;
    });
  }
  @ViewChild('switchAccountWarningModal') switchAccountWarningModal;
  onSwitch_acc() {
    const mainAcc = this.executiveNames.filter((item) => {
      return (
        item.executives_FKID == localStorage.getItem('UserId') &&
        item.number == localStorage.getItem('Number')
      );
    });
    localStorage.setItem('mainAccount', JSON.stringify(mainAcc));
    localStorage.setItem('Name', this.selectedAcc.name);
    localStorage.setItem('UserId', this.selectedAcc.executives_FKID);
    localStorage.setItem('Password', this.selectedAcc.password);
    localStorage.setItem('Mail', this.selectedAcc.email);
    localStorage.setItem('Role', this.selectedAcc.role_IDFK);
    localStorage.setItem('Number', this.selectedAcc.number);
    localStorage.setItem('prop_suggestion', this.selectedAcc.prop_suggestion);
    localStorage.setItem('Department', this.selectedAcc.department_IDFK);
    localStorage.setItem('PropertyId', this.selectedAcc.mandate_propidfk);
    localStorage.setItem('RoleType', this.selectedAcc.role_type);
    localStorage.setItem('direct_inhouse', this.selectedAcc.direct_inhouse);

    if (this.selectedAcc.mandate_propidfk === '28773') {
      localStorage.setItem('ranavPropId', '28773');
    }
    setTimeout(() => {
      this.sharedService.notifyAccountChanged();
    }, 1000);

    this.showSpinner = true;
    this.switchAccountModal.dismiss();
    this.switchAccountWarningModal.dismiss();
    this.authService.login();
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['home'], {
        queryParams: {
          htype: 'mandate',
          isDateFilter: 'today',
        },
      });
    });
  }
  updateRole() {
    if (localStorage.getItem('Department') == '10004') {
      this.MandateRMEXview = true;
      this.adminview = false;
      this.RMTLview = false;
      this.RMEXview = false;
      this.CSTLview = false;
      this.CSEXview = false;
      this.builderexecview = false;
    } else {
      if (localStorage.getItem('Role') == null) {
        this.router.navigate(['/']);
      } else if (localStorage.getItem('Role') == '1') {
        this.adminview = true;
        this.MandateRMEXview = false;
        this.RMTLview = false;
        this.RMEXview = false;
        this.CSTLview = false;
        this.CSEXview = false;
        this.builderexecview = false;
      } else if (localStorage.getItem('Role') == '50001') {
        this.RMTLview = true;
        this.adminview = false;
        this.MandateRMEXview = false;
        this.RMEXview = false;
        this.CSTLview = false;
        this.CSEXview = false;
        this.builderexecview = false;
      } else if (localStorage.getItem('Role') == '50002') {
        this.RMEXview = true;
        this.adminview = false;
        this.MandateRMEXview = false;
        this.RMTLview = false;
        this.CSTLview = false;
        this.CSEXview = false;
        this.builderexecview = false;
        // this.getmandatecustomer();
      } else if (localStorage.getItem('Role') == '50003') {
        this.CSTLview = true;
        this.adminview = false;
        this.MandateRMEXview = false;
        this.RMTLview = false;
        this.RMEXview = false;
        this.CSEXview = false;
        this.builderexecview = false;
      } else if (localStorage.getItem('Role') == '50004') {
        this.CSEXview = true;
        this.adminview = false;
        this.MandateRMEXview = false;
        this.RMTLview = false;
        this.RMEXview = false;
        this.CSTLview = false;
        this.builderexecview = false;
      } else if (localStorage.getItem('Role') == '50011') {
        this.builderexecview = true;
        this.adminview = false;
        this.MandateRMEXview = false;
        this.RMTLview = false;
        this.RMEXview = false;
        this.CSTLview = false;
        this.CSEXview = false;
      }
    }
  }

  getUnReadChatCount() {
    this.sharedService
      .unreadChatCount(localStorage.getItem('UserId'))
      .subscribe((response) => {
        // this.dataService.unReadChatCount = response['details'][0].unreadmsgcount
        this.sharedService.emitunReadChatCountValue(
          response['details'][0].unreadmsgcount
        );
      });
  }

  storeLocal(data) {
    localStorage.setItem('selectedOption', data);
    this.localStorage.removeItem('executivesName');
  }

  localStorage = localStorage;

  logOut() {
    this.sharedService
      .logOut(
        this.localStorage.getItem('session_id'),
        this.localStorage.getItem('UserId')
      )
      .subscribe(() => {});
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

  onHomeicon() {
    // this.resetInfiniteScroll();
    // if (this.isRetail) {
    //   this.router.navigate(['retail-dashboard'], {
    //     queryParams: {
    //       htype: 'retail',
    //     },
    //   });
    // } else {
    this.router.navigate(['home'], {
      queryParams: {
        htype: 'mandate',
      },
    });
    // }
  }

  // getRetailexecutivesName(){
  //   this.retailService.fetchRetail_executivesName('','').subscribe((response)=>{
  //     const execId= response['DashboardCounts'].filter((id)=>{
  //       return (id.ExecId === this.localStorage.getItem('UserId'))
  //     })
  //     execId ==''?this.isRetail=false: this.isRetail=true;
  //   })
  // }

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
    return {
      fromdate: nextSaturday.toLocaleDateString('en-CA'),
      todate: nextSunday.toLocaleDateString('en-CA'),
    };
  }

  onHtype(htype) {
    if (htype == 'retail') {
      this.router.navigate(['retail-dashboard'], {
        queryParams: {
          htype: htype,
        },
      });
    } else {
      this.router.navigate(['home'], {
        queryParams: {
          htype: htype,
          propid: !localStorage.getItem('ranavPropId') ? '16793' : '28773',
        },
      });
    }
  }

  getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Returns 'YYYY-MM-DD'
  }

  onDashboard() {
    // if (!this.isRetail) {
    //   this.router.navigate(['/home'], {
    //     queryParams: {
    //       htype: 'mandate',
    //       propid:
    //         !localStorage.getItem('ranavPropId') &&
    //         localStorage.getItem('Role') === '1'
    //           ? '16793'
    //           : localStorage.getItem('ranavPropId') === '28773'
    //           ? '28773'
    //           : '',
    //     },
    //   });
    // } else {
    this.router.navigate(['/home'], {
      queryParams: {
        htype: 'mandate',
      },
    });
    // }
  }

  isNewVersionAvailable(local: string, server: string): boolean {
    const localParts = local.split('.').map((n) => parseInt(n));
    const serverParts = server.split('.').map((n) => parseInt(n));
    const maxLength = Math.max(localParts.length, serverParts.length);

    for (let i = 0; i < maxLength; i++) {
      const localVal = localParts[i] || 0;
      const serverVal = serverParts[i] || 0;

      if (serverVal > localVal) return true;
      if (serverVal < localVal) return false;
    }
    return false; // versions are equal
  }

  currentdateforcompare = new Date();
  todaysdateforcompare: any;
  previousMonthDateForCompare: any;
  getPreviousPresentmonthDate() {
    // Todays Date
    var curmonth = this.currentdateforcompare.getMonth() + 1;
    var curmonthwithzero = curmonth.toString().padStart(2, '0');
    var curday = this.currentdateforcompare.getDate();
    var curdaywithzero = curday.toString().padStart(2, '0');
    this.todaysdateforcompare =
      this.currentdateforcompare.getFullYear() +
      '-' +
      curmonthwithzero +
      '-' +
      curdaywithzero;

    //to get the previous month date of the present day date
    var previousMonthDate = new Date(this.currentdateforcompare);
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
    var prevMonth = (previousMonthDate.getMonth() + 1)
      .toString()
      .padStart(2, '0');
    var prevDay = previousMonthDate.getDate().toString().padStart(2, '0');
    this.previousMonthDateForCompare =
      previousMonthDate.getFullYear() + '-' + prevMonth + '-' + prevDay;
  }

  accordionOpen: boolean = false;

  toggleAccordion() {
    this.accordionOpen = !this.accordionOpen;
  }

  async enableFingerprint(event) {
    const result = await NativeBiometric.isAvailable();

    if (!result.isAvailable) {
      alert(
        'Biometric login is unavailable. Please set it up or wait if it’s locked, or use your password instead.'
      );
      event.detail.checked = false;
      return;
    }
    this.isFingureprintEnabled = localStorage.getItem('useBiometric') == 'true';
    await NativeBiometric.verifyIdentity({
      reason: 'Please authenticate to login',
      fallbackTitle: 'Use device passcode',
    })
      .then(async () => {
        if (localStorage.getItem('useBiometric') == 'true') {
          Swal.fire({
            title: 'Fingerprint Disabled',
            text: 'Fingerprint login has been turned off.',
            icon: 'info',
            confirmButtonText: 'OK',
            heightAuto: false,
          }).then((result) => {
            this.isFingureprintEnabled = false;
            this.localStorage.removeItem('useBiometric');
          });
        } else {
          Swal.fire({
            title: 'Success',
            text: 'Fingerprint login has been successfully enabled!',
            confirmButtonText: 'OK',
            heightAuto: false,
            icon: 'success',
          }).then((result) => {});
          await this.biometricService.saveCredentials(
            this.localStorage.getItem('Mail'),
            this.localStorage.getItem('Password')
          );
          localStorage.setItem('useBiometric', 'true');
          this.isFingureprintEnabled = true;
        }
      })
      .catch((err: any) => {
        // alert(this.isFingureprintEnabled);
        console.log('Authentication failed or cancelled', err?.message);
      });
  }
  selectedAcc;
  @ViewChild('switchAccountModal') switchAccountModal;
  onSwitchAcc() {
    if (localStorage.getItem('mainAccount')) {
      Swal.fire({
        title: 'Switching back to Admin account',
        text: 'Do you want to proceed?',
        icon: 'warning',
        heightAuto: false,
        showCancelButton: true,
        confirmButtonText: 'Yes, Switch Account',
        cancelButtonText: 'cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          this.selectedAcc = JSON.parse(localStorage.getItem('mainAccount'));
          this.selectedAcc = this.selectedAcc[0];
          this.onSwitchBack_acc();
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
        }
      });
    } else {
      this.switchAccountModal.present();
    }
  }

  onSwitchBack_acc() {
    localStorage.setItem('Name', this.selectedAcc.name);
    localStorage.setItem('UserId', this.selectedAcc.executives_FKID);
    localStorage.setItem('Password', this.selectedAcc.password);
    localStorage.setItem('Mail', this.selectedAcc.email);
    localStorage.setItem('Role', this.selectedAcc.role_IDFK);
    localStorage.setItem('Number', this.selectedAcc.number);
    localStorage.setItem('prop_suggestion', this.selectedAcc.prop_suggestion);
    localStorage.setItem('Department', this.selectedAcc.department_IDFK);
    localStorage.setItem('PropertyId', this.selectedAcc.mandate_propidfk);
    localStorage.setItem('RoleType', this.selectedAcc.role_type);
    // localStorage.setItem('session_id', success['session_id']);
    localStorage.setItem('direct_inhouse', this.selectedAcc.direct_inhouse);

    if (this.selectedAcc.mandate_propidfk === '28773') {
      localStorage.setItem('ranavPropId', '28773');
    }
    localStorage.removeItem('mainAccount');
    this.authService.login();
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['home'], {
        queryParams: {
          htype: 'mandate',
          isDateFilter: 'today',
        },
      });
    });
  }

  onclose() {
    this.switchAccountModal.dismiss();
  }

  @ViewChild(IonContent, { static: false }) content!: IonContent;
  canScroll;
  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.content.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;

      this.canScroll = scrollHeight > clientHeight + 10; // ADD A BUFFER of 10px

      if (!this.canScroll) {
        this.sharedService.isBottom = false;
      } else {
        this.sharedService.isBottom =
          scrollTop + clientHeight >= scrollHeight - 100;
      }
    });
  }

  onAllVisitsMenu() {
    const params = {
      loginid: this.localStorage.getItem('UserId'),
      visitsuntouched: '1',
    };
    this.mandateService.getAssignedLeadsCounts(params).subscribe((resp) => {
      if ((resp['status'] = 'True')) {
        this.router.navigate(['/mandate-visit-stages'], {
          queryParams: {
            visitsuntouched: '1',
            stagestatus: '3',
            visittype: '3',
            isDropDown: 'false',
            htype: this.isRetail ? 'retail' : 'mandate',
            teamlead:
              localStorage.getItem('RoleType') == '1'
                ? localStorage.getItem('UserId')
                : null,
          },
        });
      } else {
        this.router.navigate(['/mandate-visit-stages'], {
          queryParams: {
            stagestatus: '3',
            visittype: '3',
            isDropDown: 'false',
            htype: this.isRetail ? 'retail' : 'mandate',
            type: 'USV',
            stage: 'USV',
            teamlead:
              localStorage.getItem('RoleType') == '1'
                ? localStorage.getItem('UserId')
                : null,
          },
        });
      }
    });
  }
}

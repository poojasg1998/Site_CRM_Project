import {
  ChangeDetectorRef,
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MandateService } from '../mandate-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgOtpInputComponent } from 'ng-otp-input';
import { AuthServiceService } from '../auth-service.service';
import { SharedService } from '../shared.service';
import { App } from '@capacitor/app';
import OneSignal from 'onesignal-cordova-plugin';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { NativeBiometric } from 'capacitor-native-biometric';
import { BiometricService } from '../biometric.service';

declare var window: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  private oneSignalAppId: string = 'b31dea3b-b87e-4436-9881-10265e024310';
  private isOneSignalSetupAttempted: boolean = false;

  passwordType: string = 'password'; //By default set passwordType of input to password
  isPasswordVisible: boolean = false; //to display possword visiable icon
  showUsernameInput: boolean = false; // to display username and password field
  isOtpSend: boolean = false;
  loginData = { username: '', password: '', number: '', otpmodel: '' };
  public timerInterval: any;
  otpResend = false;
  display: any;

  loggedMailId = localStorage.getItem('Mail');
  loggedPassword;
  constructor(
    public authService: AuthServiceService,
    private mandateService: MandateService,
    private activeroute: ActivatedRoute,
    private router: Router,
    private sharedService: SharedService,
    private cdRef: ChangeDetectorRef,
    private platform: Platform,
    private alertCtrl: AlertController,
    private biometricService: BiometricService,
    public modalCtrl: ModalController
  ) {
    // this.requestNotificationPermission();
    this.platform.ready().then(() => {
      // this.initOneSignal();
    });

    // // Enable verbose logging for debugging (remove in production)
    //   OneSignal.Debug.setLogLevel(6);
    //   // Initialize with your OneSignal App ID
    //   OneSignal.initialize(this.oneSignalAppId);
    //   // Use this method to prompt for push notifications.
    //   // We recommend removing this method after testing and instead use In-App Messages to prompt for notification permission.
    //   OneSignal.Notifications.requestPermission(false).then((accepted: boolean) => {
    //     console.log("User accepted notifications: " + accepted);
    //   });
  }

  ngOnInit() {
    this.activeroute.queryParamMap.subscribe((params) => {
      if (localStorage.getItem('useBiometric') == 'true') {
        this.isFingerPrintEnabled = true;
      } else {
        this.isFingerPrintEnabled = false;
      }
      this.isOtpSend = false;
      this.loginData.number = '';
      this.showUsernameInput = false;
      this.isPasswordVisible = false;
      if (localStorage.getItem('isLoggedIn') == 'true') {
        this.authService.login();
      } else {
        this.showSpinner = false;
      }
      // if(localStorage.getItem('isLoggedIn')=='true'){
      //   this.isdisplay = false;
      //   if (localStorage.getItem('Role') == null)
      //   {
      //     this.router.navigate(['/'],{
      //       queryParams:{
      //         htype:'mandate'
      //       }
      //     })
      //   }
      //   else if(localStorage.getItem('Role') != null)
      //   {
      //     if (localStorage.getItem('Role') == '1')
      //     {
      //       this.router.navigate(['retail-dashboard'],{
      //         queryParams:{
      //           htype:'retail'
      //         }
      //       })
      //     }
      //     else{
      //       this.router.navigate(['home'],{
      //         queryParams:{
      //           htype:'mandate'
      //         }
      //       })
      //     }
      //   }
      // }else{
      //   this.isdisplay=true;
      //   this.router.navigate(['/'],{
      //     queryParams:{
      //       htype:'mandate'
      //     }
      //   });
      // }
    });
  }

  //hide and show the password
  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  //toggle the button login with registration number or using username and password
  toggleUsernameVisibility() {
    this.loginData.username = '';
    this.loginData.password = '';
    this.isPasswordVisible = false;
    this.passwordType = 'password';
    this.showUsernameInput = !this.showUsernameInput;
  }

  //method to start timer when OTP sent
  timer(minute) {
    let seconds: number = minute;
    let textSec: any = '0';
    let statSec: number = 30;
    const prefix = minute < 10 ? '0' : '';
    this.timerInterval = setInterval(() => {
      seconds--;
      if (statSec != 0) statSec--;
      else statSec = 59;

      if (statSec < 10) {
        textSec = '0' + statSec;
      } else textSec = statSec;

      this.display = `${prefix}${Math.floor(seconds / 60)}:${textSec}`;
      if (seconds == 0) {
        this.otpResend = true;
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  //cursor focus on otp input field while moving forword and backword
  moveFocus(
    event: any,
    nextInput: any,
    prevInput: any,
    currentInput: string
  ): void {
    if (event.target.value.length < 1 && prevInput) {
      prevInput.setFocus();
    } else if (nextInput && event.target.value.length > 0) {
      nextInput.setFocus();
    } else {
    }
  }

  otp: string;
  onOtpChange(event) {
    this.otp = event;
    this.loginData.otpmodel = event;
  }

  resendOtp() {
    this.otpResend = false;
    this.showUsernameInput = false;
    this.login();
  }

  //If registered by number OTP send to corresponding number
  login() {
    this.showSpinner = true;
    const id = localStorage.getItem('UserId');
    localStorage.removeItem('');

    // if( localStorage.getItem('UserId') == null){
    //   Swal.fire({
    //     title: "Blocked",
    //     text: "Your account has been blocked",
    //     confirmButtonText: "OK",
    //     heightAuto:false,
    //     allowOutsideClick: false,
    //   }).then((result) => {
    //     localStorage.clear();
    //     this.authService.logout();
    //   });
    // }

    if (!this.showUsernameInput) {
      this.timer(30);
      this.sharedService
        .loginotpsend(this.loginData.number)
        .subscribe((success) => {
          if (success['status'] == 'True') {
            this.showSpinner = false;
            this.isOtpSend = true;
          } else {
            this.sharedService
              .loginotpsend1(this.loginData.number)
              .subscribe((success) => {
                if (success['status'] == 'True') {
                  this.isOtpSend = true;
                  this.showSpinner = false;
                } else {
                  Swal.fire({
                    title: 'Number Not Registered',
                    text: 'Please check your number',
                    icon: 'error',
                    confirmButtonText: 'ok',
                    heightAuto: false,
                    customClass: {
                      container: 'my-swal-error',
                    },
                  });
                  this.loginData.number = '';
                  this.showSpinner = false;
                }
              });
            // Swal.fire({
            //   title: 'Number Not Registered',
            //   text: 'Please check your number',
            //   icon: 'error',
            //   confirmButtonText: 'ok',
            //   heightAuto: false,
            //   customClass: {
            //     container: 'my-swal-error',
            //   },
            // });
            // this.loginData.number = '';
          }
        });
    } else {
      this.isOtpSend = false;
      this.navigateToDashBoard(
        this.loginData.username,
        this.loginData.password
      );
      // this.loginData.username='';
      // this.loginData.password='';
    }
  }

  // to display custom error message
  setCustomValidity(event) {
    const input = event.target;
    if (input.validity.patternMismatch) {
      input.setCustomValidity('Please enter a valid 10-digit number.');
    } else {
      input.setCustomValidity('');
    }
  }

  @ViewChild(NgOtpInputComponent) otpInput: NgOtpInputComponent;
  //Otp varification
  otpVerification() {
    this.showSpinner = true;
    const otpString = this.loginData.otpmodel;
    if (otpString == '') {
      Swal.fire({
        title: 'Oops Something Error!',
        text: 'Please enter the OTP code before submitting.',
        icon: 'error',
        showConfirmButton: false,
        heightAuto: false,
        customClass: {
          container: 'my-swal-error',
        },
      });
      this.showSpinner = false;
    } else {
      this.sharedService
        .login_otp_validate(otpString, this.loginData.number)
        .subscribe({
          next: (success) => {
            if (success['status'] == 'True') {
              this.showSpinner = false;
              var logindata = success['success'][0];
              localStorage.setItem('isLoggedIn', 'true');

              if (success['success'][0]['department_IDFK'] == '10006') {
                this.getVersionCode();
                localStorage.setItem(
                  'Department',
                  success['success'][0].department_IDFK
                );
                localStorage.setItem('Mail', success['success'][0].email);
                localStorage.setItem(
                  'UserId',
                  success['success'][0].executives_FKID
                );
                localStorage.setItem('Name', success['success'][0].name);
                this.sharedService.isMenuOpen = false;

                this.sharedService
                  .getEmployeeLoginVersionCode('')
                  .subscribe((response) => {
                    if (
                      this.isNewVersionAvailable(
                        this.versionCode,
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
                    } else {
                      this.router.navigate(['employeeAttendance'], {
                        queryParams: {
                          fromdate: new Date().toLocaleDateString('en-CA'),
                          todate: new Date().toLocaleDateString('en-CA'),
                          execid: localStorage.getItem('UserId'),
                          isDateFilter: 'today',
                        },
                      });
                    }
                  });
              } else {
                this.navigateToDashBoard(logindata.email, logindata.password);
              }
              // this.navigateToDashBoard(logindata.email, logindata.password);
            } else {
              this.loginData.otpmodel = '';
              this.showSpinner = false;
              Swal.fire({
                title: 'Oops Something Error!',
                text: 'Its Not a valid OTP / OTP Expired!',
                icon: 'error',
                showConfirmButton: false,
                heightAuto: false,
                customClass: {
                  container: 'my-swal-error',
                },
              }).then(function () {});
            }
            this.otpInput.setValue('');
          },
          error: () => {
            this.showSpinner = false;
          },
        });
    }
  }

  showSpinner = false;
  getRandomHexColor(): string {
    return (
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
    );
  }

  versionCode;
  async getVersionCode() {
    const info = await App.getInfo();
    this.versionCode = info.version;
  }

  //navigate to dashboard based on employee and admin login
  navigateToDashBoard(data1, data2) {
    this.showSpinner = true;
    this.getVersionCode();
    const deviceid = 'Mobile';
    const browser = 'Android';
    this.sharedService.setloginState('');

    this.sharedService.getlogin(data1, data2, deviceid, browser).subscribe({
      next: (success) => {
        if (success['status'] == 'True') {
          this.cdRef.detectChanges();
          localStorage.setItem('Name', success['details'][0].name);
          localStorage.setItem('UserId', success['details'][0].executives_FKID);
          localStorage.setItem('Password', success['details'][0].password);
          localStorage.setItem('Mail', success['details'][0].email);
          localStorage.setItem('Role', success['details'][0].role_IDFK);
          localStorage.setItem('Number', success['details'][0].number);
          localStorage.setItem(
            'prop_suggestion',
            success['details'][0].prop_suggestion
          );
          localStorage.setItem(
            'Department',
            success['details'][0].department_IDFK
          );
          localStorage.setItem(
            'PropertyId',
            success['details'][0].mandate_propidfk
          );
          localStorage.setItem('RoleType', success['details'][0].role_type);
          localStorage.setItem('session_id', success['session_id']);
          localStorage.setItem(
            'direct_inhouse',
            success['details'][0].direct_inhouse
          );

          if (success['details'][0].mandate_propidfk === '28773') {
            localStorage.setItem('ranavPropId', '28773');
          }

          this.sharedService
            .getVersionCode(
              success['details'][0].executives_FKID,
              success['session_id']
            )
            .subscribe((response) => {
              if (response['Executives'][0]['active_status'] != '0') {
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
                  this.versionCode,
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
              } else {
                if (success['details'][0].department_IDFK == '10005') {
                  this.authService.login();
                } else {
                  setTimeout(() => {
                    if (!localStorage.getItem('useBiometric')) {
                      this.showSpinner = false;
                      this.enableFingerPrintModal = true;
                    } else if (localStorage.getItem('useBiometric') == 'true') {
                      this.authService.login();
                    }
                  }, 1000);
                }
              }
            });

          this.platform.ready().then(() => {
            if (this.platform.is('hybrid')) {
              // alert(' hybrid platform detected — about to init OneSignal');
              // ------------------------------------------------------------RELATED_TO_ONESIGNAL_PUSH------------------------------------------------------------
              const loggedInUserId = success['details'][0].executives_FKID;
              // --- Trigger OneSignal Setup ONLY AFTER SUCCESSFUL LOGIN ---
              // Ensure setup runs only once per login session
              // alert( this.isOneSignalSetupAttempted)
              // if (!this.isOneSignalSetupAttempted){
              // alert(this.isOneSignalSetupAttempted +'inside if');
              this.initializeOneSignal(loggedInUserId.toString()); // Pass user ID as string
              // this.isOneSignalSetupAttempted = true;
              // }
              // ------------------------------------------------------------RELATED_TO_ONESIGNAL_PUSH------------------------------------------------------------
            } else {
              // alert(' not hybrid — skipping OneSignal');
            }
          });
        } else {
          this.sharedService.setloginState('crm_cpclient_login');
          setTimeout(() => {
            this.sharedService
              .getlogin(data1, data2, '', '')
              .subscribe((success) => {
                if (success['status'] === 'True') {
                  localStorage.setItem(
                    'Name',
                    success['details'][0].client_name
                  );
                  localStorage.setItem(
                    'UserId',
                    success['details'][0].executives_FKID
                  );
                  localStorage.setItem('Password', 'xxxxxxx');
                  localStorage.setItem(
                    'Mail',
                    success['details'][0].client_email
                  );
                  localStorage.setItem('Role', success['details'][0].role_IDFK);
                  localStorage.setItem(
                    'Department',
                    success['details'][0].department_IDFK
                  );
                  localStorage.setItem(
                    'PropertyId',
                    success['details'][0].mandate_propidfk
                  );
                  localStorage.setItem(
                    'RoleType',
                    success['details'][0].role_type
                  );
                  localStorage.setItem(
                    'contrllerName',
                    success['details'][0].client_controller
                  );
                  localStorage.setItem(
                    'RcontrllerName',
                    success['details'][0].client_controller
                  );
                  localStorage.setItem('cpId', success['details'][0].cp_role);
                  localStorage.setItem(
                    'cityId',
                    success['details'][0].client_cityid
                  );
                  localStorage.setItem(
                    'direct_inhouse',
                    success['details'][0].direct_inhouse
                  );
                  this.authService.setadminControllerState(
                    localStorage.getItem('contrllerName')
                  );
                  this.showSpinner = false;
                  // setTimeout(()=>{

                  this.sharedService
                    .getVersionCode(success['details'][0].executives_FKID, '')
                    .subscribe((response) => {
                      if (response['Executives'][0]['active_status'] != '0') {
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
                          this.versionCode,
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
                      } else {
                        setTimeout(() => {
                          if (!localStorage.getItem('useBiometric')) {
                            this.showSpinner = false;
                            this.enableFingerPrintModal = true;
                          } else if (
                            localStorage.getItem('useBiometric') == 'true'
                          ) {
                            this.authService.login();
                          }
                        }, 1000);
                      }
                    });
                  // },1000)
                } else {
                  //    this.sharedService.setloginState('ranav_group');
                  //  setTimeout(() => {
                  //    this.sharedService.getlogin(data1,data2,deviceid,browser).subscribe((success)=>{
                  //     if(success['status'] === "True"){
                  //       localStorage.setItem('Name', success['details'][0].name);
                  //       localStorage.setItem('UserId',  success['details'][0].executives_FKID);
                  //       localStorage.setItem('Password', "xxxxxxx");
                  //       localStorage.setItem('Mail', success['details'][0].email);
                  //       localStorage.setItem('Role', success['details'][0].role_IDFK);
                  //       localStorage.setItem('Department', success['details'][0].department_IDFK);
                  //       localStorage.setItem('PropertyId', success['details'][0].mandate_propidfk);
                  //       localStorage.setItem('RoleType', success['details'][0].role_type);
                  //       localStorage.setItem('session_id', success['session_id']);
                  //       localStorage.setItem('direct_inhouse', success['details'][0].direct_inhouse);
                  //       localStorage.setItem('RcontrllerName','ranav_group');
                  //       // this.authService.setadminControllerState('ranav_group');
                  //       this.mandateService.setHoverState('ranav_group');
                  //       this.showSpinner = false;
                  //       this.sharedService.getVersionCode( success['details'][0].executives_FKID,'').subscribe((response)=>{
                  //         if(response['Executives'][0]['active_status'] != '0'){
                  //           Swal.fire({
                  //             title: "Blocked",
                  //             text: "Your account has been blocked",
                  //             confirmButtonText: "OK",
                  //             heightAuto:false,
                  //             allowOutsideClick: false,
                  //           }).then((result) => {
                  //             localStorage.clear();
                  //             this.authService.logout();
                  //           });
                  //         }else if( this.isNewVersionAvailable(this.versionCode,response['versioncode'][0].version_code)){
                  //           Swal.fire({
                  //             title: "Time to Catch Up",
                  //             text: "Update to the latest version & enjoy a seamless experience",
                  //             confirmButtonText: "Update Now",
                  //             heightAuto:false,
                  //             allowOutsideClick: false,
                  //           }).then((result) => {
                  //             if (result.isConfirmed) {
                  //               window.location.href = 'https://play.google.com/store/apps/details?id=io.lead247';
                  //             }
                  //           });
                  //         }
                  //         else{
                  //           setTimeout(()=>{
                  //             this.authService.login();
                  //           },1000)
                  //         }
                  //       })
                  //     }else{
                  //       Swal.fire({
                  //         title: 'Authentication Failed!',
                  //         text: 'Please try again',
                  //         icon: 'error',
                  //         confirmButtonText: 'ok',
                  //         heightAuto: false,
                  //         customClass: {
                  //           container: 'my-swal-error',
                  //         }
                  //       }).then(()=>{
                  //         this.showSpinner = false;
                  //       })
                  //     }
                  //   })
                  //  }, 0);

                  // if (localStorage.getItem('useBiometric') == 'true') {
                  //   Swal.fire({
                  //     title: 'Login Failed',
                  //     text: 'Incorrect password or password not entered. Please try again.',
                  //     icon: 'error',
                  //     confirmButtonText: 'OK',
                  //     heightAuto: false,
                  //     customClass: {
                  //       container: 'my-swal-error',
                  //     },
                  //   }).then(() => {
                  //     this.showSpinner = false;
                  //     if (localStorage.getItem('useBiometric') == 'true') {
                  //       this.isFingerPrintEnabled = true;
                  //     } else {
                  //       this.isFingerPrintEnabled = false;
                  //     }
                  //   });
                  // } else {
                  Swal.fire({
                    title: 'Authentication Failed!',
                    text: 'Please try again',
                    icon: 'error',
                    confirmButtonText: 'ok',
                    heightAuto: false,
                    customClass: {
                      container: 'my-swal-error',
                    },
                  }).then(() => {
                    this.showSpinner = false;
                    if (localStorage.getItem('useBiometric') == 'true') {
                      this.isFingerPrintEnabled = true;
                    } else {
                      this.isFingerPrintEnabled = false;
                    }
                    // location.reload();
                  });
                  // }
                }
              });
          }, 0);
        }
      },
      error: () => {},
    });
  }

  isNewVersionAvailable(local: string, server: string): boolean {
    const localParts = local?.split('.').map((n) => parseInt(n));
    const serverParts = server?.split('.').map((n) => parseInt(n));
    const maxLength = Math.max(localParts?.length, serverParts.length);

    for (let i = 0; i < maxLength; i++) {
      const localVal = localParts[i] || 0;
      const serverVal = serverParts[i] || 0;

      if (serverVal > localVal) return true;
      if (serverVal < localVal) return false;
    }
    return false;
  }

  // ----------------------------METHOD-FOR-onesignal-cordova-plugin----------------------------
  async initializeOneSignal(userId) {
    OneSignal.initialize(this.oneSignalAppId);
    // 1. Request Permission
    try {
      OneSignal.Notifications.requestPermission(false).then(
        async (accepted: boolean) => {
          if (accepted === true) {
            // ---------------------Get the Onesignal ID---------------------
            // const ids = await OneSignal.User.getOnesignalId(); // This returns a Promise with { userId: string, pushToken: string }
            // const playerId = ids; // For mobile, ids.userId is the Player ID (Subscription ID)
            // ---------------------Get the Onesignal ID---------------------

            // ---------------------Get the Subscription ID---------------------
            const subscriptionid = await OneSignal.User.pushSubscription.id;
            // ---------------------Get the Subscription ID---------------------
            if (subscriptionid) {
              // Now send the Player ID to your backend
              this.sendPlayerIdToBackend(userId, subscriptionid);
            } else {
              // alert("OneSignal Player ID not available after permission.");
            }
          } else {
            this.logout();
            // alert("User Rejected notification permission " + accepted);
          }
        }
      );
    } catch (error) {
      //  alert("Error handling OneSignal permissions:"+ error);
    }
    // 2. Set External User ID
    try {
      OneSignal.login(userId);
    } catch (error) {
      // alert("Error setting OneSignal External User ID:"+error);
    }

    // 4. Add Event Listeners (ensure these are added only once)
    // Check if listeners are already registered to prevent duplicates if `setupOneSignal` is called multiple times
    // if (!(window as any)._oneSignalListenersAdded) {
    //   OneSignalGlobal.on('subscriptionChange', (isSubscribed: boolean) => {
    //    alert("OneSignal: User subscription status changed:"+isSubscribed);
    //     if (isSubscribed) {
    //         // this.sendPlayerIdToBackend(userId, OneSignalGlobal); // Send updated ID
    //     }
    //   });
    //     (window as any)._oneSignalListenersAdded = true; // Set flag
    // }
  }
  // ----------------------------METHOD-FOR-onesignal-cordova-plugin----------------------------

  private async sendPlayerIdToBackend(
    userId: string,
    subscriptionid: any
  ): Promise<void> {
    const subscripId = subscriptionid;
    if (subscripId && userId) {
      let param = {
        userid: userId,
        subscriberid: subscripId,
      };
      this.sharedService.onesignalpush(param).subscribe({
        next: (success) => {
          if (success['status'] === 'True') {
            Swal.fire({
              title: 'Notification Permission Granted',
              text: 'Onesignal Player ID Stored Success',
              icon: 'success',
              heightAuto: false,
            });
          } else {
            // Swal.fire({
            //   title: 'Some Thing Error Occured!',
            //   text: 'Onesignal Player ID Not Stored',
            //   icon: 'error',
            //   heightAuto:false
            // })
          }
        },
        error: () => {},
      });
    } else {
      console.warn(
        'OneSignal Player ID or User ID is missing, cannot send to backend.'
      );
    }
  }

  logout() {
    this.sharedService
      .logOut(
        localStorage.getItem('session_id'),
        localStorage.getItem('UserId')
      )
      .subscribe(() => {});
    // localStorage.clear();
    Object.keys(localStorage).forEach((key) => {
      if (key !== 'Mail' && key !== 'Password' && key !== 'useBiometric') {
        localStorage.removeItem(key);
      }
    });
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // async biometricenable() {
  //   try {
  //     // Step 1: Check if biometric is available
  //     const result = await NativeBiometric.isAvailable();

  //     if (!result.isAvailable) {
  //       alert('Biometric authentication is not available');
  //       if (result.errorCode) {
  //         alert('Error code: ' + result.errorCode);
  //       }
  //       return; // exit if not available
  //     }

  //     // Optional: show the type of biometric available
  //     if (result.biometryType) {
  //       console.log('Biometry type: ' + result.biometryType);
  //     }
  //     // Prompt user to authenticate
  //     const verifiedResult: any = await NativeBiometric.verifyIdentity({
  //       reason: 'Please authenticate to login',
  //       fallbackTitle: 'Use device passcode',
  //     });
  //     alert('verifiedResult.verified....' + verifiedResult.verified);

  //     // Step 3: Check result and login
  //     if (verifiedResult.verified) {
  //       alert('Authentication successful! Logging in...');
  //       // TODO: Call your login function or redirect to app home
  //       await this.biometricService.saveCredentials('username', 'password');
  //       localStorage.setItem('useBiometric', 'true');
  //     } else {
  //       alert('Authentication failed or canceled.');
  //     }
  //   } catch (err) {
  //     console.error('Biometric login failed', err);
  //     alert('Biometric login failed: ' + err);
  //   }
  // }

  async loginWithBiometrics(loginSuccess) {
    if (loginSuccess) {
      const isAvailable = await this.biometricService.isBiometricAvailable();
      // localStorage.setItem('useBiometric', 'true');
      if (isAvailable) {
        // Show popup to user: Enable biometric?
        // If YES:
        // await this.biometricService.saveCredentials('username', 'password');
        // localStorage.setItem('useBiometric', 'true');
        this.alertpopup();
      } else {
        // alert('else');
      }
    }
  }

  ionViewDidEnter() {
    if (localStorage.getItem('useBiometric') == 'true') {
      this.isFingerPrintEnabled = true;
    } else {
      this.isFingerPrintEnabled = false;
    }
  }

  ionViewDidEnter1() {}

  loginWithCredentials(username, password) {
    // alert('login');
  }

  // alertpopup() {
  //   this.alertCtrl
  //     .create({
  //       header: 'Enable Fingerprint Login?',
  //       message: 'Do you want to use fingerprint for future logins?',
  //       buttons: [
  //         { text: 'No' },
  //         {
  //           text: 'Yes',
  //           handler: async () => {
  //             await this.biometricService.saveCredentials(
  //               'username',
  //               'password'
  //             );
  //             localStorage.setItem('useBiometric', 'true');
  //           },
  //         },
  //       ],
  //     })
  //     .then((alert) => alert.present());
  // }

  async alertpopup() {
    // 1. Check if biometric is available
    const result = await NativeBiometric.isAvailable();

    if (!result.isAvailable) {
      // alert('Biometric authentication is not available');
      return;
    }

    this.alertCtrl
      .create({
        header: 'Enable Fingerprint Login?',
        message: 'Do you want to use fingerprint for future logins?',
        buttons: [
          { text: 'No' },
          {
            text: 'Yes',
            handler: async () => {
              try {
                this.fingerPrintEnable();
              } catch (err) {
                console.log('Biometric setup failed', err);
              }
            },
          },
        ],
      })
      .then((alert) => alert.present());
  }

  async fingerPrintEnable() {
    const result = await NativeBiometric.isAvailable();

    if (!result.isAvailable) {
      alert(
        'Biometric login is unavailable. Please set it up or wait if it’s locked, or use your password instead.'
      );
      return;
    }
    await NativeBiometric.verifyIdentity({
      reason: 'Please authenticate to login',
      fallbackTitle: 'Use device passcode',
    })
      .then(async () => {
        this.showSpinner = true;
        await this.biometricService.saveCredentials(
          this.loginData.username,
          this.loginData.password
        );
        localStorage.setItem('useBiometric', 'true');
        this.authService.login();
      })
      .catch((err: any) => {
        // alert(err == 'Biometric authentication is not available');
        // if (err == 'Biometric authentication is not available') {
        //   alert('err123' + err);
        // }
        // alert('err?.message++' + err?.message);
        this.showSpinner = false;
        if (
          err?.message == 'Cancel' ||
          err?.message == 'Fingerprint operation cancelled'
        ) {
          this.enableFingerPrintModal = false;
        } else {
          this.enableFingerPrintModal = true;
        }
      });
  }

  // async fingerPrintEnable() {
  //   try {
  //     // 1. Check if biometric is available
  //     const result = await NativeBiometric.isAvailable();

  //     if (!result.isAvailable) {
  //       alert('Biometric authentication is not available');
  //       return;
  //     }

  //     // 2. Prompt user to authenticate
  //     // ⚠ Note: verifyIdentity may throw on failure
  //     const data = await NativeBiometric.verifyIdentity({
  //       reason: 'Please authenticate to login',
  //       fallbackTitle: 'Use device passcode',
  //     });

  //     // If we reach here, authentication succeeded
  //     // alert('Authentication successful! Logging in...');

  //     await this.biometricService.saveCredentials(
  //       this.loginData.username,
  //       this.loginData.password
  //     );
  //     localStorage.setItem('useBiometric', 'true');
  //     this.showSpinner = true;
  //     this.authService.login();

  //     // TODO: Call your login function
  //   } catch (err: any) {
  //     this.showSpinner = false;
  //     // location.reload();
  //     // alert('err' + err);
  //     // alert('JSON.stringify(err)' + JSON.stringify(err));
  //     // alert('err?.message' + err?.message);

  //     // If user cancels or fails, it will throw an error
  //     alert('Biometric login failed123' + err?.message);
  //     if (
  //       err?.message == 'Cancel' ||
  //       err?.message == 'Fingerprint operation cancelled'
  //     ) {
  //       this.enableFingerPrintModal = false;
  //     } else {
  //       this.enableFingerPrintModal = true;
  //     }

  //     if (err?.message?.includes('User canceled')) {
  //       alert('Authentication canceled by user.');
  //     } else {
  //       alert('Biometric login failed: ' + (err?.message || err));
  //     }
  //   }
  // }

  enableFingerPrintModal = false;
  isFingerPrintEnabled = false;
  async loginwithFingerPrint() {
    const result = await NativeBiometric.isAvailable();

    if (!result.isAvailable) {
      ('Biometric login is unavailable. Please set it up or wait if it’s locked, or use your password instead.');
      return;
    }
    await NativeBiometric.verifyIdentity({
      reason: 'Please authenticate to login',
      fallbackTitle: 'Use device passcode',
    })
      .then(async () => {
        const creds = await this.biometricService.getCredentials();
        this.navigateToDashBoard(creds.username, creds.password);
      })
      .catch((err: any) => {
        this.showSpinner = false;
        if (localStorage.getItem('useBiometric') == 'true') {
          this.isFingerPrintEnabled = true;
        } else {
          this.isFingerPrintEnabled = false;
        }
      });

    // const useBio = localStorage.getItem('useBiometric');
    // if (useBio == 'true') {
    //   try {
    //     await NativeBiometric.verifyIdentity({
    //       reason: 'Please authenticate to login',
    //       fallbackTitle: 'Use device passcode',
    //     });
    //     const creds = await this.biometricService.getCredentials();
    //     this.navigateToDashBoard(creds.username, creds.password);
    //   } catch (error: any) {
    //     this.showSpinner = false;
    //     if (localStorage.getItem('useBiometric') == 'true') {
    //       this.isFingerPrintEnabled = true;
    //     } else {
    //       this.isFingerPrintEnabled = false;
    //     }
    //     alert('Authentication failed: ' + error.message);
    //   }
    // }
  }
}

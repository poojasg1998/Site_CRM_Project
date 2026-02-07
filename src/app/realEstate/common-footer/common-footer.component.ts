import { Component, OnInit, ViewChild, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged, Subject } from 'rxjs';
import { PopoverController } from '@ionic/angular';
import Swal from 'sweetalert2';
import { App } from '@capacitor/app';
import { EchoService } from '../echo.service';
import { SharedService } from '../shared.service';
import { MandateService } from '../mandate-service.service';
import { RetailServiceService } from '../retail-service.service';
@Component({
  selector: 'app-common-footer',
  templateUrl: './common-footer.component.html',
  styleUrls: ['./common-footer.component.scss'],
})
export class CommonFooterComponent implements OnInit {
  htype = '';
  isActiveRoute;
  isCP;
  unReadChatCount;
  isRanavLogin = false;
  leadId = '';

  private unReadTrigger$ = new Subject<void>();
  apiAlreadyCalled: any = false;
  callStatus: any = '';
  showSpinner: any;
  assignedrm: any;

  constructor(
    public router: Router,
    private activeRoute: ActivatedRoute,
    private _echoService: EchoService,
    public sharedService: SharedService,
    private popoverController: PopoverController,
    private _mandateService: MandateService,
    private _retailservice: RetailServiceService
  ) {}

  ngOnInit() {
    App.addListener('resume', () => {
      this.getData();
    });
    this.getData();
    // this._echoService.stopListening(
    //   'database-changes',
    //   '.DatabaseNotification'
    // );
    this._echoService.listenToChannel(
      'database-changes',
      '.DatabaseNotification',
      (message) => {
        if (
          localStorage.getItem('UserId') == message?.['0']?.['Receiver'] ||
          localStorage.getItem('UserId') == message?.['0']?.['Sender']
        ) {
          this.sharedService.triggerUnreadCheck();
        }

        if (
          localStorage.getItem('UserId') == message.Executive &&
          (message.Call_status_new == 'Call Disconnected' ||
            message.Call_status_new == 'Call Connected' ||
            message.Call_status_new == 'Answered' ||
            message.Call_status_new == 'BUSY' ||
            message.Call_status_new == 'Executive Busy')
        ) {
          this.callStatus = message.Call_status_new;
          if (
            message.Call_status_new == 'Call Connected' ||
            message.Call_status_new == 'Answered'
          ) {
            this.sharedService.isMenuOpen = false;
          } else {
            this.stopTimer();
            // this.callStatus = message.Call_status;
            this.sharedService.isMenuOpen = true;
            this.isAfterOneminute = false;
            this.isAfterTwominute = false;
          }

          setTimeout(() => {
            this.getLiveCallsData();
          }, 1000);

          return;
        }
      }
    );
    // this.unReadTrigger$.pipe(debounceTime(100)).subscribe(() => {
    //   this.fetchUnreadChatCount();
    // });
  }

  getData() {
    this.activeRoute.queryParams
      .pipe(
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        )
      )
      .subscribe((params) => {
        this.callStatus = '';
        this.getLiveCallsData();

        if (params['leadId']) {
          this.leadId = params['leadId'];
        } else {
          this.leadId = '';
        }
        if (params['isOnCallDetailsPage'] == 'true') {
          this.isOnCallDetailsPage = true;
        } else {
          this.isOnCallDetailsPage = false;
        }
        this.popoverController.dismiss();
        this.isRanavLogin = localStorage.getItem('PropertyId') === '28773';
        this.sharedService.triggerUnreadCheck();

        this.htype = params['htype'];
      });
    // this.getLiveCall();
  }

  headerType = '';
  onCallLeadData;
  getLiveCallsData() {
    this.showSpinner = true;
    this.sharedService.fetchLiveCall(localStorage.getItem('UserId')).subscribe({
      next: (response) => {
        this.showSpinner = false;

        if (response['status'] == 'success') {
          this.sharedService.isMenuOpen = false;
          this.callStatus == 'BUSY' || this.callStatus == 'Executive Busy'
            ? this.updateStatus()
            : '';

          this.onCallLeadData = response['success'][0];
          this.sharedService.onCallLeadData = this.onCallLeadData;
          setTimeout(() => {
            this.callStatus = this.onCallLeadData.dialstatus;
          }, 100);

          if (localStorage.getItem('UserId') == this.onCallLeadData.Exec_IDFK) {
            if (
              this.onCallLeadData.modeofcall == 'Desktop-mandate' ||
              this.onCallLeadData.modeofcall == 'mobile-mandate' ||
              this.onCallLeadData.modeofcall == 'Mobile-Mandate' ||
              this.onCallLeadData.modeofcall == 'Mobile-mandate'
            ) {
              this.headerType = 'mandate';
            } else if (
              this.onCallLeadData.modeofcall == 'Desktop-retail' ||
              this.onCallLeadData.modeofcall == 'mobile-retail' ||
              this.onCallLeadData.modeofcall == 'Mobile-Retail' ||
              this.onCallLeadData.modeofcall == 'Mobile-retail'
            ) {
              this.headerType = 'retail';
            }

            if (
              (this.leadId == '' ||
                this.leadId != this.onCallLeadData.Lead_IDFK) &&
              !this.router.url.includes('isOnCallDetailsPage') &&
              !this.router.url.includes('assigned-leads-detail') &&
              !this.router.url.includes('mandate-customers')
            ) {
              this.isOnCallgoing = true;
              this.startTimer(this.onCallLeadData.starttime);
            }

            if (this.callStatus == 'Answeres') {
              this.startTimer(this.onCallLeadData.starttime);
            }
          }

          if (response['success'][0].direction == 'inbound') {
            this.isOnCallgoing = false;
            this.router.navigate([], {
              queryParams: {
                isOnCallDetailsPage: true,
                leadId: response['success'][0].Lead_IDFK,
                execid: response['success'][0].Exec_IDFK,
                leadTabData: 'status',
                callStatus: 'Call Connected',
                direction: 'outboundCall',
                headerType: this.htype,
              },
              queryParamsHandling: 'merge',
            });
          }
        } else {
          this.sharedService.isMenuOpen = true;
        }
      },
      error: (resp) => {
        this.showSpinner = false;
        this.sharedService.isMenuOpen = true;
      },
    });
  }

  isOnCallgoing = false;
  getLiveCall() {
    // this._echoService.stopListening(
    //   'database-changes',
    //   '.DatabaseNotification'
    // );
    this._echoService.listenToChannel(
      'database-changes',
      '.DatabaseNotification',
      (message) => {
        if (
          localStorage.getItem('UserId') == message?.['0']?.['Receiver'] ||
          localStorage.getItem('UserId') == message?.['0']?.['Sender']
        ) {
          this.sharedService.triggerUnreadCheck();
        }

        if (
          localStorage.getItem('UserId') == message.Executive &&
          (message.Call_status_new == 'Call Disconnected' ||
            message.Call_status_new == 'Call Connected' ||
            message.Call_status_new == 'Answered' ||
            message.Call_status_new == 'BUSY' ||
            message.Call_status_new == 'Executive Busy')
        ) {
          this.callStatus = message.Call_status_new;
          if (
            message.Call_status_new == 'Call Connected' ||
            message.Call_status_new == 'Answered'
          ) {
            this.sharedService.isMenuOpen = false;
          } else {
            this.stopTimer();
            // this.callStatus = message.Call_status;
            this.sharedService.isMenuOpen = true;
            this.isAfterOneminute = false;
            this.isAfterTwominute = false;
          }
          setTimeout(() => {
            this.getLiveCallsData();
          }, 1000);
          return;
        }
      }
    );
  }

  triggerUnreadFetch() {
    this.unReadTrigger$.next();
  }

  // Actual API call
  fetchUnreadChatCount() {
    this.sharedService
      .unreadChatCount(localStorage.getItem('UserId'))
      .subscribe((response) => {
        this.unReadChatCount = response['details'][0].unreadmsgcount;
        this.sharedService.unReadChatCount = this.unReadChatCount;
      });
  }

  getUnReadChatCount() {
    this.sharedService
      .unreadChatCount(localStorage.getItem('UserId'))
      .subscribe((response) => {
        this.unReadChatCount = response['details'][0].unreadmsgcount;
        this.sharedService.unReadChatCount = this.unReadChatCount;
      });
  }

  isHomeActive(): boolean {
    const currentUrl = this.router.url;
    return (
      currentUrl.includes('/home?htype=mandate') ||
      currentUrl.includes('/retail-dashboard')
    );
  }

  isSearchActive(): boolean {
    return this.router.url.includes('/search');
  }

  isActivityActive() {
    return (
      this.router.url.includes('/mymandatereports') ||
      this.router.url.includes('/myretailreports')
    );
  }

  isChatActive() {
    return this.router.url.includes('/chats');
  }

  isNotificationActive() {
    return this.router.url.includes('/notifications');
  }

  footerNavigation(value) {
    if (value == 'home') {
      if (this.htype == 'mandate') {
        const queryParams: any = {
          htype: this.htype,
          propid:
            !localStorage.getItem('ranavPropId') &&
            localStorage.getItem('Role') === '1'
              ? '16793'
              : 'ranavPropId' in localStorage
              ? '28773'
              : '',
        };

        const userId = localStorage.getItem('UserId');
        if (userId !== '1') {
          queryParams.executid = userId;
        }

        this.router.navigate(['/home'], {
          queryParams: queryParams,
        });
      } else {
        this.router.navigate(['/retail-dashboard'], {
          queryParams: {
            htype: this.htype,
          },
        });
      }
    } else if (value == 'search') {
      this.router.navigate(['/search'], {
        queryParams: {
          htype: this.htype,
        },
      });
    } else if (value == 'chats') {
      this.router.navigate(['/chats'], {
        queryParams: {
          htype: this.htype,
        },
      });
    } else if (value == 'notifications') {
      this.router.navigate(['/notifications'], {
        queryParams: {
          chatCallAssign: 'chat',
          htype: 'mandate',
        },
      });
    } else if (value == 'activity') {
      this.router.navigate(['/mymandatereports'], {
        queryParams: {
          status: 'generalfollowups',
          selecteddaterange: 'today',
          htype: 'mandate',
        },
      });
    }
  }
  isOnCallDetailsPage = false;
  onCallDetails() {
    this.isOnCallgoing = false;
    this.isOnCallDetailsPage = true;
    setTimeout(() => {
      this.router
        .navigate([], {
          queryParams: {
            isOnCallDetailsPage: true,
            leadId: this.onCallLeadData.Lead_IDFK,
            execid: this.onCallLeadData.assignee
              ? this.onCallLeadData.assignee
              : this.onCallLeadData.Exec_IDFK,
            leadTabData: 'status',
            headerType: this.headerType,
          },
          queryParamsHandling: 'merge',
        })
        .then(() => {
          this.isOnCallgoing = false;
        });
    }, 100);
  }

  // onCallDetails() {
  //   this.isOnCallgoing = false;
  //   this.isOnCallDetailsPage = true;

  //   setTimeout(() => {
  //     this.router
  //       .navigate([], {
  //         queryParams: {
  //           isOnCallDetailsPage: true,
  //           leadId: this.onCallLeadData.Lead_IDFK,
  //           execid: this.onCallLeadData.assignee
  //             ? this.onCallLeadData.assignee
  //             : this.onCallLeadData.Exec_IDFK,
  //           leadTabData: 'status',
  //           headerType: this.headerType,
  //         },
  //         queryParamsHandling: 'merge',
  //       })
  //       .then(() => {
  //         this.isOnCallgoing = false;
  //       });
  //   }, 100);
  // }

  leadDetailsModalClose(event) {
    this.router.navigate([], {
      queryParams: {
        isOnCallDetailsPage: null,
        leadId: null,
        execid: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  timer: string = '00h:00m:00s';
  private intervalId: any;
  isAfterOneminute = false;
  isAfterTwominute = false;
  startTimer(checkInTime) {
    this.stopTimer();
    const start =
      typeof checkInTime === 'string'
        ? new Date(checkInTime.replace(' ', 'T'))
        : checkInTime;

    this.intervalId = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - start.getTime()) / 1000); // in seconds
      this.timer = this.formatTime(diff);

      if (diff >= 60 && this.callStatus == 'Answered') {
        this.isAfterOneminute = true;
      } else if (
        diff >= 120 &&
        (this.callStatus == 'CONNECTING' || this.callStatus == 'Call Connected')
      ) {
        this.isAfterTwominute = true;
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0') + 'h'}:${
      mins.toString().padStart(2, '0') + 'm'
    }:${secs.toString().padStart(2, '0') + 's'}`;
  }

  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  forceToCallDisconnect() {
    const number = localStorage.getItem('Number');
    const cleanedNumber =
      number.startsWith('91') && number.length > 10 ? number.slice(2) : number;

    Swal.fire({
      title: 'Disconnect Call?',
      text: 'Are you sure you want to disconnect this call?',
      icon: 'warning',
      showCancelButton: true,
      heightAuto: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.isConfirmed) {
        this.sharedService
          .onCallDisconnected(cleanedNumber)
          .subscribe((response) => {
            this.isOnCallgoing = false;
          });
      }
    });
  }

  // common-footer.component.ts
  handleCloseClick() {
    if (
      this.isAfterOneminute &&
      (this.callStatus === 'Call Connected' ||
        this.callStatus == 'Answered' ||
        this.callStatus == 'CONNECTING')
    ) {
      this.forceToCallDisconnect();
    } else if (
      this.callStatus == 'Call Disconnected' ||
      this.callStatus == 'BUSY' ||
      this.callStatus == 'Executive Busy'
    ) {
      this.isOnCallgoing = false;
      this.callStatus = '';
      location.reload();
    } else if (this.isAfterTwominute && this.callStatus == 'CONNECTING') {
      this.forceToCallDisconnect();
    } else if (
      this.isOnCallDetailsPage &&
      (this.callStatus === 'Call Connected' ||
        this.callStatus == 'Answered' ||
        this.callStatus == 'CONNECTING' ||
        this.callStatus == 'Call Disconnected')
    ) {
      this.isOnCallgoing = false;
    }
    // this.isOnCallgoing = false;
  }
  selectedSuggestedProp;
  requestedunits;
  getcustomerview() {
    if (this.htype == 'mandate') {
      this._mandateService
        .getassignedrm(
          this.onCallLeadData.Lead_IDFK,
          localStorage.getItem('UserId'),
          this.onCallLeadData.Exec_IDFK,
          0
        )
        .subscribe((cust) => {
          this.assignedrm = cust['RMname'].filter(
            (item) => item.RMID == this.onCallLeadData.Exec_IDFK
          );
          this.selectedSuggestedProp =
            this.assignedrm?.[0]?.['suggestedprop']?.length == 1
              ? this.assignedrm?.[0]?.['suggestedprop']?.[0]
              : '';

          this.verifyrequest(
            this.assignedrm[0].customer_IDPK,
            this.selectedSuggestedProp['propid'],
            this.assignedrm[0].RMID,
            this.selectedSuggestedProp['name']
          );
        });
    } else {
      this._retailservice
        .getassignedrmretail(
          this.onCallLeadData.Lead_IDFK,
          this.onCallLeadData.Exec_IDFK,
          0
        )
        .subscribe((cust) => {
          this.assignedrm = cust['RMname']?.filter(
            (item) => item.RMID == this.onCallLeadData.Exec_IDFK
          );
          this.verifyrequest(
            this.assignedrm?.[0]?.customer_IDPK,
            this.assignedrm?.[0]?.suggestedprop?.[0]?.propid,
            this.onCallLeadData.Exec_IDFK,
            this.assignedrm?.[0]?.suggestedprop?.[0]?.name
          );
        });
    }
  }

  verifyrequest(leadid, propid, execid, propname) {
    var param = {
      leadid: leadid,
      propid: propid,
      execid: execid,
    };
    if (this.htype == 'mandate') {
      this._mandateService
        .fetchrequestedvalues(param)
        .subscribe((requested) => {
          this.requestedunits = requested?.['requestedvals']?.map(
            (request: any) => {
              request.bhk = request.bhk.trim();
              return request;
            }
          );
        });
    } else {
      this._retailservice.fetchrequestedvalues(param).subscribe((requested) => {
        this.requestedunits = requested['requestedvals'];
      });
    }
  }

  updateStatus() {
    // const today = new Date();
    // const date = today.toISOString().split('T')[0];
    // const time = today.toLocaleTimeString('en-US', {
    //   hour: '2-digit',
    //   minute: '2-digit',
    //   hour12: true,
    // });
    // let stagestatus;
    // if (this.activestagestatus[0].stage !== 'Fresh') {
    //   if (this.activestagestatus[0].stagestatus == '1') {
    //     stagestatus = '1';
    //   } else if (this.activestagestatus[0].stagestatus == '2') {
    //     stagestatus = '2';
    //   } else if (this.activestagestatus[0].stagestatus == '3') {
    //     stagestatus = '3';
    //   }
    // } else {
    //   if (this.activestagestatus[0].stagestatus == null) {
    //     stagestatus = '0';
    //   } else {
    //     stagestatus = this.activestagestatus[0].stagestatus;
    //   }
    // }
    // let followups;
    // if (this.callStatus == 'BUSY') {
    //   followups = {
    //     leadid: this.assignedrm?.[0].customer_IDPK,
    //     actiondate: date,
    //     actiontime: time,
    //     leadstatus: this.activestagestatus[0].stage,
    //     stagestatus: stagestatus,
    //     followupsection: '2',
    //     followupremarks: 'remark',
    //     userid: localStorage.getItem('UserId'),
    //     assignid: this.onCallLeadData.assignee,
    //     autoremarks:
    //       'Status changed to RNR, because the client did not answer the call.',
    //     property: this.selectedSuggestedProp?.['propid'],
    //     feedbackid: 0,
    //   };
    // } else if (this.callStatus == 'Executive Busy') {
    //   followups = {
    //     leadid: this.assignedrm?.[0].customer_IDPK,
    //     actiondate: date,
    //     actiontime: time,
    //     leadstatus: this.activestagestatus[0].stage,
    //     stagestatus: stagestatus,
    //     followupsection: '100',
    //     followupremarks: localStorage.getItem('Name') + ' was busy',
    //     userid: localStorage.getItem('UserId'),
    //     assignid: this.onCallLeadData.assignee,
    //     autoremarks: localStorage.getItem('Name') + ' did not pick the Call.',
    //     property: this.selectedSuggestedProp?.['propid'],
    //     feedbackid: 0,
    //   };
    // }
    // this.showSpinner1 = true;
    // if (
    //   this.filteredParams.htype == 'mandate' ||
    //   this.filteredParams.headerType == 'mandate'
    // ) {
    //   this._mandateService
    //     .addfollowuphistory(followups)
    //     .subscribe((success) => {
    //       if (success['status'] == 'True') {
    //         this.showSpinner = false;
    //         if (this.callStatus == 'Executive Busy') {
    //           this.executiveBusyAlert();
    //         } else if (this.callStatus == 'BUSY') {
    //           this.clientBusyAlert();
    //         }
    //       }
    //     });
    // } else if (
    //   this.filteredParams.htype == 'retail' ||
    //   this.filteredParams.headerType == 'retail'
    // ) {
    //   this._retailservice.addfollowuphistory(followups).subscribe({
    //     next: (success) => {
    //       if (success['status'] == 'True') {
    //         if (this.callStatus == 'Executive Busy') {
    //           this.executiveBusyAlert();
    //         } else if (this.callStatus == 'BUSY') {
    //           this.clientBusyAlert();
    //         }
    //       }
    //     },
    //     error: () => {
    //       this.showSpinner1 = false;
    //     },
    //   });
    // }
  }

  transform(totalSeconds: any): string {
    const secs = parseInt(totalSeconds, 10);
    if (isNaN(secs)) return '00:00:00';

    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;

    const pad = (n: number) => String(n).padStart(2, '0');

    return `${pad(hours) + 'h'}:${pad(minutes) + 'm'}:${pad(seconds) + 's'}`;
  }

  navigateToCallDetails() {
    this.router.navigate(['/notifications'], {
      queryParams: {
        chatCallAssign: 'call',
        callStatus: 'dialed',
        htype: this.htype,
      },
    });
  }
}

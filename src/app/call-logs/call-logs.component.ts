import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { SharedService } from '../shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-call-logs',
  templateUrl: './call-logs.component.html',
  styleUrls: ['./call-logs.component.scss'],
})
export class CallLogsComponent implements OnInit {
  @Input() content: IonContent;
  today: Date = new Date();
  filterParams = {
    callStatus: '',
    fromDate: '',
    toDate: '',
  };
  htype: '';
  callStatus = 'missed';
  isAdmin = false;
  execid = '';
  count: any = 0;
  allCallsData: any;
  showSpinner: boolean;
  isRM: boolean;
  isOnCallDetailsPage = false;
  dateRange: any[];

  constructor(
    public _sharedservice: SharedService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params) => {
      this.callStatus = params['callStatus'];
      this.showInfiniteScroll = true;
      this.showSpinner = true;
      this.isRM =
        localStorage.getItem('Role') == '50001' ||
        localStorage.getItem('Role') == '50002' ||
        localStorage.getItem('Role') == '50009' ||
        localStorage.getItem('Role') == '50010';
      this.execid = params['executid'];
      this.htype = params['htype'];
      this.isOnCallDetailsPage = params['isOnCallDetailsPage'] === 'true';
      this.getallCallsData(false);
    });

    this.isAdmin = localStorage.getItem('Role') == '1';
  }

  onCallstatus(status) {
    this.showSpinner = true;
    this.resetInfiniteScroll();
    this.groupedByDate = [];
    this.callStatus = status;
    this.router.navigate([], {
      queryParams: {
        callStatus: status,
      },
      queryParamsHandling: 'merge',
    });
    // this.getallCallsData(false);
  }

  groupedByDate = [];
  getallCallsData(isLoadmore) {
    // const today = new Date();
    // const yesterday = new Date(today);
    // yesterday.setDate(today.getDate() - 1);
    const params = {
      loginid: localStorage.getItem('UserId'),
      fromcalldatetime: new Date().toLocaleDateString('en-CA'),
      tocalldatetime: new Date().toLocaleDateString('en-CA'),
      execid: this.isAdmin ? this.execid : '',
      callstage: this.callStatus == 'dialed' ? 'overall' : this.callStatus,
      limit: 0,
      limitrows: 20,
    };

    this.count = isLoadmore ? (this.count += 20) : 0;
    params.limit = this.count;

    return new Promise((resolve, reject) => {
      this._sharedservice.fetchAllCallLogs(params).subscribe({
        next: (response: any) => {
          this.showSpinner = false;
          if (response['status'] == 'success') {
            this.allCallsData = isLoadmore
              ? this.allCallsData.concat(response['success'])
              : response['success'];
            this.groupedByDate = [];
            const temp = {};

            this.allCallsData.forEach((item) => {
              const date = this.getDateOnly(item.starttime);
              temp[date] = temp[date] || [];
              temp[date].push(item);
            });
            this.groupedByDate = Object.keys(temp).map((date) => ({
              date,
              data: temp[date],
            }));

            resolve(true);
          } else {
            this.showSpinner = false;
            this.allCallsData = [];
            this.groupedByDate = [];
            resolve(false);
          }
        },
        error: (err) => {
          this.showSpinner = false;
          resolve(false);
        },
      });
    });
  }
  getDateOnly(dateString: string) {
    return dateString.split(' ')[0]; // "2025-11-16 15:08:50" → "2025-11-16"
  }
  showInfiniteScroll = true;
  async loadData(event) {
    // Save current scroll position
    const scrollEl = await this.content.getScrollElement();
    const previousPosition = scrollEl.scrollTop;

    // Load more data
    const hasData = await this.getallCallsData(true);

    setTimeout(async () => {
      event.target.complete();

      if (!hasData) {
        event.target.disabled = true;
        return;
      }

      //Restore scroll position
      this.content.scrollToPoint(0, previousPosition, 0);
    }, 200);
  }

  lead;
  @ViewChild('callslide') callslide;
  @ViewChild('callConfirmationModal') callConfirmationModal;
  outboundCall(lead) {
    this.callslide.close();
    if (lead == true) {
      this.callConfirmationModal.dismiss();
      const cleanedNumber =
        this.lead?.callto.startsWith('91') && this.lead?.callto.length > 10
          ? this.lead?.callto.slice(2)
          : this.lead?.callto;
      const params = {
        execid: localStorage.getItem('UserId'),
        callto: cleanedNumber,
        leadid: this.lead.leadid,
        starttime: this.getCurrentDateTime(),
        modeofcall: 'mobile-' + this.htype,
        leadtype: this.htype,
        assignee: this.lead.Exec_IDFK,
      };

      this._sharedservice.outboundCall(params).subscribe(() => {
        this.callConfirmationModal.dismiss();
      });

      this.router.navigate([], {
        queryParams: {
          isOnCallDetailsPage: true,
          leadId: this.lead.leadid,
          execid: this.lead.Exec_IDFK,
          leadTabData: 'status',
          callStatus: 'Call Connected',
          direction: 'outboundCall',
          headerType: this.htype,
        },
        queryParamsHandling: 'merge',
      });
    } else {
      this.lead = lead;
      this.callConfirmationModal.present();
    }
  }

  onSwipe(event, lead) {
    if (event.detail.side == 'start') {
      window.open(`https://wa.me/+91 ${lead.callto}`, '_system');
    } else {
      this.outboundCall(lead);
    }
  }

  getCurrentDateTime(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  selectDateFilter() {}

  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }

  ngOnDestroy() {
    this._sharedservice.dismissAllOverlays();
  }
}

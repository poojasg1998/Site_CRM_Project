import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { SharedService } from '../shared.service';
import {
  IonContent,
  IonModal,
  MenuController,
  PopoverController,
} from '@ionic/angular';
import { formatDate } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, switchMap } from 'rxjs';

@Component({
  selector: 'app-source-dashboard',
  templateUrl: './source-dashboard.component.html',
  styleUrls: ['./source-dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SourceDashboardComponent implements OnInit {
  // @ViewChild('content', { static: false }) content: IonContent;
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  count = 0;
  showInfiniteScroll = true;
  isProgrammaticScroll = false;
  showSpinner = false;
  localStorage = localStorage;
  loading: boolean = false;
  today: Date = new Date();
  historyList = [];
  filteredParams = {
    isDateFilter: '',
    fromDate: '',
    toDate: '',
    execid: '',
    callRecord: '',
    clientnum: '',
    leadName: '',
    lastUpdate: '',
    callstage: '',
    leads: '',
    source: '',
    status: '',
    activeCardKey: '',
    limit: 0,
    limitrows: 10,
  };

  leadscount;
  sourceListData = [];
  sourceList;
  dateRange = {
    fromdate: null as Date | null,
    todate: null as Date | null,
  };
  sourceLeadCountStats: any;
  roleid;
  depId;
  isOnCallDetailsPage = false;
  constructor(
    private _sharedservice: SharedService,
    private menuCtrl: MenuController,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private popoverController: PopoverController
  ) {}
  ngOnInit() {
    this.getSourceList();
    this.activeRoute.queryParams.subscribe((response) => {
      var a = 10;

      if (response['isOnCallDetailsPage'] == 'true') {
        this.isOnCallDetailsPage = true;
      } else {
        this.isOnCallDetailsPage = false;
      }
      this.roleid = this.localStorage.getItem('Role');
      this.depId = localStorage.getItem('Department');
      this.showSpinner = true;
      // this.historyModal.present();
      this.resetInfiniteScroll();
      this.getqueryParam();

      if (this.localStorage.getItem('Role') == '50015') {
        this.filteredParams.source = 'Magicbricks';
      } else if (this.localStorage.getItem('Role') == '50016') {
        this.filteredParams.source = 'Housing';
      }

      this.loadSourceDashboard();
    });
  }

  getCompleteleadscounts() {
    this._sharedservice
      .getCompleteleadscounts(this.filteredParams)
      .subscribe((resp) => {});
  }

  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }
  getSourceList() {
    this._sharedservice.sourcelist().subscribe((resp) => {
      this.sourceList = [
        { source: 'OverAll Source', id: '' },
        ...(resp['Sources'] || []),
      ];

      // If no source is passed, select OverAll
      const selected = this.filteredParams.source || 'OverAll Source';

      this.selectedSource = this.sourceList.find(
        (item) => item.source === selected
      );
    });
  }

  getSourcebasedleadscount() {
    this._sharedservice
      .getSourcebasedleadscount(this.filteredParams)
      .pipe(
        // 1st API
        switchMap((res1) => {
          this.leadscount = res1?.['result'] || {};
          return this._sharedservice.getSourcebasedleadscounts2(
            this.filteredParams
          );
        }),

        // 2nd API
        switchMap((res2) => {
          this.leadscount = {
            ...this.leadscount,
            ...(res2?.['result'] || {}),
          };

          // 3rd API call
          return this._sharedservice.sourcebsedleadsListing(
            this.filteredParams
          );
        })
      )
      .subscribe({
        next: (res3) => {
          // handle 3rd API response
          this.sourceListData = res3['result'];
        },
        error: (err) => {
          console.error('API error', err);
        },
      });
  }

  loadSourceDashboard() {
    forkJoin([
      this._sharedservice.getSourcebasedleadscount(this.filteredParams),
      this._sharedservice.getSourcebasedleadscounts2(this.filteredParams),
    ]).subscribe({
      next: ([res1, res2]) => {
        // ✅ counts merged once
        this.leadscount = {
          ...(res1?.['result'] || {}),
          ...(res2?.['result'] || {}),
        };

        this.loadSourceList(false);
      },
      error: (err) => {
        this.showSpinner = false;
      },
    });
  }

  loadSourceList(isLoadMore: boolean) {
    this.count = isLoadMore ? (this.count += 10) : 0;
    this.filteredParams.limit = this.count;
    this.filteredParams.leads =
      this.filteredParams.status == 'Total' ? this.filteredParams.leads : '';
    return new Promise((resolve, reject) => {
      this._sharedservice
        .sourcebsedleadsListing(this.filteredParams)
        .subscribe({
          next: (response: any) => {
            if (response['status'] == 'True') {
              this.sourceLeadCountStats =
                this.filteredParams.limit == 0
                  ? response['counts']
                  : this.sourceLeadCountStats;
              this.sourceListData = isLoadMore
                ? this.sourceListData.concat(response['result'])
                : response['result'];
              resolve(true);
            } else {
              isLoadMore ? '' : (this.sourceListData = []);
              resolve(false);
            }
            this.showSpinner = false;
          },
          error: (err) => {
            this.sourceListData = [];
            this.showSpinner = false;
            resolve(false);
          },
        });
    });
  }

  openEndMenu() {
    this._sharedservice.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  selectDateFilter(dateType) {
    dateType === 'custom' || dateType == 'customfromDate'
      ? ''
      : (this.filteredParams.isDateFilter = dateType);
    if (dateType == 'today') {
      this.dateRange = {
        fromdate: null as Date | null,
        todate: null as Date | null,
      };
      this.filteredParams.fromDate = this.getTodayDate();
      this.filteredParams.toDate = this.getTodayDate();
    } else if (dateType == 'yesterday') {
      this.dateRange = {
        fromdate: null as Date | null,
        todate: null as Date | null,
      };
      this.filteredParams.fromDate = this.getYesterdayDate();
      this.filteredParams.toDate = this.getYesterdayDate();
    } else if (dateType == 'lastsevendays') {
      this.dateRange = {
        fromdate: null as Date | null,
        todate: null as Date | null,
      };
      this.filteredParams.fromDate = this.getsevenDaysAgo();
      this.filteredParams.toDate = this.getTodayDate();
    } else if (dateType === 'custom') {
      const from = this.dateRange.fromdate;
      const to = this.dateRange.todate;

      if (from && to) {
        // SIMPLE conversion – no errors, no timezone issues
        const fromStr = from.toLocaleDateString('en-CA');
        const toStr = to.toLocaleDateString('en-CA');

        // assign to filteredParams
        this.filteredParams.fromDate = fromStr;
        this.filteredParams.toDate = toStr;

        this.filteredParams.isDateFilter = 'custom';
      }
      this.dateRange.fromdate && this.dateRange.todate
        ? (this.popoverController.dismiss(), this.addQueryParams())
        : '';
    } else if (dateType == 'customfromDate') {
      if (this.dateRange.fromdate > this.dateRange.todate) {
        this.filteredParams.toDate = '';
        this.dateRange.todate = null;
      } else if (this.dateRange.fromdate && this.dateRange.todate) {
        this.filteredParams.fromDate =
          this.dateRange.fromdate.toLocaleDateString('en-CA');
        this.filteredParams.toDate =
          this.dateRange.todate.toLocaleDateString('en-CA');
      }

      this.dateRange.fromdate && this.dateRange.todate
        ? (this.addQueryParams(), this.popoverController.dismiss())
        : '';

      return;
    }
    dateType === 'custom' || dateType == 'customfromDate'
      ? ''
      : this.addQueryParams();
  }
  getYesterdayDate() {
    const today = new Date();
    today.setDate(today.getDate() - 1); // subtract 1 day
    return today.toISOString().split('T')[0];
  }

  getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
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

  getsevenDaysAgo() {
    const today = new Date();
    today.setDate(today.getDate() - 6);
    return today.toISOString().split('T')[0];
  }

  reset() {
    this.filteredParams = {
      fromDate: this.getTodayDate(),
      toDate: this.getTodayDate(),
      isDateFilter: 'today',
      execid: '',
      callRecord: '',
      clientnum: '',
      leadName: '',
      lastUpdate: '',
      callstage: '',
      status: 'Total',
      leads: '1',
      source: '',
      activeCardKey: 'total_card',
      limit: 0,
      limitrows: 10,
    };
    this.dateRange = {
      fromdate: null as Date | null,
      todate: null as Date | null,
    };
    this.addQueryParams();
  }

  isAtBottom = false;
  canScroll;
  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.content.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;

      this.canScroll = scrollHeight > clientHeight + 10; // ADD A BUFFER of 10px

      if (!this.canScroll) {
        this.isAtBottom = false;
        this._sharedservice.isBottom = false;
      } else {
        this.isAtBottom = scrollTop + clientHeight >= scrollHeight - 100;
        this._sharedservice.isBottom =
          scrollTop + clientHeight >= scrollHeight - 100;
      }
    });
  }

  removeDateFilter() {
    this.dateRange = {
      fromdate: null as Date | null,
      todate: null as Date | null,
    };
    this.filteredParams.isDateFilter = 'today';
    this.filteredParams.fromDate = new Date().toLocaleDateString('en-CA');
    this.filteredParams.toDate = new Date().toLocaleDateString('en-CA');
    this.addQueryParams();
  }

  onFilter(data) {
    this.filteredParams.source =
      data.value.source != 'OverAll Source' ? data.value.source : '';
    this.addQueryParams();
  }
  selectedSource;

  @ViewChild('dashboard_custDate_modal') dashboard_custDate_modal: IonModal;
  @ViewChild('dashboard_fromDate_modal') dashboard_fromDate_modal: IonModal;
  @ViewChild('dashboard_toDate_modal') dashboard_toDate_modal: IonModal;
  @ViewChild('historyModal') historyModal: IonModal;
  showFromDateError = false;
  onmodaldismiss() {
    this.dashboard_fromDate_modal?.dismiss();
    this.dashboard_toDate_modal?.dismiss();
  }
  dateFilter(dateType) {
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
      this.filteredParams.fromDate = format(today);
      this.filteredParams.toDate = format(today);
    } else if (dateType === 'yesterday') {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      this.filteredParams.fromDate = format(y);
      this.filteredParams.toDate = format(y);
    } else if (dateType === 'lastsevenDay') {
      const from = new Date(today);
      from.setDate(from.getDate() - 6);
      this.filteredParams.fromDate = format(from);
      this.filteredParams.toDate = format(today);
    } else if (dateType === 'custom') {
      this.filteredParams.isDateFilter = dateType;
      this.dashboard_custDate_modal.present();
      return;
    } else if (dateType == 'customfromDate') {
      this.filteredParams.isDateFilter = 'custom';
      if (this.dateRange.fromdate > this.dateRange.todate) {
        this.filteredParams.toDate = '';
        this.dateRange.todate = null;
      } else {
        this.filteredParams.fromDate = ('' + this.dateRange.fromdate).split(
          'T'
        )[0];
        this.filteredParams.toDate = ('' + this.dateRange.todate).split('T')[0];
      }
      this.showFromDateError = false;
      this.dashboard_fromDate_modal?.dismiss();
      return;
    } else if (dateType == 'customtoDate') {
      this.filteredParams.isDateFilter = 'custom';
      this.filteredParams.toDate = ('' + this.dateRange.todate).split('T')[0];
      this.dashboard_toDate_modal?.dismiss();
      return;
    }
    this.addQueryParams();
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
  // To open to date modal
  async openToDate() {
    await this.dashboard_fromDate_modal?.dismiss();
    await this.dashboard_toDate_modal.present();
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
      this.filteredParams.fromDate = new Date().toLocaleDateString('en-CA');
      this.filteredParams.toDate = new Date().toLocaleDateString('en-CA');
      this.addQueryParams();
    }
  }

  onStatus(status, key) {
    this.filteredParams.leads = status == 'Total' ? '1' : '';
    this.filteredParams.activeCardKey = key;
    this.filteredParams.status = status;
    this.isProgrammaticScroll = true;
    setTimeout(() => {
      this.scrollToLeads();
    }, 1000);
    this.addQueryParams();
  }

  selectedLead = [];
  onHistoryView(lead) {
    this.selectedLead = lead;
    this.historyList = [];
    this._sharedservice
      .sourcebsedleadsDetails(lead.leadid)
      .subscribe((resp) => {
        if (resp['status'] == 'True') {
          this.historyList = resp['result'];
        } else {
          this.historyList = [];
        }
      });

    this.historyModal.present();
  }

  loadMoreData(event) {
    if (this.isProgrammaticScroll) {
      event.target.complete();
      return;
    }

    this.loadSourceList(true).then((hasData) => {
      event.target.complete();
      if (!hasData) {
        event.target.disabled = true;
      }
    });
  }

  @ViewChild('leadsSection') leadsSection!: any;

  scrollToLeads() {
    this.leadsSection.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    setTimeout(() => {
      this.isProgrammaticScroll = false;
    }, 500);
  }

  onDuplicateUnique(lead) {
    this.filteredParams.leads = lead;
    this.addQueryParams();
  }

  getTimelineItems() {
    return this.historyList?.filter(
      (item) => item.item_type !== 'message_date'
    );
  }
  ngOnDestroy() {
    this._sharedservice.dismissAllOverlays();
  }
  page = 1;
  navigateToDetailsPage(leadId, execid, lead) {
    this._sharedservice.enquiries = this.sourceListData;
    this._sharedservice.page = this.page;
    this._sharedservice.hasState = true;
    let propid;
    // lead.suggestedprop.forEach((prop) => {
    //   if (lead.propertyname == prop.name) {
    //     propid = prop.propid;
    //   }
    // });
    this.router.navigate(['../mandate-customers'], {
      queryParams: {
        leadId: leadId,
        execid: execid,
        status: 'info',
        propid: propid,
        teamlead:
          localStorage.getItem('RoleType') == '1'
            ? localStorage.getItem('UserId')
            : null,
        htype: 'mandate',
      },
    });
  }
}

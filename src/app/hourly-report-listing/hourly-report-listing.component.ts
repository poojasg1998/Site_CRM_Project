import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import {
  IonContent,
  IonPopover,
  MenuController,
  PopoverController,
} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarComponentOptions } from '@googlproxer/ion-range-calendar';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-hourly-report-listing',
  templateUrl: './hourly-report-listing.component.html',
  styleUrls: ['./hourly-report-listing.component.scss'],
})
export class HourlyReportListingComponent implements OnInit {
  @ViewChild('datePopover') datePopover!: IonPopover;
  @ViewChild('filterModal') filterModal;
  stageSearched;
  isLeftFilterActive;
  sourceList;
  sourceList1;
  sourceSearchTerm;
  executiveList;
  executiveList1;
  executiveSearchedName;
  isAdmin = false;
  count;
  showSpinner = false;
  isCustomDate = false;
  showInfiniteScroll = true;
  dateRange = {
    fromdate: null as Date | null,
    todate: null as Date | null,
  };
  localStorage = localStorage;
  tempFilteredValues;
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
    isZeroActiveLeads: 'false',
    status: '',
    source: '',
    isStage: '',
    htype: '',
    isDateFilter: 'today',
    pageid: 1,
  };
  time = [
    { name: 'Overall', code: '' },
    { name: 'Before 9:30AM', code: '00:00-09:30' },
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
  statuses = [
    { id: 'GF', name: 'General Followups' },
    { id: 'NC', name: 'Normal Calls' },
    { id: 'USV-Fix', name: 'USV Fix' },
    { id: 'USV-Done', name: 'USV Done' },
    { id: 'SV-Fix', name: 'SV Fix' },
    { id: 'SV-Done', name: 'SV Done' },
    { id: 'RSV-Fix', name: 'RSV Fix' },
    { id: 'RSV-Done', name: 'RSV Done' },
    { id: 'FN-Fix', name: 'FN Fix' },
    { id: 'FN-Done', name: 'FN Done' },
    { id: 'Inactive', name: 'Inactive' },
    { id: 'JunkLeads', name: 'Junk Leads' },
    { id: 'JunkVisits', name: 'Junk Visits' },
    { id: 'BR', name: 'Booking Request' },
    { id: 'Booked', name: 'Booked' },
    { id: 'Others', name: 'Others' },
  ];
  statuses1;
  selectedTime = this.time[0];

  optionsRange: CalendarComponentOptions = {
    pickMode: 'range',
    from: new Date(2025, 2, 25),
    to: new Date(),
  };
  leads_detail: any = [];

  constructor(
    private ngZone: NgZone,
    private sharedService: SharedService,
    private router: Router,
    private menuCtrl: MenuController,
    private location: Location,
    private activeRoute: ActivatedRoute,
    private popoverController: PopoverController
  ) {}

  ngOnInit() {
    this.activeRoute.queryParamMap.subscribe(() => {
      this.leads_detail = [];
      this.statuses1 = this.statuses;
      this.isAdmin = this.localStorage.getItem('Role') === '1';
      this.getQueryParams();
      this.getSource();
      this.getExecutiveList();
      this.getHourlyReport(false);
      this.updateTime();
      this.selectedTime =
        this.time.find(
          (t) =>
            t.code ===
            `${this.filteredParams.fromtime}-${this.filteredParams.totime}`
        ) || this.time[0];
    });
  }

  updateTime() {
    if (this.filteredParams.fromtime) {
      let timeParts = this.filteredParams.fromtime.split(':');
      let hours = timeParts[0];
      let minutes = timeParts[1];

      if (minutes === '31') {
        this.filteredParams.fromtime = `${hours}:30`;
      }
    }
  }

  onBackButton() {
    this.location.back();
  }
  openEndMenu() {
    this.sharedService.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Returns 'YYYY-MM-DD'
  }

  onDateFilter(date) {
    this.sourceSearchTerm = '';
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
      // this.dateRange = null;
      this.isCustomDate = true;
    }
    this.addQueryParams();
  }

  getlastSeventhDate() {
    const today = new Date();
    const last7thDate = new Date();
    last7thDate.setDate(today.getDate() - 6);
    return last7thDate.toISOString().split('T')[0];
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

  reSet() {
    this.resetInfiniteScroll();
    this.isLeftFilterActive = 'stage';
    this.isCustomDate = false;
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
      isZeroActiveLeads: 'false',
      isStage: '',
      source: '',
      status: this.filteredParams.status,
      pageid: 1,
      isDateFilter: 'today',
      htype: this.filteredParams.htype,
    };
    this.dateRange = {
      fromdate: null as Date | null,
      todate: null as Date | null,
    };
    this.addQueryParams();
  }

  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }

  onCustomDate() {
    // this.filteredParams.fromdate = this.dateRange.from;
    // this.filteredParams.todate = this.dateRange.to;
    // if (this.dateRange?.from && this.dateRange?.to) {
    //   setTimeout(() => {
    //     this.datePopover.dismiss();
    //   }, 200);
    // }
    // this.addQueryParams();
    // this.popoverController.dismiss();
  }

  onTimeFilter(event) {
    let [timeRange, text] = event.value.code.split(' ', 2);
    let [startTime, endTime] = timeRange.split('-');
    this.filteredParams.fromtime = startTime;
    this.filteredParams.totime = endTime;
    this.addQueryParams();
  }

  getHourlyReport(isLoadmore) {
    this.showSpinner = true;
    this.count = isLoadmore ? this.count + 1 : 1;
    this.filteredParams.pageid = this.count;
    return new Promise((resolve, reject) => {
      this.sharedService
        .getHourlyReportListing(this.filteredParams)
        .subscribe((response) => {
          this.showSpinner = false;
          this.ngZone.run(() => {
            if (response['status'] === 'True') {
              this.leads_detail = response['Exec_list'];
              resolve(true);
            } else {
              resolve(false);
            }
          });
        });
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
  onSwipe(event, lead: any) {
    if (event.detail.side == 'start') {
      window.open(`https://wa.me/+91 ${lead.number}`, '_system');
      // this.navigateToWhatsApp(lead.number);
    } else {
      window.open(`tel:${lead.number}`, '_system');
      if (lead && lead.number) {
        // Trigger the call
        window.open(`tel:${lead.number}`, '_system');
      } else {
        console.error('Phone number not available for the selected lead.');
      }
    }
  }

  // TO DISPLAY FILTER SECTION
  navigateToFilter() {
    this.tempFilteredValues = { ...this.filteredParams };
    this.isLeftFilterActive = 'stage';
    this.filterModal.present();
  }

  getSource() {
    this.sharedService.sourcelist().subscribe((response) => {
      this.sourceList = response['Sources'];
      this.sourceList1 = this.sourceList;
    });
  }

  getExecutiveList() {
    this.sharedService.getexecutiveslist().subscribe((response) => {
      this.executiveList = response['Executiveslist'];
      this.executiveList1 = this.executiveList;
    });
  }
  setFilteredSource() {
    this.sourceList1 = this.sourceList.filter((item) => {
      return item.source
        .toLowerCase()
        .includes(this.sourceSearchTerm.toLowerCase());
    });
  }

  @ViewChild('sourceScrollContent', { static: false })
  sourceScrollContent!: IonContent;
  async scrollToSelectedSource(): Promise<void> {
    const source = this.tempFilteredValues.source;
    if (!source) {
      return;
    }
    const elementId = `${source}`;
    setTimeout(() => {
      const selectedElement = document.getElementById(elementId);
      if (selectedElement) {
        this.sourceScrollContent.scrollToPoint(
          0,
          selectedElement.offsetTop,
          500
        );
      } else {
        console.log('Element not found2:', elementId);
      }
    }, 1000);
  }

  setFilteredExecutive() {
    this.executiveList1 = this.executiveList.filter((item) => {
      return item.Name.toLowerCase().includes(
        this.executiveSearchedName.toLowerCase()
      );
    });
  }

  setFilteredStage() {
    this.statuses1 = this.statuses.filter((item) => {
      return item.name.toLowerCase().includes(this.stageSearched.toLowerCase());
    });
  }

  confirmSelection() {
    this.filteredParams = { ...this.tempFilteredValues };
    this.filterModal.dismiss();
    this.addQueryParams();
  }

  onFilterValues(value) {
    if (value == 'source') {
      this.scrollToSelectedSource();
    }
    this.isLeftFilterActive = value;
  }

  onFilterSelection(value, data) {
    switch (value) {
      case 'source':
        this.tempFilteredValues.source = data == 'all' ? '' : data;
        break;
      case 'stage':
        this.tempFilteredValues.status = data;
        break;
      case 'executive':
        this.tempFilteredValues.execid = data;
        break;
      default:
        break;
    }
  }

  initializeFilterParam() {}

  navigateToWhatsApp(number) {
    this.router.navigate(['./clients-chats'], {
      queryParams: {
        chatListSearch: number,
        selectedChat: 'all',
        htype: this.filteredParams.htype,
      },
    });
  }

  dateFilter(dateType) {
    const today = new Date();
    const format = (d) => d.toISOString().split('T')[0];

    if (dateType != 'custom' && dateType != 'customfromDate') {
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
    } else if (dateType == 'lastsevenDay') {
      const today = new Date();
      today.setDate(today.getDate() - 6);
      this.filteredParams.fromdate = today.toISOString().split('T')[0];
      this.filteredParams.todate = new Date().toISOString().split('T')[0];
    } else if (dateType === 'custom') {
      const from = this.dateRange.fromdate;
      const to = this.dateRange.todate;

      if (from && to) {
        // SIMPLE conversion – no errors, no timezone issues
        const fromStr = from.toLocaleDateString('en-CA');
        const toStr = to.toLocaleDateString('en-CA');

        // assign to filteredParams
        this.filteredParams.fromdate = fromStr;
        this.filteredParams.todate = toStr;
        this.filteredParams.isDateFilter = 'custom';
        this.addQueryParams();
      }

      this.dateRange.fromdate && this.dateRange.todate
        ? this.popoverController.dismiss()
        : '';
    } else if (dateType == 'lastsevenDay') {
      const today = new Date();
      today.setDate(today.getDate() - 6);
      this.filteredParams.fromdate = today.toISOString().split('T')[0];
      this.filteredParams.todate = new Date().toISOString().split('T')[0];
    } else if (dateType == 'customfromDate') {
      if (this.dateRange.fromdate > this.dateRange.todate) {
        this.filteredParams.todate = '';
        this.dateRange.todate = null;
      } else if (this.dateRange.fromdate && this.dateRange.todate) {
        this.filteredParams.fromdate =
          this.dateRange.fromdate.toLocaleDateString('en-CA');
        this.filteredParams.todate =
          this.dateRange.todate.toLocaleDateString('en-CA');
      }

      this.dateRange.fromdate && this.dateRange.todate
        ? (this.addQueryParams(), this.popoverController.dismiss())
        : '';

      return;
    }

    dateType != 'custom' && dateType != 'customfromDate'
      ? this.addQueryParams()
      : '';
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { __values } from 'tslib';
import { SharedService } from '../shared.service';
import { IonContent, MenuController } from '@ionic/angular';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {
  @ViewChild('childRef') child: any;

  filteredParams = {
    chatCallAssign: '',
    execid: '',
    callStatus: '',
  };
  allCallCounts: any;
  isOnCallDetailsPage = false;

  constructor(
    public sharedService: SharedService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private menuCtrl: MenuController
  ) {}

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params) => {
      this.getqueryParam();
      this.isOnCallDetailsPage = params['isOnCallDetailsPage'] === 'true';
      // this.getCallCounts();
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

  onFilter(type) {
    this.filteredParams.chatCallAssign = type;
    this.filteredParams.callStatus = type == 'call' ? 'dialed' : '';
    this.addQueryParams();
  }

  // getCallCounts() {
  //   const params = {
  //     loginid: localStorage.getItem('UserId'),
  //     fromcalldatetime: '',
  //     tocalldatetime: '',
  //     execid: this.filteredParams.execid,
  //   };
  //   this.sharedService.getCallCounts(params).subscribe((resp) => {
  //     this.allCallCounts = resp['success'][0];
  //     console.log(this.allCallCounts);
  //   });
  // }
  @ViewChild('mainscrollContainer', { static: false }) content: IonContent;
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

  openEndMenu() {
    this.sharedService.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  scrollTop() {
    this.content.scrollToTop(500);
  }
}

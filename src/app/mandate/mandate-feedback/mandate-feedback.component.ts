import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { IonCheckbox, IonContent, MenuController } from '@ionic/angular';
import { formatDate, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MandateService } from 'src/app/mandate-service.service';
import { SharedService } from 'src/app/shared.service';
import { RetailServiceService } from 'src/app/retail-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mandate-feedback',
  templateUrl: './mandate-feedback.component.html',
  styleUrls: ['./mandate-feedback.component.scss'],
})
export class MandateFeedbackComponent implements OnInit {
  @ViewChild('filterModal') filterModal;
  @ViewChild('sourceScrollContent', { static: false })
  sourceScrollContent!: IonContent;
  @ViewChild('visitedRMScrollContent', { static: false })
  visitedRMScrollContent!: IonContent;
  @ViewChild('assignLeadsModal') assignLeadsModal;
  @ViewChild('viewAssignLeadDetail') viewAssignLeadDetail;
  @ViewChild('scrollContainer') scrollContainer: ElementRef;
  @ViewChildren('freshleadsCheckboxes') checkboxes!: QueryList<IonCheckbox>;

  selectedCount;
  localStorage = localStorage;
  isCheckbox = false;
  showSpinner = true;
  showInfiniteScroll = true;
  temporaryLeadIds = [];
  leads_detail = [];
  isManual = false;
  isLeftFilterActive;
  isenabled = true;
  propertySearchedName;
  propertyList;
  propertyList1;
  executiveSearchedName;
  mandateExecutives;
  mandateExecutives1;
  mandateCSExecutives;
  mandateCSExecutives1;
  feedbackAssignSearchTerm;
  feedbackAssignees1;
  feedbackAssignees;
  showSpinner1 = false;
  startdate;
  enddate;
  minDate;
  maxDate;
  endDateMinDate;
  setDefaultFromTime;
  setDefaultToTime;
  endDateMinDateNextaction;

  feedbackCount = {
    untouched: '',
    usvCount: '',
    svCount: '',
    rsvCount: '',
    fnCount: '',
    junkCount: '',
    ncCount: '',
  };

  tempFilteredValues;

  count = 0;

  filteredParams = {
    fromDate: '',
    toDate: '',
    status: '',
    stage: '',
    stagestatus: '',
    rmid: '',
    tcid:
      localStorage.getItem('Role') === '1'
        ? ''
        : localStorage.getItem('UserId'),
    source: '',
    htype: '',
    propid: '',
    receivedfromdate: '',
    receivedtodate: '',
    visitedfromdate: '',
    visitedtodate: '',
    activityfromdate: '',
    activitytodate: '',
    suggestedprop: '',
    visitedprop: '',
    counter: '',
    assignedfromdate: '',
    assignedtodate: '',
    FromTime: '',
    ToTime: '',
    visitedPropertyName: '',
    team: '',
    fromTime: '',
    toTime: '',
    executid:
      localStorage.getItem('Role') === '1'
        ? []
        : localStorage.getItem('UserId'),
    loginid: '1',
    active: '1',
    limit: 0,
    limitrows: 5,
  };
  checkedLeadsDetail: any[];
  fromExecids: any = [];
  sourceSearchTerm;
  sourceList;
  sourceList1;
  stages = ['USV', 'SV', 'RSV', 'FN'];
  selectedStageStatus: { [key: string]: string } = {};
  isAdmin;
  isCP;
  isOnCallDetailsPage: any = false;
  execid: any;
  leadId: any;
  feedbackId: any;
  isRM = false;
  constructor(
    private _location: Location,
    private menuCtrl: MenuController,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private mandateService: MandateService,
    private ngZone: NgZone,
    public _sharedservice: SharedService,
    private retailService: RetailServiceService
  ) {
    this.initializeStartEndDate();
  }
  page = 1;
  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params) => {
      this.isRM =
        this.localStorage.getItem('Role') == '50001' ||
        this.localStorage.getItem('Role') == '50002' ||
        this.localStorage.getItem('Role') == '50009' ||
        this.localStorage.getItem('Role') == '50010';
      this.leadId = params['leadId'];
      this.execid = params['execid'];
      this.feedbackId = params['feedback'];
      this.leads_detail = [];
      this.isAdmin = this.localStorage.getItem('Role') === '1';
      this.isCP = this.localStorage.getItem('cpId') === '1';
      this.getQueryParams();
      this.getsourcelist();
      this.getProperty();
      this.getExecutives();
      // this.getRetailExec();

      this.getPriceList();

      if (params['isOnCallDetailsPage'] == 'true') {
        this.isOnCallDetailsPage = true;
      } else {
        this.isOnCallDetailsPage = false;
      }

      if (this._sharedservice.hasState) {
        this.showSpinner = false;
        this.leads_detail = this._sharedservice.enquiries;
        this.page = this._sharedservice.page;
        setTimeout(() => {
          this.content.scrollToPoint(0, this._sharedservice.scrollTop, 0);
        }, 0);

        setTimeout(() => {
          this._sharedservice.hasState = false;
        }, 5000);
      } else {
        this.content?.scrollToTop(300);
        this.fetchFeedbackLeadsCount();
      }
    });
  }

  onBackButton() {
    this.resetInfiniteScroll();
    this._location.back();
    this.ngOnInit();
  }

  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }

  onBackicon() {
    this.isCheckbox = false;
    this.showSpinner = false;
  }
  openEndMenu() {
    this._sharedservice.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  getQueryParams() {
    const queryString = window.location.search;
    const queryParams: any = {};

    // Handle multiple query params (like executid=40119&executid=40200)
    const urlParams = new URLSearchParams(queryString);
    urlParams.forEach((value, key) => {
      if (queryParams[key]) {
        // If already present, make it an array
        if (Array.isArray(queryParams[key])) {
          queryParams[key].push(value);
        } else {
          queryParams[key] = [queryParams[key], value];
        }
      } else {
        queryParams[key] = value;
      }
    });

    //  Assign values
    Object.keys(this.filteredParams).forEach((key) => {
      if (queryParams.hasOwnProperty(key)) {
        // If param like executid=40119,40200 convert to array
        if (key === 'executid') {
          const val = queryParams[key];
          if (Array.isArray(val)) {
            this.filteredParams[key] = val;
          } else if (typeof val === 'string' && val.includes(',')) {
            this.filteredParams[key] = val.split(',');
          } else {
            this.filteredParams[key] = [val];
          }
        } else {
          this.filteredParams[key] = queryParams[key];
        }
      } else if (key === 'propid' && localStorage.getItem('ranavPropId')) {
        this.filteredParams[key] = '28773';
      } else if (key !== 'loginid' && key !== 'limit' && key !== 'limitrows') {
        this.filteredParams[key] = '';
      }
    });

    // this.activeRoute.queryParamMap.subscribe((params) => {
    //   const paramMap = params.get('selectedOption');
    //   const isEmpty = !paramMap;

    //   const queryString = window.location.search;
    //   const queryParams = {};
    //   new URLSearchParams(queryString).forEach((value, key) => {
    //     queryParams[key] = value;
    //   });

    //   Object.keys(this.filteredParams).forEach((key) => {
    //     if (queryParams.hasOwnProperty(key)) {
    //       this.filteredParams[key] = queryParams[key];
    //     } else if (
    //       key !== 'loginid' &&
    //       key !== 'limit' &&
    //       key !== 'limitrows' &&
    //       key !== 'tcid'
    //     ) {
    //       this.filteredParams[key] = '';
    //     }
    //   });

    //   if (this.filteredParams.propid === '28773') {
    //     this.mandateService.setHoverState('ranav_group');
    //   } else {
    //     this.mandateService.setHoverState('');
    //   }
    // });
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
    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  onHtype(htype) {
    this.reset_filter();
    this.filteredParams = { ...this.tempFilteredValues };
    const queryParams = {};
    for (const key in this.filteredParams) {
      if (
        this.filteredParams.hasOwnProperty(key) &&
        this.filteredParams[key] !== ''
      ) {
        queryParams[key] = this.filteredParams[key];
      } else {
        queryParams[key] = null;
      }
    }
    if (htype == 'mandate') {
      this.router.navigate(['mandate-feedback'], {
        queryParams,
        queryParamsHandling: 'merge',
      });
    } else {
      this.router.navigate(['retail-feedback'], {
        queryParams,
        queryParamsHandling: 'merge',
      });
    }
  }

  onRetailFeedback() {
    this.router.navigate(['retail-feedback'], {
      queryParams: {
        status: 'pending',
        htype: 'retail',
      },
      queryParamsHandling: 'merge',
    });
  }
  // onHtype(htype){
  //   this.reset_filter();

  //   if(htype=='mandate'){
  //     this.router.navigate(['mandate-feedback'],{
  //       queryParams:{
  //         htype:htype,
  //       },
  //        queryParamsHandling:'merge'
  //     })
  //   }else{
  //     this.router.navigate(['retail-feedback'],{
  //       queryParams:{
  //         htype:htype
  //       },
  //       queryParamsHandling:'merge'
  //     })
  //   }
  // }

  onStage(value, element) {
    this.resetInfiniteScroll();
    if (value == 'pending' || value == '' || value == 'junkvisits') {
      this.filteredParams.status = value;
      this.filteredParams.stage = '';
    } else {
      this.filteredParams.stage = value;
      this.filteredParams.status = '';
    }
    this.addQueryParams();
  }

  formatId(value: string): string {
    return value ? value.replace(/\s+/g, '-') : '';
  }

  //TO GET THE LEADS COUNT
  fetchFeedbackLeadsCount() {
    this.showSpinner = true;
    const requests = [];
    const status = ['pending', 'junkvisits'];
    status.forEach((status) => {
      const params = {
        ...this.filteredParams,
        status: status,
        stage:
          (this.filteredParams.status === 'pending' ||
            this.filteredParams.status === 'junkvisits') &&
          this.filteredParams.stage != ''
            ? this.filteredParams.stage
            : '',
      };
      requests.push(this.mandateService.getFeedbackLeadsCount(params));
    });
    const stage = ['NC', 'USV', 'RSV', 'Final Negotiation'];
    stage.forEach((stage) => {
      const params = { ...this.filteredParams, stage: stage, status: '' };
      requests.push(this.mandateService.getFeedbackLeadsCount(params));
    });

    forkJoin(requests).subscribe((results) => {
      results.forEach((assgnleads, index) => {
        switch (index) {
          case 0:
            this.feedbackCount.untouched =
              assgnleads['AssignedLeads'][0]['uniqueecount'];
            break;
          case 1:
            this.feedbackCount.junkCount =
              assgnleads['AssignedLeads'][0]['uniqueecount'];
            break;
          case 2:
            this.feedbackCount.ncCount =
              assgnleads['AssignedLeads'][0]['uniqueecount'];
            break;
          case 3:
            this.feedbackCount.usvCount =
              assgnleads['AssignedLeads'][0]['uniqueecount'];
            break;
          case 4:
            this.feedbackCount.rsvCount =
              assgnleads['AssignedLeads'][0]['uniqueecount'];
            break;
          case 5:
            this.feedbackCount.fnCount =
              assgnleads['AssignedLeads'][0]['uniqueecount'];
            break;
        }
      });
    });
    this.fetchFeedbackLeadsDetail(false, 0);
  }
  fetchFeedbackLeadsDetail(isLoadmore, selectedCount) {
    var filteredParam = { ...this.filteredParams };
    filteredParam = { ...this.filteredParams };

    if (selectedCount != 0 && !isLoadmore) {
      filteredParam.limit = 0;
      filteredParam.limitrows = selectedCount;
    } else {
      this.count = isLoadmore ? (this.count += 5) : 0;
      filteredParam.limit = this.count;
    }

    return new Promise((resolve, reject) => {
      this.mandateService
        .getFeedbackLeadsDetail(filteredParam)
        .subscribe((response) => {
          this.ngZone.run(() => {
            if (response['status'] === 'True') {
              this.leads_detail = isLoadmore
                ? this.leads_detail.concat(response['AssignedLeads'])
                : response['AssignedLeads'];
              this.showSpinner = false;
              resolve(true);
            } else {
              this.showSpinner = false;
              resolve(false);
            }
          });
        });
    });
  }

  checkedLeads(event) {
    this.checkedLeadsDetail = [];
    this.checkboxes.forEach((checkbox, index) => {
      if (checkbox.checked) {
        this.checkedLeadsDetail.push(this.leads_detail[index]);
      }
    });
    this.temporaryLeadIds = this.checkedLeadsDetail.map((lead) => lead.LeadID);
    this.checkedLeadsDetail.forEach((element) => {
      this.fromExecids.push(element.RMID);
    });
  }

  onSwipe(event, lead: any) {
    if (event.detail.side == 'start') {
      window.open(`https://wa.me/+91 ${lead.number}`, '_system');
      // this.navigateToWhatsApp(lead.number);
    } else {
      //   window.open(`tel:${lead.number}`, '_system');
      // if (lead && lead.number) {
      //   // Trigger the call
      //   window.open(`tel:${lead.number}`, '_system');
      // } else {
      //   console.error('Phone number not available for the selected lead.');
      // }
      this.outboundCall(lead);
    }
    this.sliding.close();
  }

  navigateToDetailsPage(leadId, execid, lead) {
    this._sharedservice.enquiries = this.leads_detail;
    this._sharedservice.page = this.page;
    this._sharedservice.hasState = true;
    let propid;
    lead.suggestedprop.forEach((prop) => {
      if (lead.propertyname == prop.name) {
        propid = prop.propid;
      }
    });
    this.router.navigate(['../mandate-customers'], {
      queryParams: {
        allVisits: null,
        leadId: leadId,
        execid: execid,
        feedback: '1',
        htype: this.filteredParams.htype,
        teamlead:
          localStorage.getItem('RoleType') == '1'
            ? localStorage.getItem('UserId')
            : null,
        propid: propid,
      },
    });
  }

  loadData(event) {
    // if (
    //   (this.filteredParams.status == 'pending' &&
    //     this.leads_detail.length < Number(this.feedbackCount.untouched)) ||
    //   (this.filteredParams.stage == 'USV' &&
    //     this.leads_detail.length < Number(this.feedbackCount.usvCount)) ||
    //   (this.filteredParams.stage == 'SV' &&
    //     this.leads_detail.length < Number(this.feedbackCount.svCount)) ||
    //   (this.filteredParams.stage == 'RSV' &&
    //     this.leads_detail.length < Number(this.feedbackCount.rsvCount)) ||
    //   (this.filteredParams.stage == 'Final Negotiation' &&
    //     this.leads_detail.length < Number(this.feedbackCount.fnCount)) ||
    //   (this.filteredParams.status == 'junkvisits' &&
    //     this.leads_detail.length < Number(this.feedbackCount.junkCount))
    // ) {
    //   this.fetchFeedbackLeadsDetail(true, 0).then(() => {
    //     event.target.complete();
    //   });
    // } else {
    //   event.target.disabled = true;
    // }

    this.fetchFeedbackLeadsDetail(true, 0).then((hasData) => {
      event.target.complete();
      if (!hasData) {
        event.target.disabled = true;
      }
    });
  }

  onReassign() {
    if (this.leads_detail.length != 0) {
      this.temporaryLeadIds = [];
      this.isCheckbox = true;
    }
  }

  navigateToFilter() {
    this.isenabled = true;
    this.tempFilteredValues = { ...this.filteredParams };
    this.isLeftFilterActive = 'source';
    this.scrollToSelectedSource();
    this.settingSelectedDate();
    this.filterModal.present();
  }

  onFilterValues(value) {
    this.isLeftFilterActive = value; // Set the active filter section
    // If the 'source' filter section is selected, scroll to the selected source
    if (this.isLeftFilterActive == 'source') {
      this.scrollToSelectedSource(); // Scroll to the selected source
    } else if (value == 'visitedRM') {
      this.scrollToSelectedVisitedRM();
    }
  }

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

  async scrollToSelectedVisitedRM(): Promise<void> {
    const visitedRM = this.tempFilteredValues.executid;
    if (!visitedRM) {
      return;
    }
    const elementId = `${visitedRM}`;
    setTimeout(() => {
      const selectedElement = document.getElementById(elementId);
      if (selectedElement) {
        this.visitedRMScrollContent.scrollToPoint(
          0,
          selectedElement.offsetTop,
          500
        );
      } else {
        console.log('Element not found2:', elementId);
      }
    }, 1000);
  }

  setFilteredSource() {
    this.sourceList1 = this.sourceList.filter((item) => {
      return item.source
        .toLowerCase()
        .includes(this.sourceSearchTerm.toLowerCase());
    });
  }

  getsourcelist() {
    this._sharedservice.sourcelist().subscribe((response) => {
      this.sourceList = response['Sources'];
      this.sourceList1 = this.sourceList;
    });
  }

  onFilterSelection(data, value) {
    switch (data) {
      case 'source':
        this.tempFilteredValues.source = value == 'all' ? '' : value;
        break;
      case 'property':
        this.tempFilteredValues.propid = value;

        if (this.tempFilteredValues.propid === '28773') {
          this.mandateService.setHoverState('ranav_group');
        } else {
          this.mandateService.setHoverState('');
        }
        this.getExecutives();
        break;
      case 'visitedRM':
        if (!Array.isArray(this.tempFilteredValues.executid)) {
          this.tempFilteredValues.executid = [];
        }

        if (value === 'all') {
          this.tempFilteredValues.executid = [];
        } else {
          const index = this.tempFilteredValues.executid.indexOf(value);
          if (index > -1) {
            // already selected → remove it
            this.tempFilteredValues.executid.splice(index, 1);
          } else {
            // not selected → add it
            this.tempFilteredValues.executid.push(value);
          }
        }
        this.tempFilteredValues.executid.join(',');
        break;
      case 'feedbackAssign':
        this.tempFilteredValues.tcid = value;
        break;
      case 'stage':
        Object.entries(this.selectedStageStatus).forEach(([key, value1]) => {
          if (key == this.tempFilteredValues.stage) {
            this.selectedStageStatus[key] = this.tempFilteredValues.stagestatus;
          } else {
            this.selectedStageStatus[key] = '';
          }
        });
        this.tempFilteredValues.stage = value;
        break;
      case 'stagestatus':
        this.tempFilteredValues.stagestatus = value.detail.value;
        break;
      case 'assignedDate':
        if (this.assignedDateRange?.length === 2) {
          const start = formatDate(
            this.assignedDateRange[0],
            'yyyy-MM-dd',
            'en-US'
          );
          const end = formatDate(
            this.assignedDateRange[1],
            'yyyy-MM-dd',
            'en-US'
          );
          this.tempFilteredValues.assignedfromdate = start;

          this.tempFilteredValues.assignedtodate =
            end != '1970-01-01' ? end : '';
          this.isenabled =
            this.tempFilteredValues.assignedtodate != '' &&
            this.tempFilteredValues.assignedtodate != '1970-01-01'
              ? true
              : false;
        }
        break;
      case 'visitedDate':
        if (this.visitedDateRange?.length === 2) {
          const start = formatDate(
            this.visitedDateRange[0],
            'yyyy-MM-dd',
            'en-US'
          );
          const end = formatDate(
            this.visitedDateRange[1],
            'yyyy-MM-dd',
            'en-US'
          );
          this.tempFilteredValues.visitedfromdate = start;

          this.tempFilteredValues.visitedtodate =
            end != '1970-01-01' ? end : '';
          this.isenabled =
            this.tempFilteredValues.visitedtodate != '' &&
            this.tempFilteredValues.visitedtodate != '1970-01-01'
              ? true
              : false;
        }

        this.tempFilteredValues.fromDate = '';
        this.tempFilteredValues.toDate = '';
        this.tempFilteredValues.fromTime = '';
        this.tempFilteredValues.toTime = '';
        break;
      case 'fromdate':
        const selectedfromDate = new Date(value).getHours();
        const currentfromDate = new Date().getHours();

        if (selectedfromDate === currentfromDate) {
          value.setHours(0, 0, 0, 0);
        }
        const fromdate1 = new Date(value);
        this.nextActionFromDate = fromdate1;
        this.tempFilteredValues.fromDate =
          fromdate1.toLocaleDateString('en-CA');
        this.tempFilteredValues.fromTime = fromdate1
          .toTimeString()
          .split(' ')[0];
        this.tempFilteredValues.toDate = '';
        this.nextActionToDate = null;
        if (this.tempFilteredValues.toDate == '') {
          this.isenabled = false;
        } else {
          this.isenabled = true;
        }
        this.minDate = fromdate1;
        break;
      case 'todate':
        const selectedtoDate = new Date(value).getHours();
        const currenttoDate = new Date().getHours();

        if (selectedtoDate === currenttoDate) {
          value.setHours(23, 59, 0, 0);
        }
        const todate = new Date(value);
        this.nextActionToDate = todate;
        this.tempFilteredValues.toDate = todate.toLocaleDateString('en-CA');
        this.tempFilteredValues.toTime = todate.toTimeString().split(' ')[0];
        this.isenabled = true;
        break;

      default:
        break;
    }

    //    const {
    //     assignedfromdate,
    //     assignedtodate,
    //     visitedfromdate,
    //     visitedtodate,
    //     fromDate,
    //     toDate,
    //   } = this.tempFilteredValues;

    //   const isValid = !(
    //     (assignedfromdate && (!assignedtodate || assignedtodate === '1970-01-01')) ||
    //     (visitedfromdate && (!visitedtodate || visitedtodate === '1970-01-01')) ||
    //     (fromDate && (!toDate || toDate === '1970-01-01'))
    //   );
    // this.isenabled = isValid;

    const {
      assignedfromdate,
      assignedtodate,
      visitedfromdate,
      visitedtodate,
      fromDate,
      toDate,
    } = this.tempFilteredValues;

    const isAssignedValid = !(
      assignedfromdate &&
      (!assignedtodate || assignedtodate === '1970-01-01')
    );
    const isVisitedValid = !(
      visitedfromdate &&
      (!visitedtodate || visitedtodate === '1970-01-01')
    );
    const isGeneralValid = !(fromDate && (!toDate || toDate === '1970-01-01'));

    this.isenabled = isAssignedValid && isVisitedValid && isGeneralValid;
  }

  reset_filter() {
    this.tempFilteredValues = {
      fromDate: '',
      toDate: '',
      status: this.filteredParams.status,
      stage: this.filteredParams.stage,
      stagestatus: '',
      rmid: '',
      tcid:
        localStorage.getItem('Role') === '1'
          ? ''
          : localStorage.getItem('UserId'),
      source: '',
      htype: this.filteredParams.htype,
      propid: '',
      receivedfromdate: '',
      receivedtodate: '',
      visitedfromdate: '',
      visitedtodate: '',
      activityfromdate: '',
      activitytodate: '',
      suggestedprop: '',
      visitedprop: '',
      counter: '',
      assignedfromdate: '',
      assignedtodate: '',
      FromTime: '',
      ToTime: '',
      visitedPropertyName: '',
      team: '',
      fromTime: '',
      toTime: '',
      executid:
        localStorage.getItem('Role') === '1'
          ? ''
          : localStorage.getItem('UserId'),
      loginid: '1',
      active: '1',
      limit: 0,
      limitrows: 5,
    };
    this.assignedDateRange = null;
    this.visitedDateRange = null;
    this.nextActionFromDate = null;
    this.nextActionToDate = null;
    this.isLeftFilterActive = 'source';
  }

  confirmSelection() {
    this.filteredParams = { ...this.tempFilteredValues };
    this.filterModal.dismiss();
    this.addQueryParams();
  }

  setFilteredProperty() {
    this.propertyList1 = this.propertyList.filter((item) => {
      return item.property_info_name
        .toLowerCase()
        .includes(this.propertySearchedName.toLowerCase());
    });
  }

  getProperty() {
    this.mandateService.getmandateprojects().subscribe((response) => {
      this.propertyList = response['Properties'];
      this.propertyList1 = this.propertyList;
    });
  }

  getExecutives() {
    const propid = this.filteredParams.propid
      ? this.filteredParams.propid
      : this.tempFilteredValues?.propid
      ? this.tempFilteredValues?.propid
      : '';
    this.mandateService
      .fetchmandateexecutives1(propid, '', this.filteredParams.active)
      .subscribe((executives) => {
        if (executives['status'] == 'True') {
          this.mandateExecutives = [
            ...(executives['mandateexecutives'] || []).filter(
              (x) => x.name !== 'Test RM' && x.name !== 'Test CS'
            ),
          ];

          this.mandateExecutives = this.mandateExecutives.filter((rm) => {
            return rm.roleid == '50002';
          });
          this.mandateExecutives1 = this.mandateExecutives;
          this.mandateCSExecutives = this.mandateExecutives.filter((cs) => {
            return cs.roleid == '50014';
          });
          this.mandateCSExecutives1 = this.mandateCSExecutives;
          this.showSpinner1 = false;
        } else {
          this.showSpinner1 = false;
        }
      });
  }

  setFilteredExecutive() {
    this.mandateExecutives1 = this.mandateExecutives.filter((item) => {
      return item.name
        .toLowerCase()
        .includes(this.executiveSearchedName.toLowerCase());
    });
  }

  // getRetailExec() {
  //   this.retailService
  //     .getRetailExecutives('50004', this.filteredParams.active)
  //     .subscribe((response) => {
  //       this.feedbackAssignees = response['DashboardCounts'];
  //       this.feedbackAssignees1 = this.feedbackAssignees;
  //     });
  // }

  setFilteredfeedbackAssign() {
    this.mandateCSExecutives = this.mandateCSExecutives1.filter((item) => {
      return item.name
        .toLowerCase()
        .includes(this.feedbackAssignSearchTerm.toLowerCase());
    });
  }

  initializeStartEndDate() {
    // Only for next action date
    this.setDefaultFromTime = new Date();
    this.setDefaultFromTime.setUTCHours(0, 0, 0, 136);
    this.setDefaultFromTime = this.setDefaultFromTime.toISOString();

    this.setDefaultToTime = new Date();
    this.setDefaultToTime.setUTCHours(11, 59, 0, 136);
    this.setDefaultToTime = this.setDefaultToTime.toISOString();
    this.endDateMinDateNextaction = this.setDefaultFromTime;

    // Initialize start and end dates with default values
    this.startdate = new Date().toISOString();
    this.enddate = new Date().toISOString();

    // Set the minimum and maximum dates
    // this.minDate = '2000-01-01';
    this.maxDate = new Date();

    // Set initial min date for end date picker
    this.endDateMinDate = this.startdate;
  }

  get fromDateTime(): string {
    return `${this.tempFilteredValues.fromDate || ''}, ${
      this.tempFilteredValues.fromTime || ''
    }`;
  }

  get toDateTime(): string {
    return `${this.tempFilteredValues.toDate || ''}, ${
      this.tempFilteredValues.toTime || ''
    }`;
  }

  selectedLeadCount;
  onSelectLeadCount(count) {
    this.selectedLeadCount = null;
    this.checkedLeadsDetail = [];
    this.temporaryLeadIds = [];
    this.fromExecids = [];
    if (count != 'manual' && parseInt(count) > this.leads_detail.length) {
      this.showSpinner = true;
      this.isManual = false;
      this.fetchFeedbackLeadsDetail(false, parseInt(count)).then(() => {
        this.checkedLeadsDetail = this.leads_detail.slice(0, parseInt(count));
        this.temporaryLeadIds = this.checkedLeadsDetail.map(
          (lead) => lead.LeadID
        );
        this.checkedLeadsDetail.forEach((element) => {
          this.fromExecids.push(element.RMID);
        });
      });
    } else {
      if (count == 'manual') {
        this.isManual = true;
        this.selectedCount = null;
        this.selectedLeadCount = null;
        this.checkedLeadsDetail = [];
        this.temporaryLeadIds = [];
        this.fromExecids = [];
      } else {
        this.selectedCount = null;
        setTimeout(() => {
          this.selectedCount = count;
        });
        this.selectedLeadCount = null;
        this.isManual = false;
        if (this.temporaryLeadIds.length == parseInt(count)) {
          this.checkedLeadsDetail = [];
          this.temporaryLeadIds = [];
        } else {
          this.checkedLeadsDetail = this.leads_detail.slice(0, parseInt(count));
          this.temporaryLeadIds = this.checkedLeadsDetail.map(
            (lead) => lead.LeadID
          );
          this.checkedLeadsDetail.forEach((element) => {
            this.fromExecids.push(element.RMID);
          });
        }
      }
    }
  }

  reassignedResponseInfo;
  selectedExecutiveName;
  openAssignLeadsModal() {
    if (this.temporaryLeadIds.length) {
      this.assignLeadsModal.present();
    } else {
      Swal.fire({
        title: 'Please select a lead to proceed',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'OK',
      });
    }
  }

  assignLead() {
    if (!this.selectedProperty) {
      Swal.fire({
        title: 'Please select an property before proceeding.',
        icon: 'warning',
        heightAuto: false,
        confirmButtonText: 'OK',
      });
    } else if (
      this.selectedExecutiveName?.length === 0 ||
      this.selectedExecutiveName === undefined
    ) {
      Swal.fire({
        title: 'Please select an executive before proceeding.',
        icon: 'warning',
        heightAuto: false,
        confirmButtonText: 'OK',
      });
    } else {
      const selectedExecutiveIds = [];
      this.selectedExecutiveName.forEach((executive) => {
        selectedExecutiveIds.push(executive.id);
      });

      const param = {
        rmID: selectedExecutiveIds,
        LeadID: this.temporaryLeadIds,
        propID: this.selectedProperty.property_idfk,
        random: this.randomId,
        fromExecids: this.fromExecids,
        loginId: localStorage.getItem('UserId'),
      };
      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'Lead assignment is not allowed for demo account.',
          icon: 'error',
          allowOutsideClick: false,
          heightAuto: false,
          confirmButtonText: 'OK',
        }).then((result) => {
          this.showSpinner = false;
        });
      } else {
        this.mandateService.leadassignfeedback(param).subscribe((response) => {
          if (response['status'] == 'True') {
            this.reassignedResponseInfo = response['assignedleads'];
            Swal.fire({
              title: 'Assigned Successfully',
              icon: 'success',
              heightAuto: false,
              confirmButtonText: 'Show Details',
            }).then((result) => {
              this.showSpinner = true;
              if (result.isConfirmed) {
                this.assignLeadsModal.dismiss();
                this.viewAssignLeadDetail.present();
              } else if (result.dismiss === Swal.DismissReason.backdrop) {
                this.assignLeadsModal.dismiss();
                this.viewAssignLeadDetail.present();
              }
            });
          }
        });
      }
    }
  }

  selectedProperty;
  executives;
  onPropertySelect(event) {
    this.showSpinner = true;
    this.selectedExecutiveName = [];
    if (event.value.property_idfk === '28773') {
      this.mandateService.setHoverState('ranav_group');
    } else {
      this.mandateService.setHoverState('');
    }
    this.mandateService
      .fetchmandateexecutives(event.value.property_idfk, '', '50014')
      .subscribe((response) => {
        this.executives = response['mandateexecutives'];
        this.showSpinner = false;
      });
  }

  randomId = '';
  toggle_random_assign(event) {
    event.detail.checked ? (this.randomId = '1') : (this.randomId = '');
  }

  onWillDismiss(event) {
    location.reload();
  }
  onViewAssignLeadDetailClose() {
    this.viewAssignLeadDetail.dismiss();
    window.location.reload();
  }

  propertyPriceList;
  getPriceList() {
    this.mandateService.getPriceList().subscribe((resp) => {
      if (resp['status'] == 'True') {
        this.propertyPriceList = resp['result'];
        this.propertyPriceList.forEach((element) => {
          if (element.PropId === '16793') {
            this.grSitaraPropertyInfo = element.PropInfo;
          } else if (element.PropId === '1830') {
            this.grSamskruthiProperyInfo = element.PropInfo;
          }
        });
      } else {
        this.propertyPriceList = [];
      }
    });
  }

  grSitaraPropertyInfo;
  grSamskruthiProperyInfo;
  @ViewChild('propInfo') propInfo!: ElementRef;
  sendWhatsApp(lead, type) {
    let url;
    const phoneNumber = lead.number;
    // const phoneNumber = '917090080306';
    if (lead.suggestedprop[0].propid === '16793') {
      if (type == 'location') {
        url = 'https://maps.app.goo.gl/FzU4bXzB8SgXRgPT8';
      } else if (type == 'brochure') {
        url =
          'https://lead247.in/images/brochure/GR%20Sitara%20Actual%20photos%20.pdf';
      } else if ((type = 'info')) {
        const textContent = this.propInfo.nativeElement.innerText; // Get plain text (no HTML tags)
        url = textContent
          .split('\n') // Split by new lines
          .map((line) => line.trim()) // Trim spaces from each line
          .filter(
            (line, index, arr) =>
              line !== '' || (arr[index - 1] && arr[index - 1] !== '')
          ) // Remove consecutive empty lines
          .join('\n'); // Join back with a single newline
      }
    } else if (lead.suggestedprop[0].propid === '1830') {
      if (type == 'location') {
        url = 'https://maps.app.goo.gl/3dvi23Sd6PPqvM91A';
      } else if (type == 'brochure') {
        url =
          'https://lead247.in/images/brochure/GR%20Samskruthi%20Brochure%20New..pdf';
      } else if ((type = 'info')) {
        const textContent = this.propInfo.nativeElement.innerText; // Get plain text (no HTML tags)
        url = textContent
          .split('\n') // Split by new lines
          .map((line) => line.trim()) // Trim spaces from each line
          .filter(
            (line, index, arr) =>
              line !== '' || (arr[index - 1] && arr[index - 1] !== '')
          ) // Remove consecutive empty lines
          .join('\n'); // Join back with a single newline
      }
    }

    const message = encodeURIComponent(`${url}`);
    const whatsappUrl = `https://wa.me/+91${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }

  assignedDateRange = null;
  visitedDateRange = null;
  nextActionFromDate = null;
  nextActionToDate = null;
  daterange(data) {
    const from = this.tempFilteredValues.fromDate;
    const to =
      data == 'receivedDate' &&
      this.tempFilteredValues.receivedToDate != '1970-01-01'
        ? this.tempFilteredValues.toDate
        : '';

    if (
      data == 'visitedDate' &&
      this.tempFilteredValues.visitedfromdate != ''
    ) {
      return `${this.tempFilteredValues.visitedfromdate} to ${this.tempFilteredValues.visitedtodate}`;
    } else if (
      data == 'assignedDate' &&
      this.tempFilteredValues.assignedfromdate != ''
    ) {
      return `${this.tempFilteredValues.assignedfromdate} to ${this.tempFilteredValues.assignedtodate}`;
    } else if (data == 'from' && this.tempFilteredValues.fromDate != '') {
      return `${this.tempFilteredValues.fromDate} , ${this.tempFilteredValues.fromTime}`;
    } else if (data == 'to' && this.tempFilteredValues.toDate != '') {
      return `${this.tempFilteredValues.toDate} , ${this.tempFilteredValues.toTime}`;
    } else {
      return data == 'from'
        ? 'Select from date'
        : data == 'to'
        ? 'Select to date'
        : `${'Select Date Range'}`;
    }
  }

  warningMessage() {
    if (this.filteredParams.fromDate == '') {
      Swal.fire({
        title: 'Please select a From Date',
        text: 'From Date is required to apply the filter',
        confirmButtonText: 'OK',
        heightAuto: false,
        allowOutsideClick: false,
      }).then((result) => {});
    }
  }

  closeFilterModal() {
    this.assignedDateRange = null;
    this.visitedDateRange = null;
    this.nextActionFromDate = null;
    this.nextActionToDate = null;

    this.tempFilteredValues = {};
    this.filterModal.dismiss();
  }

  settingSelectedDate() {
    if (this.tempFilteredValues.assignedfromdate != '') {
      const fromDate = new Date(this.tempFilteredValues.assignedfromdate);
      const toDate = new Date(this.tempFilteredValues.assignedtodate);
      this.assignedDateRange = [fromDate, toDate];
    } else if (this.tempFilteredValues.assignedfromdate == '') {
      this.assignedDateRange = null;
    }

    if (this.tempFilteredValues.visitedfromdate != '') {
      const fromDate = new Date(this.tempFilteredValues.visitedfromdate);
      const toDate = new Date(this.tempFilteredValues.visitedtodate);
      this.visitedDateRange = [fromDate, toDate];
    } else if (this.tempFilteredValues.visitedfromdate == '') {
      this.visitedDateRange = null;
    }
  }

  lead;
  @ViewChild('sliding') sliding;
  @ViewChild('callConfirmationModal') callConfirmationModal;
  outboundCall(lead) {
    this.sliding.close();
    if (lead == true) {
      this.isOnCallDetailsPage = true;
      this.callConfirmationModal.dismiss();

      const cleanedNumber =
        this.lead?.number.startsWith('91') && this.lead?.number.length > 10
          ? this.lead?.number.slice(2)
          : this.lead?.number;

      const param = {
        execid: this.localStorage.getItem('UserId'),
        callto: cleanedNumber,
        leadid: this.lead.LeadID,
        starttime: this.getCurrentDateTime(),
        modeofcall: 'mobile-' + this.filteredParams.htype,
        leadtype: this.filteredParams.htype,
        assignee: this.lead.ExecId,
      };

      this._sharedservice.outboundCall(param).subscribe(() => {
        this.callConfirmationModal.dismiss();
      });

      this.router.navigate([], {
        queryParams: {
          isOnCallDetailsPage: this.isOnCallDetailsPage,
          leadId: this.lead.LeadID,
          feedbackId: '1',
          execid: this.lead.RMID,
          leadTabData: 'status',
          callStatus: 'Call Connected',
          headerType: this.filteredParams.htype,
        },
        queryParamsHandling: 'merge',
      });
    } else {
      this.lead = lead;
      this.callConfirmationModal.present();
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

  leadDetailsModalClose(event) {
    this.showSpinner = true;
    this.router.navigate([], {
      queryParams: {
        isOnCallDetailsPage: null,
        leadId: null,
        execid: null,
        feedback: null,
      },
      queryParamsHandling: 'merge',
    });
  }
  onplayButton(lead) {
    this.router.navigate(['./all-and-live-call-details'], {
      queryParams: {
        execid: lead.ExecId,
        isAllCallLogs: false,
        callRecord: true,
        clientnum: lead.number,
        lastUpdate: lead.lastupdated,
        leadName: lead.CustomerName,
      },
    });
  }

  navigateToWhatsApp(number) {
    this.router.navigate(['./clients-chats'], {
      queryParams: {
        chatListSearch: number,
        selectedChat: 'all',
        htype: this.filteredParams.htype,
      },
    });
  }

  removeExecutive(execId: string | number) {
    if (Array.isArray(this.filteredParams.executid)) {
      // Remove that particular executive id
      this.filteredParams.executid = this.filteredParams.executid.filter(
        (id) => id != execId
      );
    } else if (this.filteredParams.executid == execId) {
      // If only one id was selected
      this.filteredParams.executid = [];
    }

    // Update query params
    this.addQueryParams();
  }

  canScroll;
  @ViewChild('mainscrollContainer', { static: false }) content: IonContent;
  onScroll(event: CustomEvent) {
    this._sharedservice.scrollTop = event.detail.scrollTop;
    const scrollTop = event.detail.scrollTop;
    this.content.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;

      this.canScroll = scrollHeight > clientHeight + 10; // ADD A BUFFER of 10px

      if (!this.canScroll) {
        this._sharedservice.isBottom = false;
      } else {
        this._sharedservice.isBottom =
          scrollTop + clientHeight >= scrollHeight - 100;
      }
    });
  }
}

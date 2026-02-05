import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonModal } from '@ionic/angular';
import { MandateService } from '../mandate-service.service';
import { forkJoin } from 'rxjs';
import { SharedService } from '../shared.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-overdues-dashboard',
  templateUrl: './overdues-dashboard.component.html',
  styleUrls: ['./overdues-dashboard.component.scss'],
})
export class OverduesDashboardComponent implements OnInit {
  @ViewChild('dashboard_custDate_modal') dashboard_custDate_modal: IonModal;
  @ViewChild('dashboard_fromDate_modal') dashboard_fromDate_modal: IonModal;
  @ViewChild('dashboard_toDate_modal') dashboard_toDate_modal: IonModal;
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  isProgrammaticScroll = false;
  propertyLists;
  showFromDateError = false;
  count = 0;
  filteredParams = {
    roleId: '',
    team: '',
    teamlead: '',
    isDateFilter: '',
    fromDate: '',
    toDate: '',
    executid: '',
    leads: '',
    source: '',
    status: '',
    stage: '',
    propid: '',
    stagestatus: '',
    activeCardKey: '',
    loginid: localStorage.getItem('UserId'),
    limit: 0,
    limitrows: 5,
  };
  dateRange = {
    fromdate: null as Date | null,
    todate: null as Date | null,
  };
  overduesCount = {
    followups: '',
    USVFix: '',
    NC: '',
    USVDone: '',
    RSVFix: '',
    RSVDone: '',
    FNFix: '',
    FNDone: '',
    dealPending: '',
    dealRequested: '',
  };
  LeadDetails = [];
  showInfiniteScroll = true;
  showSpinner: boolean;
  roleid = '';
  userName = '';
  isRM = false;
  selectedExecu: any;
  executiveNames: any;
  sourceList;
  selectedSource;
  fromDateParam;
  toDateParam;
  roletype;
  userid: string;
  page = 1;

  constructor(
    private activeRoute: ActivatedRoute,
    public router: Router,
    private mandateService: MandateService,
    private _sharedservice: SharedService
  ) {}

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params) => {
      if (params['isOnCallDetailsPage'] == 'true') {
        this.isOnCallDetailsPage = true;
      } else {
        this.isOnCallDetailsPage = false;
      }
      this.showSpinner = true;
      this.fromDateParam = params['fromDate'];
      this.toDateParam = params['fromDate'];
      this.roleid = localStorage.getItem('Role');
      this.roletype = localStorage.getItem('RoleType');
      this.userName = localStorage.getItem('Name');
      this.isRM =
        localStorage.getItem('Role') == '50001' ||
        localStorage.getItem('Role') == '50002' ||
        localStorage.getItem('Role') == '50009' ||
        localStorage.getItem('Role') == '50010';
      this.userid = localStorage.getItem('UserId');
      this.getqueryParam();
      this.getSource();
      this.fetchPropertyLists();
      this.fetchmandateexecutives();
      // this.getLeadsCount();

      if (this._sharedservice.hasState) {
        this.showSpinner = false;
        this.LeadDetails = this._sharedservice.enquiries;
        this.page = this._sharedservice.page;
        setTimeout(() => {
          this.content.scrollToPoint(0, this._sharedservice.scrollTop, 0);
        }, 0);

        setTimeout(() => {
          this._sharedservice.hasState = false;
        }, 5000);
      } else {
        this.content?.scrollToTop(300);
        this.getLeadsCount();
      }
    });
  }

  getLeadsCount() {
    const requests = [];
    const stage = [
      'Fresh',
      'NC',
      'USVFix',
      'USVDone',
      'RSVFix',
      'RSVDone',
      'FinalNegotiationFix',
      'FinalNegotiationDone',
      'Deal Closing Pending',
      'Deal Closing Requested',
    ];
    stage.forEach((stage) => {
      const params = {
        ...this.filteredParams,
        stage:
          stage == 'USVFix' || stage == 'USVDone'
            ? 'USV'
            : stage == 'RSVFix' || stage == 'RSVDone'
            ? 'RSV'
            : stage == 'FinalNegotiationDone' || stage == 'FinalNegotiationFix'
            ? 'Final Negotiation'
            : stage,
        stagestatus:
          stage == 'USVFix' ||
          stage == 'RSVFix' ||
          stage == 'FinalNegotiationFix'
            ? '1'
            : stage == 'USVDone' ||
              stage == 'RSVDone' ||
              stage == 'FinalNegotiationDone'
            ? '3'
            : '',
        status: 'overdues',
      };
      requests.push(this.mandateService.getAssignedLeadsCounts(params));
    });

    forkJoin(requests).subscribe((results) => {
      // Process results
      results.forEach((assgnleads, index) => {
        switch (index) {
          case 0:
            this.overduesCount.followups =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 1:
            this.overduesCount.NC =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 2:
            this.overduesCount.USVFix =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;

          case 3:
            this.overduesCount.USVDone =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 4:
            this.overduesCount.RSVFix =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 5:
            this.overduesCount.RSVDone =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 6:
            this.overduesCount.FNFix =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 7:
            this.overduesCount.FNDone =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 8:
            this.overduesCount.dealPending =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          case 9:
            this.overduesCount.dealRequested =
              assgnleads['AssignedLeads'][0]['Uniquee_counts'];
            break;
          default:
            break;
        }
      });
      this.getleadDetails(false);
    });
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
  reset() {
    this.filteredParams = {
      roleId: '',
      team: '',
      fromDate: new Date().toLocaleDateString('en-CA'),
      toDate: new Date().toLocaleDateString('en-CA'),
      isDateFilter: 'today',
      executid: '',
      teamlead: '',
      status: 'overdues',
      leads: '1',
      source: '',
      stagestatus: '',
      propid: '',
      loginid: localStorage.getItem('UserId'),
      stage: 'Fresh',
      activeCardKey: 'leads_card',
      limit: 0,
      limitrows: 5,
    };
    this.dateRange = {
      fromdate: null as Date | null,
      todate: null as Date | null,
    };
    this.addQueryParams();
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
    this.filteredParams.teamlead = this.roletype == '1' ? this.userid : '';
  }

  onStage(activeCardKey, stage, stagestatus?) {
    this.filteredParams.activeCardKey = activeCardKey;
    this.filteredParams.stage = stage;
    this.filteredParams.stagestatus = stagestatus ? stagestatus : '';
    this.isProgrammaticScroll = true;
    setTimeout(() => {
      this.scrollToLeads();
    }, 1000);
    this.resetInfiniteScroll();
    this.addQueryParams();
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
  loadMoreData(event) {
    if (this.isProgrammaticScroll) {
      event.target.complete();
      return;
    }

    this.getleadDetails(true).then((hasData) => {
      event.target.complete();
      if (!hasData) {
        event.target.disabled = true;
      }
    });
  }

  getleadDetails(isLoadMore: boolean) {
    this.count = isLoadMore ? (this.count += 5) : 0;
    this.filteredParams.limit = this.count;

    return new Promise((resolve, reject) => {
      this.mandateService.assignedLeads(this.filteredParams).subscribe({
        next: (response: any) => {
          if (response['status'] == 'True') {
            this.LeadDetails = isLoadMore
              ? this.LeadDetails.concat(response['AssignedLeads'])
              : response['AssignedLeads'];
            resolve(true);
          } else {
            isLoadMore ? '' : (this.LeadDetails = []);
            resolve(false);
          }
          this.showSpinner = false;
        },
        error: (err) => {
          this.LeadDetails = [];
          this.showSpinner = false;
          resolve(false);
        },
      });
    });
  }

  canScroll;
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
  lead;
  isOnCallDetailsPage = false;
  @ViewChild('sliding') sliding;
  @ViewChild('callConfirmationModal') callConfirmationModal;
  outboundCall(lead) {
    // this.sliding.close();
    if (lead == true) {
      this.isOnCallDetailsPage = true;
      this.callConfirmationModal.dismiss();
      const cleanedNumber =
        this.lead?.number.startsWith('91') && this.lead?.number.length > 10
          ? this.lead?.number.slice(2)
          : this.lead?.number;

      const param = {
        execid: localStorage.getItem('UserId'),
        callto: cleanedNumber,
        leadid: this.lead.LeadID,
        starttime: this.getCurrentDateTime(),
        modeofcall: 'mobile-mandate',
        leadtype: 'mandate',
        assignee: this.lead.ExecId,
      };

      this._sharedservice.outboundCall(param).subscribe(() => {
        this.callConfirmationModal.dismiss();
      });

      this.router.navigate([], {
        queryParams: {
          isOnCallDetailsPage: this.isOnCallDetailsPage,
          leadId: this.lead.LeadID,
          execid: this.lead.ExecId,
          leadTabData: 'status',
          callStatus: 'Call Connected',
          direction: 'outboundCall',
          headerType: 'mandate',
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

  onSwipe(event, lead: any) {
    if (event.detail.side == 'start') {
      window.open(`https://wa.me/+91 ${lead.number}`, '_system');
      this.sliding.close();
    } else {
      this.outboundCall(lead);
    }
  }

  navigateToMandateCustomerPage(leadId, execid, lead) {
    this._sharedservice.enquiries = this.LeadDetails;
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
      queryParamsHandling: 'merge',
    });
  }

  //To get the property lists
  fetchPropertyLists() {
    return new Promise((resolve, reject) => {
      this.mandateService
        .getmandateprojects1(localStorage.getItem('UserId'))
        .subscribe(
          (response) => {
            if (response['status'] === 'True') {
              this.propertyLists = response['Properties'];
              resolve(true);
            } else {
              reject('Failed to fetch project names');
            }
          },
          (error) => {
            console.error('Error fetching project names:', error);
            reject(error);
          }
        );
    });
  }

  onFilterSelection(data, value) {
    switch (data) {
      case 'property':
        this.filteredParams.propid = value.property_idfk;
        break;
      case 'exec':
        this.filteredParams.executid = value.id;
        break;
      case 'source':
        this.filteredParams.source = value.source;
        break;
      default:
        break;
    }
    this.addQueryParams();
  }

  // method to get the executive names
  fetchmandateexecutives() {
    return new Promise((resolve, reject) => {
      this.mandateService
        .fetchmandateexecutives1(
          localStorage.getItem('PropertyId'),
          this.roletype == '1' ? '2' : '',
          '',
          this.filteredParams.roleId,
          this.roletype == '1' ? localStorage.getItem('UserId') : ''
        )
        .subscribe((response) => {
          this.executiveNames = response['mandateexecutives'];
          this.executiveNames = [
            { name: 'All', executid: '' },
            ...(response['mandateexecutives'] || []).filter(
              (x) => x.name !== 'Test RM' && x.name !== 'Test CS'
            ),
          ];

          if (
            localStorage.getItem('RoleType') == '1' &&
            this.filteredParams.executid == ''
          ) {
            this.selectedExecu = this.executiveNames?.filter((exec, i) => {
              if (exec.id == localStorage.getItem('UserId')) {
                return exec;
              }
            });
          } else {
            this.selectedExecu = this.executiveNames?.filter((exec, i) => {
              if (exec.id == this.filteredParams.executid) {
                return exec;
              }
            });
          }
          this.selectedExecu = this.selectedExecu?.[0];
          resolve(true);
        });
    });
  }

  getSource() {
    this._sharedservice.sourcelist().subscribe((resp) => {
      this.sourceList = resp['Sources'];

      this.selectedSource = resp['Sources']?.filter((source, i) => {
        if (source.source == this.filteredParams.source) {
          return source;
        }
      });
      this.selectedSource = this.selectedSource?.[0];
    });
  }

  onmodaldismiss() {
    this.dashboard_fromDate_modal?.dismiss();
    this.dashboard_toDate_modal?.dismiss();
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

  // To open from date modal
  async openFromDate() {
    await this.dashboard_toDate_modal?.dismiss();
    await this.dashboard_fromDate_modal.present();
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

  formattedFromDate(date): string {
    if (!this.dateRange?.fromdate) return '';
    return new Date(date).toLocaleDateString('en-CA');
  }

  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }

  propertyPriceList;
  grSitaraPropertyInfo;
  grSamskruthiProperyInfo;
  @ViewChild('propInfo') propInfo: ElementRef;
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
      } else if (type == 'info') {
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
      } else if (type == 'info') {
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

  @ViewChild('addPriorityModal') addPriorityModal;
  priorityUpdateLead;
  priority_id = '';
  onSetPriority(lead, isEdit) {
    this.priorityUpdateLead = lead;
    if (!isEdit) {
      this.priority_id = '';
    }
    this.addPriorityModal.present();
  }

  onUpdatePriority() {
    this.mandateService
      .updatehotwarmcold(this.priority_id, this.priorityUpdateLead.LeadID)
      .subscribe((resp) => {
        Swal.fire({
          title: 'Updated Successfully',
          text: 'Priority type Successfully updated',
          icon: 'success',
          heightAuto: false,
          confirmButtonText: 'OK',
        }).then(() => {
          this.addPriorityModal.dismiss();
          location.reload();
        });
      });
  }
  async ngOnDestroy() {
    this._sharedservice.dismissAllOverlays();
  }
}

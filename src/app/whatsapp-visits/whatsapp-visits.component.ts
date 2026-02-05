import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { IonContent, MenuController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../shared.service';
import { catchError, forkJoin, of } from 'rxjs';
import { MandateService } from '../mandate-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-whatsapp-visits',
  templateUrl: './whatsapp-visits.component.html',
  styleUrls: ['./whatsapp-visits.component.scss'],
})
export class WhatsappVisitsComponent implements OnInit {
  @ViewChild('filterModal') filterModal;
  @ViewChild('visitAssign') visitAssign;
  selectedProperty;
  leads;
  showInfiniteScroll = true;
  showSpinner = false;
  leads_detail = [];
  localStorage = localStorage;
  freshvisits_count = '';
  pendingleads_count = '';
  propertyList;
  propertyList1;
  filteredParams = {
    leads: '',
    count: '1',
    fromdate: '',
    todate: '',
    propname: '',
    htype: '',
    limit: 0,
    limitrows: 5,
  };
  isOnCallDetailsPage: boolean = false;
  leadId: any;
  execid: any;

  constructor(
    private _location: Location,
    private menuCtrl: MenuController,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private shareService: SharedService,
    private mandateService: MandateService
  ) {
    this.initializeStartEndDate();
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((response) => {
      this.leadId = response['leadId'];
      this.execid = response['execid'];
      this.getQueryParams();
      this.getPropertyList();
      this.getAssigningPropertyList();
      this.getLeadsCount();

      if (response['isOnCallDetailsPage'] == 'true') {
        this.isOnCallDetailsPage = true;
      } else {
        this.isOnCallDetailsPage = false;
      }
    });
  }

  getPropertyList() {
    this.shareService
      .propertylistForEnquiry(this.filteredParams.leads, '')
      .subscribe((response) => {
        this.propertyList = response['Leads'];
        this.propertyList1 = response['Leads'];
      });
  }

  onBackButton() {
    this._location.back();
  }

  openEndMenu() {
    this.shareService.isMenuOpen = true;
    this.menuCtrl.open('end');
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
      } else if (
        key !== 'loginid' &&
        key !== 'limit' &&
        key !== 'limitrows' &&
        key !== 'count'
      ) {
        this.filteredParams[key] = '';
      }
    });
  }

  // To add querryParam
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

  getLeadsCount() {
    this.showSpinner = true;
    const requests = [];
    const count = ['1', ''];
    count.forEach((count) => {
      const params = {
        ...this.filteredParams,
        count: count == '1' ? '1' : '',
        leads: count == '' ? this.filteredParams.leads : '',
        limit: count == '1' ? '' : 0,
        limitrows: count == '1' ? '' : 5,
      };
      requests.push(
        this.shareService.getWhatsappVisitsLead(params).pipe(
          catchError((error) => {
            return of(null);
          })
        )
      );
    });

    forkJoin(requests).subscribe((results) => {
      results.forEach((response, index) => {
        switch (index) {
          case 0:
            this.freshvisits_count = response['Leads'][0].freshvisits_count;
            this.pendingleads_count = response['Leads'][0].pendingleads_count;
            break;
          case 1:
            this.leads_detail = response['Leads'] ? response['Leads'] : [];
            break;
        }
      });
      this.showSpinner = false;
    });
  }

  onpendingFreshleads(leads) {
    this.filteredParams.leads = leads;
    this.addQueryParams();
  }

  count = 0;
  loadData(event) {
    //  const isLoadmore = true;
    this.count = this.count += 5;
  }

  tempFilteredValues;
  reset_filter() {
    this.isLeftFilterActive = 'property';
    this.isenabled = true;
    this.tempFilteredValues = {
      leads: '',
      count: '1',
      fromdate: '',
      todate: '',
      propname: '',
      limit: 0,
      limitrows: 5,
    };
    this.initializeStartEndDate();
  }

  navigateToFilter() {
    this.isLeftFilterActive = 'property';
    this.tempFilteredValues = { ...this.filteredParams };
    this.filterModal.present();
  }

  confirmSelection() {
    this.filteredParams = { ...this.tempFilteredValues };
    this.filterModal.dismiss();
    this.addQueryParams();
  }

  isLeftFilterActive = '';
  propertySearchTerm = '';
  onFilterValues(value) {
    this.isLeftFilterActive = value;
  }

  setFilteredProperty() {
    this.propertyList1 = this.propertyList.filter((item) => {
      return item?.propertyname
        ?.toLowerCase()
        .includes(this.propertySearchTerm?.toLowerCase());
    });
  }

  isenabled = true;
  onFilterSelection(data, value) {
    switch (data) {
      case 'fromdate':
        const selectedDate = new Date(value.detail.value);
        this.tempFilteredValues.fromdate =
          selectedDate.toLocaleDateString('en-CA');
        this.endDateMinDate = this.tempFilteredValues.fromdate;
        if (this.tempFilteredValues.todate.length === 0) {
          this.isenabled = false;
        }
        break;
      case 'todate':
        const selectedDate1 = new Date(value.detail.value);
        const adjustedDate = new Date(
          selectedDate1.getTime() - selectedDate1.getTimezoneOffset() * 60000
        );
        this.enddate = value.detail.value;
        this.tempFilteredValues.todate =
          adjustedDate.toLocaleDateString('en-CA');
        this.endDateMinDate = this.tempFilteredValues.fromdate;
        if (this.tempFilteredValues.todate.length !== 0) {
          this.isenabled = true;
        }
        break;
      case 'property':
        this.tempFilteredValues.propname = value == 'all' ? '' : value;
        break;
      default:
        break;
    }
  }

  startdate;
  enddate;
  minDate;
  maxDate;
  endDateMinDate;
  initializeStartEndDate() {
    this.startdate = new Date().toISOString();
    this.enddate = new Date().toISOString();

    this.minDate = '2000-01-01';
    this.maxDate = new Date().toISOString();

    this.endDateMinDate = this.startdate;
  }

  leadDetailsModalClose(event) {
    this.showSpinner = true;
    this.router.navigate([], {
      queryParams: {
        isOnCallDetailsPage: null,
        leadId: null,
        execid: null,
      },
      queryParamsHandling: 'merge',
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
  canScroll;
  @ViewChild('mainscrollContainer', { static: false }) content: IonContent;
  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.content.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;

      this.canScroll = scrollHeight > clientHeight + 10; // ADD A BUFFER of 10px

      if (!this.canScroll) {
        this.shareService.isBottom = false;
      } else {
        this.shareService.isBottom =
          scrollTop + clientHeight >= scrollHeight - 100;
      }
    });
  }
  selectedExecutiveName;
  selectedExecTeam;
  executives;
  onPropertySelect(event) {
    this.showSpinner = true;
    this.selectedExecutiveName = [];
    let selectedExecTeam;
    if (this.selectedExecTeam != undefined || this.selectedExecTeam != '') {
      selectedExecTeam = this.selectedExecTeam;
    }
    this.mandateService
      .fetchmandateexecutives(
        event.value.property_idfk,
        '',
        selectedExecTeam?.code
      )
      .subscribe((response) => {
        this.executives = response['mandateexecutives'];
        this.showSpinner = false;
      });
  }

  execTeam = [
    { name: 'Relationship Executives', code: '50002' },
    { name: 'Customersupport Executives', code: '50014' },
  ];

  onExecTeamSelect(event) {
    this.showSpinner = true;
    this.selectedExecutiveName = [];

    this.mandateService
      .fetchmandateexecutives(
        this.selectedProperty?.property_idfk,
        '',
        event.value.code
      )
      .subscribe((response) => {
        this.executives = response['mandateexecutives'];
        this.showSpinner = false;
      });
  }
  onexecutive(event) {
    console.log(this.selectedExecutiveName);
    console.log(this.selectedExecutiveName.map((item) => item.id).join(','));
  }
  onVisitAssign(lead) {
    this.assigningLead = lead;
    this.visitAssign.present();
  }
  assigningPropertyList;
  assigningPropertyList1;
  assigningLead;
  getAssigningPropertyList() {
    this.mandateService.getmandateprojects().subscribe((proplist) => {
      if (this.localStorage.getItem('RoleType') === '1') {
        const propIds = this.localStorage.getItem('PropertyId');
        const propIdArray = propIds.split(',');
        proplist['Properties'].forEach((property) => {
          if (propIdArray.includes(property.property_idfk)) {
            this.assigningPropertyList.push(property);
          }
        });
      } else {
        this.assigningPropertyList = proplist['Properties'];
      }
      this.assigningPropertyList1 = this.assigningPropertyList;
    });
  }

  visitAssignLead() {
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
        leadId: this.assigningLead.Lead_IDFK,
        loginid: localStorage.getItem('UserId'),
        propname: this.selectedProperty.property_info_name,
        propid: this.selectedProperty.property_idfk,
        toexecid: this.selectedExecutiveName.map((item) => item.id).join(','),
        visitdate: this.assigningLead.visitdatetime,
        visittime: this.assigningLead.selectedtime,
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
        this.mandateService.assignWhatsAppVisits(param).subscribe((resp) => {
          if (resp['status'] == 'True') {
            Swal.fire({
              title: 'Assigned Successfully',
              icon: 'success',
              heightAuto: false,
              allowOutsideClick: true,
              confirmButtonText: 'Show Details',
            }).then((result) => {
              this.showSpinner = true;
              location.reload();
            });
          }
        });
      }
    }
  }
  onVisitAssignModalClose(event) {
    this.selectedProperty = null;
    this.selectedExecTeam = null;
    this.selectedExecutiveName = null;
  }
}

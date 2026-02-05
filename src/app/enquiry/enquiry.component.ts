import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnInit,
  QueryList,
  viewChild,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MandateService } from '../mandate-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { RetailServiceService } from '../retail-service.service';
import { Enquiry } from './enq';
import { SharedService } from '../shared.service';
import { formatDate, Location } from '@angular/common';
import { IonCheckbox, IonContent, MenuController } from '@ionic/angular';
declare var $: any;
@Component({
  selector: 'app-enquiry',
  templateUrl: './enquiry.component.html',
  styleUrls: ['./enquiry.component.scss'],
})
export class EnquiryComponent {
  tempFilteredValues;
  model = new Enquiry();
  localStorage = localStorage;
  isManual = false;
  selectedCount;
  temporaryLeadIds = [];

  // To store the counts of fresh and pending leads
  freshleads_count = '0';
  pendingleads_count = '0';

  projectNames;

  isCheckbox = false;

  leads_detail; //To store fresh and pending leads

  selectedProperty; //to hold selected property detail

  showSpinner = true;

  // To highlight the fresh and pending button
  isFresh = true;
  count = 0;
  mandateCount = 0;
  Sources;

  isChecked = false; //to display and hide the header of checked lead section
  assignedLeadIds = []; //to store the checked lead id's
  selectedLeadCount = 0; //to store the count of checked leads
  selectedExecutiveName; //to store the selected executive name
  executives; //to store the executives names
  selectedExecTeam; // To store the selected team
  @ViewChild('assignLeadsModal') assignLeadsModal;
  @ViewChild('bottomModal') bottomModal;
  assignedLeadDetails; //To store the selectted lead details
  isRetail = false; //To display the retail team on AssignLeadsModal, if we select the retail in dropdown

  constructor(
    private retailService: RetailServiceService,
    private mandateService: MandateService,
    private sharedService: SharedService,
    private menuCtrl: MenuController,
    private _sharedservice: SharedService,
    private ngZone: NgZone,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {}
  htype;
  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params) => {
      this.isChecked = false;
      this.isManual = false;
      this.selectedLeadCount = 0;
      this.assignedLeadIds = [];
      this.isCheckbox = false;
      this.isRetail = false;
      this.checkedLeadsDetail = [];
      this.temporaryLeadIds = [];
      this.htype = params['htype'];

      const paramValue = params['isFresh'];
      if (params['isFresh'] == 'true') {
        this.isFresh = true;
      } else {
        this.isFresh = false;
      }
      this.getQueryParams();
      this.getSourceList();
      this.fetchProjectNames();
      this.getlocalitylist();
      this.getPropertyList();
      this.getFreshPendingLeadsCount();
    });
  }

  //To Get Source
  getSourceList() {
    this._sharedservice.sourcelist().subscribe((response) => {
      this.Sources = response['Sources'];
      this.sourceList1 = response['Sources'];
    });
  }

  //To get the count of pending and fresh leads
  getFreshPendingLeadsCount() {
    this.showSpinner = true;
    // const param={
    //   limit:0,
    //   limitrows:20,
    //   source:'',
    //   cityid:'',
    //   count:1
    // }
    this.sharedService
      .getenquirylistCounts(this.filteredParams)
      .subscribe((counts) => {
        this.freshleads_count = counts['Leads'][0].freshleads_count;
        this.pendingleads_count = counts['Leads'][0].pendingleads_count;
      });
    this.getenquiriesRecords(false, 0);
  }

  addQuerryParams() {
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

  //To getting Querry Params value
  getQueryParams() {
    const queryString = window.location.search;
    const queryParams = {};
    new URLSearchParams(queryString).forEach((value, key) => {
      queryParams[key] = value;
    });

    Object.keys(this.filteredParams).forEach((key) => {
      if (queryParams.hasOwnProperty(key)) {
        this.filteredParams[key] = queryParams[key];
      } else if (key == 'propname' && 'ranavPropId' in localStorage) {
        this.filteredParams[key] = 'Ranav Tranquil Haven';
      } else if (key !== 'loginid' && key !== 'limit' && key !== 'limitrows') {
        this.filteredParams[key] = '';
      }
    });
  }

  getenquiriesRecords(isLoadmore, selectedCount) {
    const param = { ...this.filteredParams };

    if (selectedCount !== 0 && !isLoadmore) {
      param.limit = 0;
      param.limitrows = selectedCount;
    } else {
      this.count = isLoadmore ? (this.count += 20) : 0;
      param.limit = this.count;
    }

    return new Promise((resolve, reject) => {
      this.sharedService.getenquirylist(param).subscribe((response) => {
        this.ngZone.run(() => {
          if (response['status'] == 'True') {
            this.showSpinner = false;
            this.leads_detail = isLoadmore
              ? this.leads_detail.concat(response['Leads'])
              : response['Leads'];
            resolve(true);
          } else {
            this.showSpinner = false;
            this.leads_detail = [];
            resolve(false);
          }
        });
      });
    });
  }

  onSourceChange(event) {
    this.model.source = event.value.source;
  }

  //This called when we click on fresh and pending button
  onFresh_Pending(value) {
    this.resetInfiniteScroll();
    this.showSpinner = true;
    this.isAtBottom = false;
    this.isFresh = value === 'today' ? true : false;
    this.filteredParams.isFresh = value === 'today' ? 'true' : 'false';
    this.filteredParams.leads = value === 'today' ? '1' : '2';
    this.addQuerryParams();
    // this.router.navigate([],{
    //   queryParams:{
    //     isFresh:this.isFresh
    //   }
    // })
    this.getenquiriesRecords(false, 0);
    this.content.scrollToTop(100);
  }

  getMandateLeads(isLoadmore) {
    this.mandateCount = isLoadmore ? (this.count += 20) : 0;
    const param = {
      property: this.selectedProperty.property_info_name,
      limit: this.mandateCount,
      limitrows: 20,
    };
    this.sharedService.fetchbuilderleads(param).subscribe((response) => {
      if (response['status'] == 'True') {
        this.leads_detail = isLoadmore
          ? this.leads_detail.concat(response['Leads'])
          : response['Leads'];
        // this.leads_detail=response['Leads']
        this.showSpinner = false;
      } else {
        this.leads_detail = [];
        this.showSpinner = false;
      }
    });
  }

  //when we click on load more section
  loadData(event) {
    // isFresh?(leads_detail && (leads_detail.length !== 0 && leads_detail.length < freshleads_count && leads_detail.length !== freshleads_count)):
    //     (leads_detail && (leads_detail.length !== 0 && leads_detail.length < pendingleads_count &&  leads_detail.length !== pendingleads_count))

    if (
      (this.isFresh && this.leads_detail.length < this.freshleads_count) ||
      (!this.isFresh && this.leads_detail.length < this.pendingleads_count)
    ) {
      this.getenquiriesRecords(true, 0).then(() => {
        event.target.complete();
      });
    } else {
      event.target.disabled = true;
    }

    // this.getenquiriesRecords(true)
    // this.isRetail?this.getenquiriesRecords(true):this.getMandateLeads(true);
  }

  // when we click on checkbox
  checkedLeads(event) {
    this.checkedLeadsDetail = [];
    // this.temporaryLeadIds = []
    this.checkboxes.forEach((checkbox, index) => {
      if (checkbox.checked) {
        this.checkedLeadsDetail.push(this.leads_detail[index]);
      }
    });
    this.temporaryLeadIds = this.checkedLeadsDetail.map(
      (lead) => lead.customer_IDPK
    );
  }
  //
  // onSelectLeadCount(count) {
  //   this.assignedLeadIds =[]
  //   if(this.selectedLeadCount == count ||
  //     (this.selectedLeadCount == this.leads_detail.length && count=='all' )){
  //     this.selectedLeadCount = 0
  //   }else{
  //     this.selectedLeadCount = count === 'all' ? this.leads_detail.length : count ;
  //     this.assignedLeadIds = this.leads_detail.filter((item, index) => index < this.selectedLeadCount).map(item =>
  //       item.customer_IDPK
  //     );
  //   }
  // }

  checkedLeadsDetail;
  @ViewChildren('freshleadsCheckboxes') checkboxes!: QueryList<IonCheckbox>;
  onSelectLeadCount(count) {
    if (count !== 'manual' && parseInt(count) > this.leads_detail.length) {
      this.selectedLeadCount = parseInt(count);
      this.showSpinner = true;
      if (this.leads_detail.length < 10) {
        this.isManual = true;
      } else {
        this.isManual = false;
      }
      this.getenquiriesRecords(false, parseInt(count)).then(() => {
        this.checkedLeadsDetail = this.leads_detail.slice(0, parseInt(count));
        this.temporaryLeadIds = this.checkedLeadsDetail.map(
          (lead) => lead.customer_IDPK
        );
        // this.checkedLeadsDetail.forEach(element => {
        //   this.fromExecids.push(element.RMID)
        // });
      });
    } else {
      if (count == 'manual') {
        this.isManual = true;
        this.selectedCount = null;
        this.selectedLeadCount = 0;
        this.checkedLeadsDetail = [];
        this.temporaryLeadIds = [];
      } else {
        this.selectedLeadCount = parseInt(count);
        this.selectedCount = null;
        setTimeout(() => {
          this.selectedCount = count;
        });
        this.isManual = false;
        if (this.temporaryLeadIds.length == parseInt(count)) {
          this.checkedLeadsDetail = [];
          this.temporaryLeadIds = [];
        } else {
          this.checkedLeadsDetail = this.leads_detail.slice(0, parseInt(count));
          this.temporaryLeadIds = this.checkedLeadsDetail.map(
            (lead) => lead.customer_IDPK
          );
          // this.checkedLeadsDetail.forEach(element => {
          //   this.fromExecids.push(element.RMID)
          // });
        }
      }
    }
  }

  openAssignLeadsModal() {
    // this.isRetail = event.value.id == 1?true:false//to display the mandate or retail team
    if (this.temporaryLeadIds.length != 0) {
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

  randomId = '';
  toggle_random_assign(event) {
    event.detail.checked ? (this.randomId = '1') : (this.randomId = '');
  }

  assignLead() {
    const selectedExecutiveIds = [];
    if (!this.selectedTeam) {
      Swal.fire({
        title: 'Please select an team before proceeding.',
        icon: 'warning',
        heightAuto: false,
        confirmButtonText: 'OK',
      });
    } else if (!this.isRetail && !this.selectedProperty) {
      Swal.fire({
        title: 'Please select an property before proceeding.',
        icon: 'warning',
        heightAuto: false,
        confirmButtonText: 'OK',
      });
    } else if (this.isRetail && !this.selectedExecTeam) {
      Swal.fire({
        title: 'Please select an Executive Team before proceeding.',
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
      this.showSpinner = true;
      this.selectedExecutiveName.forEach((executive) => {
        this.isRetail
          ? selectedExecutiveIds.push(executive.ExecId)
          : selectedExecutiveIds.push(executive.id);
      });

      const param = {
        rmID: selectedExecutiveIds,
        LeadID: this.temporaryLeadIds,
        propID: this.isRetail ? '' : this.selectedProperty.property_idfk,
        random: this.randomId,
        loginId: localStorage.getItem('UserId'),
      };

      if (localStorage.getItem('Name') == 'demo') {
        // Lead assignment unavailable for this account
        Swal.fire({
          title: 'Lead assignment is not allowed for demo account',
          icon: 'error',
          heightAuto: false,
          allowOutsideClick: false,
          confirmButtonText: 'OK',
        }).then(() => {
          this.showSpinner = false;
        });
      } else {
        if (this.isRetail) {
          this.retailService.leadassign(param).subscribe((response) => {
            if (response['status'] == 'True') {
              Swal.fire({
                title: 'Assigned Successfully',
                icon: 'success',
                heightAuto: false,
                confirmButtonText: 'OK',
              }).then((result) => {
                this.showSpinner = true;
                if (result.value) {
                  window.location.reload();
                }
              });
            }
          });
        } else {
          this.mandateService.leadassign(param).subscribe((response) => {
            if (response['status'] == 'True') {
              Swal.fire({
                title: 'Assigned Successfully',
                icon: 'success',
                heightAuto: false,
                confirmButtonText: 'OK',
              }).then((result) => {
                this.showSpinner = true;
                if (result.value) {
                  window.location.reload();
                }
              });
            }
          });
        }
      }
    }
  }

  fetchProjectNames() {
    this.mandateService
      .getmandateprojects1(this.localStorage.getItem('UserId'))
      .subscribe((response) => {
        if (response['status'] == 'True') {
          this.projectNames = response['Properties'];
        } else {
        }
      });
  }

  @ViewChild('addLeadModal') addLeadModal;
  addenquiry() {
    this.model.username = localStorage.getItem('Name');
    var nameFilter = /^([a-zA-Z]+\s)*[a-zA-Z]+$/;
    var custName = $('#custname').val() as string;

    var mobilee = /^[0-9]{10}$/;
    var custNumValue = $('#custnum').val() as string;

    var email = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;
    var custMail = $('#custmail').val() as string;

    if ($('#custname').val() == '') {
      $('#custname')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Enter Name');
      this.mainscrollContainer?.scrollToTop(300);
    } else if (!nameFilter.test(custName)) {
      $('#custname').removeAttr('style');
      $('#custname')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please enter valid name')
        .val('');
      this.mainscrollContainer?.scrollToTop(300);
    } else if ($('#custnum').val() == '') {
      $('#custname').removeAttr('style');
      $('#custnum')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Enter Phone Number');
      this.mainscrollContainer?.scrollToTop(300);
    } else if (!mobilee.test(custNumValue)) {
      $('#custnum').removeAttr('style');
      $('#custnum')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please enter valid contact number')
        .val('');
      this.mainscrollContainer?.scrollToTop(300);
    } else if ($('#custmail').val() == '') {
      $('#custnum').removeAttr('style');
      $('#custmail')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Enter Email-id');
      this.mainscrollContainer?.scrollToTop(300);
    } else if (!email.test(custMail)) {
      $('#custmail').removeAttr('style');
      $('#custnum').removeAttr('style');
      $('#custmail')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please enter valid email-id')
        .val('');
      this.mainscrollContainer?.scrollToTop(300);
    } else if (this.model.source == undefined || this.model.source == '') {
      $('#custmail').removeAttr('style');
      // $('#sourceselect').focus().css("border-color", "red").attr('placeholder', 'Please Enter Name');
      Swal.fire({
        title: 'Please select the Source',
        text: 'Select any kind of source',
        icon: 'error',
        heightAuto: false,
        showConfirmButton: true,
      });
    } else if ($('#proptypeselect').val() == '') {
      $('.sourcename').removeAttr('style');
      Swal.fire({
        title: 'Please select the Property Type',
        text: 'Select any kind of Type',
        icon: 'error',
        heightAuto: false,
        showConfirmButton: true,
      });
    } else if ($('#possessionselect').val() == '') {
      $('#proptypeselect').removeAttr('style');
      Swal.fire({
        title: 'Please select the Possession',
        text: 'Select any Timeline for the client.',
        icon: 'error',
        heightAuto: false,
        showConfirmButton: true,
      });
    } else if ($('#sizeselect').val() == '') {
      $('#possessionselect').removeAttr('style');
      Swal.fire({
        title: 'Please select the Size',
        text: 'Select any BHK for the Final Submission',
        icon: 'error',
        heightAuto: false,
        showConfirmButton: true,
      });
    } else if ($('#budgetselect').val() == '') {
      $('#sizeselect').removeAttr('style');
      Swal.fire({
        title: 'Please select the Budget',
        text: 'Select any budget range ',
        icon: 'error',
        heightAuto: false,
        showConfirmButton: true,
      });
    } else if ($('#address').val() == '') {
      $('#budgetselect').removeAttr('style');
      $('#address')
        .focus()
        .css('border-color', 'red')
        .attr('placeholder', 'Please Enter the address');
    } else {
      $('#address').removeAttr('style');
      var params = this.model;
      this.showSpinner = true;

      if (localStorage.getItem('Name') === 'demo') {
        Swal.fire({
          title: 'This is a demo account. Adding leads is not allowed.',
          icon: 'error',
          heightAuto: false,
          allowOutsideClick: false,
          confirmButtonText: 'ok',
        }).then(() => {
          location.reload();
        });
      } else {
        this._sharedservice.addenquiry(params).subscribe(
          (success) => {
            if (success['code'] == '0') {
              this.showSpinner = false;
              Swal.fire({
                title: 'Lead Added Successfully',
                text: 'Added as a new Lead',
                icon: 'success',
                heightAuto: false,
                confirmButtonText: 'ok',
              }).then(() => {
                this.save();
                location.reload();
              });
            } else if (success['code'] == '1') {
              this.showSpinner = false;
              Swal.fire({
                title: 'Existing Lead Found',
                text: 'Added as a Duplicate Entry',
                icon: 'success',
                heightAuto: false,
                confirmButtonText: 'ok',
              }).then(() => {
                this.save();
                location.reload();
              });
            } else {
              this.showSpinner = false;
              Swal.fire({
                title: 'Some Error Occured',
                text: 'Lead Not Passed',
                icon: 'error',
                heightAuto: false,
                confirmButtonText: 'ok',
              }).then(() => {
                this.save();
                location.reload();
              });
            }
            this.addLeadModal.dismiss();
          },
          (err) => {
            console.log('Failed to Update');
          }
        );
      }
    }
  }

  @ViewChild('mainscrollContainer', { static: false })
  mainscrollContainer: IonContent;
  save() {
    $('.modal').removeClass('in');
    $('#add_test').hide();
    $('.modal-backdrop').remove();
    $('body').removeClass('modal-open');
    $('body').css('padding-right', '');
    $('#cancel').click();
    this.model.name = '';
    this.model.number = '';
    this.model.mail = '';
    this.model.propertytype = '';
    this.model.size = '';
    this.model.source = '';
    this.model.timeline = '';
    this.model.budget = '';
    this.model.address = '';
    $('.radiocheck').prop('checked', false);
  }

  typeselection(event) {
    var value = event.target.value;
    const a = document.getElementById('proptypeselect') as HTMLInputElement;
    a.value = value;
    this.model.propertytype = value;
  }

  possessionselection(event) {
    var value = event.target.value;
    const a = document.getElementById('possessionselect') as HTMLInputElement;
    a.value = value;
    this.model.timeline = value;
  }

  sizeselection(event) {
    var value = event.target.value;
    const a = document.getElementById('sizeselect') as HTMLInputElement;
    a.value = value;
    let numArr = value.match(/[\d\.]+/g);
    numArr = numArr.filter((n) => n != '.');
    this.model.size = numArr;
  }

  budgetselection(event) {
    var value = event.target.value;
    const a = document.getElementById('budgetselect') as HTMLInputElement;
    a.value = value;
    this.model.budget = value;
  }

  reset() {
    this.selectedExecutiveName = [];
    this.executives = [];
    this.selectedExecTeam = '';
    this.selectedTeam = null;
    this.selectedProperty = '';
  }

  team = [
    { name: 'Retail Team', code: 'Retail' },
    { name: 'Mandate Team', code: 'Mandate' },
  ];
  execTeam = [
    { name: 'All', code: '' },
    { name: 'Relationship Executives', code: '50010' },
    { name: 'Customersupport Executives', code: '50004' },
  ];

  selectedTeam;
  onAssignTeamSelect(event) {
    this.isRetail = event.value.code === 'Retail';
    this.executives = [];
    this.selectedExecutiveName = [];
  }

  onExecTeamSelect(event) {
    this.showSpinner = true;
    this.selectedExecutiveName = [];
    this.retailService
      .fetchRetail_executivesName(event.value.code, '')
      .subscribe((response) => {
        this.executives = response['DashboardCounts'];
        this.showSpinner = false;
      });
  }

  onPropertySelect(event) {
    this.showSpinner = true;
    this.selectedExecutiveName = [];
    if (event.value.property_idfk === '28773') {
      this.mandateService.setHoverState('ranav_group');
    } else {
      this.mandateService.setHoverState('');
    }
    this.mandateService
      .fetchmandateexecutives(event.value.property_idfk, '')
      .subscribe((response) => {
        this.executives = response['mandateexecutives'];
        this.showSpinner = false;
      });
  }

  onexecutive(event) {
    console.log(event);
    console.log(this.selectedExecutiveName);
  }

  // to get telecaller name based on team select
  onTeamSelect(event) {
    this.selectedExecutiveName = '';
    const idMap = {
      Relationship: '50010',
      Customersupport: '50004',
      All: '',
      Direct: 1,
      Inhouse: 2,
    };
    var id = idMap[event.detail.value] || '';
    switch (event.detail.value) {
      case 'All':
      case 'Relationship':
      case 'Customersupport':
        this.retailService
          .fetchRetail_executivesName(id, '')
          .subscribe((response) => {
            this.executives = response['DashboardCounts'];
          });
        break;
      case 'Direct':
      case 'Inhouse':
        this.mandateService
          .fetchmandateexecutives(this.selectedProperty.property_idfk, id)
          .subscribe((response) => {
            this.executives = response['mandateexecutives'];
          });
        break;
      default:
    }
  }

  handleClick() {
    // if (this.leads_detail.length != 0) {
    this.isCheckbox = true;
    this.isChecked = true;
    // }
  }

  ngOnDestroy() {
    this.assignLeadsModal.dismiss();
    Swal.close();
  }

  selectedlocality: any;
  locality: any;
  localitychange(event) {
    this.model.location = event.value.locality;
    this.model.locId = event.value.id;
    this.cdr.detectChanges();
  }

  getlocalitylist() {
    this.mandateService.localitylist().subscribe((localities) => {
      this.locality = localities['Localities'];
      // this.selectedlocality = this.show_cnt['localityid'];
    });
  }

  prioritychange(event) {
    this.model.priority = event.target.value;
  }

  onBackButton() {
    this.resetInfiniteScroll();
    this.location.back();
  }

  openToaddLeadModal() {
    this.addLeadModal.present();
  }

  showInfiniteScroll = true;
  resetInfiniteScroll() {
    this.showInfiniteScroll = false;
    setTimeout(() => {
      this.showInfiniteScroll = true;
    }, 10);
  }
  openEndMenu() {
    this.sharedService.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  isLeftFilterActive;
  filteredParams = {
    fromDate: '',
    toDate: '',
    source: '',
    propname: '',
    count: 1,
    cityid: '',
    limit: 0,
    limitrows: 20,
    isFresh: '',
    leads: this.isFresh ? '1' : '2',
  };

  reset_filter() {
    this.isLeftFilterActive = 'date';
    // this.tempFilteredValues={
    //   fromDate:'',
    //   toDate:'',
    //   propname:'',
    //   executid:localStorage.getItem('Role')==='1'?'':localStorage.getItem('UserId'),
    //   loginid: localStorage.getItem('UserId'),
    //   limit:0,
    //   limitrows:30
    // }

    this.tempFilteredValues = {
      fromDate: '',
      toDate: '',
      source: '',
      propname: '',
      count: 1,
      cityid: '',
      limit: 0,
      limitrows: 20,
      isFresh: '',
      leads: this.isFresh ? '1' : '2',
      executid:
        localStorage.getItem('Role') === '1'
          ? ''
          : localStorage.getItem('UserId'),
      loginid: localStorage.getItem('UserId'),
    };
  }

  onFilterValues(value) {
    this.isLeftFilterActive = value;
    if (value == 'source') {
      this.scrollToSelectedSource();
    } else if (value == 'property') {
      this.scrollToSelectedProperty();
    }
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

  @ViewChild('filterModal') filterModal;
  confirmSelection() {
    this.filteredParams = { ...this.tempFilteredValues };
    this.filterModal.dismiss();
    this.addQuerryParams();
  }

  navigateToFilter() {
    this.isFresh && !localStorage.getItem('ranavPropId')
      ? (this.isLeftFilterActive = 'property')
      : 'ranavPropId' in localStorage
      ? (this.isLeftFilterActive = 'source')
      : (this.isLeftFilterActive = 'date');
    this.tempFilteredValues = { ...this.filteredParams };
    this.scrollToSelectedSource();
    this.filterModal.present();
  }

  daterange() {
    const from = this.tempFilteredValues.fromDate;
    const to =
      this.tempFilteredValues.toDate != '1970-01-01'
        ? this.tempFilteredValues.toDate
        : '';
    if (from && to) {
      return `${from} to ${to}`;
    } else if (from) {
      return 'Select end date';
    } else {
      return 'Select date range';
    }
  }

  isenabled = true;
  dateRange;
  onFilterSelection(data, value) {
    switch (data) {
      case 'date':
        if (this.dateRange?.length === 2 && this.dateRange[1] != null) {
          const start = formatDate(this.dateRange[0], 'yyyy-MM-dd', 'en-US');
          const end = formatDate(this.dateRange[1], 'yyyy-MM-dd', 'en-US');
          this.tempFilteredValues.fromDate = start;
          this.tempFilteredValues.toDate = end != '1970-01-01' ? end : '';
          this.isenabled =
            this.tempFilteredValues.toDate != '' &&
            this.tempFilteredValues.toDate != '1970-01-01'
              ? true
              : false;
        }

        break;
      case 'source':
        this.tempFilteredValues.source = value == 'all' ? '' : value;
        break;
      case 'property':
        this.tempFilteredValues.propname = value;
        break;
      default:
        break;
    }
  }

  propertyList;
  propertySearchTerm;
  propertyList1;
  sourceSearchTerm;
  sourceList1;
  getPropertyList() {
    this.sharedService
      .propertylistForEnquiry(this.filteredParams.leads, '')
      .subscribe((response) => {
        this.propertyList = response['Leads'];
        this.propertyList1 = response['Leads'];
      });
  }

  setFilteredProperty() {
    this.propertyList1 = this.propertyList.filter((item) => {
      return item.propertyname
        ?.toLowerCase()
        .includes(this.propertySearchTerm.toLowerCase());
    });
  }

  setFilteredSource() {
    this.sourceList1 = this.Sources.filter((item) => {
      return item.source
        ?.toLowerCase()
        .includes(this.sourceSearchTerm.toLowerCase());
    });
  }

  @ViewChild('propScrollContent', { static: false })
  propScrollContent!: IonContent;
  async scrollToSelectedProperty(): Promise<void> {
    const propname = this.tempFilteredValues.propname;
    if (!propname) {
      return;
    }
    const elementId = `${propname}`;
    setTimeout(() => {
      const selectedElement = document.getElementById(elementId);
      if (selectedElement) {
        this.propScrollContent.scrollToPoint(0, selectedElement.offsetTop, 500);
      } else {
        console.log('Element not found2:', elementId);
      }
    }, 1000);
  }

  onDelete(id) {
    Swal.fire({
      title: 'Confirmation',
      text: 'Do You Want to Delete the Lead',
      icon: 'warning',
      heightAuto: false,
      confirmButtonText: 'Yes!',
      cancelButtonText: 'NO',
      showConfirmButton: true,
      showCancelButton: true,
    }).then((result) => {
      if (result.value == true) {
        this._sharedservice.deleteLead(id).subscribe((resp) => {
          if (resp['status'] == 'True') {
            Swal.fire({
              title: 'Lead Deletion',
              text: 'Lead has been Deleted successfully',
              icon: 'success',
              showConfirmButton: false,
              heightAuto: false,
              timer: 1000,
            }).then(() => {
              location.reload();
            });
          }
        });
      }
    });
  }

  @ViewChild('content', { static: false }) content: IonContent;
  canScroll;
  isAtBottom = false;
  onScroll(event: CustomEvent) {
    const scrollTop = event.detail.scrollTop;
    this.content.getScrollElement().then((scrollEl) => {
      const scrollTop = scrollEl.scrollTop;
      const scrollHeight = scrollEl.scrollHeight;
      const clientHeight = scrollEl.offsetHeight;

      this.canScroll = scrollHeight > clientHeight + 10; // ADD A BUFFER of 10px

      if (!this.canScroll) {
        this.isAtBottom = false;
      } else {
        this.isAtBottom = scrollTop + clientHeight >= scrollHeight - 100;
      }
    });
  }

  selectedRange: Date[] = [];

  onRangeSelect() {
    console.log('Selected Range:', this.selectedRange);
  }
}

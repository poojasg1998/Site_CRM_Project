import { Component, Input, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { MandateService } from 'src/app/mandate-service.service';
import { SharedService } from 'src/app/shared.service';
declare var $: any;

@Component({
  selector: 'app-junkform',
  templateUrl: './junkform.component.html',
  styleUrls: ['./junkform.component.scss'],
})
export class JunkformComponent implements OnInit {
  @Input() selectedExecId: any;
  @Input() selectedSuggestedProp: any;
  @Input() onCallLeadDetails: any;
  showSpinner = true;

  feedbackId = '';
  //to hold to junk categories
  junkcategories: any;
  junkcategories1;

  suggestchecked: any;
  junkcatognames: any = '';
  autoremarks: string;
  leadid: any;
  userid: string;
  executeid: any;
  propertyid: any;
  status: any;
  textarearemarks: any = ''; //to store remark
  junkExecutiveId;
  getselectedLeadExec;
  junkcategoryId: any;

  constructor(
    private router: Router,
    private mandateService: MandateService,
    private activeroute: ActivatedRoute,
    public loadingController: LoadingController,
    private _sharedservice: SharedService
  ) {}

  ngOnInit() {
    this.userid = localStorage.getItem('UserId');
    if (this.userid == '1') {
      this.junkExecutiveId = this.selectedExecId;
    } else {
      this.junkExecutiveId = this.selectedExecId;
    }

    this.activeroute.queryParamMap.subscribe((params) => {
      const isEmpty = Object.keys(params['params']).length === 0;
      // if (isEmpty === false) {
      this.leadid = params.get('leadId')
        ? params.get('leadId')
        : this.onCallLeadDetails.customer_IDPK;

      this.feedbackId = params.get('feedback') ? params.get('feedback') : '';
      // }
    });

    this.mandateService
      .getassignedrm(
        this.leadid,
        this.userid,
        this.selectedExecId,
        this.feedbackId
      )
      .subscribe((cust) => {
        this.showSpinner = false;
        this.executeid = cust['RMname'][0].executiveid;
        this.propertyid = cust['RMname']?.[0]?.['suggestedprop']?.[0]?.propid;
        if (this.userid == '1') {
          this.junkExecutiveId = this.selectedExecId;
        } else {
          this.junkExecutiveId = this.selectedExecId;
        }

        let filteredInfo;
        filteredInfo = cust['RMname'].filter(
          (da) => da.executiveid == this.selectedExecId
        );
        this.getselectedLeadExec = filteredInfo[0];

        this.mandateService.getjunksections().subscribe((junkcategos) => {
          this.junkcategories = junkcategos['JunkCategories'];
          this.junkcategories1 = junkcategos['JunkCategories'];
        });
      });
  }

  searchedName;
  onJunkSearch() {
    this.junkcategories1 = this.junkcategories.filter((item) => {
      return item.junk_categories
        ?.toLowerCase()
        .includes(this.searchedName?.toLowerCase());
    });
  }

  // while searching filtered option display in bellow
  handleInput(event) {
    const query = event.target.value.toLowerCase();
    this.junkcategories1 = this.junkcategories.filter(
      (junk) =>
        junk.junk_categories.toLowerCase().indexOf(query.toLowerCase()) > -1
    );
  }

  //to heighlight the selected option
  selectedJunkCategoryIndex: number = -1;
  selectsuggested(index: number, catogs): void {
    if (this.selectedJunkCategoryIndex === index) {
      this.selectedJunkCategoryIndex = -1;
      this.junkcatognames = '';
    } else {
      this.selectedJunkCategoryIndex = index;
      this.junkcategoryId = catogs.junk_section_IDPK;
      this.junkcatognames = catogs.junk_categories;
    }
  }

  isJunkCategorySelected(index: number): boolean {
    return this.selectedJunkCategoryIndex === index;
  }

  junkmoving() {
    if (this.getselectedLeadExec?.suggestedprop?.length > 1) {
      this.suggestchecked = this.selectedSuggestedProp?.propid;
    } else {
      this.suggestchecked = this.getselectedLeadExec?.suggestedprop[0]?.propid;
    }

    if (
      this.junkcategoryId == '' ||
      this.junkcategoryId == undefined ||
      this.junkcategoryId == null
    ) {
      Swal.fire({
        title: 'Select any JUNK Reason',
        text: 'Select any Reason for the JUNK',
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'OK',
      });
    } else {
      var textarearemarks = $('#junkremarks').val();
      var userid = localStorage.getItem('UserId');
      this.autoremarks =
        ' Moved the lead to Junk, Because of ' + this.junkcatognames;
      var leadjunkparam = {
        leadid: this.leadid,
        closedate: '',
        closetime: '',
        leadstage: 'Move to Junk',
        stagestatus: this.junkcategoryId,
        textarearemarks: textarearemarks,
        userid: userid,
        assignid: this.junkExecutiveId,
        autoremarks: this.autoremarks,
        property: this.suggestchecked,
        feedbackid: this.feedbackId,
      };

      if (localStorage.getItem('Name') == 'demo') {
        Swal.fire({
          title: 'This feature is restricted for demo accounts.',
          icon: 'error',
          heightAuto: false,
          confirmButtonText: 'ok',
        }).then(() => {
          this.showSpinner = false;
        });
      } else {
        this.showSpinner = true;
        this.mandateService
          .addleadhistory(leadjunkparam)
          .subscribe((success) => {
            this.status = success['status'];
            if (this.status == 'True') {
              // this.presentLoading();
              Swal.fire({
                title: 'Lead Moved Successfully',
                icon: 'success',
                heightAuto: false,
                allowOutsideClick: false,
                confirmButtonText: 'OK!',
              }).then((result) => {
                if (result.value) {
                  // this.router.navigate(['/mandate-visit-stages'],{
                  //   queryParams:{
                  //     type:'Junk Visits',
                  //     isDropDown:'false',
                  //     stagestatus:'3',
                  //     stage:'USV',
                  //     selectedStage:'USV',
                  //     htype:'mandate',
                  //     status:'junkvisits'
                  //   }
                  // })
                  location.reload();
                  this.showSpinner = false;
                  // this.router.navigateByUrl('/rmleadassign?todayscheduled=1&from=&to=');
                  // window.location.reload();
                }
              });
            }
          });
      }
    }
  }

  //to remove style for selected option
  handleCloseIconClick(): void {
    this.selectedJunkCategoryIndex = -1;
  }

  // to test whether the text earea input contain only space
  hasOnlySpaces;
  checkAlphanumericSpaces() {
    // this.hasOnlySpaces = !/^(?!\s*$).+$/.test(this.textarearemarks);
    this.hasOnlySpaces = !/^(?![\s\n\r]*$)[\s\S]+$/.test(this.textarearemarks);
  }

  // to diaplay loader
  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Loading...',
      duration: 3500,
      cssClass: 'custom-loading-class',
    });
    loading.present();
  }

  async ngOnDestroy() {
    this._sharedservice.dismissAllOverlays();
    this.closeAlert();
  }
  closeAlert() {
    Swal.close();
  }
}

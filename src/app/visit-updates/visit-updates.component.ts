import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  viewChild,
} from '@angular/core';
import Swal from 'sweetalert2';
import { MandateService } from '../mandate-service.service';
import {
  IonContent,
  IonModal,
  LoadingController,
  MenuController,
} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-visit-updates',
  templateUrl: './visit-updates.component.html',
  styleUrls: ['./visit-updates.component.scss'],
})
export class VisitUpdatesComponent implements OnInit, OnDestroy {
  @ViewChild('modal') modal: IonModal;
  existingExecutivesList = [];
  isRanavGroup = false;
  data = false;
  rsvlead: any;
  rsvcount: any;
  isFreshvisitvisiblesection = false;
  isRevisitvisiblesection = false;
  isFeatchData = false;
  isPropertyList = true;
  ischannelPatner = false;
  ischannelPatnerName = false;
  isMSRlogo = false;
  isMSR = false;
  cplists;
  placeholderValue;
  isNumberExist = false;

  public timerInterval: any;
  display: any;
  otpResend = false;

  localStorage = localStorage;

  //to chnage background color buttons
  isSelect2BHK = false;
  isSelect3BHK = false;
  isSelect1BHK = false;
  isSelect4BHK = false;
  is1CrBudget = false;
  isAbove1_2CrBudget = false;
  isHomes247_Walkin = false;
  isMagicbricks_Walkin = false;
  isHousing_Walkin = false;
  is99acres_Walkin = false;
  isWalkin = false;
  isChannelPartner = false;
  isReference = false;
  isHoardings = false;
  is50L_60L = false;
  is70L_80L = false;
  is80L_Above = false;
  is80L_90L = false;
  is90L_1_2Cr = false;
  is1_2Cr_Above = false;
  is80L_1Cr = false;
  is4Cr = false;

  visiteddate;
  lastvisiteddate;
  lastremark;

  propertyId;
  isGRSithara = false;
  isGRSamskruthi = false;
  isEnchanting = false;
  isGRSwara = false;
  isReviva = false;

  mandateexecutives;

  mailsend = {
    contact: '',
    clientname: '',
    clientmail: '',
    leadid: '',
    bhksize: '',
    cpname: '',
    cpidpk: '',
    cpmail: '',
    propertymodel: '',
    execselectmodel: '',
    execselectmodelid: '',
    sourceselectmodel: '',
    visitremarks: '',
    visitremarksrsv: '',
    priority: '',
    execselectmodelidrsv: '',
    execselectmodelrsv: '',
    otpmodel: '',
    budget: '',
    cpid: {
      CP_NAME: '',
      CP_IDPK: '',
      CP_MAIL: '',
    },
    otpbased: '2',
  };

  isEditNumber = false;
  leadResponse: any;
  isOnCallDetailsPage = false;
  roleid = '';
  roleType = '';
  constructor(
    private _location: Location,
    private menuCtrl: MenuController,
    private sharedService: SharedService,
    private router: Router,
    private mandateService: MandateService,
    public loadingController: LoadingController,
    private activeroute: ActivatedRoute,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.data = true;
    this.activeroute.queryParams.subscribe((params) => {
      this.roleid = this.localStorage.getItem('Role');
      this.roleType = this.localStorage.getItem('RoleType');
      if (params['isOnCallDetailsPage'] == 'true') {
        this.isOnCallDetailsPage = true;
      } else {
        this.isOnCallDetailsPage = false;
      }

      this.isPropertyList = true;
      this.isFeatchData = false;
      this.isSitaraLogo = false;
      this.isSamskruthiLogo = false;
      this.isSwaraGroupLogo = false;
      this.isEnchantingLogo = false;
      this.isFreshvisitvisiblesection = false;
      this.isRevisitvisiblesection = false;
      this.mailsend.contact = '';
      this.mailsend.clientname = '';
      const propIds = localStorage
        .getItem('PropertyId')
        ?.split(',')
        .map((id) => id.trim());

      if (
        localStorage.getItem('Role') == '1' &&
        !localStorage.getItem('ranavPropId')
      ) {
        this.isGRSithara = true;
        this.isGRSamskruthi = true;
        this.isEnchanting = true;
        this.isMSR = true;
        this.isRanavGroup = true;
        this.isGRSwara = true;
        this.isReviva = true;
      } else if ('ranavPropId' in localStorage) {
        this.isRanavGroup = true;
      } else {
        this.isGRSithara = propIds?.includes('16793') || false;
        this.isEnchanting = propIds?.includes('34779') || false;
        this.isGRSamskruthi = propIds?.includes('1830') || false;
        this.isRanavGroup = propIds?.includes('28773') || false;
        this.isGRSwara = propIds?.includes('82668') || false;
        this.isReviva = propIds?.includes('80459') || false;
      }
    });
  }
  selectedExec;
  // Lead Exisiting Check function with Database Intial Method
  numbercheck() {
    Swal.fire({
      title: 'Checking Lead in Database',
      html: 'Please Wait...........',
      timerProgressBar: true,
      heightAuto: false,
      didOpen: () => {
        Swal.showLoading();
        const b = Swal.getHtmlContainer().querySelector('b');
      },
    });
    var submitting = {
      number: this.mailsend.contact,
      propertyId: this.propertyId,
      executiveId: this.localStorage.getItem('UserId'),
    };

    this.mandateService
      .leadexistcheckertest(submitting)
      .subscribe((response) => {
        var status = response['status'];
        var datastatus = response['success'];
        this.leadResponse = response['success'];
        this.existingExecutivesList = response['teammates'];

        if (status == '0') {
          Swal.fire({
            title: 'Checking Lead in Database',
            html: 'Please Wait...........',
            timer: 2000,
            heightAuto: false,
            timerProgressBar: true,
            didOpen: () => {
              Swal.showLoading();
              const b = Swal.getHtmlContainer().querySelector('b');
            },
          }).then(() => {
            Swal.fire({
              title: 'Found as Fresh Visit',
              text: 'Please Fill the Relevant Details.',
              icon: 'success',
              timer: 2000,
              heightAuto: false,
              showConfirmButton: false,
              timerProgressBar: true,
            }).then(() => {
              this.mailsend.clientname = '';
              this.isFreshvisitvisiblesection = true;
              this.isRevisitvisiblesection = false;
              this.isFeatchData = false;
            });
          });
        } else if (status == '2') {
          Swal.fire({
            title: 'Checking Lead in Database',
            html: 'Please Wait...........',
            timer: 2000,
            heightAuto: false,
            timerProgressBar: true,
            didOpen: () => {
              Swal.showLoading();
              const b = Swal.getHtmlContainer().querySelector('b');
            },
          }).then(() => {
            Swal.fire({
              title: 'Found as Existing Lead in our Database',
              text: 'Please Fill the Relevant Details.',
              icon: 'success',
              timer: 2000,
              heightAuto: false,
              showConfirmButton: false,
              timerProgressBar: true,
            }).then(() => {
              this.mailsend.clientname = datastatus?.[0]?.customer_name
                ? datastatus?.[0]?.customer_name
                : datastatus.customer_name;
              this.mailsend.clientmail = datastatus?.[0]?.customer_mail
                ? datastatus?.[0]?.customer_mail
                : datastatus.customer_mail;
              this.isFreshvisitvisiblesection = true;
              this.isRevisitvisiblesection = false;
              this.isFeatchData = false;
              this.isNumberExist = true;
            });
          });
        } else if (status == '1') {
          this.rsvlead = true;
          this.rsvcount = datastatus?.[0]?.visited_count;
          this.mailsend.leadid = datastatus?.[0]?.enquiry_idfk;
          Swal.fire({
            title: 'Fetching the Details',
            text: 'Please Wait...........',
            timer: 3000,
            heightAuto: false,
            timerProgressBar: true,
            didOpen: () => {
              Swal.showLoading();
              const b = Swal.getHtmlContainer().querySelector('b');
            },
          }).then(() => {
            this.isFreshvisitvisiblesection = false;
            this.isRevisitvisiblesection = true;
            this.isFeatchData = false;
            let MySQLDate = datastatus[0].added_datetime;
            let date = MySQLDate.replace(/[-]/g, '/');
            date = Date.parse(date);
            let jsDate = new Date(date);
            this.visiteddate = jsDate;
            this.mailsend.clientname = datastatus[0].enquiry_name;
            this.mailsend.execselectmodel = datastatus[0].accompanied_rm;
            this.mailsend.sourceselectmodel =
              datastatus[0].enquiry_source + '-' + datastatus[0].cp_name;
            this.lastremark = datastatus[0].remarks;
            let MySQLDate2 = datastatus[0].rsvlastvisitdate;
            let date2 = MySQLDate2.replace(/[-]/g, '/');
            date2 = Date.parse(date2);
            let jsDate2 = new Date(date2);
            this.lastvisiteddate = jsDate2;
          });
        } else {
          Swal.fire({
            title: 'Something Error Occured!',
            heightAuto: false,
            icon: 'error',
          }).then(() => {});
        }
      });
  }
  cplists1;

  //to display the reference, handling and channel patner section
  selectsourcecpclik(value) {
    if (value == 'channelPartner') {
      this.mailsend.cpname = '';
      this.ischannelPatner = !this.ischannelPatner;
      this.ischannelPatnerName = false;
      this.mandateService.getCPlist().subscribe((response) => {
        this.cplists = response['CPlists'];
      });
      if (this.ischannelPatner) {
        this.isHomes247_Walkin = false;
        this.isMagicbricks_Walkin = false;
        this.isHousing_Walkin = false;
        this.is99acres_Walkin = false;
        this.isWalkin = false;
        this.isChannelPartner = true;
        this.isReference = false;
        this.isHoardings = false;
        this.mailsend.sourceselectmodel = 'Channel Partners-Walkin';
      } else {
        this.isHomes247_Walkin = false;
        this.isMagicbricks_Walkin = false;
        this.isHousing_Walkin = false;
        this.is99acres_Walkin = false;
        this.isWalkin = false;
        this.isChannelPartner = false;
        this.isReference = false;
        this.isHoardings = false;
        this.mailsend.sourceselectmodel = '';
      }
    } else if (value == 'reference') {
      this.mailsend.cpname = '';
      this.ischannelPatner = false;
      this.placeholderValue == 'Please Enter Reference Name'
        ? (this.ischannelPatnerName = false)
        : (this.ischannelPatnerName = true);
      this.placeholderValue = this.ischannelPatnerName
        ? 'Please Enter Reference Name'
        : '';

      if (this.ischannelPatnerName) {
        this.isReference = true;
        this.isHomes247_Walkin = false;
        this.isMagicbricks_Walkin = false;
        this.isHousing_Walkin = false;
        this.is99acres_Walkin = false;
        this.isWalkin = false;
        this.isChannelPartner = false;
        this.isHoardings = false;
        this.mailsend.sourceselectmodel = 'Reference';
      } else {
        this.isHomes247_Walkin = false;
        this.isMagicbricks_Walkin = false;
        this.isHousing_Walkin = false;
        this.is99acres_Walkin = false;
        this.isWalkin = false;
        this.isChannelPartner = false;
        this.isReference = false;
        this.isHoardings = false;
        this.mailsend.sourceselectmodel = '';
      }
    } else if (value == 'hoardings') {
      this.mailsend.cpname = '';
      this.ischannelPatner = false;
      this.placeholderValue == 'Please Enter Hoarding Reference Name'
        ? (this.ischannelPatnerName = false)
        : (this.ischannelPatnerName = true);
      this.placeholderValue = this.ischannelPatnerName
        ? 'Please Enter Hoarding Reference Name'
        : '';

      if (this.ischannelPatnerName) {
        this.isHoardings = true;
        this.isHomes247_Walkin = false;
        this.isMagicbricks_Walkin = false;
        this.isHousing_Walkin = false;
        this.is99acres_Walkin = false;
        this.isWalkin = false;
        this.isChannelPartner = false;
        this.isReference = false;
        this.mailsend.sourceselectmodel = 'Hoarding';
      } else {
        this.isHomes247_Walkin = false;
        this.isMagicbricks_Walkin = false;
        this.isHousing_Walkin = false;
        this.is99acres_Walkin = false;
        this.isWalkin = false;
        this.isChannelPartner = false;
        this.isReference = false;
        this.isHoardings = false;
        this.mailsend.sourceselectmodel = '';
      }
    }
  }

  // CP selection method
  slectCP(name) {
    this.mailsend.cpid = name;
    this.mailsend.cpname = this.mailsend.cpid.CP_NAME;
    this.mailsend.cpidpk = this.mailsend.cpid.CP_IDPK;
    this.mailsend.cpmail = this.mailsend.cpid.CP_MAIL;
    this.cplists1 = [];
  }

  // executive selection method for fresh visit
  selectexecutive(event) {
    const valueString = event.target.value;
    const [execid, execname] = valueString.split(',');
    this.mailsend.execselectmodel = execname;
    this.mailsend.execselectmodelid = execid;
    this.mailsend.execselectmodelidrsv = this.mailsend.execselectmodelid;
    this.mailsend.execselectmodelrsv = this.mailsend.execselectmodel;
  }

  // executive selection method for Re-visit
  selectexecutivesrsv(event) {
    const valueString = event.target.value;
    const [execid, execname] = valueString.split(',');
    this.mailsend.execselectmodelrsv = execname;
    this.mailsend.execselectmodelidrsv = execid;
  }

  //BHK size selection
  sizeselection(value) {
    if (value == '3BHK') {
      this.isSelect3BHK = !this.isSelect3BHK;
      this.isSelect2BHK = false;
      this.isSelect1BHK = false;
      this.isSelect4BHK = false;
    } else if (value === '2BHK') {
      this.isSelect2BHK = !this.isSelect2BHK;
      this.isSelect3BHK = false;
      this.isSelect1BHK = false;
      this.isSelect4BHK = false;
    } else if (value === '4BHK') {
      this.isSelect4BHK = !this.isSelect4BHK;
      this.isSelect2BHK = false;
      this.isSelect3BHK = false;
      this.isSelect1BHK = false;
    } else {
      this.isSelect2BHK = false;
      this.isSelect3BHK = false;
      this.isSelect1BHK = !this.isSelect1BHK;
      this.isSelect4BHK = false;
    }

    if (
      this.isSelect3BHK ||
      this.isSelect2BHK ||
      this.isSelect1BHK ||
      this.isSelect4BHK
    ) {
      let numArr = value.match(/[\d\.]+/g);
      numArr = numArr.filter((n) => n != '.');
      this.mailsend.bhksize = numArr;
    } else {
      this.mailsend.bhksize = '';
    }
  }
  islessthan2_5CrBudget = false;
  is2_5CrBudget = false;
  is3CrBudget = false;
  is3_5To4CrBudget = false;
  is75L_1Cr = false;

  //budget selection method
  budgetselection(value) {
    if (value == '1Cr - 1.2Cr') {
      this.is80L_1Cr = false;
      this.is1CrBudget = !this.is1CrBudget;
      this.isAbove1_2CrBudget = false;
      this.is3_5To4CrBudget = false;
      this.is3CrBudget = false;
      this.is2_5CrBudget = false;
      this.islessthan2_5CrBudget = false;
    } else if (value == 'Sitara1.2Cr - Above') {
      this.is80L_1Cr = false;
      this.is1CrBudget = false;
      this.isAbove1_2CrBudget = !this.isAbove1_2CrBudget;
      this.is3_5To4CrBudget = false;
      this.is3CrBudget = false;
      this.is2_5CrBudget = false;
      this.islessthan2_5CrBudget = false;
    } else if (value == '50L-60L') {
      this.is80L_1Cr = false;
      this.is50L_60L = !this.is50L_60L;
      this.is70L_80L = false;
      this.is80L_Above = false;
      this.is3_5To4CrBudget = false;
      this.is3CrBudget = false;
      this.is2_5CrBudget = false;
      this.islessthan2_5CrBudget = false;
    } else if (value == '70L-80L') {
      this.is80L_1Cr = false;
      this.is50L_60L = false;
      this.is70L_80L = !this.is70L_80L;
      this.is80L_Above = false;
      this.is3_5To4CrBudget = false;
      this.is3CrBudget = false;
      this.is2_5CrBudget = false;
      this.islessthan2_5CrBudget = false;
    } else if (value == '80L-Above') {
      this.is80L_1Cr = false;
      this.is50L_60L = false;
      this.is70L_80L = false;
      this.is80L_Above = !this.is80L_Above;
      this.is3_5To4CrBudget = false;
      this.is3CrBudget = false;
      this.is2_5CrBudget = false;
      this.islessthan2_5CrBudget = false;
    } else if (value == '80L-90L') {
      this.is80L_1Cr = false;
      this.is80L_90L = !this.is80L_90L;
      this.is90L_1_2Cr = false;
      this.is1_2Cr_Above = false;
      this.is3_5To4CrBudget = false;
      this.is3CrBudget = false;
      this.is2_5CrBudget = false;
      this.islessthan2_5CrBudget = false;
    } else if (value == '90L-1.2Cr') {
      this.is80L_1Cr = false;
      this.is80L_90L = false;
      this.is90L_1_2Cr = !this.is90L_1_2Cr;
      this.is1_2Cr_Above = false;
      this.is3_5To4CrBudget = false;
      this.is3CrBudget = false;
      this.is2_5CrBudget = false;
      this.islessthan2_5CrBudget = false;
    } else if (value == '1.2Cr - Above') {
      this.is80L_1Cr = false;
      this.is80L_90L = false;
      this.is90L_1_2Cr = false;
      this.is1_2Cr_Above = !this.is1_2Cr_Above;
      this.is3_5To4CrBudget = false;
      this.is3CrBudget = false;
      this.is2_5CrBudget = false;
      this.islessthan2_5CrBudget = false;
    } else if (value == '80L-1Cr') {
      this.is80L_1Cr = !this.is80L_1Cr;
      this.is80L_90L = false;
      this.is90L_1_2Cr = false;
      this.is1_2Cr_Above = false;
      this.is3_5To4CrBudget = false;
      this.is3CrBudget = false;
      this.is2_5CrBudget = false;
      this.islessthan2_5CrBudget = false;
    } else if (value == '2.5Cr - 3Cr') {
      this.is2_5CrBudget = !this.is2_5CrBudget;
      this.is80L_1Cr = false;
      this.is80L_90L = false;
      this.is90L_1_2Cr = false;
      this.is1_2Cr_Above = false;
      this.is3_5To4CrBudget = false;
      this.is3CrBudget = false;
      this.islessthan2_5CrBudget = false;
    } else if (value == '3Cr - 3.5Cr') {
      this.is3CrBudget = !this.is3CrBudget;
      this.is80L_1Cr = false;
      this.is80L_90L = false;
      this.is90L_1_2Cr = false;
      this.is1_2Cr_Above = false;
      this.is2_5CrBudget = false;
      this.is3_5To4CrBudget = false;
      this.islessthan2_5CrBudget = false;
    } else if (value == '3.5Cr - 4Cr') {
      this.is3_5To4CrBudget = !this.is3_5To4CrBudget;
      this.is80L_1Cr = false;
      this.is80L_90L = false;
      this.is90L_1_2Cr = false;
      this.is1_2Cr_Above = false;
      this.is2_5CrBudget = false;
      this.is3CrBudget = false;
      this.islessthan2_5CrBudget = false;
    } else if (value == 'BELOW - 2.5Cr') {
      this.islessthan2_5CrBudget = !this.islessthan2_5CrBudget;
      this.is3_5To4CrBudget = false;
      this.is80L_1Cr = false;
      this.is80L_90L = false;
      this.is90L_1_2Cr = false;
      this.is1_2Cr_Above = false;
      this.is2_5CrBudget = false;
      this.is3CrBudget = false;
    } else if (value == '4CR - Above') {
      this.is4Cr = true;
    } else if (value == '75L_1Cr') {
      this.is75L_1Cr = !this.is75L_1Cr;
    }
    if (
      this.is1CrBudget ||
      this.isAbove1_2CrBudget ||
      this.is80L_Above ||
      this.is70L_80L ||
      this.is50L_60L ||
      this.is80L_90L ||
      this.is90L_1_2Cr ||
      this.is1_2Cr_Above ||
      this.is80L_1Cr ||
      this.is2_5CrBudget ||
      this.is3CrBudget ||
      this.is3_5To4CrBudget ||
      this.islessthan2_5CrBudget ||
      this.is4Cr ||
      this.is75L_1Cr
    ) {
      this.mailsend.budget = value;
    } else {
      this.mailsend.budget = '';
    }
  }

  //Source selection method
  selectsource(value) {
    this.ischannelPatner = false;
    this.ischannelPatnerName = false;
    if (value == 'Homes247-Walkin') {
      this.isHomes247_Walkin = !this.isHomes247_Walkin;
      this.isMagicbricks_Walkin = false;
      this.isHousing_Walkin = false;
      this.is99acres_Walkin = false;
      this.isWalkin = false;
      this.isChannelPartner = false;
      this.isReference = false;
      this.isHoardings = false;
      if (this.isHomes247_Walkin) {
        this.mailsend.sourceselectmodel = value;
      } else {
        this.mailsend.sourceselectmodel = '';
      }
    } else if (value == 'Magicbricks-Walkin') {
      this.isHomes247_Walkin = false;
      this.isMagicbricks_Walkin = !this.isMagicbricks_Walkin;
      this.isHousing_Walkin = false;
      this.is99acres_Walkin = false;
      this.isWalkin = false;
      this.isChannelPartner = false;
      this.isReference = false;
      this.isHoardings = false;
      if (this.isMagicbricks_Walkin) {
        this.mailsend.sourceselectmodel = value;
      } else {
        this.mailsend.sourceselectmodel = '';
      }
    } else if (value == 'Housing-Walkin') {
      this.isHomes247_Walkin = false;
      this.isMagicbricks_Walkin = false;
      this.isHousing_Walkin = !this.isHousing_Walkin;
      this.is99acres_Walkin = false;
      this.isWalkin = false;
      this.isChannelPartner = false;
      this.isReference = false;
      this.isHoardings = false;
      if (this.isHousing_Walkin) {
        this.mailsend.sourceselectmodel = value;
      } else {
        this.mailsend.sourceselectmodel = '';
      }
    } else if (value == '99acres-Walkin') {
      this.isHomes247_Walkin = false;
      this.isMagicbricks_Walkin = false;
      this.isHousing_Walkin = false;
      this.is99acres_Walkin = !this.is99acres_Walkin;
      this.isWalkin = false;
      this.isChannelPartner = false;
      this.isReference = false;
      this.isHoardings = false;
      if (this.is99acres_Walkin) {
        this.mailsend.sourceselectmodel = value;
      } else {
        this.mailsend.sourceselectmodel = '';
      }
    } else if (value == 'Walkin') {
      this.isHomes247_Walkin = false;
      this.isMagicbricks_Walkin = false;
      this.isHousing_Walkin = false;
      this.is99acres_Walkin = false;
      this.isWalkin = !this.isWalkin;
      this.isChannelPartner = false;
      this.isReference = false;
      this.isHoardings = false;
      if (this.isWalkin) {
        this.mailsend.sourceselectmodel = value;
      } else {
        this.mailsend.sourceselectmodel = '';
      }
    }
  }

  showSpinner = false;

  adminsubmit() {
    this.showSpinner = true;
    let errorMessage = '';
    const pattern = /^\d+$/;
    if (this.mailsend.clientname === '') {
      errorMessage = 'Please Enter the Name.';
    } else if (this.mailsend.contact == '') {
      errorMessage = 'Please Enter Phone Number';
    } else if (
      !pattern.test(this.mailsend.contact) ||
      this.mailsend.contact.length !== 10
    ) {
      errorMessage = 'Please enter valid 10 digit contact number';
    } else if (this.mailsend.bhksize == '') {
      errorMessage = 'Please select the Size';
    } else if (this.mailsend.budget == '') {
      errorMessage = 'Please select the Budget';
    } else if (this.mailsend.budget == '') {
      errorMessage = 'Please select the Budget';
    } else if (
      !this.mailsend.execselectmodelid &&
      this.localStorage.getItem('Role') == '1'
    ) {
      errorMessage = 'Please Select the Executive';
    } else if (this.mailsend.sourceselectmodel == '') {
      errorMessage = 'Please Select the Source';
    } else if (
      this.ischannelPatner ||
      this.mailsend.sourceselectmodel == '' ||
      this.ischannelPatnerName
    ) {
      if (this.ischannelPatner) {
        const cpidKeys = Object.keys(this.mailsend.cpid);
        const cpidValues = Object.values(this.mailsend.cpid);
        if (cpidKeys.length === 0 || cpidValues.some((value) => value === '')) {
          errorMessage = 'Please select CP';
        }
      } else if (this.ischannelPatnerName && this.mailsend.cpname == '') {
        errorMessage = 'Please Enter Name';
      } else if (this.mailsend.sourceselectmodel == '') {
        errorMessage = 'Please select the Source';
      }
    } else {
    }
    if (errorMessage !== '') {
      this.showSpinner = false;
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'OK!',
      });
    } else {
      if (this.isNumberExist) {
        this.verifyWithoutOTP();
      } else {
        this.modal.present();
        var submitting = {
          number: this.mailsend.contact,
        };
        var fiveMinutes = 30 * 1;
        this.timer(fiveMinutes);
        this.sharedService.otpsend(submitting).subscribe((response) => {});
      }
    }
  }

  verifyWithoutOTP() {
    this.showSpinner = true;
    this.display = '';
    this.count = 0;
    this.mailsend.otpbased = '2';
    clearInterval(this.timerInterval);
    this.modal.dismiss();
    // this.presentLoading();
    if (this.isRevisitvisiblesection) {
      (this.roleType == '1' || this.roleid == '1') &&
      this.existingExecutivesList.length >= 1
        ? this.existingExecutive.present()
        : this.formsubmitionrsv();
    } else if (this.isFreshvisitvisiblesection) {
      (this.roleType == '1' || this.roleid == '1') &&
      this.existingExecutivesList.length >= 1
        ? this.existingExecutive.present()
        : this.formsubmition();
    }
  }

  adminsubmitrsv() {
    // var submitting = {
    //   number:this.mailsend.contact
    // };
    // this.sharedService.otpsend(submitting).subscribe((response)=>{
    // })
    this.showSpinner = true;
    let errorMessage = '';
    const pattern = /^\d+$/;
    if (this.mailsend.clientname === '') {
      errorMessage = 'Please Enter the Name.';
    } else if (this.mailsend.contact == '') {
      errorMessage = 'Please Enter Phone Number';
    } else if (
      !pattern.test(this.mailsend.contact) ||
      this.mailsend.contact.length !== 10
    ) {
      errorMessage = 'Please enter valid 10 digit contact number';
    } else if (
      this.mailsend.execselectmodelid == '' &&
      this.localStorage.getItem('Role') == '1'
    ) {
      errorMessage = 'Please Select the Executive';
    } else {
    }

    if (errorMessage !== '') {
      this.showSpinner = false;
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        heightAuto: false,
        confirmButtonText: 'OK!',
      });
    } else {
      this.verifyWithoutOTP();
      // this.modal.present();
      // var submitting = {
      // number:this.mailsend.contact
      // };
      // var fiveMinutes = 30 * 1;
      // this.timer(fiveMinutes);
      // this.mandateService.otpsend(submitting).subscribe((response)=>{
      //   this.showSpinner=false;
      // })
    }
  }

  count = 0;
  timer(minute) {
    this.count++;
    let seconds: number = minute;
    let textSec: any = '0';
    let statSec: number = minute;
    const prefix = minute < 10 ? '0' : '';
    this.timerInterval = setInterval(() => {
      seconds--;
      if (statSec != 0) statSec--;
      else statSec = 59;
      if (statSec < 10) {
        textSec = '0' + statSec;
      } else textSec = statSec;

      this.display = `${prefix}${Math.floor(seconds / 60)}:${textSec}`;
      if (seconds == 0) {
        this.display = '';
        clearInterval(this.timerInterval);
        if (this.count < 2) {
          this.otpResend = true;
          this.isEditNumber = false;
          this.otpresendrsv();
        } else {
          this.showSpinner = true;
          this.modal.dismiss();
          this.isFreshvisitvisiblesection
            ? (this.roleType == '1' || this.roleid == '1') &&
              this.existingExecutivesList.length >= 1
              ? this.existingExecutive.present()
              : this.formsubmition()
            : this.isRevisitvisiblesection
            ? (this.roleType == '1' || this.roleid == '1') &&
              this.existingExecutivesList.length >= 1
              ? this.existingExecutive.present()
              : this.formsubmitionrsv()
            : '';
        }
      }
    }, 1000);
  }

  otpresendrsv() {
    var fiveMinutes2 = 15 * 1;
    this.timer(fiveMinutes2);
    this.otpResend = true;
    var submitting = {
      number: this.mailsend.contact,
    };
    this.sharedService.otpsend(submitting).subscribe((response) => {});
  }

  @ViewChild('existingExecutive') existingExecutive;
  formsubmition() {
    this.showSpinner = true;
    if (this.propertyId == '28773') {
      this.mandateService.setHoverState('ranav_group');
    } else {
      this.mandateService.setHoverState('');
    }

    let exeNames;
    let execIds;
    if (this.localStorage.getItem('Role') !== '1') {
      this.mailsend.execselectmodel = localStorage.getItem('Name') || '';
      exeNames = this.mailsend.execselectmodel;
      this.mailsend.execselectmodelid = localStorage.getItem('UserId') || '';
      execIds = this.mailsend.execselectmodelid;
    } else {
      execIds = [this.selectedExec?.Exec_IDFK, this.mailsend.execselectmodelid]
        .filter(Boolean)
        .join(',');
      exeNames = [this.selectedExec?.execname, this.mailsend.execselectmodel]
        .filter(Boolean)
        .join(',');
    }
    if (!this.mailsend.cpidpk && !this.mailsend.cpmail) {
      this.mailsend.cpidpk = 'XXXXX';
      this.mailsend.cpmail = 'XXXXX';
    }

    var submitting = {
      client: this.mailsend.clientname,
      clientnum: this.mailsend.contact,
      clientmail: this.mailsend.clientmail,
      leadid: '',
      bhksize: this.mailsend.bhksize,
      budgetrange: this.mailsend.budget,
      execname: exeNames,
      execid: execIds,
      priority: this.mailsend.priority,
      source: this.mailsend.sourceselectmodel,
      cpname: this.mailsend.cpname,
      cpid: this.mailsend.cpidpk,
      cpmail: this.mailsend.cpmail,
      propertyId: this.propertyId,
      remarks: this.mailsend.visitremarks,
      otpbased: this.mailsend.otpbased,
    };
    // this.presentLoading();
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
      this.mandateService
        .adminmailsend(submitting, '/mailsendbuilderbased')
        .subscribe({
          next: (response) => {
            var status = response.status;
            var data = response.success;
            if (status == '0') {
              this.showSpinner = false;
              this.dismissLoading();
              Swal.fire({
                title: 'Form Submitted Successfully!',
                text: 'Congratulations!! Its a Non Existing Client. Thank You for Visit',
                icon: 'success',
                showConfirmButton: false,
                heightAuto: false,
                timer: 3000,
              }).then(() => {
                this.showSpinner = true;
                location.reload();
              });
            } else if (status == '1') {
              this.showSpinner = false;
              this.dismissLoading();
              Swal.fire({
                title: 'Form Submitted Successfully!',
                text: 'Oh Oh!! Its an Existing Client with Us. Thank You for Visit',
                icon: 'warning',
                showConfirmButton: false,
                heightAuto: false,
                timer: 3000,
              }).then(() => {
                this.showSpinner = true;
                location.reload();
              });
            } else if (status == '2') {
              this.showSpinner = false;
              this.dismissLoading();
              Swal.fire({
                title: 'Already visit Updated for the Day',
                icon: 'info',
                showConfirmButton: false,
                heightAuto: false,
                timer: 3000,
              }).then(() => {
                this.showSpinner = true;
                location.reload();
              });
            } else {
              this.showSpinner = false;
              this.dismissLoading();
              Swal.fire({
                title: 'Oops Something Error!',
                icon: 'error',
                heightAuto: false,
              }).then(() => {
                this.showSpinner = true;
                location.reload();
              });
            }
            this.dismissLoading();
          },
          error: (error) => {
            Swal.fire({
              title: 'Oops Something Error!',
              icon: 'error',
              heightAuto: false,
              confirmButtonText: 'OK',
            }).then((result) => {
              this.showSpinner = true;
              location.reload();
              // if(error['status'] == '500'){
              //   Swal.fire({
              //     title: "Already visit Updated for the Day",
              //     icon: "info",
              //     heightAuto: false,
              //   }).then((result)=> {
              //     location.reload();
              //   });
              // }
            });
          },
        });
    }
  }

  formsubmitionrsv() {
    if (this.propertyId == '28773') {
      this.mandateService.setHoverState('ranav_group');
    } else {
      this.mandateService.setHoverState('');
    }

    this.showSpinner = true;
    // if (this.localStorage.getItem('Role') !== '1') {
    //   this.mailsend.execselectmodelrsv = localStorage.getItem('Name');
    //   this.mailsend.execselectmodelidrsv = localStorage.getItem('UserId');
    // }

    let exeNames;
    let execIds;
    if (this.localStorage.getItem('Role') !== '1') {
      this.mailsend.execselectmodelrsv = localStorage.getItem('Name');
      this.mailsend.execselectmodelidrsv = localStorage.getItem('UserId');
      exeNames = this.mailsend.execselectmodelrsv;
      execIds = this.mailsend.execselectmodelidrsv;
    } else {
      // execIds = [
      //   this.selectedExec.Exec_IDFK,
      //   this.mailsend.execselectmodelidrsv,
      // ].join(',');
      // exeNames = [
      //   this.selectedExec.execname,
      //   this.mailsend.execselectmodelrsv,
      // ].join(',');

      execIds = [this.selectedExec?.Exec_IDFK, this.mailsend.execselectmodelid]
        .filter(Boolean)
        .join(',');
      exeNames = [this.selectedExec?.execname, this.mailsend.execselectmodel]
        .filter(Boolean)
        .join(',');
    }
    let submitting;
    if (
      this.leadResponse[0].leadmerged == 1 &&
      this.leadResponse[0].mergedlead
    ) {
      submitting = {
        client: this.mailsend.clientname,
        clientnum: this.mailsend.contact,
        leadid: this.mailsend.leadid,
        clientmail: this.mailsend.clientmail,
        bhksize: this.mailsend.bhksize,
        budgetrange: this.mailsend.budget,
        execname: exeNames,
        execid: execIds,
        priority: this.mailsend.priority,
        source: this.mailsend.sourceselectmodel,
        cpname: this.mailsend.cpname,
        cpid: this.mailsend.cpidpk,
        cpmail: this.mailsend.cpmail,
        propertyId: this.propertyId,
        remarks: this.mailsend.visitremarksrsv,
        otpbased: this.mailsend.otpbased,
        mergedMail: this.leadResponse[0].mergedlead[0].mergedMail,
        mergedName: this.leadResponse[0].mergedlead[0].mergedName,
        mergedNumber: this.leadResponse[0].mergedlead[0].mergedNumber,
      };
    } else {
      submitting = {
        client: this.mailsend.clientname,
        clientnum: this.mailsend.contact,
        leadid: this.mailsend.leadid,
        clientmail: this.mailsend.clientmail,
        bhksize: this.mailsend.bhksize,
        budgetrange: this.mailsend.budget,
        execname: exeNames,
        priority: this.mailsend.priority,
        execid: execIds,
        source: this.mailsend.sourceselectmodel,
        cpname: this.mailsend.cpname,
        cpid: this.mailsend.cpidpk,
        cpmail: this.mailsend.cpmail,
        propertyId: this.propertyId,
        remarks: this.mailsend.visitremarksrsv,
        otpbased: this.mailsend.otpbased,
      };
    }

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
      //this.presentLoading();
      this.mandateService
        .adminmailsend(submitting, '/rsvvisittrigger')
        .subscribe({
          next: (response) => {
            var status = response.status;
            if (status == '0') {
              this.showSpinner = false;
              this.dismissLoading();
              Swal.fire({
                title: 'Form Not Submitted!',
                text: 'No Data Found to Update',
                icon: 'error',
                heightAuto: false,
                showConfirmButton: false,
                timer: 3000,
              }).then(() => {
                this.showSpinner = true;
                location.reload();
              });
            } else if (status == '1') {
              this.showSpinner = false;
              this.dismissLoading();
              Swal.fire({
                title: 'Form Submitted Successfully!',
                text: 'RSV Updated Successfully',
                icon: 'success',
                heightAuto: false,
                showConfirmButton: false,
                timer: 3000,
              }).then(() => {
                this.showSpinner = true;
                location.reload();
              });
            } else if (status == '2') {
              Swal.fire({
                title: 'Already visit Updated for the Day',
                icon: 'info',
                heightAuto: false,
              }).then((result) => {
                location.reload();
              });
            } else {
              this.showSpinner = false;
              this.dismissLoading();
              Swal.fire({
                title: 'Please Reconfirm the Final Submission',
                icon: 'info',
                heightAuto: false,
                confirmButtonText: 'Submit Now',
              }).then(() => {
                this.showSpinner = true;
                // location.reload();
                (this.roleType == '1' || this.roleid == '1') &&
                this.existingExecutivesList.length >= 1
                  ? this.existingExecutive.present()
                  : this.formsubmitionrsv();
              });
            }
          },
          error: () => {
            Swal.fire({
              title: 'Please Reconfirm the Final Submission',
              icon: 'info',
              heightAuto: false,
              confirmButtonText: 'Submit Now',
            }).then((result) => {
              this.showSpinner = true;
              (this.roleType == '1' || this.roleid == '1') &&
              this.existingExecutivesList.length >= 1
                ? this.existingExecutive.present()
                : this.formsubmitionrsv();
            });
          },
        });
    }
  }

  // to validate OTP
  otpValidation(otp) {
    if (otp.length == 4) {
      this.mailsend.otpmodel = otp;
      var submitting = {
        number: this.mailsend.contact,
        otp: this.mailsend.otpmodel,
      };

      this.sharedService
        .otpvalidate(this.mailsend.otpmodel, this.mailsend.contact)
        .subscribe((response) => {
          if (response['status'] == 'True') {
            this.display = '';
            this.count = 0;
            clearInterval(this.timerInterval);
            this.modal.dismiss();
            // this.presentLoading();
            this.mailsend.otpbased = '1';
            this.isFreshvisitvisiblesection
              ? (this.roleType == '1' || this.roleid == '1') &&
                this.existingExecutivesList.length >= 1
                ? this.existingExecutive.present()
                : this.formsubmition()
              : this.isRevisitvisiblesection
              ? (this.roleType == '1' || this.roleid == '1') &&
                this.existingExecutivesList.length >= 1
                ? this.existingExecutive.present()
                : this.formsubmitionrsv()
              : '';
          } else {
            this.showSpinner = false;
            Swal.fire({
              title: 'Oops Something Error!',
              text: 'Its Not a valid OTP / OTP Expired!',
              icon: 'error',
              heightAuto: false,
              showConfirmButton: false,
            });
            this.dismissLoading();
            // this.display='';
            // this.count=0
            // clearInterval(this.timerInterval);
            this.modal.dismiss();
          }
        });
    }
  }

  isSitaraLogo = false;
  isSamskruthiLogo = false;
  isEnchantingLogo = false;
  isRanavGrouplogo = false;
  isSwaraGroupLogo = false;
  isRevivaLogo = false;

  // navigation to respective property form
  onPropertylist(value) {
    this.isFeatchData = true;
    this.isPropertyList = false;
    if (value == 'sitara') {
      this.propertyId = 16793;
      this.isSitaraLogo = true;
      this.isSamskruthiLogo = false;
      this.isEnchantingLogo = false;
      this.isMSRlogo = false;
      this.isRanavGrouplogo = false;
      this.isSwaraGroupLogo = false;
      this.isRevivaLogo = false;
      this.mandateService.setHoverState('');
    } else if (value == 'samskruthi') {
      this.propertyId = 1830;
      this.isSitaraLogo = false;
      this.isSamskruthiLogo = true;
      this.isEnchantingLogo = false;
      this.isMSRlogo = false;
      this.isRanavGrouplogo = false;
      this.isSwaraGroupLogo = false;
      this.isRevivaLogo = false;
      this.mandateService.setHoverState('');
    } else if (value == 'enchanting') {
      this.propertyId = 34779;
      this.isSitaraLogo = false;
      this.isSamskruthiLogo = false;
      this.isEnchantingLogo = true;
      this.isMSRlogo = false;
      this.isRanavGrouplogo = false;
      this.isSwaraGroupLogo = false;
      this.isRevivaLogo = false;
      this.mandateService.setHoverState('');
    } else if (value == 'msr') {
      this.propertyId = 58878;
      this.isSitaraLogo = false;
      this.isSamskruthiLogo = false;
      this.isEnchantingLogo = false;
      this.isMSRlogo = true;
      this.isRanavGrouplogo = false;
      this.isSwaraGroupLogo = false;
      this.isRevivaLogo = false;
      this.mandateService.setHoverState('');
    } else if (value == 'ranav') {
      this.propertyId = 28773;
      this.isSitaraLogo = false;
      this.isSamskruthiLogo = false;
      this.isEnchantingLogo = false;
      this.isMSRlogo = false;
      this.isRanavGrouplogo = true;
      this.isSwaraGroupLogo = false;
      this.isRevivaLogo = false;
      this.mandateService.setHoverState('ranav_group');
    } else if (value == 'swara') {
      this.propertyId = 82668;
      this.isSwaraGroupLogo = true;
      this.isSitaraLogo = false;
      this.isSamskruthiLogo = false;
      this.isEnchantingLogo = false;
      this.isMSRlogo = false;
      this.isRanavGrouplogo = false;
      this.isRevivaLogo = false;
    } else if (value == 'reviva') {
      this.propertyId = 80459;
      this.isSwaraGroupLogo = false;
      this.isSitaraLogo = false;
      this.isSamskruthiLogo = false;
      this.isEnchantingLogo = false;
      this.isMSRlogo = false;
      this.isRanavGrouplogo = false;
      this.isRevivaLogo = true;
    }

    const team = this.localStorage.getItem('RoleType') === '1' ? '2' : '';
    this.mandateService
      .fetchmandateexecutives(this.propertyId, '', '', '')
      .subscribe((executives) => {
        this.mandateexecutives = executives.mandateexecutives;
      });

    this.mailsend.contact = '';
    this.mailsend.clientname = '';
    this.isSelect2BHK = false;
    this.isSelect3BHK = false;
    this.is1CrBudget = false;
    this.isAbove1_2CrBudget = false;
    this.isHomes247_Walkin = false;
    this.isMagicbricks_Walkin = false;
    this.isHousing_Walkin = false;
    this.is99acres_Walkin = false;
    this.isWalkin = false;
    this.isChannelPartner = false;
    this.isReference = false;
    this.isHoardings = false;
    this.is50L_60L = false;
    this.is70L_80L = false;
    this.is80L_Above = false;
    this.is80L_90L = false;
    this.is90L_1_2Cr = false;
    this.is1_2Cr_Above = false;
  }

  backNavigation() {
    if (
      (!this.isPropertyList && this.isFreshvisitvisiblesection) ||
      this.isRevisitvisiblesection
    ) {
      this.isPropertyList = false;
      this.isFeatchData = true;
      this.isFreshvisitvisiblesection = false;
      this.isRevisitvisiblesection = false;
      this.router.navigate(['/visit-updates'], {
        queryParams: {},
        queryParamsHandling: 'merge',
      });
    } else if (this.isFeatchData) {
      this.isPropertyList = true;
      this.isFeatchData = false;
      this.isFreshvisitvisiblesection = false;
      this.isRevisitvisiblesection = false;
      this.router.navigate(['/visit-updates'], {
        queryParams: {},
        queryParamsHandling: 'merge',
      });
    } else {
      // this.router.navigate(['/menu'])
      this._location.back();
    }
  }

  ngOnDestroy() {
    Swal.close(); // Close the SweetAlert2 popup when the component is destroyed
  }

  // editnumber
  onEditNumber() {
    this.showSpinner = false;
    this.display = '';
    this.count = 0;
    clearInterval(this.timerInterval);
    this.modal.dismiss();
  }

  loading: HTMLIonLoadingElement;
  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: '',
    });
    await this.loading.present();
  }

  async dismissLoading() {
    if (this.loading) {
      await this.loading.dismiss();
    }
  }

  // Search CP name
  handleInput(event) {
    const query = event.target.value.toLowerCase();
    this.cplists1 = this.cplists.filter(
      (executive) =>
        executive.CP_NAME.toLowerCase().indexOf(query.toLowerCase()) > -1
    );
  }

  // validateContact(event: any): void {
  //   const input = event.target.value;
  //   // Allow only numeric values and trim to maxlength of 10
  //   const sanitizedInput = input.replace(/[^0-9]/g, '').slice(0, 10);
  //   event.target.value = sanitizedInput;
  //   this.mailsend.contact = sanitizedInput;

  //   // Check if the input is exactly 10 digits
  //   if (sanitizedInput.length === 10) {
  //     this.numbercheck();
  //   }
  // }
  validateContact(event: any): void {
    let inputValue = event.target.value;
    inputValue = inputValue.replace(/[^0-9]/g, '');

    // Check if the number starts with '91' (India country code)
    if (inputValue.startsWith('91') && inputValue.length > 10) {
      inputValue = inputValue.slice(2);
    }

    // Ensure the number is exactly 10 digits
    if (inputValue.length > 10) {
      inputValue = inputValue.slice(0, 10);
    }

    this.mailsend.contact = inputValue;
    if (this.mailsend.contact != '' && inputValue.length == 10) {
      this.numbercheck();
    }
  }

  openEndMenu() {
    this.sharedService.isMenuOpen = true;
    this.menuCtrl.open('end');
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
        this.sharedService.isBottom = false;
      } else {
        this.sharedService.isBottom =
          scrollTop + clientHeight >= scrollHeight - 100;
      }
    });
  }

  existingExecutiveSelect(event) {
    const value = event.detail.value;
    this.selectedExec = this.selectedExec === value ? null : value;

    // if (this.localStorage.getItem('Role') !== '1') {
    //   this.mailsend.execselectmodel = localStorage.getItem('Name');
    //   this.mailsend.execselectmodelid = localStorage.getItem('UserId');
    // }
    // this.mailsend.execselectmodel.push();
  }

  onPriority(priority) {
    this.mailsend.priority = priority;
  }
}

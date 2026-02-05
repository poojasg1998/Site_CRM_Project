import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDate, Location } from '@angular/common';
import { SharedService } from '../shared.service';
import { MenuController, PopoverController } from '@ionic/angular';
import { AuthServiceService } from '../auth-service.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  isLeadsVisitsCalls = 'leads';
  depId;
  @Input() leadDetails: any;
  filteredParams = {
    htype: '',
  };
  roleid = '';
  isRanav;
  iscpId: boolean;
  headingData = '';
  execid = '';
  userid = '';
  execName = '';
  roleType = '';
  junkStatus;
  fromdate;
  todate;
  constructor(
    private activeRoute: ActivatedRoute,
    private location: Location,
    private sharedService: SharedService,
    private menuCtrl: MenuController,
    public router: Router,
    private popoverController: PopoverController,
    private authService: AuthServiceService
  ) {}

  ngOnInit() {
    this.activeRoute.queryParams.subscribe((params) => {
      this.fromdate = params['assignedfromdate'] || params['visitedfromdate'];
      this.todate = params['assignedtodate'] || params['visitedtodate'];
      this.junkStatus = params['status'];
      this.depId = localStorage.getItem('Department');
      this.execid = params['execid'];
      this.userid = localStorage.getItem('UserId');
      this.roleid = localStorage.getItem('Role');
      this.isRanav = localStorage.getItem('ranavPropId') == '28773';
      this.iscpId = localStorage.getItem('cpId') === '1';
      this.roleType = localStorage.getItem('RoleType');
      this.execName = params['execName'] || params['execname'] || '';
    });
  }
  onBackButton() {
    // this.location.back();
    if (
      this.router.url.includes('leadassign') &&
      this.router.url.includes('todaysvisits=1') &&
      !this.router.url.includes('status=scheduledtoday')
    ) {
      this.router.navigate([], {
        queryParams: {
          todaysvisits: '1',
          status: 'scheduledtoday',
          htype: 'mandate',
        },
        replaceUrl: true,
      });
    } else if (
      this.router.url.includes('leadassign') &&
      this.router.url.includes('todaysfollowups=1') &&
      !this.router.url.includes('status=todaysfollowups')
    ) {
      this.router.navigate([], {
        queryParams: {
          todaysfollowups: '1',
          status: 'todaysfollowups',
          htype: 'mandate',
        },
        replaceUrl: true,
      });
    } else if (
      this.router.url.includes('mandate-lead-stages') &&
      !this.router.url.includes('status=pending')
    ) {
      this.router.navigate([], {
        queryParams: {
          status: 'pending',
          type: 'Untouched',
          isDropDown: 'false',
          htype: 'mandate',
        },
        replaceUrl: true,
      });
    } else if (
      this.router.url.includes('mandate-visit-stages') &&
      !this.router.url.includes('type=USV')
    ) {
      this.router.navigate([], {
        queryParams: {
          htype: 'mandate',
          type: 'USV',
          stage: 'USV',
          stagestatus: '3',
          isDropDown: 'false',
          visittype: '3',
        },
        replaceUrl: true,
      });
    } else if (
      this.router.url.includes('mandate-myoverdues') &&
      !this.router.url.includes('stage=Fresh')
    ) {
      this.router.navigate([], {
        queryParams: {
          stage: 'Fresh',
          htype: 'mandate',
          status: 'overdues',
        },
        replaceUrl: true,
      });
    } else if (
      this.router.url.includes('mandate-plans') &&
      !this.router.url.includes('plan=2')
    ) {
      this.router.navigate([], {
        queryParams: {
          stage: 'USV',
          plan: '2',
          datefrom: this.getUpcomingWeekendDates().fromdate,
          dateto: this.getUpcomingWeekendDates().todate,
          htype: 'mandate',
        },
        replaceUrl: true,
      });
    } else if (
      this.router.url.includes('mymandatereports') &&
      !this.router.url.includes('status=generalfollowups')
    ) {
      this.router.navigate([], {
        queryParams: {
          fromDate: new Date().toLocaleDateString('en-CA'),
          toDate: new Date().toLocaleDateString('en-CA'),
          status: 'generalfollowups',
          selecteddaterange: 'today',
          htype: 'mandate',
        },
        replaceUrl: true,
      });
    } else if (
      this.router.url.includes('mandate-inactive-junk') &&
      !this.router.url.includes('status=inactive')
    ) {
      this.router.navigate([], {
        queryParams: {
          status: 'inactive',
          counter: '1',
          htype: 'mandate',
        },
        replaceUrl: true,
      });
    } else if (
      this.router.url.includes('mandate-feedback') &&
      !this.router.url.includes('status=pending')
    ) {
      this.router.navigate([], {
        queryParams: {
          status: 'pending',
          htype: 'mandate',
        },
        replaceUrl: true,
      });
    } else if (
      this.router.url.includes('whatsapp-visits') &&
      !this.router.url.includes('leads=1')
    ) {
      this.router.navigate([], {
        queryParams: {
          leads: '1',
          htype: 'mandate',
        },
        replaceUrl: true,
      });
    } else if (this.router.url.includes('home')) {
      this.router.navigate([], {
        queryParams: {
          execName: null,
          executid: null,
          propid: localStorage.getItem('Role') == '1' ? '1830' : null,
          roleId: null,
          htype: 'mandate',
        },
        replaceUrl: true,
        queryParamsHandling: 'merge',
      });
    } else {
      this.location.back();
    }
  }
  openEndMenu() {
    this.sharedService.isMenuOpen = true;
    this.menuCtrl.open('end');
  }

  //TO GET WEEK END DATES
  getUpcomingWeekendDates() {
    const today = new Date();
    const currentDayOfWeek = today.getDay();

    let nextSaturday = new Date(today);
    let nextSunday = new Date(today);

    // If today is Saturday or Sunday, use today's date for that day
    if (currentDayOfWeek === 6) {
      // If today is Saturday
      nextSaturday = today;
      const daysUntilSunday = 1;
      nextSunday.setDate(today.getDate() + daysUntilSunday);
    } else if (currentDayOfWeek === 0) {
      // If today is Sunday
      nextSunday = today;
      const daysUntilPreviousSaturday = -1;
      nextSaturday.setDate(today.getDate() + daysUntilPreviousSaturday);
    } else {
      // Calculate the days until the next Saturday and Sunday
      const daysUntilSaturday = 6 - currentDayOfWeek;
      const daysUntilSunday = 7 - currentDayOfWeek;

      nextSaturday.setDate(today.getDate() + daysUntilSaturday);
      nextSunday.setDate(today.getDate() + daysUntilSunday);
    }

    return {
      fromdate: nextSaturday.toLocaleDateString('en-CA'),
      todate: nextSunday.toLocaleDateString('en-CA'),
    };
  }

  onFilterSelection(value) {
    this.router.navigate([], {
      queryParams: {
        isLeadsVisitsCalls: value,
      },
      queryParamsHandling: 'merge',
    });
  }

  logOut() {
    this.sharedService
      .logOut(
        localStorage.getItem('session_id'),
        localStorage.getItem('UserId')
      )
      .subscribe(() => {});
    this.popoverController.dismiss();
    this.sharedService.loginMethodname = 'login';
    // localStorage.clear();
    Object.keys(localStorage).forEach((key) => {
      if (key !== 'Mail' && key !== 'Password' && key !== 'useBiometric') {
        localStorage.removeItem(key);
      }
    });
    this.authService.logout();
    this.router.navigate(['/']);
  }
  onJunkStatus(status) {
    this.router.navigate([], {
      queryParams: {
        status: status,
        stage:
          status == 'junkvisits' ? 'USV' : status == 'junkleads' ? 'Fresh' : '',
        stagestatus: status == 'junkvisits' ? '3' : '',
        activeCardKey:
          status == 'junkvisits'
            ? 'visits_card'
            : status == 'junkleads'
            ? 'leads_card'
            : '',
        visitedtodate: status == 'junkvisits' ? this.todate : null,
        visitedfromdate: status == 'junkvisits' ? this.fromdate : null,
        assignedfromdate: status == 'junkleads' ? this.fromdate : null,
        assignedtodate: status == 'junkleads' ? this.todate : null,
      },
      queryParamsHandling: 'merge',
    });
  }
}

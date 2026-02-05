import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Filesystem, Directory } from '@capacitor/filesystem';
@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  isLoggedIn = false;

  constructor(private router: Router) {
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  }

  private hoverSubject = new BehaviorSubject<string>('');
  hoverState$ = this.hoverSubject.asObservable();
  setHoverState(isHovered) {
    this.hoverSubject.next(isHovered);
  }

  private adminControllerState = new BehaviorSubject<string>('');
  adminControllerState$ = this.adminControllerState.asObservable();
  setadminControllerState(isHovered) {
    this.adminControllerState.next(isHovered);
  }

  login() {
    this.isLoggedIn = true;
    localStorage.setItem('isLoggedIn', 'true');
    this.setHoverState(localStorage.getItem('ranavPropId'));
    this.setadminControllerState(localStorage.getItem('contrllerName'));
    // if (localStorage.getItem('Role') == null) {
    //   this.router.navigate['/'];
    // } else if (localStorage.getItem('Role') != null) {
    //   if (localStorage.getItem('PropertyId') == '28773') {
    //     this.router.navigate(['home'], {
    //       queryParams: {
    //         htype: 'mandate',
    //         propid: '28773',
    //       },
    //     });
    //   } else {
    //     if (localStorage.getItem('Role') == '1') {
    //       if (localStorage.getItem('cpId') != '1') {
    //         this.router.navigate(['home'], {
    //           queryParams: {
    //             htype: 'mandate',
    //             propid: '16793',
    //           },
    //         });
    //       } else {
    //         this.router.navigate(['retail-dashboard'], {
    //           queryParams: {
    //             htype: 'retail',
    //           },
    //         });
    //       }
    //     } else if (
    //       localStorage.getItem('Role') == '50001' ||
    //       localStorage.getItem('Role') == '50002'
    //     ) {
    //       this.router.navigate(['home'], {
    //         queryParams: {
    //           htype: 'mandate',
    //         },
    //       });

    //       // const queryParams: any = {
    //       //  htype: 'mandate',
    //       // };

    //       // const userId = localStorage.getItem('UserId');
    //       // if (userId !== '1') {
    //       //   queryParams.executid = userId;
    //       // }

    //       // this.router.navigate(['/home'], {
    //       //   queryParams: queryParams
    //       // });
    //     } else if (
    //       localStorage.getItem('Role') == '50009' ||
    //       localStorage.getItem('Role') == '50010' ||
    //       localStorage.getItem('Role') == '50003' ||
    //       localStorage.getItem('Role') == '50004'
    //     ) {
    //       // this.router.navigate(['retail-dashboard'],{
    //       //   queryParams:{
    //       //     htype:'retail',
    //       //     executid: (localStorage.getItem('UserId') !== '1')? localStorage.getItem('UserId'):''
    //       //   }
    //       // })

    //       const queryParams: any = {
    //         htype: 'retail',
    //       };

    //       const userId = localStorage.getItem('UserId');
    //       if (userId !== '1') {
    //         queryParams.executid = userId;
    //       }

    //       this.router.navigate(['/retail-dashboard'], {
    //         queryParams: queryParams,
    //       });
    //     }
    //   }
    // }

    if (localStorage.getItem('Department') == '10005') {
      this.router.navigate(['source-dashboard'], {
        queryParams: {
          htype: 'mandate',
          fromDate: new Date().toLocaleDateString('en-CA'),
          toDate: new Date().toLocaleDateString('en-CA'),
          isDateFilter: 'today',
          status: 'Total',
          activeCardKey: 'total_card',
          leads: '1',
        },
      });
    } else if (localStorage.getItem('Department') == '10006') {
      this.router.navigate(['employeeAttendance'], {
        queryParams: {
          fromdate: new Date().toLocaleDateString('en-CA'),
          todate: new Date().toLocaleDateString('en-CA'),
          execid: localStorage.getItem('UserId'),
          isDateFilter: 'today',
        },
      });
    } else if (localStorage.getItem('Role') == null) {
      this.router.navigate['/'];
    } else {
      this.router.navigate(['home'], {
        queryParams: {
          htype: 'mandate',
          isDateFilter: 'today',
        },
      });
    }
  }

  async logout() {
    // this.sharedService.logOut(localStorage.getItem('session_id'),localStorage.getItem('UserId'))
    this.isLoggedIn = false;
    localStorage.removeItem('isLoggedIn');
    Object.keys(localStorage).forEach((key) => {
      if (key !== 'Mail' && key !== 'Password' && key !== 'useBiometric') {
        localStorage.removeItem(key);
      }
    });
    sessionStorage.clear();

    await Filesystem.rmdir({
      path: '',
      directory: Directory.Cache,
      recursive: true,
    });
    location.reload();
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }
}

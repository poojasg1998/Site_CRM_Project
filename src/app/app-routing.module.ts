import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { CanActivateGuard } from './realEstate/can-activate.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.loginModule),
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./realEstate/mandate/dashboard/dashboard.module').then(
        (m) => m.DashboardModule
      ),
    canActivate: [CanActivateGuard],
  },
  {
    path: 'search',
    loadChildren: () =>
      import('./realEstate/search/search.module').then((m) => m.SearchModule),
  },

  {
    path: 'leadassign',
    loadChildren: () =>
      import('./realEstate/mandate/leadassign/leadassign.module').then(
        (m) => m.LeadassignModule
      ),
  },
  {
    path: 'reminders',
    loadChildren: () =>
      import('./realEstate/reminders/reminders.module').then(
        (m) => m.RemindersModule
      ),
  },
  {
    path: 'visit-updates',
    loadChildren: () =>
      import('./realEstate/visit-updates/visit-updates.module').then(
        (m) => m.VisitUpdatesModule
      ),
  },

  {
    path: 'Enquiry',
    loadChildren: () =>
      import('./realEstate/enquiry/enquiry.module').then(
        (m) => m.EnquiryModule
      ),
  },
  {
    path: 'mandate-myoverdues',
    loadChildren: () =>
      import(
        './realEstate/mandate/mandate-overdues/mandate-overdues.module'
      ).then((m) => m.MandateOverduesModule),
  },

  {
    path: 'mymandatereports',
    loadChildren: () =>
      import(
        './realEstate/mandate/mandate-exec-activities/mandate-exec-activities.module'
      ).then((m) => m.MandateExecActivitiesModule),
  },

  {
    path: 'leads',
    loadChildren: () =>
      import('./realEstate/leads/leads.module').then((m) => m.LeadsModule),
  },

  {
    path: 'mandate-plans',
    loadChildren: () =>
      import('./realEstate/mandate/mandate-plans/mandate-plans.module').then(
        (m) => m.MandatePlanModule
      ),
  },

  {
    path: 'mandate-visit-stages',
    loadChildren: () =>
      import(
        './realEstate/mandate/mandate-visit-stages/mandate-visit-sages.module'
      ).then((m) => m.MaMandateVisitStagesModule),
  },
  {
    path: 'mandate-lead-stages',
    loadChildren: () =>
      import(
        './realEstate/mandate/mandate-lead-stages/mandate-lead-stages.module'
      ).then((m) => m.MandateLeadStagesModule),
  },
  {
    path: 'mandate-inactive-junk',
    loadChildren: () =>
      import(
        './realEstate/mandate/mandate-inactive-junk/mandate-inactive-junk.module'
      ).then((m) => m.MandateInactiveJunkModule),
  },
  {
    path: 'mandate-feedback',
    loadChildren: () =>
      import(
        './realEstate/mandate/mandate-feedback/mandate-feedback.module'
      ).then((m) => m.MandateFeedbackModule),
  },
  {
    path: 'mandate-pricing-list',
    loadChildren: () =>
      import(
        './realEstate/mandate/mandate-pricing-list/mandate-pricing-list.module'
      ).then((m) => m.MandatePricingListModule),
  },
  {
    path: 'addproperty',
    loadChildren: () =>
      import('./realEstate/addproperty/addproperty.component.module').then(
        (m) => m.AddpropertyModule
      ),
  },
  {
    path: 'hourly-report',
    loadChildren: () =>
      import('./realEstate/hourly-report/hourly-report.module').then(
        (m) => m.HourlyReportModule
      ),
  },
  {
    path: 'hourly-report-listing',
    loadChildren: () =>
      import(
        './realEstate/hourly-report-listing/hourly-report-listing.module'
      ).then((m) => m.HourlyReportListingModule),
  },
  {
    path: 'chats',
    loadChildren: () =>
      import('./realEstate/chat/chat.module').then((m) => m.ChatModule),
  },
  {
    path: 'whatsapp-visits',
    loadChildren: () =>
      import('./realEstate/whatsapp-visits/whatsapp-visits.module').then(
        (m) => m.WhatsappVisitsModule
      ),
  },
  {
    path: 'attendance',
    loadChildren: () =>
      import('./realEstate/attendance/attendance.module').then(
        (m) => m.AttendanceModule
      ),
  },
  // { path: 'mandate-lead-details',
  //   loadChildren: () => import('./mandate-lead-details/mandtae-lead-details.module').then(m => m.MandateLeadDetailsModule),
  // },
  {
    path: 'mandate-customers',
    loadChildren: () =>
      import(
        './realEstate/mandate/mandate-customer-details/mandate-customer-details.module'
      ).then((m) => m.MandateCustomerdetailsModule),
  },
  {
    path: 'clients-chats',
    loadChildren: () =>
      import('./realEstate/clients-chats/clients-chats.module').then(
        (m) => m.ClientsChatsModule
      ),
  },
  {
    path: 'all-and-live-call-details',
    loadChildren: () =>
      import(
        './realEstate/all-and-live-call-details/all-and-live-call-details.module'
      ).then((m) => m.AllAndLiveCallDetailsModule),
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  },
  {
    path: 'inventory-dashboard',
    loadChildren: () =>
      import(
        './realEstate/inventory-dashboard/inventory-dashboard.module'
      ).then((m) => m.InventoryDashboardModule),
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
  },
  {
    path: 'all-call-listing',
    loadChildren: () =>
      import('./realEstate/all-calls-listing/all-calls-listing.module').then(
        (m) => m.AllCallsListingModule
      ),
  },
  {
    path: 'source-dashboard',
    loadChildren: () =>
      import('./realEstate/source-dashboard/source-dashboard.module').then(
        (m) => m.SourceDashboardModule
      ),
  },
  {
    path: 'notifications',
    loadChildren: () =>
      import('./realEstate/notification/notification.module').then(
        (m) => m.NotificationModule
      ),
  },
  {
    path: 'employeeAttendance',
    loadChildren: () =>
      import(
        './realEstate/employee-attendance/employee-attendance.module'
      ).then((m) => m.EmployeeAttendanceModule),
  },
  {
    path: 'overdues-dashboard',
    loadChildren: () =>
      import('./realEstate/overdues-dashboard/overdues-dashboard.module').then(
        (m) => m.OverduesDashboardModule
      ),
  },
  {
    path: 'junk-dashboard',
    loadChildren: () =>
      import('./realEstate/junk-dashboard/junk-dashboard.module').then(
        (m) => m.JunkDashboardModule
      ),
  },
  {
    path: 'today-dashboard',
    loadChildren: () =>
      import('./realEstate/today-dashboard/today-dashboard.module').then(
        (m) => m.TodayDashboardModule
      ),
  },
  {
    path: 'switch-account',
    loadChildren: () =>
      import('./realEstate/switch-account/switch-account.module').then(
        (m) => m.SwitchAccountdModule
      ),
  },
  {
    path: 'stage-dashboard',
    loadChildren: () =>
      import('./realEstate/stage-dashboard/stage-dashboard.module').then(
        (m) => m.StageDashboardModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
